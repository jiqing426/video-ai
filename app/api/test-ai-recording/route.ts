import { NextResponse } from "next/server"
import { detectEnvironment } from "@/lib/environment-detector"
import { PlaywrightRecorder } from "@/lib/playwright-recorder"
import { generateActionsFromAI } from "@/lib/ai-action-generator"
import { put } from "@vercel/blob"
import { v4 as uuidv4 } from "uuid"
import { getTestVideoUrls, generateColorfulThumbnail } from "@/lib/video-generator"
import fs from "fs/promises"

interface TestAIRequest {
  url: string
  task: string
  mode: "url-only" | "url-prompt" | "code-aware"
  workflow?: string
  aspectRatio?: string
}

export async function POST(request: Request) {
  const startTime = Date.now()
  const MAX_EXECUTION_TIME = 25000 // 25秒限制

  const recorder: PlaywrightRecorder | null = null
  let tempDir: string | null = null

  try {
    const body: TestAIRequest = await request.json()
    console.log("🧪 Starting AI recording test:", body)

    // 验证输入
    if (!body.url || !body.task) {
      return NextResponse.json({ success: false, error: "缺少必要参数: url 和 task" }, { status: 400 })
    }

    // 验证URL格式
    try {
      new URL(body.url)
    } catch {
      return NextResponse.json({ success: false, error: "无效的URL格式" }, { status: 400 })
    }

    // 快速环境检测
    const capabilities = await detectEnvironment()
    console.log("🔍 Environment capabilities:", capabilities)

    // 创建临时目录
    tempDir = `/tmp/videos/test-${uuidv4()}`
    await fs.mkdir(tempDir, { recursive: true })

    if (capabilities.canRecord && !capabilities.isVercel) {
      // 真实AI录制测试
      console.log("🎬 Testing real AI recording...")
      const result = await performRealAITest(body, capabilities, tempDir, MAX_EXECUTION_TIME - (Date.now() - startTime))
      return NextResponse.json({ success: true, data: result })
    } else {
      // AI模拟测试
      console.log("🎭 Testing AI simulation...")
      const result = await performAISimulationTest(body)
      return NextResponse.json({ success: true, data: result })
    }
  } catch (error) {
    console.error("❌ AI test failed:", error)

    let errorMessage = "AI录制测试失败"
    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        errorMessage = "测试超时，请尝试更简单的网站"
      } else if (error.message.includes("net::ERR_NAME_NOT_RESOLVED")) {
        errorMessage = "无法访问指定网站，请检查URL"
      } else if (error.message.includes("Navigation failed")) {
        errorMessage = "页面导航失败，网站可能限制了自动化访问"
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  } finally {
    // 清理资源
    if (recorder) {
      try {
        await recorder.close()
      } catch (e) {
        console.error("Failed to close recorder:", e)
      }
    }

    if (tempDir) {
      fs.rm(tempDir, { recursive: true, force: true }).catch((e) => {
        console.error("Failed to cleanup temp directory:", e)
      })
    }
  }
}

