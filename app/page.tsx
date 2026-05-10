'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Screen, Role, UserData, AppState, DoubloonEvent, EngagementTask, Achievement, AchievementId } from '@/lib/types'
import { initialAppState, createReferralCode, checkStreak, initialAchievements } from '@/lib/types'
import { DoubloonCounter, useFlyingCoins } from '@/components/doubloon-counter'
import { ProgressBar } from '@/components/progress-bar'
import { IntroScreen } from '@/components/screens/intro-screen'
import { WheelScreen } from '@/components/screens/wheel-screen'
import { SignupScreen } from '@/components/screens/signup-screen'
import { RoleSelectScreen } from '@/components/screens/role-select-screen'
import { GrowthScreen } from '@/components/screens/growth-screen'
import { VentureScreen } from '@/components/screens/venture-screen'
import { CohortScreen } from '@/components/screens/cohort-screen'
import { DashboardScreen } from '@/components/screens/dashboard-screen'
import { SoundToggle } from '@/components/sound-toggle'
import { ShipHelper } from '@/components/ship-helper'
import { DoubloonShower } from '@/components/doubloon-shower'
import { achievementChord, swoosh, startAmbient, startLanternCreak, chime, hapticMedium, hapticHeavy } from '@/lib/sounds'

const STORAGE_KEY = 'bounty_state_v2'

function loadState(): AppState | null {
  if (typeof window === 'undefined') return null
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed.doubloonHistory) {
        parsed.doubloonHistory = parsed.doubloonHistory.map((e: DoubloonEvent) => ({
          ...e,
          timestamp: new Date(e.timestamp),
        }))
      }
      // Ensure new fields exist
      if (!parsed.achievements) parsed.achievements = initialAchievements
      if (!parsed.referralCode) parsed.referralCode = ''
      if (parsed.referralCount === undefined) parsed.referralCount = 0
      if (parsed.currentStreak === undefined) parsed.currentStreak = 0
      if (parsed.dailyQuestClaimedDate === undefined) parsed.dailyQuestClaimedDate = undefined
      if (parsed.weeklyQuestClaimedWeek === undefined) parsed.weeklyQuestClaimedWeek = undefined
      if (parsed.profileCompletionRewarded === undefined) parsed.profileCompletionRewarded = false
      return parsed
    }
  } catch {
    // Ignore
  }
  return null
}

function saveState(state: AppState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore
  }
}

