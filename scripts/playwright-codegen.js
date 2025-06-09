// Playwright代码生成器脚本
const { execSync } = require("child_process")

console.log("🎬 启动Playwright代码生成器...")
console.log("📋 使用说明:")
console.log("1. 浏览器窗口将自动打开")
console.log("2. 在浏览器中执行您想要录制的操作")
console.log("3. 代码将自动生成在右侧面板")
console.log("4. 复制生成的代码到您的测试文件中")
console.log("5. 按Ctrl+C退出录制")

try {
  // 启动代码生成器，默认录制localhost:3000
  execSync("npx playwright codegen http://localhost:3000", {
    stdio: "inherit",
    cwd: process.cwd(),
  })
} catch (error) {
  if (error.signal === "SIGINT") {
    console.log("\n✅ 录制已停止")
  } else {
    console.error("❌ 代码生成器启动失败:", error.message)
    console.log("\n🔧 故障排除:")
    console.log("1. 确保已安装Playwright: npm install playwright")
    console.log("2. 确保已安装浏览器: npx playwright install")
    console.log("3. 确保开发服务器正在运行: npm run dev")
  }
}
