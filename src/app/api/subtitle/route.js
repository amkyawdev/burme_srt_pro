import { NextResponse } from 'next/server'

const API_KEY = process.env.YOUTUBE_API_KEY

export async function POST(request) {
  try {
    const body = await request.json()
    const { videoId } = body

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 })
    }

    if (API_KEY) {
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${API_KEY}&part=snippet`
        )
        if (res.ok) {
          const data = await res.json()
          if (data.items?.length > 0) {
            const { title, description } = data.items[0].snippet
            return NextResponse.json({
              success: true,
              srt: `1\n00:00:00,000 --> 00:00:03,000\n${title}\n\n2\n00:00:03,500 --> 00:00:06,000\nWelcome to Burme SRT Pro!\n\n3\n00:00:06,500 --> 00:00:10,000\n${(description || '').substring(0, 100)}\n\n4\n00:00:10,500 --> 00:00:14,000\nMade with ❤️ for Myanmar 🇲🇲`,
              videoId,
              title,
              source: 'YouTube API'
            })
          }
        }
      } catch (e) {
        console.error(e)
      }
    }

    await new Promise(r => setTimeout(r, 800))
    return NextResponse.json({
      success: true,
      srt: `1\n00:00:00,500 --> 00:00:03,000\nVideo ID: ${videoId}\n\n2\n00:00:03,500 --> 00:00:06,000\nWelcome to Burme SRT Pro!\n\n3\n00:00:06,500 --> 00:00:10,000\nAdd YOUTUBE_API_KEY in Vercel\nfor real data\n\n4\n00:00:14,500 --> 00:00:18,000\nMade with ❤️ for Myanmar 🇲🇲`,
      videoId,
      source: API_KEY ? 'error' : 'demo'
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
