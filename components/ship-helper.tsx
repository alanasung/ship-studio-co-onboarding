'use client'

import { useState } from 'react'
import { X, ChevronDown, ChevronUp, Mail } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    question: 'What are doubloons for?',
    answer: 'Doubloons are SH1P Crew currency. They unlock priority cohort review, invite-only events with founders & investors, merch drops, and leaderboard ranking. The more you earn, the more opportunities you unlock.',
  },
  {
    question: 'How do I verify posts?',
    answer: 'Paste the full LinkedIn post URL into the verification field. Our system checks that the post exists and meets the guidelines. Make sure your posts are public and contain relevant content.',
  },
  {
    question: 'Can I post about politics?',
    answer: 'We recommend keeping posts focused on startups, tech, venture, and entrepreneurship. Political content can be divisive and may not align with SH1P\'s professional network goals.',
  },
  {
    question: "What's the cohort?",
    answer: 'The SH1P cohort is an intensive program for ambitious founders and builders. Cohort members get direct mentorship, investor intros, and a tight-knit community. Apply at sh1p.co/apply.',
  },
  {
    question: 'How do streaks work?',
    answer: 'Post on consecutive days to build a streak. A 3+ day streak unlocks a 1.5x doubloon multiplier on your next earn. Missing a day resets your streak.',
  },
]

export function ShipHelper({ show = true }: { show?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null)

  if (!show) return null

  return (
    <>
      {/* Floating bottle icon */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 group"
        title="Ask SH1P Helper"
      >
        <div className="relative animate-bottle-bob">
          <svg width="50" height="50" viewBox="0 0 50 50" className="drop-shadow-lg">
            {/* Bottle body */}
            <path
              d="M20 15 L20 12 L22 10 L28 10 L30 12 L30 15 L32 18 L32 40 C32 44 28 46 25 46 C22 46 18 44 18 40 L18 18 Z"
              fill="url(#bottleGrad)"
              stroke="#5c4a1f"
              strokeWidth="1"
            />
            {/* Cork */}
            <rect x="21" y="6" width="8" height="5" rx="1" fill="#8b6914" />
            {/* Paper inside */}
            <path
              d="M22 20 L22 38 C22 39 23 40 25 40 C27 40 28 39 28 38 L28 20"
              fill="#f4e8c1"
              opacity="0.6"
            />
            <defs>
              <linearGradient id="bottleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4a8b6a" />
                <stop offset="50%" stopColor="#2d5a42" />
                <stop offset="100%" stopColor="#1a3d2a" />
              </linearGradient>
            </defs>
          </svg>
          {/* Glow on hover */}
          <div className="absolute inset-0 rounded-full bg-gold/0 group-hover:bg-gold/20 
            transition-colors duration-300" />
        </div>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-navy/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-md parchment rounded-lg shadow-2xl noise overflow-hidden">
            {/* Header */}
            <div className="relative p-6 border-b border-rope/20">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-navy/60 hover:text-navy transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="font-serif text-2xl text-navy flex items-center gap-3">
                <svg width="24" height="24" viewBox="0 0 50 50">
                  <path
                    d="M20 15 L20 12 L22 10 L28 10 L30 12 L30 15 L32 18 L32 40 C32 44 28 46 25 46 C22 46 18 44 18 40 L18 18 Z"
                    fill="#2d5a42"
                    stroke="#1a3d2a"
                    strokeWidth="1"
                  />
                  <rect x="21" y="6" width="8" height="5" rx="1" fill="#8b6914" />
                </svg>
                Ask SH1P Helper
              </h2>
              <p className="font-mono text-rope text-sm mt-1">Quick answers to common questions</p>
            </div>

            {/* FAQ */}
            <div className="p-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-2">
                {faqItems.map((item, index) => (
                  <div
                    key={index}
                    className="border border-rope/20 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      className="w-full flex items-center justify-between p-3 text-left 
                        hover:bg-rope/5 transition-colors"
                    >
                      <span className="font-mono text-sm text-navy">{item.question}</span>
                      {expandedFAQ === index ? (
                        <ChevronUp className="w-4 h-4 text-rope shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-rope shrink-0" />
                      )}
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-3 pb-3 pt-0">
                        <p className="font-mono text-sm text-navy/70 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Contact CTA */}
            <div className="p-4 border-t border-rope/20 bg-rope/5">
              <a
                href="mailto:ecosystem@sh1p.co"
                className="flex items-center justify-center gap-2 w-full py-3 bg-navy text-gold 
                  font-mono text-sm rounded-lg hover:bg-navy/90 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email us at ecosystem@sh1p.co
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
