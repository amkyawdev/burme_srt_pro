// Extract YouTube video ID from various URL formats
export function extractVideoId(url) {
  if (!url) return null
  const match = url.match(/(?:v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

// Parse SRT content to array of subtitle objects
export function parseSRT(srtContent) {
  if (!srtContent) return []
  
  const subtitles = []
  const blocks = srtContent.trim().split(/\n\n+/)
  
  for (const block of blocks) {
    const lines = block.trim().split('\n')
    if (lines.length >= 3) {
      const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/)
      if (timeMatch) {
        subtitles.push({
          start: timeMatch[1],
          end: timeMatch[2],
          text: lines.slice(2).join('\n')
        })
      }
    }
  }
  
  return subtitles
}

// Mock subtitle fetch (for demo)
export function mockFetchSubtitle(videoId) {
  return `1
00:00:02,000 --> 00:00:05,000
YouTube Video: ${videoId}

2
00:00:05,500 --> 00:00:09,000
Hello! Welcome to Burme SRT Pro!

3
00:00:09,500 --> 00:00:13,000
Beautiful Myanmar subtitles!
Made with ❤️ in Myanmar 🇲🇲`
}

// Real Fetch wrapper
export async function fetchYouTubeSubtitles(videoId) {
  const response = await fetch('/api/subtitle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId })
  })
  const data = await response.json()
  return data.srt || mockFetchSubtitle(videoId)
}
