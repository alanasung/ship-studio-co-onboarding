'use client'

import { useEffect, useRef, type ReactNode } from 'react'

interface DepthSceneProps {
  children: ReactNode
  intensity?: number
  className?: string
}

export function DepthScene({ children, intensity = 1, className = '' }: DepthSceneProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Skip parallax on touch devices
    if ('ontouchstart' in window) return

    const handleMove = (e: MouseEvent) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
      ref.current.style.setProperty('--mouse-x', x.toFixed(3))
      ref.current.style.setProperty('--mouse-y', y.toFixed(3))
    }

    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  return (
    <div
      ref={ref}
      style={{
        perspective: '1500px',
        transformStyle: 'preserve-3d',
        '--mouse-x': '0',
        '--mouse-y': '0',
        '--depth-intensity': intensity,
      } as React.CSSProperties}
      className={`relative w-full h-full overflow-hidden ${className}`}
    >
      {children}
    </div>
  )
}

// Wrapper for content that should tilt with mouse movement
export function DepthTilt({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`depth-tilt ${className}`}>
      {children}
    </div>
  )
}
