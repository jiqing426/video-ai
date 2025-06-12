"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { getGenerationHistory, deleteGenerationHistory } from "@/lib/generation-history"
import { GenerationHistory } from "@/types/generation-history"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Play,
  Download,
  Share2,
  Trash2,
  Search,
  Calendar,
  Clock,
  Eye,
  ArrowLeft,
  CheckSquare,
  Square,
  X,
} from "lucide-react"
import { VideoPlayer } from "@/components/video-player"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

export default function HistoryPage() {
  const { t } = useLanguage()
  const [records, setRecords] = useState<GenerationHistory[]>([])
  const [filteredRecords, setFilteredRecords] = useState<GenerationHistory[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterMode, setFilterMode] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedVideo, setSelectedVideo] = useState<GenerationHistory | null>(null)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVideos, setSelectedVideos] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 加载历史记录
  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getGenerationHistory()
      console.log('加载到的历史记录:', data)
      setRecords(data)
      setFilteredRecords(data)
    } catch (err) {
      console.error("加载历史记录失败:", err)
      setError("加载历史记录失败，请稍后重试")
      setRecords([])
      setFilteredRecords([])
    } finally {
      setIsLoading(false)
    }
  }

  // 搜索和过滤
  useEffect(() => {
    let filtered = records

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.video_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (record.description && record.description.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // 模式过滤
    if (filterMode !== "all") {
      filtered = filtered.filter((record) => record.mode === filterMode)
    }

    // 状态过滤
    if (filterStatus !== "all") {
      filtered = filtered.filter((record) => record.status === filterStatus)
    }

    setFilteredRecords(filtered)
  }, [searchTerm, filterMode, filterStatus, records])

  // 当过滤结果改变时，清空选择
  useEffect(() => {
    setSelectedVideos([])
  }, [filteredRecords])

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个视频吗？此操作不可撤销。")) {
      return
    }

    try {
      setIsDeleting(true)
      await deleteGenerationHistory(id)
      setRecords(records.filter((r) => r.id !== id))
      setFilteredRecords(filteredRecords.filter((r) => r.id !== id))
      toast({
        title: "删除成功",
        description: "视频已从历史记录中删除",
      })
    } catch (error) {
      console.error("删除失败:", error)
      toast({
        title: "删除失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleBatchDelete = async () => {
    if (selectedVideos.length === 0) return

    const message = `确定要删除选中的 ${selectedVideos.length} 个视频吗？此操作不可撤销。`
    if (!confirm(message)) {
      return
    }

    try {
      setIsDeleting(true)
      await Promise.all(selectedVideos.map((id) => deleteGenerationHistory(id)))
      setRecords(records.filter((record) => !selectedVideos.includes(record.id)))
      setFilteredRecords(filteredRecords.filter((record) => !selectedVideos.includes(record.id)))
      setSelectedVideos([])
      toast({
        title: "批量删除成功",
        description: `${selectedVideos.length} 个视频已从历史记录中删除。`,
      })
    } catch (error) {
      console.error("批量删除失败:", error)
      toast({
        title: "批量删除失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleVideoSelection = (videoId: string) => {
    setSelectedVideos((prev) => {
      if (prev.includes(videoId)) {
        return prev.filter((id) => id !== videoId)
      } else {
        return [...prev, videoId]
      }
    })
  }

  const handleSelectAll = () => {
    const completedVideos = filteredRecords.filter((record) => record.status === "completed").map((record) => record.id)

    if (selectedVideos.length === completedVideos.length) {
      setSelectedVideos([])
    } else {
      setSelectedVideos(completedVideos)
    }
  }

  const handleDownload = async (record: GenerationHistory) => {
    if (record.status !== "completed") return

    try {
      const response = await fetch(record.video_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${record.video_name}.${record.video_format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast({
        title: "下载成功",
        description: `文件 ${record.video_name}.${record.video_format} 已下载。`,
      })
    } catch (error) {
      console.error("下载失败:", error)
      toast({
        title: "下载失败",
        description: "请稍后重试",
        variant: "destructive",
      })
    }
  }

  const handleShare = async (record: GenerationHistory) => {
    try {
      await navigator.clipboard.writeText(record.video_url)
      toast({
        title: "已复制链接",
        description: "视频链接已复制到剪贴板",
      })
    } catch (error) {
      console.error("复制链接失败:", error)
      toast({
        title: "复制失败",
        description: "请手动复制视频链接",
        variant: "destructive",
      })
    }
  }

  const playVideo = (record: GenerationHistory) => {
    if (record.status === "completed") {
      setSelectedVideo(record)
      setIsPlayerOpen(true)
    } else {
      toast({
        title: "视频未完成",
        description: "视频仍在处理中或已失败，无法播放。",
        variant: "destructive",
      })
    }
  }

  // 安全关闭播放器
  const closePlayer = () => {
    setIsPlayerOpen(false)
    // 延迟清除选中的视频，确保播放器有时间清理
    setTimeout(() => {
      setSelectedVideo(null)
    }, 100)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "processing":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "已完成"
      case "processing":
        return "处理中"
      case "failed":
        return "失败"
      default:
        return "未知"
    }
  }

  const getModeText = (mode: string) => {
    switch (mode) {
      case "url-only":
        return "仅URL模式"
      case "url-prompt":
        return "URL+提示模式"
      case "code-aware":
        return "代码感知模式"
      default:
        return mode
    }
  }

  const completedVideosCount = filteredRecords.filter((record) => record.status === "completed").length
  const isAllSelected = selectedVideos.length === completedVideosCount && completedVideosCount > 0

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            <span className="ml-2">加载历史记录...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
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
              <h1 className="text-2xl font-bold">生成历史</h1>
            </div>
            <Badge variant="secondary">{filteredRecords.length} 个视频</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* 搜索和过滤 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="搜索视频标题或描述..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterMode} onValueChange={setFilterMode}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="选择模式" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有模式</SelectItem>
                    <SelectItem value="url-only">仅URL模式</SelectItem>
                    <SelectItem value="url-prompt">URL+提示模式</SelectItem>
                    <SelectItem value="code-aware">代码感知模式</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="状态" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">所有状态</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                    <SelectItem value="processing">处理中</SelectItem>
                    <SelectItem value="failed">失败</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 操作工具栏 */}
        {filteredRecords.length > 0 && completedVideosCount > 0 && (
          <Card className="mb-6">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm" onClick={handleSelectAll} className="gap-2">
                    {isAllSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    {isAllSelected ? "取消全选" : "全选"}
                  </Button>
                </div>

                {selectedVideos.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">已选择 {selectedVideos.length} 个视频</span>
                    <Button variant="destructive" size="sm" onClick={handleBatchDelete} disabled={isDeleting}>
                      <Trash2 className="w-4 h-4 mr-1" />
                      批量删除
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 视频列表 */}
        {filteredRecords.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">暂无生成记录</p>
                <p className="text-sm">开始生成您的第一个视频吧！</p>
              </div>
              <Link href="/">
                <Button className="mt-4">开始生成</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredRecords.map((record) => (
              <Card key={record.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
                {/* 右上角删除按钮 */}
                {selectedVideos.length === 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(record.id)}
                    className="absolute top-2 right-2 z-10 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8 rounded-full"
                    disabled={isDeleting}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}

                <div className="flex items-center p-4 gap-4">
                  {/* 缩略图 */}
                  <div className="relative flex-shrink-0">
                    {selectedVideos.length > 0 && record.status === "completed" && (
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="checkbox"
                          checked={selectedVideos.includes(record.id)}
                          onChange={() => toggleVideoSelection(record.id)}
                          className="w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500"
                        />
                      </div>
                    )}
                    <img
                      src={record.thumbnailUrl || "/placeholder.svg"}
                      alt={record.video_name}
                      className="w-40 h-24 object-cover rounded"
                    />
                    {record.status === "completed" && selectedVideos.length === 0 && (
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer rounded"
                        onClick={() => playVideo(record)}
                      >
                        <Play className="w-6 h-6 text-white" />
                      </div>
                    )}
                    {record.status === "processing" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>

                  {/* 内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0 mr-4">
                        <h3 className="text-lg font-semibold mb-1 truncate pr-10">{record.video_name}</h3>
                        <p className="text-gray-600 mb-2 text-sm line-clamp-2">{record.description}</p>

                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge className={`${getModeColor(record.mode || '')} pointer-events-none`}>{getModeText(record.mode || '')}</Badge>
                          <Badge className={`${getStatusColor(record.status || '')} pointer-events-none`}>{getStatusText(record.status || '')}</Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500 mb-1">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {Math.round(record.video_duration / 1000)}秒
                          </div>
                          <div className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {record.views} 次观看
                          </div>
                          <div>{record.video_resolution}</div>
                          <div>{Math.round(record.video_size / 1024 / 1024)}MB</div>
                        </div>

                        <div className="text-xs text-gray-400">{new Date(record.created_at).toLocaleString()}</div>
                      </div>
                    </div>

                    {/* 快捷操作按钮 */}
                    {record.status === "completed" && selectedVideos.length === 0 && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => playVideo(record)} className="text-xs px-2 py-1 h-7">
                          <Play className="w-3 h-3 mr-1" />
                          播放
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(record)}
                          className="text-xs px-2 py-1 h-7"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          下载
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShare(record)}
                          className="text-xs px-2 py-1 h-7"
                        >
                          <Share2 className="w-3 h-3 mr-1" />
                          分享
                        </Button>
                      </div>
                    )}

                    {record.status === "processing" && (
                      <Alert className="mt-2">
                        <AlertDescription className="text-xs">视频正在生成中，请稍后刷新页面查看结果</AlertDescription>
                      </Alert>
                    )}

                    {record.status === "failed" && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertDescription className="text-xs">视频生成失败，请重新尝试生成</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 视频播放器对话框 */}
        <Dialog open={isPlayerOpen} onOpenChange={closePlayer}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedVideo?.video_name}</DialogTitle>
            </DialogHeader>
            {selectedVideo && isPlayerOpen && (
              <VideoPlayer videoUrl={selectedVideo.video_url} thumbnailUrl={selectedVideo.thumbnailUrl || "/placeholder.svg"} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
