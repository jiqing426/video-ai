// 安装和配置Playwright的脚本
const { execSync } = require("child_process")

console.log("开始安装Playwright...")

try {
  // 安装Playwright
  execSync("npm install playwright", { stdio: "inherit" })

  // 安装浏览器
  execSync("npx playwright install", { stdio: "inherit" })

  console.log("✅ Playwright安装完成！")
  console.log("📝 支持的浏览器: Chromium, Firefox, WebKit")
  console.log("🎥 可以开始录制网站视频了！")
} catch (error) {
  console.error("❌ 安装失败:", error.message)
}
