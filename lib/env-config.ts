// 环境变量配置管理
export interface EnvConfig {
  // Next.js 配置
  baseUrl: string
  nodeEnv: string

  // CI/CD 配置
  isCI: boolean

  // Playwright 配置
  playwrightHeadless: boolean
  playwrightTimeout: number
  playwrightBrowsersPath: string

  // 录制配置
  recordingOutputDir: string
  recordingMaxDuration: number
  recordingDefaultViewport: {
    width: number
    height: number
  }

  // 日志配置
  logLevel: string
  debug: boolean
}

// 获取环境配置
export function getEnvConfig(): EnvConfig {
  return {
    // Next.js 配置
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
    nodeEnv: process.env.NODE_ENV || "development",

    // CI/CD 配置
    isCI:
      process.env.CI === "true" ||
      !!(
        process.env.CONTINUOUS_INTEGRATION ||
        process.env.BUILD_NUMBER ||
        process.env.GITHUB_ACTIONS ||
        process.env.VERCEL
      ),

    // Playwright 配置
    playwrightHeadless: process.env.PLAYWRIGHT_HEADLESS === "true",
    playwrightTimeout: Number.parseInt(process.env.PLAYWRIGHT_TIMEOUT || "30000"),
    playwrightBrowsersPath: process.env.PLAYWRIGHT_BROWSERS_PATH || "./playwright-browsers",

    // 录制配置
    recordingOutputDir: process.env.RECORDING_OUTPUT_DIR || "./public/recordings",
    recordingMaxDuration: Number.parseInt(process.env.RECORDING_MAX_DURATION || "300000"),
    recordingDefaultViewport: {
      width: Number.parseInt(process.env.RECORDING_DEFAULT_VIEWPORT_WIDTH || "1920"),
      height: Number.parseInt(process.env.RECORDING_DEFAULT_VIEWPORT_HEIGHT || "1080"),
    },

    // 日志配置
    logLevel: process.env.LOG_LEVEL || "info",
    debug: !!process.env.DEBUG,
  }
}

// 验证环境配置
export function validateEnvConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  // 检查必需的环境变量
  const requiredVars = ["NEXT_PUBLIC_BASE_URL", "CI", "RECORDING_OUTPUT_DIR"]

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      errors.push(`缺少必需的环境变量: ${varName}`)
    }
  })

  // 检查数值类型的环境变量
  const numericVars = [
    "PLAYWRIGHT_TIMEOUT",
    "RECORDING_MAX_DURATION",
    "RECORDING_DEFAULT_VIEWPORT_WIDTH",
    "RECORDING_DEFAULT_VIEWPORT_HEIGHT",
  ]

  numericVars.forEach((varName) => {
    const value = process.env[varName]
    if (value && isNaN(Number.parseInt(value))) {
      errors.push(`环境变量 ${varName} 必须是数字: ${value}`)
    }
  })

  // 检查URL格式
  try {
    new URL(process.env.NEXT_PUBLIC_BASE_URL || "")
  } catch (error) {
    errors.push(`NEXT_PUBLIC_BASE_URL 格式无效: ${process.env.NEXT_PUBLIC_BASE_URL}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// 打印环境配置
export function printEnvConfig() {
  const config = getEnvConfig()
  const validation = validateEnvConfig()

  console.log("🔧 当前环境配置:")
  console.log("-".repeat(50))
  console.log(`基础URL: ${config.baseUrl}`)
  console.log(`环境: ${config.nodeEnv}`)
  console.log(`CI模式: ${config.isCI}`)
  console.log(`无头模式: ${config.playwrightHeadless}`)
  console.log(`录制目录: ${config.recordingOutputDir}`)
  console.log(`最大录制时长: ${config.recordingMaxDuration}ms`)
  console.log(`默认视口: ${config.recordingDefaultViewport.width}x${config.recordingDefaultViewport.height}`)
  console.log("-".repeat(50))

  if (validation.isValid) {
    console.log("✅ 环境配置有效")
  } else {
    console.log("❌ 环境配置错误:")
    validation.errors.forEach((error) => console.log(`  - ${error}`))
  }

  return { config, validation }
}
