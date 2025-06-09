// API密钥检查脚本
const { validateApiKeys, printValidationResult } = require("../lib/api-keys-validator")

async function main() {
  console.log("🔍 开始检查API密钥...")

  try {
    const result = await validateApiKeys()
    printValidationResult(result)

    // 根据结果设置退出码
    if (result.overall === "valid") {
      process.exit(0)
    } else if (result.overall === "partial") {
      process.exit(1)
    } else {
      process.exit(2)
    }
  } catch (error) {
    console.error("❌ 检查过程中发生错误:", error.message)
    process.exit(3)
  }
}

main()
