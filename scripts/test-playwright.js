// 测试Playwright功能的脚本
const { chromium } = require("playwright")

async function testPlaywright() {
  console.log("🧪 测试Playwright功能...")

  let browser
  try {
    // 启动浏览器
    console.log("🚀 启动Chromium浏览器...")
    browser = await chromium.launch({
      headless: false, // 显示浏览器窗口
      slowMo: 1000, // 慢动作演示
    })

    // 创建页面
    const page = await browser.newPage()

    // 设置视口
    await page.setViewportSize({ width: 1920, height: 1080 })

    // 导航到示例网站
    console.log("🌐 导航到示例网站...")
    await page.goto("https://example.com")

    // 等待页面加载
    await page.waitForLoadState("networkidle")

    // 截图
    console.log("📸 截取页面截图...")
    await page.screenshot({
      path: "./public/recordings/test-screenshot.png",
      fullPage: true,
    })

    // 获取页面标题
    const title = await page.title()
    console.log(`📄 页面标题: ${title}`)

    // 查找元素
    const heading = await page.locator("h1").textContent()
    console.log(`📝 主标题: ${heading}`)

    // 模拟用户交互
    console.log("🖱️  模拟用户交互...")
    await page.hover("h1")
    await page.waitForTimeout(1000)

    console.log("✅ Playwright功能测试成功！")
    console.log("📁 截图已保存到: ./public/recordings/test-screenshot.png")
  } catch (error) {
    console.error("❌ 测试失败:", error.message)
    throw error
  } finally {
    if (browser) {
      await browser.close()
      console.log("🔒 浏览器已关闭")
    }
  }
}

// 运行测试
testPlaywright().catch((error) => {
  console.error("💥 测试过程中发生错误:", error)
  process.exit(1)
})
