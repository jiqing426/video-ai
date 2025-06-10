"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { VideoPlayer } from "@/components/video-player"
import { Play, Square, TestTube, CheckCircle, XCircle, Clock } from "lucide-react"

interface TestResult {
  success: boolean
  videoUrl?: string
  thumbnailUrl?: string
  duration?: string
  error?: string
  steps?: string[]
  recordingType?: "real" | "simulated"
  metadata?: any
}

export function RecordingTest() {
  const [testUrl, setTestUrl] = useState("https://example.com")
  const [testTask, setTestTask] = useState("测试页面录制功能")
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("")
  const [result, setResult] = useState<TestResult | null>(null)
  const [testHistory, setTestHistory] = useState<TestResult[]>([])

  const runTest = async () => {
    setIsRunning(true)
    setProgress(0)
    setCurrentStep("初始化测试...")
    setResult(null)

    try {
      // 模拟测试进度
      const steps = [
        "检测环境能力...",
        "启动录制器...",
        "导航到测试页面...",
        "分析页面结构...",
        "执行测试交互...",
        "生成视频文件...",
        "完成测试录制",
      ]

      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i])
        setProgress(((i + 1) / steps.length) * 100)
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      // 调用测试API
      const response = await fetch("/api/test-recording", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: testUrl,
          task: testTask,
          mode: "url-only",
          aspectRatio: "16:9",
        }),
      })

      const testResult = await response.json()

      if (testResult.success) {
        setResult({
          success: true,
          videoUrl: testResult.data.videoUrl,
          thumbnailUrl: testResult.data.thumbnailUrl,
          duration: testResult.data.duration,
          steps: testResult.data.steps,
          recordingType: testResult.data.recordingType,
          metadata: testResult.data,
        })

        // 添加到测试历史
        setTestHistory((prev) => [
          {
            success: true,
            recordingType: testResult.data.recordingType,
            metadata: { timestamp: new Date().toISOString(), url: testUrl },
          },
          ...prev.slice(0, 4),
        ])
      } else {
        setResult({
          success: false,
          error: testResult.error,
        })

        setTestHistory((prev) => [
          {
            success: false,
            error: testResult.error,
            metadata: { timestamp: new Date().toISOString(), url: testUrl },
          },
          ...prev.slice(0, 4),
        ])
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : "测试失败",
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            录制功能测试
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="test-url">测试URL</Label>
              <Input
                id="test-url"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={isRunning}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="test-task">测试任务</Label>
              <Input
                id="test-task"
                value={testTask}
                onChange={(e) => setTestTask(e.target.value)}
                placeholder="描述要测试的功能"
                disabled={isRunning}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={runTest} disabled={isRunning || !testUrl} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? "测试中..." : "开始测试"}
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
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              测试结果
              {result.recordingType && (
                <Badge variant={result.recordingType === "real" ? "default" : "secondary"}>
                  {result.recordingType === "real" ? "真实录制" : "模拟录制"}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    ✅ 录制测试成功完成！
                    {result.recordingType === "real" ? " 使用了真实的Playwright录制。" : " 使用了模拟录制模式。"}
                  </AlertDescription>
                </Alert>

                {result.videoUrl && (
                  <div>
                    <h4 className="font-medium mb-2">生成的视频</h4>
                    <VideoPlayer videoUrl={result.videoUrl} thumbnailUrl={result.thumbnailUrl} />
                  </div>
                )}

                {result.metadata && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">时长:</span> {result.duration}
                    </div>
                    <div>
                      <span className="font-medium">分辨率:</span> {result.metadata.resolution}
                    </div>
                    <div>
                      <span className="font-medium">大小:</span> {result.metadata.size}
                    </div>
                    <div>
                      <span className="font-medium">格式:</span> {result.metadata.format}
                    </div>
                  </div>
                )}

                {result.steps && (
                  <div>
                    <h4 className="font-medium mb-2">执行步骤</h4>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <ul className="space-y-1 text-sm">
                        {result.steps.map((step, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>❌ 测试失败: {result.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* 测试历史 */}
      {testHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              测试历史
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testHistory.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center gap-2">
                    {test.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm">
                      {test.success ? "测试成功" : "测试失败"}
                      {test.recordingType && (
                        <Badge variant="outline" className="ml-2">
                          {test.recordingType === "real" ? "真实" : "模拟"}
                        </Badge>
                      )}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {test.metadata?.timestamp ? new Date(test.metadata.timestamp).toLocaleTimeString() : "刚刚"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
