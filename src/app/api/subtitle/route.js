import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { videoId, youtubeLink, text, voiceId, action, translateTo } = body

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || ''
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || ''

    console.log('Action:', action)
    console.log('Has GEMINI_KEY:', !!GEMINI_API_KEY)
    console.log('Has YOUTUBE_KEY:', !!YOUTUBE_API_KEY)
    console.log('Has ELEVENLABS_KEY:', !!ELEVENLABS_API_KEY)

    // Handle TTS - ElevenLabs
    if (action === 'tts') {
      if (!ELEVENLABS_API_KEY) {
        return NextResponse.json({ 
          success: false, 
          error: 'ELEVENLABS_API_KEY not set in Vercel' 
        }, { status: 400 })
      }
      
      if (!text || !text.trim()) {
        return NextResponse.json({ 
          success: false, 
          error: 'Please enter text' 
        }, { status: 400 })
      }

      const voice = voiceId || '21m00Tcm4TlvDq8ikWAM'
      console.log('Calling ElevenLabs with voice:', voice)

      const ttsResponse = await fetch(
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

      console.log('ElevenLabs status:', ttsResponse.status)

      if (!ttsResponse.ok) {
        const errorText = await ttsResponse.text()
        console.log('ElevenLabs error:', errorText)
        return NextResponse.json({ 
          success: false, 
          error: 'TTS API error: ' + ttsResponse.status 
        }, { status: 400 })
      }

      const arrayBuffer = await ttsResponse.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const base64 = buffer.toString('base64')
      
      return NextResponse.json({ 
        success: true, 
        audio: `data:audio/mpeg;base64,${base64}` 
      })
    }

    // Handle Translation
    if (action === 'translate') {
      if (!GEMINI_API_KEY) {
        return NextResponse.json({ 
          success: false, 
          error: 'GEMINI_API_KEY not set in Vercel' 
        }, { status: 400 })
      }
      
      if (!text || !text.trim()) {
        return NextResponse.json({ 
          success: false, 
          error: 'Please enter text' 
        }, { status: 400 })
      }

      const targetLang = translateTo || 'Burmese'
      
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `Translate to ${targetLang}: ${text}` }]
            }],
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 2048
            }
          })
        }
      )

      console.log('Gemini status:', geminiResponse.status)

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text()
        console.log('Gemini error:', errorText)
        return NextResponse.json({ 
          success: false, 
          error: 'Translation API error' 
        }, { status: 400 })
      }

      const data = await geminiResponse.json()
      const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!translatedText) {
        return NextResponse.json({ 
          success: false, 
          error: 'No translation result' 
        }, { status: 400 })
      }

      return NextResponse.json({ 
        success: true, 
        translatedText: translatedText.trim() 
      })
    }

    // Handle SRT from YouTube
    let videoIdToUse = videoId
    if (youtubeLink) {
      const match = youtubeLink.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
      if (match) videoIdToUse = match[1]
    }

    if (!videoIdToUse) {
      return NextResponse.json({ 
        success: false, 
        error: 'Please enter YouTube link' 
      }, { status: 400 })
    }

    let videoTitle = 'YouTube Video'
    let videoDescription = ''

    // Get YouTube video info
    if (YOUTUBE_API_KEY) {
      try {
        const ytResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?id=${videoIdToUse}&key=${YOUTUBE_API_KEY}&part=snippet`
        )
        
        if (ytResponse.ok) {
          const ytData = await ytResponse.json()
          if (ytData.items?.length > 0) {
            videoTitle = ytData.items[0].snippet.title
            videoDescription = ytData.items[0].snippet.description || ''
          }
        }
      } catch (e) {
        console.log('YouTube error:', e)
      }
    }

    // Generate SRT with Gemini
    if (GEMINI_API_KEY) {
      const srtPrompt = `Create SRT subtitle for YouTube video "${videoTitle}". 
Description: ${videoDescription}

Create 8 subtitle lines in SRT format:
1
00:00:00,000 --> 00:00:03,000
English subtitle

2
00:00:03,500 --> 00:00:06,000
English subtitle 2`

      const srtResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: srtPrompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096
            }
          })
        }
      )

      if (srtResponse.ok) {
        const srtData = await srtResponse.json()
        const srtContent = srtData.candidates?.[0]?.content?.parts?.[0]?.text
        
        if (srtContent) {
          return NextResponse.json({ 
            success: true, 
            srt: srtContent.trim(),
            videoId: videoIdToUse,
            title: videoTitle
          })
        }
      }
    }

    // Fallback
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
    
  } catch (error) {
    console.log('API Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Server error: ' + error.message 
    }, { status: 500 })
  }
}
