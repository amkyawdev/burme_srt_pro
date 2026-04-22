import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { videoId, youtubeLink, text, voiceId, action, translateTo } = body

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

    // Handle TTS - ElevenLabs
    if (action === 'tts') {
      if (!ELEVENLABS_API_KEY) {
        return NextResponse.json({ success: false, error: 'Add ELEVENLABS_API_KEY in Vercel Settings' })
      }
      if (!text) return NextResponse.json({ success: false, error: 'Enter text' })

      try {
        const voice = voiceId || '21m00Tcm4TlvDq8ikWAM'
        
        const ttsRes = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'xi-api-key': ELEVENLABS_API_KEY
            },
            body: JSON.stringify({ 
              text: text, 
              model_id: 'eleven_multilingual_v2'
            })
          }
        )

        if (ttsRes.ok) {
          const audioBuffer = await ttsRes.arrayBuffer()
          const base64Audio = Buffer.from(audioBuffer).toString('base64')
          return NextResponse.json({ 
            success: true, 
            audio: `data:audio/mpeg;base64,${base64Audio}` 
          })
        } else {
          const errorData = await ttsRes.json()
          return NextResponse.json({ 
            success: false, 
            error: errorData.detail?.message || 'TTS failed' 
          })
        }
      } catch (e) {
        return NextResponse.json({ success: false, error: 'TTS error: ' + e.message })
      }
    }

    // Handle Translation - Gemini
    if (action === 'translate') {
      if (!GEMINI_API_KEY) {
        return NextResponse.json({ success: false, error: 'Add GEMINI_API_KEY in Vercel Settings' })
      }
      if (!text) return NextResponse.json({ success: false, error: 'Enter text' })

      try {
        const target = translateTo || 'Burmese'
        
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ 
                parts: [{ 
                  text: `Translate to ${target}: ${text}` 
                }] 
              }],
              generationConfig: { 
                temperature: 0.3, 
                maxOutputTokens: 2048 
              }
            })
          }
        )

        if (geminiRes.ok) {
          const data = await geminiRes.json()
          const result = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (result) {
            return NextResponse.json({ 
              success: true, 
              translatedText: result.trim() 
            })
          }
        }
        
        return NextResponse.json({ 
          success: false, 
          error: 'Translation failed - check API key' 
        })
      } catch (e) {
        return NextResponse.json({ success: false, error: 'Translation error: ' + e.message })
      }
    }

    // Handle SRT - YouTube + Gemini
    let videoIdToUse = videoId
    if (youtubeLink) {
      const match = youtubeLink.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
      if (match) videoIdToUse = match[1]
    }

    if (!videoIdToUse) {
      return NextResponse.json({ success: false, error: 'Enter YouTube link' })
    }

    let videoTitle = 'YouTube Video'
    let videoDescription = ''

    // Get YouTube video info
    if (YOUTUBE_API_KEY) {
      try {
        const ytRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?id=${videoIdToUse}&key=${YOUTUBE_API_KEY}&part=snippet,statistics`
        )
        if (ytRes.ok) {
          const ytData = await ytRes.json()
          if (ytData.items?.length > 0) {
            videoTitle = ytData.items[0].snippet.title
            videoDescription = ytData.items[0].snippet.description || ''
          }
        }
      } catch (e) {
        console.log('YouTube API error:', e)
      }
    }

    // Generate SRT with Gemini
    if (GEMINI_API_KEY) {
      try {
        const prompt = `Create SRT subtitle format for YouTube video "${videoTitle}". 
Description: ${videoDescription}

Create 8-10 subtitle segments in proper SRT format with timestamps.
Include both English and Myanmar Burmese translations.
SRT format:
1
00:00:00,000 --> 00:00:03,000
Subtitle text here

2
00:00:03,500 --> 00:00:06,000
Next subtitle`

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { 
                temperature: 0.7, 
                maxOutputTokens: 4096 
              }
            })
          }
        )

        if (geminiRes.ok) {
          const data = await geminiRes.json()
          const result = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (result) {
            return NextResponse.json({ 
              success: true, 
              srt: result.trim(),
              videoId: videoIdToUse,
              title: videoTitle
            })
          }
        }
      } catch (e) {
        console.log('Gemini error:', e)
      }
    }

    // Fallback demo
    return NextResponse.json({
      success: true,
      srt: `1
00:00:00,500 --> 00:00:03,000
${videoTitle}

2
00:00:03,500 --> 00:00:06,000
Welcome to Burme SRT Pro!

3
00:00:06,500 --> 00:00:10,000
Made with ❤️ for Myanmar 🇲🇲`,
      videoId: videoIdToUse,
      title: videoTitle
    })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Error: ' + e.message }, { status: 500 })
  }
}
