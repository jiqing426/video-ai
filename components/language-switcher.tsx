"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Globe, ChevronDown } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLanguageChange = (lang: "zh" | "en") => {
    setLanguage(lang)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button variant="ghost" size="sm" className="h-8 px-2 gap-1" onClick={() => setIsOpen(!isOpen)}>
        <Globe className="h-4 w-4" />
        <span className="text-sm">{language === "zh" ? "中文" : "EN"}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50">
          <div className="py-1">
            <button
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 ${
                language === "zh" ? "bg-gray-50 text-blue-600" : "text-gray-700"
              }`}
              onClick={() => handleLanguageChange("zh")}
            >
              <span>🇨🇳</span>
              中文
            </button>
            <button
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2 ${
                language === "en" ? "bg-gray-50 text-blue-600" : "text-gray-700"
              }`}
              onClick={() => handleLanguageChange("en")}
            >
              <span>🇺🇸</span>
              English
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
