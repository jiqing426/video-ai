"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertCircle, Play } from "lucide-react"

interface RecordingStep {
  name: string
  status: "pending" | "running" | "completed" | "error"
  duration?: number
}

interface RecordingStatusProps {
  isRecording: boolean
  currentStep: number
  steps: string[]
  progress: number
}

export function RecordingStatus({ isRecording, currentStep, steps, progress }: RecordingStatusProps) {
  const [recordingSteps, setRecordingSteps] = useState<RecordingStep[]>([
    { name: "初始化浏览器", status: "pending" },
    { name: "导航到目标网站", status: "pending" },
    { name: "分析页面结构", status: "pending" },
    { name: "执行用户交互", status: "pending" },
    { name: "录制视频内容", status: "pending" },
    { name: "生成最终视频", status: "pending" },
  ])

  useEffect(() => {
    if (isRecording) {
      setRecordingSteps((prev) =>
        prev.map((step, index) => ({
          ...step,
          status: index < currentStep ? "completed" : index === currentStep ? "running" : "pending",
        })),
      )
    }
  }, [isRecording, currentStep])

  const getStatusIcon = (status: RecordingStep["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "running":
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: RecordingStep["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "running":
        return "bg-blue-100 text-blue-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  if (!isRecording) return null

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5 text-purple-500" />
          Playwright 网站录制进行中...
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 总体进度 */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>录制进度</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="mb-4" />
          </div>

          {/* 详细步骤 */}
          <div className="space-y-3">
            {recordingSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                {getStatusIcon(step.status)}
                <span
                  className={`text-sm font-medium ${
                    step.status === "running"
                      ? "text-blue-600"
                      : step.status === "completed"
                        ? "text-green-600"
                        : "text-gray-600"
                  }`}
                >
                  {step.name}
                </span>
                <Badge variant="outline" className={getStatusColor(step.status)}>
                  {step.status === "running"
                    ? "进行中"
                    : step.status === "completed"
                      ? "完成"
                      : step.status === "error"
                        ? "错误"
                        : "等待中"}
                </Badge>
              </div>
            ))}
          </div>

          {/* 实时步骤信息 */}
          {steps.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">录制日志:</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {steps.slice(-5).map((step, index) => (
                  <div key={index} className="text-xs text-gray-600">
                    • {step}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
