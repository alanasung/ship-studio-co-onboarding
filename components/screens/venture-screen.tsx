'use client'

import { useState, useRef } from 'react'
import { PirateScroll, NextButton, ScrollButton } from '@/components/pirate-scroll'
import { ding } from '@/lib/audio'
import { SoundButton } from '@/components/sound-button'

interface VentureScreenProps {
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

export function VentureScreen({ 
  posts, 
  onUpdatePosts, 
  onEarnDoubloons, 
  onComplete,
  currentRoleIndex,
  totalRoles
}: VentureScreenProps) {
  const [isVerifying, setIsVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [sceneIndex, setSceneIndex] = useState(0)
  const [screenshotFile, setScreenshotFile] = useState('')
  const [showHelper, setShowHelper] = useState(false)
  const [postErrors, setPostErrors] = useState<Record<number, string>>({})
  const verifyButtonRef = useRef<HTMLButtonElement>(null)

  const validPosts = posts.filter(p => p.trim().length > 0 && isValidLinkedInPost(p))
  const filledPosts = posts.filter(p => p.trim().length > 0)
  const potentialDoubloons = Math.max(filledPosts.length, 5) * 5
  
  // Venture requires 5 posts minimum
  const MIN_POSTS = 5

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

    if (validPosts.length < MIN_POSTS) return
    
    setIsVerifying(true)
    const buttonRect = verifyButtonRef.current?.getBoundingClientRect()
    const clickX = buttonRect ? buttonRect.left + buttonRect.width / 2 : e.clientX
    const clickY = buttonRect ? buttonRect.top + buttonRect.height / 2 : e.clientY
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsVerifying(false)
    setVerified(true)
    
    const earnPerPost = 5
    for (let i = 0; i < validPosts.length; i++) {
      setTimeout(() => {
        ding()
        onEarnDoubloons(earnPerPost, `Venture post #${i + 1}`, clickX, clickY)
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

  // Acceptance post URL with proper encoding
  const acceptanceText = encodeURIComponent("I just joined SH1P Venture Research! 🔭")
  const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=https://sh1p.co&summary=${acceptanceText}`

  const scenes = [
    // Scene 1: The Mission
    <div key="mission" className="space-y-6">
      <h2 className="font-serif text-2xl md:text-3xl text-navy">The Mission</h2>
      <p className="font-mono text-navy/80 leading-relaxed text-sm md:text-base">
        {"Venture Research is different from Growth. You're not just amplifying SH1P — you're bringing your own POV."}
      </p>
      <p className="font-mono text-navy/80 leading-relaxed text-sm md:text-base">
        Post <strong>original insights 5 days a week</strong> on LinkedIn.
      </p>
      <NextButton onClick={() => setSceneIndex(1)}>Accept Mission</NextButton>
    </div>,

    // Scene 2: How to Research
    <div key="research" className="space-y-6">
      <h2 className="font-serif text-2xl md:text-3xl text-navy">How to Research</h2>
      <p className="font-mono text-navy/80 text-sm leading-relaxed">
        Before you post: go to one of the sources in your dashboard (TechCrunch, Crunchbase, etc.). Find something dated within the <strong>last 24 hours</strong>.
      </p>
      <p className="font-mono text-navy/80 text-sm leading-relaxed">
        A funding round, product launch, or breakthrough in tech or research you believe will be <strong>globally influential</strong>.
      </p>
      <div className="p-4 bg-navy/10 rounded-lg border border-rope/30">
        <p className="font-mono text-navy/80 text-sm">
          <strong>Important:</strong> Stay away from politics, geopolitics, and current conflicts. {"You're representing a brand — no sides on divisive issues."}
        </p>
      </div>
      
      <button
        onClick={() => setShowHelper(true)}
        className="font-mono text-seafoam text-sm underline hover:no-underline"
      >
        Questions? Ask SH1P Helper
      </button>

      {/* SH1P Helper Modal */}
      {showHelper && (
        <div className="fixed inset-0 bg-navy/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="parchment p-8 rounded-lg max-w-md w-full text-center relative noise">
            <button
              onClick={() => setShowHelper(false)}
              className="absolute top-4 right-4 text-navy/60 hover:text-navy"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h3 className="font-serif text-2xl text-navy mb-4">SH1P Helper</h3>
            <p className="font-mono text-navy/80 text-sm mb-6">
              SH1P Helper is coming soon! In the meantime, reach out to the team directly.
            </p>
            <a
              href="mailto:ecosystem@sh1p.co"
              className="inline-block px-6 py-3 bg-navy text-gold font-mono font-bold rounded-lg border-2 border-gold/30
                transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-navy/90"
            >
              Email ecosystem@sh1p.co
            </a>
          </div>
        </div>
      )}

      <NextButton onClick={() => setSceneIndex(2)}>Continue</NextButton>
    </div>,

    // Scene 3: Submit Posts
    <div key="posts" className="space-y-6">
      <h2 className="font-serif text-2xl md:text-3xl text-navy">Submit Your Posts</h2>
      <p className="font-mono text-navy/80 text-sm">
        Drop your post URLs below. You need at least {MIN_POSTS} to unlock your spot.
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
      </div>

      <div className="flex items-center gap-4">
        <SoundButton
          ref={verifyButtonRef}
          onClick={handleVerify}
          disabled={filledPosts.length < MIN_POSTS || isVerifying || verified}
          className={`px-6 py-3 font-mono font-bold rounded-lg border-2 transition-all duration-300
            ${filledPosts.length >= MIN_POSTS && !isVerifying && !verified
              ? 'bg-navy text-gold border-gold/30 hover:bg-navy/90 hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-navy/50 text-gold/50 border-gold/10 cursor-not-allowed'
            }`}
        >
          {isVerifying ? 'Verifying...' : verified ? 'Verified!' : 'Verify Posts'}
        </SoundButton>
        
        {verified && <span className="font-mono text-seafoam">+{validPosts.length * 5} Doubloons!</span>}
      </div>

      {verified && (
        <NextButton onClick={() => setSceneIndex(3)}>Continue</NextButton>
      )}
    </div>,

    // Scene 4: You're In (final scene - completes onboarding)
    <div key="success" className="space-y-6 text-center">
      <div className="text-6xl mb-4">
        <svg className="w-16 h-16 mx-auto text-gold" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
      </div>
      <h2 className="font-serif text-2xl md:text-3xl text-navy">{"You're In!"}</h2>
      <p className="font-mono text-navy/80">
        {"Congrats — you're part of the SH1P Venture Research Team."}
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
      roleName="VENTURE RESEARCH"
    />
  )
}
