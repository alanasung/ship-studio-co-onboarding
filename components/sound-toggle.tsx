'use client'

import { useState, useEffect } from 'react'
import { Volume2, VolumeX, ChevronDown } from 'lucide-react'
import { 
  isSoundEnabled, 
  toggleSound, 
  isEffectsEnabled, 
  setEffectsEnabled,
  isAmbientEnabled,
  setAmbientEnabled
} from '@/lib/sounds'

export function SoundToggle() {
  const [enabled, setEnabled] = useState(true)
  const [effectsOn, setEffectsOn] = useState(true)
  const [ambientOn, setAmbientOn] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    setMounted(true)
    setEnabled(isSoundEnabled())
    setEffectsOn(isEffectsEnabled())
    setAmbientOn(isAmbientEnabled())
  }, [])

  const handleToggle = () => {
    const newState = toggleSound()
    setEnabled(newState)
  }

  const handleEffectsToggle = () => {
    const newState = !effectsOn
    setEffectsOn(newState)
    setEffectsEnabled(newState)
  }

  const handleAmbientToggle = () => {
    const newState = !ambientOn
    setAmbientOn(newState)
    setAmbientEnabled(newState)
  }

  if (!mounted) return null

  return (
    <div className="fixed top-4 right-20 z-50">
      <div className="relative">
        {/* Main toggle button */}
        <button
          onClick={handleToggle}
          onContextMenu={(e) => {
            e.preventDefault()
            setExpanded(!expanded)
          }}
          className="p-2 bg-navy/80 backdrop-blur-sm border border-gold/30 
            rounded-full hover:border-gold/60 transition-colors group flex items-center gap-1"
          title={enabled ? 'Mute sounds (right-click for options)' : 'Enable sounds'}
        >
          {enabled ? (
            <Volume2 className="w-4 h-4 text-gold group-hover:text-parchment transition-colors" />
          ) : (
            <VolumeX className="w-4 h-4 text-parchment/50 group-hover:text-parchment transition-colors" />
          )}
          <ChevronDown 
            className={`w-3 h-3 text-parchment/50 transition-transform ${expanded ? 'rotate-180' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
          />
        </button>

        {/* Expanded panel */}
        {expanded && (
          <div className="absolute top-full right-0 mt-2 bg-navy/95 backdrop-blur-sm border border-gold/30 rounded-lg p-3 min-w-[140px] shadow-xl">
            <div className="space-y-2">
              {/* Master toggle */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-mono text-xs text-parchment/80">Master</span>
                <button
                  onClick={handleToggle}
                  className={`w-8 h-4 rounded-full transition-colors ${enabled ? 'bg-gold' : 'bg-parchment/20'}`}
                >
                  <div 
                    className={`w-3 h-3 rounded-full bg-navy transition-transform ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`}
                  />
                </button>
              </label>

              {/* Effects toggle */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-mono text-xs text-parchment/80">Effects</span>
                <button
                  onClick={handleEffectsToggle}
                  disabled={!enabled}
                  className={`w-8 h-4 rounded-full transition-colors ${effectsOn && enabled ? 'bg-seafoam' : 'bg-parchment/20'} ${!enabled ? 'opacity-50' : ''}`}
                >
                  <div 
                    className={`w-3 h-3 rounded-full bg-navy transition-transform ${effectsOn && enabled ? 'translate-x-4' : 'translate-x-0.5'}`}
                  />
                </button>
              </label>

              {/* Ambient toggle */}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-mono text-xs text-parchment/80">Ambient</span>
                <button
                  onClick={handleAmbientToggle}
                  disabled={!enabled}
                  className={`w-8 h-4 rounded-full transition-colors ${ambientOn && enabled ? 'bg-seafoam' : 'bg-parchment/20'} ${!enabled ? 'opacity-50' : ''}`}
                >
                  <div 
                    className={`w-3 h-3 rounded-full bg-navy transition-transform ${ambientOn && enabled ? 'translate-x-4' : 'translate-x-0.5'}`}
                  />
                </button>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
