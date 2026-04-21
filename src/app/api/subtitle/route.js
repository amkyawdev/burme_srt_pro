import { NextResponse } from 'next/server'

// Mock subtitle data generator
function generateMockSRT(videoId) {
  const timestamp = Date.now()
  return `1
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
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { videoId } = body

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      )
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1100))

    // Generate mock SRT
    const srt = generateMockSRT(videoId)

    return NextResponse.json({ 
      success: true, 
      srt,
      videoId 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch subtitle' },
      { status: 500 }
    )
  }
}