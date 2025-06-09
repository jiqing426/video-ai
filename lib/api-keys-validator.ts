// API密钥验证器
export interface ApiKeyStatus {
  name: string
  configured: boolean
  valid?: boolean
  error?: string
  required: boolean
  category: string
}

export interface ValidationResult {
  overall: "valid" | "partial" | "invalid"
  categories: Record<string, ApiKeyStatus[]>
  summary: {
    total: number
    configured: number
    valid: number
    required: number
    requiredConfigured: number
  }
}

// 验证OpenAI API密钥
async function validateOpenAI(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (response.ok) {
      return { valid: true }
    } else {
      return { valid: false, error: `HTTP ${response.status}: ${response.statusText}` }
    }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : "网络错误" }
  }
}

// 验证Supabase连接
async function validateSupabase(url: string, anonKey: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    })

    if (response.status === 200 || response.status === 404) {
      return { valid: true }
    } else {
      return { valid: false, error: `HTTP ${response.status}` }
    }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : "连接错误" }
  }
}

// 验证GitHub令牌
async function validateGitHub(token: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${token}`,
      },
    })

    if (response.ok) {
      return { valid: true }
    } else {
      return { valid: false, error: `HTTP ${response.status}` }
    }
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : "网络错误" }
  }
}

// 主验证函数
export async function validateApiKeys(): Promise<ValidationResult> {
  const apiKeys: Record<
    string,
    { required: boolean; category: string; validator?: (key: string) => Promise<{ valid: boolean; error?: string }> }
  > = {
    OPENAI_API_KEY: {
      required: true,
      category: "AI服务",
      validator: validateOpenAI,
    },
    BLOB_READ_WRITE_TOKEN: {
      required: true,
      category: "存储服务",
    },
    NEXT_PUBLIC_SUPABASE_URL: {
      required: false,
      category: "数据库",
    },
    NEXT_PUBLIC_SUPABASE_ANON_KEY: {
      required: false,
      category: "数据库",
    },
    SUPABASE_SERVICE_ROLE_KEY: {
      required: false,
      category: "数据库",
    },
    GITHUB_TOKEN: {
      required: false,
      category: "代码分析",
      validator: validateGitHub,
    },
    STRIPE_SECRET_KEY: {
      required: false,
      category: "支付服务",
    },
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
      required: false,
      category: "支付服务",
    },
    STRIPE_WEBHOOK_SECRET: {
      required: false,
      category: "支付服务",
    },
    NEXTAUTH_SECRET: {
      required: false,
      category: "认证服务",
    },
    NEXTAUTH_URL: {
      required: false,
      category: "认证服务",
    },
  }

  const categories: Record<string, ApiKeyStatus[]> = {}
  let totalConfigured = 0
  let totalValid = 0
  let requiredConfigured = 0

  for (const [keyName, config] of Object.entries(apiKeys)) {
    const value = process.env[keyName]
    const configured = !!value

    if (configured) {
      totalConfigured++
      if (config.required) {
        requiredConfigured++
      }
    }

    let valid: boolean | undefined
    let error: string | undefined

    // 如果配置了密钥且有验证器，则进行验证
    if (configured && config.validator && value) {
      try {
        const result = await config.validator(value)
        valid = result.valid
        error = result.error
        if (valid) {
          totalValid++
        }
      } catch (err) {
        valid = false
        error = err instanceof Error ? err.message : "验证失败"
      }
    } else if (configured) {
      // 没有验证器的情况下，认为配置即有效
      valid = true
      totalValid++
    }

    const status: ApiKeyStatus = {
      name: keyName,
      configured,
      valid,
      error,
      required: config.required,
      category: config.category,
    }

    if (!categories[config.category]) {
      categories[config.category] = []
    }
    categories[config.category].push(status)
  }

  const requiredKeys = Object.values(apiKeys).filter((k) => k.required).length
  const overall: "valid" | "partial" | "invalid" =
    requiredConfigured === requiredKeys ? "valid" : requiredConfigured > 0 ? "partial" : "invalid"

  return {
    overall,
    categories,
    summary: {
      total: Object.keys(apiKeys).length,
      configured: totalConfigured,
      valid: totalValid,
      required: requiredKeys,
      requiredConfigured,
    },
  }
}

// 打印验证结果
export function printValidationResult(result: ValidationResult) {
  console.log("🔍 API密钥验证结果:")
  console.log("=" * 50)

  Object.entries(result.categories).forEach(([category, keys]) => {
    console.log(`\n📂 ${category}:`)
    keys.forEach((key) => {
      const icon = key.configured ? (key.valid ? "✅" : "⚠️ ") : key.required ? "❌" : "⭕"

      const status = key.configured
        ? key.valid
          ? "已配置且有效"
          : `已配置但${key.error || "验证失败"}`
        : key.required
          ? "未配置 (必需)"
          : "未配置 (可选)"

      console.log(`   ${icon} ${key.name}: ${status}`)
    })
  })

  console.log(`\n📊 总结:`)
  console.log(`   总计: ${result.summary.total} 个密钥`)
  console.log(`   已配置: ${result.summary.configured} 个`)
  console.log(`   有效: ${result.summary.valid} 个`)
  console.log(`   必需: ${result.summary.required} 个`)
  console.log(`   必需已配置: ${result.summary.requiredConfigured} 个`)

  const overallStatus = {
    valid: "🎉 所有必需的API密钥都已正确配置",
    partial: "⚠️  部分必需的API密钥未配置",
    invalid: "❌ 缺少必需的API密钥",
  }

  console.log(`\n${overallStatus[result.overall]}`)

  if (result.overall !== "valid") {
    console.log("\n🔧 建议:")
    console.log("1. 运行 node scripts/setup-api-keys.js 配置缺少的密钥")
    console.log("2. 检查密钥格式是否正确")
    console.log("3. 确认API服务是否可用")
  }
}
