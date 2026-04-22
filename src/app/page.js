'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function GetStarted() {
  const router = useRouter()
  const [showMain, setShowMain] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)

  useEffect(() => {
    // Simple Three.js setup
    if (typeof window === 'undefined') return
    
    let animationId
    const initThree = async () => {
      try {
        const THREE = await import('three')
        
        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        camera.position.z = 30

        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
        renderer.setSize(window.innerWidth, window.innerHeight)
        renderer.setPixelRatio(window.devicePixelRatio)
        renderer.setClearColor(0x000000, 0)

        if (sceneRef.current) {
          sceneRef.current.appendChild(renderer.domElement)
        }
        rendererRef.current = renderer

        // Create particles
        const particlesGeometry = new THREE.BufferGeometry()
        const particleCount = 1500
        const posArray = new Float32Array(particleCount * 3)

        for (let i = 0; i < particleCount * 3; i++) {
          posArray[i] = (Math.random() - 0.5) * 60
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3))

        const particlesMaterial = new THREE.PointsMaterial({
          size: 0.15,
          color: 0x88bbff,
          transparent: true,
          opacity: 0.6
        })

        const particlesMesh = new THREE.PointsGeometry(particlesGeometry, particlesMaterial)
        scene.add(particlesMesh)

        camera.position.z = 25

        const animate = () => {
          animationId = requestAnimationFrame(animate)
          particlesMesh.rotation.y += 0.001
          particlesMesh.rotation.x += 0.0005
          renderer.render(scene, camera)
        }
        animate()
      } catch (e) {
        console.log('Three.js error:', e)
      }
    }

    initThree()

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
    }
  }, [])

  const handleStart = () => {
    setIsVisible(false)
    setTimeout(() => {
      router.push('/main')
    }, 500)
  }

  if (!isVisible) return null

  return (
    <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Three.js Background */}
      <div ref={sceneRef} className="fixed inset-0 -z-10" />

      {/* Glass Card */}
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 text-center animate-pulse-slow">
          {/* Logo */}
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl">
            <i className="fas fa-closed-captioning text-4xl text-white"></i>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Burme SRT Pro
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            ဆိုရှယ်မီဒီယာ စတိုင် စာတန်းထိုးဂျင်နရေတာ
          </p>

          {/* Start Button */}
          <button
            onClick={handleStart}
            className="social-btn px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-semibold rounded-2xl shadow-lg"
          >
            <i className="fas fa-rocket mr-3"></i>
            စတင်အသုံးပြုမယ်
          </button>

          {/* Developer Credit */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              <i className="fas fa-code mr-2"></i>
              Aung Myo Kyaw
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Full Stack Developer
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          border-radius: 1.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }
        .social-btn {
          transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        .social-btn:active {
          transform: scale(0.96);
        }
      `}</style>
    </main>
  )
}
