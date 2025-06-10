import { chromium, type Browser, type Page, type BrowserContext } from "playwright"
import type { EnvironmentCapabilities } from "./environment-detector"
import path from "path"
import fs from "fs/promises"

export interface RecordingOptions {
  url: string
  viewport: { width: number; height: number }
  outputDir: string
  timeout?: number
}

export interface PlaywrightAction {
  type: "click" | "fill" | "select" | "wait" | "scroll" | "hover" | "screenshot"
  selector?: string
  value?: string
  timeout?: number
  description: string
}

export class PlaywrightRecorder {
  private browser: Browser | null = null
  private context: BrowserContext | null = null
  private page: Page | null = null
  private capabilities: EnvironmentCapabilities

  constructor(capabilities: EnvironmentCapabilities) {
    this.capabilities = capabilities
  }

  async initialize(options: RecordingOptions): Promise<void> {
    if (!this.capabilities.canRecord) {
      throw new Error("Playwright recording not supported in this environment")
    }

    console.log("🎬 Initializing Playwright browser...")

    // 确保输出目录存在
    await fs.mkdir(options.outputDir, { recursive: true })

    // 启动浏览器
    const launchOptions: any = {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
      ],
    }

    // Docker环境中使用系统Chromium
    if (this.capabilities.isDocker) {
      launchOptions.executablePath = "/usr/bin/chromium-browser"
    }

    this.browser = await chromium.launch(launchOptions)

    // 创建上下文并启用视频录制
    this.context = await this.browser.newContext({
      viewport: options.viewport,
      recordVideo: {
        dir: options.outputDir,
        size: options.viewport,
      },
      recordHar: {
        path: path.join(options.outputDir, "recording.har"),
      },
    })

    this.page = await this.context.newPage()

