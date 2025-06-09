import { chromium, type Browser, type Page, type BrowserContext } from "playwright"
import { mkdirSync, existsSync } from "fs"
import { join } from "path"

export interface RecordingConfig {
  url: string
  task: string
  mode: "url-only" | "url-prompt" | "code-aware"
  aspectRatio: string
  workflow?: string
  elements?: string
  github?: string
  outputPath?: string
  duration?: number
}

export interface RecordingResult {
  videoPath: string
  screenshots: string[]
  duration: number
  steps: string[]
  success: boolean
  error?: string
}

export class PlaywrightRecorder {
  private browser: Browser | null = null
  private context: BrowserContext | null = null
  private page: Page | null = null
  private outputDir: string

  constructor(outputDir = "./recordings") {
    this.outputDir = outputDir
    this.ensureOutputDir()
  }

  private ensureOutputDir() {
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true })
    }
  }

  async initialize() {
    try {
      console.log("🚀 启动浏览器...")
      this.browser = await chromium.launch({
        headless: true, // 设为false可以看到浏览器操作
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      })

      // 根据宽高比设置视口
      const viewport = this.getViewportFromAspectRatio("16:9")

      this.context = await this.browser.newContext({
        viewport,
        recordVideo: {
          dir: this.outputDir,
          size: viewport,
        },
      })

      this.page = await this.context.newPage()
      console.log("✅ 浏览器初始化完成")
      return true
    } catch (error) {
      console.error("❌ 浏览器初始化失败:", error)
      return false
    }
  }

  private getViewportFromAspectRatio(aspectRatio: string) {
    const ratios: Record<string, { width: number; height: number }> = {
      "16:9": { width: 1920, height: 1080 },
      "4:3": { width: 1024, height: 768 },
      "1:1": { width: 1080, height: 1080 },
      "9:16": { width: 1080, height: 1920 },
      "21:9": { width: 2560, height: 1080 },
    }
    return ratios[aspectRatio] || ratios["16:9"]
  }

  async recordWebsite(config: RecordingConfig): Promise<RecordingResult> {
    if (!this.page) {
      throw new Error("浏览器未初始化")
    }

    const steps: string[] = []
    const screenshots: string[] = []
    const startTime = Date.now()

    try {
      console.log(`📹 开始录制网站: ${config.url}`)
      steps.push("开始录制")

      // 验证URL格式
      try {
        new URL(config.url)
      } catch (urlError) {
        throw new Error(`无效的URL格式: ${config.url}`)
      }

      // 导航到目标网站，增加更多的错误处理
      console.log("🌐 导航到目标网站...")
      try {
        await this.page.goto(config.url, {
          waitUntil: "domcontentloaded", // 改为更宽松的等待条件
          timeout: 30000,
        })
        steps.push(`成功导航到 ${config.url}`)
      } catch (navigationError) {
        console.error("导航失败:", navigationError)
        // 尝试更宽松的导航
        await this.page.goto(config.url, {
          waitUntil: "load",
          timeout: 15000,
        })
        steps.push(`导航到 ${config.url} (使用备用方法)`)
      }

      // 等待页面稳定
      await this.page.waitForTimeout(3000)

      // 检查页面是否加载成功
      const title = await this.page.title()
      if (title) {
        steps.push(`页面加载成功: ${title}`)
      }

      // 截图
      try {
        const screenshotPath = join(this.outputDir, `screenshot-${Date.now()}.png`)
        await this.page.screenshot({ path: screenshotPath, fullPage: false }) // 改为不截取全页
        screenshots.push(screenshotPath)
        steps.push("页面截图完成")
      } catch (screenshotError) {
        console.log("截图失败:", screenshotError)
        steps.push("截图失败，继续录制")
      }

      // 根据模式执行不同的录制策略
      await this.executeRecordingStrategy(config, steps, screenshots)

      // 等待录制完成
      await this.page.waitForTimeout(2000)
      steps.push("录制完成")

      const duration = Date.now() - startTime
      console.log(`✅ 录制完成，耗时: ${duration}ms`)

      return {
        videoPath: await this.getVideoPath(),
        screenshots,
        duration,
        steps,
        success: true,
      }
    } catch (error) {
      console.error("❌ 录制失败:", error)
      const duration = Date.now() - startTime

      // 提供更详细的错误信息
      let errorMessage = "录制过程中发生未知错误"
      if (error instanceof Error) {
        if (error.message.includes("net::ERR_NAME_NOT_RESOLVED")) {
          errorMessage = "无法解析域名，请检查URL是否正确"
        } else if (error.message.includes("net::ERR_CONNECTION_REFUSED")) {
          errorMessage = "连接被拒绝，目标网站可能无法访问"
        } else if (error.message.includes("timeout")) {
          errorMessage = "操作超时，网站响应过慢"
        } else {
          errorMessage = error.message
        }
      }

      return {
        videoPath: "",
        screenshots,
        duration,
        steps: [...steps, `错误: ${errorMessage}`],
        success: false,
        error: errorMessage,
      }
    }
  }

  private async executeRecordingStrategy(config: RecordingConfig, steps: string[], screenshots: string[]) {
    if (!this.page) return

    switch (config.mode) {
      case "url-only":
        await this.urlOnlyStrategy(config, steps, screenshots)
        break
      case "url-prompt":
        await this.urlPromptStrategy(config, steps, screenshots)
        break
      case "code-aware":
        await this.codeAwareStrategy(config, steps, screenshots)
        break
    }
  }

  private async urlOnlyStrategy(config: RecordingConfig, steps: string[], screenshots: string[]) {
    if (!this.page) return

    console.log("🔍 执行URL-Only模式录制...")

    // 自动发现可交互元素
    const interactiveElements = await this.page.$$eval(
      'button, a, input[type="submit"], [role="button"], .btn',
      (elements) =>
        elements.map((el) => ({
          tagName: el.tagName,
          text: el.textContent?.trim() || "",
          id: el.id,
          className: el.className,
        })),
    )

    steps.push(`发现 ${interactiveElements.length} 个可交互元素`)

    // 模拟用户交互
    for (let i = 0; i < Math.min(3, interactiveElements.length); i++) {
      try {
        const selector = this.buildSelector(interactiveElements[i])
        const element = await this.page.$(selector)

        if (element) {
          await element.scrollIntoViewIfNeeded()
          await this.page.waitForTimeout(1000)

          // 截图
          const screenshotPath = join(this.outputDir, `interaction-${i}-${Date.now()}.png`)
          await this.page.screenshot({ path: screenshotPath })
          screenshots.push(screenshotPath)

          await element.click()
          await this.page.waitForTimeout(2000)
          steps.push(`点击元素: ${interactiveElements[i].text || interactiveElements[i].tagName}`)
        }
      } catch (error) {
        console.log(`跳过元素 ${i}:`, error)
      }
    }
  }

  private async urlPromptStrategy(config: RecordingConfig, steps: string[], screenshots: string[]) {
    if (!this.page) return

    console.log("🎯 执行URL+Prompt模式录制...")

    // 解析工作流提示
    const workflowSteps = config.workflow?.split("→").map((s) => s.trim()) || []
    steps.push(`解析工作流: ${workflowSteps.length} 个步骤`)

    // 解析关键元素
    let keyElements: Record<string, string> = {}
    try {
      if (config.elements) {
        keyElements = JSON.parse(config.elements)
        steps.push(`解析关键元素: ${Object.keys(keyElements).length} 个`)
      }
    } catch (error) {
      console.log("关键元素解析失败:", error)
    }

    // 执行工作流步骤
    for (let i = 0; i < workflowSteps.length; i++) {
      const step = workflowSteps[i]
      console.log(`执行步骤 ${i + 1}: ${step}`)

      try {
        // 尝试根据步骤描述找到对应的元素
        await this.executeWorkflowStep(step, keyElements, steps, screenshots)
        await this.page.waitForTimeout(2000)
      } catch (error) {
        console.log(`步骤 ${i + 1} 执行失败:`, error)
        steps.push(`步骤 ${i + 1} 执行失败: ${step}`)
      }
    }
  }

  private async codeAwareStrategy(config: RecordingConfig, steps: string[], screenshots: string[]) {
    if (!this.page) return

    console.log("🔬 执行Code-Aware模式录制...")

    // 这里可以集成GitHub API来分析测试文件
    // 暂时使用智能元素检测

    // 查找测试ID和数据属性
    const testElements = await this.page.$$eval("[data-testid], [data-test], [data-cy], [test-id]", (elements) =>
      elements.map((el) => ({
        selector: this.getTestSelector(el),
        text: el.textContent?.trim() || "",
        type: el.tagName.toLowerCase(),
      })),
    )

    steps.push(`发现 ${testElements.length} 个测试元素`)

    // 按优先级执行交互
    for (const element of testElements.slice(0, 5)) {
      try {
        await this.page.click(element.selector)
        await this.page.waitForTimeout(1500)

        const screenshotPath = join(this.outputDir, `test-element-${Date.now()}.png`)
        await this.page.screenshot({ path: screenshotPath })
        screenshots.push(screenshotPath)

        steps.push(`测试元素交互: ${element.text || element.type}`)
      } catch (error) {
        console.log(`测试元素交互失败:`, error)
      }
    }
  }

  private buildSelector(element: any): string {
    if (element.id) return `#${element.id}`
    if (element.className) {
      const classes = element.className.split(" ").filter((c: string) => c.length > 0)
      if (classes.length > 0) return `.${classes[0]}`
    }
    return element.tagName.toLowerCase()
  }

  private async executeWorkflowStep(
    step: string,
    keyElements: Record<string, string>,
    steps: string[],
    screenshots: string[],
  ) {
    if (!this.page) return

    const stepLower = step.toLowerCase()

    // 根据步骤描述匹配关键元素
    for (const [name, selector] of Object.entries(keyElements)) {
      if (stepLower.includes(name.toLowerCase())) {
        try {
          await this.page.click(selector)
          steps.push(`执行: ${step} (使用选择器: ${selector})`)

          const screenshotPath = join(this.outputDir, `workflow-${Date.now()}.png`)
          await this.page.screenshot({ path: screenshotPath })
          screenshots.push(screenshotPath)
          return
        } catch (error) {
          console.log(`选择器 ${selector} 执行失败:`, error)
        }
      }
    }

    // 如果没有匹配的关键元素，尝试智能匹配
    await this.smartElementMatch(step, steps, screenshots)
  }

  private async smartElementMatch(step: string, steps: string[], screenshots: string[]) {
    if (!this.page) return

    const stepLower = step.toLowerCase()

    // 常见操作关键词匹配
    const actionMap: Record<string, string[]> = {
      点击: ["button", "a", '[role="button"]', ".btn"],
      填写: ["input", "textarea"],
      选择: ["select", '[role="option"]'],
      提交: ['input[type="submit"]', 'button[type="submit"]', ".submit"],
      登录: [".login", ".signin", "#login", "#signin"],
      注册: [".register", ".signup", "#register", "#signup"],
    }

    for (const [action, selectors] of Object.entries(actionMap)) {
      if (stepLower.includes(action)) {
        for (const selector of selectors) {
          try {
            const element = await this.page.$(selector)
            if (element) {
              await element.click()
              steps.push(`智能匹配执行: ${step}`)

              const screenshotPath = join(this.outputDir, `smart-match-${Date.now()}.png`)
              await this.page.screenshot({ path: screenshotPath })
              screenshots.push(screenshotPath)
              return
            }
          } catch (error) {
            continue
          }
        }
      }
    }
  }

  private async getVideoPath(): Promise<string> {
    if (!this.page) return ""

    try {
      const video = this.page.video()
      if (video) {
        return await video.path()
      }
    } catch (error) {
      console.log("获取视频路径失败:", error)
    }
    return ""
  }

  async cleanup() {
    try {
      if (this.context) {
        await this.context.close()
      }
      if (this.browser) {
        await this.browser.close()
      }
      console.log("🧹 清理完成")
    } catch (error) {
      console.error("清理失败:", error)
    }
  }
}

// 辅助函数
function getTestSelector(element: Element): string {
  const testId =
    element.getAttribute("data-testid") ||
    element.getAttribute("data-test") ||
    element.getAttribute("data-cy") ||
    element.getAttribute("test-id")

  if (testId) {
    return `[data-testid="${testId}"], [data-test="${testId}"], [data-cy="${testId}"], [test-id="${testId}"]`
  }

  return element.tagName.toLowerCase()
}
