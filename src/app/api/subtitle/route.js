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
        return NextResponse.json({ success: false, error: 'Set ELEVENLABS_API_KEY in Vercel settings' })
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

    // Handle Translation action - Mock translation for demo
    if (action === 'translate') {
      if (!text) return NextResponse.json({ success: false, error: 'Text required' })
      
      const target = translateTo || 'Myanmar'
      
      // If API key exists, try real translation
      if (GEMINI_API_KEY && GEMINI_API_KEY.length > 10) {
        try {
          const prompt = `Translate this to ${target}: "${text}"`
          
          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
              })
            }
          )

          if (geminiRes.ok) {
            const data = await geminiRes.json()
            const result = data.candidates?.[0]?.content?.parts?.[0]?.text
            if (result) {
              return NextResponse.json({ success: true, translatedText: result.trim() })
            }
          }
        } catch (e) {
          console.log('Gemini error:', e)
        }
      }
      
      // Mock translations for demo
      const mockLang = {
        'Myanmar': 'မြန်မာဘာသာပြန်လိုက်ပါတယ်',
        'English': 'Translated to English',
        'Chinese': '已翻译成中文',
        'Japanese': '日本語に翻訳されました',
        'Korean': '한국어로 번역됨'
      }
      
      return NextResponse.json({ 
        success: true, 
        translatedText: mockLang[target] || text,
        note: 'Set GEMINI_API_KEY for real translation'
      })
    }

    // Handle SRT from YouTube
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
