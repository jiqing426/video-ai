"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

type Language = "zh" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  zh: {
    // Header
    "header.title": "VideoGen AI",
    "header.aiPowered": "AI驱动",

    // Hero
    "hero.title": "智能视频生成平台",
    "hero.subtitle": "基于AI的网站工作流程视频自动生成，支持多种模式，确保高成功率和专业品质",

    // Modes
    "mode.urlOnly.title": "仅URL模式",
    "mode.urlOnly.description": "AI自动分析网站结构，识别UI模式",
    "mode.urlOnly.feature1": "自动UI识别",
    "mode.urlOnly.feature2": "语义HTML分析",
    "mode.urlOnly.feature3": "标准框架支持",

    "mode.urlPrompt.title": "URL+提示模式",
    "mode.urlPrompt.description": "结合AI分析与用户指导，提高可靠性",
    "mode.urlPrompt.feature1": "工作流提示",
    "mode.urlPrompt.feature2": "关键元素定位",
    "mode.urlPrompt.feature3": "自定义流程",

    "mode.codeAware.title": "代码感知模式",
    "mode.codeAware.description": "分析源代码，提取测试模式，最高可靠性",
    "mode.codeAware.feature1": "源代码分析",
    "mode.codeAware.feature2": "测试模式提取",
    "mode.codeAware.feature3": "最大可靠性",

    "common.successRate": "成功率",

    // Configuration
    "config.title": "配置生成参数",
    "config.description": "根据选择的模式配置相应参数",
    "config.websiteUrl": "网站URL",
    "config.taskDescription": "任务描述",
    "config.workflowHint": "工作流提示",
    "config.keyElements": "关键要素 (JSON格式)",
    "config.githubRepo": "GitHub仓库",

    // Placeholders
    "placeholder.url": "https://myapp.com",
    "placeholder.task": "显示用户注册流程",
    "placeholder.workflow": "点击注册 → 填写表单 → 验证电子邮件 → 欢迎页面",
    "placeholder.elements":
      '{"注册按钮": ".btn-register, [data-testid=\'signup\']", "电子邮件字段": "#email, input[type=\'email\']"}',
    "placeholder.github": "https://github.com/company/myapp",

    // Technical Architecture
    "tech.title": "技术架构优势",
    "tech.verified.title": "经过验证的基础",
    "tech.verified.feature1": "Playwright浏览器自动化进行真实UI录制",
    "tech.verified.feature2": "时间线精度捕捉准确的交互时间",
    "tech.verified.feature3": "同步TTS，语音速率一致",
    "tech.verified.feature4": "专业构图创建可发布的视频",

    "tech.innovation.title": "核心创新",
    "tech.innovation.feature1": "测试优先验证 - 永不录制中断的工作流程",
    "tech.innovation.feature2": "多工作流候选生成",
    "tech.innovation.feature3": "无头模式预验证",
    "tech.innovation.feature4": "多策略元素检测系统",

    // Actions
    "action.generate": "开始生成视频",
    "action.generating": "生成中...",
    "action.preview": "预览配置",
    "progress.title": "正在生成视频...",
    "progress.estimatedTime": "预计完成时间",
    "progress.minutes": "分钟",

    // Alert
    "alert.hierarchy": "元素检测可靠性层次：",
    "alert.hierarchyText": "测试ID (95%) → 语义标签 (85%) → 内容匹配 (70%) → CSS类 (50%) → 位置选择器 (30%)",

    // Tabs
    "tab.urlOnly": "仅URL",
    "tab.urlPrompt": "URL+提示",
    "tab.codeAware": "代码感知",
    "language.chinese": "中文",
    "language.english": "English",

    // Preview
    "preview.title": "配置预览",
    "preview.description": "查看当前配置的详细信息",
    "preview.selectedMode": "已选择模式",
    "preview.configDetails": "配置详情",
    "preview.notSet": "未设置",
    "preview.jsonConfig": "JSON配置",
    "preview.copy": "复制",
    "preview.copied": "已复制",
    "preview.validation": "配置验证",

    // Video
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
    "video.notSupported": "您的浏览器不支持视频标签",
  },
  en: {
    // Header
    "header.title": "VideoGen AI",
    "header.aiPowered": "AI Powered",

    // Hero
    "hero.title": "Intelligent Video Generation Platform",
    "hero.subtitle":
      "AI-powered automatic video generation for website workflows, supporting multiple modes with high success rates and professional quality",

    // Modes
    "mode.urlOnly.title": "URL Only Mode",
    "mode.urlOnly.description": "AI automatically analyzes website structure and identifies UI patterns",
    "mode.urlOnly.feature1": "Automatic UI Recognition",
    "mode.urlOnly.feature2": "Semantic HTML Analysis",
    "mode.urlOnly.feature3": "Standard Framework Support",

    "mode.urlPrompt.title": "URL + Prompt Mode",
    "mode.urlPrompt.description": "Combines AI analysis with user guidance for improved reliability",
    "mode.urlPrompt.feature1": "Workflow Prompts",
    "mode.urlPrompt.feature2": "Key Element Targeting",
    "mode.urlPrompt.feature3": "Custom Workflows",

    "mode.codeAware.title": "Code-Aware Mode",
    "mode.codeAware.description": "Analyzes source code and extracts test patterns for maximum reliability",
    "mode.urlAware.feature1": "Source Code Analysis",
    "mode.urlAware.feature2": "Test Pattern Extraction",
    "mode.urlAware.feature3": "Maximum Reliability",

    "common.successRate": "Success Rate",

    // Configuration
    "config.title": "Configure Generation Parameters",
    "config.description": "Configure parameters according to the selected mode",
    "config.websiteUrl": "Website URL",
    "config.taskDescription": "Task Description",
    "config.workflowHint": "Workflow Hint",
    "config.keyElements": "Key Elements (JSON Format)",
    "config.githubRepo": "GitHub Repository",

    // Placeholders
    "placeholder.url": "https://myapp.com",
    "placeholder.task": "Show user registration process",
    "placeholder.workflow": "Click Register → Fill Form → Verify Email → Welcome Page",
    "placeholder.elements":
      '{"Register Button": ".btn-register, [data-testid=\'signup\']", "Email Field": "#email, input[type=\'email\']"}',
    "placeholder.github": "https://github.com/company/myapp",

    // Technical Architecture
    "tech.title": "Technical Architecture Advantages",
    "tech.verified.title": "Proven Foundation",
    "tech.verified.feature1": "Playwright browser automation for real UI recording",
    "tech.verified.feature2": "Timeline precision capturing accurate interaction timing",
    "tech.verified.feature3": "Synchronized TTS with consistent voice rate",
    "tech.verified.feature4": "Professional composition for publishable videos",

    "tech.innovation.title": "Core Innovation",
    "tech.innovation.feature1": "Test-first validation - never record broken workflows",
    "tech.innovation.feature2": "Multiple workflow candidate generation",
    "tech.innovation.feature3": "Headless mode pre-validation",
    "tech.innovation.feature4": "Multi-strategy element detection system",

    // Actions
    "action.generate": "Start Video Generation",
    "action.generating": "Generating...",
    "action.preview": "Preview Configuration",
    "progress.title": "Generating Video...",
    "progress.estimatedTime": "Estimated completion time",
    "progress.minutes": "minutes",

    // Alert
    "alert.hierarchy": "Element Detection Reliability Hierarchy:",
    "alert.hierarchyText":
      "Test ID (95%) → Semantic Labels (85%) → Content Matching (70%) → CSS Classes (50%) → Position Selectors (30%)",

    // Tabs
    "tab.urlOnly": "URL Only",
    "tab.urlPrompt": "URL + Prompt",
    "tab.codeAware": "Code Aware",
    "language.chinese": "中文",
    "language.english": "English",

    // Preview
    "preview.title": "Configuration Preview",
    "preview.description": "View detailed information about current configuration",
    "preview.selectedMode": "Selected Mode",
    "preview.configDetails": "Configuration Details",
    "preview.notSet": "Not Set",
    "preview.jsonConfig": "JSON Configuration",
    "preview.copy": "Copy",
    "preview.copied": "Copied",
    "preview.validation": "Configuration Validation",

    // Video
    "video.generationComplete": "Video Generation Complete",
    "video.newGeneration": "New Generation",
    "video.metadata": "Video Metadata",
    "video.duration": "Duration",
    "video.resolution": "Resolution",
    "video.size": "File Size",
    "video.format": "Format",
    "video.created": "Created At",
    "video.actions": "Actions",
    "video.download": "Download Video",
    "video.share": "Share Video",
    "video.embedCode": "Get Embed Code",
    "video.autoSaved": "Video has been automatically saved to your account",
    "video.notSupported": "Your browser does not support the video tag",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
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
