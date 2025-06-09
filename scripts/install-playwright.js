// Playwright安装和配置脚本
const { execSync } = require("child_process")
const fs = require("fs")
const path = require("path")

console.log("🚀 开始安装Playwright...")

try {
  // 检查Node.js版本
  const nodeVersion = process.version
  console.log(`📋 当前Node.js版本: ${nodeVersion}`)

  const majorVersion = Number.parseInt(nodeVersion.slice(1).split(".")[0])
  if (majorVersion < 16) {
    throw new Error("Playwright需要Node.js 16或更高版本")
  }

  // 1. 安装Playwright包
  console.log("📦 安装Playwright npm包...")
  execSync("npm install playwright", { stdio: "inherit" })

  // 2. 安装浏览器
  console.log("🌐 下载并安装浏览器...")
  execSync("npx playwright install", { stdio: "inherit" })

  // 3. 安装系统依赖（Linux）
  if (process.platform === "linux") {
    console.log("🐧 安装Linux系统依赖...")
    try {
      execSync("npx playwright install-deps", { stdio: "inherit" })
    } catch (error) {
      console.log("⚠️  系统依赖安装可能需要sudo权限，请手动运行: sudo npx playwright install-deps")
    }
  }

  // 4. 创建Playwright配置文件
  console.log("⚙️  创建Playwright配置文件...")
  const playwrightConfig = `
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
`

  fs.writeFileSync("playwright.config.ts", playwrightConfig)

  // 5. 创建测试目录
  const testsDir = "./tests"
  if (!fs.existsSync(testsDir)) {
    fs.mkdirSync(testsDir, { recursive: true })
  }

  // 6. 创建示例测试文件
  const exampleTest = `
import { test, expect } from '@playwright/test';

test('基本页面测试', async ({ page }) => {
  await page.goto('/');
  
  // 检查页面标题
  await expect(page).toHaveTitle(/VideoGen AI/);
  
  // 检查主要元素
  await expect(page.locator('h2')).toContainText('智能视频生成平台');
});

test('录制功能测试', async ({ page }) => {
  await page.goto('/');
  
  // 填写表单
  await page.fill('input[placeholder*="https://"]', 'https://example.com');
  await page.fill('input[placeholder*="显示"]', '测试录制功能');
  
  // 点击生成按钮
  await page.click('button:has-text("开始Playwright录制")');
  
  // 验证录制状态
  await expect(page.locator('text=Playwright录制中')).toBeVisible();
});
`

  fs.writeFileSync(path.join(testsDir, "example.spec.ts"), exampleTest)

  // 7. 更新package.json脚本
  const packageJsonPath = "./package.json"
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))

    if (!packageJson.scripts) {
      packageJson.scripts = {}
    }

    packageJson.scripts["test:playwright"] = "playwright test"
    packageJson.scripts["test:ui"] = "playwright test --ui"
    packageJson.scripts["test:debug"] = "playwright test --debug"

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
    console.log("📝 已更新package.json脚本")
  }

  // 8. 创建录制目录
  const recordingsDir = "./public/recordings"
  if (!fs.existsSync(recordingsDir)) {
    fs.mkdirSync(recordingsDir, { recursive: true })
    console.log("📁 创建录制目录: ./public/recordings")
  }

  // 9. 验证安装
  console.log("🔍 验证Playwright安装...")
  const browsers = execSync("npx playwright --version", { encoding: "utf8" })
  console.log(`✅ Playwright版本: ${browsers.trim()}`)

  // 10. 显示安装完成信息
  console.log("\n🎉 Playwright安装完成！")
  console.log("\n📋 可用命令:")
  console.log("  npm run test:playwright  - 运行测试")
  console.log("  npm run test:ui         - 运行UI模式测试")
  console.log("  npm run test:debug      - 调试模式测试")
  console.log("  npx playwright codegen  - 录制测试代码")
  console.log("\n🌐 支持的浏览器:")
  console.log("  ✅ Chromium (Chrome/Edge)")
  console.log("  ✅ Firefox")
  console.log("  ✅ WebKit (Safari)")

  console.log("\n🎬 录制功能已准备就绪！")
  console.log("📁 录制文件将保存到: ./public/recordings")
} catch (error) {
  console.error("❌ 安装失败:", error.message)

  // 提供故障排除建议
  console.log("\n🔧 故障排除建议:")
  console.log("1. 确保Node.js版本 >= 16")
  console.log("2. 检查网络连接（需要下载浏览器）")
  console.log("3. 在Linux上可能需要安装系统依赖:")
  console.log("   sudo npx playwright install-deps")
  console.log("4. 如果网络较慢，可以设置镜像:")
  console.log("   export PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright")

  process.exit(1)
}
