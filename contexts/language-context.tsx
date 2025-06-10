"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

type Language = "zh" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  zh: {
    "header.title": "VideoGen AI",
    "header.aiPowered": "AI驱动",
    "hero.title": "智能视频生成平台",
    "hero.subtitle": "基于Playwright的AI驱动网站工作流程自动视频生成",
    "mode.urlOnly.title": "仅URL模式",
    "mode.urlOnly.description": "仅提供网站URL，AI自动分析并生成视频",
    "mode.urlOnly.feature1": "自动页面分析",
    "mode.urlOnly.feature2": "智能交互识别",
    "mode.urlOnly.feature3": "快速生成",
    "mode.urlPrompt.title": "URL+提示模式",
    "mode.urlPrompt.description": "提供URL和详细提示，获得更精确的视频内容",
    "mode.urlPrompt.feature1": "精确控制",
    "mode.urlPrompt.feature2": "自定义工作流程",
    "mode.urlPrompt.feature3": "高质量输出",
    "mode.codeAware.title": "代码感知模式",
    "mode.codeAware.description": "结合GitHub代码分析，生成最准确的演示视频",
    "mode.codeAware.feature1": "代码结构分析",
    "mode.codeAware.feature2": "智能元素定位",
    "mode.codeAware.feature3": "最高成功率",
    "common.successRate": "成功率",
    "config.title": "配置生成参数",
    "config.description": "根据选择的模式配置相应参数",
    "config.websiteUrl": "网站URL",
    "config.taskDescription": "任务描述",
    "config.workflowHint": "工作流程提示",
    "config.keyElements": "关键元素",
    "config.githubRepo": "GitHub仓库",
    "placeholder.url": "https://example.com",
    "placeholder.task": "演示用户注册流程",
    "placeholder.workflow": "1. 点击注册按钮\n2. 填写表单\n3. 提交注册",
    "placeholder.elements": "注册按钮, 用户名输入框, 密码输入框, 提交按钮",
    "placeholder.github": "https://github.com/username/repo",
    "tab.urlOnly": "仅URL",
    "tab.urlPrompt": "URL+提示",
    "tab.codeAware": "代码感知",
    "action.generate": "生成视频",
    "action.preview": "预览配置",
    // 添加视频相关的翻译
    "video.generationComplete": "视频生成完成",
    "video.newGeneration": "新建生成",
    "video.metadata": "视频元数据",
    "video.duration": "时长",
    "video.resolution": "分辨率",
    "video.size": "文件大小",
    "video.format": "格式",
    "video.created": "创建时间",
    "video.actions": "操作",
    "video.download": "下载视频",
    "video.share": "分享视频",
    "video.embedCode": "获取嵌入代码",
    "video.autoSaved": "视频已自动保存到您的账户",
    "video.notSupported": "您的浏览器不支持视频播放",
    // 添加预览相关的翻译
    "preview.title": "配置预览",
    "preview.description": "查看当前配置的详细信息",
    "preview.selectedMode": "已选择模式",
    "preview.configDetails": "配置详情",
    "preview.notSet": "未设置",
    "preview.jsonConfig": "JSON配置",
    "preview.copy": "复制",
    "preview.copied": "已复制",
    "preview.validation": "配置验证",
  },
  en: {
    "header.title": "VideoGen AI",
    "header.aiPowered": "AI Powered",
    "hero.title": "Intelligent Video Generation Platform",
    "hero.subtitle": "AI-powered automatic video generation for website workflows using Playwright",
    "mode.urlOnly.title": "URL Only Mode",
    "mode.urlOnly.description": "Provide only website URL, AI automatically analyzes and generates video",
    "mode.urlOnly.feature1": "Automatic page analysis",
    "mode.urlOnly.feature2": "Smart interaction recognition",
    "mode.urlOnly.feature3": "Quick generation",
    "mode.urlPrompt.title": "URL + Prompt Mode",
    "mode.urlPrompt.description": "Provide URL and detailed prompts for more precise video content",
    "mode.urlPrompt.feature1": "Precise control",
    "mode.urlPrompt.feature2": "Custom workflows",
    "mode.urlPrompt.feature3": "High-quality output",
    "mode.codeAware.title": "Code-Aware Mode",
    "mode.codeAware.description": "Combine GitHub code analysis to generate the most accurate demo videos",
    "mode.codeAware.feature1": "Code structure analysis",
    "mode.codeAware.feature2": "Smart element targeting",
    "mode.codeAware.feature3": "Highest success rate",
    "common.successRate": "Success Rate",
    "config.title": "Configure Generation Parameters",
    "config.description": "Configure parameters according to selected mode",
    "config.websiteUrl": "Website URL",
    "config.taskDescription": "Task Description",
    "config.workflowHint": "Workflow Hint",
    "config.keyElements": "Key Elements",
    "config.githubRepo": "GitHub Repository",
    "placeholder.url": "https://example.com",
    "placeholder.task": "Demonstrate user registration process",
    "placeholder.workflow": "1. Click register button\n2. Fill form\n3. Submit registration",
    "placeholder.elements": "Register button, username input, password input, submit button",
    "placeholder.github": "https://github.com/username/repo",
    "tab.urlOnly": "URL Only",
    "tab.urlPrompt": "URL + Prompt",
    "tab.codeAware": "Code Aware",
    "action.generate": "Generate Video",
    "action.preview": "Preview Config",
    // 添加视频相关的英文翻译
    "video.generationComplete": "Video Generation Complete",
    "video.newGeneration": "New Generation",
    "video.metadata": "Video Metadata",
    "video.duration": "Duration",
    "video.resolution": "Resolution",
    "video.size": "File Size",
    "video.format": "Format",
    "video.created": "Created",
    "video.actions": "Actions",
    "video.download": "Download Video",
    "video.share": "Share Video",
    "video.embedCode": "Get Embed Code",
    "video.autoSaved": "Video automatically saved to your account",
    "video.notSupported": "Your browser does not support the video tag",
    // 添加预览相关的英文翻译
    "preview.title": "Configuration Preview",
    "preview.description": "View detailed information about current configuration",
    "preview.selectedMode": "Selected Mode",
    "preview.configDetails": "Configuration Details",
    "preview.notSet": "Not Set",
    "preview.jsonConfig": "JSON Configuration",
    "preview.copy": "Copy",
    "preview.copied": "Copied",
    "preview.validation": "Configuration Validation",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("zh")

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
