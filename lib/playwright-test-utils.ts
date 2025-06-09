// Playwright测试工具函数
import { type Page, type Browser, chromium, firefox, webkit } from "playwright"

export interface RecordingOptions {
  url: string
  outputPath: string
  duration?: number
  viewport?: { width: number; height: number }
  browser?: "chromium" | "firefox" | "webkit"
  headless?: boolean
}

export class PlaywrightTestUtils {
  private browser: Browser | null = null
  private page: Page | null = null

  async initialize(options: RecordingOptions) {
    console.log(`🚀 初始化${options.browser || "chromium"}浏览器...`)

    // 选择浏览器
    const browserType = options.browser || "chromium"
    switch (browserType) {
      case "firefox":
        this.browser = await firefox.launch({ headless: options.headless ?? true })
        break
      case "webkit":
        this.browser = await webkit.launch({ headless: options.headless ?? true })
        break
      default:
        this.browser = await chromium.launch({ headless: options.headless ?? true })
    }

    // 创建页面
    this.page = await this.browser.newPage()

    // 设置视口
    if (options.viewport) {
      await this.page.setViewportSize(options.viewport)
    }

    console.log("✅ 浏览器初始化完成")
    return this.page
  }

  async navigateAndWait(url: string) {
    if (!this.page) throw new Error("页面未初始化")

    console.log(`🌐 导航到: ${url}`)
    await this.page.goto(url, { waitUntil: "networkidle" })

    // 等待页面稳定
    await this.page.waitForTimeout(2000)

    console.log("✅ 页面加载完成")
  }

  async takeScreenshot(path: string) {
    if (!this.page) throw new Error("页面未初始化")

    await this.page.screenshot({
      path,
      fullPage: true,
      type: "png",
    })

    console.log(`📸 截图已保存: ${path}`)
  }

  async findInteractiveElements() {
    if (!this.page) throw new Error("页面未初始化")

    const elements = await this.page.$$eval(
      'button, a, input[type="submit"], [role="button"], .btn, [data-testid]',
      (elements) =>
        elements.map((el) => ({
          tagName: el.tagName,
          text: el.textContent?.trim() || "",
          id: el.id,
          className: el.className,
          testId: el.getAttribute("data-testid"),
          href: el.getAttribute("href"),
          type: el.getAttribute("type"),
        })),
    )

    console.log(`🔍 发现 ${elements.length} 个可交互元素`)
    return elements
  }

  async simulateUserFlow(steps: string[]) {
    if (!this.page) throw new Error("页面未初始化")

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      console.log(`📝 执行步骤 ${i + 1}: ${step}`)

      try {
        // 这里可以根据步骤描述执行相应的操作
        // 例如: 点击、填写、滚动等
        await this.page.waitForTimeout(1000)

        // 截图记录每个步骤
        await this.takeScreenshot(`./public/recordings/step-${i + 1}.png`)
      } catch (error) {
        console.log(`⚠️  步骤 ${i + 1} 执行失败: ${error}`)
      }
    }
  }

  async cleanup() {
    if (this.page) {
      await this.page.close()
      this.page = null
    }

    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }

    console.log("🧹 清理完成")
  }

  // 静态方法：检查Playwright是否已安装
  static async checkInstallation() {
    try {
      const browser = await chromium.launch({ headless: true })
      await browser.close()
      return true
    } catch (error) {
      return false
    }
  }

  // 静态方法：获取已安装的浏览器
  static async getInstalledBrowsers() {
    const browsers = []

    try {
      const chromiumBrowser = await chromium.launch({ headless: true })
      await chromiumBrowser.close()
      browsers.push("chromium")
    } catch (error) {
      console.log("Chromium未安装")
    }

    try {
      const firefoxBrowser = await firefox.launch({ headless: true })
      await firefoxBrowser.close()
      browsers.push("firefox")
    } catch (error) {
      console.log("Firefox未安装")
    }

    try {
      const webkitBrowser = await webkit.launch({ headless: true })
      await webkitBrowser.close()
      browsers.push("webkit")
    } catch (error) {
      console.log("WebKit未安装")
    }

    return browsers
  }
}
