'use client'

import { useEffect, useState, useRef } from 'react'

interface Star {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

interface FogPatch {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

export function OceanAtmosphere({ variant = 'full' }: { variant?: 'full' | 'minimal' }) {
  const [stars, setStars] = useState<Star[]>([])
  const [fogPatches, setFogPatches] = useState<FogPatch[]>([])
  const [shootingStar, setShootingStar] = useState<{ id: number; x: number; y: number; angle: number } | null>(null)
  
  // Generate stars and fog on mount
  useEffect(() => {
    // Generate 50 stars with random positions and timing
    const newStars = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 70, // Keep in upper 70% of screen
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
    }))
    setStars(newStars)

    // Generate 5 fog patches
    const newFog = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 30 + Math.random() * 50,
      size: 200 + Math.random() * 200,
      duration: 60 + Math.random() * 60,
      delay: i * 12,
    }))
    setFogPatches(newFog)
  }, [])

  // Occasional shooting star
  useEffect(() => {
    const triggerShootingStar = () => {
      const id = Date.now()
      setShootingStar({
        id,
        x: Math.random() * 80 + 10,
        y: Math.random() * 30,
        angle: Math.random() * 30 + 15,
      })
      setTimeout(() => setShootingStar(null), 1000)
    }

    const interval = setInterval(triggerShootingStar, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Animated grain overlay */}
      <div className="absolute inset-0 animate-grain opacity-[0.03]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />

      {/* Star field */}
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full bg-parchment/80"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}

      {/* Shooting star */}
      {shootingStar && (
        <div
          key={shootingStar.id}
          className="absolute w-32 h-0.5 bg-gradient-to-r from-transparent via-parchment to-transparent"
          style={{
            left: `${shootingStar.x}%`,
            top: `${shootingStar.y}%`,
            transform: `rotate(${shootingStar.angle}deg)`,
            animation: 'shootingStar 1s ease-out forwards',
          }}
        />
      )}

      {/* Fog patches */}
      {variant === 'full' && fogPatches.map(fog => (
        <div
          key={fog.id}
          className="absolute rounded-full"
          style={{
            left: `${fog.x}%`,
            top: `${fog.y}%`,
            width: fog.size,
            height: fog.size / 2,
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)',
            animation: `fogDrift ${fog.duration}s ease-in-out ${fog.delay}s infinite alternate`,
          }}
        />
      ))}

      {/* Animated waves at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
        {/* Wave layer 1 */}
        <svg
          className="absolute bottom-0 w-[200%] h-16 animate-wave opacity-20"
          viewBox="0 0 1440 54"
          preserveAspectRatio="none"
        >
          <path
            d="M0,32 C120,38 240,44 360,42 C480,40 600,30 720,28 C840,26 960,32 1080,36 C1200,40 1320,42 1440,38 L1440,54 L0,54 Z"
            fill="#0d1e33"
          />
        </svg>
        
        {/* Wave layer 2 */}
        <svg
          className="absolute bottom-0 w-[200%] h-20 animate-wave-slow opacity-30"
          style={{ animationDelay: '-3s' }}
          viewBox="0 0 1440 54"
          preserveAspectRatio="none"
        >
          <path
            d="M0,22 C180,28 360,34 540,32 C720,30 900,20 1080,18 C1260,16 1440,22 1440,28 L1440,54 L0,54 Z"
            fill="#1a2d47"
          />
        </svg>

        {/* Wave layer 3 - bottom solid */}
        <svg
          className="absolute bottom-0 w-[200%] h-10 animate-wave opacity-50"
          style={{ animationDelay: '-5s' }}
          viewBox="0 0 1440 54"
          preserveAspectRatio="none"
        >
          <path
            d="M0,42 C240,48 480,52 720,50 C960,48 1200,42 1440,44 L1440,54 L0,54 Z"
            fill="#0a1628"
          />
        </svg>
      </div>

      {/* Floating ambient doubloons (for dashboard) */}
      {variant === 'full' && (
        <FloatingDoubloons count={6} />
      )}
    </div>
  )
}

function FloatingDoubloons({ count }: { count: number }) {
  const [doubloons, setDoubloons] = useState<{ id: number; x: number; startY: number; duration: number; delay: number }[]>([])

  useEffect(() => {
    const newDoubloons = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 90 + 5,
      startY: Math.random() * 100,
      duration: 30 + Math.random() * 30,
      delay: i * 5,
    }))
    setDoubloons(newDoubloons)
  }, [count])

  return (
    <>
      {doubloons.map(d => (
        <div
          key={d.id}
          className="absolute opacity-[0.06]"
          style={{
            left: `${d.x}%`,
            top: `${d.startY}%`,
            animation: `floatDiagonal ${d.duration}s linear ${d.delay}s infinite`,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 28 28" className="animate-spin-slower">
            <defs>
              <radialGradient id={`coinGrad${d.id}`} cx="30%" cy="30%">
                <stop offset="0%" stopColor="#e5b84a" />
                <stop offset="50%" stopColor="#c9922a" />
                <stop offset="100%" stopColor="#8b6914" />
              </radialGradient>
            </defs>
            <circle cx="14" cy="14" r="13" fill={`url(#coinGrad${d.id})`} stroke="#8b6914" strokeWidth="1" />
            <text x="14" y="18" textAnchor="middle" className="font-serif text-xs fill-navy font-bold">$</text>
          </svg>
        </div>
      ))}
    </>
  )
}

// Cursor parallax hook
export function useMouseParallax(maxOffset: number = 8) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const isTouchDevice = useRef(false)

  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window

    if (isTouchDevice.current) return

    const handleMouseMove = (e: MouseEvent) => {
      const x = ((e.clientX / window.innerWidth) - 0.5) * 2 * maxOffset
      const y = ((e.clientY / window.innerHeight) - 0.5) * 2 * maxOffset
      setOffset({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [maxOffset])

  return offset
}
