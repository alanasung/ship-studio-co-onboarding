'use client'

import { useEffect, useState } from 'react'

interface IntroScreenProps {
  onComplete: () => void
}

export function IntroScreen({ onComplete }: IntroScreenProps) {
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      triggerTransition()
    }, 1800) // Reduced from 2500ms

    return () => clearTimeout(timer)
  }, [])

  const triggerTransition = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setTimeout(onComplete, 500)
  }

  return (
    <div 
      className={`fixed inset-0 bg-navy overflow-hidden cursor-pointer screen-transition ${
        isTransitioning ? 'opacity-0 blur-xl' : 'opacity-100 blur-0'
      }`}
      onClick={triggerTransition}
    >
      {/* Ocean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy via-[#0d1e33] to-[#051525]" />
      
      {/* Stars */}
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-parchment rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 40}%`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          />
        ))}
      </div>

      {/* Layered waves */}
      <div className="absolute bottom-0 left-0 right-0 h-48 overflow-hidden">
        {/* Back wave */}
        <svg
          className="absolute bottom-0 w-[200%] h-24 animate-wave-slow"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 C150,90 350,30 600,60 C850,90 1050,30 1200,60 L1200,120 L0,120 Z"
            className="fill-[#0d2847]"
          />
        </svg>
        
        {/* Front wave */}
        <svg
          className="absolute bottom-0 w-[200%] h-20 animate-wave"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 C150,80 350,10 600,50 C850,90 1050,20 1200,60 L1200,120 L0,120 Z"
            className="fill-[#051525]"
          />
        </svg>
      </div>

      {/* Ship */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 animate-ship-bob">
        <svg width="120" height="100" viewBox="0 0 120 100" className="drop-shadow-2xl">
          {/* Hull */}
          <path
            d="M20,60 Q25,75 60,80 Q95,75 100,60 L90,60 L85,50 L35,50 L30,60 Z"
            className="fill-rope"
          />
          {/* Deck */}
          <rect x="35" y="45" width="50" height="8" className="fill-[#5c4a1f]" rx="2" />
          {/* Mast */}
          <rect x="58" y="10" width="4" height="40" className="fill-rope" />
          {/* Sail */}
          <path
            d="M62,12 L62,45 L90,40 Q75,28 62,12"
            className="fill-parchment/90"
          />
          {/* Flag */}
          <path
            d="M60,5 L60,15 L75,10 Z"
            className="fill-gold"
          />
        </svg>
      </div>

      {/* Title overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <h1 className="font-serif text-6xl sm:text-7xl md:text-9xl text-parchment tracking-wider drop-shadow-2xl">
          BOUNTY
        </h1>
        <p className="font-mono text-gold text-lg mt-4 tracking-widest">
          by SH1P
        </p>
      </div>

      {/* Skip button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          triggerTransition()
        }}
        className="fixed bottom-6 right-6 font-mono text-parchment/50 text-sm hover:text-parchment/80 transition-colors"
      >
        Skip &crarr;
      </button>
    </div>
  )
}
