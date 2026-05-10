'use client'
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { hover, tap } from '@/lib/sounds'

let lastHover = 0
export const SoundButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function SoundButton({ onMouseEnter, onClick, className = '', ...props }, ref) {
    return (
      <button
        ref={ref}
        className={`depth-button-press ${className}`}
        onMouseEnter={(e) => {
          const now = Date.now()
          if (now - lastHover > 500) { hover(); lastHover = now }
          onMouseEnter?.(e)
        }}
        onClick={(e) => { tap(); onClick?.(e) }}
        {...props}
      />
    )
  }
)
