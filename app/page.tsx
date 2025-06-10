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
import { VideoResult } from "@/components/video-result"
import { RecordingStatus } from "@/components/recording-status"
import Link from "next/link"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
// 导入新的PreviewButton组件
import { PreviewButton } from "@/components/preview-button"

export default function VideoGenerationPlatform() {
  const { t } = useLanguage()
  const [selectedMode, setSelectedMode] = useState<"url-only" | "url-prompt" | "code-aware">("url-only")
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [formData, setFormData] = useState({
    url: "",
    task: "",
    workflow: "",
    elements: "",
    github: "",
    aspectRatio: "16:9",
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
    { name: "初始化浏览器环境", percentage: 16.67 },
    { name: "导航到目标网站", percentage: 33.34 },
    { name: "分析页面结构和元素", percentage: 50.01 },
    { name: "AI生成交互步骤", percentage: 66.68 },
    { name: "执行用户交互录制", percentage: 83.35 },
    { name: "生成最终视频文件", percentage: 100 },
  ]

  const handleTabChange = (value: string) => {
    setActiveTab(value as "url-only" | "url-prompt" | "code-aware")
    setSelectedMode(value as "url-only" | "url-prompt" | "code-aware")
  }

  const handleGenerate = async () => {
    console.log("🎬 开始生成视频...")

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
      console.log("📡 发送请求到API...")

      // 模拟录制过程的各个步骤
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i)
        setProgress(steps[i].percentage)
        setRecordingSteps((prev) => [...prev, steps[i].name])
        await new Promise((resolve) => setTimeout(resolve, 1500))
      }

      // 调用API
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

      console.log("📡 API响应状态:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ API响应错误:", response.status, errorText)
        throw new Error(`API请求失败 (${response.status})`)
      }

      const result = await response.json()
      console.log("✅ API响应成功:", result)

      if (!result.success) {
        throw new Error(result.error || "视频生成失败")
      }

      setVideoMetadata(result.data)
      setRecordingSteps((prev) => [...prev, "视频生成完成！"])
    } catch (err: any) {
      console.error("❌ 生成错误:", err)

      let errorMessage = "视频生成失败"
      if (err.message) {
        if (err.message.includes("Failed to fetch")) {
          errorMessage = "网络连接失败，请检查网络连接"
        } else if (err.message.includes("timeout")) {
          errorMessage = "请求超时，请稍后重试"
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
      <div className="container mx-auto px-4 py-8">
        {videoMetadata ? (
          <VideoResult metadata={videoMetadata} onClose={resetGeneration} />
        ) : (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">智能视频生成平台</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">基于Playwright的智能网站工作流程自动视频生成</p>
              <div className="mt-4 flex justify-center">
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
                </div>
                <CardDescription>{t("config.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* 视频比例选择 */}
                <div className="mb-6">
                  <Label className="text-sm font-medium mb-3 block">
                    视频比例 <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.aspectRatio}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, aspectRatio: value }))}
                    className="grid grid-cols-2 md:grid-cols-5 gap-3"
                  >
                    {aspectRatios.map((ratio) => (
                      <div key={ratio.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={ratio.value} id={`ratio-${ratio.value}`} />
                        <Label
                          htmlFor={`ratio-${ratio.value}`}
                          className="flex flex-col cursor-pointer text-sm font-medium leading-tight"
                        >
                          <span className="font-semibold">{ratio.label}</span>
                          <span className="text-xs text-gray-500 font-normal">{ratio.description}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="url-only" className="text-sm">
                      <Globe className="w-4 h-4 mr-2" />
                      {t("tab.urlOnly")}
                    </TabsTrigger>
                    <TabsTrigger value="url-prompt" className="text-sm">
                      <Zap className="w-4 h-4 mr-2" />
                      {t("tab.urlPrompt")}
                    </TabsTrigger>
                    <TabsTrigger value="code-aware" className="text-sm">
                      <Diamond className="w-4 h-4 mr-2" />
                      {t("tab.codeAware")}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="url-only" className="space-y-6">
                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="url" className="text-sm font-medium flex items-center gap-1">
                          {t("config.websiteUrl")} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="url"
                          placeholder={t("placeholder.url")}
                          value={formData.url}
                          onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task" className="text-sm font-medium flex items-center gap-1">
                          {t("config.taskDescription")} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="task"
                          placeholder={t("placeholder.task")}
                          value={formData.task}
                          onChange={(e) => setFormData((prev) => ({ ...prev, task: e.target.value }))}
                          className="h-11"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="url-prompt" className="space-y-6">
                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="url-prompt" className="text-sm font-medium flex items-center gap-1">
                          {t("config.websiteUrl")} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="url-prompt"
                          placeholder={t("placeholder.url")}
                          value={formData.url}
                          onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task-prompt" className="text-sm font-medium flex items-center gap-1">
                          {t("config.taskDescription")} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="task-prompt"
                          placeholder={t("placeholder.task")}
                          value={formData.task}
                          onChange={(e) => setFormData((prev) => ({ ...prev, task: e.target.value }))}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="workflow" className="text-sm font-medium">
                          {t("config.workflowHint")} <span className="text-gray-400">(推荐)</span>
                        </Label>
                        <Textarea
                          id="workflow"
                          placeholder={t("placeholder.workflow")}
                          value={formData.workflow}
                          onChange={(e) => setFormData((prev) => ({ ...prev, workflow: e.target.value }))}
                          className="min-h-[100px] resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="elements" className="text-sm font-medium">
                          {t("config.keyElements")} <span className="text-gray-400">(可选)</span>
                        </Label>
                        <Textarea
                          id="elements"
                          placeholder={t("placeholder.elements")}
                          value={formData.elements}
                          onChange={(e) => setFormData((prev) => ({ ...prev, elements: e.target.value }))}
                          className="min-h-[80px] resize-none"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="code-aware" className="space-y-6">
                    <div className="grid gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="url-code" className="text-sm font-medium flex items-center gap-1">
                          {t("config.websiteUrl")} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="url-code"
                          placeholder={t("placeholder.url")}
                          value={formData.url}
                          onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task-code" className="text-sm font-medium flex items-center gap-1">
                          {t("config.taskDescription")} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="task-code"
                          placeholder={t("placeholder.task")}
                          value={formData.task}
                          onChange={(e) => setFormData((prev) => ({ ...prev, task: e.target.value }))}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="github" className="text-sm font-medium flex items-center gap-1">
                          {t("config.githubRepo")} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="github"
                          placeholder={t("placeholder.github")}
                          value={formData.github}
                          onChange={(e) => setFormData((prev) => ({ ...prev, github: e.target.value }))}
                          className="h-11"
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
                    录制中...
                  </>
                ) : (
                  <>
                    <Video className="w-4 h-4 mr-2" />
                    开始录制
                  </>
                )}
              </Button>
              <PreviewButton selectedMode={selectedMode} formData={formData} />
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
                  智能录制技术优势
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Shield className="w-4 h-4 mr-2 text-green-500" />
                      智能浏览器自动化
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        智能页面分析和元素识别
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        智能交互路径规划和执行
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        高质量视频录制和处理
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        多种视频比例和格式支持
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                      智能策略
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        智能交互步骤生成
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        代码仓库分析和优化
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        多策略元素定位机制
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        智能错误处理和恢复
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
