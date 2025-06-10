"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { ConfigPreviewDialog } from "@/components/config-preview-dialog"
import { useLanguage } from "@/contexts/language-context"

interface PreviewButtonProps {
  selectedMode: "url-only" | "url-prompt" | "code-aware"
  formData: {
    url: string
    task: string
    workflow?: string
    elements?: string
    github?: string
    aspectRatio?: string
  }
  variant?: "default" | "outline" | "secondary"
  size?: "default" | "sm" | "lg"
}

export function PreviewButton({ selectedMode, formData, variant = "outline", size = "lg" }: PreviewButtonProps) {
  const { t } = useLanguage()
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const handleOpenPreview = () => {
    console.log("Opening preview dialog with data:", { selectedMode, formData })
    setIsPreviewOpen(true)
  }

  const handleClosePreview = () => {
    console.log("Closing preview dialog")
    setIsPreviewOpen(false)
  }

  return (
    <>
      <Button variant={variant} size={size} onClick={handleOpenPreview} className="gap-2">
        <Eye className="w-4 h-4" />
        {t("action.preview") || "预览配置"}
      </Button>

      <ConfigPreviewDialog
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        selectedMode={selectedMode}
        formData={formData}
      />
    </>
  )
}
