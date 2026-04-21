'use client'

import Link from 'next/link'
import { useState, useRef } from 'react'

export default function TTSPage() {
  const [text, setText] = useState('')
  const [voiceId, setVoiceId] = useState('21m00Tcm4TlvDq8ikWAM')
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })
  const audioRef = useRef(null)

  // Burmese voices (Thi Ha = boy, Nilar = girl)
  const burmeseVoices = [
    { id: 'pNInz6ogphA2injdU1Kh', name: 'သီဟ (Thi Ha)', gender: 'Boy', lang: 'Myanmar' },
    { id: 'cgSgspmF5nEAl3hHy3UKj52VjhHpN3u2o', name: 'နီလာ (Nilar)', gender: 'Girl', lang: 'Myanmar' },
  ]

  // English voices
  const englishVoices = [
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', lang: 'English' },
    { id: 'AZnzlk1Xvlr_ohmBJOsoN', name: 'Arnold', lang: 'English' },
    { id: 'cRDlDclOWrAANzGnzE', name: 'Sarah', lang: 'English' },
  ]

  const showToast = (message, type) => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 2500)
  }

  const handleGenerate = async () => {
    if (!text.trim()) {
      showToast('Please enter text', 'error')
      return
    }

    setIsLoading(true)
    setAudioUrl(null)

    try {
      const response = await fetch('/api/subtitle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'tts',
          text: text,
          voiceId: voiceId
        })
      })

      const data = await response.json()

      if (data.success) {
        setAudioUrl(data.audio)
        showToast('Audio generated!', 'success')
      } else {
        showToast(data.error || 'Generation failed', 'error')
      }
    } catch (err) {
      showToast('Error generating audio', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement('a')
      a.href = audioUrl
      a.download = 'burme-tts.mp3'
      a.click()
      showToast('Download started!', 'success')
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-card rounded-2xl p-4 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center">
                <i className="fas fa-microphone text-xl text-white"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Text to Speech</h1>
                <p className="text-sm text-gray-500">Generate Audio</p>
              </div>
            </div>
            <Link href="/main" className="social-btn px-3 py-2 bg-gray-100 text-gray-600 rounded-xl">
              <i className="fas fa-home"></i>
            </Link>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="glass-card rounded-2xl p-4 mb-6 shadow-lg">
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/main" className="social-btn px-5 py-3 bg-blue-50 border-2 border-blue-200 text-blue-600 font-semibold rounded-xl flex items-center gap-2">
              <i className="fas fa-closed-captioning"></i>
              <span>SRT Studio</span>
            </Link>
            <Link href="/translate" className="social-btn px-5 py-3 bg-purple-50 border-2 border-purple-200 text-purple-600 font-semibold rounded-xl flex items-center gap-2">
              <i className="fas fa-language"></i>
              <span>Translate</span>
            </Link>
            <Link href="/tts" className="social-btn px-5 py-3 bg-cyan-50 border-2 border-cyan-200 text-cyan-600 font-semibold rounded-xl flex items-center gap-2">
              <i className="fas fa-microphone"></i>
              <span>Text to Speech</span>
            </Link>
          </div>
        </div>

        {/* Burmese Voice Selection */}
        <div className="glass-card rounded-2xl p-4 mb-4">
          <label className="text-sm text-gray-600 mb-2 block flex items-center gap-2">
            <i className="fas fa-flag text-red-500"></i>
            Burmese Voices:
          </label>
          <div className="grid grid-cols-2 gap-2">
            {burmeseVoices.map(voice => (
              <button
                key={voice.id}
                onClick={() => setVoiceId(voice.id)}
                className={`p-3 rounded-xl text-center transition ${
                  voiceId === voice.id
                    ? 'bg-red-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                <div className="font-medium">{voice.name}</div>
                <div className="text-xs opacity-70">{voice.gender}</div>
              </button>
            ))}
          </div>
        </div>

        {/* English Voice Selection */}
        <div className="glass-card rounded-2xl p-4 mb-4">
          <label className="text-sm text-gray-600 mb-2 block flex items-center gap-2">
            <i className="fab fa-english text-blue-500"></i>
            English Voices:
          </label>
          <div className="grid grid-cols-3 gap-2">
            {englishVoices.map(voice => (
              <button
                key={voice.id}
                onClick={() => setVoiceId(voice.id)}
                className={`p-3 rounded-xl text-center transition ${
                  voiceId === voice.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                <div className="font-medium">{voice.name}</div>
                <div className="text-xs opacity-70">{voice.lang}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">Enter Text:</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 p-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-cyan-500 mb-4"
            placeholder="မြန်မာစာ သို့မဟုတ် အင်္ဂလိပ်စာ ရိုက်ထည့်ပါ..."
            maxLength={500}
          />
          <div className="flex justify-between text-sm text-gray-400 mb-4">
            <span>{text.length}/500 characters</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => setText('')} className="social-btn px-4 py-2 bg-red-50 text-red-600 rounded-xl border border-red-200">
              <i className="fas fa-trash mr-2"></i>Clear
            </button>
            <button onClick={handleGenerate} disabled={isLoading || !text.trim()} className="social-btn px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl">
              {isLoading ? <><i className="fas fa-spinner fa-spin mr-2"></i>Generating...</> : <><i className="fas fa-microphone mr-2"></i>Generate</>}
            </button>
          </div>
        </div>

        {/* Audio Player */}
        {audioUrl && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Generated Audio</h3>
            <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} className="w-full mb-4" controls />
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={handlePlay} className="social-btn px-4 py-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} mr-2`}></i>
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button onClick={handleStop} className="social-btn px-4 py-2 bg-gray-100 text-gray-600 rounded-xl">
                <i className="fas fa-stop mr-2"></i>Stop
              </button>
              <button onClick={handleDownload} className="social-btn px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
                <i className="fas fa-download mr-2"></i>Download
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-400">
            <i className="fas fa-heart text-red-500 mr-1"></i>
            Powered by ElevenLabs AI
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-xl z-50">
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle text-emerald-400' : 'fa-exclamation-circle text-red-400'} mr-2`}></i>
          {toast.message}
        </div>
      )}
    </main>
  )
}
