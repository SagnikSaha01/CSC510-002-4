"use client"

import { useState, useMemo, useEffect } from "react"
import Header from "@/components/header"
import { useCart } from "@/hooks/use-cart"
import { useAuth } from "@/contexts/auth-context"

interface CartItem {
  id: string
  title: string
  price: number
  image?: string
  quantity: number
  menu_item_id: string
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoadingCart, setIsLoadingCart] = useState(true)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const { fetchCart, addToCart, removeFromCart, isLoading } = useCart()
  const { user } = useAuth()

  // Load cart data on mount
  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        setIsLoadingCart(false)
        return
      }

      try {
        const cartData = await fetchCart(user.id)
        // Transform backend cart data to frontend format
        const transformedItems: CartItem[] = cartData.map((item: any) => ({
          id: item.id,
          menu_item_id: item.menu_items.id,
          title: item.menu_items.name,
          price: item.menu_items.price,
          image: item.menu_items.image_url,
          quantity: item.quantity,
        }))
        setItems(transformedItems)
      } catch (error) {
        console.error("Failed to load cart:", error)
      } finally {
        setIsLoadingCart(false)
      }
    }

    loadCart()
  }, [user, fetchCart])

  const updateQuantity = async (id: string, qty: number) => {
    if (!user) return
    
    const item = items.find(it => it.id === id)
    if (!item) return

    try {
      // Optimistically update UI
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, quantity: Math.max(1, qty) } : it)))
      
      // Update backend
      await addToCart(item.menu_item_id, user.id, Math.max(1, qty))
    } catch (error) {
      console.error("Failed to update quantity:", error)
      // Revert on error
      await fetchCart(user.id)
    }
  }

  const removeItem = async (id: string) => {
    if (!user) return
    
    const item = items.find(it => it.id === id)
    if (!item) return

    try {
      // Optimistically update UI
      setItems((prev) => prev.filter((it) => it.id !== id))
      
      // Remove from backend
      await removeFromCart(item.menu_item_id, user.id)
    } catch (error) {
      console.error("Failed to remove item:", error)
      // Reload cart on error
      const cartData = await fetchCart(user.id)
      const transformedItems: CartItem[] = cartData.map((item: any) => ({
        id: item.id,
        menu_item_id: item.menu_items.id,
        title: item.menu_items.name,
        price: item.menu_items.price,
        image: item.menu_items.image_url,
        quantity: item.quantity,
      }))
      setItems(transformedItems)
    }
  }

  const handleCheckout = async () => {
    if (!user || items.length === 0) return

    setIsCheckingOut(true)

    try {
      // Remove all items from cart
      for (const item of items) {
        await removeFromCart(item.menu_item_id, user.id)
      }

      // Clear local state
      setItems([])
      
      // Show success dialog
      setShowSuccessDialog(true)
    } catch (error) {
      console.error("Checkout failed:", error)
      alert("Checkout failed. Please try again.")
    } finally {
      setIsCheckingOut(false)
    }
  }

  const closeSuccessDialog = () => {
    setShowSuccessDialog(false)
  }

  const total = useMemo(() => items.reduce((sum, it) => sum + it.price * it.quantity, 0), [items])

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-6">Your Cart</h1>

        {!user ? (
          <div className="p-8 bg-card rounded-lg border border-border text-center">
            <p className="text-muted-foreground mb-4">Please sign in to view your cart.</p>
            <a href="/login" className="text-primary hover:underline">Go to Login</a>
          </div>
        ) : isLoadingCart ? (
          <div className="p-8 bg-card rounded-lg border border-border text-center">
            <div className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-muted-foreground">Loading your cart...</p>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 bg-card rounded-lg border border-border text-center">
            <p className="text-muted-foreground mb-4">Your cart is empty.</p>
            <p className="text-sm text-muted-foreground">Add some tasty items from recommendations!</p>
            <a href="/" className="inline-block mt-4 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
              Browse Recommendations
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border">
                  <div className="w-28 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                    <img src={item.image || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>

                    <div className="mt-3 flex items-center gap-3">
                      <label className="text-sm text-muted-foreground">Quantity</label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 bg-secondary/5 rounded-md"
                        >
                          −
                        </button>
                        <div className="px-3 py-1 border rounded-md">{item.quantity}</div>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 bg-secondary/5 rounded-md"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-6 text-sm text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-foreground">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="p-6 bg-card rounded-lg border border-border h-fit">
              <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Items</span>
                <span>{items.reduce((c, it) => c + it.quantity, 0)}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between text-2xl font-bold text-foreground mb-4">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCheckingOut ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    "Checkout"
                  )}
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Success Dialog */}
        {showSuccessDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-lg border border-border p-8 max-w-md w-full shadow-2xl">
              <div className="text-center">
                {/* Success Icon */}
                <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-2">Order Successful!</h2>
                <p className="text-muted-foreground mb-6">
                  Your order has been placed successfully. Thank you for choosing Vibe Eats!
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={closeSuccessDialog}
                    className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Continue Shopping
                  </button>
                  <a
                    href="/"
                    className="w-full px-4 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors text-center"
                  >
                    Back to Home
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
