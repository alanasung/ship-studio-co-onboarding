'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

interface DoubloonCounterProps {
  count: number
  showAnimation?: boolean
}

interface CoinPosition {
  x: number
  y: number
}

// Store the counter position globally so coins can arc to it
let counterRect: DOMRect | null = null

export function getCounterPosition(): CoinPosition | null {
  if (!counterRect) return null
  return {
    x: counterRect.left + counterRect.width / 2,
    y: counterRect.top + counterRect.height / 2,
  }
}

export function DoubloonCounter({ count, showAnimation }: DoubloonCounterProps) {
  const [isPulsing, setIsPulsing] = useState(false)
  const [showGlow, setShowGlow] = useState(false)
  const counterRef = useRef<HTMLDivElement>(null)
  const prevCountRef = useRef(count)

  // Update counter position on mount and resize
  useEffect(() => {
    const updatePosition = () => {
      if (counterRef.current) {
        counterRect = counterRef.current.getBoundingClientRect()
      }
    }
    
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition)
    
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
    }
  }, [])

  // Trigger glow effect when count increases
  useEffect(() => {
    if (count > prevCountRef.current) {
      setShowGlow(true)
      const glowTimer = setTimeout(() => setShowGlow(false), 500)
      return () => clearTimeout(glowTimer)
    }
    prevCountRef.current = count
  }, [count])

  useEffect(() => {
    if (showAnimation) {
      setIsPulsing(true)
      const timer = setTimeout(() => setIsPulsing(false), 300)
      return () => clearTimeout(timer)
    }
  }, [count, showAnimation])

  return (
    <div 
      ref={counterRef}
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 bg-navy/80 backdrop-blur-sm border rounded-full px-4 py-2 transition-all duration-300 ${
        showGlow 
          ? 'border-gold shadow-lg shadow-gold/40' 
          : 'border-gold/30'
      }`}
    >
      {/* Golden glow ring effect */}
      {showGlow && (
        <div 
          className="absolute inset-0 rounded-full bg-gold/20"
          style={{ animation: 'counter-glow-ring 500ms ease-out forwards' }}
        />
      )}
      
      <div className={`relative ${isPulsing ? 'animate-counter-pulse' : ''}`}>
        <CoinSVG size={28} />
      </div>
      <span className={`font-mono font-bold text-lg tabular-nums transition-colors duration-300 ${
        showGlow ? 'text-parchment' : 'text-gold'
      }`}>
        {count}
      </span>

      <style jsx>{`
        @keyframes counter-glow-ring {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export function CoinSVG({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      className="drop-shadow-lg"
    >
      <defs>
        <radialGradient id="coinGradient" cx="30%" cy="30%">
          <stop offset="0%" stopColor="#e5b84a" />
          <stop offset="50%" stopColor="#c9922a" />
          <stop offset="100%" stopColor="#8b6914" />
        </radialGradient>
        <filter id="coinShadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3" />
        </filter>
      </defs>
      <circle cx="14" cy="14" r="13" fill="url(#coinGradient)" filter="url(#coinShadow)" stroke="#8b6914" strokeWidth="1" />
      <text
        x="14"
        y="18"
        textAnchor="middle"
        className="font-serif text-xs fill-navy font-bold"
      >
        $
      </text>
    </svg>
  )
}

interface FlyingCoinProps {
  startX: number
  startY: number
  delay?: number
  onComplete: () => void
}

export function FlyingCoin({ startX, startY, delay = 0, onComplete }: FlyingCoinProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [cssVars, setCssVars] = useState<React.CSSProperties>({})

  useEffect(() => {
    const startTimer = setTimeout(() => {
      const target = getCounterPosition()
      if (!target) {
        onComplete()
        return
      }

      // Calculate the arc parameters
      const deltaX = target.x - startX
      const deltaY = target.y - startY
      const peakY = -120 // Rise 120px above midpoint

      setCssVars({
        '--end-x': `${deltaX}px`,
        '--end-y': `${deltaY}px`,
        '--peak-y': `${peakY}px`,
      } as React.CSSProperties)
      
      setIsAnimating(true)

      // Complete after animation
      const completeTimer = setTimeout(onComplete, 800)
      return () => clearTimeout(completeTimer)
    }, delay)

    return () => clearTimeout(startTimer)
  }, [startX, startY, delay, onComplete])

  if (!isAnimating) return null

  return (
    <div 
      style={{
        position: 'fixed',
        left: startX - 24,
        top: startY - 24,
        zIndex: 100,
        animation: 'coin-arc-fly 800ms ease-out forwards',
        ...cssVars,
      }}
    >
      <CoinSVG size={48} />
    </div>
  )
}

// Legacy animation component for backwards compatibility
export function CoinAnimation({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 800)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
      <svg
        width="48"
        height="48"
        viewBox="0 0 28 28"
        className="animate-coin-flip"
      >
        <defs>
          <radialGradient id="coinGradientAnim" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#e5b84a" />
            <stop offset="50%" stopColor="#c9922a" />
            <stop offset="100%" stopColor="#8b6914" />
          </radialGradient>
        </defs>
        <circle cx="14" cy="14" r="13" fill="url(#coinGradientAnim)" stroke="#8b6914" strokeWidth="1" />
        <text
          x="14"
          y="18"
          textAnchor="middle"
          className="font-serif text-xs fill-navy font-bold"
        >
          $
        </text>
      </svg>
    </div>
  )
}

// Hook to manage multiple flying coins
export function useFlyingCoins() {
  const [coins, setCoins] = useState<{ id: string; x: number; y: number; delay: number }[]>([])

  const triggerCoins = useCallback((count: number, originX: number, originY: number) => {
    const newCoins = Array.from({ length: count }, (_, i) => ({
      id: crypto.randomUUID(),
      x: originX,
      y: originY,
      delay: i * 150,
    }))
    setCoins(prev => [...prev, ...newCoins])
  }, [])

  const removeCoin = useCallback((id: string) => {
    setCoins(prev => prev.filter(c => c.id !== id))
  }, [])

  const CoinRenderer = useCallback(() => (
    <>
      {coins.map(coin => (
        <FlyingCoin
          key={coin.id}
          startX={coin.x}
          startY={coin.y}
          delay={coin.delay}
          onComplete={() => removeCoin(coin.id)}
        />
      ))}
    </>
  ), [coins, removeCoin])

  return { triggerCoins, CoinRenderer }
}
