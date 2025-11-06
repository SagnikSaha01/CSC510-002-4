"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Header from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { MapPin, Star, ShoppingCart, Check } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface MenuItem {
  id: string
  restaurant_id: string
  name: string
  description: string
  price: number
  category: string
  image_url: string | null
}

interface Restaurant {
  id: string
  name: string
  address: string
  banner_image_url: string | null
  menu_items: MenuItem[]
}

export default function RestaurantDetailPage() {
  const params = useParams()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set())
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log("Fetching restaurant with ID:", params.id)

        const response = await fetch(`http://localhost:5000/api/restaurant/${params.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        console.log("Response status:", response.status)

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          const errorMessage = errorData?.error || response.statusText || "Failed to fetch restaurant details"
          throw new Error(`HTTP ${response.status}: ${errorMessage}`)
        }

        const data = await response.json()
        console.log("Restaurant data:", data)
        setRestaurant(data)
      } catch (err) {
        console.error("Error fetching restaurant:", err)
        const errorMessage = err instanceof Error ? err.message : "An error occurred"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchRestaurant()
    }
  }, [params.id])

  const handleAddToCart = async (menuItemId: string, itemName: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your cart",
        variant: "destructive",
      })
      return
    }

    try {
      await addToCart(menuItemId, user.id)

      // Add to the set of added items for visual feedback
      setAddedItems(prev => new Set(prev).add(menuItemId))

      // Show success toast with green styling
      toast({
        title: "✓ Added to cart",
        description: `${itemName} has been added to your cart`,
        className: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
      })

      // Remove the added state after 2 seconds
      setTimeout(() => {
        setAddedItems(prev => {
          const newSet = new Set(prev)
          newSet.delete(menuItemId)
          return newSet
        })
      }, 2000)
    } catch (err) {
      console.error("Error adding to cart:", err)
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading restaurant details...</p>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !restaurant) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-destructive font-semibold mb-2">Error</p>
                <p className="text-muted-foreground">
                  {error || "Restaurant not found"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  // Group menu items by category
  const menuByCategory = restaurant.menu_items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Header />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Banner Section */}
        <div className="relative w-full h-[300px] md:h-[400px] rounded-lg overflow-hidden mb-8 shadow-lg">
          {restaurant.banner_image_url ? (
            <Image
              src={restaurant.banner_image_url}
              alt={`${restaurant.name} banner`}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
              <p className="text-4xl font-bold text-muted-foreground opacity-30">
                {restaurant.name}
              </p>
            </div>
          )}
        </div>

        {/* Restaurant Info Section */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {restaurant.name}
          </h1>

          {restaurant.address && (
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <MapPin className="w-5 h-5" />
              <p className="text-lg">{restaurant.address}</p>
            </div>
          )}

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm py-1 px-3">
              {restaurant.menu_items.length} {restaurant.menu_items.length === 1 ? 'Dish' : 'Dishes'}
            </Badge>
          </div>
        </div>

        {/* Menu Section */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold mb-6">Menu</h2>

          {Object.keys(menuByCategory).length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No menu items available yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(menuByCategory).map(([category, items]) => (
              <div key={category} className="space-y-4">
                <h3 className="text-2xl font-semibold text-primary capitalize">
                  {category}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {items.map((item) => (
                    <Card
                      key={item.id}
                      className="group overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm"
                    >
                      {/* Dish Image */}
                      {item.image_url ? (
                        <div className="relative w-full h-40 overflow-hidden">
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge variant="outline" className="bg-background/90 backdrop-blur-sm border-primary/20">
                              ${item.price.toFixed(2)}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-full h-40 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                          <div className="absolute top-2 right-2">
                            <Badge variant="outline" className="bg-background/90 backdrop-blur-sm border-primary/20">
                              ${item.price.toFixed(2)}
                            </Badge>
                          </div>
                          <span className="text-4xl opacity-30">🍽️</span>
                        </div>
                      )}

                      <CardContent className="p-3 space-y-2">
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-base line-clamp-1 flex-1">
                              {item.name}
                            </h4>
                          </div>

                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            {item.category}
                          </Badge>

                          <Button
                            onClick={() => handleAddToCart(item.id, item.name)}
                            size="sm"
                            className={`h-8 px-3 gap-1.5 text-xs transition-all ${
                              addedItems.has(item.id)
                                ? "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                                : ""
                            }`}
                          >
                            {addedItems.has(item.id) ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                Added
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-3.5 h-3.5" />
                                Add
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
