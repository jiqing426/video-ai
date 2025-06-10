import ffmpeg from "fluent-ffmpeg"
import ffmpegStatic from "ffmpeg-static"
import fs from "fs/promises"
import path from "path"
import type { EnvironmentCapabilities } from "./environment-detector"

// 设置FFmpeg路径
if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic)
}

export interface VideoProcessingOptions {
  inputPath: string
  outputPath: string
  format: "webm" | "mp4"
  quality: "low" | "medium" | "high"
  aspectRatio?: string
}

export class VideoProcessor {
  private capabilities: EnvironmentCapabilities

  constructor(capabilities: EnvironmentCapabilities) {
    this.capabilities = capabilities
  }

  async processVideo(options: VideoProcessingOptions): Promise<void> {
    if (!this.capabilities.hasFFmpeg) {
      console.log("⚠️ FFmpeg not available, skipping video processing")
      return
    }

    return new Promise((resolve, reject) => {
      console.log("🎬 Processing video:", options.inputPath)

      const command = ffmpeg(options.inputPath)

      // 设置输出格式
      if (options.format === "mp4") {
        command.videoCodec("libx264").audioCodec("aac").format("mp4").outputOptions(["-movflags", "+faststart"])
      } else {
        command.videoCodec("libvpx-vp9").audioCodec("libopus").format("webm")
      }

      // 设置质量
      switch (options.quality) {
        case "low":
          command.videoBitrate("500k").audioBitrate("64k")
          break
        case "medium":
          command.videoBitrate("1000k").audioBitrate("128k")
          break
        case "high":
          command.videoBitrate("2000k").audioBitrate("192k")
          break
      }

      // 设置宽高比
      if (options.aspectRatio) {
        const [width, height] = this.getResolutionFromAspectRatio(options.aspectRatio)
        command.size(`${width}x${height}`)
      }

      command
        .output(options.outputPath)
        .on("start", (commandLine) => {
          console.log("🎬 FFmpeg started:", commandLine)
        })
        .on("progress", (progress) => {
          console.log(`🎬 Processing: ${Math.round(progress.percent || 0)}%`)
        })
        .on("end", () => {
          console.log("✅ Video processing completed")
          resolve()
        })
        .on("error", (err) => {
          console.error("❌ Video processing failed:", err)
          reject(err)
        })
        .run()
    })
  }

  async generateThumbnail(videoPath: string, outputPath: string, timeOffset = "00:00:01"): Promise<void> {
    if (!this.capabilities.hasFFmpeg) {
      console.log("⚠️ FFmpeg not available, skipping thumbnail generation")
      return
    }

    return new Promise((resolve, reject) => {
      console.log("🖼️ Generating thumbnail from:", videoPath)

      ffmpeg(videoPath)
        .screenshots({
          timestamps: [timeOffset],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: "320x180",
        })
        .on("end", () => {
          console.log("✅ Thumbnail generated")
          resolve()
        })
        .on("error", (err) => {
          console.error("❌ Thumbnail generation failed:", err)
          reject(err)
        })
    })
  }

  async getVideoMetadata(videoPath: string): Promise<any> {
    if (!this.capabilities.hasFFmpeg) {
      // 返回估算的元数据
      const stats = await fs.stat(videoPath)
      return {
        duration: 30000, // 30秒
        size: stats.size,
        format: path.extname(videoPath).slice(1),
      }
    }

    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          console.error("❌ Failed to get video metadata:", err)
          reject(err)
        } else {
          const duration = metadata.format.duration ? metadata.format.duration * 1000 : 30000
          resolve({
            duration,
            size: metadata.format.size || 0,
            format: metadata.format.format_name || "unknown",
            resolution: this.extractResolution(metadata),
          })
        }
      })
    })
  }

  private extractResolution(metadata: any): string {
    const videoStream = metadata.streams.find((stream: any) => stream.codec_type === "video")
    if (videoStream) {
      return `${videoStream.width}x${videoStream.height}`
    }
    return "1920x1080"
  }

  private getResolutionFromAspectRatio(aspectRatio: string): [number, number] {
    const ratios: Record<string, [number, number]> = {
      "16:9": [1920, 1080],
      "4:3": [1024, 768],
      "1:1": [1080, 1080],
      "9:16": [1080, 1920],
      "21:9": [2560, 1080],
    }
    return ratios[aspectRatio] || [1920, 1080]
  }
}