async function performRealAITest(
  body: TestAIRequest,
  capabilities: any,
  tempDir: string,
  maxTime: number,
): Promise<any> {
  let recorder: PlaywrightRecorder | null = null
  const startTime = Date.now()

  try {
    console.log("🤖 Starting real AI recording test for:", body.url)

    // 初始化录制器
    const viewport = { width: 1280, height: 720 }
    recorder = new PlaywrightRecorder(capabilities)

    await recorder.initialize({
      url: body.url,
      viewport,
      outputDir: tempDir,
      timeout: Math.min(15000, maxTime * 0.4),
    })

    console.log("🌐 Navigating to target website...")
    await recorder.navigateToUrl(body.url)

    console.log("🔍 Analyzing page structure...")
    const pageAnalysis = await recorder.analyzePage()
    console.log("📊 Page analysis completed:", {
      title: pageAnalysis.title,
      buttons: pageAnalysis.elements?.buttons?.length || 0,
      inputs: pageAnalysis.elements?.inputs?.length || 0,
      links: pageAnalysis.elements?.links?.length || 0,
      forms: pageAnalysis.elements?.forms?.length || 0,
    })

    console.log("🤖 Generating AI actions...")
    const aiActions = await generateActionsFromAI(body.url, body.task, body.mode, pageAnalysis, body.workflow)

    console.log(
      "✅ AI generated",
      aiActions.length,
      "actions:",
      aiActions.map((a) => a.description),
    )

    console.log("🎭 Executing AI actions...")
    await recorder.executeActions(aiActions)

    // 获取录制的视频
    const rawVideoPath = await recorder.close()
    recorder = null // 标记为已关闭

    if (!rawVideoPath) {
      throw new Error("Failed to get recorded video")
    }

    // 上传视频
    const videoId = `ai-test-${uuidv4()}`
    const videoBuffer = await fs.readFile(rawVideoPath)

    const { url: videoUrl } = await put(`video/${videoId}.webm`, videoBuffer, {
      access: "public",
      contentType: "video/webm",
    })

    // 生成缩略图
    const thumbnailData = generateColorfulThumbnail(`AI Test: ${body.task}`)
    const { url: thumbnailUrl } = await put(`thumbnails/${videoId}.jpg`, thumbnailData, {
      access: "public",
      contentType: "image/jpeg",
    })

    return {
      videoUrl,
      thumbnailUrl,
      duration: "00:30",
      resolution: "1280x720",
      size: `${Math.round((videoBuffer.length / 1024 / 1024) * 10) / 10} MB`,
      format: "WebM",
      createdAt: new Date().toISOString(),
      steps: aiActions.map((action) => action.description),
      aiReasoning: aiActions.map((action) => action.reasoning),
      recordingType: "ai_real_recording",
      pageAnalysis: {
        title: pageAnalysis.title,
        elementsFound: {
          buttons: pageAnalysis.elements?.buttons?.length || 0,
          inputs: pageAnalysis.elements?.inputs?.length || 0,
          links: pageAnalysis.elements?.links?.length || 0,
          forms: pageAnalysis.elements?.forms?.length || 0,
        },
      },
      executionTime: Date.now() - startTime,
      testDetails: {
        aiActionsGenerated: aiActions.length,
        pageElementsDetected:
          (pageAnalysis.elements?.buttons?.length || 0) +
          (pageAnalysis.elements?.inputs?.length || 0) +
          (pageAnalysis.elements?.links?.length || 0),
        navigationSuccess: true,
        recordingSuccess: true,
      },
    }
  } catch (error) {
    console.log("Real AI test failed, falling back to simulation:", error)
    return performAISimulationTest(body)
  }
}

async function performAISimulationTest(body: TestAIRequest): Promise<any> {
  console.log("🎭 Performing AI simulation test...")

  try {
    // 模拟页面分析
    const mockPageAnalysis = {
      title: `${body.url} - AI Test Analysis`,
      url: body.url,
      elements: {
        buttons: generateMockButtons(body.task),
        inputs: generateMockInputs(body.task),
        links: generateMockLinks(body.url),
        forms: generateMockForms(body.task),
      },
    }

    console.log("🤖 Generating AI actions for simulation...")
    const aiActions = await generateActionsFromAI(body.url, body.task, body.mode, mockPageAnalysis, body.workflow)

    console.log("✅ AI simulation generated", aiActions.length, "actions")

    // 选择合适的测试视频
    const testVideoUrls = getTestVideoUrls()
    const selectedVideoUrl = selectRelevantTestVideo(body.task, testVideoUrls)

    // 生成缩略图
    const videoId = `ai-sim-test-${uuidv4()}`
    const thumbnailData = generateColorfulThumbnail(`AI Simulation: ${body.task}`)

    const { url: thumbnailUrl } = await put(`thumbnails/${videoId}.jpg`, thumbnailData, {
      access: "public",
      contentType: "image/jpeg",
    })

    return {
      videoUrl: selectedVideoUrl,
      thumbnailUrl,
      duration: "00:30",
      resolution: "1280x720",
      size: "2.1 MB",
      format: "MP4",
      createdAt: new Date().toISOString(),
      steps: aiActions.map((action) => action.description),
      aiReasoning: aiActions.map((action) => action.reasoning),
      recordingType: "ai_simulation",
      pageAnalysis: {
        title: mockPageAnalysis.title,
        elementsFound: {
          buttons: mockPageAnalysis.elements.buttons.length,
          inputs: mockPageAnalysis.elements.inputs.length,
          links: mockPageAnalysis.elements.links.length,
          forms: mockPageAnalysis.elements.forms.length,
        },
      },
      simulationNote: "这是基于AI分析的智能模拟。在支持Playwright的环境中将进行真实录制。",
      testDetails: {
        aiActionsGenerated: aiActions.length,
        pageElementsDetected:
          mockPageAnalysis.elements.buttons.length +
          mockPageAnalysis.elements.inputs.length +
          mockPageAnalysis.elements.links.length,
        simulationMode: true,
        aiAnalysisSuccess: true,
      },
    }
  } catch (error) {
    console.error("AI simulation test failed:", error)
    throw error
  }
}

