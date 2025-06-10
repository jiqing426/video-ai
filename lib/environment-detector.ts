import { execSync } from "child_process"
import fs from "fs"

export interface EnvironmentCapabilities {
  hasPlaywright: boolean
  hasChromium: boolean
  hasFFmpeg: boolean
  isDocker: boolean
  isVercel: boolean
  isLocal: boolean
  canRecord: boolean
}

export async function detectEnvironment(): Promise<EnvironmentCapabilities> {
  const capabilities: EnvironmentCapabilities = {
    hasPlaywright: false,
    hasChromium: false,
    hasFFmpeg: false,
    isDocker: false,
    isVercel: false,
    isLocal: false,
    canRecord: false,
  }

  try {
    // 检测是否在Docker环境中
    capabilities.isDocker = fs.existsSync("/.dockerenv") || process.env.DOCKER === "true" || process.env.DOCKER === "1"

    // 检测是否在Vercel环境中
    capabilities.isVercel = process.env.VERCEL === "1" || process.env.VERCEL_ENV !== undefined

    // 检测是否在本地环境中
    capabilities.isLocal = process.env.NODE_ENV === "development" && !capabilities.isVercel && !capabilities.isDocker

    console.log("Environment detection:", {
      isDocker: capabilities.isDocker,
      isVercel: capabilities.isVercel,
      isLocal: capabilities.isLocal,
      dockerEnv: process.env.DOCKER,
      vercelEnv: process.env.VERCEL,
      nodeEnv: process.env.NODE_ENV,
    })

    // 检测Playwright是否可用
    try {
      require("playwright")
      capabilities.hasPlaywright = true
    } catch (e) {
      console.log("Playwright not available:", e)
    }

    // 检测Chromium是否可用
    try {
      if (capabilities.isDocker) {
        // Docker环境中检查系统Chromium
        execSync("which chromium-browser", { stdio: "ignore" })
        capabilities.hasChromium = true
      } else if (capabilities.hasPlaywright) {
        // 本地环境中检查Playwright Chromium
        const { chromium } = require("playwright")
        const browser = await chromium.launch({ headless: true })
        await browser.close()
        capabilities.hasChromium = true
      }
    } catch (e) {
      console.log("Chromium not available:", e)
    }

    // 检测FFmpeg是否可用
    try {
      if (capabilities.isDocker) {
        execSync("which ffmpeg", { stdio: "ignore" })
      } else {
        require("ffmpeg-static")
      }
      capabilities.hasFFmpeg = true
    } catch (e) {
      console.log("FFmpeg not available:", e)
    }

    // 确定是否可以进行真实录制
    capabilities.canRecord = capabilities.hasPlaywright && capabilities.hasChromium

    console.log("Environment capabilities:", capabilities)
    return capabilities
  } catch (error) {
    console.error("Error detecting environment:", error)
    return capabilities
  }
}
