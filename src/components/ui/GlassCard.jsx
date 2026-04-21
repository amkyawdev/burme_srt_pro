'use client'

// Glass Card Component
export default function GlassCard({ children, className = '', ...props }) {
  return (
    <div 
      className={`glass-card rounded-2xl p-6 shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}