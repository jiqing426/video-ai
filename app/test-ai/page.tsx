"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { VideoPlayer } from "@/components/video-player"
import { Square, Brain, CheckCircle, XCircle, Clock, ArrowLeft, Zap, Globe, Diamond } from "lucide-react"
import Link from "next/link"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface TestResult {
  success: boolean
  videoUrl?: string
  thumbnailUrl?: string
  duration?: string
  error?: string
  steps?: string[]
  aiReasoning?: string[]
  recordingType?: "ai_real_recording" | "ai_simulation" | "basic_demo"
  pageAnalysis?: any
  executionTime?: number
  mode?: string
  task?: string
  url?: string
}

const testScenarios = [
  {
    id: "github-login",
    name: "GitHub登录演示",
    url: "https://github.com/login",
    task: "演示GitHub登录流程",
    mode: "url-only" as const,
    description: "测试AI如何识别登录表单并生成填写步骤",
  },
  {
    id: "google-search",
    name: "Google搜索演示",
    url: "https://www.google.com",
    task: "搜索'Next.js tutorial'",
    mode: "url-prompt" as const,
    workflow: "1. 点击搜索框\n2. 输入搜索关键词\n3. 点击搜索按钮",
    description: "测试AI如何处理搜索功能",
  },
  {
    id: "example-form",
    name: "示例表单填写",
    url: "https://httpbin.org/forms/post",
    task: "填写并提交表单",
    mode: "url-prompt" as const,
    workflow: "1. 填写客户名称\n2. 填写电话号码\n3. 选择尺寸\n4. 提交表单",
    description: "测试AI如何处理复杂表单",
  },
  {
    id: "custom",
    name: "自定义测试",
    url: "",
    task: "",
    mode: "url-only" as const,
    description: "使用您自己的网站和任务进行测试",
  },
]

