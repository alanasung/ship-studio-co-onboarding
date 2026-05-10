'use client'

import type { Screen, Role } from '@/lib/types'

interface ProgressBarProps {
  currentScreen: Screen
  completedRoles?: Role[]
  selectedRoles?: Role[]
}

function calculateProgress(
  screen: Screen,
  completedRoles: Role[] = [],
  selectedRoles: Role[] = []
): number {
  const baseProgress: Record<Screen, number> = {
    intro: 0,
    wheel: 10,
    signup: 25,
    roleSelect: 40,
    growth: 50,
    venture: 50,
    cohort: 50,
    dashboard: 100,
  }

  if (screen === 'dashboard') return 100
  if (screen === 'intro') return 0

  let progress = baseProgress[screen] || 0

  const rolesCount = Math.max(selectedRoles.length, 1)
  const progressPerRole = (100 - 40) / rolesCount
  
  progress += completedRoles.length * progressPerRole

  if (['growth', 'venture', 'cohort'].includes(screen)) {
    progress = 40 + (completedRoles.length + 0.5) * progressPerRole
  }

  return Math.min(Math.round(progress), 100)
}

export function ProgressBar({ currentScreen, completedRoles = [], selectedRoles = [] }: ProgressBarProps) {
  const progress = calculateProgress(currentScreen, completedRoles, selectedRoles)

  if (currentScreen === 'intro') return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[5px] bg-navy/50">
      <div 
        className="h-full progress-gold transition-all duration-700 ease-out relative overflow-hidden"
        style={{ width: `${progress}%` }}
      >
        {/* Shimmer highlight traveling along the bar */}
        <div 
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
          style={{ animation: 'shimmer 3s linear infinite' }}
        />
      </div>
    </div>
  )
}
