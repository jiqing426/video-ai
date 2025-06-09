"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Globe,
  Zap,
  Diamond,
  Play,
  Code,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Target,
  Shield,
  History,
  RatioIcon as AspectRatio,
  Video,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ConfigPreviewDialog } from "@/components/config-preview-dialog"
import { VideoResult } from "@/components/video-result"
import { RecordingStatus } from "@/components/recording-status"
import Link from "next/link"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function VideoGenerationPlatform() {
  const { t } = useLanguage()
  const [selectedMode, setSelectedMode] = useState<"url-only" | "url-prompt" | "code-aware">("url-only")
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [formData, setFormData] = useState({
    url: "",
    task: "",
    workflow: "",
    elements: "",
    github: "",
    aspectRatio: "16:9", // 默认视频比例
  })
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [videoMetadata, setVideoMetadata] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<"url-only" | "url-prompt" | "code-aware">("url-only")
  const [recordingSteps, setRecordingSteps] = useState<string[]>([])

  const modes = [
    {
      id: "url-only",
      title: t("mode.urlOnly.title"),
      icon: Globe,
      success: "60-70%",
      description: t("mode.urlOnly.description"),
      color: "bg-blue-500",
      features: [t("mode.urlOnly.feature1"), t("mode.urlOnly.feature2"), t("mode.urlOnly.feature3")],
    },
    {
      id: "url-prompt",
      title: t("mode.urlPrompt.title"),
      icon: Zap,
      success: "80-85%",
      description: t("mode.urlPrompt.description"),
      color: "bg-orange-500",
      features: [t("mode.urlPrompt.feature1"), t("mode.urlPrompt.feature2"), t("mode.urlPrompt.feature3")],
    },
    {
      id: "code-aware",
      title: t("mode.codeAware.title"),
      icon: Diamond,
      success: "90-95%",
      description: t("mode.codeAware.description"),
      color: "bg-purple-500",
      features: [t("mode.codeAware.feature1"), t("mode.codeAware.feature2"), t("mode.codeAware.feature3")],
    },
  ]

  const aspectRatios = [
    { value: "16:9", label: "16:9", description: "标准宽屏" },
    { value: "4:3", label: "4:3", description: "传统屏幕" },
    { value: "1:1", label: "1:1", description: "正方形" },
    { value: "9:16", label: "9:16", description: "垂直视频" },
    { value: "21:9", label: "21:9", description: "超宽屏" },
  ]

  const steps = [
    { name: "初始化Playwright浏览器", percentage: 16.67 },
    { name: "导航到目标网站", percentage: 33.34 },
    { name: "分析页面结构和元素", percentage: 50.01 },
    { name: "执行用户交互录制", percentage: 66.68 },
    { name: "处理视频和音频", percentage: 83.35 },
    { name: "生成最终视频文件", percentage: 100 },
  ]

  const handleTabChange = (value: string) => {
    setActiveTab(value as "url-only" | "url-prompt" | "code-aware")
    setSelectedMode(value as "url-only" | "url-prompt" | "code-aware")
  }

  const handleGenerate = async () => {
    // 验证表单
    if (!formData.url || !formData.task) {
      setError("请填写必要的URL和任务描述")
      return
    }

    // 验证URL格式
    try {
      new URL(formData.url)
    } catch (urlError) {
      setError("请输入有效的URL地址（例如：https://example.com）")
      return
    }

    if (selectedMode === "code-aware" && !formData.github) {
      setError("代码感知模式需要提供GitHub仓库URL")
      return
    }

    if (!formData.aspectRatio) {
      setError("请选择视频比例")
      return
    }

    setError(null)
    setIsGenerating(true)
    setProgress(0)
    setCurrentStep(0)
    setRecordingSteps([])

    try {
      console.log("🎬 开始Playwright录制...")

      // 模拟录制过程的各个步骤
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i)
        setProgress(steps[i].percentage)
        setRecordingSteps((prev) => [...prev, steps[i].name])
        // 每个步骤等待一段时间
        await new Promise((resolve) => setTimeout(resolve, 1500))
      }

      // 调用录制API
      console.log("📡 发送录制请求到API...")
      const response = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: selectedMode,
          url: formData.url,
          task: formData.task,
          workflow: formData.workflow,
          elements: formData.elements,
          github: formData.github,
          aspectRatio: formData.aspectRatio,
        }),
      })

      console.log("📡 API响应状态:", response.status, response.statusText)

      // 检查响应状态
      if (!response.ok) {
        console.error("❌ API响应错误:", response.status, response.statusText)

        // 尝试获取错误信息
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`

        try {
          // 首先检查响应的Content-Type
          const contentType = response.headers.get("content-type")
          console.log("📄 响应Content-Type:", contentType)

          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json()
            errorMessage = errorData.error || errorData.message || errorMessage
          } else {
            // 如果不是JSON，获取文本内容
            const errorText = await response.text()
            console.log("📄 错误响应文本:", errorText.substring(0, 200))

            // 尝试从HTML中提取错误信息
            if (errorText.includes("Internal Server Error")) {
              errorMessage = "服务器内部错误，请稍后重试"
            } else if (errorText.includes("404")) {
              errorMessage = "API接口未找到，请检查服务器配置"
            } else if (errorText.includes("500")) {
              errorMessage = "服务器错误，请联系管理员"
            } else {
              errorMessage = "服务器返回了意外的响应格式"
            }
          }
        } catch (parseError) {
          console.error("❌ 解析错误响应失败:", parseError)
          errorMessage = `请求失败 (${response.status}): 无法解析服务器响应`
        }

        throw new Error(errorMessage)
      }

      // 检查响应内容类型
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("❌ 响应不是JSON格式:", contentType)
        const responseText = await response.text()
        console.log("📄 实际响应内容:", responseText.substring(0, 500))
        throw new Error("服务器返回了非JSON格式的响应，可能是配置错误")
      }

      // 解析JSON响应
      let result
      try {
        result = await response.json()
        console.log("✅ 成功解析JSON响应:", result)
      } catch (jsonError) {
        console.error("❌ JSON解析失败:", jsonError)
        const responseText = await response.text()
        console.log("📄 无法解析的响应内容:", responseText.substring(0, 500))
        throw new Error("服务器响应格式错误，无法解析JSON数据")
      }

      // 检查业务逻辑结果
      if (!result.success) {
        throw new Error(result.error || "录制失败，未知错误")
      }

      console.log("✅ Playwright录制完成:", result)
      setVideoMetadata(result.data)
      setRecordingSteps((prev) => [...prev, "录制完成！"])
    } catch (err: any) {
      console.error("❌ Playwright录制错误:", err)

      // 提供更友好的错误信息
      let errorMessage = "录制时发生错误"

      if (err.message) {
        if (err.message.includes("Failed to fetch")) {
          errorMessage = "网络连接失败，请检查网络连接或稍后重试"
        } else if (err.message.includes("timeout")) {
          errorMessage = "录制超时，请尝试简化操作流程或检查网站是否可访问"
        } else if (err.message.includes("无法解析域名")) {
          errorMessage = "无法访问该网站，请检查URL是否正确"
        } else if (err.message.includes("JSON")) {
          errorMessage = "服务器响应格式错误，请联系技术支持"
        } else if (err.message.includes("Internal Server Error")) {
          errorMessage = "服务器内部错误，请稍后重试"
        } else if (err.message.includes("404")) {
          errorMessage = "录制服务未找到，请检查服务器配置"
        } else {
          errorMessage = err.message
        }
      }

      setError(errorMessage)
      setRecordingSteps((prev) => [...prev, `错误: ${errorMessage}`])
    } finally {
      setIsGenerating(false)
    }
  }

  const resetGeneration = () => {
    setVideoMetadata(null)
    setError(null)
    setProgress(0)
    setCurrentStep(0)
    setRecordingSteps([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Video className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t("header.title")}
              </h1>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Play className="w-3 h-3 mr-1" />
                Playwright
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/history">
                <Button variant="outline" size="sm" className="gap-2">
                  <History className="w-4 h-4" />
                  生成历史
                </Button>
              </Link>
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <Sparkles className="w-3 h-3 mr-1" />
                {t("header.aiPowered")}
              </Badge>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {videoMetadata ? (
          <VideoResult metadata={videoMetadata} onClose={resetGeneration} />
        ) : (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">{t("hero.title")}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t("hero.subtitle")}</p>
              <div className="mt-4 flex justify-center">
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  <Video className="w-3 h-3 mr-1" />
                  基于 Playwright 浏览器自动化技术
                </Badge>
              </div>
            </div>

            {/* Mode Selection */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {modes.map((mode) => {
                const Icon = mode.icon
                return (
                  <Card
                    key={mode.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedMode === mode.id ? "ring-2 ring-purple-500 shadow-lg" : ""
                    }`}
                    onClick={() => {
                      setSelectedMode(mode.id as any)
                      setActiveTab(mode.id as any)
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 ${mode.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-200">
                          {mode.success} {t("common.successRate")}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{mode.title}</CardTitle>
                      <CardDescription>{mode.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {mode.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Configuration Form */}
            <Card className="mb-8">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Target className="w-5 h-5 mr-2" />
                    {t("config.title")}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <AspectRatio className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">视频比例:</span>
                  </div>
                </div>
                <CardDescription>{t("config.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* 视频比例选择 */}
                <div className="mb-3">
                  <RadioGroup
                    value={formData.aspectRatio}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, aspectRatio: value }))}
                    className="grid grid-cols-2 md:grid-cols-5 gap-2"
                  >
                    {aspectRatios.map((ratio) => (
                      <div key={ratio.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={ratio.value} id={`ratio-${ratio.value}`} />
                        <Label
                          htmlFor={`ratio-${ratio.value}`}
                          className="flex flex-col cursor-pointer text-sm font-medium"
                        >
                          <span>{ratio.label}</span>
                          <span className="text-xs text-gray-500">{ratio.description}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-7">
                    <TabsTrigger value="url-only" className="text-xs px-1 py-0.5 h-6">
                      {t("tab.urlOnly")}
                    </TabsTrigger>
                    <TabsTrigger value="url-prompt" className="text-xs px-1 py-0.5 h-6">
                      {t("tab.urlPrompt")}
                    </TabsTrigger>
                    <TabsTrigger value="code-aware" className="text-xs px-1 py-0.5 h-6">
                      {t("tab.codeAware")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="url-only" className="space-y-4">
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="url">{t("config.websiteUrl")}</Label>
                        <Input
                          id="url"
                          placeholder={t("placeholder.url")}
                          className="mt-1"
                          value={formData.url}
                          onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="task">{t("config.taskDescription")}</Label>
                        <Input
                          id="task"
                          placeholder={t("placeholder.task")}
                          className="mt-1"
                          value={formData.task}
                          onChange={(e) => setFormData((prev) => ({ ...prev, task: e.target.value }))}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="url-prompt" className="space-y-4">
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="url-prompt">{t("config.websiteUrl")}</Label>
                        <Input
                          id="url-prompt"
                          placeholder={t("placeholder.url")}
                          className="mt-1"
                          value={formData.url}
                          onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="task-prompt">{t("config.taskDescription")}</Label>
                        <Input
                          id="task-prompt"
                          placeholder={t("placeholder.task")}
                          className="mt-1"
                          value={formData.task}
                          onChange={(e) => setFormData((prev) => ({ ...prev, task: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="workflow">{t("config.workflowHint")}</Label>
                        <Textarea
                          id="workflow"
                          placeholder={t("placeholder.workflow")}
                          className="mt-1"
                          value={formData.workflow}
                          onChange={(e) => setFormData((prev) => ({ ...prev, workflow: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="elements">{t("config.keyElements")}</Label>
                        <Textarea
                          id="elements"
                          placeholder={t("placeholder.elements")}
                          className="mt-1"
                          value={formData.elements}
                          onChange={(e) => setFormData((prev) => ({ ...prev, elements: e.target.value }))}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="code-aware" className="space-y-4">
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="url-code">{t("config.websiteUrl")}</Label>
                        <Input
                          id="url-code"
                          placeholder={t("placeholder.url")}
                          className="mt-1"
                          value={formData.url}
                          onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="task-code">{t("config.taskDescription")}</Label>
                        <Input
                          id="task-code"
                          placeholder={t("placeholder.task")}
                          className="mt-1"
                          value={formData.task}
                          onChange={(e) => setFormData((prev) => ({ ...prev, task: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="github">{t("config.githubRepo")}</Label>
                        <Input
                          id="github"
                          placeholder={t("placeholder.github")}
                          className="mt-1"
                          value={formData.github}
                          onChange={(e) => setFormData((prev) => ({ ...prev, github: e.target.value }))}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 mb-8">
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Playwright录制中...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    开始Playwright录制
                  </>
                )}
              </Button>
              <Button variant="outline" size="lg" onClick={() => setIsPreviewOpen(true)}>
                {t("action.preview")}
              </Button>
            </div>

            {/* Recording Status */}
            <RecordingStatus
              isRecording={isGenerating}
              currentStep={currentStep}
              steps={recordingSteps}
              progress={progress}
            />

            {/* Technical Architecture */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Code className="w-5 h-5 mr-2" />
                  Playwright 技术架构优势
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-green-500" />
                      浏览器自动化核心
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        真实浏览器环境录制，支持Chromium、Firefox、WebKit
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        精确的用户交互模拟和时间线捕获
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        高质量视频录制，支持多种分辨率
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        智能等待和错误处理机制
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                      智能录制策略
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        自动元素识别和交互路径规划
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        测试ID优先的可靠元素定位
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        多策略回退机制确保录制成功
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        实时截图和步骤记录
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strategy Hierarchy Alert */}
            <Alert className="mt-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Playwright 元素检测可靠性层次：</strong>
                测试ID (data-testid, data-test) 95% → 语义标签 (button, input) 85% → 内容匹配 70% → CSS类选择器 50% →
                位置选择器 30%
              </AlertDescription>
            </Alert>
          </>
        )}
      </div>
      <ConfigPreviewDialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        selectedMode={selectedMode}
        formData={formData}
      />
    </div>
  )
}