// 辅助函数：根据任务生成模拟按钮
function generateMockButtons(task: string): any[] {
  const taskLower = task.toLowerCase()
  const buttons = []

  if (taskLower.includes("login") || taskLower.includes("登录")) {
    buttons.push(
      { text: "Login", id: "login-btn", className: "btn btn-primary", visible: true },
      { text: "Sign In", id: "signin-btn", className: "btn btn-secondary", visible: true },
    )
  }

  if (taskLower.includes("search") || taskLower.includes("搜索")) {
    buttons.push(
      { text: "Search", id: "search-btn", className: "btn btn-search", visible: true },
      { text: "Google Search", id: "google-search", className: "btn", visible: true },
    )
  }

  if (taskLower.includes("submit") || taskLower.includes("提交") || taskLower.includes("form")) {
    buttons.push(
      { text: "Submit", id: "submit-btn", className: "btn btn-primary", visible: true },
      { text: "Send", id: "send-btn", className: "btn btn-success", visible: true },
    )
  }

  // 默认按钮
  if (buttons.length === 0) {
    buttons.push(
      { text: "Continue", id: "continue-btn", className: "btn btn-primary", visible: true },
      { text: "Next", id: "next-btn", className: "btn btn-secondary", visible: true },
    )
  }

  return buttons
}

// 辅助函数：根据任务生成模拟输入框
function generateMockInputs(task: string): any[] {
  const taskLower = task.toLowerCase()
  const inputs = []

  if (taskLower.includes("login") || taskLower.includes("登录")) {
    inputs.push(
      { type: "email", placeholder: "Email", name: "email", visible: true },
      { type: "password", placeholder: "Password", name: "password", visible: true },
    )
  }

  if (taskLower.includes("search") || taskLower.includes("搜索")) {
    inputs.push({ type: "search", placeholder: "Search...", name: "q", visible: true })
  }

  if (taskLower.includes("form") || taskLower.includes("表单")) {
    inputs.push(
      { type: "text", placeholder: "Name", name: "name", visible: true },
      { type: "email", placeholder: "Email", name: "email", visible: true },
      { type: "tel", placeholder: "Phone", name: "phone", visible: true },
    )
  }

  return inputs
}

// 辅助函数：生成模拟链接
function generateMockLinks(url: string): any[] {
  return [
    { text: "Home", href: "/", visible: true },
    { text: "About", href: "/about", visible: true },
    { text: "Contact", href: "/contact", visible: true },
  ]
}

// 辅助函数：生成模拟表单
function generateMockForms(task: string): any[] {
  const taskLower = task.toLowerCase()

  if (taskLower.includes("login") || taskLower.includes("form") || taskLower.includes("submit")) {
    return [{ id: "main-form", className: "form", action: "/submit", method: "POST" }]
  }

  return []
}

// 辅助函数：根据任务选择相关的测试视频
function selectRelevantTestVideo(task: string, testVideoUrls: string[]): string {
  // 根据任务类型选择最相关的测试视频
  const taskLower = task.toLowerCase()

  if (taskLower.includes("search") || taskLower.includes("搜索")) {
    return testVideoUrls[1] // 第二个视频用于搜索演示
  }

  if (taskLower.includes("form") || taskLower.includes("表单") || taskLower.includes("submit")) {
    return testVideoUrls[2] // 第三个视频用于表单演示
  }

  if (taskLower.includes("login") || taskLower.includes("登录")) {
    return testVideoUrls[3] || testVideoUrls[0] // 第四个视频用于登录演示
  }

  return testVideoUrls[0] // 默认使用第一个视频
}
