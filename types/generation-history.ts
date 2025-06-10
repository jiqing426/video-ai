export interface GenerationHistory {
  id: string
  user_id: string
  video_url: string
  video_name: string
  video_size: number
  video_duration: number
  video_format: string
  video_resolution: string
  status: 'completed' | 'processing' | 'failed'
  created_at: string
  updated_at: string
  description?: string
  mode?: "url-only" | "url-prompt" | "code-aware"
  thumbnailUrl?: string
  views?: number
}

export interface CreateGenerationHistoryInput {
  video_url: string
  video_name: string
  video_size: number
  video_duration: number
  video_format: string
  video_resolution: string
  status?: 'completed' | 'processing' | 'failed'
} 