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
      transcriptions: {
        Row: {
          id: string
          created_at: string
          video_name: string
          video_path: string
          text: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          video_name: string
          video_path: string
          text: string
          user_id?: string
        }
        Update: {
          id?: string
          created_at?: string
          video_name?: string
          video_path?: string
          text?: string
          user_id?: string
        }
      }
    }
  }
} 