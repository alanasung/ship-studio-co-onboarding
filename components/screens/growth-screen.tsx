'use client'

import { useState, useRef } from 'react'
import { PirateScroll, NextButton, ScrollButton } from '@/components/pirate-scroll'
import { SoundButton } from '@/components/sound-button'
import { ding } from '@/lib/audio'

interface GrowthScreenProps {
  posts: string[]
  onUpdatePosts: (posts: string[]) => void
  onEarnDoubloons: (amount: number, reason: string, clickX?: number, clickY?: number) => void
  onComplete: () => void
  currentRoleIndex?: number
  totalRoles?: number
}

// LinkedIn post URL validation
const linkedInPostRegex = /^https?:\/\/(www\.)?linkedin\.com\/(posts|feed)\//

function isValidLinkedInPost(url: string): boolean {
  return linkedInPostRegex.test(url.trim())
}

export function GrowthScreen({ 
  posts, 
  onUpdatePosts, 
  onEarnDoubloons, 
  onComplete,
  currentRoleIndex,
  totalRoles
}: GrowthScreenProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [sceneIndex, setSceneIndex] = useState(0)
  const [screenshotFile, setScreenshotFile] = useState('')
  const [postErrors, setPostErrors] = useState<Record<number, string>>({})
  const verifyButtonRef = useRef<HTMLButtonElement>(null)

  const validPosts = posts.filter(p => p.trim().length > 0 && isValidLinkedInPost(p))
  const filledPosts = posts.filter(p => p.trim().length > 0)
  const potentialDoubloons = Math.max(filledPosts.length, 3) * 5

  const handleVerify = async (e: React.MouseEvent) => {
    // Validate all filled posts
    const errors: Record<number, string> = {}
    posts.forEach((post, index) => {
      const trimmed = post.trim()
      if (trimmed.length > 0 && !isValidLinkedInPost(trimmed)) {
        errors[index] = 'Must be a valid LinkedIn post URL'
      }
    })

    if (Object.keys(errors).length > 0) {
      setPostErrors(errors)
      return
    }

    if (validPosts.length < 3) return
    
    setIsVerifying(true)
    const buttonRect = verifyButtonRef.current?.getBoundingClientRect()
    const clickX = buttonRect ? buttonRect.left + buttonRect.width / 2 : e.clientX
    const clickY = buttonRect ? buttonRect.top + buttonRect.height / 2 : e.clientY
    
    // Mock verification delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsVerifying(false)
    setVerified(true)
    
    // Award doubloons with flying coin animation
    const earnPerPost = 5
    const totalEarned = validPosts.length * earnPerPost
    
    for (let i = 0; i < validPosts.length; i++) {
      setTimeout(() => {
        ding()
        onEarnDoubloons(earnPerPost, `Growth post #${i + 1}`, clickX, clickY)
      }, i * 500)
    }
  }

  const updatePost = (index: number, value: string) => {
    const newPosts = [...posts]
    newPosts[index] = value
    onUpdatePosts(newPosts)
    
    // Clear error when typing
    if (postErrors[index]) {
      setPostErrors(prev => {
        const updated = { ...prev }
        delete updated[index]
        return updated
      })
    }
  }

  const addPostField = () => {
    if (posts.length < 5) {
      onUpdatePosts([...posts, ''])
    }
  }

  // Acceptance post URL with proper encoding
  const acceptanceText = encodeURIComponent("I just joined the SH1P Crew! 🚀")
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=https://sh1p.co&summary=${acceptanceText}`

  const scenes = [
    // Scene 1: The Mission
    <div key="mission" className="space-y-6">
      <h2 className="font-serif text-2xl md:text-3xl text-navy">The Mission</h2>
      <p className="font-mono text-navy/80 leading-relaxed text-sm md:text-base">
        To be part of the SH1P Growth Team, post <strong>3 out of 5 weekdays per week</strong> on your LinkedIn.
      </p>
      <p className="font-mono text-navy/80 leading-relaxed text-sm md:text-base">
        Talk about SH1P events, launches, products, the crew — <strong>represent the brand</strong>.
      </p>
      <NextButton onClick={() => setSceneIndex(1)}>Accept Mission</NextButton>
    </div>,

    // Scene 2: Submit Posts
    <div key="posts" className="space-y-6">
      <h2 className="font-serif text-2xl md:text-3xl text-navy">Submit Your Posts</h2>
      <p className="font-mono text-navy/80 text-sm">
        Drop your post URLs below. You need at least 3 to unlock your spot.
      </p>
      
      {/* Doubloon value preview */}
      <div className="flex items-center gap-2 text-gold font-mono text-sm">
        <span>Earn up to +{potentialDoubloons} doubloons</span>
      </div>
      
      <div className="space-y-3">
        {posts.map((post, index) => (
          <div key={index}>
            <input
              type="url"
              value={post}
              onChange={(e) => updatePost(index, e.target.value)}
              placeholder={`LinkedIn post URL #${index + 1}`}
              className={`w-full px-4 py-3 bg-navy/5 border-2 rounded-lg font-mono text-navy text-sm
                focus:outline-none focus:border-gold transition-colors placeholder:text-navy/40
                ${postErrors[index] ? 'border-red-500' : 'border-rope/30'}`}
            />
            {postErrors[index] && (
              <p className="text-red-600 text-xs mt-1 font-mono">{postErrors[index]}</p>
            )}
          </div>
        ))}
        
        {posts.length < 5 && (
          <button 
            onClick={addPostField}
            className="w-full px-4 py-2 border-2 border-dashed border-rope/30 rounded-lg
              font-mono text-navy/50 text-sm hover:border-rope/60 transition-colors"
          >
            + Add another post
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        <SoundButton
          ref={verifyButtonRef}
          onClick={handleVerify} 
          disabled={filledPosts.length < 3 || isVerifying || verified}
          className={`px-6 py-3 font-mono font-bold rounded-lg border-2 transition-all duration-300
            ${filledPosts.length >= 3 && !isVerifying && !verified
              ? 'bg-navy text-gold border-gold/30 hover:bg-navy/90 hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-navy/50 text-gold/50 border-gold/10 cursor-not-allowed'
            }`}
        >
          {isVerifying ? 'Verifying...' : verified ? 'Verified!' : 'Verify Posts'}
        </SoundButton>
        
        {verified && <span className="font-mono text-seafoam">+{validPosts.length * 5} Doubloons!</span>}
      </div>

      {verified && (
        <NextButton onClick={() => setSceneIndex(2)}>Continue</NextButton>
      )}
    </div>,

    // Scene 3: You're In
    <div key="success" className="space-y-6 text-center">
      <div className="text-6xl mb-4">
        <svg className="w-16 h-16 mx-auto text-gold" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </div>
      <h2 className="font-serif text-2xl md:text-3xl text-navy">{"You're In!"}</h2>
      <p className="font-mono text-navy/80">
        {"Congrats — you're part of the SH1P Growth Team."}
      </p>
      
      <div className="flex flex-col gap-3 mt-8">
        <a
          href={linkedInShareUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-navy text-gold font-mono font-bold rounded-lg border-2 border-gold/30
            transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-navy/90 inline-block"
        >
          Make your acceptance post &rarr;
        </a>
        <a
          href="https://sh1p.co/graphics"
          target="_blank"
          rel="noopener noreferrer"
          className="px-6 py-3 bg-transparent text-navy font-mono font-bold rounded-lg border-2 border-navy/30
            transition-all duration-300 hover:border-navy/60 inline-block"
        >
          Grab graphics
        </a>
      </div>
      
      <NextButton onClick={() => setSceneIndex(3)}>Continue</NextButton>
    </div>,

    // Scene 4: Ongoing Engagement (final scene - completes onboarding)
    <div key="engagement" className="space-y-6">
      <h2 className="font-serif text-2xl md:text-3xl text-navy">Ongoing Engagement</h2>
      <p className="font-mono text-navy/80 text-sm leading-relaxed">
        {"Any time SH1P drops a massive event, launch, or product release — you'll get a link in your inbox."}
      </p>
      <p className="font-mono text-navy/80 text-sm leading-relaxed">
        Your job: <strong>Like. Comment. Repost. Save.</strong>
      </p>
      <p className="font-mono text-gold text-sm">
        Each action = 1 Doubloon. Max 4 per post.
      </p>

      <div className="mt-6">
        <label className="block font-mono text-xs text-rope uppercase tracking-wider mb-2">
          Submit screenshot verification
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setScreenshotFile(e.target.files?.[0]?.name || '')}
          className="w-full px-4 py-3 bg-navy/5 border-2 border-rope/30 rounded-lg font-mono text-navy text-sm
            file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-navy file:text-gold file:font-mono"
        />
        {screenshotFile && (
          <p className="mt-2 font-mono text-seafoam text-xs">Uploaded: {screenshotFile}</p>
        )}
      </div>

      <ScrollButton onClick={onComplete} variant="primary">
        {totalRoles && currentRoleIndex && currentRoleIndex < totalRoles 
          ? 'Continue to Next Role' 
          : 'Go to Dashboard'} &rarr;
      </ScrollButton>
    </div>,
  ]

  return (
    <PirateScroll 
      scenes={[scenes[sceneIndex]]} 
      onBack={sceneIndex > 0 ? () => setSceneIndex(sceneIndex - 1) : undefined}
      currentRoleIndex={currentRoleIndex}
      totalRoles={totalRoles}
      roleName="GROWTH"
    />
  )
}
