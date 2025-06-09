// API密钥配置脚本
const fs = require("fs")
const readline = require("readline")

console.log("🔑 API密钥配置向导")
console.log("=" * 50)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

// 所需的API密钥配置
const apiKeys = {
  // OpenAI API (用于AI分析和TTS)
  OPENAI_API_KEY: {
    description: "OpenAI API密钥 - 用于AI分析网站结构和生成语音",
    required: true,
    example: "sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    getUrl: "https://platform.openai.com/api-keys",
    instructions: [
      "1. 访问 https://platform.openai.com/api-keys",
      "2. 登录您的OpenAI账户",
      "3. 点击 'Create new secret key'",
      "4. 复制生成的API密钥",
    ],
  },

  // Vercel Blob Storage (用于存储生成的视频)
  BLOB_READ_WRITE_TOKEN: {
    description: "Vercel Blob存储令牌 - 用于存储和管理生成的视频文件",
    required: true,
    example: "vercel_blob_rw_xxxxxxxxxxxxxxxx",
    getUrl: "https://vercel.com/dashboard/stores",
    instructions: ["1. 访问 https://vercel.com/dashboard/stores", "2. 创建新的Blob存储", "3. 复制 Read/Write Token"],
  },

  // Supabase (用于用户认证和数据存储)
  NEXT_PUBLIC_SUPABASE_URL: {
    description: "Supabase项目URL - 用于用户认证和数据存储",
    required: false,
    example: "https://xxxxxxxxxxxxxxxx.supabase.co",
    getUrl: "https://supabase.com/dashboard",
    instructions: [
      "1. 访问 https://supabase.com/dashboard",
      "2. 创建新项目或选择现有项目",
      "3. 在Settings > API中找到Project URL",
    ],
  },

  NEXT_PUBLIC_SUPABASE_ANON_KEY: {
    description: "Supabase匿名密钥 - 用于客户端认证",
    required: false,
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    getUrl: "https://supabase.com/dashboard",
    instructions: ["1. 在Supabase项目的Settings > API中", "2. 复制 'anon public' 密钥"],
  },

  SUPABASE_SERVICE_ROLE_KEY: {
    description: "Supabase服务角色密钥 - 用于服务端操作",
    required: false,
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    getUrl: "https://supabase.com/dashboard",
    instructions: [
      "1. 在Supabase项目的Settings > API中",
      "2. 复制 'service_role' 密钥",
      "3. ⚠️ 注意：这是敏感密钥，仅用于服务端",
    ],
  },

  // GitHub API (用于代码感知模式)
  GITHUB_TOKEN: {
    description: "GitHub个人访问令牌 - 用于代码感知模式分析仓库",
    required: false,
    example: "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    getUrl: "https://github.com/settings/tokens",
    instructions: [
      "1. 访问 https://github.com/settings/tokens",
      "2. 点击 'Generate new token (classic)'",
      "3. 选择权限: repo, read:org",
      "4. 复制生成的令牌",
    ],
  },

  // Stripe (用于支付功能)
  STRIPE_SECRET_KEY: {
    description: "Stripe密钥 - 用于处理支付",
    required: false,
    example: "sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    getUrl: "https://dashboard.stripe.com/apikeys",
    instructions: [
      "1. 访问 https://dashboard.stripe.com/apikeys",
      "2. 复制 'Secret key'",
      "3. 测试环境使用 sk_test_，生产环境使用 sk_live_",
    ],
  },

  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
    description: "Stripe可发布密钥 - 用于客户端支付",
    required: false,
    example: "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    getUrl: "https://dashboard.stripe.com/apikeys",
    instructions: ["1. 在Stripe仪表板中复制 'Publishable key'", "2. 这个密钥可以安全地在客户端使用"],
  },

  // Webhook密钥
  STRIPE_WEBHOOK_SECRET: {
    description: "Stripe Webhook密钥 - 用于验证支付回调",
    required: false,
    example: "whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    getUrl: "https://dashboard.stripe.com/webhooks",
    instructions: [
      "1. 在Stripe仪表板中创建Webhook",
      "2. 设置端点URL: https://your-domain.com/api/webhooks/stripe",
      "3. 复制Webhook签名密钥",
    ],
  },

  // 安全密钥
  NEXTAUTH_SECRET: {
    description: "NextAuth.js密钥 - 用于会话加密",
    required: false,
    example: "your-super-secret-nextauth-secret-here",
    getUrl: "自动生成",
    instructions: ["1. 可以使用随机字符串", "2. 或运行: openssl rand -base64 32", "3. 生产环境必须设置此密钥"],
  },

  NEXTAUTH_URL: {
    description: "NextAuth.js URL - 应用的完整URL",
    required: false,
    example: "http://localhost:3000",
    getUrl: "应用URL",
    instructions: ["1. 开发环境: http://localhost:3000", "2. 生产环境: https://your-domain.com"],
  },
}

// 询问用户输入
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim())
    })
  })
}

// 显示API密钥信息
function displayKeyInfo(keyName, config) {
  console.log(`\n🔑 ${keyName}`)
  console.log(`📝 ${config.description}`)
  console.log(`🌐 获取地址: ${config.getUrl}`)
  console.log(`📋 示例: ${config.example}`)
  console.log(`❗ 必需: ${config.required ? "是" : "否"}`)

  if (config.instructions) {
    console.log("📖 获取步骤:")
    config.instructions.forEach((step, index) => {
      console.log(`   ${step}`)
    })
  }
  console.log("-".repeat(60))
}

