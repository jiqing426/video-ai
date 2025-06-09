"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/contexts/language-context"
import { Globe, Zap, Diamond, CheckCircle, Copy, RatioIcon as AspectRatio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface ConfigPreviewDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedMode: "url-only" | "url-prompt" | "code-aware"
  formData: {
    url: string
    task: string
    workflow?: string
    elements?: string
    github?: string
    aspectRatio?: string
  }
}

export function ConfigPreviewDialog({ isOpen, onClose, selectedMode, formData }: ConfigPreviewDialogProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const modeConfig = {
    "url-only": {
      title: t("mode.urlOnly.title"),
      icon: Globe,
      color: "bg-blue-500",
      success: "60-70%",
    },
    "url-prompt": {
      title: t("mode.urlPrompt.title"),
      icon: Zap,
      color: "bg-orange-500",
      success: "80-85%",
    },
    "code-aware": {
      title: t("mode.codeAware.title"),
      icon: Diamond,
      color: "bg-purple-500",
      success: "90-95%",
    },
  }

  const currentMode = modeConfig[selectedMode]
  const Icon = currentMode.icon

  const generateConfigJSON = () => {
    const config: any = {
      mode: selectedMode,
      websiteUrl: formData.url || "",
      taskDescription: formData.task || "",
      aspectRatio: formData.aspectRatio || "16:9",
    }

    if (selectedMode === "url-prompt") {
      config.workflowHint = formData.workflow || ""
      config.keyElements = formData.elements || ""
    }

    if (selectedMode === "code-aware") {
      config.githubRepository = formData.github || ""
    }

    return JSON.stringify(config, null, 2)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateConfigJSON())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-8 h-8 ${currentMode.color} rounded-lg flex items-center justify-center`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            {t("preview.title") || "配置预览"}
          </DialogTitle>
          <DialogDescription>{t("preview.description") || "查看当前配置的详细信息"}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mode Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{currentMode.title}</h3>
              <Badge variant="outline" className="text-green-600 border-green-200">
                {currentMode.success} {t("common.successRate")}
              </Badge>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              {t("preview.selectedMode") || "已选择模式"}
            </div>
          </div>

          {/* Configuration Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t("preview.configDetails") || "配置详情"}</h3>

            <div className="grid gap-3">
              <div className="flex justify-between items-start p-3 bg-white border rounded-lg">
                <div>
                  <span className="font-medium text-sm text-gray-700">{t("config.websiteUrl")}</span>
                  <p className="text-sm text-gray-900 mt-1">{formData.url || t("preview.notSet") || "未设置"}</p>
                </div>
              </div>

              <div className="flex justify-between items-start p-3 bg-white border rounded-lg">
                <div>
                  <span className="font-medium text-sm text-gray-700">{t("config.taskDescription")}</span>
                  <p className="text-sm text-gray-900 mt-1">{formData.task || t("preview.notSet") || "未设置"}</p>
                </div>
              </div>

              <div className="flex justify-between items-start p-3 bg-white border rounded-lg">
                <div>
                  <span className="font-medium text-sm text-gray-700 flex items-center gap-1">
                    <AspectRatio className="w-3 h-3" />
                    视频比例
                  </span>
                  <p className="text-sm text-gray-900 mt-1">{formData.aspectRatio || "16:9"}</p>
                </div>
              </div>

              {selectedMode === "url-prompt" && (
                <>
                  <div className="flex justify-between items-start p-3 bg-white border rounded-lg">
                    <div>
                      <span className="font-medium text-sm text-gray-700">{t("config.workflowHint")}</span>
                      <p className="text-sm text-gray-900 mt-1">
                        {formData.workflow || t("preview.notSet") || "未设置"}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-start p-3 bg-white border rounded-lg">
                    <div>
                      <span className="font-medium text-sm text-gray-700">{t("config.keyElements")}</span>
                      <p className="text-sm text-gray-900 mt-1 font-mono bg-gray-50 p-2 rounded">
                        {formData.elements || t("preview.notSet") || "未设置"}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {selectedMode === "code-aware" && (
                <div className="flex justify-between items-start p-3 bg-white border rounded-lg">
                  <div>
                    <span className="font-medium text-sm text-gray-700">{t("config.githubRepo")}</span>
                    <p className="text-sm text-gray-900 mt-1">{formData.github || t("preview.notSet") || "未设置"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* JSON Configuration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{t("preview.jsonConfig") || "JSON配置"}</h3>
              <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-2">
                <Copy className="w-3 h-3" />
                {copied ? t("preview.copied") || "已复制" : t("preview.copy") || "复制"}
              </Button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
              {generateConfigJSON()}
            </pre>
          </div>

          {/* Validation Status */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">{t("preview.validation") || "配置验证"}</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <CheckCircle className={`w-4 h-4 mr-2 ${formData.url ? "text-green-500" : "text-gray-400"}`} />
                <span className={formData.url ? "text-green-700" : "text-gray-600"}>
                  {t("config.websiteUrl")} {formData.url ? "✓" : "(必填)"}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className={`w-4 h-4 mr-2 ${formData.task ? "text-green-500" : "text-gray-400"}`} />
                <span className={formData.task ? "text-green-700" : "text-gray-600"}>
                  {t("config.taskDescription")} {formData.task ? "✓" : "(必填)"}
                </span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle className={`w-4 h-4 mr-2 ${formData.aspectRatio ? "text-green-500" : "text-gray-400"}`} />
                <span className={formData.aspectRatio ? "text-green-700" : "text-gray-600"}>
                  视频比例 {formData.aspectRatio ? "✓" : "(必填)"}
                </span>
              </div>
              {selectedMode === "url-prompt" && (
                <div className="flex items-center text-sm">
                  <CheckCircle className={`w-4 h-4 mr-2 ${formData.workflow ? "text-green-500" : "text-yellow-500"}`} />
                  <span className={formData.workflow ? "text-green-700" : "text-yellow-600"}>
                    {t("config.workflowHint")} {formData.workflow ? "✓" : "(推荐)"}
                  </span>
                </div>
              )}
              {selectedMode === "code-aware" && (
                <div className="flex items-center text-sm">
                  <CheckCircle className={`w-4 h-4 mr-2 ${formData.github ? "text-green-500" : "text-gray-400"}`} />
                  <span className={formData.github ? "text-green-700" : "text-gray-600"}>
                    {t("config.githubRepo")} {formData.github ? "✓" : "(必填)"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
