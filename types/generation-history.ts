export interface GenerationHistory {
  id: number
  user_id: string
  video_url: string
  video_name: string
  video_size: number
  video_duration: number
  video_format: string
  video_resolution: string
  status: string
  mode: string
  created_at: string
  email: string
  aspect_ratio: string
}

export interface CreateGenerationHistoryInput {
  video_url: string
  video_name: string
  video_size: number
  video_duration: number
  video_format: string
  video_resolution: string
  status: string
  mode: string
  user_id: string
  email: string
  aspect_ratio?: string
} 