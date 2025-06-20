import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "@/types/supabase" // 确保Database类型正确导入

// 不需要登录就可以访问的路由
const publicRoutes = ["/","/login", "/register", "/auth/callback"]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // 创建一个兼容的cookies处理接口
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          })
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          req.cookies.delete({
            name,
            ...options,
          })
          res.cookies.delete({
            name,
            ...options,
          })
        },
      } as any
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // 如果用户未登录且访问受保护的路由，重定向到登录页面
  if (!session && !isPublicRoute) {
    const redirectUrl = new URL("/login", req.url)
    redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 如果用户已登录且访问登录/注册页面，重定向到首页
  if (session && isPublicRoute) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (浏览器图标)
     * - public 文件夹
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
} 