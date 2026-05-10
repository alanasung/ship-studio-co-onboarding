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
  const [floatingAmount, setFloatingAmount] = useState<number | null>(null)
  const [coinStack, setCoinStack] = useState(false)
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

  // Trigger effects when count increases
  useEffect(() => {
    const diff = count - prevCountRef.current
    if (diff > 0) {
      setShowGlow(true)
      setFloatingAmount(diff)
      
      // Show coin stack for larger amounts
      if (diff >= 10) {
        setCoinStack(true)
        setTimeout(() => setCoinStack(false), 800)
      }
      
      const glowTimer = setTimeout(() => setShowGlow(false), 500)
      const floatTimer = setTimeout(() => setFloatingAmount(null), 800)
      
      return () => {
        clearTimeout(glowTimer)
        clearTimeout(floatTimer)
      }
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
      
      {/* Floating +N indicator */}
      {floatingAmount !== null && (
        <div 
          className="absolute -top-8 left-1/2 -translate-x-1/2 font-mono font-bold text-parchment text-lg"
          style={{ animation: 'float-up-fade 800ms ease-out forwards' }}
        >
          +{floatingAmount}
        </div>
      )}
      
      {/* Mini coin stack for large earnings */}
      {coinStack && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col-reverse items-center">
          {[0, 1, 2].map(i => (
            <div 
              key={i}
              className="w-4 h-4"
              style={{ 
                animation: `coin-stack-flip 600ms ease-out ${i * 100}ms forwards`,
                marginTop: i > 0 ? '-8px' : 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 28 28">
                <defs>
                  <radialGradient id={`stackCoin${i}`} cx="30%" cy="30%">
                    <stop offset="0%" stopColor="#e5b84a" />
                    <stop offset="50%" stopColor="#c9922a" />
                    <stop offset="100%" stopColor="#8b6914" />
                  </radialGradient>
                </defs>
                <circle cx="14" cy="14" r="13" fill={`url(#stackCoin${i})`} stroke="#8b6914" strokeWidth="1" />
              </svg>
            </div>
          ))}
        </div>
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
        @keyframes float-up-fade {
          0% { transform: translateX(-50%) translateY(0); opacity: 1; }
          100% { transform: translateX(-50%) translateY(-20px); opacity: 0; }
        }
        @keyframes coin-stack-flip {
          0% { transform: scale(0) rotateY(0deg); opacity: 1; }
          50% { transform: scale(1.2) rotateY(180deg); opacity: 1; }
          100% { transform: scale(1) rotateY(360deg); opacity: 0; }
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
  variance?: number
  onComplete: () => void
}

export function FlyingCoin({ startX, startY, delay = 0, variance = 0, onComplete }: FlyingCoinProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [cssVars, setCssVars] = useState<React.CSSProperties>({})

  useEffect(() => {
    const startTimer = setTimeout(() => {
      const target = getCounterPosition()
      if (!target) {
        onComplete()
        return
      }

      // Calculate the arc parameters with variance
      const offsetX = (Math.random() - 0.5) * variance * 2
      const offsetY = (Math.random() - 0.5) * variance * 2
      const deltaX = target.x - (startX + offsetX)
      const deltaY = target.y - (startY + offsetY)
      const peakY = -80 - Math.random() * 60 // Variable arc height

      setCssVars({
        '--end-x': `${deltaX}px`,
        '--end-y': `${deltaY}px`,
        '--peak-y': `${peakY}px`,
      } as React.CSSProperties)
      
      setIsAnimating(true)

      // Complete after animation
      const completeTimer = setTimeout(onComplete, 700)
      return () => clearTimeout(completeTimer)
    }, delay)

    return () => clearTimeout(startTimer)
  }, [startX, startY, delay, variance, onComplete])

  if (!isAnimating) return null

  return (
    <div 
      style={{
        position: 'fixed',
        left: startX - 20,
        top: startY - 20,
        zIndex: 100,
        animation: 'coin-arc-fly 700ms ease-out forwards',
        ...cssVars,
      }}
    >
      <CoinSVG size={40} />
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

// Hook to manage multiple flying coins with abundance
export function useFlyingCoins() {
  const [coins, setCoins] = useState<{ id: string; x: number; y: number; delay: number; variance: number }[]>([])

  const triggerCoins = useCallback((amount: number, originX: number, originY: number) => {
    // Fire multiple coins based on amount: ceil(amount / 2)
    const coinCount = Math.min(Math.ceil(amount / 2), 8) // Cap at 8 coins
    
    const newCoins = Array.from({ length: coinCount }, (_, i) => ({
      id: crypto.randomUUID(),
      x: originX + (Math.random() - 0.5) * 30, // Random offset
      y: originY + (Math.random() - 0.5) * 30,
      delay: i * 60, // Stagger 60ms apart
      variance: 15, // Random trajectory variance
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
          variance={coin.variance}
          onComplete={() => removeCoin(coin.id)}
        />
      ))}
    </>
  ), [coins, removeCoin])

  return { triggerCoins, CoinRenderer }
}
