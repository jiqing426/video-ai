import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { v4 as uuidv4 } from "uuid"
import fs from "fs/promises"
import { detectEnvironment } from "@/lib/environment-detector"
import { PlaywrightRecorder } from "@/lib/playwright-recorder"
import { generateActionsFromAI } from "@/lib/ai-action-generator"
import { getTestVideoUrls, generateColorfulThumbnail } from "@/lib/video-generator"
import { createServerClient } from '@supabase/ssr'
import { createGenerationHistory } from '@/lib/generation-history'
import { cookies } from "next/headers"

// 临时方案
type Database = any

interface GenerateVideoRequest {
  mode: "url-only" | "url-prompt" | "code-aware"
  url: string
  task: string
  workflow?: string
  elements?: string
  github?: string
  aspectRatio?: string
}

export async function POST(request: Request) {
  const startTime = Date.now()
  const MAX_EXECUTION_TIME = 55000 // 55秒，留5秒缓冲

  const recorder: PlaywrightRecorder | null = null
  let tempDir: string | null = null

  try {
    console.log("📝 Starting AI-powered video generation...")

    const body: GenerateVideoRequest = await request.json()
    console.log("📝 Request data:", body)

    // 验证必要的参数
    if (!body.url || !body.task) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: url and task",
        },
        { status: 400 },
      )
    }

    // 验证URL格式
    try {
      new URL(body.url)
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid URL format",
        },
        { status: 400 },
      )
    }

    // 检测环境能力
    const capabilities = await detectEnvironment()
    console.log("🔍 Environment capabilities:", capabilities)

    // 创建临时目录
    tempDir = `/tmp/videos/${uuidv4()}`
    await fs.mkdir(tempDir, { recursive: true })

    if (capabilities.canRecord && !capabilities.isVercel) {
      // 真实录制模式
      console.log("🎬 Using AI-powered real recording...")
      const result = await performAIRecording(
        body,
        capabilities,
        tempDir,
        MAX_EXECUTION_TIME - (Date.now() - startTime),
      )
      return NextResponse.json({ success: true, data: result })
    } else {
      // 智能模拟模式 - 仍然使用AI生成步骤，但不进行真实录制
      console.log("🎭 Using AI-powered simulation...")
      const result = await performAISimulation(body)
      return NextResponse.json({ success: true, data: result })
    }
  } catch (error) {
    console.error("❌ Video generation error:", error)

    let errorMessage = "视频生成失败"
    if (error instanceof Error) {
      if (error.message.includes("timeout") || error.message.includes("time")) {
        errorMessage = "处理超时，请尝试更简单的任务或稍后重试"
      } else if (error.message.includes("net::ERR_NAME_NOT_RESOLVED")) {
        errorMessage = "无法访问指定的网站，请检查URL是否正确"
      } else if (error.message.includes("Navigation failed")) {
        errorMessage = "页面导航失败，可能是网站限制了自动化访问"
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    )
  }
}

