"use client"

import type React from "react"

import { useState, useRef, useImperativeHandle, forwardRef } from "react"
import Link from "next/link"

interface SwipeCardProps {
  id: number
  restaurant_id?: string
  restaurant_name?: string
  title: string
  description: string
  image: string
  price: number
  distance: number
  rating: number
  category: string
  isFavorite?: boolean
  onSwipe: (direction: "left" | "right") => void
  onToggleFavorite?: (id: number) => void
  onOrder?: (id: number) => void
}

export interface SwipeCardRef {
  triggerSwipe: (direction: "left" | "right") => void
}

const SwipeCard = forwardRef<SwipeCardRef, SwipeCardProps>((props, ref) => {
  const {
    id,
    restaurant_id,
    restaurant_name,
    title,
    description,
    image,
    price,
    distance,
    rating,
    category,
    isFavorite = false,
    onSwipe,
    onToggleFavorite,
    onOrder,
  } = props
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [opacity, setOpacity] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const startPos = useRef({ x: 0, y: 0 })

  // Expose triggerSwipe method to parent component
  useImperativeHandle(ref, () => ({
    triggerSwipe: (direction: "left" | "right") => {
      const targetX = direction === "right" ? 500 : -500
      const targetRotation = direction === "right" ? 25 : -25

      setPosition({ x: targetX, y: 0 })
      setRotation(targetRotation)
      setOpacity(0)

      if (direction === "right" && onToggleFavorite) {
        onToggleFavorite(id)
      }

      // Wait for animation to complete before calling onSwipe
      setTimeout(() => {
        onSwipe(direction)
      }, 300)
    }
  }))

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    startPos.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - startPos.current.x
    const deltaY = e.clientY - startPos.current.y

    setPosition({ x: deltaX, y: deltaY })
    setRotation((deltaX / window.innerWidth) * 25)
    setOpacity(1 - Math.abs(deltaX) / window.innerWidth)
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsDragging(false)

    const deltaX = e.clientX - startPos.current.x
    const threshold = window.innerWidth * 0.3

    if (Math.abs(deltaX) > threshold) {
      const direction = deltaX > 0 ? "right" : "left"
      if (direction === "right" && onToggleFavorite) {
        onToggleFavorite(id)
      }
      onSwipe(direction)
      setPosition({ x: deltaX > 0 ? 500 : -500, y: 0 })
      setRotation(deltaX > 0 ? 25 : -25)
      setOpacity(0)
    } else {
      setPosition({ x: 0, y: 0 })
      setRotation(0)
      setOpacity(1)
    }
  }

  // Touch support
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    startPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return

    const deltaX = e.touches[0].clientX - startPos.current.x
    const deltaY = e.touches[0].clientY - startPos.current.y

    setPosition({ x: deltaX, y: deltaY })
    setRotation((deltaX / window.innerWidth) * 25)
    setOpacity(1 - Math.abs(deltaX) / window.innerWidth)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false)

    const deltaX = e.changedTouches[0].clientX - startPos.current.x
    const threshold = window.innerWidth * 0.3

    if (Math.abs(deltaX) > threshold) {
      const direction = deltaX > 0 ? "right" : "left"
      if (direction === "right" && onToggleFavorite) {
        onToggleFavorite(id)
      }
      onSwipe(direction)
      setPosition({ x: deltaX > 0 ? 500 : -500, y: 0 })
      setRotation(deltaX > 0 ? 25 : -25)
      setOpacity(0)
    } else {
      setPosition({ x: 0, y: 0 })
      setRotation(0)
      setOpacity(1)
    }
  }

  return (
    <div
      ref={cardRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        if (isDragging) {
          setIsDragging(false)
          setPosition({ x: 0, y: 0 })
          setRotation(0)
          setOpacity(1)
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="absolute w-full h-full cursor-grab active:cursor-grabbing select-none"
      style={{
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
        opacity,
        transition: isDragging ? "none" : "all 0.3s ease-out",
      }}
    >
      <div className="bg-card rounded-2xl overflow-hidden shadow-2xl border border-border h-full flex flex-col">
        {/* Image */}
        <div className="relative h-1/2 overflow-hidden bg-muted">
          <img src={image || "/placeholder.svg"} alt={title} className="w-full h-full object-cover" draggable={false} />
          <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
            {category}
          </div>

          {/* Swipe indicators */}
          <div className="absolute inset-0 flex items-center justify-between px-8 pointer-events-none">
            <div
              className="text-4xl font-bold text-red-500 opacity-0 transition-opacity"
              style={{ opacity: Math.max(0, -position.x / 200) }}
            >
              NOPE
            </div>
            <div
              className="text-4xl font-bold text-green-500 opacity-0 transition-opacity"
              style={{ opacity: Math.max(0, position.x / 200) }}
            >
              LIKE
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="h-1/2 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">{title}</h2>
            {restaurant_name && restaurant_id && (
              <Link
                href={`/restaurant/${restaurant_id}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-block text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors mb-2"
              >
                🍽️ {restaurant_name}
              </Link>
            )}
            <p className="text-muted-foreground text-base mb-4">{description}</p>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span className="text-xl font-semibold text-foreground">{rating}</span>
              </div>
              <span className="text-muted-foreground">{distance} km away</span>
            </div>

            {/* Price and actions */}
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-primary">${price.toFixed(2)}</span>
              <div className="flex gap-3">
                <button
                  onClick={() => onToggleFavorite?.(id)}
                  className="p-3 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/90 transition-colors"
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <svg
                    className="w-6 h-6"
                    fill={isFavorite ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    onOrder?.(id)
                  }}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors"
                >
                  Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

SwipeCard.displayName = "SwipeCard"

export default SwipeCard
