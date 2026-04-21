import { NextResponse } from 'next/server'

const API_KEY = process.env.GEMINI_API_KEY || process.env.YOUTUBE_API_KEY
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

export async function POST(request) {
  try {
    const body = await request.json()
    const { videoId, youtubeLink, text, voiceId, action } = body

    // Extract video ID from link if provided
    let videoIdToUse = videoId
    if (youtubeLink && !videoIdToUse) {
      const match = youtubeLink.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
      if (match) videoIdToUse = match[1]
    }

    // Handle Text-to-Speech action
    if (action === 'tts' && ELEVENLABS_API_KEY && text) {
      try {
        const voice = voiceId || '21m00Tcm4TlvDq8ikWAM' // Rachel voice default
        
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
              model_id: 'eleven_monolingual_v1',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5
              }
            })
          }
        )

        if (ttsRes.ok) {
          const audioBuffer = await ttsRes.arrayBuffer()
          const base64Audio = Buffer.from(audioBuffer).toString('base64')
          
          return NextResponse.json({
            success: true,
            audio: `data:audio/mpeg;base64,${base64Audio}`,
            source: 'ElevenLabs'
          })
        } else {
          const errorData = await ttsRes.json()
          return NextResponse.json({ error: errorData.detail || 'TTS failed' }, { status: 400 })
        }
      } catch (e) {
        console.error('ElevenLabs error:', e)
        return NextResponse.json({ error: 'TTS service error' }, { status: 500 })
      }
    }

    // Handle subtitle generation
    if (!videoIdToUse) {
      return NextResponse.json({ error: 'Video ID or link required' }, { status: 400 })
    }

    // If API key available, try Gemini for AI subtitles
    if (API_KEY) {
      try {
        // Get video info from YouTube
        const ytRes = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?id=${videoIdToUse}&key=${API_KEY}&part=snippet`
        )
        
        let videoTitle = 'YouTube Video'
        let videoDescription = ''
        
        if (ytRes.ok) {
          const ytData = await ytRes.json()
          if (ytData.items?.length > 0) {
            videoTitle = ytData.items[0].snippet.title
            videoDescription = ytData.items[0].snippet.description || ''
          }
        }

        // Use Gemini to generate smart subtitles
        const geminiPrompt = `Create a YouTube video subtitle in SRT format.
Video Title: ${videoTitle}
Description: ${videoDescription}

Generate 5-8 subtitle lines with proper SRT timing format:
1
00:00:00,000 --> 00:00:03,000
Your subtitle text here

Include Myanmar language support. Make it natural.`

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
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
                source: 'Gemini AI'
              })
            }
          }
        }
      } catch (e) {
        console.error('API error:', e)
      }
    }

    // Fallback: Basic demo mode
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
Add API key in Vercel
for AI-generated subtitles

4
00:00:14,500 --> 00:00:18,000
Made with ❤️ for Myanmar 🇲🇲`,
      videoId: videoIdToUse,
      source: API_KEY ? 'error' : 'demo'
    })
  } catch (e) {
    console.error('Error:', e)
    return NextResponse.json({ error: 'Failed to generate subtitle' }, { status: 500 })
  }
}
