'use client'

import { useState, type ReactNode } from 'react'
import type { Role } from '@/lib/types'
import { DepthScene } from '@/components/depth-scene'
import { NauticalEnvironment } from '@/components/nautical-environment'
import { pageTurn, paper } from '@/lib/sounds'
import { SoundButton } from '@/components/sound-button'

interface PirateScrollProps {
  scenes: ReactNode[]
  onBack?: () => void
  showBackOnScene?: number
  currentRoleIndex?: number
  totalRoles?: number
  roleName?: string
}

const roleLabels: Record<Role, string> = {
  growth: 'GROWTH',
  venture: 'VENTURE RESEARCH',
  cohort: 'COHORT',
}

export function PirateScroll({ 
  scenes, 
  onBack, 
  showBackOnScene = 1,
  currentRoleIndex,
  totalRoles,
  roleName
}: PirateScrollProps) {
  const [currentScene, setCurrentScene] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const nextScene = () => {
    if (currentScene < scenes.length - 1 && !isAnimating) {
      setIsAnimating(true)
      pageTurn()
      paper()
      setTimeout(() => {
        setCurrentScene(currentScene + 1)
        setIsAnimating(false)
      }, 100)
    }
  }

  const prevScene = () => {
    if (currentScene > 0 && !isAnimating) {
      setIsAnimating(true)
      pageTurn()
      paper()
      setTimeout(() => {
        setCurrentScene(currentScene - 1)
        setIsAnimating(false)
      }, 100)
    } else if (onBack) {
      onBack()
    }
  }

  const showRoleIndicator = currentRoleIndex && totalRoles && totalRoles > 1

  return (
    <DepthScene intensity={0.5}>
      <div className="fixed inset-0 mesh-gradient-navy flex items-center justify-center p-4 overflow-hidden">
        <NauticalEnvironment timeOfDay="dusk" showShip={true} showLighthouse={false} showSeagulls={true} intensity={0.6} />

        {/* Role queue indicator */}
      {showRoleIndicator && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3">
          <div className="flex items-center gap-2">
            {Array.from({ length: totalRoles }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i < currentRoleIndex ? 'bg-gold' : i === currentRoleIndex - 1 ? 'bg-gold' : 'bg-rope/40'
                }`}
              />
            ))}
          </div>
          <span className="font-mono text-parchment/80 text-xs uppercase tracking-wider">
            Role {currentRoleIndex} of {totalRoles} {roleName ? `· ${roleName}` : ''}
          </span>
        </div>
      )}

      {/* Parchment scroll */}
      <div className="relative z-10 w-full max-w-2xl">
        {/* Scroll top roll with wood grain */}
        <div className="h-6 md:h-8 rounded-t-lg shadow-lg relative overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(90deg, 
                  rgba(61, 49, 21, 0.8) 0%, 
                  rgba(92, 74, 31, 1) 10%, 
                  rgba(139, 105, 20, 0.8) 30%, 
                  rgba(92, 74, 31, 1) 50%,
                  rgba(139, 105, 20, 0.8) 70%,
                  rgba(92, 74, 31, 1) 90%,
                  rgba(61, 49, 21, 0.8) 100%
                ),
                linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)
              `
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-2 bg-gradient-to-b from-[#4a3d18] to-transparent" />
        </div>
        
        {/* Main scroll content with compass watermark */}
        <div 
          key={currentScene}
          className={`parchment p-6 md:p-12 min-h-[350px] md:min-h-[400px] relative noise compass-watermark ${
            isAnimating ? 'opacity-0' : 'animate-scroll-unroll'
          }`}
        >
          {/* Corner ink stamps */}
          <div className="absolute top-4 left-4 w-8 h-8 opacity-10">
            <svg viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="12" fill="#0a1628" />
              <text x="16" y="20" textAnchor="middle" className="text-[8px] fill-parchment font-serif">S</text>
            </svg>
          </div>
          <div className="absolute top-4 right-4 w-8 h-8 opacity-10">
            <svg viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="12" fill="#0a1628" />
              <text x="16" y="20" textAnchor="middle" className="text-[8px] fill-parchment font-serif">H</text>
            </svg>
          </div>
          <div className="absolute bottom-4 left-4 w-8 h-8 opacity-10">
            <svg viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="12" fill="#0a1628" />
              <text x="16" y="20" textAnchor="middle" className="text-[8px] fill-parchment font-serif">1</text>
            </svg>
          </div>
          <div className="absolute bottom-4 right-4 w-8 h-8 opacity-10">
            <svg viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="12" fill="#0a1628" />
              <text x="16" y="20" textAnchor="middle" className="text-[8px] fill-parchment font-serif">P</text>
            </svg>
          </div>

          <div className="relative z-10">
            {scenes[currentScene]}
          </div>
        </div>

        {/* Scroll bottom roll with wood grain */}
        <div className="h-6 md:h-8 rounded-b-lg shadow-lg relative overflow-hidden">
          <div 
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(90deg, 
                  rgba(61, 49, 21, 0.8) 0%, 
                  rgba(92, 74, 31, 1) 10%, 
                  rgba(139, 105, 20, 0.8) 30%, 
                  rgba(92, 74, 31, 1) 50%,
                  rgba(139, 105, 20, 0.8) 70%,
                  rgba(92, 74, 31, 1) 90%,
                  rgba(61, 49, 21, 0.8) 100%
                ),
                linear-gradient(to top, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)
              `
            }}
          />
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-t from-[#4a3d18] to-transparent" />
        </div>

        {/* Navigation dots */}
        <div className="flex justify-center gap-2 mt-6">
          {scenes.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentScene ? 'bg-gold w-6' : 'bg-rope/50 w-2'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Back button */}
      {currentScene >= showBackOnScene && onBack && (
        <button
          onClick={prevScene}
          className="fixed bottom-6 left-6 z-20 px-4 py-2 bg-navy/80 border border-rope/30 rounded-lg
            font-mono text-parchment text-sm hover:border-gold/50 transition-colors"
        >
          &larr; Back
        </button>
      )}

      {/* Scene indicator */}
        <div className="fixed bottom-6 right-6 z-20 font-mono text-parchment/50 text-sm">
          {currentScene + 1} / {scenes.length}
        </div>
      </div>
    </DepthScene>
  )
}

// Button components for scroll scenes
export function ScrollButton({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false,
  className = ''
}: { 
  children: ReactNode
  onClick: (e: React.MouseEvent) => void
  variant?: 'primary' | 'secondary' | 'outline'
  disabled?: boolean
  className?: string
}) {
  const variants = {
    primary: 'bg-navy text-gold border-gold/30 hover:bg-navy/90',
    secondary: 'bg-rope text-parchment border-rope hover:bg-rope/90',
    outline: 'bg-transparent text-navy border-navy/30 hover:border-navy/60',
  }

  return (
    <SoundButton
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-3 font-mono font-bold rounded-lg border-2 
        transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${variants[variant]} ${className}`}
    >
      {children}
    </SoundButton>
  )
}

export function NextButton({ onClick, children = 'Next' }: { onClick: () => void; children?: ReactNode }) {
  return (
    <SoundButton
      onClick={onClick}
      className="mt-8 px-6 py-3 bg-navy text-gold font-mono font-bold rounded-lg border-2 border-gold/30
        transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-navy/90"
    >
      {children} &rarr;
    </SoundButton>
  )
}
