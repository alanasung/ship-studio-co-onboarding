'use client'

import { useState, useRef } from 'react'
import type { Role, DoubloonEvent, UserData, EngagementTask } from '@/lib/types'
import { TrendingUp, Telescope, Anchor, ChevronDown, ChevronUp, Pencil, X } from 'lucide-react'
import { ding } from '@/lib/audio'

interface DashboardScreenProps {
  userData: UserData
  selectedRoles: Role[]
  completedRoles: Role[]
  doubloons: number
  doubloonHistory: DoubloonEvent[]
  growthPosts: string[]
  venturePosts: string[]
  engagementTasks: EngagementTask[]
  onAddRole: (role: Role) => void
  onNavigateToRole: (role: Role) => void
  onCompleteEngagementTask: (taskId: string) => void
  onUpdateUser: (userData: UserData) => void
  onResetState: () => void
  onEarnDoubloons: (amount: number, reason: string, clickX?: number, clickY?: number) => void
}

const newsSources = [
  { name: 'TechCrunch', url: 'https://techcrunch.com' },
  { name: 'Crunchbase', url: 'https://news.crunchbase.com' },
  { name: 'Product Hunt', url: 'https://producthunt.com' },
  { name: 'The Information', url: 'https://theinformation.com' },
]

const roleLabels: Record<Role, { title: string; icon: React.ReactNode }> = {
  growth: { title: 'Growth', icon: <TrendingUp className="w-4 h-4" /> },
  venture: { title: 'Venture Research', icon: <Telescope className="w-4 h-4" /> },
  cohort: { title: 'Cohort Applicant', icon: <Anchor className="w-4 h-4" /> },
}

// Mock leaderboard data
const mockLeaderboard = [
  { name: 'Jack S.', doubloons: 245 },
  { name: 'Maya R.', doubloons: 198 },
  { name: 'Devon T.', doubloons: 156 },
  { name: 'Priya K.', doubloons: 134 },
  { name: 'Marco V.', doubloons: 89 },
]

