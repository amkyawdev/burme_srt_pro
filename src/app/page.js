'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function GetStarted() {
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleStart = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      window.location.href = '/main'
    }, 500)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative">
      <canvas id="three-canvas" className="fixed inset-0 w-full h-full" />

      <div className={`glass-card rounded-3xl shadow-xl p-8 md:p-12 max-w-md w-full text-center border border-white/50 ${isTransitioning ? 'page-transition-out' : ''}`}>
        
        <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <i className="fas fa-closed-captioning text-5xl text-white"></i>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Burme SRT Pro</h1>
        <p className="text-lg text-gray-600 mb-6">Social Media Style Subtitle Generator</p>

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <Link href="/main" className="social-btn py-3 bg-blue-50 border-2 border-blue-200 text-blue-600 font-semibold rounded-xl flex items-center justify-center gap-2">
            <i className="fas fa-closed-captioning"></i>
            <span>SRT Studio</span>
          </Link>
          <Link href="/translate" className="social-btn py-3 bg-purple-50 border-2 border-purple-200 text-purple-600 font-semibold rounded-xl flex items-center justify-center gap-2">
            <i className="fas fa-language"></i>
            <span>Translate</span>
          </Link>
          <Link href="/tts" className="social-btn py-3 bg-cyan-50 border-2 border-cyan-200 text-cyan-600 font-semibold rounded-xl flex items-center justify-center gap-2">
            <i className="fas fa-microphone"></i>
            <span>Text to Speech</span>
          </Link>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={isTransitioning}
          className="social-btn w-full py-4 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-semibold rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <i className="fas fa-rocket"></i>
          <span>Get Started</span>
        </button>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">Built by</p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <i className="fas fa-code-branch text-blue-500"></i>
            <span className="font-medium text-gray-700">Aung Myo Kyaw</span>
          </div>
        </div>
      </div>
    </main>
  )
}
