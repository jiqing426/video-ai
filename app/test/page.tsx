"use client"

import { EnvironmentStatus } from "@/components/environment-status"
import { RecordingTest } from "@/components/recording-test"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TestTube, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function TestPage() {
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
                <TestTube className="w-6 h-6 text-purple-600" />
                <h1 className="text-2xl font-bold">录制功能测试</h1>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  开发工具
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 说明卡片 */}
          <Card>
            <CardHeader>
              <CardTitle>测试说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p>
                  <strong>环境检测:</strong> 自动检测当前运行环境的录制能力，包括Playwright、Chromium和FFmpeg的可用性。
                </p>
                <p>
                  <strong>录制测试:</strong> 执行完整的录制流程测试，验证从页面分析到视频生成的所有步骤。
                </p>
                <p>
                  <strong>适应性录制:</strong> 根据环境能力自动选择真实录制或模拟录制模式。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 环境状态 */}
          <EnvironmentStatus />

          {/* 录制测试 */}
          <RecordingTest />
        </div>
      </div>
    </div>
  )
}
