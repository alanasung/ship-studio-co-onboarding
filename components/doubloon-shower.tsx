'use client'

import { useEffect, useState } from 'react'
import { celebration } from '@/lib/sounds'

type CoinSize = 'small' | 'medium' | 'large'

interface FallingCoin {
  id: number
  x: number
  drift: number
  duration: number
  delay: number
  size: CoinSize
  rotation: number
  rotationSpeed: number
}

const coinSizes: Record<CoinSize, number> = {
  small: 16,
  medium: 28,
  large: 40,
}

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
  const [coins, setCoins] = useState<FallingCoin[]>([])

  useEffect(() => {
    if (active) {
      // Generate coins with varied sizes and rotations
      const newCoins = Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        drift: (Math.random() - 0.5) * 100,
        duration: 2 + Math.random() * 1.5,
        delay: Math.random() * 0.5,
        size: getCoinSize(),
        rotation: Math.random() * 360,
        rotationSpeed: 180 + Math.random() * 360, // 180-540 degrees per fall
      }))
      setCoins(newCoins)
      celebration()

      // Complete after animation
      const timer = setTimeout(() => {
        setCoins([])
        onComplete()
      }, 2500)

      return () => clearTimeout(timer)
    }
  }, [active, count, onComplete])

  if (!active || coins.length === 0) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {/* Gold flash at edges */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-gold/20 via-transparent to-transparent"
        style={{ animation: 'fade-out 1s ease-out forwards' }}
      />

      {/* Falling coins */}
      {coins.map(coin => {
        const pixelSize = coinSizes[coin.size]
        return (
          <div
            key={coin.id}
            className="absolute"
            style={{
              left: `${coin.x}%`,
              top: -50,
              '--drift': `${coin.drift}px`,
              '--coin-rotation': `${coin.rotation}deg`,
              '--coin-rotation-end': `${coin.rotation + coin.rotationSpeed}deg`,
              animation: `coin-fall ${coin.duration}s ease-in ${coin.delay}s forwards`,
            } as React.CSSProperties}
          >
            <svg 
              width={pixelSize} 
              height={pixelSize} 
              viewBox="0 0 28 28"
              style={{
                animation: `coin-spin ${coin.duration}s linear ${coin.delay}s forwards`,
              }}
            >
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

      <style jsx>{`
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes coin-spin {
          from { transform: rotate(var(--coin-rotation)); }
          to { transform: rotate(var(--coin-rotation-end)); }
        }
      `}</style>
    </div>
  )
}

// Particle burst for individual doubloon earns
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
  const [particles, setParticles] = useState<{ id: number; tx: number; ty: number; rotation: number }[]>([])

  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: 10 }, (_, i) => ({
        id: i,
        tx: (Math.random() - 0.5) * 150,
        ty: (Math.random() - 0.5) * 150 - 50, // Bias upward
        rotation: Math.random() * 360,
      }))
      setParticles(newParticles)

      const timer = setTimeout(() => {
        setParticles([])
        onComplete()
      }, 600)

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
          className="absolute w-2 h-2 rounded-full bg-gold"
          style={{
            '--tx': `${p.tx}px`,
            '--ty': `${p.ty}px`,
            animation: 'particle-burst 600ms ease-out forwards',
            transform: `rotate(${p.rotation}deg)`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  )
}