// 生成随机密钥
function generateRandomSecret(length = 32) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// 主配置流程
async function configureApiKeys() {
  console.log("🚀 开始配置API密钥...")
  console.log("💡 提示: 按回车跳过可选密钥，输入 'skip' 跳过所有剩余密钥\n")

  const envVars = {}

  // 读取现有的环境变量
  if (fs.existsSync(".env.local")) {
    const existingEnv = fs.readFileSync(".env.local", "utf8")
    console.log("📄 发现现有的 .env.local 文件")

    const shouldUpdate = await askQuestion("是否要更新现有配置? (y/n): ")
    if (shouldUpdate.toLowerCase() !== "y") {
      console.log("❌ 配置已取消")
      rl.close()
      return
    }

    // 解析现有环境变量
    existingEnv.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split("=")
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join("=").trim()
      }
    })
  }

  for (const [keyName, config] of Object.entries(apiKeys)) {
    displayKeyInfo(keyName, config)

    const existingValue = envVars[keyName]
    if (existingValue) {
      console.log(`✅ 当前值: ${existingValue.substring(0, 20)}...`)
      const shouldKeep = await askQuestion("保持现有值? (y/n): ")
      if (shouldKeep.toLowerCase() === "y") {
        continue
      }
    }

    let value = ""

    if (keyName === "NEXTAUTH_SECRET" && !existingValue) {
      const shouldGenerate = await askQuestion("自动生成随机密钥? (y/n): ")
      if (shouldGenerate.toLowerCase() === "y") {
        value = generateRandomSecret()
        console.log(`✅ 已生成随机密钥: ${value.substring(0, 20)}...`)
      }
    }

    if (!value) {
      value = await askQuestion(`请输入 ${keyName} (${config.required ? "必需" : "可选"}): `)
    }

    if (value.toLowerCase() === "skip") {
      console.log("⏭️  跳过剩余配置")
      break
    }

    if (value) {
      envVars[keyName] = value
      console.log("✅ 已保存")
    } else if (config.required) {
      console.log("⚠️  这是必需的密钥，建议稍后配置")
    }
  }

  return envVars
}

// 保存环境变量
function saveEnvVars(envVars) {
  // 添加基础环境变量
  const baseEnvVars = {
    NEXT_PUBLIC_BASE_URL: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000",
    CI: "false",
    RECORDING_OUTPUT_DIR: "./public/recordings",
    RECORDING_MAX_DURATION: "300000",
    PLAYWRIGHT_HEADLESS: "false",
    PLAYWRIGHT_TIMEOUT: "30000",
    NODE_ENV: "development",
  }

  const allEnvVars = { ...baseEnvVars, ...envVars }

  const envContent = `# 环境变量配置文件
# 生成时间: ${new Date().toISOString()}
# ⚠️ 注意: 请勿将此文件提交到版本控制系统

# ===========================================
# 基础配置
# ===========================================
${Object.entries(baseEnvVars)
  .map(([key, value]) => `${key}=${value}`)
  .join("\n")}

# ===========================================
# API密钥配置
# ===========================================
${Object.entries(envVars)
  .map(([key, value]) => `${key}=${value}`)
  .join("\n")}

# ===========================================
# 配置说明
# ===========================================
# OPENAI_API_KEY: OpenAI API密钥，用于AI分析和TTS
# BLOB_READ_WRITE_TOKEN: Vercel Blob存储令牌
# SUPABASE_*: Supabase数据库和认证配置
# GITHUB_TOKEN: GitHub API令牌，用于代码分析
# STRIPE_*: Stripe支付配置
# NEXTAUTH_*: NextAuth.js认证配置
# ===========================================
`

  fs.writeFileSync(".env.local", envContent)
  console.log("✅ 环境变量已保存到 .env.local")
}

// 显示配置摘要
function showConfigSummary(envVars) {
  console.log("\n📊 配置摘要:")
  console.log("=" * 50)

  const categories = {
    AI服务: ["OPENAI_API_KEY"],
    存储服务: ["BLOB_READ_WRITE_TOKEN"],
    数据库: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY"],
    代码分析: ["GITHUB_TOKEN"],
    支付服务: ["STRIPE_SECRET_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "STRIPE_WEBHOOK_SECRET"],
    认证服务: ["NEXTAUTH_SECRET", "NEXTAUTH_URL"],
  }

  Object.entries(categories).forEach(([category, keys]) => {
    console.log(`\n📂 ${category}:`)
    keys.forEach((key) => {
      const status = envVars[key] ? "✅ 已配置" : "❌ 未配置"
      console.log(`   ${key}: ${status}`)
    })
  })

  console.log("\n🔧 下一步:")
  console.log("1. 重启开发服务器: npm run dev")
  console.log("2. 测试API连接: npm run check:env")
  console.log("3. 查看功能状态: 访问应用设置页面")
}

// 主函数
async function main() {
  try {
    const envVars = await configureApiKeys()

    if (Object.keys(envVars).length > 0) {
      saveEnvVars(envVars)
      showConfigSummary(envVars)
    } else {
      console.log("❌ 没有配置任何API密钥")
    }

    console.log("\n🎉 API密钥配置完成!")
  } catch (error) {
    console.error("❌ 配置过程中发生错误:", error.message)
  } finally {
    rl.close()
  }
}

// 运行配置
main()
