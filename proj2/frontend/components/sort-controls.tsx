"use client"

import type { SortOption } from "@/hooks/use-recommendations"

interface SortControlsProps {
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  favoritesCount: number
  showFavoritesOnly: boolean
  onToggleFavorites: (show: boolean) => void
}

export default function SortControls({
  sortBy,
  onSortChange,
  favoritesCount,
  showFavoritesOnly,
  onToggleFavorites,
}: SortControlsProps) {
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "relevance", label: "Relevance" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "rating", label: "Highest Rated" },
    { value: "distance", label: "Closest" },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6 p-4 bg-card rounded-lg border border-border">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
        <label className="text-sm font-semibold text-foreground">Sort by:</label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary transition-colors"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => onToggleFavorites(!showFavoritesOnly)}
        className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
          showFavoritesOnly
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
        }`}
      >
        <svg
          className="w-5 h-5"
          fill={showFavoritesOnly ? "currentColor" : "none"}
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
        Favorites {favoritesCount > 0 && `(${favoritesCount})`}
      </button>
    </div>
  )
}