export function DashboardScreen({
  userData,
  selectedRoles,
  completedRoles,
  doubloons,
  doubloonHistory,
  growthPosts,
  venturePosts,
  engagementTasks,
  onAddRole,
  onNavigateToRole,
  onCompleteEngagementTask,
  onUpdateUser,
  onResetState,
  onEarnDoubloons,
}: DashboardScreenProps) {
  const [showDoubloonInfo, setShowDoubloonInfo] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [editFormData, setEditFormData] = useState<UserData>(userData)
  
  const validGrowthPosts = growthPosts.filter(p => p.trim()).length
  const validVenturePosts = venturePosts.filter(p => p.trim()).length
  
  const availableRoles = (['growth', 'venture', 'cohort'] as Role[]).filter(
    role => !selectedRoles.includes(role)
  )

  // Calculate user's leaderboard position
  const leaderboardWithUser = [...mockLeaderboard, { name: `${userData.firstName} ${userData.lastName.charAt(0)}.`, doubloons, isUser: true }]
    .sort((a, b) => b.doubloons - a.doubloons)
    .slice(0, 6)

  const handleTaskComplete = (taskId: string, e: React.MouseEvent) => {
    const task = engagementTasks.find(t => t.id === taskId)
    if (!task || task.completed) return
    
    ding()
    onCompleteEngagementTask(taskId)
  }

  const handleSaveProfile = () => {
    onUpdateUser(editFormData)
    setShowEditProfile(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy via-[#0d1e33] to-navy">
      {/* Header */}
      <header className="border-b border-border/30 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="font-serif text-2xl text-parchment">BOUNTY</h1>
            <span className="font-mono text-gold/60 text-sm">by SH1P</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
        {/* Welcome */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-serif text-2xl md:text-3xl text-parchment">
                Welcome back, {userData.firstName}
              </h2>
              <button
                onClick={() => {
                  setEditFormData(userData)
                  setShowEditProfile(true)
                }}
                className="p-1.5 text-parchment/50 hover:text-parchment/80 transition-colors"
                title="Edit profile"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
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

        {/* Grid layout */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          {/* My Roles */}
          <div className="bg-card rounded-lg border border-border/30 p-4 md:p-6">
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
          <div className="bg-card rounded-lg border border-border/30 p-4 md:p-6">
            <h3 className="font-serif text-xl text-parchment mb-4">Doubloon History</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {doubloonHistory.length === 0 ? (
                <p className="font-mono text-parchment/50 text-sm">No earnings yet</p>
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
          <div className="bg-card rounded-lg border border-border/30 p-4 md:p-6">
            <h3 className="font-serif text-xl text-parchment mb-4">Engagement Inbox</h3>
            <div className="space-y-3">
              {engagementTasks.map(task => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    task.completed 
                      ? 'bg-seafoam/10 border-seafoam/30' 
                      : 'bg-secondary/50 border-border/30 hover:border-gold/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-parchment/80">{task.title}</span>
                    <span className="font-mono text-xs text-gold">+{task.doubloonValue}</span>
                  </div>
                  <button
                    onClick={(e) => handleTaskComplete(task.id, e)}
                    disabled={task.completed}
                    className={`px-3 py-1 font-mono text-xs rounded transition-all ${
                      task.completed 
                        ? 'bg-seafoam/20 text-seafoam cursor-default' 
                        : 'bg-gold/20 text-gold hover:bg-gold/30'
                    }`}
                  >
                    {task.completed ? 'Done' : 'Mark complete'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-card rounded-lg border border-border/30 p-4 md:p-6">
            <h3 className="font-serif text-xl text-parchment mb-4">{"This Week's Top Crew"}</h3>
            <div className="space-y-2">
              {leaderboardWithUser.map((entry, index) => (
                <div
                  key={entry.name}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    'isUser' in entry && entry.isUser
                      ? 'bg-gold/10 border border-gold/30'
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

          {/* Resources */}
          {(selectedRoles.includes('growth') || selectedRoles.includes('venture')) && (
            <div className="bg-card rounded-lg border border-border/30 p-4 md:p-6">
              <h3 className="font-serif text-xl text-parchment mb-4">Resources</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-mono text-sm text-gold mb-2">News Sources</h4>
                  <div className="flex flex-wrap gap-2">
                    {newsSources.map(source => (
                      <a
                        key={source.name}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-secondary rounded-lg font-mono text-xs text-parchment
                          hover:bg-secondary/80 transition-colors border border-border/30"
                      >
                        {source.name}
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
          <div className="bg-card rounded-lg border border-border/30 p-4 md:p-6">
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
          <div className="bg-card rounded-lg border border-border/30 p-4 md:p-6">
            <h3 className="font-serif text-xl text-parchment mb-4">Add a Role</h3>
            <div className="flex flex-wrap gap-4">
              {availableRoles.map(role => (
                <button
                  key={role}
                  onClick={() => onAddRole(role)}
                  className="flex-1 min-w-[200px] p-4 border-2 border-rope/30 rounded-lg 
                    hover:border-gold transition-all duration-300 hover:scale-[1.02] text-left"
                >
                  <div className="text-gold mb-1">{roleLabels[role].icon}</div>
                  <h4 className="font-serif text-lg text-parchment">{roleLabels[role].title}</h4>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cohort Application - always visible if not selected */}
        {!selectedRoles.includes('cohort') && (
          <div className="bg-card rounded-lg border border-gold/30 p-4 md:p-6 text-center">
            <h3 className="font-serif text-xl text-parchment mb-2">Ready for the next level?</h3>
            <p className="font-mono text-parchment/70 text-sm mb-4">
              Apply to join the next SH1P cohort
            </p>
            <button
              onClick={() => onAddRole('cohort')}
              className="px-6 py-3 bg-gold text-navy font-mono font-bold rounded-lg
                hover:bg-rope transition-colors"
            >
              Apply Now
            </button>
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
          <div className="parchment p-6 md:p-8 rounded-lg max-w-md w-full relative noise">
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
  )
}
