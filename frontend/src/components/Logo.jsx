import React from 'react'

export default function Logo({ size = 'md', className = '', showText = false, textClassName = '' }) {
  const sizeMap = {
    xs: 'w-5 h-5',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  }

  const dim = sizeMap[size] || sizeMap.md

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className={`${dim} rounded-xl overflow-hidden shrink-0 shadow-sm border border-white/10 transition-transform duration-200 hover:scale-105`}>
        <img src="/logo.svg" alt="InterneMP Logo" className="w-full h-full object-contain" />
      </div>
      {showText && (
        <span className={`font-semibold tracking-tight ${textClassName || 'text-sm text-foreground'}`}>
          InterneMP
        </span>
      )}
    </div>
  )
}
