'use client'

import { useState, useEffect, useMemo } from 'react'
import type { AppState, Role, UserData, Achievement } from '@/lib/types'
import { TrendingUp, Telescope, Anchor, ChevronDown, ChevronUp, Pencil, X, Lock, Check, Copy, ExternalLink, Flame } from 'lucide-react'
import { ding } from '@/lib/audio'
import { DepthScene } from '@/components/depth-scene'
import { NauticalEnvironment } from '@/components/nautical-environment'
import { SoundButton } from '@/components/sound-button'

interface DashboardScreenProps {
  state: AppState
  onAddRole: (role: Role) => void
  onNavigateToRole: (role: Role) => void
  onCompleteEngagementTask: (taskId: string, clickX?: number, clickY?: number) => void
  onUpdateUser: (userData: UserData) => void
  onResetState: () => void
  onEarnDoubloons: (amount: number, reason: string, clickX?: number, clickY?: number) => void
}

const newsSources = [
  { name: 'TechCrunch', domain: 'techcrunch.com', url: 'https://techcrunch.com' },
  { name: 'Crunchbase', domain: 'news.crunchbase.com', url: 'https://news.crunchbase.com' },
  { name: 'Product Hunt', domain: 'producthunt.com', url: 'https://producthunt.com' },
  { name: 'The Information', domain: 'theinformation.com', url: 'https://theinformation.com' },
]

const roleLabels: Record<Role, { title: string; icon: React.ReactNode }> = {
  growth: { title: 'Growth', icon: <TrendingUp className="w-4 h-4" /> },
  venture: { title: 'Venture Research', icon: <Telescope className="w-4 h-4" /> },
  cohort: { title: 'Cohort Applicant', icon: <Anchor className="w-4 h-4" /> },
}

// Mock leaderboard data with more descriptive names
const mockLeaderboard = [
  { name: 'Maya R. · Stanford \'27', doubloons: 245 },
  { name: 'Devon T. · MIT \'26', doubloons: 198 },
  { name: 'Priya K. · Y Combinator W26', doubloons: 156 },
  { name: 'Marco V. · Sequoia Scout', doubloons: 134 },
  { name: 'Jack S. · Wharton \'25', doubloons: 89 },
]

// Helper to get random last checked time
function getRandomLastChecked(): string {
  const hours = Math.floor(Math.random() * 5) + 1
  return `${hours}h ago`
}

// Helper to calculate profile completion
function calculateProfileCompletion(userData: UserData): number {
  let completion = 0
  // Base fields (60% total - 10% each)
  if (userData.firstName) completion += 10
  if (userData.lastName) completion += 10
  if (userData.email) completion += 10
  if (userData.phone) completion += 10
  if (userData.linkedIn) completion += 10
  if (userData.nationality || userData.residence) completion += 10
  // Bio (20%)
  if (userData.bio && userData.bio.trim().length > 0) completion += 20
  // School (10%)
  if (userData.school && userData.school.trim().length > 0) completion += 10
  // Photo (10%)
  if (userData.photoUrl && userData.photoUrl.trim().length > 0) completion += 10
  return completion
}

