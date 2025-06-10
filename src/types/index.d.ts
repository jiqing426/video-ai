declare module "@supabase/auth-helpers-nextjs" {
  export function createClientComponentClient<T = any>(): any;
}

declare module "@/types/supabase" {
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
        }
      }
    }
  }
} 