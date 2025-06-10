import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface GeneratedAction {
  type: "click" | "fill" | "select" | "wait" | "scroll" | "hover" | "screenshot"
  selector?: string
  value?: string
  timeout?: number
  description: string
  reasoning: string
}

export async function generateActionsFromAI(
  url: string,
  task: string,
  mode: "url-only" | "url-prompt" | "code-aware",
  pageAnalysis: any,
  workflow?: string,
  elements?: string,
  githubRepo?: string,
): Promise<GeneratedAction[]> {
  try {
    console.log("🤖 Generating AI actions for:", { url, task, mode })

    const systemPrompt = `You are an expert web automation specialist. Your job is to generate precise Playwright actions to accomplish user tasks on websites.

IMPORTANT RULES:
1. Generate realistic, executable actions based on the actual page structure
2. Use multiple selector strategies for reliability: data-testid > semantic tags > text content > CSS classes
3. Always include reasoning for each action
4. Focus on the user's specific task
5. Generate 3-8 meaningful actions (not just basic navigation)

Page Analysis:
${JSON.stringify(pageAnalysis, null, 2)}

Available Action Types:
- click: Click on buttons, links, or interactive elements
- fill: Fill input fields with realistic data
- select: Select options from dropdowns
- wait: Wait for elements or page loads
- scroll: Scroll to reveal content
- hover: Hover over elements to reveal menus
- screenshot: Capture important moments

Selector Strategy Priority:
1. data-testid, data-test attributes (95% reliability)
2. Semantic HTML tags with specific attributes (85% reliability)  
3. Text content matching (70% reliability)
4. CSS classes and IDs (50% reliability)
5. Position-based selectors (30% reliability)

Return a JSON array of actions with this structure:
{
  "type": "action_type",
  "selector": "css_selector_with_fallbacks",
  "value": "input_value_if_needed", 
  "timeout": 5000,
  "description": "Human readable description",
  "reasoning": "Why this action is needed"
}`

    let userPrompt = `Website: ${url}
Task: ${task}
Mode: ${mode}

Generate specific actions to accomplish this task on the given website.`

    // 根据模式添加额外信息
    if (mode === "url-prompt" && workflow) {
      userPrompt += `\n\nWorkflow Hint: ${workflow}`
    }

    if (mode === "url-prompt" && elements) {
      userPrompt += `\n\nKey Elements: ${elements}`
    }

    if (mode === "code-aware" && githubRepo) {
      userPrompt += `\n\nGitHub Repository: ${githubRepo}
Please analyze the codebase structure to better understand the UI components and their selectors.`
    }

    // 基于页面分析生成更具体的提示
    if (pageAnalysis?.elements) {
      userPrompt += `\n\nDetected Page Elements:
- Buttons: ${pageAnalysis.elements.buttons?.length || 0} found
- Inputs: ${pageAnalysis.elements.inputs?.length || 0} found  
- Links: ${pageAnalysis.elements.links?.length || 0} found
- Forms: ${pageAnalysis.elements.forms?.length || 0} found`

      if (pageAnalysis.elements.buttons?.length > 0) {
        userPrompt += `\n\nAvailable Buttons: ${pageAnalysis.elements.buttons
          .slice(0, 5)
          .map((btn: any) => btn.text || btn.id || btn.className)
          .join(", ")}`
      }

      if (pageAnalysis.elements.inputs?.length > 0) {
        userPrompt += `\n\nAvailable Inputs: ${pageAnalysis.elements.inputs
          .slice(0, 5)
          .map((input: any) => input.placeholder || input.name || input.type)
          .join(", ")}`
      }
    }

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.3, // 降低随机性，提高一致性
    })

    console.log("🤖 AI Response:", text)

    // 解析AI响应
    let actions: GeneratedAction[]
    try {
      // 尝试直接解析JSON
      actions = JSON.parse(text)
    } catch (parseError) {
      console.log("Failed to parse as direct JSON, trying to extract JSON from text")

      // 尝试从文本中提取JSON
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        actions = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("Could not extract valid JSON from AI response")
      }
    }

    // 验证和清理actions
    const validActions = actions
      .filter(
        (action) =>
          action.type &&
          action.description &&
          ["click", "fill", "select", "wait", "scroll", "hover", "screenshot"].includes(action.type),
      )
      .map((action) => ({
        ...action,
        timeout: action.timeout || 5000,
        reasoning: action.reasoning || "AI generated action",
      }))

    console.log("✅ Generated", validActions.length, "valid actions")
    return validActions
  } catch (error) {
    console.error("❌ AI action generation failed:", error)

    // 返回基于页面分析的fallback actions
    return generateFallbackActions(task, pageAnalysis)
  }
}

