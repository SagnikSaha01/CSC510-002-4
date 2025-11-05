"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import MoodInput from "@/components/mood-input"
import FilterModal from "@/components/filter-modal"
import SwipeStack from "@/components/swipe-stack"
import { useRecommendations, type Recommendation } from "@/hooks/use-recommendations"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/contexts/auth-context"


export default function Home() {
  const [mood, setMood] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    budget: 50,
    distance: 5,
    rating: 3.5,
  })
  const [allSwipedOut, setAllSwipedOut] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null)

  const { favorites, toggleFavorite, isFavorite } = useRecommendations()
  const { addToCart } = useCart()
  const { user } = useAuth()

  // Fetch AI recommendations when mood changes
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!mood || mood.trim().length < 3) {
        setRecommendations([])
        return
      }
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("http://localhost:5000/api/recommendations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mood: mood.trim() }),
        })
        if (!response.ok) {
          throw new Error(`Failed to fetch recommendations: ${response.statusText}`)
        }
        const data = await response.json()
        if (data.recommendations && Array.isArray(data.recommendations)) {
          // Transform backend dish data to frontend format
          const transformed = data.recommendations.map((dish: any) => ({
            id: dish.id,
            menu_item_id: dish.menu_item_id,
            title: dish.title || dish.name,
            description: dish.description,
            image: dish.image || dish.image_url,
            price: dish.price,
            distance: dish.distance || 0,
            rating: dish.rating || 0,
            category: dish.category || ""
          }))
          setRecommendations(transformed)
          setAllSwipedOut(false)
        } else {
          throw new Error("Invalid response format")
        }
      } catch (err) {
        console.error("Error fetching recommendations:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch recommendations")
        setRecommendations([])
      } finally {
        setIsLoading(false)
      }
    }
    const timeoutId = setTimeout(fetchRecommendations, 1000)
    return () => clearTimeout(timeoutId)
  }, [mood])

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setAllSwipedOut(false)
  }

  const handleOrder = async (dishId: number) => {
    if (!user) {
      setOrderSuccess("Please sign in to add items to cart")
      setTimeout(() => setOrderSuccess(null), 3000)
      return
    }

    // Find the recommendation to get the menu_item_id
    const recommendation = recommendations.find(rec => rec.id === dishId)
    if (!recommendation?.menu_item_id) {
      setOrderSuccess("Unable to add item: missing menu item ID")
      setTimeout(() => setOrderSuccess(null), 3000)
      return
    }

    try {
      await addToCart(recommendation.menu_item_id, user.id)
      setOrderSuccess("Item added to cart!")
      setTimeout(() => setOrderSuccess(null), 3000)
    } catch (err) {
      console.error("Error adding to cart:", err)
      setOrderSuccess("Failed to add item to cart")
      setTimeout(() => setOrderSuccess(null), 3000)
    }
  }

  // Filter recommendations based on filters
  const filteredRecommendations = recommendations.filter(
    (rec) => rec.price <= filters.budget && rec.distance <= filters.distance && rec.rating >= filters.rating,
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-foreground">What's your vibe today?</h1>
          <p className="text-center text-muted-foreground text-lg mb-8">
            Swipe right to like, left to pass. Find your perfect meal match!
          </p>

          <div className="flex gap-4 mb-8">
            <MoodInput mood={mood} setMood={setMood} />
            <button
              onClick={() => setIsFilterOpen(true)}
              className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filters
            </button>
          </div>

          {mood && (
            <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg text-center">
              <p className="text-foreground">
                <span className="font-semibold">Your mood:</span> {mood}
              </p>
              {isLoading ? (
                <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Finding personalized recommendations...
                </p>
              ) : error ? (
                <p className="text-sm text-destructive mt-1">
                  {error}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">
                  {filteredRecommendations.length} AI-powered recommendations match your vibe
                </p>
              )}
            </div>
          )}
        </div>

        <FilterModal
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Order success notification */}
        {orderSuccess && (
          <div className="max-w-2xl mx-auto mb-4">
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
              <p className="text-green-600 dark:text-green-400 font-semibold">{orderSuccess}</p>
            </div>
          </div>
        )}

        {/* Swipe stack */}
        <div className="max-w-2xl mx-auto mb-16">
          {allSwipedOut ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg mb-4">You've swiped through all recommendations!</p>
              <button
                onClick={() => setAllSwipedOut(false)}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Start Over
              </button>
            </div>
          ) : (
            <SwipeStack
              recommendations={filteredRecommendations}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
              onEmpty={() => setAllSwipedOut(true)}
              onOrder={handleOrder}
            />
          )}
        </div>

        {/* Favorites section */}
        {favorites.length > 0 && (
          <div className="max-w-2xl mx-auto mt-16 pt-8 border-t border-border">
            <h2 className="text-2xl font-bold text-foreground mb-4">Your Favorites ({favorites.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations
                .filter((rec) => favorites.includes(rec.id))
                .map((rec) => (
                  <div key={rec.id} className="p-4 bg-card rounded-lg border border-border">
                    <h3 className="font-semibold text-foreground mb-2">{rec.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">${rec.price.toFixed(2)}</span>
                      <button
                        onClick={() => toggleFavorite(rec.id)}
                        className="p-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/90 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
