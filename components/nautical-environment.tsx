'use client'

import { useEffect, useState, useMemo } from 'react'

type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night'

interface NauticalEnvironmentProps {
  timeOfDay?: TimeOfDay
  showShip?: boolean
  showLighthouse?: boolean
  showSeagulls?: boolean
  intensity?: number
}

// Sky gradient colors based on time of day
const skyGradients: Record<TimeOfDay, string> = {
  dawn: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 30%, #0f3460 50%, #e94560 70%, #f5a962 90%, #ffd460 100%)',
  day: 'linear-gradient(180deg, #1a3a5c 0%, #2a6496 40%, #4a90b8 70%, #7ec8e3 100%)',
  dusk: 'linear-gradient(180deg, #0a1628 0%, #0d1e33 25%, #1a3350 50%, #c9922a 85%, #8b6914 100%)',
  night: 'linear-gradient(180deg, #020810 0%, #051020 30%, #0a1628 60%, #0d1e33 100%)',
}

// Moon visibility
const moonOpacity: Record<TimeOfDay, number> = {
  dawn: 0.2,
  day: 0,
  dusk: 0.4,
  night: 0.9,
}

// Generate stars with fixed positions
function generateStars(count: number): Array<{ x: number; y: number; size: number; delay: number; variant: number }> {
  const stars = []
  for (let i = 0; i < count; i++) {
    stars.push({
      x: (i * 17 + 7) % 100,
      y: (i * 13 + 3) % 55, // Only in upper portion
      size: 1 + (i % 3),
      delay: (i * 0.3) % 5,
      variant: i % 2,
    })
  }
  return stars
}

// Wave path generator
function generateWavePath(amplitude: number, frequency: number, offset: number): string {
  const points = []
  for (let x = 0; x <= 200; x += 5) {
    const y = amplitude * Math.sin((x * frequency * Math.PI) / 100 + offset)
    points.push(`${x},${50 + y}`)
  }
  return `M0,100 L0,${50 + amplitude * Math.sin(offset)} ${points.map((p, i) => (i === 0 ? `L${p}` : `L${p}`)).join(' ')} L200,100 Z`
}

