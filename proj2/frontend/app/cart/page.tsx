"use client"

import { useState, useMemo } from "react"
import Header from "@/components/header"

interface CartItem {
  id: number
  title: string
  price: number
  image?: string
  quantity: number
}

const mockCart: CartItem[] = [
  { id: 1, title: "Mediterranean Bowl", price: 12.99, image: "/mediterranean-bowl-healthy-food.jpg", quantity: 1 },
  { id: 2, title: "Gourmet Burger", price: 15.99, image: "/gourmet-burger.jpg", quantity: 2 },
  { id: 3, title: "Sushi Platter", price: 18.99, image: "/sushi-platter.jpg", quantity: 1 },
]

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(mockCart)

  const updateQuantity = (id: number, qty: number) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, quantity: Math.max(1, qty) } : it)))
  }

  const removeItem = (id: number) => setItems((prev) => prev.filter((it) => it.id !== id))

  const total = useMemo(() => items.reduce((sum, it) => sum + it.price * it.quantity, 0), [items])

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-6">Your Cart</h1>

        {items.length === 0 ? (
          <div className="p-8 bg-card rounded-lg border border-border text-center">
            <p className="text-muted-foreground mb-4">Your cart is empty.</p>
            <p className="text-sm text-muted-foreground">Add some tasty items from recommendations!</p>
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

                <button className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                  Checkout
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  )
}
