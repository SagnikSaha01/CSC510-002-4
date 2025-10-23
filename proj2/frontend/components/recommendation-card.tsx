"use client"

interface RecommendationCardProps {
  id: number
  title: string
  description: string
  image: string
  price: number
  distance: number
  rating: number
  category: string
  isFavorite?: boolean
  onToggleFavorite?: (id: number) => void
}

export default function RecommendationCard({
  id,
  title,
  description,
  image,
  price,
  distance,
  rating,
  category,
  isFavorite = false,
  onToggleFavorite,
}: RecommendationCardProps) {
  return (
    <div className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-border hover:border-primary/50">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
          {category}
        </div>
        {onToggleFavorite && (
          <button
            onClick={() => onToggleFavorite(id)}
            className="absolute top-3 left-3 p-2 bg-white/90 hover:bg-white rounded-full transition-colors"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <svg
              className="w-5 h-5"
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
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{description}</p>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">⭐</span>
            <span className="font-semibold text-foreground">{rating}</span>
          </div>
          <span className="text-sm text-muted-foreground">{distance} km away</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">${price.toFixed(2)}</span>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Order
          </button>
        </div>
      </div>
    </div>
  )
}
