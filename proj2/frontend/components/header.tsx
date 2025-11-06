"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Header() {
  const [count, setCount] = useState(0)
  const { user, signOut, loading } = useAuth()

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

  const getUserInitials = () => {
    if (!user?.user_metadata?.full_name) return "U"
    const names = user.user_metadata.full_name.split(" ")
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase()
    }
    return names[0][0].toUpperCase()
  }

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

          {loading ? (
            <div className="w-8 h-8 rounded-full bg-primary/10 animate-pulse"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full">
                  <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name || "User"} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-semibold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name || "User"}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/cart" className="cursor-pointer">
                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer text-destructive focus:text-destructive">
                  <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors text-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
