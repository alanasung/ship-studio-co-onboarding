export type Screen = 
  | 'intro'
  | 'wheel'
  | 'signup'
  | 'roleSelect'
  | 'growth'
  | 'venture'
  | 'cohort'
  | 'dashboard'

export type Role = 'growth' | 'venture' | 'cohort'

export interface UserData {
  firstName: string
  lastName: string
  linkedIn: string
  email: string
  phone: string
  nationality: string
  residence: string
  bio?: string
  school?: string
  photoUrl?: string
}

export interface DoubloonEvent {
  id: string
  amount: number
  reason: string
  timestamp: Date
}

export interface EngagementTask {
  id: string
  title: string
  doubloonValue: number
  completed: boolean
}

export type AchievementId = 'first_post' | 'two_teams' | 'hundred_doubloons' | 'week_streak'

export interface Achievement {
  id: AchievementId
  title: string
  description: string
  doubloonReward: number
  completed: boolean
}

export interface AppState {
  screen: Screen
  userData: UserData
  selectedRoles: Role[]
  completedRoles: Role[]
  doubloons: number
  doubloonHistory: DoubloonEvent[]
  growthPosts: string[]
  venturePosts: string[]
  engagementScreenshots: string[]
  cohortApplied: boolean
  engagementTasks: EngagementTask[]
  achievements: Achievement[]
  referralCode: string
  referralCount: number
  currentStreak: number
  lastPostDate?: string
  dailyQuestClaimedDate?: string
  weeklyQuestClaimedWeek?: string
  profileCompletionRewarded?: boolean
}

export const initialUserData: UserData = {
  firstName: '',
  lastName: '',
  linkedIn: '',
  email: '',
  phone: '',
  nationality: '',
  residence: '',
}

export const initialEngagementTasks: EngagementTask[] = [
  { id: '1', title: "Like Krishna's launch post", doubloonValue: 1, completed: false },
  { id: '2', title: 'Repost SH1P Cohort 4 announcement', doubloonValue: 1, completed: false },
  { id: '3', title: 'Comment on the Bounty teaser', doubloonValue: 1, completed: false },
]

export const initialAchievements: Achievement[] = [
  { 
    id: 'first_post', 
    title: 'First Mate', 
    description: 'Complete your first post draft', 
    doubloonReward: 5, 
    completed: false 
  },
  { 
    id: 'two_teams', 
    title: 'Jack of All Trades', 
    description: 'Join two or more teams', 
    doubloonReward: 10, 
    completed: false 
  },
  { 
    id: 'hundred_doubloons', 
    title: 'Treasure Hunter', 
    description: 'Earn 100 doubloons', 
    doubloonReward: 25, 
    completed: false 
  },
  { 
    id: 'week_streak', 
    title: 'Consistent Sailor', 
    description: 'Post for 7 days in a row', 
    doubloonReward: 50, 
    completed: false 
  },
]

export const initialAppState: AppState = {
  screen: 'intro',
  userData: initialUserData,
  selectedRoles: [],
  completedRoles: [],
  doubloons: 0,
  doubloonHistory: [],
  growthPosts: ['', '', ''],
  venturePosts: ['', '', '', '', ''],
  engagementScreenshots: [],
  cohortApplied: false,
  engagementTasks: initialEngagementTasks,
  achievements: initialAchievements,
  referralCode: '',
  referralCount: 0,
  currentStreak: 0,
  lastPostDate: undefined,
  dailyQuestClaimedDate: undefined,
  weeklyQuestClaimedWeek: undefined,
  profileCompletionRewarded: false,
}

// Helper function to create a referral code from user data
export function createReferralCode(userData: UserData): string {
  const base = `${userData.firstName.toLowerCase().slice(0, 4)}${userData.lastName.toLowerCase().slice(0, 2)}`
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `SH1P-${base.toUpperCase()}-${random}`
}

// Helper function to check and update streak
export function checkStreak(
  lastPostDate: string | undefined, 
  currentStreak: number
): { newStreak: number; isStreakActive: boolean } {
  if (!lastPostDate) {
    return { newStreak: 1, isStreakActive: false }
  }

  const lastDate = new Date(lastPostDate)
  const now = new Date()
  const diffTime = now.getTime() - lastDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    // Same day, no streak change
    return { newStreak: currentStreak, isStreakActive: currentStreak >= 3 }
  } else if (diffDays === 1) {
    // Consecutive day, increment streak
    return { newStreak: currentStreak + 1, isStreakActive: currentStreak >= 2 }
  } else {
    // Streak broken, reset to 1
    return { newStreak: 1, isStreakActive: false }
  }
}
