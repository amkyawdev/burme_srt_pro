import { NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

export async function POST(request) {
  try {
    const body = await request.json()
    const { videoId, youtubeLink } = body

    // Extract video ID from link if provided
    let videoIdToUse = videoId
    if (youtubeLink && !videoIdToUse) {
      const match = youtubeLink.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
      if (match) videoIdToUse = match[1]
    }

    if (!videoIdToUse) {
      return NextResponse.json({ error: 'Video ID or link required' }, { status: 400 })
    }

    // If Gemini API available, use it for smart subtitle generation
    if (GEMINI_API_KEY) {
      try {
        // Get video info first
        let videoTitle = 'YouTube Video'
        let videoDescription = ''
        
        if (YOUTUBE_API_KEY) {
          const ytRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoIdToUse}&key=${YOUTUBE_API_KEY}&part=snippet`
          )
          if (ytRes.ok) {
            const ytData = await ytRes.json()
            if (ytData.items?.length > 0) {
              videoTitle = ytData.items[0].snippet.title
              videoDescription = ytData.items[0].snippet.description || ''
            }
          }
        }

        // Use Gemini to generate subtitle content
        const geminiPrompt = `Create a proper SRT subtitle file for a YouTube video.
Video Title: ${videoTitle}
Video Description: ${videoDescription}

Generate 5-8 subtitle entries with proper timing (SRT format):
- Each entry: number, timestamp --> timestamp, text
- Timestamps: 00:00:00,000 --> 00:00:03,000 format
- Include Myanmar language support where appropriate
- Make it sound natural and engaging

SRT Format:
1
00:00:00,000 --> 00:00:03,000
First subtitle text

2
00:00:03,500 --> 00:00:06,000
Second subtitle text`

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: geminiPrompt }] }],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
              }
            })
          }
        )

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json()
          const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
          
          if (generatedText) {
            // Extract SRT from Gemini response
            const srtMatch = generatedText.match(/[\s\S]*?\d+\s*\n\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}[\s\S]*/)
            if (srtMatch) {
              return NextResponse.json({
                success: true,
                srt: srtMatch[0],
                videoId: videoIdToUse,
                title: videoTitle,
                source: 'Gemini AI'
              })
            }
          }
        }
      } catch (e) {
        console.error('Gemini error:', e)
      }
    }

    // Fallback: Use YouTube API if available
    if (YOUTUBE_API_KEY) {
      try {
        const ytRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?id=${videoIdToUse}&key=${YOUTUBE_API_KEY}&part=snippet`
        )
        if (ytRes.ok) {
          const ytData = await ytRes.json()
          if (ytData.items?.length > 0) {
            const { title, description } = ytData.items[0].snippet
            return NextResponse.json({
              success: true,
              srt: `1\n00:00:00,000 --> 00:00:03,000\n${title}\n\n2\n00:00:03,500 --> 00:00:06,000\nWelcome to Burme SRT Pro!\n\n3\n00:00:06,500 --> 00:00:10,000\n${(description || '').substring(0, 100)}\n\n4\n00:00:10,500 --> 00:00:14,000\nMade with ❤️ for Myanmar 🇲🇲`,
              videoId: videoIdToUse,
              title,
              source: 'YouTube API'
            })
          }
        }
      } catch (e) {
        console.error('YouTube API error:', e)
      }
    }

    // Demo mode fallback
    await new Promise(r => setTimeout(r, 800))
    return NextResponse.json({
      success: true,
      srt: `1
00:00:00,500 --> 00:00:03,000
Video ID: ${videoIdToUse}

2
00:00:03,500 --> 00:00:06,000
Welcome to Burme SRT Pro!

3
00:00:06,500 --> 00:00:10,000
Add GEMINI_API_KEY in Vercel
for AI-generated subtitles

4
00:00:14,500 --> 00:00:18,000
Made with ❤️ for Myanmar 🇲🇲`,
      videoId: videoIdToUse,
      source: GEMINI_API_KEY ? 'error' : 'demo'
    })
  } catch (e) {
    console.error('Error:', e)
    return NextResponse.json({ error: 'Failed to generate subtitle' }, { status: 500 })
  }
}
