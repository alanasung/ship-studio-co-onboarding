'use client'

import { useEffect, useState } from 'react'
import { DepthScene } from '@/components/depth-scene'
import { NauticalEnvironment } from '@/components/nautical-environment'
import { fogHorn } from '@/lib/sounds'

interface IntroScreenProps {
  onComplete: () => void
}

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const [phase, setPhase] = useState<'black' | 'fadein' | 'ship' | 'title' | 'fadeout'>('black')
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    // Cinematic timing sequence
    const timers: NodeJS.Timeout[] = []
    
    // 0.0-0.5s: Black screen
    timers.push(setTimeout(() => {
      setPhase('fadein')
      fogHorn()
    }, 500))
    
    // 0.5-1.5s: Fade in ocean
    timers.push(setTimeout(() => setPhase('ship'), 1500))
    
    // 1.5-2.5s: Ship approaches
    timers.push(setTimeout(() => setPhase('title'), 2500))
    
    // 3.0s: Auto-transition
    timers.push(setTimeout(() => {
      if (!isTransitioning) {
        triggerTransition()
      }
    }, 4500))

    return () => timers.forEach(clearTimeout)
  }, [isTransitioning])

  const triggerTransition = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setPhase('fadeout')
    setTimeout(onComplete, 800)
  }

  return (
    <div 
      className={`fixed inset-0 overflow-hidden cursor-pointer transition-all duration-800 ${
        phase === 'fadeout' ? 'opacity-0 blur-xl scale-105' : 'opacity-100 blur-0 scale-100'
      }`}
      onClick={triggerTransition}
    >
      <DepthScene intensity={0.5}>
        {/* Black overlay for fade-in */}
        <div 
          className="absolute inset-0 bg-black z-50 transition-opacity duration-1000 pointer-events-none"
          style={{ opacity: phase === 'black' ? 1 : 0 }}
        />

        {/* Nautical environment background */}
        <NauticalEnvironment 
          timeOfDay="night" 
          showShip={false}
          showLighthouse={true}
          showSeagulls={false}
          intensity={phase === 'black' ? 0 : 1}
        />

        {/* Camera shake container */}
        <div className="absolute inset-0 animate-camera-shake">
          {/* Large approaching ship */}
          <div 
            className={`absolute left-1/2 -translate-x-1/2 transition-all duration-2000 ease-out ${
              phase === 'black' || phase === 'fadein' 
                ? 'bottom-[20%] scale-50 opacity-0' 
                : phase === 'ship'
                ? 'bottom-[25%] scale-75 opacity-100'
                : 'bottom-[28%] scale-100 opacity-100'
            }`}
          >
            <div className="animate-ship-bob">
              <svg width="280" height="220" viewBox="0 0 280 220" className="drop-shadow-2xl">
                {/* Ship glow */}
                <defs>
                  <radialGradient id="lanternGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#c9922a" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#c9922a" stopOpacity="0" />
                  </radialGradient>
                  <filter id="shipShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="10" stdDeviation="15" floodColor="#000" floodOpacity="0.5" />
                  </filter>
                </defs>
                
                {/* Lantern glow on prow */}
                <circle 
                  cx="140" 
                  cy="95" 
                  r="40" 
                  fill="url(#lanternGlow)" 
                  className="animate-lamp-flicker"
                />
                
                {/* Hull - more detailed */}
                <g filter="url(#shipShadow)">
                  <path
                    d="M40,150 Q50,180 140,190 Q230,180 240,150 L220,150 L210,120 L70,120 L60,150 Z"
                    fill="#5c4a1f"
                  />
                  {/* Hull detail lines */}
                  <path
                    d="M60,140 Q140,148 220,140"
                    fill="none"
                    stroke="#7a5f23"
                    strokeWidth="2"
                  />
                  <path
                    d="M65,155 Q140,165 215,155"
                    fill="none"
                    stroke="#4a3a18"
                    strokeWidth="2"
                  />
                </g>
                
                {/* Deck */}
                <rect x="70" y="110" width="140" height="15" fill="#7a5f23" rx="3" />
                <rect x="80" y="105" width="120" height="8" fill="#8b6914" rx="2" />
                
                {/* Main mast */}
                <rect x="136" y="20" width="8" height="95" fill="#5c4a1f" />
                
                {/* Crow's nest */}
                <rect x="128" y="25" width="24" height="12" fill="#4a3a18" rx="2" />
                
                {/* Main sail */}
                <path
                  d="M144,35 L144,100 L210,90 Q180,65 144,35"
                  fill="#f4e8c1"
                  opacity="0.95"
                />
                {/* Sail shadow */}
                <path
                  d="M144,45 L144,95 L190,87 Q170,70 144,45"
                  fill="#d4c8a1"
                  opacity="0.3"
                />
                
                {/* Secondary sail */}
                <path
                  d="M144,35 L144,100 L78,90 Q110,65 144,35"
                  fill="#e4d8b1"
                  opacity="0.9"
                />
                
                {/* Fore mast */}
                <rect x="90" y="50" width="6" height="60" fill="#5c4a1f" />
                
                {/* Fore sail */}
                <path
                  d="M93,55 L93,105 L55,100 Q70,78 93,55"
                  fill="#f4e8c1"
                  opacity="0.85"
                />
                
                {/* Rear mast */}
                <rect x="184" y="55" width="6" height="55" fill="#5c4a1f" />
                
                {/* Rear sail */}
                <path
                  d="M187,60 L187,105 L225,100 Q205,80 187,60"
                  fill="#f4e8c1"
                  opacity="0.85"
                />
                
                {/* Flag */}
                <path
                  d="M140,10 L140,25 L165,17.5 Z"
                  fill="#c9922a"
                />
                
                {/* Rigging lines */}
                <line x1="140" y1="20" x2="70" y2="110" stroke="#8b6914" strokeWidth="1" opacity="0.5" />
                <line x1="140" y1="20" x2="210" y2="110" stroke="#8b6914" strokeWidth="1" opacity="0.5" />
                <line x1="93" y1="50" x2="70" y2="110" stroke="#8b6914" strokeWidth="1" opacity="0.4" />
                <line x1="187" y1="55" x2="210" y2="110" stroke="#8b6914" strokeWidth="1" opacity="0.4" />
                
                {/* Prow lantern */}
                <rect x="135" y="90" width="10" height="15" fill="#8b6914" rx="2" />
                <circle cx="140" cy="95" r="4" fill="#c9922a" className="animate-lamp-flicker" />
                
                {/* Wake effect */}
                <ellipse cx="140" cy="200" rx="100" ry="15" fill="rgba(42, 157, 143, 0.2)" />
              </svg>
            </div>
          </div>
        </div>

        {/* Title overlay */}
        <div 
          className={`absolute inset-0 flex flex-col items-center justify-center z-30 transition-all duration-1000 ${
            phase === 'title' || phase === 'fadeout'
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-110'
          }`}
        >
          <h1 
            className="font-serif text-7xl sm:text-8xl md:text-[10rem] text-parchment tracking-wider"
            style={{
              textShadow: '0 0 60px rgba(201, 146, 42, 0.5), 0 4px 30px rgba(0, 0, 0, 0.8)',
            }}
          >
            BOUNTY
          </h1>
          <p 
            className={`font-mono text-gold text-xl mt-6 tracking-[0.3em] transition-all duration-500 delay-300 ${
              phase === 'title' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            by SH1P
          </p>
        </div>

        {/* Fog overlay at bottom */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-20"
          style={{
            background: 'linear-gradient(to top, rgba(10, 22, 40, 0.9) 0%, transparent 100%)',
          }}
        />

        {/* Skip button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            triggerTransition()
          }}
          className="fixed bottom-6 right-6 z-40 font-mono text-parchment/40 text-sm hover:text-parchment/80 transition-colors"
        >
          Skip
        </button>
      </DepthScene>
    </div>
  )
}
