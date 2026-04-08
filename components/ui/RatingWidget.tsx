'use client'

import { useState } from 'react'
import { Star, StarHalf } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

interface RatingWidgetProps {
  initialRating?: number
  onRate?: (rating: number) => void
  readonly?: boolean
  className?: string
}

export function RatingWidget({ initialRating = 0, onRate, readonly = false, className }: RatingWidgetProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const currentRating = hoverRating > 0 ? hoverRating : initialRating

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    if (readonly) return
    const rect = e.currentTarget.getBoundingClientRect()
    const isHalf = e.clientX - rect.left < rect.width / 2
    setHoverRating(index + (isHalf ? 0.5 : 1))
  }

  const handleClick = () => {
    if (!readonly && onRate && hoverRating > 0) {
      onRate(hoverRating)
    }
  }

  return (
    <div 
      className={twMerge('flex items-center gap-1', className)}
      onMouseLeave={() => setHoverRating(0)}
      onClick={handleClick}
    >
      {[...Array(10)].map((_, i) => {
        const isFilled = i < Math.floor(currentRating)
        const isHalf = i === Math.floor(currentRating) && currentRating % 1 !== 0

        return (
          <div
            key={i}
            className={`relative cursor-${readonly ? 'default' : 'pointer'} hover:scale-110 transition-transform`}
            onMouseMove={(e) => handleMouseMove(e, i)}
          >
            {isFilled ? (
              <Star className="w-5 h-5 text-gold fill-gold" strokeWidth={1} />
            ) : isHalf ? (
              <StarHalf className="w-5 h-5 text-gold fill-gold" strokeWidth={1} />
            ) : (
              <Star className="w-5 h-5 text-text-3 hover:text-gold-dim transition-colors" strokeWidth={1} />
            )}
          </div>
        )
      })}
      <span className="ml-3 font-mono text-sm text-gold">
        {currentRating > 0 ? currentRating.toFixed(1) : '-.-'}
      </span>
    </div>
  )
}
