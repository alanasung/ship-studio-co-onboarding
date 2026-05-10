'use client'

// Sound system with Web Audio API
// All sounds respect the global sound toggle stored in localStorage

let audioContext: AudioContext | null = null
let soundEnabled = true
let effectsEnabled = true
let ambientEnabled = true
let ambientSource: AudioBufferSourceNode | null = null
let ambientGain: GainNode | null = null

// Initialize sound state from localStorage
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('bounty_sound_enabled')
  soundEnabled = stored !== 'false'
  
  const effectsStored = localStorage.getItem('bounty_effects_enabled')
  effectsEnabled = effectsStored !== 'false'
  
  const ambientStored = localStorage.getItem('bounty_ambient_enabled')
  ambientEnabled = ambientStored !== 'false'
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return audioContext
}

export function isSoundEnabled(): boolean {
  return soundEnabled
}

export function isEffectsEnabled(): boolean {
  return effectsEnabled
}

export function isAmbientEnabled(): boolean {
  return ambientEnabled
}

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled
  if (typeof window !== 'undefined') {
    localStorage.setItem('bounty_sound_enabled', String(enabled))
  }
  if (!enabled) {
    stopAmbient()
  }
}

export function setEffectsEnabled(enabled: boolean): void {
  effectsEnabled = enabled
  if (typeof window !== 'undefined') {
    localStorage.setItem('bounty_effects_enabled', String(enabled))
  }
}

export function setAmbientEnabled(enabled: boolean): void {
  ambientEnabled = enabled
  if (typeof window !== 'undefined') {
    localStorage.setItem('bounty_ambient_enabled', String(enabled))
  }
  if (!enabled) {
    stopAmbient()
  }
}

export function toggleSound(): boolean {
  setSoundEnabled(!soundEnabled)
  return soundEnabled
}

// ============ UI INTERACTION SOUNDS ============

// Soft hover sound (debounced)
let lastHoverTime = 0
export function hover(): void {
  if (!soundEnabled || !effectsEnabled) return
  const now = Date.now()
  if (now - lastHoverTime < 500) return // Debounce 500ms
  lastHoverTime = now

  const ctx = getAudioContext()
  if (!ctx) return
  
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  
  oscillator.type = 'triangle'
  oscillator.frequency.setValueAtTime(1500, ctx.currentTime)
  
  gainNode.gain.setValueAtTime(0.05, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03)
  
  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 0.03)
}

// Tap sound for button clicks
export function tap(): void {
  if (!soundEnabled || !effectsEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return
  
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  
  oscillator.type = 'square'
  oscillator.frequency.setValueAtTime(200, ctx.currentTime)
  
  gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02)
  
  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 0.02)
}

// Swoosh for screen transitions
export function swoosh(): void {
  if (!soundEnabled || !effectsEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return
  
  const bufferSize = ctx.sampleRate * 0.15
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI)
  }
  
  const source = ctx.createBufferSource()
  const gainNode = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  
  source.buffer = buffer
  source.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(ctx.destination)
  
  filter.type = 'bandpass'
  filter.frequency.setValueAtTime(800, ctx.currentTime)
  filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15)
  filter.Q.setValueAtTime(2, ctx.currentTime)
  
  gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
  
  source.start(ctx.currentTime)
}

// Paper sound for parchment opens
export function paper(): void {
  if (!soundEnabled || !effectsEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return
  
  const bufferSize = ctx.sampleRate * 0.2
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize) * 0.5
  }
  
  const source = ctx.createBufferSource()
  const gainNode = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  
  source.buffer = buffer
  source.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(ctx.destination)
  
  filter.type = 'highpass'
  filter.frequency.setValueAtTime(800, ctx.currentTime)
  
  gainNode.gain.setValueAtTime(0.08, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
  
  source.start(ctx.currentTime)
}

// Stamp sound for wax seal
export function stamp(): void {
  if (!soundEnabled || !effectsEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return
  
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  
  oscillator.type = 'triangle'
  oscillator.frequency.setValueAtTime(80, ctx.currentTime)
  
  gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)
  
  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 0.05)
}

