import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("📝 收到视频生成请求:", body)

    // 验证必要的参数
    if (!body.url || !body.task) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters: url and task",
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // 根据模式验证其他必要参数
    if (body.mode === "code-aware" && !body.github) {
      return NextResponse.json(
        {
          success: false,
          error: "GitHub repository URL is required for code-aware mode",
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    console.log("🎬 模拟Playwright录制过程...")

    // 模拟录制过程
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // 模拟成功的录制结果
    const mockVideoMetadata = {
      videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      thumbnailUrl: "/placeholder.svg?height=720&width=1280",
      duration: formatDuration(45000), // 45秒
      resolution: getResolutionFromAspectRatio(body.aspectRatio || "16:9"),
      size: "12.3 MB",
      format: "MP4",
      createdAt: new Date().toISOString(),
      steps: [
        "初始化Playwright浏览器",
        `导航到 ${body.url}`,
        "分析页面结构",
        "执行用户交互",
        "录制视频内容",
        "生成最终视频",
      ],
      mode: body.mode,
      task: body.task,
    }

    console.log("✅ 模拟录制完成:", mockVideoMetadata)

    return NextResponse.json(
      {
        success: true,
        data: mockVideoMetadata,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("❌ 视频生成错误:", error)

    // 确保返回正确的JSON格式
    let errorMessage = "视频生成失败"
    if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined,
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}

// 辅助函数
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
}

function getResolutionFromAspectRatio(aspectRatio: string): string {
  const resolutions: Record<string, string> = {
    "16:9": "1920x1080",
    "4:3": "1024x768",
    "1:1": "1080x1080",
    "9:16": "1080x1920",
    "21:9": "2560x1080",
  }
  return resolutions[aspectRatio] || "1920x1080"
}
