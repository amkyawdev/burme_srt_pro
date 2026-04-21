'use client'

import { forwardRef } from 'react'

// Social Media Style Button Component
const MobileButton = forwardRef(({ 
  children, 
  variant = 'primary', 
  icon,
  onClick,
  disabled = false,
  className = '',
  ...props 
}, ref) => {
  
  const baseClasses = 'social-btn px-6 py-3 font-semibold rounded-2xl flex items-center justify-center gap-2'
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30',
    secondary: 'bg-white/80 border border-gray-300 text-gray-600 hover:bg-gray-50',
    success: 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100',
    warning: 'bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100',
    danger: 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100',
  }
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${className}`
  
  return (
    <button 
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {icon && <i className={icon}></i>}
      {children}
    </button>
  )
})

MobileButton.displayName = 'MobileButton'

export default MobileButton