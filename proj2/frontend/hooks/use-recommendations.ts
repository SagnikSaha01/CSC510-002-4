"use client"

import { useState, useEffect } from "react"

export interface Recommendation {
  id: number
  menu_item_id?: string
  restaurant_id?: string
  restaurant_name?: string
  title: string
  description: string
  image: string
  price: number
  distance: number
  rating: number
  category: string
}

export type SortOption = "relevance" | "price-low" | "price-high" | "rating" | "distance"

export function useRecommendations() {
  const [favorites, setFavorites] = useState<number[]>([])
  const [sortBy, setSortBy] = useState<SortOption>("relevance")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  // Load favorites from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("vibe-eats-favorites")
    if (saved) {
      try {
        setFavorites(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to load favorites:", e)
      }
    }
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("vibe-eats-favorites", JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
  }

  const isFavorite = (id: number) => favorites.includes(id)

  const sortRecommendations = (recommendations: Recommendation[]): Recommendation[] => {
    const sorted = [...recommendations]
    switch (sortBy) {
      case "price-low":
        return sorted.sort((a, b) => a.price - b.price)
      case "price-high":
        return sorted.sort((a, b) => b.price - a.price)
      case "rating":
        return sorted.sort((a, b) => b.rating - a.rating)
      case "distance":
        return sorted.sort((a, b) => a.distance - b.distance)
      case "relevance":
      default:
        return sorted
    }
  }

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    sortBy,
    setSortBy,
    showFavoritesOnly,
    setShowFavoritesOnly,
    sortRecommendations,
  }
}
