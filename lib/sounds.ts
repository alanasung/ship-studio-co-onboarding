'use client'

// Sound system with Web Audio API
// All sounds respect the global sound toggle stored in localStorage

let audioContext: AudioContext | null = null
let soundEnabled = true

// Initialize sound state from localStorage
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('bounty_sound_enabled')
  soundEnabled = stored !== 'false'
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

export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled
  if (typeof window !== 'undefined') {
    localStorage.setItem('bounty_sound_enabled', String(enabled))
  }
}

export function toggleSound(): boolean {
  setSoundEnabled(!soundEnabled)
  return soundEnabled
}

// Original ding sound for doubloons
export function ding(): void {
  if (!soundEnabled) return
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
  if (!soundEnabled) return
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
  if (!soundEnabled) return
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
  if (!soundEnabled) return
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
  if (!soundEnabled) return
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
  if (!soundEnabled) return
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
}
