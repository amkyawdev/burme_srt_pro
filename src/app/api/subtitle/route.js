import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    const { videoId, youtubeLink, text, voiceId, action, translateTo } = body

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

    // Handle TTS action
    if (action === 'tts') {
      if (!ELEVENLABS_API_KEY) {
        return NextResponse.json({ success: false, error: 'ElevenLabs API key needed' })
      }
      if (!text) return NextResponse.json({ success: false, error: 'Text required' })

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
            body: JSON.stringify({ text: text, model_id: 'eleven_monolingual_v1' })
          }
        )

        if (ttsRes.ok) {
          const audioBuffer = await ttsRes.arrayBuffer()
          const base64Audio = Buffer.from(audioBuffer).toString('base64')
          return NextResponse.json({ success: true, audio: `data:audio/mpeg;base64,${base64Audio}` })
        } else {
          const errorData = await ttsRes.json()
          return NextResponse.json({ success: false, error: errorData.detail || 'TTS failed' })
        }
      } catch (e) {
        return NextResponse.json({ success: false, error: 'TTS error' })
      }
    }

    // Handle Translation action
    if (action === 'translate') {
      // Mock translation if no API key
      if (!GEMINI_API_KEY) {
        // Simple mock for demo
        const mockTranslations = {
          'Myanmar': text,
          'English': text,
          'Chinese': text,
          'Japanese': text,
          'Korean': text
        }
        const target = translateTo || 'Myanmar'
        return NextResponse.json({ success: true, translatedText: mockTranslations[target] || text })
      }
      
      if (!text) return NextResponse.json({ success: false, error: 'Text required' })

      try {
        const targetLang = translateTo || 'Myanmar'
        
        // Use simple prompt format
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `Translate: ${text} → ${targetLang}` }] }],
              generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
            })
          }
        )

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json()
          const translatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
          if (translatedText) {
            return NextResponse.json({ success: true, translatedText: translatedText.trim() })
          }
        }
        
        // Fallback - return original if API fails
        return NextResponse.json({ success: true, translatedText: text })
      } catch (e) {
        // Fallback
        return NextResponse.json({ success: true, translatedText: text })
      }
    }

    // Handle SRT from YouTube link
    let videoIdToUse = videoId
    if (youtubeLink) {
      const match = youtubeLink.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
      if (match) videoIdToUse = match[1]
    }

    if (!videoIdToUse) {
      return NextResponse.json({ success: false, error: 'YouTube link required' })
    }

    let videoTitle = 'YouTube Video'
    
    if (YOUTUBE_API_KEY) {
      try {
        const ytRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?id=${videoIdToUse}&key=${YOUTUBE_API_KEY}&part=snippet`
        )
        if (ytRes.ok) {
          const ytData = await ytRes.json()
          if (ytData.items?.length > 0) {
            videoTitle = ytData.items[0].snippet.title
          }
        }
      } catch (e) {}
    }

    // Demo SRT
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
      videoId: videoIdToUse
    })
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Error' }, { status: 500 })
  }
}
