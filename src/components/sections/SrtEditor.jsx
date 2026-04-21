'use client'

import { useState } from 'react'
import { extractVideoId, mockFetchSubtitle } from '@/lib/youtube'
import { defaultSRT } from '@/lib/constants'

export default function SrtEditor({ initialContent = defaultSRT }) {
  const [srtContent, setSrtContent] = useState(initialContent)
  const [youtubeLink, setYoutubeLink] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (type, message) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 2500)
  }

  const handleFetch = async () => {
    if (!youtubeLink.trim()) {
      showToast('error', 'Please enter a YouTube link')
      return
    }

    const videoId = extractVideoId(youtubeLink)
    if (!videoId) {
      showToast('error', 'Invalid YouTube link format')
      return
    }

    setIsLoading(true)
    try {
      const srt = await mockFetchSubtitle(videoId)
      setSrtContent(srt)
      showToast('success', 'SRT fetched successfully!')
    } catch (err) {
      showToast('error', 'Failed to fetch SRT')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!srtContent) {
      showToast('error', 'Nothing to copy')
      return
    }
    try {
      await navigator.clipboard.writeText(srtContent)
      showToast('success', 'Copied to clipboard!')
    } catch (err) {
      showToast('error', 'Failed to copy to clipboard')
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
    a.click()
    URL.revokeObjectURL(url)
    showToast('success', 'Download started!')
  }

  return (
    <div className="glass-card rounded-2xl p-6 shadow-lg">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <i className="fas fa-edit text-blue-500"></i>
        <span>SRT Editor</span>
      </h2>

      <div className="flex flex-col gap-3 mb-4">
        <input
          type="text"
          value={youtubeLink}
          onChange={(e) => setYoutubeLink(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleFetch()}
          placeholder="YouTube Link Input..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <textarea
        value={srtContent}
        onChange={(e) => setSrtContent(e.target.value)}
        className={`w-full h-64 px-4 py-3 rounded-xl border border-gray-200 bg-white/80 font-mono text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${isLoading ? 'pulse-animation' : ''}`}
        placeholder="Paste or type SRT content here..."
      />

      <div className="flex flex-col md:flex-row gap-3 mt-4">
        <button onClick={handleCopy} className="social-btn flex-1 px-6 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold rounded-xl flex items-center justify-center gap-2">
          <i className="fas fa-copy"></i>
          <span>Copy to Clipboard</span>
        </button>
        <button onClick={handleDownload} className="social-btn flex-1 px-6 py-3 bg-amber-50 border border-amber-200 text-amber-700 font-semibold rounded-xl flex items-center justify-center gap-2">
          <i className="fas fa-download"></i>
          <span>Download SRT</span>
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-xl z-50">
          <i className={`fas ${toast.type === 'success' ? 'fa-check-circle text-emerald-400' : 'fa-exclamation-circle text-red-400'}`}></i>
          {' '}{toast.message}
        </div>
      )}
    </div>
  )
}