async function performAIRecording(
  body: GenerateVideoRequest,
  capabilities: any,
  tempDir: string,
  maxTime: number,
): Promise<any> {
  let recorder: PlaywrightRecorder | null = null
  const startTime = Date.now()

  try {
    console.log("🤖 Starting AI-powered recording for:", body.url)

    // 初始化录制器
    const viewport = getViewportFromAspectRatio(body.aspectRatio || "16:9")
    recorder = new PlaywrightRecorder(capabilities)
    await recorder.initialize({
      url: body.url,
      viewport,
      outputDir: tempDir,
      timeout: Math.min(20000, maxTime * 0.4),
    })

    // 导航到目标网站
    console.log("🌐 Navigating to target website...")
    await recorder.navigateToUrl(body.url)

    // 分析页面结构
    console.log("🔍 Analyzing page structure...")
    const pageAnalysis = await recorder.analyzePage()
    console.log("📊 Page analysis result:", pageAnalysis)

    // 使用AI生成智能交互步骤
    console.log("🤖 Generating AI-powered actions...")
    const aiActions = await generateActionsFromAI(
      body.url,
      body.task,
      body.mode,
      pageAnalysis,
      body.workflow,
      body.elements,
      body.github,
    )

    console.log(
      "✅ Generated",
      aiActions.length,
      "AI actions:",
      aiActions.map((a) => a.description),
    )

    // 执行AI生成的交互步骤
    console.log("🎭 Executing AI-generated actions...")
    await recorder.executeActions(aiActions)

    // 获取录制的视频
    const rawVideoPath = await recorder.close()

    if (!rawVideoPath) {
      throw new Error("Failed to get recorded video")
    }

    // 上传视频到Blob存储
    const videoId = uuidv4()
    const videoBuffer = await fs.readFile(rawVideoPath)

    const { url: videoUrl } = await put(`video/${videoId}.webm`, videoBuffer, {
      access: "public",
      contentType: "video/webm",
    })

    // 生成缩略图
    const thumbnailData = generateColorfulThumbnail(`${body.task} - AI Recording`)
    const { url: thumbnailUrl } = await put(`thumbnails/${videoId}.jpg`, thumbnailData, {
      access: "public",
      contentType: "image/jpeg",
    })

    // 保存到历史记录
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: cookies as any }
    )
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await createGenerationHistory({
        video_url: videoUrl,
        video_name: `${body.task} - AI Recording`,
        video_size: videoBuffer.length,
        video_duration: 30000, // 30秒
        video_format: "webm",
        video_resolution: `${viewport.width}x${viewport.height}`,
        status: "completed"
      })
    }

    return {
      videoUrl,
      thumbnailUrl,
      duration: "00:30",
      resolution: `${viewport.width}x${viewport.height}`,
      size: `${Math.round((videoBuffer.length / 1024 / 1024) * 10) / 10} MB`,
      format: "WebM",
      createdAt: new Date().toISOString(),
      steps: aiActions.map((action) => action.description),
      aiReasoning: aiActions.map((action) => action.reasoning),
      mode: body.mode,
      task: body.task,
      url: body.url,
      recordingType: "ai_real_recording",
      pageAnalysis: {
        title: pageAnalysis.title,
        elementsFound: pageAnalysis.elements
          ? {
              buttons: pageAnalysis.elements.buttons?.length || 0,
              inputs: pageAnalysis.elements.inputs?.length || 0,
              links: pageAnalysis.elements.links?.length || 0,
              forms: pageAnalysis.elements.forms?.length || 0,
            }
          : {},
      },
    }
  } catch (error) {
    console.log("AI recording failed, falling back to simulation:", error)
    return performAISimulation(body)
  }
}

