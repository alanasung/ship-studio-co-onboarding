'use client'

import { useState, useRef } from 'react'
import type { Role } from '@/lib/types'
import { CoinAnimation } from '@/components/doubloon-counter'
import { ding, stamp, hapticLight } from '@/lib/sounds'
import { TrendingUp, Telescope, Anchor } from 'lucide-react'
import { DepthScene } from '@/components/depth-scene'
import { NauticalEnvironment } from '@/components/nautical-environment'
import { SoundButton } from '@/components/sound-button'

interface RoleSelectScreenProps {
  selectedRoles: Role[]
  onSelect: (roles: Role[]) => void
  onClaim: (e?: React.MouseEvent) => void
}

const roleInfo: { role: Role; icon: React.ReactNode; title: string; description: string }[] = [
  {
    role: 'growth',
    icon: <TrendingUp className="w-8 h-8 text-gold" />,
    title: 'Growth',
    description: 'Grow the SH1P brand. Post. Engage. Represent.',
  },
  {
    role: 'venture',
    icon: <Telescope className="w-8 h-8 text-gold" />,
    title: 'Venture Research',
    description: 'Scout the frontier. Post insights. Think like a VC.',
  },
  {
    role: 'cohort',
    icon: <Anchor className="w-8 h-8 text-gold" />,
    title: 'Aspiring Cohort Member',
    description: 'Apply to the next SH1P cohort.',
  },
]

// Wax seal check SVG component
function WaxSealCheck({ animate }: { animate: boolean }) {
  return (
    <div 
      className={`absolute top-3 right-3 ${animate ? 'animate-stamp-in' : ''}`}
      style={{ animation: animate ? 'stamp-in 300ms ease-out forwards' : undefined }}
    >
      <svg width="32" height="32" viewBox="0 0 32 32" className="drop-shadow-md">
        <defs>
          <radialGradient id="sealGrad" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#c94a4a" />
            <stop offset="100%" stopColor="#8b2323" />
          </radialGradient>
        </defs>
        {/* Seal body with irregular edges */}
        <circle cx="16" cy="16" r="14" fill="url(#sealGrad)" />
        <circle cx="16" cy="16" r="11" fill="none" stroke="#6b1a1a" strokeWidth="0.5" opacity="0.5" />
        {/* Embossed checkmark */}
        <path
          d="M9 16L14 21L23 12"
          stroke="#fdf6f0"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#emboss)"
        />
        {/* Inner highlight */}
        <circle cx="12" cy="12" r="6" fill="rgba(255,255,255,0.15)" />
      </svg>
    </div>
  )
}

export function RoleSelectScreen({ selectedRoles, onSelect, onClaim }: RoleSelectScreenProps) {
  const [showCoinAnimation, setShowCoinAnimation] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [justSelected, setJustSelected] = useState<Role | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const toggleRole = (role: Role) => {
    stamp()
    hapticLight()
    if (selectedRoles.includes(role)) {
      onSelect(selectedRoles.filter(r => r !== role))
      setJustSelected(null)
    } else {
      onSelect([...selectedRoles, role])
      setJustSelected(role)
      // Clear the animation trigger after animation completes
      setTimeout(() => setJustSelected(null), 300)
    }
  }

  const handleClaim = (e: React.MouseEvent) => {
    if (selectedRoles.length === 0 || isAnimating) return
    setIsAnimating(true)
    setShowCoinAnimation(true)
    ding()
    
    setTimeout(() => {
      onClaim(e)
    }, 800)
  }

  const handleAnimationComplete = () => {
    setShowCoinAnimation(false)
  }

  return (
    <DepthScene intensity={0.5}>
      <div className="fixed inset-0 mesh-gradient-navy flex flex-col items-center justify-center p-4">
        <NauticalEnvironment timeOfDay="dusk" showShip={true} showLighthouse={false} showSeagulls={true} intensity={0.6} />
        {showCoinAnimation && <CoinAnimation onComplete={handleAnimationComplete} />}
      
      <div className="relative z-10 text-center mb-8">
        <h2 className="font-serif text-3xl md:text-5xl text-parchment mb-3 text-balance">
          {"What's your role on the crew?"}
        </h2>
        <p className="font-mono text-gold text-sm">
          Pick as many as you want.
        </p>
      </div>

      {/* Role cards */}
      <div className="relative z-10 flex flex-col md:flex-row gap-4 w-full max-w-4xl">
        {roleInfo.map(({ role, icon, title, description }) => {
          const isSelected = selectedRoles.includes(role)
          return (
            <button
              key={role}
              onClick={() => toggleRole(role)}
              className={`flex-1 relative p-6 rounded-lg border-2 transition-all duration-300
                hover:scale-[1.02] active:scale-[0.98] text-left card-gold-border depth-card-hover
                ${isSelected 
                  ? 'border-gold bg-gold/10 glow-gold' 
                  : 'border-rope/30 bg-navy/50 hover:border-rope/60'
                }`}
            >
              {/* Wax seal check indicator */}
              {isSelected && <WaxSealCheck animate={justSelected === role} />}

              <div className="mb-3">{icon}</div>
              <h3 className="font-serif text-xl text-parchment mb-2">{title}</h3>
              <p className="font-mono text-sm text-parchment/70">{description}</p>
            </button>
          )
        })}
      </div>

      {/* Role queue indicator */}
      {selectedRoles.length > 1 && (
        <p className="relative z-10 mt-4 font-mono text-parchment/60 text-sm">
          You&apos;ll complete {selectedRoles.length} role onboardings
        </p>
      )}

      {/* CTA Button */}
      <SoundButton
        ref={buttonRef}
        onClick={handleClaim}
        disabled={selectedRoles.length === 0 || isAnimating}
        className={`relative z-10 mt-10 px-8 py-4 font-mono font-bold text-lg rounded-lg transition-all duration-300
          ${selectedRoles.length > 0 && !isAnimating
            ? 'bg-gold text-navy hover:bg-rope hover:scale-105 active:scale-95 shadow-lg shadow-gold/20 cursor-pointer'
            : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
          }`}
      >
        Claim 10 Doubloons &rarr;
      </SoundButton>
      </div>
    </DepthScene>
  )
}