// Chime for achievement unlock (bigger than chord)
export function chime(): void {
  if (!soundEnabled || !effectsEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return
  
  const notes = [880, 1108.73, 1318.51] // A5, C#6, E6
  
  notes.forEach((freq, i) => {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime)
    
    const startTime = ctx.currentTime + i * 0.05
    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(0.12, startTime + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8)
    
    oscillator.start(startTime)
    oscillator.stop(startTime + 0.9)
  })
}

// Fog horn for intro
export function fogHorn(): void {
  if (!soundEnabled || !effectsEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return
  
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  
  oscillator.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(ctx.destination)
  
  oscillator.type = 'sawtooth'
  oscillator.frequency.setValueAtTime(80, ctx.currentTime)
  oscillator.frequency.linearRampToValueAtTime(75, ctx.currentTime + 1.5)
  
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(200, ctx.currentTime)
  
  gainNode.gain.setValueAtTime(0, ctx.currentTime)
  gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.3)
  gainNode.gain.setValueAtTime(0.08, ctx.currentTime + 1)
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5)
  
  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 1.5)
}

// ============ AMBIENT SOUNDS ============

export function startAmbient(): void {
  if (!soundEnabled || !ambientEnabled) return
  if (ambientSource) return // Already playing
  
  const ctx = getAudioContext()
  if (!ctx) return
  
  // Create pink noise for ocean ambient
  const bufferSize = ctx.sampleRate * 4 // 4 second loop
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  
  // Generate pink noise (1/f noise)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + white * 0.0555179
    b1 = 0.99332 * b1 + white * 0.0750759
    b2 = 0.96900 * b2 + white * 0.1538520
    b3 = 0.86650 * b3 + white * 0.3104856
    b4 = 0.55000 * b4 + white * 0.5329522
    b5 = -0.7616 * b5 - white * 0.0168980
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
    b6 = white * 0.115926
  }
  
  ambientSource = ctx.createBufferSource()
  ambientGain = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  const lfo = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  
  ambientSource.buffer = buffer
  ambientSource.loop = true
  
  // LFO to modulate filter for wave-like effect
  lfo.frequency.setValueAtTime(0.1, ctx.currentTime) // Very slow oscillation
  lfoGain.gain.setValueAtTime(200, ctx.currentTime) // Modulation depth
  
  lfo.connect(lfoGain)
  lfoGain.connect(filter.frequency)
  
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(400, ctx.currentTime)
  filter.Q.setValueAtTime(1, ctx.currentTime)
  
  ambientSource.connect(filter)
  filter.connect(ambientGain)
  ambientGain.connect(ctx.destination)
  
  // Fade in
  ambientGain.gain.setValueAtTime(0, ctx.currentTime)
  ambientGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 1.5)
  
  ambientSource.start(ctx.currentTime)
  lfo.start(ctx.currentTime)
}

export function stopAmbient(): void {
  if (!ambientSource || !ambientGain) return
  
  const ctx = getAudioContext()
  if (!ctx) return
  
  // Fade out
  ambientGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5)
  
  setTimeout(() => {
    if (ambientSource) {
      ambientSource.stop()
      ambientSource = null
    }
    ambientGain = null
  }, 1600)
}

// Lantern creak (random interval)
let lanternCreakInterval: NodeJS.Timeout | null = null

export function startLanternCreak(): void {
  if (lanternCreakInterval) return
  
  const scheduleCreak = () => {
    const delay = 8000 + Math.random() * 7000 // 8-15 seconds
    lanternCreakInterval = setTimeout(() => {
      lanternCreak()
      scheduleCreak()
    }, delay)
  }
  
  scheduleCreak()
}

export function stopLanternCreak(): void {
  if (lanternCreakInterval) {
    clearTimeout(lanternCreakInterval)
    lanternCreakInterval = null
  }
}

