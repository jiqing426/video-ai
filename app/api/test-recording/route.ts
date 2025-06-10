import { NextResponse } from "next/server"
import { detectEnvironment } from "@/lib/environment-detector"
import { put } from "@vercel/blob"
import { v4 as uuidv4 } from "uuid"
import { getTestVideoUrls, generateColorfulThumbnail } from "@/lib/video-generator"

interface TestRequest {
  url: string
  task: string
  mode: "url-only" | "url-prompt" | "code-aware"
  aspectRatio?: string
}

export async function POST(request: Request) {
  const startTime = Date.now()
  const MAX_EXECUTION_TIME = 25000 // 25秒限制

  try {
    const body: TestRequest = await request.json()
    console.log("🧪 Starting quick recording test:", body)

    // 快速环境检测
    const capabilities = await detectEnvironment()
    console.log("🔍 Environment capabilities:", capabilities)

    // 检查剩余时间
    const elapsedTime = Date.now() - startTime
    if (elapsedTime > MAX_EXECUTION_TIME * 0.3) {
      console.log("⚠️ Time constraint, using minimal test")
      return await performMinimalTest(body)
    }

    if (capabilities.canRecord && !capabilities.isVercel) {
      // 非Vercel环境的快速测试
      console.log("🎬 Quick real recording test...")
      const result = await performQuickTest(body, capabilities)
      return NextResponse.json({ success: true, data: result })
    } else {
      // Vercel环境的模拟测试
      console.log("🎭 Quick simulation test...")
      const result = await performSimulationTest(body)
      return NextResponse.json({ success: true, data: result })
    }
  } catch (error) {
    console.error("❌ Test failed:", error)

    let errorMessage = "测试失败"
    if (error instanceof Error) {
      if (error.message.includes("timeout")) {
        errorMessage = "测试超时"
      } else if (error.message.includes("net::ERR_NAME_NOT_RESOLVED")) {
        errorMessage = "无法访问测试网站"
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    )
  }
}

async function performQuickTest(body: TestRequest, capabilities: any) {
  // 模拟快速测试过程
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // 使用可靠的测试视频
  const testVideoUrls = getTestVideoUrls()
  const testVideoUrl = testVideoUrls[0] // 使用第一个测试视频

  const videoId = `test-quick-${uuidv4()}`
  const mockThumbnailData = generateColorfulThumbnail("Quick Test")

  // 确保存储在video/文件夹中
  const { url: thumbnailUrl } = await put(`thumbnails/${videoId}.jpg`, mockThumbnailData, {
    access: "public",
    contentType: "image/jpeg",
  })

  return {
    videoUrl: testVideoUrl,
    thumbnailUrl,
    duration: "00:15",
    resolution: "1280x720",
    size: "1.5 MB",
    format: "MP4",
    createdAt: new Date().toISOString(),
    steps: ["快速页面分析", "简化交互测试", "快速视频生成"],
    recordingType: "quick_real",
    pageTitle: "测试页面",
    elementsFound: {
      buttons: 2,
      inputs: 1,
      links: 3,
    },
  }
}

async function performSimulationTest(body: TestRequest) {
  // 最小化处理时间
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // 使用可靠的测试视频
  const testVideoUrls = getTestVideoUrls()
  const testVideoUrl = testVideoUrls[1] // 使用第二个测试视频

  const videoId = `test-sim-${uuidv4()}`
  const mockThumbnailData = generateColorfulThumbnail("Simulation Test")

  // 确保存储在video/文件夹中
  const { url: thumbnailUrl } = await put(`thumbnails/${videoId}.jpg`, mockThumbnailData, {
    access: "public",
    contentType: "image/jpeg",
  })

  return {
    videoUrl: testVideoUrl,
    thumbnailUrl,
    duration: "00:15",
    resolution: getResolutionFromAspectRatio(body.aspectRatio || "16:9"),
    size: "1.2 MB",
    format: "MP4",
    createdAt: new Date().toISOString(),
    steps: ["模拟页面分析", "模拟交互测试", "模拟视频生成"],
    recordingType: "simulation",
    pageTitle: "测试页面",
    elementsFound: {
      buttons: 2,
      inputs: 1,
      links: 3,
    },
  }
}

async function performMinimalTest(body: TestRequest) {
  // 使用最简单的测试视频
  const testVideoUrls = getTestVideoUrls()
  const testVideoUrl = testVideoUrls[2] // 使用第三个测试视频

  const videoId = `test-minimal-${uuidv4()}`
  const mockThumbnailData = generateColorfulThumbnail("Minimal Test")

  // 确保存储在video/文件夹中
  const { url: thumbnailUrl } = await put(`thumbnails/${videoId}.jpg`, mockThumbnailData, {
    access: "public",
    contentType: "image/jpeg",
  })

  return NextResponse.json({
    success: true,
    data: {
      videoUrl: testVideoUrl,
      thumbnailUrl,
      duration: "00:10",
      resolution: "1280x720",
      size: "800 KB",
      format: "MP4",
      createdAt: new Date().toISOString(),
      steps: ["最小化测试"],
      recordingType: "minimal",
      pageTitle: "快速测试",
      elementsFound: {
        buttons: 1,
        inputs: 1,
        links: 1,
      },
    },
  })
}

function getResolutionFromAspectRatio(aspectRatio: string): string {
  const resolutions: Record<string, string> = {
    "16:9": "1280x720",
    "4:3": "1024x768",
    "1:1": "720x720",
    "9:16": "720x1280",
    "21:9": "1280x548",
  }
  return resolutions[aspectRatio] || "1280x720"
}
