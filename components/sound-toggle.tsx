'use client'

import { useState, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { isSoundEnabled, toggleSound } from '@/lib/sounds'

export function SoundToggle() {
  const [enabled, setEnabled] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setEnabled(isSoundEnabled())
  }, [])

  const handleToggle = () => {
    const newState = toggleSound()
    setEnabled(newState)
  }

  if (!mounted) return null

  return (
    <button
      onClick={handleToggle}
      className="fixed top-4 right-20 z-50 p-2 bg-navy/80 backdrop-blur-sm border border-gold/30 
        rounded-full hover:border-gold/60 transition-colors group"
      title={enabled ? 'Mute sounds' : 'Enable sounds'}
    >
      {enabled ? (
        <Volume2 className="w-4 h-4 text-gold group-hover:text-parchment transition-colors" />
      ) : (
        <VolumeX className="w-4 h-4 text-parchment/50 group-hover:text-parchment transition-colors" />
      )}
    </button>
  )
}
