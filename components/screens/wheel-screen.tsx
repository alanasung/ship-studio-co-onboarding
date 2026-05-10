'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { DepthScene } from '@/components/depth-scene'
import { NauticalEnvironment } from '@/components/nautical-environment'
import { SoundButton } from '@/components/sound-button'
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
  const [wheelRotation, setWheelRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [velocity, setVelocity] = useState(0)
  const [rapidSpinCount, setRapidSpinCount] = useState(0)
  const [showEasterEgg, setShowEasterEgg] = useState(false)
  const wheelRef = useRef<HTMLDivElement>(null)
  const lastAngleRef = useRef(0)
  const lastTimeRef = useRef(Date.now())
  const animationRef = useRef<number | null>(null)

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
        const target = (Math.random() - 0.5) * 30
        return prev + (target - prev) * 0.1
      })
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // Auto-spin when not dragging
  useEffect(() => {
    if (isDragging) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      return
    }

    const animate = () => {
      setWheelRotation(prev => prev + (velocity + 0.15))
      setVelocity(prev => prev * 0.98) // Decay velocity
      
      // Track rapid spins
      const rotations = Math.abs(velocity) / 360
      if (rotations > 0.008) { // Fast spin
        setRapidSpinCount(prev => prev + 1)
      } else {
        setRapidSpinCount(0)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [isDragging, velocity])

  // Easter egg for rapid spinning
  useEffect(() => {
    if (rapidSpinCount > 150 && !showEasterEgg) {
      setShowEasterEgg(true)
      setTimeout(() => setShowEasterEgg(false), 2000)
    }
  }, [rapidSpinCount, showEasterEgg])

  const getAngleFromCenter = useCallback((clientX: number, clientY: number) => {
    if (!wheelRef.current) return 0
    const rect = wheelRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI)
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    lastAngleRef.current = getAngleFromCenter(e.clientX, e.clientY)
    lastTimeRef.current = Date.now()
    creak()
  }, [getAngleFromCenter])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return
    
    const currentAngle = getAngleFromCenter(e.clientX, e.clientY)
    let deltaAngle = currentAngle - lastAngleRef.current
    
    // Handle wrap-around
    if (deltaAngle > 180) deltaAngle -= 360
    if (deltaAngle < -180) deltaAngle += 360
    
    const now = Date.now()
    const deltaTime = now - lastTimeRef.current
    
    if (deltaTime > 0) {
      setVelocity(deltaAngle / deltaTime * 16) // Approximate 60fps
    }
    
    setWheelRotation(prev => prev + deltaAngle)
    lastAngleRef.current = currentAngle
    lastTimeRef.current = now
  }, [isDragging, getAngleFromCenter])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const handleMouseEnter = () => {
    setIsHovering(true)
    creak()
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      <DepthScene intensity={0.8}>
        {/* Nautical environment behind wheel */}
        <NauticalEnvironment timeOfDay="dusk" intensity={0.8} />

        {/* Ship deck framing at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-24 depth-layer-foreground pointer-events-none z-10">
          <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
            <defs>
              <linearGradient id="deckGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#5c4a1f" />
                <stop offset="50%" stopColor="#7a5f23" />
                <stop offset="100%" stopColor="#4a3a18" />
              </linearGradient>
            </defs>
            <path d="M0,8 Q50,0 100,8 L100,24 L0,24 Z" fill="url(#deckGrad)" />
            {/* Plank lines */}
            <line x1="20" y1="10" x2="20" y2="24" stroke="#3d3115" strokeWidth="0.3" />
            <line x1="40" y1="8" x2="40" y2="24" stroke="#3d3115" strokeWidth="0.3" />
            <line x1="60" y1="8" x2="60" y2="24" stroke="#3d3115" strokeWidth="0.3" />
            <line x1="80" y1="10" x2="80" y2="24" stroke="#3d3115" strokeWidth="0.3" />
          </svg>
        </div>

        {/* Mast/rigging hints at edges */}
        <div className="absolute top-0 left-4 w-8 h-40 depth-layer-far pointer-events-none opacity-20">
          <div className="w-2 h-full bg-gradient-to-b from-rope to-transparent" />
        </div>
        <div className="absolute top-0 right-4 w-8 h-40 depth-layer-far pointer-events-none opacity-20">
          <div className="w-2 h-full bg-gradient-to-b from-rope to-transparent ml-auto" />
        </div>

        {/* Easter egg flash */}
        {showEasterEgg && (
          <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-navy/90 px-8 py-4 rounded-lg border-2 border-gold animate-fade-in-up">
              <p className="font-serif text-gold text-2xl">Steady on, Captain!</p>
              <p className="font-mono text-parchment text-sm mt-1">+5 Doubloons</p>
            </div>
          </div>
        )}

        {/* Ship wheel container with 3D tilt */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
          <div 
            ref={wheelRef}
            className="relative depth-tilt"
            style={{ 
              perspective: '1000px',
              transformStyle: 'preserve-3d',
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={() => setIsHovering(false)}
            onMouseDown={handleMouseDown}
          >
            {/* Shadow beneath wheel */}
            <div 
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-80 h-16 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, transparent 70%)',
                transform: 'rotateX(80deg)',
              }}
            />

            {/* Gold light rays */}
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

            {/* Floating particles */}
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

            {/* Main wheel with 3D tilt and manual rotation */}
            <div 
              style={{ 
                transform: `rotateX(12deg) rotateZ(${wheelRotation}deg)`,
                transformStyle: 'preserve-3d',
                cursor: isDragging ? 'grabbing' : 'grab',
              }}
              className="transition-none"
            >
              <svg
                width="320"
                height="320"
                viewBox="0 0 320 320"
                className={`drop-shadow-2xl w-[min(80vw,320px)] h-[min(80vw,320px)] ${
                  isHovering ? 'animate-hub-pulse' : ''
                }`}
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
                  {/* Wood grain pattern */}
                  <pattern id="woodGrain" patternUnits="userSpaceOnUse" width="60" height="60">
                    <rect width="60" height="60" fill="#5c4a1f" />
                    <line x1="0" y1="15" x2="60" y2="15" stroke="#4a3a18" strokeWidth="1" opacity="0.3" />
                    <line x1="0" y1="35" x2="60" y2="35" stroke="#4a3a18" strokeWidth="1" opacity="0.3" />
                    <line x1="0" y1="55" x2="60" y2="55" stroke="#4a3a18" strokeWidth="1" opacity="0.3" />
                  </pattern>
                </defs>

                {/* Far rim (darker, larger) */}
                <circle cx="160" cy="160" r="155" fill="none" stroke="#3d3115" strokeWidth="14" opacity="0.8" />
                
                {/* Outer ring */}
                <circle cx="160" cy="160" r="150" fill="none" stroke="url(#wheelGradient)" strokeWidth="12" />
                
                {/* Inner ring */}
                <circle cx="160" cy="160" r="120" fill="none" stroke="url(#wheelGradient)" strokeWidth="8" />
                
                {/* Center hub */}
                <circle cx="160" cy="160" r="45" fill="url(#hubGradient)" stroke="#3d3115" strokeWidth="3" />
                <circle cx="160" cy="160" r="30" fill="#3d3115" stroke="#5c4a1f" strokeWidth="2" />
                
                {/* 8 Spokes with handles */}
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
                      {/* Gold rivets at spoke base */}
                      <circle
                        cx={160 + 55 * Math.cos(angle)}
                        cy={160 + 55 * Math.sin(angle)}
                        r="4"
                        fill="#c9922a"
                        stroke="#8b6914"
                        strokeWidth="1"
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
                      {/* Gold cap on handle */}
                      <circle
                        cx={handleX}
                        cy={handleY}
                        r="5"
                        fill="#c9922a"
                        opacity="0.8"
                      />
                    </g>
                  )
                })}
              </svg>
            </div>

            {/* Silhouette hands on wheel (subtle) */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.06]"
              style={{ transform: `rotateZ(${wheelRotation * 0.95}deg)` }}
            >
              <svg width="320" height="320" viewBox="0 0 320 320" className="w-[min(80vw,320px)] h-[min(80vw,320px)]">
                {/* Left hand */}
                <ellipse cx="85" cy="250" rx="25" ry="15" fill="#f4e8c1" transform="rotate(-25 85 250)" />
                {/* Right hand */}
                <ellipse cx="235" cy="250" rx="25" ry="15" fill="#f4e8c1" transform="rotate(25 235 250)" />
              </svg>
            </div>

            {/* Compass needle overlay */}
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ transform: `rotate(${compassNeedle}deg)`, transition: 'transform 0.3s ease-out' }}
            >
              <svg width="100" height="100" viewBox="0 0 100 100" className="opacity-80">
                <polygon points="50,10 55,50 50,45 45,50" fill="#c9922a" stroke="#8b6914" strokeWidth="1" />
                <polygon points="50,90 55,50 50,55 45,50" fill="#1a2a44" stroke="#8b6914" strokeWidth="1" />
                <circle cx="50" cy="50" r="6" fill="#c9922a" stroke="#8b6914" strokeWidth="1" />
              </svg>
            </div>

            {/* Center text */}
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

          {/* Parchment ribbon for messages below wheel */}
          <div 
            className={`mt-8 transition-all duration-500 ${
              allMessagesShown ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            <div className="relative">
              {/* Rolled ends */}
              <div className="absolute -left-4 top-0 bottom-0 w-4 bg-gradient-to-r from-[#d4c4a1] to-parchment rounded-l-full" />
              <div className="absolute -right-4 top-0 bottom-0 w-4 bg-gradient-to-l from-[#d4c4a1] to-parchment rounded-r-full" />
              {/* Main ribbon */}
              <div className="bg-parchment px-8 py-3 shadow-lg">
                <p className="font-serif text-navy text-lg text-center">
                  {welcomeMessages[currentMessageIndex]}
                </p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <SoundButton
            onClick={onContinue}
            className={`mt-8 px-8 py-4 bg-gold text-navy font-mono font-bold text-lg rounded-lg 
              hover:bg-rope transition-all duration-300 hover:scale-105 
              depth-button-press shadow-lg shadow-gold/20 ${
                allMessagesShown
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4 pointer-events-none'
              }`}
          >
            Come Aboard
          </SoundButton>
        </div>
      </DepthScene>
    </div>
  )
}