export default function BountyApp() {
  const [state, setState] = useState<AppState>(initialAppState)
  const [showCoinAnimation, setShowCoinAnimation] = useState(false)
  const [roleQueue, setRoleQueue] = useState<Role[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const { triggerCoins, CoinRenderer } = useFlyingCoins()

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadState()
    if (saved) {
      setState(saved)
      const remainingRoles = saved.selectedRoles.filter(
        r => !saved.completedRoles.includes(r)
      )
      setRoleQueue(remainingRoles)
    }
    setIsLoaded(true)
  }, [])

  // Start ambient sounds on first user interaction
  useEffect(() => {
    const handleFirstInteraction = () => {
      startAmbient()
      startLanternCreak()
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }
    window.addEventListener('click', handleFirstInteraction, { once: true })
    window.addEventListener('keydown', handleFirstInteraction, { once: true })
    return () => {
      window.removeEventListener('click', handleFirstInteraction)
      window.removeEventListener('keydown', handleFirstInteraction)
    }
  }, [])

  // Save to localStorage on state change
  useEffect(() => {
    if (isLoaded) {
      saveState(state)
    }
  }, [state, isLoaded])

  const setScreen = useCallback((screen: Screen) => {
    swoosh()
    setState(prev => ({ ...prev, screen }))
  }, [])

  const handleSignup = useCallback((userData: UserData) => {
    // Generate referral code on signup
    const referralCode = createReferralCode(userData)
    setState(prev => ({ ...prev, userData, referralCode, screen: 'roleSelect' }))
  }, [])

  const handleRoleSelect = useCallback((roles: Role[]) => {
    setState(prev => ({ ...prev, selectedRoles: roles }))
  }, [])

  const checkAndAwardAchievements = useCallback((currentState: AppState): { newAchievements: Achievement[], totalReward: number } => {
    const newAchievements: Achievement[] = []
    let totalReward = 0

    // Check each achievement
    const checks: { id: AchievementId; condition: boolean }[] = [
      { id: 'first_post', condition: currentState.growthPosts.some(p => p.trim()) || currentState.venturePosts.some(p => p.trim()) },
      { id: 'two_teams', condition: currentState.selectedRoles.length >= 2 },
      { id: 'hundred_doubloons', condition: currentState.doubloons >= 100 },
      { id: 'week_streak', condition: currentState.currentStreak >= 7 },
    ]

    checks.forEach(({ id, condition }) => {
      const achievement = currentState.achievements.find(a => a.id === id)
      if (achievement && !achievement.completed && condition) {
        newAchievements.push({ ...achievement, completed: true })
        totalReward += achievement.doubloonReward
      }
    })

    return { newAchievements, totalReward }
  }, [])

  const handleClaimDoubloons = useCallback((clickEvent?: React.MouseEvent) => {
    const roleOrder: Role[] = ['growth', 'venture', 'cohort']
    const sortedRoles = state.selectedRoles.sort(
      (a, b) => roleOrder.indexOf(a) - roleOrder.indexOf(b)
    )
    
    setState(prev => {
      const newState = {
        ...prev,
        doubloons: prev.doubloons + 10,
        doubloonHistory: [
          ...prev.doubloonHistory,
          {
            id: crypto.randomUUID(),
            amount: 10,
            reason: 'Joined the crew',
            timestamp: new Date(),
          },
        ],
      }
      
      // Check for two_teams achievement
      const { newAchievements, totalReward } = checkAndAwardAchievements(newState)
      if (newAchievements.length > 0) {
        achievementChord()
        chime()
        hapticMedium()
        return {
          ...newState,
          doubloons: newState.doubloons + totalReward,
          achievements: newState.achievements.map(a => 
            newAchievements.find(na => na.id === a.id) || a
          ),
          doubloonHistory: [
            ...newState.doubloonHistory,
            ...newAchievements.map(a => ({
              id: crypto.randomUUID(),
              amount: a.doubloonReward,
              reason: `Achievement: ${a.title}`,
              timestamp: new Date(),
            }))
          ]
        }
      }
      return newState
    })

    if (clickEvent) {
      triggerCoins(3, clickEvent.clientX, clickEvent.clientY)
    }
    
    setShowCoinAnimation(true)
    setRoleQueue(sortedRoles.slice(1))
    
    if (sortedRoles.length > 0) {
      setScreen(sortedRoles[0])
    } else {
      setScreen('dashboard')
    }
  }, [state.selectedRoles, setScreen, triggerCoins, checkAndAwardAchievements])

