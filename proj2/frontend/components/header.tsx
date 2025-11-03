"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export default function Header() {
  const [count, setCount] = useState(0)

  const getCartCount = () => {
    try {
      const raw = localStorage.getItem("cart")
      if (!raw) return 0
      const items = JSON.parse(raw)
      if (!Array.isArray(items)) return 0
      return items.reduce((s: number, it: any) => s + (Number(it.quantity) || 1), 0)
    } catch (e) {
      return 0
    }
  }

  useEffect(() => {
    // initialize
    setCount(getCartCount())

    // update when other tabs/windows change localStorage
    const handler = () => setCount(getCartCount())
    window.addEventListener("storage", handler)

    // cleanup
    return () => window.removeEventListener("storage", handler)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-2xl">🍽️</span>
          <h1 className="text-xl font-bold text-foreground">Vibe Eats</h1>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/restaurant/setup"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm"
          >
            Restaurant Sign Up
          </Link>

          <Link href="/cart" className="relative inline-flex items-center px-3 py-2 rounded-lg hover:opacity-90 transition-opacity" aria-label="View cart">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 2.25h1.5l1.9 11.4a2.25 2.25 0 0 0 2.22 1.8h8.46a2.25 2.25 0 0 0 2.22-1.8l1.9-11.4h1.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-semibold leading-none text-white bg-destructive rounded-full">
                {count}
              </span>
            )}
          </Link>

          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">U</span>
          </div>
        </div>
      </div>
    </header>
  )
}
