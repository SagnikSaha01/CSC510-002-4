"use client"

import { useState, useEffect } from "react"

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  filters: {
    budget: number
    distance: number
    rating: number
  }
  onFilterChange: (filters: { budget: number; distance: number; rating: number }) => void
}

export default function FilterModal({ isOpen, onClose, filters, onFilterChange }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleSliderChange = (key: keyof typeof filters, value: number) => {
    const updated = { ...localFilters, [key]: value }
    setLocalFilters(updated)
    onFilterChange(updated)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card rounded-xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Filters</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Budget Range */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Budget Range: ${localFilters.budget}
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={localFilters.budget}
                onChange={(e) => handleSliderChange("budget", Number(e.target.value))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>$10</span>
                <span>$100</span>
              </div>
            </div>

            {/* Distance */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Distance: {localFilters.distance} km
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={localFilters.distance}
                onChange={(e) => handleSliderChange("distance", Number(e.target.value))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>1 km</span>
                <span>20 km</span>
              </div>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-3">
                Minimum Rating: {localFilters.rating.toFixed(1)} ⭐
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={localFilters.rating}
                onChange={(e) => handleSliderChange("rating", Number(e.target.value))}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>1.0</span>
                <span>5.0</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-8 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  )
}
