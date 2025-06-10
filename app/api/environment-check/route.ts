import { NextResponse } from "next/server"
import { detectEnvironment } from "@/lib/environment-detector"

export async function GET() {
  try {
    const capabilities = await detectEnvironment()

    let environment = "未知"
    if (capabilities.isDocker) {
      environment = "Docker容器"
    } else if (capabilities.isVercel) {
      environment = "Vercel云平台"
    } else if (capabilities.isLocal) {
      environment = "本地开发"
    }

    return NextResponse.json({
      environment,
      hasPlaywright: capabilities.hasPlaywright,
      hasChromium: capabilities.hasChromium,
      hasFFmpeg: capabilities.hasFFmpeg,
      canRecord: capabilities.canRecord,
      isDocker: capabilities.isDocker,
      isVercel: capabilities.isVercel,
      isLocal: capabilities.isLocal,
    })
  } catch (error) {
    console.error("Environment check failed:", error)
    return NextResponse.json(
      {
        environment: "检测失败",
        hasPlaywright: false,
        hasChromium: false,
        hasFFmpeg: false,
        canRecord: false,
        isDocker: false,
        isVercel: false,
        isLocal: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
