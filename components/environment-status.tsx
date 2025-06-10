"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Monitor, Cloud, Container } from "lucide-react"

interface EnvironmentStatus {
  environment: string
  hasPlaywright: boolean
  hasChromium: boolean
  hasFFmpeg: boolean
  canRecord: boolean
  isDocker: boolean
  isVercel: boolean
  isLocal: boolean
  lastChecked: string
}

export function EnvironmentStatus() {
  const [status, setStatus] = useState<EnvironmentStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkEnvironment = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/environment-check")
      const data = await response.json()
      setStatus({
        ...data,
        lastChecked: new Date().toLocaleTimeString(),
      })
    } catch (error) {
      console.error("Failed to check environment:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkEnvironment()
  }, [])

  if (!status) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
            <span className="ml-2">检测环境中...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getEnvironmentIcon = () => {
    if (status.isDocker) return <Container className="w-5 h-5" />
    if (status.isVercel) return <Cloud className="w-5 h-5" />
    return <Monitor className="w-5 h-5" />
  }

  const getEnvironmentColor = () => {
    if (status.canRecord) return "bg-green-100 text-green-800 border-green-200"
    return "bg-yellow-100 text-yellow-800 border-yellow-200"
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getEnvironmentIcon()}
            环境状态检测
          </CardTitle>
          <Button variant="outline" size="sm" onClick={checkEnvironment} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            刷新
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 环境类型 */}
          <div className="flex items-center justify-between">
            <span className="font-medium">运行环境</span>
            <Badge className={getEnvironmentColor()}>{status.environment}</Badge>
          </div>

          {/* 功能检测 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700">核心组件</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Playwright</span>
                  {status.hasPlaywright ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Chromium</span>
                  {status.hasChromium ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">FFmpeg</span>
                  {status.hasFFmpeg ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-700">录制能力</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">真实录制</span>
                  {status.canRecord ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">视频处理</span>
                  {status.hasFFmpeg ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 状态说明 */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              {status.canRecord ? (
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
              )}
              <div className="text-sm">
                {status.canRecord ? (
                  <div>
                    <p className="font-medium text-green-700">✅ 支持真实录制</p>
                    <p className="text-green-600">当前环境支持完整的Playwright录制功能，可以生成高质量的真实视频。</p>
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-yellow-700">⚠️ 使用模拟录制</p>
                    <p className="text-yellow-600">
                      当前环境不支持真实录制，将使用AI驱动的模拟录制功能。建议使用Docker部署获得最佳体验。
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 text-center">最后检测时间: {status.lastChecked}</div>
        </div>
      </CardContent>
    </Card>
  )
}