const earnDoubloons = useCallback((amount: number, reason: string, clickX?: number, clickY?: number) => {
  // Check streak for posts
  const isPost = reason.toLowerCase().includes('post')
  const isDailyQuest = reason.toLowerCase().includes('daily quest')
  const isWeeklyQuest = reason.toLowerCase().includes('weekly quest')
  
  setState(prev => {
  let finalAmount = amount
  let newStreak = prev.currentStreak
  let lastPostDate = prev.lastPostDate
  let dailyQuestClaimedDate = prev.dailyQuestClaimedDate
  let weeklyQuestClaimedWeek = prev.weeklyQuestClaimedWeek
  
  if (isPost) {
  const { newStreak: updatedStreak, isStreakActive } = checkStreak(prev.lastPostDate, prev.currentStreak)
  newStreak = updatedStreak
  lastPostDate = new Date().toISOString()
  
  // Apply streak multiplier (1.5x for 3+ day streak)
  if (isStreakActive && updatedStreak >= 3) {
  finalAmount = Math.round(amount * 1.5)
  }
  }
  
  // Track daily quest claim
  if (isDailyQuest) {
  dailyQuestClaimedDate = new Date().toISOString()
  }
  
  // Track weekly quest claim
  if (isWeeklyQuest) {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const weekNum = Math.ceil((((now.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7)
  weeklyQuestClaimedWeek = `${now.getFullYear()}-W${weekNum}`
  }
  
  const newEvent: DoubloonEvent = {
  id: crypto.randomUUID(),
  amount: finalAmount,
  reason: finalAmount > amount ? `${reason} (streak bonus!)` : reason,
  timestamp: new Date(),
  }
  
  const newState = {
  ...prev,
  doubloons: prev.doubloons + finalAmount,
  doubloonHistory: [...prev.doubloonHistory, newEvent],
  currentStreak: newStreak,
  lastPostDate,
  dailyQuestClaimedDate,
  weeklyQuestClaimedWeek,
  }

      // Check achievements
      const { newAchievements, totalReward } = checkAndAwardAchievements(newState)
      if (newAchievements.length > 0) {
        achievementChord()
        chime()
        hapticMedium()
        return {
          ...newState,
          doubloons: newState.doubloons + totalReward,
          achievements: newState.achievements.map(a => 
            newAchievements.find(na => na.id === a.id) || a
          ),
          doubloonHistory: [
            ...newState.doubloonHistory,
            ...newAchievements.map(a => ({
              id: crypto.randomUUID(),
              amount: a.doubloonReward,
              reason: `Achievement: ${a.title}`,
              timestamp: new Date(),
            }))
          ]
        }
      }

      return newState
    })
    
    if (clickX !== undefined && clickY !== undefined) {
      triggerCoins(Math.min(amount, 5), clickX, clickY)
    }
  }, [triggerCoins, checkAndAwardAchievements])

  const completeRoleOnboarding = useCallback((role: Role) => {
    // Show celebration
    setShowCelebration(true)
    hapticHeavy()

    setState(prev => ({
      ...prev,
      completedRoles: [...prev.completedRoles, role],
    }))
  }, [])

  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false)
    
    // Navigate to next role or dashboard
    const currentRole = state.screen as Role
    const remaining = roleQueue.filter(r => r !== currentRole)
    
    if (remaining.length > 0) {
      const nextRole = remaining[0]
      setRoleQueue(remaining.slice(1))
      setScreen(nextRole)
    } else {
      setScreen('dashboard')
    }
  }, [roleQueue, state.screen, setScreen])

  const handleAddRole = useCallback((role: Role) => {
    setState(prev => ({
      ...prev,
      selectedRoles: [...prev.selectedRoles, role],
    }))
    setScreen(role)
  }, [setScreen])

  const updateGrowthPosts = useCallback((posts: string[]) => {
    setState(prev => ({ ...prev, growthPosts: posts }))
  }, [])

  const updateVenturePosts = useCallback((posts: string[]) => {
    setState(prev => ({ ...prev, venturePosts: posts }))
  }, [])

  const getAvailableRoles = useCallback((): Role[] => {
    return (['growth', 'venture', 'cohort'] as Role[]).filter(
      role => !state.selectedRoles.includes(role) && !state.completedRoles.includes(role)
    )
  }, [state.selectedRoles, state.completedRoles])

  const handleCohortApply = useCallback(() => {
    setState(prev => ({ ...prev, cohortApplied: true }))
  }, [])

  const completeEngagementTask = useCallback((taskId: string, clickX?: number, clickY?: number) => {
    const task = state.engagementTasks.find(t => t.id === taskId)
    if (!task || task.completed) return

    setState(prev => ({
      ...prev,
      engagementTasks: prev.engagementTasks.map(t =>
        t.id === taskId ? { ...t, completed: true } : t
      ),
      doubloons: prev.doubloons + task.doubloonValue,
      doubloonHistory: [
        ...prev.doubloonHistory,
        {
          id: crypto.randomUUID(),
          amount: task.doubloonValue,
          reason: task.title,
          timestamp: new Date(),
        },
      ],
    }))

    if (clickX !== undefined && clickY !== undefined) {
      triggerCoins(1, clickX, clickY)
    }
  }, [state.engagementTasks, triggerCoins])

  const handleUpdateUser = useCallback((userData: UserData) => {
    setState(prev => ({ ...prev, userData }))
  }, [])

  const resetState = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
    setState(initialAppState)
    setRoleQueue([])
  }, [])

  // Calculate role queue info
  const currentRoleIndex = state.selectedRoles.length > 0 
    ? state.selectedRoles.findIndex(r => r === state.screen) + 1
    : 0
  const totalRoles = state.selectedRoles.length

  // Render current screen
  const renderScreen = () => {
    switch (state.screen) {
      case 'intro':
        return <IntroScreen onComplete={() => setScreen('wheel')} />
      
      case 'wheel':
        return <WheelScreen onContinue={() => setScreen('signup')} />
      
      case 'signup':
        return (
          <SignupScreen
            initialData={state.userData}
            onSubmit={handleSignup}
          />
        )
      
      case 'roleSelect':
        return (
          <RoleSelectScreen
            selectedRoles={state.selectedRoles}
            onSelect={handleRoleSelect}
            onClaim={handleClaimDoubloons}
          />
        )
      
      case 'growth':
        return (
          <GrowthScreen
            posts={state.growthPosts}
            onUpdatePosts={updateGrowthPosts}
            onEarnDoubloons={earnDoubloons}
            onComplete={() => completeRoleOnboarding('growth')}
            currentRoleIndex={currentRoleIndex}
            totalRoles={totalRoles}
          />
        )
      
      case 'venture':
        return (
          <VentureScreen
            posts={state.venturePosts}
            onUpdatePosts={updateVenturePosts}
            onEarnDoubloons={earnDoubloons}
            onComplete={() => completeRoleOnboarding('venture')}
            currentRoleIndex={currentRoleIndex}
            totalRoles={totalRoles}
          />
        )
      
      case 'cohort':
        return (
          <CohortScreen
            onComplete={() => completeRoleOnboarding('cohort')}
            onEarnDoubloons={earnDoubloons}
            cohortApplied={state.cohortApplied}
            onCohortApply={handleCohortApply}
            currentRoleIndex={currentRoleIndex}
            totalRoles={totalRoles}
          />
        )
      
      case 'dashboard':
        return (
          <DashboardScreen
            state={state}
            onAddRole={handleAddRole}
            onNavigateToRole={(role) => setScreen(role)}
            onCompleteEngagementTask={completeEngagementTask}
            onUpdateUser={handleUpdateUser}
            onResetState={resetState}
            onEarnDoubloons={earnDoubloons}
          />
        )
      
      default:
        return <IntroScreen onComplete={() => setScreen('wheel')} />
    }
  }

  // Don't render until we've loaded state
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <div className="font-mono text-gold">Loading...</div>
      </div>
    )
  }

  const showHelperAndSound = state.screen !== 'intro'

  return (
    <div className="min-h-screen bg-navy">
      <ProgressBar 
        currentScreen={state.screen} 
        completedRoles={state.completedRoles}
        selectedRoles={state.selectedRoles}
      />
      
      {state.screen !== 'intro' && state.screen !== 'wheel' && (
        <DoubloonCounter count={state.doubloons} showAnimation={showCoinAnimation} />
      )}
      
      {showHelperAndSound && <SoundToggle />}
      {showHelperAndSound && <ShipHelper />}
      
      {renderScreen()}
      
      <CoinRenderer />
      
      <DoubloonShower 
        active={showCelebration} 
        onComplete={handleCelebrationComplete}
        count={50}
      />
    </div>
  )
}
