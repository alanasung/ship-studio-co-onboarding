'use client'

import { useState, useRef } from 'react'
import { PirateScroll, NextButton, ScrollButton } from '@/components/pirate-scroll'
import { ding } from '@/lib/audio'

interface CohortScreenProps {
  onComplete: () => void
  onEarnDoubloons: (amount: number, reason: string, clickX?: number, clickY?: number) => void
  cohortApplied: boolean
  onCohortApply: () => void
  currentRoleIndex?: number
  totalRoles?: number
}

export function CohortScreen({ 
  onComplete, 
  onEarnDoubloons, 
  cohortApplied, 
  onCohortApply,
  currentRoleIndex,
  totalRoles
}: CohortScreenProps) {
  const [sceneIndex, setSceneIndex] = useState(0)
  const applyButtonRef = useRef<HTMLAnchorElement>(null)

  const handleApplyClick = (e: React.MouseEvent) => {
    if (!cohortApplied) {
      const buttonRect = applyButtonRef.current?.getBoundingClientRect()
      const clickX = buttonRect ? buttonRect.left + buttonRect.width / 2 : e.clientX
      const clickY = buttonRect ? buttonRect.top + buttonRect.height / 2 : e.clientY
      
      ding()
      onEarnDoubloons(10, 'Cohort application submitted', clickX, clickY)
      onCohortApply()
    }
  }

  const scenes = [
    // Scene 1: Why Apply
    <div key="why" className="space-y-6">
      <h2 className="font-serif text-2xl md:text-3xl text-navy">Why Apply to SH1P?</h2>
      <p className="font-mono text-navy/80 text-sm leading-relaxed">
        The SH1P cohort is where the best builders on earth come together to ship world-changing products.
      </p>
      
      <ul className="space-y-3">
        <li className="flex items-start gap-3">
          <span className="text-gold font-bold">1.</span>
          <span className="font-mono text-navy/80 text-sm">
            <strong>Direct access to founders & investors</strong> — pitch, get feedback, and build relationships with people who can change your trajectory.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-gold font-bold">2.</span>
          <span className="font-mono text-navy/80 text-sm">
            <strong>A community of elite builders</strong> — collaborate with people who are actually shipping, not just talking.
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="text-gold font-bold">3.</span>
          <span className="font-mono text-navy/80 text-sm">
            <strong>Real opportunities</strong> — funding, partnerships, and roles that come from being in the room.
          </span>
        </li>
      </ul>
      
      <NextButton onClick={() => setSceneIndex(1)}>Continue</NextButton>
    </div>,

    // Scene 2: Apply CTA
    <div key="apply" className="space-y-8 text-center">
      <div className="text-6xl mb-4">
        <svg className="w-16 h-16 mx-auto text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" transform="rotate(180 12 12)" />
        </svg>
      </div>
      <h2 className="font-serif text-2xl md:text-3xl text-navy">
        {"Think you've got what it takes?"}
      </h2>
      <p className="font-mono text-navy/80 leading-relaxed text-sm">
        Apply to be in the next SH1P cohort and join the ranks of the best builders on earth.
      </p>
      
      {/* Doubloon reward preview */}
      <div className="flex items-center justify-center gap-2 text-gold font-mono text-sm">
        <span>+10 doubloons for submitting your application</span>
      </div>
      
      <div className="flex flex-col gap-4 mt-8">
        <a
          ref={applyButtonRef}
          href="https://sh1p.co/apply"
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleApplyClick}
          className={`px-8 py-4 font-mono font-bold text-lg rounded-lg border-2 
            transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] inline-block
            ${cohortApplied 
              ? 'bg-seafoam/20 text-seafoam border-seafoam/30 cursor-default' 
              : 'bg-navy text-gold border-gold/30 hover:bg-navy/90'
            }`}
        >
          {cohortApplied ? 'Application Submitted!' : 'Apply Here →'}
        </a>
        
        <ScrollButton onClick={onComplete} variant="outline">
          {totalRoles && currentRoleIndex && currentRoleIndex < totalRoles 
            ? 'Continue to Next Role' 
            : 'Go to Dashboard'}
        </ScrollButton>
      </div>
    </div>,
  ]

  return (
    <PirateScroll 
      scenes={[scenes[sceneIndex]]}
      onBack={sceneIndex > 0 ? () => setSceneIndex(sceneIndex - 1) : undefined}
      currentRoleIndex={currentRoleIndex}
      totalRoles={totalRoles}
      roleName="COHORT"
    />
  )
}
