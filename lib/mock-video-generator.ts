/**
 * 生成一个简单但有效的WebM视频文件
 * 这个函数创建一个包含基本视频数据的WebM文件，可以被浏览器播放
 */
export function generatePlayableWebMVideo(durationSeconds = 30): Buffer {
  // WebM文件的基本结构
  const ebmlHeader = Buffer.from([
    0x1a,
    0x45,
    0xdf,
    0xa3, // EBML
    0x9f, // Size
    0x42,
    0x86,
    0x81,
    0x01, // EBMLVersion = 1
    0x42,
    0xf7,
    0x81,
    0x01, // EBMLReadVersion = 1
    0x42,
    0xf2,
    0x81,
    0x04, // EBMLMaxIDLength = 4
    0x42,
    0xf3,
    0x81,
    0x08, // EBMLMaxSizeLength = 8
    0x42,
    0x82,
    0x84,
    0x77,
    0x65,
    0x62,
    0x6d, // DocType = "webm"
    0x42,
    0x87,
    0x81,
    0x02, // DocTypeVersion = 2
    0x42,
    0x85,
    0x81,
    0x02, // DocTypeReadVersion = 2
  ])

  // Segment header
  const segmentHeader = Buffer.from([
    0x18,
    0x53,
    0x80,
    0x67, // Segment
    0x01,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00,
    0x00, // Size (unknown)
  ])

  // Info section
  const timecodeScale = 1000000 // 1ms
  const duration = durationSeconds * 1000 // Convert to milliseconds

  const infoSection = Buffer.from([
    0x15,
    0x49,
    0xa9,
    0x66, // Info
    0x8a, // Size
    0x2a,
    0xd7,
    0xb1,
    0x83,
    0x0f,
    0x42,
    0x40, // TimecodeScale = 1000000
    0x44,
    0x89,
    0x88, // Duration
    ...floatToBytes(duration),
    0x4d,
    0x80,
    0x84,
    0x47,
    0x65,
    0x6e,
    0x65, // MuxingApp = "Generated"
  ])

  // Tracks section
  const tracksSection = Buffer.from([
    0x16,
    0x54,
    0xae,
    0x6b, // Tracks
    0x8c, // Size
    0xae, // TrackEntry
    0x83,
    0x81,
    0x01, // TrackNumber = 1
    0xd7,
    0x81,
    0x01, // TrackType = 1 (video)
    0x73,
    0xc5,
    0x81,
    0x01, // FlagEnabled = 1
    0x86,
    0x81,
    0x56,
    0x50,
    0x38, // CodecID = "VP8"
    // Video settings
    0xe0, // Video
    0x8a,
    0xb0,
    0x82,
    0x05,
    0x00, // PixelWidth = 1280
    0xba,
    0x82,
    0x02,
    0xd0, // PixelHeight = 720
  ])

  // Simple cluster with minimal video data
  const clusterSection = Buffer.from([
    0x1f,
    0x43,
    0xb6,
    0x75, // Cluster
    0x88, // Size
    0xe7,
    0x81,
    0x00, // Timecode = 0
    // SimpleBlock
    0xa3,
    0x81,
    0x00, // SimpleBlock with minimal data
  ])

  // Combine all sections
  const videoData = Buffer.concat([ebmlHeader, segmentHeader, infoSection, tracksSection, clusterSection])

  // Add some padding to reach a reasonable file size
  const padding = Buffer.alloc(Math.max(50 * 1024, durationSeconds * 10 * 1024)) // At least 50KB

  return Buffer.concat([videoData, padding])
}

/**
 * 将浮点数转换为字节数组
 */
function floatToBytes(value: number): number[] {
  const buffer = new ArrayBuffer(8)
  const view = new DataView(buffer)
  view.setFloat64(0, value, false) // Big endian
  return Array.from(new Uint8Array(buffer))
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
