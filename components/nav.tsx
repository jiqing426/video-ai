"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Video, History, User, LogOut } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useLanguage } from "@/contexts/language-context"
import { Session } from "@supabase/supabase-js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Nav() {
  const [loading, setLoading] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { t } = useLanguage()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setIsLoggedIn(!!session)
      setUserEmail(session?.user?.email || null)
    }
    checkAuth()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setIsLoggedIn(!!session)
      setUserEmail(session?.user?.email || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      // 强制刷新页面以确保状态更新
      window.location.href = "/login"
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Video className="w-4 h-4 text-white" />
            </div>
            <Link href="/">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {t("header.title")}
              </h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            {isLoggedIn ? (
              <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 hover:bg-accent"
                    onMouseEnter={() => setIsOpen(true)}
                    onMouseLeave={() => setIsOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    {userEmail}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="end" 
                  className="w-56"
                  sideOffset={8}
                  onMouseEnter={() => setIsOpen(true)}
                  onMouseLeave={() => setIsOpen(false)}
                >
                  <DropdownMenuLabel>{t("header.myAccount")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/history" className="flex items-center gap-2 cursor-pointer">
                      <History className="w-4 h-4" />
                      {t("header.history")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={loading}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {loading ? t("header.loggingOut") : t("header.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={() => router.push("/login")}
              >
                {t("header.login")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
} 