export function NauticalEnvironment({
  timeOfDay = 'dusk',
  showShip = true,
  showLighthouse = true,
  showSeagulls = true,
  intensity = 1,
}: NauticalEnvironmentProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const stars = useMemo(() => generateStars(80), [])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Layer 1: Sky gradient with aurora bands */}
      <div 
        className="absolute inset-0 depth-layer-deep"
        style={{ background: skyGradients[timeOfDay] }}
      >
        {/* Aurora-like bands */}
        <div 
          className="absolute inset-0 animate-fog-layer"
          style={{
            background: `
              radial-gradient(ellipse 80% 20% at 30% 20%, rgba(42, 157, 143, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse 60% 15% at 70% 30%, rgba(201, 146, 42, 0.06) 0%, transparent 50%)
            `,
            mixBlendMode: 'screen',
          }}
        />
      </div>

      {/* Layer 2: Stars and Moon */}
      <div className="absolute inset-0 depth-layer-deep">
        {/* Stars */}
        {stars.map((star, i) => (
          <div
            key={i}
            className={star.variant === 0 ? 'animate-star-1' : 'animate-star-2'}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              borderRadius: '50%',
              backgroundColor: '#f4e8c1',
              animationDelay: `${star.delay}s`,
              opacity: timeOfDay === 'day' ? 0 : 0.6,
            }}
          />
        ))}
        
        {/* Moon */}
        <div
          className="absolute"
          style={{
            top: '8%',
            right: '12%',
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 40% 40%, #fff9e6 0%, #f4e8c1 50%, #c9922a 100%)',
            boxShadow: '0 0 40px 20px rgba(201, 146, 42, 0.2), 0 0 80px 40px rgba(201, 146, 42, 0.1)',
            opacity: moonOpacity[timeOfDay] * intensity,
            transition: 'opacity 1s ease',
          }}
        />
      </div>

      {/* Layer 3: Horizon line */}
      <div 
        className="absolute w-full depth-layer-far animate-horizon-glow"
        style={{
          top: '58%',
          height: 3,
          background: 'linear-gradient(90deg, transparent 0%, rgba(201, 146, 42, 0.4) 20%, rgba(244, 232, 193, 0.3) 50%, rgba(201, 146, 42, 0.4) 80%, transparent 100%)',
        }}
      />

      {/* Layer 4: Distant ship silhouette */}
      {showShip && (
        <div 
          className="absolute depth-layer-far animate-ship-drift"
          style={{
            top: '54%',
            left: 0,
            opacity: 0.04 * intensity,
          }}
        >
          <svg width="80" height="40" viewBox="0 0 80 40" fill="currentColor" className="text-parchment">
            <path d="M10,30 L15,15 L20,10 L20,30 Z" /> {/* Sail */}
            <path d="M25,30 L30,12 L35,8 L35,30 Z" /> {/* Main sail */}
            <path d="M5,30 Q40,25 75,30 L70,35 L10,35 Z" /> {/* Hull */}
          </svg>
        </div>
      )}

      {/* Layer 5: Lighthouse */}
      {showLighthouse && (
        <div 
          className="absolute depth-layer-far"
          style={{
            bottom: '38%',
            left: '3%',
            opacity: 0.15 * intensity,
          }}
        >
          {/* Lighthouse structure */}
          <svg width="30" height="80" viewBox="0 0 30 80" fill="currentColor" className="text-parchment">
            <path d="M10,80 L8,30 L22,30 L20,80 Z" /> {/* Tower */}
            <path d="M5,30 L25,30 L22,25 L8,25 Z" /> {/* Top platform */}
            <rect x="9" y="18" width="12" height="7" rx="1" /> {/* Light room */}
            <path d="M8,18 L15,12 L22,18 Z" /> {/* Roof */}
          </svg>
          {/* Rotating beam */}
          <div 
            className="absolute animate-lighthouse-beam"
            style={{
              bottom: 52,
              left: 15,
              width: 200,
              height: 4,
              background: 'linear-gradient(90deg, rgba(244, 232, 193, 0.6) 0%, transparent 100%)',
              transformOrigin: 'left center',
            }}
          />
        </div>
      )}

      {/* Layer 6: Distant waves (multiple rows) */}
      <div className="absolute inset-x-0 depth-layer-mid" style={{ top: '60%' }}>
        {[0, 1, 2].map((row) => (
          <svg
            key={row}
            className="absolute w-[200%] animate-wave"
            style={{
              top: row * 30,
              height: 40,
              opacity: 0.15 - row * 0.03,
              animationDuration: `${12 + row * 4}s`,
              animationDelay: `${row * -2}s`,
            }}
            viewBox="0 0 200 100"
            preserveAspectRatio="none"
          >
            <path
              d={generateWavePath(8 - row * 2, 2 + row * 0.5, row * Math.PI / 3)}
              fill="rgba(42, 157, 143, 0.3)"
            />
          </svg>
        ))}
      </div>

      {/* Layer 7: Fog patches */}
      <div className="absolute inset-0 depth-layer-mid pointer-events-none">
        {[
          { x: '10%', y: '55%', w: 300, h: 60, delay: 0 },
          { x: '50%', y: '62%', w: 400, h: 80, delay: 5 },
          { x: '75%', y: '58%', w: 250, h: 50, delay: 10 },
        ].map((fog, i) => (
          <div
            key={i}
            className="absolute animate-fog-layer"
            style={{
              left: fog.x,
              top: fog.y,
              width: fog.w,
              height: fog.h,
              background: 'radial-gradient(ellipse at center, rgba(244, 232, 193, 0.08) 0%, transparent 70%)',
              filter: 'blur(20px)',
              animationDelay: `${fog.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Layer 8: Near waves (larger, with foam) */}
      <div className="absolute inset-x-0 bottom-0 depth-layer-near" style={{ height: '35%' }}>
        {/* Dark ocean base */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, transparent 0%, rgba(10, 22, 40, 0.9) 30%, #0a1628 100%)',
          }}
        />
        
        {/* Animated wave rows */}
        {[0, 1, 2].map((row) => (
          <svg
            key={row}
            className="absolute w-[200%] animate-wave"
            style={{
              top: row * 25,
              height: 60,
              animationDuration: `${8 + row * 2}s`,
              animationDelay: `${row * -1}s`,
            }}
            viewBox="0 0 200 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={`waveGrad${row}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(42, 157, 143, 0.4)" />
                <stop offset="50%" stopColor="rgba(26, 61, 80, 0.6)" />
                <stop offset="100%" stopColor="rgba(10, 22, 40, 0.8)" />
              </linearGradient>
            </defs>
            <path
              d={generateWavePath(12 - row * 3, 1.5 + row * 0.3, row * Math.PI / 2)}
              fill={`url(#waveGrad${row})`}
            />
            {/* Foam highlights */}
            <path
              d={generateWavePath(12 - row * 3, 1.5 + row * 0.3, row * Math.PI / 2)}
              fill="none"
              stroke="rgba(244, 232, 193, 0.15)"
              strokeWidth="1"
            />
          </svg>
        ))}
      </div>

      {/* Layer 9: Ambient floating doubloons */}
      <div className="absolute inset-0 depth-layer-near pointer-events-none">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${10 + i * 15}%`,
              bottom: `${20 + (i % 3) * 15}%`,
              opacity: 0.06,
              animation: `floatDiagonal ${40 + i * 10}s linear infinite`,
              animationDelay: `${i * -8}s`,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" fill="#c9922a" />
              <circle cx="12" cy="12" r="7" fill="none" stroke="#8b6914" strokeWidth="1" />
            </svg>
          </div>
        ))}
      </div>

      {/* Layer 10: Seagulls */}
      {showSeagulls && (
        <div className="absolute inset-0 depth-layer-foreground pointer-events-none">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="absolute animate-seagull"
              style={{
                top: `${15 + i * 20}%`,
                animationDelay: `${i * 25}s`,
                animationDuration: `${45 + i * 15}s`,
              }}
            >
              <svg width="20" height="10" viewBox="0 0 20 10" fill="none" stroke="rgba(244, 232, 193, 0.3)" strokeWidth="1">
                <path d="M0,5 Q5,0 10,5 Q15,0 20,5" />
              </svg>
            </div>
          ))}
        </div>
      )}

      {/* Layer 11: Light particles / dust motes */}
      <div className="absolute inset-0 depth-layer-foreground pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${(i * 7) % 100}%`,
              top: `${(i * 11) % 100}%`,
              width: 2,
              height: 2,
              backgroundColor: 'rgba(244, 232, 193, 0.3)',
              animation: `floatDiagonal ${60 + i * 5}s linear infinite`,
              animationDelay: `${i * -3}s`,
              opacity: 0.2,
            }}
          />
        ))}
      </div>

      {/* Vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(10, 22, 40, 0.6) 100%)',
        }}
      />
    </div>
  )
}
