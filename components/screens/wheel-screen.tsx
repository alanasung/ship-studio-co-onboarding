'use client'

import { useState, useEffect } from 'react'
import { OceanAtmosphere } from '@/components/ocean-atmosphere'
import { creak } from '@/lib/sounds'

interface WheelScreenProps {
  onContinue: () => void
}

// Cluely-direct copy
const welcomeMessages = [
  'Most networks are dead weight.',
  'SH1P is the crew that ships.',
  "You've been invited.",
  'Take the wheel.',
]

export function WheelScreen({ onContinue }: WheelScreenProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [isMessageVisible, setIsMessageVisible] = useState(true)
  const [allMessagesShown, setAllMessagesShown] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [compassNeedle, setCompassNeedle] = useState(0)

  useEffect(() => {
    if (allMessagesShown) return

    const cycleMessage = () => {
      setIsMessageVisible(false)
      
      setTimeout(() => {
        setCurrentMessageIndex(prev => {
          const next = prev + 1
          if (next >= welcomeMessages.length) {
            setAllMessagesShown(true)
            return prev
          }
          return next
        })
        setIsMessageVisible(true)
      }, 400)
    }

    const timer = setTimeout(cycleMessage, 1600)
    return () => clearTimeout(timer)
  }, [currentMessageIndex, allMessagesShown])

  // Compass needle animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCompassNeedle(prev => {
        // Subtle wobble: -15 to +15 degrees
        const target = (Math.random() - 0.5) * 30
        return prev + (target - prev) * 0.1
      })
    }, 100)
    return () => clearInterval(interval)
  }, [])

  const handleMouseEnter = () => {
    setIsHovering(true)
    creak()
  }

  return (
    <div className="fixed inset-0 mesh-gradient-navy flex flex-col items-center justify-center overflow-hidden p-4">
      <OceanAtmosphere variant="minimal" />
      
      {/* Ship wheel container */}
      <div 
        className="relative"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Gold light rays emanating from hub */}
        <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${isHovering ? 'opacity-40' : 'opacity-20'}`}>
          <svg
            width="400"
            height="400"
            viewBox="0 0 400 400"
            className="animate-spin-reverse-slow w-[min(90vw,400px)] h-[min(90vw,400px)]"
          >
            <defs>
              <linearGradient id="rayGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#c9922a" stopOpacity="0" />
                <stop offset="30%" stopColor="#c9922a" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#c9922a" stopOpacity="0" />
              </linearGradient>
            </defs>
            {Array.from({ length: 8 }).map((_, i) => (
              <rect
                key={i}
                x="200"
                y="195"
                width="180"
                height="10"
                fill="url(#rayGrad)"
                transform={`rotate(${i * 45} 200 200)`}
                style={{ mixBlendMode: 'screen' }}
              />
            ))}
          </svg>
        </div>

        {/* Floating particles around wheel */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180
            const radius = 180 + Math.sin(i) * 20
            return (
              <div
                key={i}
                className="absolute w-2 h-2 bg-gold/40 rounded-full"
                style={{
                  left: `calc(50% + ${Math.cos(angle) * radius}px)`,
                  top: `calc(50% + ${Math.sin(angle) * radius}px)`,
                  animation: `twinkle ${2 + (i % 3)}s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            )
          })}
        </div>

        {/* Main wheel SVG */}
        <svg
          width="320"
          height="320"
          viewBox="0 0 320 320"
          className={`drop-shadow-2xl transition-all duration-1000 w-[min(80vw,320px)] h-[min(80vw,320px)] ${
            isHovering ? 'animate-spin-slower cursor-grab' : 'animate-spin-slow'
          } ${isHovering ? 'animate-hub-pulse' : ''}`}
        >
          <defs>
            <radialGradient id="wheelGradient" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#8b6914" />
              <stop offset="50%" stopColor="#5c4a1f" />
              <stop offset="100%" stopColor="#3d3115" />
            </radialGradient>
            <radialGradient id="hubGradient" cx="30%" cy="30%">
              <stop offset="0%" stopColor={isHovering ? "#e5b84a" : "#5c4a1f"} />
              <stop offset="100%" stopColor="#3d3115" />
            </radialGradient>
          </defs>
          
          {/* Outer ring */}
          <circle cx="160" cy="160" r="150" fill="none" stroke="url(#wheelGradient)" strokeWidth="12" />
          
          {/* Inner ring */}
          <circle cx="160" cy="160" r="120" fill="none" stroke="url(#wheelGradient)" strokeWidth="8" />
          
          {/* Center hub */}
          <circle 
            cx="160" cy="160" r="45" 
            fill="url(#hubGradient)" 
            stroke="#3d3115" 
            strokeWidth="3"
          />
          <circle cx="160" cy="160" r="30" fill="#3d3115" stroke="#5c4a1f" strokeWidth="2" />
          
          {/* 8 Spokes with handles that glow on hover */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180
            const x1 = 160 + 45 * Math.cos(angle)
            const y1 = 160 + 45 * Math.sin(angle)
            const x2 = 160 + 150 * Math.cos(angle)
            const y2 = 160 + 150 * Math.sin(angle)
            const handleX = 160 + 155 * Math.cos(angle)
            const handleY = 160 + 155 * Math.sin(angle)
            
            return (
              <g key={i}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="url(#wheelGradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <circle
                  cx={handleX}
                  cy={handleY}
                  r="12"
                  fill="url(#wheelGradient)"
                  stroke="#3d3115"
                  strokeWidth="2"
                  className={isHovering ? 'spoke-glow' : ''}
                />
              </g>
            )
          })}
        </svg>

        {/* Compass needle overlay - doesn't rotate with wheel */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ transform: `rotate(${compassNeedle}deg)`, transition: 'transform 0.3s ease-out' }}
        >
          <svg width="100" height="100" viewBox="0 0 100 100" className="opacity-80">
            {/* Compass needle pointing up */}
            <polygon 
              points="50,10 55,50 50,45 45,50" 
              fill="#c9922a" 
              stroke="#8b6914"
              strokeWidth="1"
            />
            <polygon 
              points="50,90 55,50 50,55 45,50" 
              fill="#1a2a44" 
              stroke="#8b6914"
              strokeWidth="1"
            />
            {/* Center pin */}
            <circle cx="50" cy="50" r="6" fill="#c9922a" stroke="#8b6914" strokeWidth="1" />
          </svg>
        </div>

        {/* Center text container - doesn't rotate */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-24 h-24 flex items-center justify-center text-center px-2">
            <span 
              className={`font-serif text-sm leading-tight transition-all duration-300 ${
                isMessageVisible ? 'opacity-100' : 'opacity-0'
              } ${isHovering ? 'text-gold' : 'text-parchment'}`}
            >
              {allMessagesShown ? 'SH1P' : welcomeMessages[currentMessageIndex]}
            </span>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onContinue}
        className={`mt-12 px-8 py-4 bg-gold text-navy font-mono font-bold text-lg rounded-lg 
          hover:bg-rope transition-all duration-300 hover:scale-105 active:scale-95
          shadow-lg shadow-gold/20 ${
            allMessagesShown
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
      >
        Come Aboard
      </button>
    </div>
  )
}