function generateFallbackActions(task: string, pageAnalysis: any): GeneratedAction[] {
  const actions: GeneratedAction[] = [
    {
      type: "wait",
      timeout: 2000,
      description: "等待页面完全加载",
      reasoning: "确保所有元素都已渲染",
    },
    {
      type: "screenshot",
      description: "截取初始页面状态",
      reasoning: "记录页面的初始状态",
    },
  ]

  // 基于页面分析添加智能actions
  if (pageAnalysis?.elements) {
    // 如果有表单，尝试填写
    if (pageAnalysis.elements.inputs?.length > 0) {
      const firstInput = pageAnalysis.elements.inputs[0]
      actions.push({
        type: "fill",
        selector: generateSelectorForElement(firstInput),
        value: generateRealisticValue(firstInput.type, firstInput.placeholder),
        description: `填写${firstInput.placeholder || firstInput.name || "输入框"}`,
        reasoning: "基于检测到的输入字段生成填写动作",
      })
    }

    // 如果有按钮，尝试点击
    if (pageAnalysis.elements.buttons?.length > 0) {
      const relevantButton = findRelevantButton(pageAnalysis.elements.buttons, task)
      if (relevantButton) {
        actions.push({
          type: "click",
          selector: generateSelectorForElement(relevantButton),
          description: `点击${relevantButton.text || "按钮"}`,
          reasoning: "基于任务描述选择最相关的按钮",
        })
      }
    }

    // 添加滚动动作
    actions.push({
      type: "scroll",
      selector: "body",
      description: "滚动页面查看更多内容",
      reasoning: "展示页面的更多内容",
    })
  }

  actions.push({
    type: "screenshot",
    description: "截取最终页面状态",
    reasoning: "记录操作完成后的页面状态",
  })

  return actions
}

function generateSelectorForElement(element: any): string {
  const selectors = []

  // 优先级1: data-testid
  if (element.testId) {
    selectors.push(`[data-testid="${element.testId}"]`)
    selectors.push(`[data-test="${element.testId}"]`)
  }

  // 优先级2: ID
  if (element.id) {
    selectors.push(`#${element.id}`)
  }

  // 优先级3: 语义化选择器
  if (element.type === "button" || element.tagName === "BUTTON") {
    if (element.text) {
      selectors.push(`button:has-text("${element.text}")`)
      selectors.push(`input[type="button"][value="${element.text}"]`)
    }
  }

  if (element.type && element.type !== "button") {
    selectors.push(`input[type="${element.type}"]`)
    if (element.placeholder) {
      selectors.push(`input[placeholder="${element.placeholder}"]`)
    }
    if (element.name) {
      selectors.push(`input[name="${element.name}"]`)
    }
  }

  // 优先级4: CSS类
  if (element.className) {
    const classes = element.className.split(" ").filter(Boolean)
    if (classes.length > 0) {
      selectors.push(`.${classes[0]}`)
    }
  }

  return selectors.join(", ")
}

function generateRealisticValue(inputType: string, placeholder?: string): string {
  const values: Record<string, string> = {
    email: "test@example.com",
    password: "TestPassword123",
    text: placeholder?.toLowerCase().includes("name") ? "John Doe" : "Test Input",
    search: "search query",
    tel: "+1234567890",
    url: "https://example.com",
    number: "123",
  }

  return values[inputType] || "Test Value"
}

function findRelevantButton(buttons: any[], task: string): any {
  const taskLower = task.toLowerCase()

  // 查找与任务相关的按钮
  const relevantKeywords = [
    "submit",
    "send",
    "login",
    "register",
    "sign",
    "search",
    "buy",
    "purchase",
    "add",
    "create",
    "save",
    "continue",
  ]

  for (const keyword of relevantKeywords) {
    if (taskLower.includes(keyword)) {
      const matchingButton = buttons.find((btn) => btn.text?.toLowerCase().includes(keyword))
      if (matchingButton) return matchingButton
    }
  }

  // 如果没找到相关按钮，返回第一个可见按钮
  return buttons.find((btn) => btn.visible) || buttons[0]
}