// Helper to get current week string
function getCurrentWeekString(): string {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const weekNum = Math.ceil((((now.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${weekNum}`
}

// Helper to check if date is today
function isToday(dateStr: string | undefined): boolean {
  if (!dateStr) return false
  const date = new Date(dateStr)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export function DashboardScreen({
  state,
  onAddRole,
  onNavigateToRole,
  onCompleteEngagementTask,
  onUpdateUser,
  onResetState,
  onEarnDoubloons,
}: DashboardScreenProps) {
  const { userData, selectedRoles, completedRoles, doubloons, doubloonHistory, growthPosts, venturePosts, engagementTasks, achievements, referralCode, referralCount, currentStreak } = state

  const [showDoubloonInfo, setShowDoubloonInfo] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [editFormData, setEditFormData] = useState<UserData>(userData)
  const [copiedReferral, setCopiedReferral] = useState(false)
  const [newsLastChecked, setNewsLastChecked] = useState<Record<string, string>>({})
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null)
  
  const validGrowthPosts = growthPosts.filter(p => p.trim()).length
  const validVenturePosts = venturePosts.filter(p => p.trim()).length
  
  const availableRoles = (['growth', 'venture', 'cohort'] as Role[]).filter(
    role => !selectedRoles.includes(role)
  )

  // Initialize news last checked times
  useEffect(() => {
    const times: Record<string, string> = {}
    newsSources.forEach(source => {
      times[source.name] = getRandomLastChecked()
    })
    setNewsLastChecked(times)
  }, [])

  // Calculate user's leaderboard position
  const leaderboardWithUser = useMemo(() => {
    return [...mockLeaderboard, { name: `${userData.firstName} ${userData.lastName.charAt(0)}.`, doubloons, isUser: true }]
      .sort((a, b) => b.doubloons - a.doubloons)
      .slice(0, 6)
  }, [userData.firstName, userData.lastName, doubloons])

  // Profile completion
  const profileCompletion = calculateProfileCompletion(userData)

  // Quest calculations
  const hasPostedToday = useMemo(() => {
    const allPosts = [...growthPosts, ...venturePosts]
    // Check if any post has content (we track via lastPostDate in state)
    return isToday(state.lastPostDate)
  }, [growthPosts, venturePosts, state.lastPostDate])

  const weeklyPostCount = useMemo(() => {
    // Count posts with content in current week
    return validGrowthPosts + validVenturePosts
  }, [validGrowthPosts, validVenturePosts])

  const weeklyQuota = selectedRoles.includes('growth') ? 3 : selectedRoles.includes('venture') ? 5 : 3
  const dailyQuestComplete = hasPostedToday
  const weeklyQuestComplete = weeklyPostCount >= weeklyQuota
  
  const dailyQuestClaimed = isToday(state.dailyQuestClaimedDate)
  const weeklyQuestClaimed = state.weeklyQuestClaimedWeek === getCurrentWeekString()

  const handleTaskComplete = (taskId: string, e: React.MouseEvent) => {
    const task = engagementTasks.find(t => t.id === taskId)
    if (!task || task.completed) return
    
    setCompletingTaskId(taskId)
    ding()
    
    // Get checkbox position for coin arc
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    
    setTimeout(() => {
      onCompleteEngagementTask(taskId, rect.left + rect.width / 2, rect.top + rect.height / 2)
      setCompletingTaskId(null)
    }, 300)
  }

  const handleSaveProfile = () => {
    onUpdateUser(editFormData)
    setShowEditProfile(false)
  }

  const handleCopyReferral = async () => {
    const link = `https://bounty.sh1p.co/?ref=${referralCode}`
    try {
      await navigator.clipboard.writeText(link)
      setCopiedReferral(true)
      setTimeout(() => setCopiedReferral(false), 2000)
    } catch {
      // Fallback
    }
  }

  const handleClaimDailyQuest = (e: React.MouseEvent) => {
    if (!dailyQuestComplete || dailyQuestClaimed) return
    onEarnDoubloons(5, 'Daily quest: Made a post', e.clientX, e.clientY)
  }

  const handleClaimWeeklyQuest = (e: React.MouseEvent) => {
    if (!weeklyQuestComplete || weeklyQuestClaimed) return
    onEarnDoubloons(20, 'Weekly quest: Hit post quota', e.clientX, e.clientY)
  }

  // Separate completed and pending tasks
  const pendingTasks = engagementTasks.filter(t => !t.completed)
  const completedTasks = engagementTasks.filter(t => t.completed)

  return (
    <div className="relative min-h-screen">
      <DepthScene intensity={0.5}>
        <div className="min-h-screen mesh-gradient-navy relative">
          <NauticalEnvironment timeOfDay="dusk" showShip={true} showLighthouse={false} showSeagulls={true} intensity={0.8} />
        
        {/* Header */}
      <header className="relative z-10 border-b border-border/30 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-2xl text-parchment">BOUNTY</h1>
            <span className="font-mono text-gold/60 text-sm">by SH1P</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Welcome + Streak Badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-serif text-2xl md:text-3xl text-parchment">
                Welcome back, {userData.firstName}
              </h2>
              <SoundButton
                onClick={() => {
                  setEditFormData(userData)
                  setShowEditProfile(true)
                }}
                className="p-1.5 text-parchment/50 hover:text-parchment/80 transition-colors"
                title="Edit profile"
              >
                <Pencil className="w-4 h-4" />
              </SoundButton>
              
              {/* Streak Badge */}
              {currentStreak > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-parchment/10 border border-orange-500/40 rounded-full">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="font-mono text-sm text-parchment">{currentStreak} day streak</span>
                  {currentStreak >= 3 && (
                    <span className="font-mono text-xs text-gold ml-1">1.5x bonus!</span>
                  )}
                </div>
              )}
            </div>
            
            {/* Profile Completion Meter */}
            <div className="mt-3 max-w-xs">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-parchment/60">Profile completion</span>
                <span className="font-mono text-xs text-gold">{profileCompletion}%</span>
              </div>
              <div className="h-2 bg-navy rounded-full overflow-hidden">
                <div 
                  className="h-full progress-gold transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
              {profileCompletion < 100 && (
                <button
                  onClick={() => {
                    setEditFormData(userData)
                    setShowEditProfile(true)
                  }}
                  className="font-mono text-xs text-seafoam hover:underline mt-1"
                >
                  Complete for +20 doubloons
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedRoles.map(role => (
                <span
                  key={role}
                  className="px-3 py-1 bg-gold/20 border border-gold/30 rounded-full 
                    font-mono text-xs text-gold flex items-center gap-1.5"
                >
                  {roleLabels[role].icon} {roleLabels[role].title}
                </span>
              ))}
            </div>
          </div>
          
          {/* Doubloon summary */}
          <div className="flex items-center gap-3 px-5 py-3 bg-card rounded-lg border border-gold/20">
            <svg width="32" height="32" viewBox="0 0 28 28" className="shrink-0">
              <defs>
                <radialGradient id="dashCoinGrad" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="#e5b84a" />
                  <stop offset="50%" stopColor="#c9922a" />
                  <stop offset="100%" stopColor="#8b6914" />
                </radialGradient>
              </defs>
              <circle cx="14" cy="14" r="13" fill="url(#dashCoinGrad)" stroke="#8b6914" strokeWidth="1" />
              <text x="14" y="18" textAnchor="middle" className="font-serif text-xs fill-navy font-bold">$</text>
            </svg>
            <div>
              <div className="font-mono text-2xl text-gold font-bold">{doubloons}</div>
              <div className="font-mono text-xs text-parchment/60">Doubloons</div>
            </div>
          </div>
        </div>

        {/* Daily & Weekly Quests */}
        <div className="bg-card rounded-lg border border-border/30 p-4 md:p-6 depth-card-hover">
          <h3 className="font-serif text-xl text-parchment mb-4">Active Quests</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Daily Quest */}
            <div className={`p-4 rounded-lg border ${dailyQuestComplete ? 'bg-seafoam/10 border-seafoam/30' : 'bg-secondary/50 border-border/30'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm text-parchment">Daily Quest</span>
                <span className="font-mono text-xs text-gold">+5</span>
              </div>
              <p className="font-mono text-xs text-parchment/70 mb-3">Make a post today</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-navy rounded-full overflow-hidden">
                  <div 
                    className="h-full progress-gold transition-all duration-500"
                    style={{ width: dailyQuestComplete ? '100%' : '0%' }}
                  />
                </div>
                <button
                  onClick={handleClaimDailyQuest}
                  disabled={!dailyQuestComplete || dailyQuestClaimed}
                  className={`px-3 py-1 font-mono text-xs rounded transition-all ${
                    dailyQuestClaimed 
                      ? 'bg-seafoam/20 text-seafoam cursor-default'
                      : dailyQuestComplete 
                        ? 'bg-gold text-navy hover:bg-rope cursor-pointer'
                        : 'bg-secondary text-parchment/50 cursor-not-allowed'
                  }`}
                >
                  {dailyQuestClaimed ? 'Claimed' : dailyQuestComplete ? 'Claim' : 'Incomplete'}
                </button>
              </div>
            </div>

            {/* Weekly Quest */}
            <div className={`p-4 rounded-lg border ${weeklyQuestComplete ? 'bg-seafoam/10 border-seafoam/30' : 'bg-secondary/50 border-border/30'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm text-parchment">Weekly Quest</span>
                <span className="font-mono text-xs text-gold">+20</span>
              </div>
              <p className="font-mono text-xs text-parchment/70 mb-3">Hit your post quota this week</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-navy rounded-full overflow-hidden">
                  <div 
                    className="h-full progress-gold transition-all duration-500"
                    style={{ width: `${Math.min((weeklyPostCount / weeklyQuota) * 100, 100)}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-parchment/60">{weeklyPostCount}/{weeklyQuota}</span>
                <button
                  onClick={handleClaimWeeklyQuest}
                  disabled={!weeklyQuestComplete || weeklyQuestClaimed}
                  className={`px-3 py-1 font-mono text-xs rounded transition-all ${
                    weeklyQuestClaimed 
                      ? 'bg-seafoam/20 text-seafoam cursor-default'
                      : weeklyQuestComplete 
                        ? 'bg-gold text-navy hover:bg-rope cursor-pointer'
                        : 'bg-secondary text-parchment/50 cursor-not-allowed'
                  }`}
                >
                  {weeklyQuestClaimed ? 'Claimed' : weeklyQuestComplete ? 'Claim' : 'Incomplete'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-card rounded-lg border border-border/30 p-4 md:p-6 depth-card-hover">
          <h3 className="font-serif text-xl text-parchment mb-4">Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {achievements.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} doubloons={doubloons} />
            ))}
          </div>
        </div>

        {/* Grid layout */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* My Roles */}
          <div className="bg-card rounded-lg border border-border/30 p-4 md:p-6 depth-card-hover">
            <h3 className="font-serif text-xl text-parchment mb-4">My Roles</h3>
            <div className="space-y-4">
              {selectedRoles.includes('growth') && (
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-parchment flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gold" /> Growth Team
                    </span>
                    <span className="font-mono text-xs text-gold">
                      {validGrowthPosts}/3 posts
                    </span>
                  </div>
                  <div className="h-2 bg-navy rounded-full overflow-hidden">
                    <div 
                      className="h-full progress-gold transition-all duration-500"
                      style={{ width: `${Math.min((validGrowthPosts / 3) * 100, 100)}%` }}
                    />
                  </div>
                  {completedRoles.includes('growth') && (
                    <p className="mt-2 font-mono text-xs text-seafoam">Onboarding complete</p>
                  )}
                </div>
              )}
              
              {selectedRoles.includes('venture') && (
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-parchment flex items-center gap-2">
                      <Telescope className="w-4 h-4 text-gold" /> Venture Research
                    </span>
                    <span className="font-mono text-xs text-gold">
                      {validVenturePosts}/5 posts
                    </span>
                  </div>
                  <div className="h-2 bg-navy rounded-full overflow-hidden">
                    <div 
                      className="h-full progress-gold transition-all duration-500"
                      style={{ width: `${Math.min((validVenturePosts / 5) * 100, 100)}%` }}
                    />
                  </div>
                  {completedRoles.includes('venture') && (
                    <p className="mt-2 font-mono text-xs text-seafoam">Onboarding complete</p>
                  )}
                </div>
              )}
              
              {selectedRoles.includes('cohort') && (
                <div className="p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-parchment flex items-center gap-2">
                      <Anchor className="w-4 h-4 text-gold" /> Cohort Applicant
                    </span>
                    <a 
                      href="https://sh1p.co/apply"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs text-seafoam hover:underline"
                    >
                      View application &rarr;
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Doubloon History */}
          <div className="bg-card rounded-lg border border-border/30 p-4 md:p-6 depth-card-hover">
            <h3 className="font-serif text-xl text-parchment mb-4">Doubloon History</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {doubloonHistory.length === 0 ? (
                <div className="parchment p-6 rounded-lg text-center noise relative">
                  <svg width="48" height="48" viewBox="0 0 28 28" className="mx-auto mb-3 opacity-60">
                    <defs>
                      <radialGradient id="emptyCoinGrad" cx="30%" cy="30%">
                        <stop offset="0%" stopColor="#e5b84a" />
                        <stop offset="50%" stopColor="#c9922a" />
                        <stop offset="100%" stopColor="#8b6914" />
                      </radialGradient>
                    </defs>
                    <circle cx="14" cy="14" r="13" fill="url(#emptyCoinGrad)" stroke="#8b6914" strokeWidth="1" />
                    <text x="14" y="18" textAnchor="middle" className="font-serif text-xs fill-navy font-bold">$</text>
                  </svg>
                  <p className="font-mono text-navy/80 text-sm">
                    Your treasure chest is empty.
                  </p>
                  <p className="font-mono text-navy/60 text-xs mt-1">
                    Make your first post to start earning.
                  </p>
                </div>
              ) : (
                doubloonHistory.slice().reverse().map(event => (
                  <div key={event.id} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                    <span className="font-mono text-sm text-parchment/80">{event.reason}</span>
                    <span className="font-mono text-sm text-gold">+{event.amount}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Engagement Inbox */}
          <div className="bg-card rounded-lg border border-border/30 p-4 md:p-6 depth-card-hover">
            <h3 className="font-serif text-xl text-parchment mb-4">Engagement Inbox</h3>
            <div className="space-y-3">
              {pendingTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg border transition-all bg-secondary/50 border-border/30 hover:border-gold/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-parchment/80">{task.title}</span>
                    <span className="font-mono text-xs text-gold">+{task.doubloonValue}</span>
                  </div>
                  <button
                    onClick={(e) => handleTaskComplete(task.id, e)}
                    className={`px-3 py-1 font-mono text-xs rounded transition-all bg-gold/20 text-gold hover:bg-gold/30 ${
                      completingTaskId === task.id ? 'animate-tick' : ''
                    }`}
                  >
                    Mark complete
                  </button>
                </div>
              ))}
              
              {/* Completed section */}
              {completedTasks.length > 0 && (
                <div className="pt-3 border-t border-border/20">
                  <p className="font-mono text-xs text-parchment/40 mb-2">Completed</p>
                  {completedTasks.map(task => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-seafoam/10 border border-seafoam/30 mb-2 last:mb-0"
                    >
                      <div className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-seafoam" />
                        <span className="font-mono text-sm text-parchment/60 line-through">{task.title}</span>
                      </div>
                      <span className="font-mono text-xs text-seafoam">+{task.doubloonValue}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-card rounded-lg border border-border/30 p-4 md:p-6 depth-card-hover">
            <h3 className="font-serif text-xl text-parchment mb-4">{"This Week's Top Crew"}</h3>
            <div className="space-y-2">
              {leaderboardWithUser.map((entry, index) => (
                <div
                  key={entry.name}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    'isUser' in entry && entry.isUser
                      ? 'bg-gold/10 border border-gold/30 shadow-lg shadow-gold/10'
                      : 'bg-secondary/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-sm ${index < 3 ? 'text-gold' : 'text-parchment/60'}`}>
                      #{index + 1}
                    </span>
                    <span className={`font-mono text-sm ${'isUser' in entry && entry.isUser ? 'text-gold font-bold' : 'text-parchment/80'}`}>
                      {entry.name} {'isUser' in entry && entry.isUser && '(You)'}
                    </span>
                  </div>
                  <span className="font-mono text-sm text-gold">{entry.doubloons}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recruit Crew (Referrals) */}
          <div className="bg-card rounded-lg border border-gold/20 p-4 md:p-6 depth-card-hover">
            <h3 className="font-serif text-xl text-parchment mb-4">Recruit Crew</h3>
            <p className="font-mono text-xs text-parchment/70 mb-4">
              +25 doubloons per crew member who joins
            </p>
            
            <div className="flex items-center gap-2 p-3 bg-secondary/50 rounded-lg border border-border/30 mb-3">
              <input
                type="text"
                readOnly
                value={`bounty.sh1p.co/?ref=${referralCode}`}
                className="flex-1 bg-transparent font-mono text-sm text-parchment/80 outline-none"
              />
              <SoundButton
                onClick={handleCopyReferral}
                className="p-2 text-gold hover:text-parchment transition-colors relative"
              >
                <Copy className="w-4 h-4" />
                {copiedReferral && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-seafoam text-navy font-mono text-xs rounded whitespace-nowrap">
                    Copied!
                  </span>
                )}
              </SoundButton>
            </div>
            
            <p className="font-mono text-xs text-parchment/60">
              {referralCount} recruited · {referralCount * 25} doubloons earned
            </p>
          </div>

          {/* Resources */}
          {(selectedRoles.includes('growth') || selectedRoles.includes('venture')) && (
            <div className="bg-card rounded-lg border border-border/30 p-4 md:p-6 depth-card-hover">
              <h3 className="font-serif text-xl text-parchment mb-4">Resources</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-mono text-sm text-gold mb-3">News Sources</h4>
                  <div className="space-y-2">
                    {newsSources.map(source => (
                      <a
                        key={source.name}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border border-border/30
                          hover:border-gold/30 hover:shadow-lg hover:shadow-gold/10 transition-all group"
                      >
                        <img 
                          src={`https://www.google.com/s2/favicons?domain=${source.domain}&sz=64`}
                          alt=""
                          className="w-5 h-5 rounded"
                        />
                        <div className="flex-1">
                          <span className="font-mono text-sm text-parchment group-hover:text-gold transition-colors">
                            {source.name}
                          </span>
                          <p className="font-mono text-xs text-parchment/50">
                            Last checked: {newsLastChecked[source.name] || '...'}
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-parchment/40 group-hover:text-gold transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
                <a
                  href="https://sh1p.co/graphics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 bg-gold/10 border border-gold/30 rounded-lg
                    font-mono text-sm text-gold hover:bg-gold/20 transition-colors text-center"
                >
                  Graphics Reservoir
                </a>
              </div>
            </div>
          )}

          {/* What are Doubloons? */}
          <div className="bg-card rounded-lg border border-border/30 p-4 md:p-6 depth-card-hover">
            <button
              onClick={() => setShowDoubloonInfo(!showDoubloonInfo)}
              className="w-full flex items-center justify-between"
            >
              <h3 className="font-serif text-xl text-parchment">What are Doubloons?</h3>
              {showDoubloonInfo ? (
                <ChevronUp className="w-5 h-5 text-parchment/60" />
              ) : (
                <ChevronDown className="w-5 h-5 text-parchment/60" />
              )}
            </button>
            
            {showDoubloonInfo && (
              <div className="mt-4 space-y-3">
                <p className="font-mono text-parchment/80 text-sm">
                  Doubloons are SH1P Crew currency. They unlock:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 font-mono text-sm text-parchment/70">
                    <span className="text-gold">·</span> Priority review for the next cohort
                  </li>
                  <li className="flex items-center gap-2 font-mono text-sm text-parchment/70">
                    <span className="text-gold">·</span> Invite-only events with founders & investors
                  </li>
                  <li className="flex items-center gap-2 font-mono text-sm text-parchment/70">
                    <span className="text-gold">·</span> SH1P merch drops (coming soon)
                  </li>
                  <li className="flex items-center gap-2 font-mono text-sm text-parchment/70">
                    <span className="text-gold">·</span> Bounty leaderboard ranking
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Add a Role */}
        {availableRoles.length > 0 && (
          <div className="bg-card rounded-lg border border-border/30 p-4 md:p-6 depth-card-hover">
            <h3 className="font-serif text-xl text-parchment mb-4">Add a Role</h3>
            <div className="flex flex-wrap gap-4">
              {availableRoles.map(role => (
                <SoundButton
                  key={role}
                  onClick={() => onAddRole(role)}
                  className="flex-1 min-w-[200px] p-4 border-2 border-rope/30 rounded-lg 
                    hover:border-gold transition-all duration-300 hover:scale-[1.02] text-left"
                >
                  <div className="text-gold mb-1">{roleLabels[role].icon}</div>
                  <h4 className="font-serif text-lg text-parchment">{roleLabels[role].title}</h4>
                </SoundButton>
              ))}
            </div>
          </div>
        )}

        {/* Cohort Application - always visible if not selected */}
        {!selectedRoles.includes('cohort') && (
          <div className="bg-card rounded-lg border border-gold/30 p-4 md:p-6 text-center depth-card-hover">
            <h3 className="font-serif text-xl text-parchment mb-2">Ready for the next level?</h3>
            <p className="font-mono text-parchment/70 text-sm mb-4">
              Apply to join the next SH1P cohort
            </p>
            <SoundButton
              onClick={() => onAddRole('cohort')}
              className="px-6 py-3 bg-gold text-navy font-mono font-bold rounded-lg
                hover:bg-rope transition-colors"
            >
              Apply Now
            </SoundButton>
          </div>
        )}

        {/* Reset button - hidden at bottom */}
        <div className="pt-8 border-t border-border/20 text-center">
          <button
            onClick={onResetState}
            className="font-mono text-xs text-parchment/30 hover:text-parchment/50 transition-colors"
          >
            Reset crew data
          </button>
        </div>
      </main>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-navy/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="parchment p-6 md:p-8 rounded-lg max-w-md w-full relative noise max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowEditProfile(false)}
              className="absolute top-4 right-4 text-navy/60 hover:text-navy"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="font-serif text-2xl text-navy mb-6">Edit Profile</h3>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block font-mono text-xs text-rope uppercase tracking-wider mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-4 py-2 bg-navy/5 border-2 border-rope/30 rounded-lg font-mono text-navy
                      focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-mono text-xs text-rope uppercase tracking-wider mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-4 py-2 bg-navy/5 border-2 border-rope/30 rounded-lg font-mono text-navy
                      focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block font-mono text-xs text-rope uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 bg-navy/5 border-2 border-rope/30 rounded-lg font-mono text-navy
                    focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              
              <div>
                <label className="block font-mono text-xs text-rope uppercase tracking-wider mb-1">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  value={editFormData.linkedIn}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, linkedIn: e.target.value }))}
                  className="w-full px-4 py-2 bg-navy/5 border-2 border-rope/30 rounded-lg font-mono text-navy
                    focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              
              <div>
                <label className="block font-mono text-xs text-rope uppercase tracking-wider mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 bg-navy/5 border-2 border-rope/30 rounded-lg font-mono text-navy
                    focus:outline-none focus:border-gold transition-colors"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-rope uppercase tracking-wider mb-1">
                  School / University
                </label>
                <input
                  type="text"
                  value={editFormData.school || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, school: e.target.value }))}
                  placeholder="e.g. Stanford '27"
                  className="w-full px-4 py-2 bg-navy/5 border-2 border-rope/30 rounded-lg font-mono text-navy
                    focus:outline-none focus:border-gold transition-colors placeholder:text-navy/30"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-rope uppercase tracking-wider mb-1">
                  Bio
                </label>
                <textarea
                  value={editFormData.bio || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  rows={3}
                  className="w-full px-4 py-2 bg-navy/5 border-2 border-rope/30 rounded-lg font-mono text-navy
                    focus:outline-none focus:border-gold transition-colors resize-none placeholder:text-navy/30"
                />
              </div>

              <div>
                <label className="block font-mono text-xs text-rope uppercase tracking-wider mb-1">
                  Photo URL
                </label>
                <input
                  type="url"
                  value={editFormData.photoUrl || ''}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, photoUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-navy/5 border-2 border-rope/30 rounded-lg font-mono text-navy
                    focus:outline-none focus:border-gold transition-colors placeholder:text-navy/30"
                />
              </div>
              
              <button
                onClick={handleSaveProfile}
                className="w-full px-6 py-3 bg-navy text-gold font-mono font-bold rounded-lg border-2 border-gold/30
                  transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-navy/90"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </DepthScene>
    </div>
  )
}

// Achievement Card Component
function AchievementCard({ achievement, doubloons }: { achievement: Achievement; doubloons: number }) {
  const isUnlocked = achievement.completed
  
  // Calculate progress for specific achievements
  let progress = 0
  let progressText = ''
  
  if (achievement.id === 'hundred_doubloons' && !isUnlocked) {
    progress = Math.min((doubloons / 100) * 100, 100)
    progressText = `${doubloons}/100`
  }

  return (
    <div 
      className={`p-4 rounded-lg border transition-all ${
        isUnlocked 
          ? 'card-gold-border bg-card' 
          : 'bg-secondary/30 border-border/30 grayscale'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{isUnlocked ? <Check className="w-6 h-6 text-seafoam" /> : <Lock className="w-5 h-5 text-parchment/40" />}</span>
        {isUnlocked && <span className="font-mono text-xs text-gold">+{achievement.doubloonReward}</span>}
      </div>
      <h4 className={`font-serif text-sm mb-1 ${isUnlocked ? 'text-parchment' : 'text-parchment/60'}`}>
        {achievement.title}
      </h4>
      <p className={`font-mono text-xs ${isUnlocked ? 'text-parchment/70' : 'text-parchment/40'}`}>
        {achievement.description}
      </p>
      
      {/* Progress bar for in-progress achievements */}
      {!isUnlocked && progressText && (
        <div className="mt-2">
          <div className="h-1.5 bg-navy rounded-full overflow-hidden">
            <div 
              className="h-full progress-gold transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="font-mono text-xs text-parchment/40 mt-1">{progressText}</p>
        </div>
      )}
    </div>
  )
}