function lanternCreak(): void {
  if (!soundEnabled || !ambientEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return
  
  // Two oscillators for wood creaking
  const osc1 = ctx.createOscillator()
  const osc2 = ctx.createOscillator()
  const gainNode = ctx.createGain()
  
  osc1.connect(gainNode)
  osc2.connect(gainNode)
  gainNode.connect(ctx.destination)
  
  osc1.type = 'sawtooth'
  osc1.frequency.setValueAtTime(90, ctx.currentTime)
  osc1.frequency.linearRampToValueAtTime(85, ctx.currentTime + 0.15)
  
  osc2.type = 'sawtooth'
  osc2.frequency.setValueAtTime(110, ctx.currentTime)
  osc2.frequency.linearRampToValueAtTime(105, ctx.currentTime + 0.15)
  osc2.detune.setValueAtTime(10, ctx.currentTime)
  
  gainNode.gain.setValueAtTime(0, ctx.currentTime)
  gainNode.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.03)
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15)
  
  osc1.start(ctx.currentTime)
  osc2.start(ctx.currentTime)
  osc1.stop(ctx.currentTime + 0.2)
  osc2.stop(ctx.currentTime + 0.2)
}

// ============ HAPTIC FEEDBACK ============

export function hapticLight(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(30)
  }
}

export function hapticMedium(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([50, 100, 50])
  }
}

export function hapticHeavy(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([100, 50, 100, 50, 100])
  }
}

// ============ ORIGINAL SOUNDS ============

// Original ding sound for doubloons
export function ding(): void {
  if (!soundEnabled || !effectsEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return
  
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  
  oscillator.type = 'sine'
  oscillator.frequency.setValueAtTime(880, ctx.currentTime)
  
  gainNode.gain.setValueAtTime(0.25, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
  
  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 0.15)
}

// Coin clink for coin landing in counter
export function clink(): void {
  if (!soundEnabled || !effectsEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return
  
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  
  oscillator.type = 'triangle'
  oscillator.frequency.setValueAtTime(1200, ctx.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.08)
  
  gainNode.gain.setValueAtTime(0.15, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)
  
  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 0.1)
}

// Wood creak for wheel hover (debounced)
let lastCreakTime = 0
export function creak(): void {
  if (!soundEnabled || !effectsEnabled) return
  const now = Date.now()
  if (now - lastCreakTime < 500) return // Debounce 500ms
  lastCreakTime = now

  const ctx = getAudioContext()
  if (!ctx) return
  
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  
  oscillator.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(ctx.destination)
  
  oscillator.type = 'sawtooth'
  oscillator.frequency.setValueAtTime(200, ctx.currentTime)
  oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2)
  
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(400, ctx.currentTime)
  
  gainNode.gain.setValueAtTime(0.05, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
  
  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + 0.25)
}

// Page turn for scene changes
export function pageTurn(): void {
  if (!soundEnabled || !effectsEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return
  
  // Create noise using buffer
  const bufferSize = ctx.sampleRate * 0.1
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
  }
  
  const source = ctx.createBufferSource()
  const gainNode = ctx.createGain()
  const filter = ctx.createBiquadFilter()
  
  source.buffer = buffer
  source.connect(filter)
  filter.connect(gainNode)
  gainNode.connect(ctx.destination)
  
  filter.type = 'highpass'
  filter.frequency.setValueAtTime(2000, ctx.currentTime)
  
  gainNode.gain.setValueAtTime(0.08, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
  
  source.start(ctx.currentTime)
}

// Achievement chord (3-note major chord)
export function achievementChord(): void {
  if (!soundEnabled || !effectsEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return
  
  const notes = [523.25, 659.25, 783.99] // C5, E5, G5 - major chord
  
  notes.forEach((freq, i) => {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime)
    
    const startTime = ctx.currentTime + i * 0.05
    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.05)
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5)
    
    oscillator.start(startTime)
    oscillator.stop(startTime + 0.6)
  })
}

// Celebration fanfare for role completion
export function celebration(): void {
  if (!soundEnabled || !effectsEnabled) return
  const ctx = getAudioContext()
  if (!ctx) return
  
  // Quick ascending notes
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
  
  notes.forEach((freq, i) => {
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime)
    
    const startTime = ctx.currentTime + i * 0.1
    gainNode.gain.setValueAtTime(0, startTime)
    gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.03)
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3)
    
    oscillator.start(startTime)
    oscillator.stop(startTime + 0.4)
  })
  
  // Haptic feedback
  hapticHeavy()
}
