'use client'

import GlassCard from '../ui/GlassCard'
import { developerInfo } from '@/lib/constants'

export default function Footer() {
  return (
    <GlassCard className="rounded-2xl p-6 shadow-lg">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <i className="fas fa-user-circle text-blue-500"></i>
        <span>Developer Info</span>
      </h2>
      
      <div className="flex flex-wrap items-center justify-center gap-6">
        <div className="flex items-center gap-2 text-gray-700">
          <i className="fas fa-code-branch text-blue-500"></i>
          <span className="font-medium">{developerInfo.name}</span>
          <span className="text-gray-400 text-sm">({developerInfo.title})</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-700">
          <i className="fab fa-tiktok"></i>
          <span className="font-medium">{developerInfo.tiktok}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-700">
          <i className="fas fa-phone-alt text-green-500"></i>
          <span className="font-medium">{developerInfo.phone}</span>
        </div>
      </div>
      
      <p className="text-center text-xs text-gray-400 mt-4">
        <i className="fas fa-heart text-red-500"></i>
        {' '}Built with ❤️ for Myanmar creators
      </p>
    </GlassCard>
  )
}