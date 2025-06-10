# VideoGen AI - 智能视频生成平台

基于Playwright和AI的智能网站录制平台，支持多种部署环境。

## 🚀 部署选项

### 1. Docker 部署（推荐 - 支持真实录制）

\`\`\`bash
# 构建Docker镜像
npm run docker:build

# 运行容器
npm run docker:run
\`\`\`

Docker环境包含：
- ✅ Playwright + Chromium
- ✅ FFmpeg视频处理
- ✅ 完整的录制功能

### 2. Vercel 部署（模拟录制）

\`\`\`bash
# 部署到Vercel
vercel deploy
\`\`\`

Vercel环境特性：
- ⚠️ 使用模拟录制（无浏览器支持）
- ✅ AI驱动的步骤生成
- ✅ 完整的UI体验

### 3. 本地开发

\`\`\`bash
# 安装依赖
npm install

# 安装Playwright浏览器
npx playwright install chromium

# 启动开发服务器
npm run dev
\`\`\`

## 🔧 环境变量

创建 `.env.local` 文件：

\`\`\`env
# OpenAI API密钥（用于AI步骤生成）
OPENAI_API_KEY=your_openai_api_key

# Vercel Blob存储令牌
BLOB_READ_WRITE_TOKEN=your_blob_token
\`\`\`

## 🎯 功能特性

### 智能录制模式
- **URL-only**: AI自动分析页面并生成交互
- **URL+提示**: 结合用户提示生成精确步骤
- **代码感知**: 分析GitHub仓库优化录制策略

### 环境自适应
- 🔍 自动检测运行环境能力
- 🎬 支持真实Playwright录制（Docker/本地）
- 🎭 智能降级到模拟录制（Vercel）
- 📹 FFmpeg视频处理和优化

### AI驱动
- 🤖 GPT-4驱动的交互步骤生成
- 🎯 智能元素定位策略
- 📊 GitHub代码仓库分析
- 🔄 多策略备用机制

## 📦 技术栈

- **前端**: Next.js 15, React 18, Tailwind CSS
- **录制**: Playwright (Chromium)
- **视频处理**: FFmpeg
- **AI**: OpenAI GPT-4o
- **存储**: Vercel Blob
- **部署**: Docker, Vercel

## 🛠️ 开发指南

### 添加新的录制策略

1. 在 `lib/playwright-recorder.ts` 中添加新的动作类型
2. 在 `generateActionsFromAI` 中更新AI提示
3. 测试不同环境下的兼容性

### 扩展视频处理

1. 修改 `lib/video-processor.ts` 添加新格式
2. 更新 `VideoProcessingOptions` 接口
3. 在API路由中集成新功能

## 🔍 故障排除

### Playwright录制失败
- 检查Docker环境是否正确安装Chromium
- 验证环境变量配置
- 查看控制台日志获取详细错误信息

### 视频处理问题
- 确认FFmpeg在环境中可用
- 检查临时目录权限
- 验证视频文件格式支持

### AI步骤生成失败
- 验证OpenAI API密钥配置
- 检查API配额和限制
- 查看网络连接状态

## 📄 许可证

MIT License
