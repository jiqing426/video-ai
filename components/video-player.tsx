"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Pause, Volume2, VolumeX, Download, Maximize, RotateCcw } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface VideoPlayerProps {
  videoUrl: string
  thumbnailUrl?: string
  onClose?: () => void
}

export function VideoPlayer({ videoUrl, thumbnailUrl, onClose }: VideoPlayerProps) {
  const { t } = useLanguage()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)

  // 安全的播放函数
  const safePlay = useCallback(async () => {
    const video = videoRef.current
    if (!video || !isVideoLoaded) return

    try {
      // 检查视频是否仍在DOM中
      if (!document.contains(video)) {
        console.log("视频元素已从DOM中移除")
        return
      }

      // 检查视频是否已准备好播放
      if (video.readyState < 2) {
        console.log("视频尚未准备好播放")
        return
      }

      const playPromise = video.play()
      if (playPromise !== undefined) {
        await playPromise
        setIsPlaying(true)
      }
    } catch (error) {
      console.log("播放失败:", error)
      setIsPlaying(false)

      // 处理特定的播放错误
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          console.log("播放被中断")
        } else if (error.name === "NotSupportedError") {
          setVideoError("不支持的视频格式")
        } else if (error.name === "NotAllowedError") {
          setVideoError("浏览器阻止了自动播放")
        }
      }
    }
  }, [isVideoLoaded])

  // 安全的暂停函数
  const safePause = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    try {
      if (!document.contains(video)) {
        console.log("视频元素已从DOM中移除")
        return
      }

      video.pause()
      setIsPlaying(false)
    } catch (error) {
      console.log("暂停失败:", error)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      if (!document.contains(video)) return

      setCurrentTime(video.currentTime)
      if (video.duration && isFinite(video.duration)) {
        setProgress((video.currentTime / video.duration) * 100)
      }
    }

    const handleLoadedMetadata = () => {
      if (!document.contains(video)) return

      setDuration(video.duration)
      setIsVideoLoaded(true)
      setVideoError(null)
    }

    const handleLoadedData = () => {
      if (!document.contains(video)) return
      setIsVideoLoaded(true)
    }

    const handleCanPlay = () => {
      if (!document.contains(video)) return
      setIsVideoLoaded(true)
    }

    const handlePlay = () => {
      if (!document.contains(video)) return
      setIsPlaying(true)
    }

    const handlePause = () => {
      if (!document.contains(video)) return
      setIsPlaying(false)
    }

    const handleEnded = () => {
      if (!document.contains(video)) return
      setIsPlaying(false)
    }

    const handleError = (e: Event) => {
      console.error("视频加载错误:", e)
      setVideoError("视频加载失败")
      setIsVideoLoaded(false)
    }

    const handleAbort = () => {
      console.log("视频加载被中止")
      setIsPlaying(false)
    }

    // 添加事件监听器
    video.addEventListener("timeupdate", handleTimeUpdate)
    video.addEventListener("loadedmetadata", handleLoadedMetadata)
    video.addEventListener("loadeddata", handleLoadedData)
    video.addEventListener("canplay", handleCanPlay)
    video.addEventListener("play", handlePlay)
    video.addEventListener("pause", handlePause)
    video.addEventListener("ended", handleEnded)
    video.addEventListener("error", handleError)
    video.addEventListener("abort", handleAbort)

    // 清理函数
    return () => {
      if (video && document.contains(video)) {
        video.removeEventListener("timeupdate", handleTimeUpdate)
        video.removeEventListener("loadedmetadata", handleLoadedMetadata)
        video.removeEventListener("loadeddata", handleLoadedData)
        video.removeEventListener("canplay", handleCanPlay)
        video.removeEventListener("play", handlePlay)
        video.removeEventListener("pause", handlePause)
        video.removeEventListener("ended", handleEnded)
        video.removeEventListener("error", handleError)
        video.removeEventListener("abort", handleAbort)

        // 安全地停止播放
        try {
          if (!video.paused) {
            video.pause()
          }
        } catch (error) {
          console.log("清理时暂停视频失败:", error)
        }
      }
    }
  }, [])

  // 组件卸载时的清理
  useEffect(() => {
    return () => {
      const video = videoRef.current
      if (video && document.contains(video)) {
        try {
          if (!video.paused) {
            video.pause()
          }
        } catch (error) {
          console.log("组件卸载时清理失败:", error)
        }
      }
    }
  }, [])

  const togglePlay = useCallback(() => {
    if (!isVideoLoaded) return

    if (isPlaying) {
      safePause()
    } else {
      safePlay()
    }
  }, [isPlaying, isVideoLoaded, safePlay, safePause])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video || !document.contains(video)) return

    try {
      video.muted = !isMuted
      setIsMuted(!isMuted)
    } catch (error) {
      console.log("切换静音失败:", error)
    }
  }, [isMuted])

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const video = videoRef.current
      if (!video || !document.contains(video) || !isVideoLoaded) return

      // 确保视频已加载且duration有效
      if (!video.duration || !isFinite(video.duration)) return

      try {
        const progressBar = e.currentTarget
        const rect = progressBar.getBoundingClientRect()
        const pos = (e.clientX - rect.left) / rect.width

        // 确保计算出的时间是有效的有限数值
        const newTime = pos * video.duration
        if (isFinite(newTime) && newTime >= 0 && newTime <= video.duration) {
          video.currentTime = newTime
        }
      } catch (error) {
        console.log("设置播放时间失败:", error)
      }
    },
    [isVideoLoaded],
  )

  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current
    if (!video || !document.contains(video)) return

    try {
      if (!document.fullscreenElement) {
        video
          .requestFullscreen()
          .then(() => {
            setIsFullscreen(true)
          })
          .catch((err) => {
            console.error(`全屏失败: ${err.message}`)
          })
      } else {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (error) {
      console.log("切换全屏失败:", error)
    }
  }, [])

  const formatTime = useCallback((time: number) => {
    if (!isFinite(time)) return "00:00"

    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }, [])

  const handleDownload = useCallback(async () => {
    setIsDownloading(true)

    try {
      // 获取视频文件
      const response = await fetch(videoUrl)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const blob = await response.blob()

      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `video-${new Date().getTime()}.mp4`

      document.body.appendChild(a)
      a.click()

      // 清理
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Download failed:", error)
      alert("下载失败，请稍后重试")
    } finally {
      setIsDownloading(false)
    }
  }, [videoUrl])

  const handleRestart = useCallback(() => {
    const video = videoRef.current
    if (!video || !document.contains(video) || !isVideoLoaded) return

    try {
      video.currentTime = 0
      safePlay()
    } catch (error) {
      console.log("重新开始失败:", error)
    }
  }, [isVideoLoaded, safePlay])

  return (
    <Card className="overflow-hidden w-full max-w-3xl mx-auto">
      <div className="relative bg-black">
        {thumbnailUrl && !isPlaying && !isVideoLoaded && (
          <img
            src={thumbnailUrl || "/placeholder.svg"}
            alt="Video thumbnail"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {videoError ? (
          <div className="w-full aspect-video flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center">
              <p className="mb-2">视频加载失败</p>
              <p className="text-sm text-gray-400">{videoError}</p>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full aspect-video"
            poster={thumbnailUrl}
            preload="metadata"
            playsInline
            onClick={togglePlay}
          >
            <source src={videoUrl} type="video/mp4" />
            <source src={videoUrl} type="video/webm" />
            {t("video.notSupported") || "Your browser does not support the video tag."}
          </video>
        )}

        {/* Play button overlay */}
        {!isPlaying && isVideoLoaded && !videoError && (
          <div className="absolute inset-0 flex items-center justify-center cursor-pointer" onClick={togglePlay}>
            <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {!isVideoLoaded && !videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Controls */}
      {!videoError && (
        <div className="bg-gray-900 text-white p-2">
          {/* Progress bar */}
          <div className="h-1 bg-gray-700 rounded-full mb-2 cursor-pointer" onClick={handleProgressClick}>
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-150"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-gray-800 p-1 h-8 w-8"
                onClick={togglePlay}
                disabled={!isVideoLoaded}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-gray-800 p-1 h-8 w-8"
                onClick={toggleMute}
                disabled={!isVideoLoaded}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>

              <span className="text-xs">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-gray-800 p-1 h-8 w-8"
                onClick={handleRestart}
                disabled={!isVideoLoaded}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-gray-800 p-1 h-8 w-8"
                onClick={handleDownload}
                disabled={isDownloading}
              >
                <Download className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-gray-800 p-1 h-8 w-8"
                onClick={toggleFullscreen}
                disabled={!isVideoLoaded}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
