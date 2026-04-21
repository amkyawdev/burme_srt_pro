import { NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

export async function POST(request) {
  try {
    const body = await request.json()
    const { videoId, youtubeLink, text, voiceId, action, translateTo } = body

    // Extract video ID from link if provided
    let videoIdToUse = videoId
    if (youtubeLink && !videoIdToUse) {
      const match = youtubeLink.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
      if (match) videoIdToUse = match[1]
    }

    // Handle Text-to-Speech action (ElevenLabs)
    if (action === 'tts' && ELEVENLABS_API_KEY && text) {
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
              model_id: 'eleven_monolingual_v1'
            })
          }
        )

        if (ttsRes.ok) {
          const audioBuffer = await ttsRes.arrayBuffer()
          const base64Audio = Buffer.from(audioBuffer).toString('base64')
          
          return NextResponse.json({
            success: true,
            audio: `data:audio/mpeg;base64,${base64Audio}`,
            source: 'ElevenLabs TTS'
          })
        } else {
          const errorData = await ttsRes.json()
          return NextResponse.json({ error: errorData.detail || 'TTS failed' }, { status: 400 })
        }
      } catch (e) {
        return NextResponse.json({ error: 'TTS service error' }, { status: 500 })
      }
    }

    // Handle Translation action (Gemini)
    if (action === 'translate' && GEMINI_API_KEY && text) {
      try {
        const targetLang = translateTo || 'Myanmar'
        
        const translatePrompt = `Translate the following text to ${targetLang}. 
Just return the translated text only, no explanation.

Text: ${text}`

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: translatePrompt }] }],
              generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
            })
          }
        )

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json()
          const translatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
          
          if (translatedText) {
            return NextResponse.json({
              success: true,
              translatedText: translatedText.trim(),
              source: 'Gemini Translate'
            })
          }
        }
      } catch (e) {
        return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
      }
    }

    // Handle subtitle generation from YouTube link
    if (!videoIdToUse) {
      return NextResponse.json({ error: 'Video ID or link required' }, { status: 400 })
    }

    // Get YouTube video info
    let videoTitle = 'YouTube Video'
    let videoDescription = ''
    
    if (YOUTUBE_API_KEY) {
      try {
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
      } catch (e) {
        console.error('YouTube API error:', e)
      }
    }

    // Use Gemini to generate/translate SRT
    if (GEMINI_API_KEY) {
      try {
        const geminiPrompt = `Create a YouTube video subtitle in SRT format.
Video Title: ${videoTitle}
Description: ${videoDescription}

Generate 5-8 subtitle lines with proper SRT timing format.
Include Myanmar language support. Make it natural and engaging.`

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: geminiPrompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
            })
          }
        )

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json()
          const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text
          
          if (generatedText) {
            const srtMatch = generatedText.match(/[\s\S]*?^\d+\s*\n\d{2}:\d{2}:\d{2},\d{3}\s*-->\s*\d{2}:\d{2}:\d{2},\d{3}[\s\S]*/m)
            if (srtMatch) {
              return NextResponse.json({
                success: true,
                srt: srtMatch[0].trim(),
                videoId: videoIdToUse,
                title: videoTitle,
                source: 'YouTube + Gemini'
              })
            }
          }
        }
      } catch (e) {
        console.error('Gemini error:', e)
      }
    }

    // Fallback
    await new Promise(r => setTimeout(r, 800))
    return NextResponse.json({
      success: true,
      srt: `1
00:00:00,500 --> 00:00:03,000
Video ID: ${videoIdToUse}

2
00:00:03,500 --> 00:00:06,000
Title: ${videoTitle}

3
00:00:06,500 --> 00:00:10,000
${videoDescription.substring(0, 100) || 'Welcome to Burme SRT Pro!'}

4
00:00:14,500 --> 00:00:18,000
Made with ❤️ for Myanmar 🇲🇲`,
      videoId: videoIdToUse,
      title: videoTitle,
      source: YOUTUBE_API_KEY ? 'YouTube' : 'demo'
    })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 })
  }
}
