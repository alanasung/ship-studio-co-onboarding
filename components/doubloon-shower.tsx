'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { celebration } from '@/lib/sounds'

type CoinSize = 'small' | 'medium' | 'large'

interface PhysicsCoin {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  size: CoinSize
  rotation: number
  rotationSpeed: number
  bounceCount: number
  opacity: number
}

const coinSizes: Record<CoinSize, number> = {
  small: 16,
  medium: 28,
  large: 40,
}

const GRAVITY = 0.5
const AIR_RESISTANCE = 0.995
const BOUNCE_DAMPING = 0.6
const GROUND_Y = typeof window !== 'undefined' ? window.innerHeight * 0.85 : 600
const MAX_BOUNCES = 3

function getCoinSize(): CoinSize {
  const rand = Math.random()
  if (rand < 0.5) return 'small'
  if (rand < 0.85) return 'medium'
  return 'large'
}

export function DoubloonShower({ 
  active, 
  onComplete,
  count = 50 
}: { 
  active: boolean
  onComplete: () => void
  count?: number
}) {
  const [coins, setCoins] = useState<PhysicsCoin[]>([])
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  // Physics simulation
  const updatePhysics = useCallback(() => {
    setCoins(prevCoins => {
      const now = Date.now()
      const elapsed = now - startTimeRef.current
      
      // Fade out after 2 seconds
      const fadeStart = 2000
      const fadeDuration = 500
      
      return prevCoins.map(coin => {
        let { x, y, vx, vy, bounceCount, opacity, rotation, rotationSpeed } = coin
        
        // Apply gravity
        vy += GRAVITY
        
        // Apply air resistance
        vx *= AIR_RESISTANCE
        vy *= AIR_RESISTANCE
        
        // Update position
        x += vx
        y += vy
        
        // Update rotation
        rotation += rotationSpeed * 0.016 // ~60fps
        
        // Bounce off ground
        if (y >= GROUND_Y && bounceCount < MAX_BOUNCES) {
          y = GROUND_Y
          vy = -vy * BOUNCE_DAMPING
          vx *= 0.8 // Friction
          bounceCount++
          rotationSpeed *= 0.7
        }
        
        // Calculate opacity for fade out
        if (elapsed > fadeStart) {
          opacity = Math.max(0, 1 - (elapsed - fadeStart) / fadeDuration)
        }
        
        return { ...coin, x, y, vx, vy, bounceCount, opacity, rotation, rotationSpeed }
      }).filter(coin => coin.opacity > 0)
    })
    
    animationRef.current = requestAnimationFrame(updatePhysics)
  }, [])

  useEffect(() => {
    if (active) {
      startTimeRef.current = Date.now()
      
      // Generate coins with physics properties
      const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 800
      const newCoins: PhysicsCoin[] = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * windowWidth,
        y: -50 - Math.random() * 200, // Start above screen, staggered
        vx: (Math.random() - 0.5) * 8, // Random horizontal velocity
        vy: Math.random() * 3 + 2, // Slight downward velocity
        size: getCoinSize(),
        rotation: Math.random() * 360,
        rotationSpeed: 180 + Math.random() * 360,
        bounceCount: 0,
        opacity: 1,
      }))
      
      setCoins(newCoins)
      celebration()
      
      // Start physics simulation
      animationRef.current = requestAnimationFrame(updatePhysics)

      // Complete after animation
      const timer = setTimeout(() => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
        setCoins([])
        onComplete()
      }, 3000)

      return () => {
        clearTimeout(timer)
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [active, count, onComplete, updatePhysics])

  if (!active || coins.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {/* Gold flash at edges */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-gold/20 via-transparent to-transparent"
        style={{ animation: 'fade-out 1s ease-out forwards' }}
      />

      {/* Physics-driven falling coins */}
      {coins.map(coin => {
        const pixelSize = coinSizes[coin.size]
        return (
          <div
            key={coin.id}
            className="absolute"
            style={{
              left: coin.x,
              top: coin.y,
              opacity: coin.opacity,
              transform: `rotate(${coin.rotation}deg)`,
              willChange: 'transform, left, top',
            }}
          >
            <svg width={pixelSize} height={pixelSize} viewBox="0 0 28 28">
              <defs>
                <radialGradient id={`showerCoin${coin.id}`} cx="30%" cy="30%">
                  <stop offset="0%" stopColor="#e5b84a" />
                  <stop offset="50%" stopColor="#c9922a" />
                  <stop offset="100%" stopColor="#8b6914" />
                </radialGradient>
              </defs>
              <circle 
                cx="14" cy="14" r="13" 
                fill={`url(#showerCoin${coin.id})`} 
                stroke="#8b6914" 
                strokeWidth="1" 
              />
              <text 
                x="14" y="18" 
                textAnchor="middle" 
                className="font-serif fill-navy font-bold"
                style={{ fontSize: coin.size === 'small' ? 10 : coin.size === 'medium' ? 12 : 14 }}
              >
                $
              </text>
            </svg>
          </div>
        )
      })}

      {/* Coin pile at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at bottom, rgba(201, 146, 42, 0.3) 0%, transparent 70%)',
          animation: 'fade-in-out 3s ease-in-out forwards',
        }}
      />

      <style jsx>{`
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes fade-in-out {
          0% { opacity: 0; }
          30% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}

// Enhanced particle burst with gold flecks
export function ParticleBurst({ 
  x, 
  y, 
  active,
  onComplete 
}: { 
  x: number
  y: number
  active: boolean
  onComplete: () => void
}) {
  const [particles, setParticles] = useState<{ 
    id: number
    tx: number
    ty: number
    rotation: number
    scale: number
    shape: 'circle' | 'trapezoid'
  }[]>([])

  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: 16 }, (_, i) => ({
        id: i,
        tx: (Math.random() - 0.5) * 180,
        ty: (Math.random() - 0.5) * 180 - 60, // Bias upward
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.8,
        shape: (i % 3 === 0 ? 'trapezoid' : 'circle') as 'circle' | 'trapezoid',
      }))
      setParticles(newParticles)

      const timer = setTimeout(() => {
        setParticles([])
        onComplete()
      }, 700)

      return () => clearTimeout(timer)
    }
  }, [active, onComplete])

  if (!active || particles.length === 0) return null

  return (
    <div 
      className="fixed pointer-events-none z-[100]"
      style={{ left: x, top: y }}
    >
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute"
          style={{
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animation: 'particle-burst 700ms ease-out forwards',
            transform: `rotate(${p.rotation}deg) scale(${p.scale})`,
          } as React.CSSProperties}
        >
          {p.shape === 'circle' ? (
            <div className="w-2 h-2 rounded-full bg-gold" />
          ) : (
            <svg width="8" height="6" viewBox="0 0 8 6">
              <polygon points="1,6 2,0 6,0 7,6" fill="#c9922a" />
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}
