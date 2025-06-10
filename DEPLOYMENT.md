# 部署指南

## 🚀 快速开始

### 1. 环境变量配置

创建 `.env.local` 文件：

\`\`\`env
# 必需的API密钥
OPENAI_API_KEY=your_openai_api_key_here
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here

# 环境标识
DOCKER=true
ENABLE_REAL_RECORDING=true
VIDEO_QUALITY=medium
DEFAULT_TIMEOUT=30000
DEBUG_RECORDING=true
\`\`\`

### 2. Docker部署（推荐）

\`\`\`bash
# 1. 构建Docker镜像
npm run docker:build

# 2. 运行容器
npm run docker:run

# 3. 访问应用
open http://localhost:3000
\`\`\`

### 3. 本地开发

\`\`\`bash
# 1. 安装依赖
npm install

# 2. 安装Playwright浏览器
npx playwright install chromium

# 3. 启动开发服务器
npm run dev

# 4. 访问测试页面
open http://localhost:3000/test
\`\`\`

### 4. Vercel部署

\`\`\`bash
# 1. 部署到Vercel
vercel deploy

# 2. 配置环境变量
vercel env add OPENAI_API_KEY
vercel env add BLOB_READ_WRITE_TOKEN
\`\`\`

## 🧪 功能测试

### 测试页面
访问 `/test` 页面进行完整的功能测试：

1. **环境检测** - 自动检测运行环境能力
2. **录制测试** - 执行完整录制流程
3. **结果验证** - 查看生成的视频和元数据

### 测试用例
- ✅ 基础页面录制
- ✅ 交互元素识别
- ✅ 视频生成和处理
- ✅ 错误处理和恢复

## 🔧 故障排除

### Docker环境问题
\`\`\`bash
# 检查Docker状态
docker ps

# 查看容器日志
docker logs <container_id>

# 重新构建镜像
docker build --no-cache -t video-ai .
\`\`\`

### Playwright问题
\`\`\`bash
# 重新安装浏览器
npx playwright install --force chromium

# 检查浏览器可用性
npx playwright install-deps
\`\`\`

### 环境变量问题
\`\`\`bash
# 验证环境变量
echo $DOCKER
echo $OPENAI_API_KEY

# 重新加载环境
source .env.local
\`\`\`

## 📊 性能优化

### Docker优化
- 使用多阶段构建减少镜像大小
- 配置适当的内存和CPU限制
- 启用Docker层缓存

### 录制优化
- 调整视频质量设置
- 优化超时配置
- 使用适当的视频分辨率

### 存储优化
- 定期清理临时文件
- 配置Blob存储生命周期
- 压缩视频文件大小
