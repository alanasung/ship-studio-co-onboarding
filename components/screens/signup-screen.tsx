'use client'

import { useState } from 'react'
import type { UserData } from '@/lib/types'
import { DepthScene } from '@/components/depth-scene'
import { NauticalEnvironment } from '@/components/nautical-environment'
import { SoundButton } from '@/components/sound-button'

interface SignupScreenProps {
  initialData: UserData
  onSubmit: (data: UserData) => void
}

const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
  'France', 'Netherlands', 'Singapore', 'India', 'Brazil', 'Japan',
  'South Korea', 'Mexico', 'Spain', 'Italy', 'Sweden', 'Norway',
  'Denmark', 'Finland', 'Switzerland', 'Austria', 'Belgium', 'Ireland',
  'New Zealand', 'Portugal', 'Poland', 'Czech Republic', 'Other'
]

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const linkedInRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w\-]+\/?$/

export function SignupScreen({ initialData, onSubmit }: SignupScreenProps) {
  const [formData, setFormData] = useState<UserData>(initialData)
  const [errors, setErrors] = useState<Partial<Record<keyof UserData, string>>>({})

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserData, string>> = {}

    if (!formData.firstName.trim()) newErrors.firstName = 'Required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Required'
    
    const trimmedLinkedIn = formData.linkedIn.trim()
    if (!trimmedLinkedIn) {
      newErrors.linkedIn = 'Required'
    } else if (!linkedInRegex.test(trimmedLinkedIn)) {
      newErrors.linkedIn = 'Enter a full LinkedIn profile URL'
    }
    
    const trimmedEmail = formData.email.trim()
    if (!trimmedEmail) {
      newErrors.email = 'Required'
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = 'Enter a valid email address'
    }
    
    if (!formData.phone.trim()) newErrors.phone = 'Required'
    if (!formData.nationality.trim()) newErrors.nationality = 'Required'
    if (!formData.residence.trim()) newErrors.residence = 'Required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      const trimmedData: UserData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        linkedIn: formData.linkedIn.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        nationality: formData.nationality.trim(),
        residence: formData.residence.trim(),
      }
      onSubmit(trimmedData)
    }
  }

  const handleChange = (field: keyof UserData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="fixed inset-0 mesh-gradient-navy flex items-center justify-center p-4 overflow-y-auto">
      

      {/* Background wheel - blurred and rotating */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] blur-xl pointer-events-none overflow-hidden">
        <svg
          width="600"
          height="600"
          viewBox="0 0 320 320"
          className="animate-spin-slow"
        >
          <defs>
            <radialGradient id="bgWheelGradient" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#8b6914" />
              <stop offset="50%" stopColor="#5c4a1f" />
              <stop offset="100%" stopColor="#3d3115" />
            </radialGradient>
          </defs>
          
          <circle cx="160" cy="160" r="150" fill="none" stroke="url(#bgWheelGradient)" strokeWidth="12" />
          <circle cx="160" cy="160" r="120" fill="none" stroke="url(#bgWheelGradient)" strokeWidth="8" />
          <circle cx="160" cy="160" r="45" fill="url(#bgWheelGradient)" stroke="#3d3115" strokeWidth="3" />
          <circle cx="160" cy="160" r="30" fill="#3d3115" stroke="#5c4a1f" strokeWidth="2" />
          
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45 * Math.PI) / 180
            const x1 = 160 + 45 * Math.cos(angle)
            const y1 = 160 + 45 * Math.sin(angle)
            const x2 = 160 + 150 * Math.cos(angle)
            const y2 = 160 + 150 * Math.sin(angle)
            
            return (
              <g key={i}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="url(#bgWheelGradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <circle
                  cx={160 + 155 * Math.cos(angle)}
                  cy={160 + 155 * Math.sin(angle)}
                  r="12"
                  fill="url(#bgWheelGradient)"
                  stroke="#3d3115"
                  strokeWidth="2"
                />
              </g>
            )
          })}
        </svg>
      </div>

      {/* Parchment card with compass watermark */}
      <div className="relative z-10 w-full max-w-xl parchment rounded-lg p-6 md:p-8 shadow-2xl noise compass-watermark">
        <h2 className="font-serif text-3xl md:text-4xl text-navy text-center mb-2">
          Join the Crew
        </h2>
        <p className="font-mono text-rope text-center text-sm mb-6 md:mb-8">
          Fill in your details to come aboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
          {/* Name row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block font-mono text-xs text-rope uppercase tracking-wider mb-2">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                className={`w-full px-2 py-3 ink-input font-serif text-navy text-lg
                  ${errors.firstName ? 'border-red-500' : ''}`}
                placeholder="Jack"
              />
              {errors.firstName && (
                <p className="text-red-600 text-xs mt-1 font-mono">{errors.firstName}</p>
              )}
            </div>
            <div className="flex-1">
              <label className="block font-mono text-xs text-rope uppercase tracking-wider mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                className={`w-full px-2 py-3 ink-input font-serif text-navy text-lg
                  ${errors.lastName ? 'border-red-500' : ''}`}
                placeholder="Sparrow"
              />
              {errors.lastName && (
                <p className="text-red-600 text-xs mt-1 font-mono">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block font-mono text-xs text-rope uppercase tracking-wider mb-2">
              LinkedIn URL
            </label>
            <input
              type="url"
              value={formData.linkedIn}
              onChange={(e) => handleChange('linkedIn', e.target.value)}
              className={`w-full px-2 py-3 ink-input font-serif text-navy text-lg
                ${errors.linkedIn ? 'border-red-500' : ''}`}
              placeholder="https://linkedin.com/in/yourprofile"
            />
            {errors.linkedIn && (
              <p className="text-red-600 text-xs mt-1 font-mono">{errors.linkedIn}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block font-mono text-xs text-rope uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-2 py-3 ink-input font-serif text-navy text-lg
                ${errors.email ? 'border-red-500' : ''}`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-red-600 text-xs mt-1 font-mono">{errors.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block font-mono text-xs text-rope uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className={`w-full px-2 py-3 ink-input font-serif text-navy text-lg
                ${errors.phone ? 'border-red-500' : ''}`}
              placeholder="+1 (555) 123-4567"
            />
            {errors.phone && (
              <p className="text-red-600 text-xs mt-1 font-mono">{errors.phone}</p>
            )}
          </div>

          {/* Location row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block font-mono text-xs text-rope uppercase tracking-wider mb-2">
                Nationality
              </label>
              <select
                value={formData.nationality}
                onChange={(e) => handleChange('nationality', e.target.value)}
                className={`w-full px-2 py-3 ink-input font-serif text-navy text-lg
                  appearance-none cursor-pointer
                  ${errors.nationality ? 'border-red-500' : ''}`}
              >
                <option value="">Select...</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              {errors.nationality && (
                <p className="text-red-600 text-xs mt-1 font-mono">{errors.nationality}</p>
              )}
            </div>
            <div className="flex-1">
              <label className="block font-mono text-xs text-rope uppercase tracking-wider mb-2">
                Country of Residence
              </label>
              <select
                value={formData.residence}
                onChange={(e) => handleChange('residence', e.target.value)}
                className={`w-full px-2 py-3 ink-input font-serif text-navy text-lg
                  appearance-none cursor-pointer
                  ${errors.residence ? 'border-red-500' : ''}`}
              >
                <option value="">Select...</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
              {errors.residence && (
                <p className="text-red-600 text-xs mt-1 font-mono">{errors.residence}</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <SoundButton
            type="submit"
            className="w-full mt-6 px-8 py-4 bg-navy text-gold font-mono font-bold text-lg rounded-lg 
              hover:bg-navy/90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]
              shadow-lg border-2 border-gold/30"
          >
            Set Sail &rarr;
          </SoundButton>
        </form>
      </div>
    </div>
  )
}
