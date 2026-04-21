'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { extractVideoId, mockFetchSubtitle, parseSRT } from '@/lib/youtube'
import { defaultSRT, developerInfo } from '@/lib/constants'

export default function MainStudio() {
  const [youtubeLink, setYoutubeLink] = useState('')
  const [srtContent, setSrtContent] = useState(defaultSRT)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState({ show: false, type: 'success', message: '' })
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentSubtitle, setCurrentSubtitle] = useState('')
  const animationRef = useRef(null)

  useEffect(() => {
    setSrtContent(defaultSRT)
  }, [])

  const showToast = (type, message) => {
    setToast({ show: true, type, message })
    setTimeout(() => {
      setToast({ show: false, type: '', message: '' })
    }, 2500)
  }

  const handleFetch = async () => {
    if (!youtubeLink.trim()) {
      setError('Please enter a YouTube link')
      return
    }
    const videoId = extractVideoId(youtubeLink)
    if (!videoId) {
      setError('Invalid YouTube link format')
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      const srt = await mockFetchSubtitle(videoId)
      setSrtContent(srt)
      showToast('success', 'SRT fetched!')
    } catch (err) {
      setError('Failed to fetch SRT')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setYoutubeLink('')
    setError(null)
  }

  const handleCopy = async () => {
    if (!srtContent) {
      showToast('error', 'Nothing to copy')
      return
    }
    try {
      await navigator.clipboard.writeText(srtContent)
      showToast('success', 'Copied!')
    } catch {
      showToast('error', 'Copy failed')
    }
  }

  const handleDownload = () => {
    if (!srtContent) {
      showToast('error', 'Nothing to download')
      return
    }
    const timestamp = new Date().toISOString().slice(0, 10)
    const blob = new Blob([srtContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `burme_subtitle_${timestamp}.srt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('success', 'Download started!')
  }

  const handleAnimate = () => {
    if (!srtContent) {
      showToast('error', 'No SRT content')
      return
    }
    const subtitles = parseSRT(srtContent)
    if (subtitles.length === 0) {
      showToast('error', 'No subtitles to animate')
      return
    }
    setIsAnimating(true)
    let index = 0
    setCurrentSubtitle(subtitles[0])
    animationRef.current = setInterval(() => {
      index = (index + 1) % subtitles.length
      setCurrentSubtitle(subtitles[index])
    }, 1700)
    showToast('success', 'Animation started!')
  }

  const handleStopAnimate = () => {
    if (animationRef.current) {
      clearInterval(animationRef.current)
      animationRef.current = null
    }
    setIsAnimating(false)
    setCurrentSubtitle('')
    showToast('success', 'Stopped!')
  }

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-card rounded-2xl p-4 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <i className="fas fa-closed-captioning text-xl text-white"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Burme SRT Pro</h1>
                <p className="text-sm text-gray-500">SRT Studio</p>
              </div>
            </div>
            <Link href="/" className="social-btn px-3 py-2 bg-gray-100 text-gray-600 rounded-xl">
              <i className="fas fa-sign-out-alt"></i>
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

        {/* YouTube Link Input */}
        <div className="glass-card rounded-2xl p-6 mb-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fab fa-youtube text-red-500 text-xl"></i>
            <span>YouTube Link Input</span>
          </h2>
          
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <input 
                type="text" 
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFetch()}
                placeholder="https://www.youtube.com/watch?v=..." 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button 
              onClick={handleFetch}
              disabled={isLoading}
              className="social-btn px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-download"></i>}
              <span>Fetch</span>
            </button>
            <button 
              onClick={handleClear}
              className="social-btn px-5 py-3 bg-white/80 border border-gray-300 text-gray-600 rounded-xl flex items-center gap-2"
            >
              <i className="fas fa-times"></i>
              <span>Clear</span>
            </button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* SRT Editor */}
        <div className="glass-card rounded-2xl p-6 mb-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-edit text-blue-500"></i>
            <span>SRT Editor</span>
          </h2>
          
          <textarea 
            value={srtContent}
            onChange={(e) => setSrtContent(e.target.value)}
            className="w-full h-64 px-4 py-3 rounded-xl border border-gray-200 bg-white/80 font-mono text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Paste or type SRT content..."
          />
          
          <div className="flex flex-col md:flex-row gap-3 mt-4">
            <button onClick={handleCopy} className="social-btn flex-1 px-6 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold rounded-xl flex items-center justify-center gap-2">
              <i className="fas fa-copy"></i>
              <span>Copy</span>
            </button>
            <button onClick={handleDownload} className="social-btn flex-1 px-6 py-3 bg-amber-50 border border-amber-200 text-amber-700 font-semibold rounded-xl flex items-center justify-center gap-2">
              <i className="fas fa-download"></i>
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Animated Preview */}
        <div className="glass-card rounded-2xl p-6 mb-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-play-circle text-cyan-500"></i>
            <span>Preview</span>
          </h2>
          
          <div className="w-full h-32 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 border border-blue-200 flex items-center justify-center mb-4">
            {currentSubtitle ? (
              <p className="text-xl md:text-2xl font-semibold text-gray-800 text-center px-4">{currentSubtitle}</p>
            ) : (
              <p className="text-xl md:text-2xl font-semibold text-gray-400 text-center">Subtitle text...</p>
            )}
          </div>
          
          <button 
            onClick={isAnimating ? handleStopAnimate : handleAnimate}
            className={`social-btn w-full px-6 py-3 font-semibold rounded-xl flex items-center justify-center gap-2 ${
              isAnimating ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
            }`}
          >
            <i className={`fas ${isAnimating ? 'fa-stop' : 'play'}`}></i>
            <span>{isAnimating ? 'Stop' : 'Start'}</span>
          </button>
        </div>

        {/* Developer Info */}
        <div className="glass-card rounded-2xl p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-gray-700">
              <i className="fas fa-code-branch text-blue-500"></i>
              <span className="font-medium">{developerInfo.name}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <i className="fab fa-tiktok"></i>
              <span>{developerInfo.tiktok}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <i className="fas fa-phone-alt text-green-500"></i>
              <span>{developerInfo.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {toast.show && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-xl z-50">
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle text-emerald-400' : 'fa-exclamation-circle text-red-400'} mr-2`}></i>
          {toast.message}
        </div>
      )}
    </main>
  )
}
