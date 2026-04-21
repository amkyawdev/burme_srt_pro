'use client'

import { useState, useCallback } from 'react'
import { extractVideoId } from '@/lib/youtube'

export function useYoutubeSubtitle() {
  const [srtContent, setSrtContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchSubtitle = useCallback(async (url) => {
    if (!url.trim()) {
      setError('Please enter a YouTube link')
      return null
    }

    const videoId = extractVideoId(url)
    if (!videoId) {
      setError('Invalid YouTube link format')
      return null
    }

    setError(null)
    setIsLoading(true)

    try {
      // Call the API route
      const response = await fetch('/api/subtitle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch subtitle')
      }

      setSrtContent(data.srt)
      return data.srt
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    srtContent,
    isLoading,
    error,
    fetchSubtitle,
    setSrtContent,
  }
}