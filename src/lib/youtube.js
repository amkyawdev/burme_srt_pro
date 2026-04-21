// Extract YouTube Video ID from various URL formats
export function extractVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^[a-zA-Z0-9_-]{11}$/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Mock SRT Fetch - simulates network delay
export function mockFetchSubtitle(videoId) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockSRT = `1
00:00:02,000 --> 00:00:05,000
YouTube Video: ${videoId}

2
00:00:05,500 --> 00:00:09,000
Hello! This video is for

3
00:00:09,500 --> 00:00:13,000
testing Burme SRT Pro!
beautiful Myanmar subtitles!

4
00:00:13,500 --> 00:00:17,000
This is a sample subtitle for testing.
Perfect for Myanmar content creators!

5
00:00:17,500 --> 00:00:21,000
Download & Share with your friends 🎬
Made with ❤️ in Myanmar 🇲🇲`
      resolve(mockSRT)
    }, 1100) // 1.1 second delay
  })
}

// Parse SRT text to array of subtitle lines
export function parseSRT(text) {
  const subtitles = []
  const blocks = text.trim().split(/\n\n+/)
  
  for (const block of blocks) {
    const lines = block.trim().split('\n')
    if (lines.length >= 3) {
      const textLines = lines.slice(2)
      const subtitleText = textLines.join('\n').replace(/\n/g, ' ')
      if (subtitleText.trim()) {
        subtitles.push(subtitleText.trim())
      }
    }
  }
  
  return subtitles
}