"use client"

import { useState, useEffect, useRef } from "react"
import SwipeCard, { type SwipeCardRef } from "./swipe-card"
import type { Recommendation } from "@/hooks/use-recommendations"

interface SwipeStackProps {
  recommendations: Recommendation[]
  isFavorite: (id: number) => boolean
  onToggleFavorite: (id: number) => void
  onEmpty: () => void
}

export default function SwipeStack({ recommendations, isFavorite, onToggleFavorite, onEmpty }: SwipeStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipedCards, setSwipedCards] = useState<{ id: number; direction: "left" | "right" }[]>([])
  const cardRef = useRef<SwipeCardRef>(null)

  const handleSwipe = (direction: "left" | "right") => {
    const currentCard = recommendations[currentIndex]
    if (!currentCard) return

    setSwipedCards((prev) => [...prev, { id: currentCard.id, direction }])

    if (currentIndex + 1 >= recommendations.length) {
      onEmpty()
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  // Add keyboard event listener for arrow keys
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (currentIndex >= recommendations.length) return

      if (event.key === "ArrowLeft") {
        event.preventDefault()
        cardRef.current?.triggerSwipe("left")
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        cardRef.current?.triggerSwipe("right")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentIndex, recommendations.length])

  if (recommendations.length === 0 || currentIndex >= recommendations.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground text-lg">No recommendations available. Try adjusting your filters!</p>
      </div>
    )
  }

  const currentCard = recommendations[currentIndex]

  if (!currentCard) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground text-lg">No more recommendations!</p>
      </div>
    )
  }

  return (
    <div className="relative w-full h-96 md:h-[600px]">
      {/* Background cards for depth effect */}
      {recommendations.slice(currentIndex + 1, currentIndex + 3).map((rec, idx) => (
        <div
          key={rec.id}
          className="absolute inset-0 bg-card rounded-2xl border border-border shadow-lg"
          style={{
            transform: `translateY(${(idx + 1) * 12}px) scale(${1 - (idx + 1) * 0.02})`,
            zIndex: -idx - 1,
          }}
        />
      ))}

      {/* Current card */}
      <div className="relative w-full h-full">
        <SwipeCard
          ref={cardRef}
          key={currentCard.id}
          {...currentCard}
          isFavorite={isFavorite(currentCard.id)}
          onSwipe={handleSwipe}
          onToggleFavorite={onToggleFavorite}
        />
      </div>

      {/* Progress indicator */}
      <div className="absolute -bottom-12 left-0 right-0 flex justify-center gap-2">
        {recommendations.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all ${
              idx === currentIndex ? "bg-primary w-8" : idx < currentIndex ? "bg-primary/50 w-2" : "bg-border w-2"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
