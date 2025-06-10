export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      generation_history: {
        Row: {
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
        }
        Insert: {
          id?: string
          user_id: string
          video_url: string
          video_name: string
          video_size: number
          video_duration: number
          video_format: string
          video_resolution: string
          status?: 'completed' | 'processing' | 'failed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          video_url?: string
          video_name?: string
          video_size?: number
          video_duration?: number
          video_format?: string
          video_resolution?: string
          status?: 'completed' | 'processing' | 'failed'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 