export default function AITestPage() {
  const [selectedScenario, setSelectedScenario] = useState(testScenarios[0])
  const [customUrl, setCustomUrl] = useState("")
  const [customTask, setCustomTask] = useState("")
  const [customWorkflow, setCustomWorkflow] = useState("")
  const [customMode, setCustomMode] = useState<"url-only" | "url-prompt" | "code-aware">("url-only")
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [result, setResult] = useState<TestResult | null>(null)
  const [testHistory, setTestHistory] = useState<TestResult[]>([])

  const runAITest = async () => {
    setIsRunning(true)
    setProgress(0)
    setCurrentStep("初始化AI录制系统...")
    setResult(null)

    const startTime = Date.now()

    try {
      // 确定测试参数
      const testUrl = selectedScenario.id === "custom" ? customUrl : selectedScenario.url
      const testTask = selectedScenario.id === "custom" ? customTask : selectedScenario.task
      const testMode = selectedScenario.id === "custom" ? customMode : selectedScenario.mode
      const testWorkflow = selectedScenario.id === "custom" ? customWorkflow : selectedScenario.workflow

      if (!testUrl || !testTask) {
        throw new Error("请填写测试URL和任务描述")
      }

      // 模拟AI录制的各个阶段
      const steps = [
        "检测环境能力...",
        "启动Playwright浏览器...",
        "导航到目标网站...",
        "AI分析页面结构...",
        "生成智能交互步骤...",
        "执行AI生成的动作...",
        "完成视频录制...",
      ]

      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i])
        setProgress(((i + 1) / steps.length) * 90) // 留10%给API调用
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      setCurrentStep("调用AI录制API...")
      setProgress(95)

      // 调用真实的AI录制API
      const response = await fetch("/api/test-ai-recording", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: testUrl,
          task: testTask,
          mode: testMode,
          workflow: testWorkflow,
          aspectRatio: "16:9",
        }),
      })

      const testResult = await response.json()
      const executionTime = Date.now() - startTime

      setProgress(100)
      setCurrentStep("AI录制完成！")

      if (testResult.success) {
        const result: TestResult = {
          success: true,
          videoUrl: testResult.data.videoUrl,
          thumbnailUrl: testResult.data.thumbnailUrl,
          duration: testResult.data.duration,
          steps: testResult.data.steps,
          aiReasoning: testResult.data.aiReasoning,
          recordingType: testResult.data.recordingType,
          pageAnalysis: testResult.data.pageAnalysis,
          executionTime,
          mode: testMode,
          task: testTask,
          url: testUrl,
        }

        setResult(result)
        setTestHistory((prev) => [result, ...prev.slice(0, 4)])
      } else {
        setResult({
          success: false,
          error: testResult.error,
          executionTime,
        })
      }
    } catch (error) {
      console.error("AI测试失败:", error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "测试失败",
        executionTime: Date.now() - startTime,
      })
    } finally {
      setIsRunning(false)
      setCurrentStep("")
    }
  }

  const stopTest = () => {
    setIsRunning(false)
    setProgress(0)
    setCurrentStep("")
  }

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "url-only":
        return <Globe className="w-4 h-4" />
      case "url-prompt":
        return <Zap className="w-4 h-4" />
      case "code-aware":
        return <Diamond className="w-4 h-4" />
      default:
        return <Brain className="w-4 h-4" />
    }
  }

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "url-only":
        return "bg-blue-100 text-blue-800"
      case "url-prompt":
        return "bg-orange-100 text-orange-800"
      case "code-aware":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRecordingTypeBadge = (type?: string) => {
    switch (type) {
      case "ai_real_recording":
        return <Badge className="bg-green-100 text-green-800">AI真实录制</Badge>
      case "ai_simulation":
        return <Badge className="bg-blue-100 text-blue-800">AI智能模拟</Badge>
      case "basic_demo":
        return <Badge className="bg-gray-100 text-gray-800">基础演示</Badge>
      default:
        return <Badge variant="outline">未知类型</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回首页
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Brain className="w-6 h-6 text-purple-600" />
                <h1 className="text-2xl font-bold">AI录制系统测试</h1>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  AI Powered
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 说明卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI录制系统测试说明
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p>
                  <strong>🎯 测试目标:</strong> 验证AI是否能正确分析指定网站并生成相应的交互步骤
                </p>
                <p>
                  <strong>🤖 AI能力:</strong> 使用GPT-4o分析页面结构，生成智能的Playwright动作序列
                </p>
                <p>
                  <strong>📊 测试内容:</strong> 页面元素识别、交互步骤生成、选择器策略、执行效果
                </p>
                <p>
                  <strong>🔄 自适应:</strong> 根据环境能力自动选择真实录制或智能模拟
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* 测试配置 */}
            <Card>
              <CardHeader>
                <CardTitle>选择测试场景</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {testScenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedScenario.id === scenario.id
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedScenario(scenario)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{scenario.name}</h4>
                        <Badge className={getModeColor(scenario.mode)}>
                          {getModeIcon(scenario.mode)}
                          <span className="ml-1">
                            {scenario.mode === "url-only"
                              ? "仅URL"
                              : scenario.mode === "url-prompt"
                                ? "URL+提示"
                                : "代码感知"}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{scenario.description}</p>
                      {scenario.url && <p className="text-xs text-gray-500 mt-1 truncate">{scenario.url}</p>}
                    </div>
                  ))}
                </div>

                {/* 自定义测试配置 */}
                {selectedScenario.id === "custom" && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="custom-url">测试网站URL</Label>
                      <Input
                        id="custom-url"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        placeholder="https://example.com"
                        disabled={isRunning}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="custom-task">任务描述</Label>
                      <Input
                        id="custom-task"
                        value={customTask}
                        onChange={(e) => setCustomTask(e.target.value)}
                        placeholder="描述要执行的任务"
                        disabled={isRunning}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>录制模式</Label>
                      <RadioGroup value={customMode} onValueChange={(value: any) => setCustomMode(value)}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="url-only" id="mode-url-only" />
                          <Label htmlFor="mode-url-only">仅URL模式</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="url-prompt" id="mode-url-prompt" />
                          <Label htmlFor="mode-url-prompt">URL+提示模式</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="code-aware" id="mode-code-aware" />
                          <Label htmlFor="mode-code-aware">代码感知模式</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    {customMode === "url-prompt" && (
                      <div className="space-y-2">
                        <Label htmlFor="custom-workflow">工作流程提示（可选）</Label>
                        <Textarea
                          id="custom-workflow"
                          value={customWorkflow}
                          onChange={(e) => setCustomWorkflow(e.target.value)}
                          placeholder="1. 第一步操作&#10;2. 第二步操作&#10;3. 第三步操作"
                          disabled={isRunning}
                          className="min-h-[80px]"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={runAITest}
                    disabled={isRunning || (selectedScenario.id === "custom" && (!customUrl || !customTask))}
                    className="flex-1"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    {isRunning ? "AI录制中..." : "开始AI录制测试"}
                  </Button>
                  {isRunning && (
                    <Button variant="outline" onClick={stopTest}>
                      <Square className="w-4 h-4 mr-2" />
                      停止
                    </Button>
                  )}
                </div>

                {isRunning && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>{currentStep}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 测试结果 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {result?.success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : result?.success === false ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-400" />
                  )}
                  测试结果
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!result ? (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>选择测试场景并点击开始测试</p>
                  </div>
                ) : result.success ? (
                  <div className="space-y-4">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        ✅ AI录制测试成功完成！执行时间: {Math.round((result.executionTime || 0) / 1000)}秒
                      </AlertDescription>
                    </Alert>

                    <div className="flex items-center gap-2 mb-3">
                      {getRecordingTypeBadge(result.recordingType)}
                      {result.mode && (
                        <Badge className={getModeColor(result.mode)}>
                          {getModeIcon(result.mode)}
                          <span className="ml-1">
                            {result.mode === "url-only"
                              ? "仅URL"
                              : result.mode === "url-prompt"
                                ? "URL+提示"
                                : "代码感知"}
                          </span>
                        </Badge>
                      )}
                    </div>

                    {result.videoUrl && (
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">生成的演示视频</h4>
                        <VideoPlayer videoUrl={result.videoUrl} thumbnailUrl={result.thumbnailUrl} />
                      </div>
                    )}

                    {result.pageAnalysis && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">页面分析结果</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>按钮: {result.pageAnalysis.elementsFound?.buttons || 0}</div>
                          <div>输入框: {result.pageAnalysis.elementsFound?.inputs || 0}</div>
                          <div>链接: {result.pageAnalysis.elementsFound?.links || 0}</div>
                          <div>表单: {result.pageAnalysis.elementsFound?.forms || 0}</div>
                        </div>
                      </div>
                    )}

                    {result.steps && result.steps.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">AI生成的执行步骤</h4>
                        <div className="space-y-2">
                          {result.steps.map((step, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <div className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{step}</p>
                                {result.aiReasoning && result.aiReasoning[index] && (
                                  <p className="text-gray-600 text-xs mt-1">💭 {result.aiReasoning[index]}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      ❌ 测试失败: {result.error}
                      {result.executionTime && (
                        <span className="block mt-1 text-xs">
                          执行时间: {Math.round(result.executionTime / 1000)}秒
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 测试历史 */}
          {testHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  测试历史记录
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testHistory.map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {test.success ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{test.task}</p>
                          <p className="text-xs text-gray-500 truncate max-w-xs">{test.url}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {test.recordingType && getRecordingTypeBadge(test.recordingType)}
                        {test.mode && (
                          <Badge variant="outline" className="text-xs">
                            {test.mode === "url-only" ? "仅URL" : test.mode === "url-prompt" ? "URL+提示" : "代码感知"}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {test.executionTime ? `${Math.round(test.executionTime / 1000)}s` : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
