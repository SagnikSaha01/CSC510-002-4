import { useState, useCallback } from "react"

export interface CartItem {
  id: string
  menu_item_id: string
  quantity: number
  menu_items: {
    id: string
    name: string
    price: number
    image_url: string
    restaurant_id: string
  }
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addToCart = useCallback(async (menuItemId: string, userId: string, quantity: number = 1) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch("http://localhost:5000/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          menu_item_id: menuItemId,
          quantity: quantity,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add item to cart")
      }

      const data = await response.json()
      
      // Optionally refresh cart after adding
      // await fetchCart(userId)
      
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add to cart"
      setError(errorMessage)
      console.error("Error adding to cart:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchCart = useCallback(async (userId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`http://localhost:5000/api/cart?user_id=${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch cart")
      }

      const data = await response.json()
      setCart(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch cart"
      setError(errorMessage)
      console.error("Error fetching cart:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeFromCart = useCallback(async (menuItemId: string, userId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`http://localhost:5000/api/cart/items/${menuItemId}?user_id=${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok && response.status !== 204) {
        throw new Error("Failed to remove item from cart")
      }

      // Refresh cart after removing
      await fetchCart(userId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to remove from cart"
      setError(errorMessage)
      console.error("Error removing from cart:", err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [fetchCart])

  const getCartCount = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }, [cart])

  return {
    cart,
    isLoading,
    error,
    addToCart,
    fetchCart,
    removeFromCart,
    getCartCount,
  }
}
