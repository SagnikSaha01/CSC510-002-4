"use client"

import RecommendationCard from "./recommendation-card"
import SortControls from "./sort-controls"
import { useRecommendations, type Recommendation } from "@/hooks/use-recommendations"

interface RecommendationGridProps {
  mood: string
  filters: {
    budget: number
    distance: number
    rating: number
  }
}

// Mock data - in a real app, this would come from an AI API
const mockRecommendations: Recommendation[] = [
  {
    id: 1,
    title: "Mediterranean Bowl",
    description: "Fresh, healthy ingredients with olive oil, herbs, and sunshine flavors",
    image: "/mediterranean-bowl-healthy-food.jpg",
    price: 12.99,
    distance: 2.3,
    rating: 4.8,
    category: "Healthy",
  },
  {
    id: 2,
    title: "Comfort Pasta",
    description: "Creamy, warm pasta with rich sauce and fresh parmesan",
    image: "/comfort-pasta-italian.jpg",
    price: 14.99,
    distance: 1.8,
    rating: 4.6,
    category: "Italian",
  },
  {
    id: 3,
    title: "Spicy Thai Curry",
    description: "Bold, aromatic curry with coconut milk and fresh vegetables",
    image: "/spicy-thai-curry.jpg",
    price: 13.99,
    distance: 3.1,
    rating: 4.7,
    category: "Thai",
  },
  {
    id: 4,
    title: "Gourmet Burger",
    description: "Premium beef patty with artisan toppings and special sauce",
    image: "/gourmet-burger.jpg",
    price: 15.99,
    distance: 2.5,
    rating: 4.5,
    category: "American",
  },
  {
    id: 5,
    title: "Sushi Platter",
    description: "Assorted fresh sushi rolls with wasabi and ginger",
    image: "/sushi-platter.jpg",
    price: 18.99,
    distance: 4.2,
    rating: 4.9,
    category: "Japanese",
  },
  {
    id: 6,
    title: "Vegan Buddha Bowl",
    description: "Colorful mix of quinoa, roasted vegetables, and tahini dressing",
    image: "/vegan-buddha-bowl.jpg",
    price: 11.99,
    distance: 2.8,
    rating: 4.4,
    category: "Vegan",
  },
]

export default function RecommendationGrid({ mood, filters }: RecommendationGridProps) {
  const {
    favorites,
    toggleFavorite,
    isFavorite,
    sortBy,
    setSortBy,
    showFavoritesOnly,
    setShowFavoritesOnly,
    sortRecommendations,
  } = useRecommendations()

  // Filter recommendations based on filters
  let filteredRecommendations = mockRecommendations.filter(
    (rec) => rec.price <= filters.budget && rec.distance <= filters.distance && rec.rating >= filters.rating,
  )

  if (showFavoritesOnly) {
    filteredRecommendations = filteredRecommendations.filter((rec) => isFavorite(rec.id))
  }

  filteredRecommendations = sortRecommendations(filteredRecommendations)

  return (
    <div className="w-full">
      {mood && (
        <div className="mb-8 p-4 bg-accent/10 border border-accent/20 rounded-lg">
          <p className="text-foreground">
            <span className="font-semibold">Mood:</span> {mood}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Found {filteredRecommendations.length} recommendations matching your vibe
          </p>
        </div>
      )}

      {mockRecommendations.length > 0 && (
        <SortControls
          sortBy={sortBy}
          onSortChange={setSortBy}
          favoritesCount={favorites.length}
          showFavoritesOnly={showFavoritesOnly}
          onToggleFavorites={setShowFavoritesOnly}
        />
      )}

      {filteredRecommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecommendations.map((rec) => (
            <RecommendationCard
              key={rec.id}
              {...rec}
              isFavorite={isFavorite(rec.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {showFavoritesOnly
              ? "No favorites yet. Add some recommendations to your favorites!"
              : mood
                ? "No recommendations match your filters. Try adjusting them!"
                : "Tell us your mood to get started!"}
          </p>
        </div>
      )}
    </div>
  )
}
