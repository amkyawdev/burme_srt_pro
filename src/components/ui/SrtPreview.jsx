'use client'

import { useState, useEffect, useRef } from 'react'
import { parseSRT } from '@/lib/youtube'

export default function SrtPreview({ srtContent, isAnimating, onStop }) {
  const [currentText, setCurrentText] = useState('')
  const [isActive, setIsActive] = useState(false)
  const intervalRef = useRef(null)
  
  useEffect(() => {
    if (!srtContent || !isAnimating) {
      setCurrentText('')
      setIsActive(false)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }
    
    const subtitles = parseSRT(srtContent)
    if (subtitles.length === 0) return
    
    let index = 0
    setCurrentText(subtitles[0])
    setIsActive(true)
    
    intervalRef.current = setInterval(() => {
      index = (index + 1) % subtitles.length
      setCurrentText(subtitles[index])
      
      // Trigger animation
      setIsActive(false)
      setTimeout(() => setIsActive(true), 50)
    }, 1700)
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [srtContent, isAnimating])
  
  return (
    <div className="w-full h-32 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 border border-blue-200 flex items-center justify-center mb-4 overflow-hidden">
      {currentText ? (
        <p className={`text-xl md:text-2xl font-semibold text-gray-800 text-center px-4 transition-all ${isActive ? 'scale-105' : 'scale-100'}`}>
          {currentText}
        </p>
      ) : (
        <p className="text-xl md:text-2xl font-semibold text-gray-400 text-center px-4">
          Subtitle text will appear here...
        </p>
      )}
    </div>
  )
}