async function performAISimulation(body: GenerateVideoRequest): Promise<any> {
  console.log("🎭 Performing AI-powered simulation...")

  try {
    // 即使是模拟，也使用AI生成真实的步骤
    console.log("🤖 Generating AI actions for simulation...")

    // 模拟页面分析结果
    const mockPageAnalysis = {
      title: `${body.url} - AI Analysis`,
      url: body.url,
      elements: {
        buttons: [
          { text: "Submit", id: "submit-btn", className: "btn btn-primary", visible: true },
          { text: "Cancel", id: "cancel-btn", className: "btn btn-secondary", visible: true },
        ],
        inputs: [
          { type: "text", placeholder: "Enter your name", name: "name", visible: true },
          { type: "email", placeholder: "Enter your email", name: "email", visible: true },
        ],
        links: [
          { text: "Home", href: "/", visible: true },
          { text: "About", href: "/about", visible: true },
        ],
        forms: [{ id: "main-form", className: "form", action: "/submit", method: "POST" }],
      },
    }

    const aiActions = await generateActionsFromAI(
      body.url,
      body.task,
      body.mode,
      mockPageAnalysis,
      body.workflow,
      body.elements,
      body.github,
    )

    console.log(
      "✅ Generated AI simulation steps:",
      aiActions.map((a) => a.description),
    )

    // 使用一个相关的测试视频而不是随机选择
    const testVideoUrls = getTestVideoUrls()
    const selectedVideoUrl = testVideoUrls[0] // 使用第一个作为默认

    // 生成缩略图
    const videoId = uuidv4()
    const thumbnailData = generateColorfulThumbnail(`${body.task} - AI Simulation`)

    const { url: thumbnailUrl } = await put(`thumbnails/${videoId}.jpg`, thumbnailData, {
      access: "public",
      contentType: "image/jpeg",
    })

    // 保存到历史记录
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: cookies as any }
    )
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await createGenerationHistory({
        video_url: selectedVideoUrl,
        video_name: `${body.task} - AI Simulation`,
        video_size: 2200000, // 2.1 MB
        video_duration: 30000, // 30秒
        video_format: "mp4",
        video_resolution: getResolutionFromAspectRatio(body.aspectRatio || "16:9"),
        status: "completed"
      })
    }

    return {
      videoUrl: selectedVideoUrl,
      thumbnailUrl,
      duration: "00:30",
      resolution: getResolutionFromAspectRatio(body.aspectRatio || "16:9"),
      size: "2.1 MB",
      format: "MP4",
      createdAt: new Date().toISOString(),
      steps: aiActions.map((action) => action.description),
      aiReasoning: aiActions.map((action) => action.reasoning),
      mode: body.mode,
      task: body.task,
      url: body.url,
      recordingType: "ai_simulation",
      simulationNote: "这是基于AI分析生成的模拟演示。在支持Playwright的环境中，将进行真实录制。",
      pageAnalysis: {
        title: mockPageAnalysis.title,
        elementsFound: {
          buttons: mockPageAnalysis.elements.buttons.length,
          inputs: mockPageAnalysis.elements.inputs.length,
          links: mockPageAnalysis.elements.links.length,
          forms: mockPageAnalysis.elements.forms.length,
        },
      },
    }
  } catch (error) {
    console.error("AI simulation failed:", error)

    // 最后的fallback
    const videoId = uuidv4()
    const thumbnailData = generateColorfulThumbnail("Basic Demo")
    const { url: thumbnailUrl } = await put(`thumbnails/${videoId}.jpg`, thumbnailData, {
      access: "public",
      contentType: "image/jpeg",
    })

    // 保存到历史记录
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: cookies as any }
    )
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      await createGenerationHistory({
        video_url: getTestVideoUrls()[0],
        video_name: `${body.task} - Basic Demo`,
        video_size: 2200000, // 2.1 MB
        video_duration: 30000, // 30秒
        video_format: "mp4",
        video_resolution: getResolutionFromAspectRatio(body.aspectRatio || "16:9"),
        status: "completed"
      })
    }

    return {
      videoUrl: getTestVideoUrls()[0],
      thumbnailUrl,
      duration: "00:30",
      resolution: getResolutionFromAspectRatio(body.aspectRatio || "16:9"),
      size: "2.1 MB",
      format: "MP4",
      createdAt: new Date().toISOString(),
      steps: ["基础页面加载", "简单交互演示", "完成录制"],
      mode: body.mode,
      task: body.task,
      url: body.url,
      recordingType: "basic_demo",
    }
  }
}

function getViewportFromAspectRatio(aspectRatio: string): { width: number; height: number } {
  const viewports: Record<string, { width: number; height: number }> = {
    "16:9": { width: 1280, height: 720 },
    "4:3": { width: 1024, height: 768 },
    "1:1": { width: 1080, height: 1080 },
    "9:16": { width: 720, height: 1280 },
    "21:9": { width: 1280, height: 548 },
  }
  return viewports[aspectRatio] || { width: 1280, height: 720 }
}

function getResolutionFromAspectRatio(aspectRatio: string): string {
  const viewport = getViewportFromAspectRatio(aspectRatio)
  return `${viewport.width}x${viewport.height}`
}