    // 设置超时
    this.page.setDefaultTimeout(options.timeout || 30000)
    this.page.setDefaultNavigationTimeout(options.timeout || 30000)
  }

  async navigateToUrl(url: string): Promise<void> {
    if (!this.page) {
      throw new Error("Recorder not initialized")
    }

    console.log("🌐 Navigating to:", url)
    await this.page.goto(url, { waitUntil: "networkidle", timeout: 30000 })
    await this.page.waitForTimeout(2000)
  }

  async analyzePage(): Promise<any> {
    if (!this.page) {
      throw new Error("Recorder not initialized")
    }

    console.log("🔍 Analyzing page structure...")

    const analysis = await this.page.evaluate(() => {
      const elements = {
        buttons: Array.from(document.querySelectorAll("button, input[type='button'], input[type='submit']")).map(
          (el) => ({
            text: el.textContent?.trim() || "",
            id: el.id,
            className: el.className,
            type: el.tagName.toLowerCase(),
            testId: el.getAttribute("data-testid") || el.getAttribute("data-test") || "",
            visible: el.offsetParent !== null,
          }),
        ),
        inputs: Array.from(document.querySelectorAll("input, textarea, select")).map((el) => ({
          type: (el as HTMLInputElement).type || "text",
          placeholder: (el as HTMLInputElement).placeholder || "",
          id: el.id,
          name: (el as HTMLInputElement).name || "",
          className: el.className,
          testId: el.getAttribute("data-testid") || el.getAttribute("data-test") || "",
          visible: el.offsetParent !== null,
        })),
        links: Array.from(document.querySelectorAll("a")).map((el) => ({
          text: el.textContent?.trim() || "",
          href: el.href,
          id: el.id,
          className: el.className,
          testId: el.getAttribute("data-testid") || el.getAttribute("data-test") || "",
          visible: el.offsetParent !== null,
        })),
        forms: Array.from(document.querySelectorAll("form")).map((el) => ({
          id: el.id,
          className: el.className,
          action: el.action,
          method: el.method,
        })),
      }

      return {
        title: document.title,
        url: window.location.href,
        elements,
        hasLoginForm: elements.inputs.some((input) => input.type === "password"),
        hasSearchBox: elements.inputs.some(
          (input) => input.type === "search" || input.placeholder.toLowerCase().includes("search"),
        ),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      }
    })

    return analysis
  }

  async executeActions(actions: PlaywrightAction[]): Promise<void> {
    if (!this.page) {
      throw new Error("Recorder not initialized")
    }

    console.log("🎭 Executing", actions.length, "actions...")

    for (let i = 0; i < actions.length; i++) {
      const action = actions[i]
      try {
        console.log(`Executing action ${i + 1}/${actions.length}: ${action.description}`)

        switch (action.type) {
          case "click":
            await this.executeClick(action)
            break
          case "fill":
            await this.executeFill(action)
            break
          case "select":
            await this.executeSelect(action)
            break
          case "wait":
            await this.executeWait(action)
            break
          case "scroll":
            await this.executeScroll(action)
            break
          case "hover":
            await this.executeHover(action)
            break
          case "screenshot":
            await this.executeScreenshot(action, i)
            break
        }
      } catch (error) {
        console.error(`Action failed: ${action.description}`, error)
        // 继续执行下一个动作
      }
    }
  }

  private async executeClick(action: PlaywrightAction): Promise<void> {
    if (!action.selector || !this.page) return

    const selectors = action.selector.split(", ")
    let clicked = false

    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector.trim()).first()
        if (await element.isVisible({ timeout: 5000 })) {
          await element.click({ timeout: 10000 })
          clicked = true
          console.log(`✅ Clicked: ${selector.trim()}`)
          break
        }
      } catch (e) {
        continue
      }
    }

    if (!clicked) {
      console.log(`❌ Could not click any element: ${action.selector}`)
    }

    await this.page.waitForTimeout(1500)
  }

  private async executeFill(action: PlaywrightAction): Promise<void> {
    if (!action.selector || !action.value || !this.page) return

    const selectors = action.selector.split(", ")
    let filled = false

    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector.trim()).first()
        if (await element.isVisible({ timeout: 5000 })) {
          await element.fill(action.value, { timeout: 10000 })
          filled = true
          console.log(`✅ Filled: ${selector.trim()} = ${action.value}`)
          break
        }
      } catch (e) {
        continue
      }
    }

    if (!filled) {
      console.log(`❌ Could not fill any element: ${action.selector}`)
    }

    await this.page.waitForTimeout(1000)
  }

  private async executeSelect(action: PlaywrightAction): Promise<void> {
    if (!action.selector || !action.value || !this.page) return

    try {
      await this.page.selectOption(action.selector, action.value, { timeout: 10000 })
      console.log(`✅ Selected: ${action.selector} = ${action.value}`)
    } catch (e) {
      console.log(`❌ Select failed: ${action.selector}`)
    }

    await this.page.waitForTimeout(500)
  }

  private async executeWait(action: PlaywrightAction): Promise<void> {
    const timeout = action.timeout || 2000
    await this.page?.waitForTimeout(timeout)
    console.log(`⏱️ Waited: ${timeout}ms`)
  }

  private async executeScroll(action: PlaywrightAction): Promise<void> {
    if (!this.page) return

    try {
      if (action.selector && action.selector !== "body") {
        await this.page.locator(action.selector).scrollIntoViewIfNeeded()
        console.log(`📜 Scrolled to: ${action.selector}`)
      } else {
        await this.page.evaluate(() => window.scrollBy(0, 500))
        console.log("📜 Scrolled page down")
      }
    } catch (e) {
      console.log(`❌ Scroll failed: ${action.selector}`)
    }

    await this.page.waitForTimeout(1000)
  }

  private async executeHover(action: PlaywrightAction): Promise<void> {
    if (!action.selector || !this.page) return

    try {
      await this.page.hover(action.selector, { timeout: 10000 })
      console.log(`🎯 Hovered: ${action.selector}`)
    } catch (e) {
      console.log(`❌ Hover failed: ${action.selector}`)
    }

    await this.page.waitForTimeout(500)
  }

  private async executeScreenshot(action: PlaywrightAction, index: number): Promise<void> {
    if (!this.page) return

    try {
      await this.page.screenshot({
        path: path.join("/tmp/videos", `screenshot-${index}.png`),
        fullPage: true,
      })
      console.log(`📸 Screenshot taken: ${index}`)
    } catch (e) {
      console.log("❌ Screenshot failed")
    }

    await this.page.waitForTimeout(1000)
  }

  async getVideoPath(): Promise<string | null> {
    if (!this.page) return null

    const videoPath = await this.page.video()?.path()
    return videoPath || null
  }

  async close(): Promise<string | null> {
    let videoPath: string | null = null

    try {
      if (this.page) {
        videoPath = await this.page.video()?.path()
        await this.page.close()
      }

      if (this.context) {
        await this.context.close()
      }

      if (this.browser) {
        await this.browser.close()
      }

      console.log("✅ Playwright recorder closed")
      return videoPath
    } catch (error) {
      console.error("❌ Error closing recorder:", error)
      return videoPath
    }
  }
}
