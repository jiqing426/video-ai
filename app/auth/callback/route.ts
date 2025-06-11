import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { Database } from "@/types/supabase" // 如果有

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: cookies as any }
    )
    await supabase.auth.exchangeCodeForSession(code)
  }

  // 无论如何都重定向到首页
  return NextResponse.redirect(new URL("/", requestUrl.origin))
} 