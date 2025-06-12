"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { VideoPlayer } from "@/components/video-player"
import { Download, Share2, Code, CheckCircle, Copy, Facebook, Twitter, Brain } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { createClient } from '@/lib/supabase/client'
import { createGenerationHistory } from '@/lib/generation-history'

interface VideoMetadata {
  videoUrl: string
  thumbnailUrl: string
  duration: string
  resolution: string
  size: string
  format: string
  createdAt: string
  steps?: string[]
  aiReasoning?: string[]
  mode?: string
  task?: string
  url?: string
  recordingType?: string
  simulationNote?: string
  aspectRatio: string
  pageAnalysis?: {
    title: string
    elementsFound: {
      buttons: number
      inputs: number
      links: number
      forms: number
    }
  }
}

interface VideoResultProps {
  metadata: VideoMetadata
  onClose: () => void
}

export function VideoResult({ metadata, onClose }: VideoResultProps) {
  const { t } = useLanguage()
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isEmbedDialogOpen, setIsEmbedDialogOpen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [copiedShare, setCopiedShare] = useState(false)
  const [copiedEmbed, setCopiedEmbed] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    setDownloadError(null)

    try {
      const response = await fetch(metadata.videoUrl)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `${metadata.task || "generated-video"}-${new Date().getTime()}.mp4`

      document.body.appendChild(a)
      a.click()

      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download failed:", error)
      setDownloadError("下载失败，请稍后重试")
    } finally {
      setIsDownloading(false)
    }
  }

  const shareUrl = `${window.location.origin}/video/${encodeURIComponent(metadata.videoUrl)}`

  const embedCode = `<iframe 
  src="${shareUrl}" 
  width="800" 
  height="450" 
  frameborder="0" 
  allowfullscreen>
</iframe>`

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedShare(true)
      setTimeout(() => setCopiedShare(false), 2000)
    } catch (err) {
      console.error("Failed to copy share URL:", err)
    }
  }

  const copyEmbedCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopiedEmbed(true)
      setTimeout(() => setCopiedEmbed(false), 2000)
    } catch (err) {
      console.error("Failed to copy embed code:", err)
    }
  }

  const shareToSocial = (platform: string) => {
    const text = encodeURIComponent(`查看我用AI生成的${metadata.task}演示视频！`)
    const url = encodeURIComponent(shareUrl)

    let shareLink = ""

    switch (platform) {
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
        break
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
        break
    }

    if (shareLink) {
      window.open(shareLink, "_blank", "width=600,height=400")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t("video.generationComplete") || "视频生成完成"}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Brain className="w-3 h-3 mr-1" />
              {metadata.recordingType === "ai_real_recording"
                ? "真实录制"
                : metadata.recordingType === "ai_simulation"
                  ? "智能模拟"
                  : "智能生成"}
            </Badge>
            {metadata.mode && (
              <Badge variant="outline">
                {metadata.mode === "url-only"
                  ? "仅URL模式"
                  : metadata.mode === "url-prompt"
                    ? "URL+提示模式"
                    : "代码感知模式"}
              </Badge>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onClose}>
          {t("video.newGeneration") || "新建生成"}
        </Button>
      </div>

      {/* 模拟提示 */}
      {metadata.simulationNote && (
        <Alert>
          <AlertDescription>{metadata.simulationNote}</AlertDescription>
        </Alert>
      )}

      <VideoPlayer videoUrl={metadata.videoUrl} thumbnailUrl={metadata.thumbnailUrl} />

      {/* 视频详情卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("video.metadata") || "视频元数据"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-2 gap-6">
            {/* 左侧：视频元数据 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">视频信息</h4>
              <dl className="space-y-3">
                {metadata.task && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">任务描述</dt>
                    <dd className="text-sm text-gray-900 text-right max-w-xs">{metadata.task}</dd>
                  </div>
                )}
                {metadata.url && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">目标网站</dt>
                    <dd className="text-sm text-gray-900 text-right max-w-xs truncate">{metadata.url}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">{t("video.duration") || "时长"}</dt>
                  <dd className="text-sm text-gray-900">{metadata.duration}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">{t("video.resolution") || "分辨率"}</dt>
                  <dd className="text-sm text-gray-900">{metadata.resolution}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">{t("video.size") || "文件大小"}</dt>
                  <dd className="text-sm text-gray-900">{metadata.size}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">{t("video.format") || "格式"}</dt>
                  <dd className="text-sm text-gray-900">{metadata.format}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">{t("video.created") || "创建时间"}</dt>
                  <dd className="text-sm text-gray-900">{new Date(metadata.createdAt).toLocaleString()}</dd>
                </div>
              </dl>
            </div>

            {/* 右侧：操作按钮 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">操作选项</h4>
              <div className="space-y-3">
                <Button className="w-full gap-2" onClick={handleDownload} disabled={isDownloading}>
                  <Download className="w-4 h-4" />
                  {isDownloading ? "下载中..." : t("video.download") || "下载视频"}
                </Button>

                <Button variant="outline" className="w-full gap-2" onClick={() => setIsShareDialogOpen(true)}>
                  <Share2 className="w-4 h-4" />
                  {t("video.share") || "分享视频"}
                </Button>

                <Button variant="outline" className="w-full gap-2" onClick={() => setIsEmbedDialogOpen(true)}>
                  <Code className="w-4 h-4" />
                  {t("video.embedCode") || "获取嵌入代码"}
                </Button>

                {downloadError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{downloadError}</AlertDescription>
                  </Alert>
                )}

                <div className="bg-green-50 p-3 rounded-md mt-4">
                  <div className="flex items-center text-green-800">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-sm">视频已自动保存到您的账户</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>分享视频</DialogTitle>
            <DialogDescription>选择分享方式或复制链接</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="share-url">分享链接</Label>
              <div className="flex gap-2 mt-1">
                <Input id="share-url" value={shareUrl} readOnly className="flex-1" />
                <Button variant="outline" size="sm" onClick={copyShareUrl}>
                  {copiedShare ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <Label>社交媒体分享</Label>
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => shareToSocial("twitter")}>
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => shareToSocial("facebook")}>
                  <Facebook className="w-4 h-4" />
                  Facebook
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Embed Dialog */}
      <Dialog open={isEmbedDialogOpen} onOpenChange={setIsEmbedDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>嵌入代码</DialogTitle>
            <DialogDescription>复制以下代码到您的网站中</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="embed-code">HTML嵌入代码</Label>
              <div className="relative mt-1">
                <Textarea id="embed-code" value={embedCode} readOnly className="font-mono text-sm min-h-[120px]" />
                <Button variant="outline" size="sm" className="absolute top-2 right-2" onClick={copyEmbedCode}>
                  {copiedEmbed ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
              <h4 className="font-medium text-blue-900 mb-1">使用说明</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 将代码粘贴到您的HTML页面中</li>
                <li>• 可以调整width和height属性来改变尺寸</li>
                <li>• 支持响应式设计</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
