/**
 * 获取可靠的测试视频URL
 * 这些是公共的测试视频源
 */
export function getTestVideoUrls() {
  return [
    // Big Buck Bunny - 开源测试视频
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  ]
}

/**
 * 生成一个彩色的SVG缩略图
 */
export function generateColorfulThumbnail(title = "AI Generated Video"): Buffer {
  const svgContent = `
    <svg width="320" height="180" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.3"/>
        </filter>
      </defs>
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="url(#bg)"/>
      
      <!-- Play button -->
      <circle cx="160" cy="90" r="35" fill="white" opacity="0.9" filter="url(#shadow)"/>
      <polygon points="145,75 145,105 180,90" fill="#667eea"/>
      
      <!-- Title -->
      <text x="160" y="140" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="white" filter="url(#shadow)">
        ${title}
      </text>
      
      <!-- Timestamp -->
      <text x="160" y="155" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="white" opacity="0.8">
        ${new Date().toLocaleString()}
      </text>
      
      <!-- Decorative elements -->
      <circle cx="50" cy="40" r="3" fill="white" opacity="0.6"/>
      <circle cx="270" cy="140" r="2" fill="white" opacity="0.4"/>
      <circle cx="300" cy="30" r="4" fill="white" opacity="0.5"/>
    </svg>
  `
  return Buffer.from(svgContent)
}

/**
 * 创建一个Canvas生成的视频帧
 */
export function generateVideoFrame(width = 1280, height = 720, frameNumber = 0): string {
  // 在服务器端我们不能使用Canvas，所以返回一个SVG动画
  const svgContent = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg${frameNumber}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(${frameNumber * 2}, 70%, 50%);stop-opacity:1" />
          <stop offset="100%" style="stop-color:hsl(${frameNumber * 2 + 60}, 70%, 30%);stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Animated background -->
      <rect width="100%" height="100%" fill="url(#bg${frameNumber})"/>
      
      <!-- Moving circle -->
      <circle cx="${50 + ((frameNumber * 5) % (width - 100))}" cy="${height / 2}" r="30" fill="white" opacity="0.8"/>
      
      <!-- Frame counter -->
      <text x="${width / 2}" y="${height / 2}" text-anchor="middle" font-family="Arial" font-size="48" fill="white" font-weight="bold">
        Frame ${frameNumber}
      </text>
      
      <!-- Time indicator -->
      <text x="${width / 2}" y="${height / 2 + 60}" text-anchor="middle" font-family="Arial" font-size="24" fill="white">
        ${(frameNumber / 30).toFixed(1)}s
      </text>
    </svg>
  `

  return `data:image/svg+xml;base64,${Buffer.from(svgContent).toString("base64")}`
}
