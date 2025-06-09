// 环境变量检查脚本
const fs = require("fs")

console.log("🔍 检查环境变量配置...")

// 必需的环境变量
const requiredEnvVars = {
  NEXT_PUBLIC_BASE_URL: {
    description: "应用的基础URL",
    example: "http://localhost:3000",
    required: true,
  },
  CI: {
    description: "CI环境标识",
    example: "false",
    required: true,
  },
  RECORDING_OUTPUT_DIR: {
    description: "录制文件输出目录",
    example: "./public/recordings",
    required: true,
  },
  PLAYWRIGHT_HEADLESS: {
    description: "Playwright无头模式",
    example: "false",
    required: false,
  },
  RECORDING_MAX_DURATION: {
    description: "最大录制时长(毫秒)",
    example: "300000",
    required: false,
  },
}

// 检查环境变量
function checkEnvironmentVariables() {
  console.log("📋 环境变量检查结果:")
  console.log("-".repeat(60))

  let allGood = true

  Object.entries(requiredEnvVars).forEach(([varName, config]) => {
    const value = process.env[varName]
    const status = value ? "✅" : config.required ? "❌" : "⚠️ "

    console.log(`${status} ${varName}`)
    console.log(`   描述: ${config.description}`)
    console.log(`   当前值: ${value || "未设置"}`)
    console.log(`   示例值: ${config.example}`)
    console.log("")

    if (config.required && !value) {
      allGood = false
    }
  })

  return allGood
}

// 检查文件
function checkFiles() {
  console.log("📁 文件检查结果:")
  console.log("-".repeat(60))

  const files = [
    { path: ".env.local", description: "本地环境变量文件", required: true },
    { path: ".env.example", description: "环境变量示例文件", required: false },
    { path: "playwright.config.ts", description: "Playwright配置文件", required: false },
    { path: "public/recordings", description: "录制文件目录", required: true },
  ]

  let allGood = true

  files.forEach((file) => {
    const exists = fs.existsSync(file.path)
    const status = exists ? "✅" : file.required ? "❌" : "⚠️ "

    console.log(`${status} ${file.path} - ${file.description}`)

    if (file.required && !exists) {
      allGood = false
    }
  })

  console.log("")
  return allGood
}

// 检查Node.js版本
function checkNodeVersion() {
  console.log("🔧 Node.js版本检查:")
  console.log("-".repeat(60))

  const nodeVersion = process.version
  const majorVersion = Number.parseInt(nodeVersion.slice(1).split(".")[0])

  console.log(`当前版本: ${nodeVersion}`)

  if (majorVersion >= 16) {
    console.log("✅ Node.js版本符合要求 (>= 16)")
    return true
  } else {
    console.log("❌ Node.js版本过低，需要 >= 16")
    return false
  }
}

// 检查Playwright安装
async function checkPlaywrightInstallation() {
  console.log("🎭 Playwright安装检查:")
  console.log("-".repeat(60))

  try {
    // 检查是否安装了playwright包
    require.resolve("playwright")
    console.log("✅ Playwright包已安装")

    // 尝试导入playwright
    const { chromium } = require("playwright")

    // 尝试启动浏览器（快速检查）
    const browser = await chromium.launch({ headless: true })
    await browser.close()
    console.log("✅ Playwright浏览器可用")

    return true
  } catch (error) {
    console.log("❌ Playwright未正确安装")
    console.log(`   错误: ${error.message}`)
    return false
  }
}

// 生成修复建议
function generateFixSuggestions(envCheck, fileCheck, nodeCheck, playwrightCheck) {
  console.log("🔧 修复建议:")
  console.log("-".repeat(60))

  if (!nodeCheck) {
    console.log("1. 升级Node.js到16或更高版本")
    console.log("   访问: https://nodejs.org/")
    console.log("")
  }

  if (!envCheck) {
    console.log("2. 配置环境变量")
    console.log("   运行: node scripts/setup-environment.js")
    console.log("")
  }

  if (!fileCheck) {
    console.log("3. 创建必要的文件和目录")
    console.log("   运行: node scripts/setup-environment.js")
    console.log("")
  }

  if (!playwrightCheck) {
    console.log("4. 安装Playwright")
    console.log("   运行: node scripts/install-playwright.js")
    console.log("   或者: npm install playwright && npx playwright install")
    console.log("")
  }

  if (envCheck && fileCheck && nodeCheck && playwrightCheck) {
    console.log("🎉 所有检查都通过了！环境配置正确。")
  }
}

// 主函数
async function main() {
  console.log("🚀 开始环境检查...\n")

  // 执行各项检查
  const nodeCheck = checkNodeVersion()
  console.log("")

  const envCheck = checkEnvironmentVariables()
  const fileCheck = checkFiles()
  const playwrightCheck = await checkPlaywrightInstallation()
  console.log("")

  // 生成修复建议
  generateFixSuggestions(envCheck, fileCheck, nodeCheck, playwrightCheck)

  // 总结
  const allChecks = [nodeCheck, envCheck, fileCheck, playwrightCheck]
  const passedChecks = allChecks.filter(Boolean).length

  console.log("📊 检查总结:")
  console.log("-".repeat(60))
  console.log(`通过检查: ${passedChecks}/${allChecks.length}`)

  if (passedChecks === allChecks.length) {
    console.log("🎉 环境配置完美！可以开始使用Playwright录制功能。")
    process.exit(0)
  } else {
    console.log("⚠️  请按照上述建议修复问题后重新检查。")
    process.exit(1)
  }
}

// 运行检查
main().catch((error) => {
  console.error("❌ 检查过程中发生错误:", error)
  process.exit(1)
})
