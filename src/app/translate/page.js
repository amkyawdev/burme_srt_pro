'use client'

import { useState } from 'react'

export default function TranslatePage() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [targetLang, setTargetLang] = useState('Myanmar')
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: '' })

  const showToast = (message, type) => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 2500)
  }

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      showToast('Please enter text to translate', 'error')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/subtitle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'translate',
          text: inputText,
          translateTo: targetLang
        })
      })

      const data = await response.json()

      if (data.success) {
        setOutputText(data.translatedText)
        showToast('Translation complete!', 'success')
      } else {
        showToast(data.error || 'Translation failed', 'error')
      }
    } catch (err) {
      showToast('Translation error', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwap = () => {
    const temp = inputText
    setInputText(outputText)
    setOutputText(temp)
  }

  const handleClear = () => {
    setInputText('')
    setOutputText('')
  }

  const handleCopy = async () => {
    if (!outputText) return
    try {
      await navigator.clipboard.writeText(outputText)
      showToast('Copied!', 'success')
    } catch {
      showToast('Copy failed', 'error')
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="glass-card rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <i className="fas fa-language text-xl text-white"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Translate</h1>
                <p className="text-sm text-gray-500">Text Translation</p>
              </div>
            </div>
            <a href="/main" className="social-btn px-4 py-2 bg-gray-100 text-gray-600 rounded-xl">
              <i className="fas fa-home mr-2"></i>Home
            </a>
          </div>
        </div>

        {/* Language Selection */}
        <div className="glass-card rounded-2xl p-4 mb-4">
          <label className="text-sm text-gray-600 mb-2 block">Translate to:</label>
          <div className="flex flex-wrap gap-2">
            {['Myanmar', 'English', 'Chinese', 'Japanese', 'Korean'].map(lang => (
              <button
                key={lang}
                onClick={() => setTargetLang(lang)}
                className={`px-4 py-2 rounded-xl font-medium transition ${
                  targetLang === lang 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Input/Output */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Input Text</h3>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-48 p-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter text to translate..."
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Translated Text</h3>
              <textarea
                value={outputText}
                readOnly
                className="w-full h-48 p-3 rounded-xl border border-gray-200 bg-white/60 focus:outline-none"
                placeholder="Translation will appear here..."
              />
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <button
              onClick={handleSwap}
              className="social-btn px-4 py-2 bg-gray-100 text-gray-600 rounded-xl"
            >
              <i className="fas fa-exchange-alt mr-2"></i>Swap
            </button>
            <button
              onClick={handleClear}
              className="social-btn px-4 py-2 bg-red-50 text-red-600 rounded-xl border border-red-200"
            >
              <i className="fas fa-trash mr-2"></i>Clear
            </button>
            <button
              onClick={handleCopy}
              className="social-btn px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200"
              disabled={!outputText}
            >
              <i className="fas fa-copy mr-2"></i>Copy
            </button>
            <button
              onClick={handleTranslate}
              disabled={isLoading || !inputText.trim()}
              className="social-btn px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl"
            >
              {isLoading ? (
                <><i className="fas fa-spinner fa-spin mr-2"></i>Translating...</>
              ) : (
                <><i className="fas fa-language mr-2"></i>Translate</>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-xs text-gray-400">
            <i className="fas fa-heart text-red-500 mr-1"></i>
            Powered by Gemini AI
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
