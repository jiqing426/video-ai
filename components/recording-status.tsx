"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertCircle, Play, Video, Code } from "lucide-react"

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
    { name: "启动Playwright浏览器", status: "pending" },
    { name: "导航到目标网站", status: "pending" },
    { name: "分析页面结构", status: "pending" },
    { name: "生成交互步骤", status: "pending" },
    { name: "执行用户交互", status: "pending" },
    { name: "完成视频录制", status: "pending" },
  ])

  useEffect(() => {
    if (isRecording) {
      setRecordingSteps((prev) =>
        prev.map((step, index) => ({
          ...step,
          status: index < currentStep ? "completed" : index === currentStep ? "running" : "pending",
        })),
      )
    } else {
      // 重置状态
      setRecordingSteps((prev) =>
        prev.map((step) => ({
          ...step,
          status: "pending",
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

  const getStatusText = (status: RecordingStep["status"]) => {
    switch (status) {
      case "completed":
        return "完成"
      case "running":
        return "进行中"
      case "error":
        return "错误"
      default:
        return "等待中"
    }
  }

  if (!isRecording) return null

  return (
    <Card className="mb-8 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Video className="w-4 h-4 text-white" />
          </div>
          <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Playwright 录制进行中...
          </span>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Play className="w-3 h-3 mr-1" />
            实时录制
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 总体进度 */}
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span className="font-medium">录制进度</span>
              <span className="font-mono">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="mb-4 h-2" />
          </div>

          {/* 主要步骤 */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700 flex items-center gap-2">
              <Code className="w-4 h-4" />
              执行阶段
            </h4>
            {recordingSteps.map((step, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-white/50">
                {getStatusIcon(step.status)}
                <span
                  className={`text-sm font-medium flex-1 ${
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
                  {getStatusText(step.status)}
                </Badge>
              </div>
            ))}
          </div>

          {/* 实时执行日志 */}
          {steps.length > 0 && (
            <div className="mt-6 p-4 bg-gray-900 rounded-lg">
              <h4 className="text-sm font-medium text-gray-100 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                实时执行日志
              </h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {steps.slice(-8).map((step, index) => (
                  <div key={index} className="text-xs text-gray-300 font-mono flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">▶</span>
                    <span className="flex-1">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 技术信息 */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-purple-200">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">Chromium</div>
              <div className="text-xs text-gray-500">浏览器引擎</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-pink-600">WebM</div>
              <div className="text-xs text-gray-500">视频格式</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
