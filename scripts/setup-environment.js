// 环境变量配置脚本
const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("🔧 开始配置环境变量...")

// 检查当前环境
function checkCurrentEnvironment() {
  console.log("📋 当前环境信息:")
  console.log(`  Node.js版本: ${process.version}`)
  console.log(`  操作系统: ${process.platform}`)
  console.log(`  架构: ${process.arch}`)
  console.log(`  工作目录: ${process.cwd()}`)

  // 检查是否在CI环境中
  const isCI = !!(
    process.env.CI ||
    process.env.CONTINUOUS_INTEGRATION ||
    process.env.BUILD_NUMBER ||
    process.env.GITHUB_ACTIONS ||
    process.env.VERCEL
  )

  console.log(`  CI环境: ${isCI ? "是" : "否"}`)
  return { isCI }
}

// 生成环境变量配置
function generateEnvConfig() {
  const { isCI } = checkCurrentEnvironment()

  // 基础环境变量配置
  const envConfig = {
    // Next.js 配置
    NEXT_PUBLIC_BASE_URL: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000",

    // CI/CD 配置
    CI: isCI ? "true" : "false",

    // Playwright 配置
    PLAYWRIGHT_BROWSERS_PATH: "./playwright-browsers",
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: "false",

    // 录制配置
    RECORDING_OUTPUT_DIR: "./public/recordings",
    RECORDING_MAX_DURATION: "300000", // 5分钟
    RECORDING_DEFAULT_VIEWPORT_WIDTH: "1920",
    RECORDING_DEFAULT_VIEWPORT_HEIGHT: "1080",

    // 开发环境配置
    NODE_ENV: process.env.NODE_ENV || "development",

    // 安全配置
    PLAYWRIGHT_HEADLESS: isCI ? "true" : "false",
    PLAYWRIGHT_TIMEOUT: "30000",

    // 日志配置
    DEBUG: process.env.DEBUG || "",
    LOG_LEVEL: process.env.LOG_LEVEL || "info",
  }

  return envConfig
}

// 创建 .env.local 文件
function createEnvFile(envConfig) {
  const envContent = Object.entries(envConfig)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n")

  const envHeader = `# 环境变量配置文件
# 由 setup-environment.js 自动生成
# 生成时间: ${new Date().toISOString()}

# ===========================================
# Next.js 配置
# ===========================================

`

  const envFooter = `

# ===========================================
# 自定义配置说明
# ===========================================
# NEXT_PUBLIC_BASE_URL: 应用的基础URL
# CI: 是否在CI环境中运行
# PLAYWRIGHT_HEADLESS: 是否使用无头模式
# RECORDING_OUTPUT_DIR: 录制文件输出目录
# RECORDING_MAX_DURATION: 最大录制时长(毫秒)
# ===========================================
`

  const fullContent = envHeader + envContent + envFooter

  fs.writeFileSync(".env.local", fullContent)
  console.log("✅ 已创建 .env.local 文件")

  return envConfig
}

// 创建 .env.example 文件
function createEnvExample(envConfig) {
  const exampleContent = Object.entries(envConfig)
    .map(([key, value]) => {
      // 对敏感信息使用占位符
      if (key.includes("SECRET") || key.includes("KEY") || key.includes("TOKEN")) {
        return `${key}=your_${key.toLowerCase()}_here`
      }
      return `${key}=${value}`
    })
    .join("\n")

  const exampleHeader = `# 环境变量示例文件
# 复制此文件为 .env.local 并填入实际值

`

  fs.writeFileSync(".env.example", exampleHeader + exampleContent)
  console.log("✅ 已创建 .env.example 文件")
}

// 更新 .gitignore
function updateGitignore() {
  const gitignorePath = ".gitignore"
  let gitignoreContent = ""

  if (fs.existsSync(gitignorePath)) {
    gitignoreContent = fs.readFileSync(gitignorePath, "utf8")
  }

  const envEntries = [
    "# 环境变量文件",
    ".env.local",
    ".env.*.local",
    "",
    "# Playwright",
    "test-results/",
    "playwright-report/",
    "playwright/.cache/",
    "playwright-browsers/",
    "",
    "# 录制文件",
    "public/recordings/*.mp4",
    "public/recordings/*.webm",
    "public/recordings/*.png",
    "!public/recordings/.gitkeep",
  ]

  // 检查是否已经包含这些条目
  const needsUpdate = envEntries.some((entry) => entry.trim() && !gitignoreContent.includes(entry.trim()))

  if (needsUpdate) {
    const updatedContent = gitignoreContent + "\n\n" + envEntries.join("\n")
    fs.writeFileSync(gitignorePath, updatedContent)
    console.log("✅ 已更新 .gitignore 文件")
  } else {
    console.log("ℹ️  .gitignore 文件已是最新")
  }
}

// 创建录制目录
function createDirectories() {
  const directories = ["./public/recordings", "./playwright-browsers", "./test-results", "./playwright-report"]

  directories.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
      console.log(`📁 创建目录: ${dir}`)

      // 为录制目录创建 .gitkeep 文件
      if (dir === "./public/recordings") {
        fs.writeFileSync(path.join(dir, ".gitkeep"), "")
      }
    }
  })
}

// 验证环境配置
function validateEnvironment() {
  console.log("🔍 验证环境配置...")

  const requiredVars = ["NEXT_PUBLIC_BASE_URL", "CI", "RECORDING_OUTPUT_DIR"]

  const missing = []

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  })

  if (missing.length > 0) {
    console.log("⚠️  缺少以下环境变量:")
    missing.forEach((varName) => console.log(`  - ${varName}`))
    console.log("请重新启动应用以加载新的环境变量")
  } else {
    console.log("✅ 所有必需的环境变量都已配置")
  }

  return missing.length === 0
}

// 显示配置摘要
function showConfigSummary(envConfig) {
  console.log("\n📊 环境配置摘要:")
  console.log("=" * 50)

  Object.entries(envConfig).forEach(([key, value]) => {
    // 隐藏敏感信息
    const displayValue = key.includes("SECRET") || key.includes("KEY") || key.includes("TOKEN") ? "***隐藏***" : value

    console.log(`  ${key}: ${displayValue}`)
  })

  console.log("=" * 50)
}

// 主函数
function main() {
  try {
    console.log("🚀 开始环境配置...")

    // 1. 检查当前环境
    checkCurrentEnvironment()

    // 2. 生成环境配置
    const envConfig = generateEnvConfig()

    // 3. 创建环境文件
    createEnvFile(envConfig)
    createEnvExample(envConfig)

    // 4. 更新 .gitignore
    updateGitignore()

    // 5. 创建必要目录
    createDirectories()

    // 6. 显示配置摘要
    showConfigSummary(envConfig)

    // 7. 验证配置
    const isValid = validateEnvironment()

    console.log("\n🎉 环境配置完成!")
    console.log("\n📋 下一步:")
    console.log("1. 检查 .env.local 文件中的配置")
    console.log("2. 根据需要修改环境变量值")
    console.log("3. 重新启动开发服务器: npm run dev")
    console.log("4. 运行 Playwright 安装: npm run setup:playwright")

    if (!isValid) {
      console.log("\n⚠️  注意: 请重新启动应用以加载新的环境变量")
    }
  } catch (error) {
    console.error("❌ 环境配置失败:", error.message)
    process.exit(1)
  }
}

// 运行主函数
main()
