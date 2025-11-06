"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Exchange the code for a session
        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.search.split('code=')[1]?.split('&')[0] || ''
        )

        if (error) {
          console.error('Error during authentication:', error)
          router.push('/login?error=authentication_failed')
          return
        }

        // Successfully authenticated, redirect to home
        router.push('/')
      } catch (error) {
        console.error('Error in auth callback:', error)
        router.push('/login?error=callback_failed')
      }
    }

    handleCallback()
  }, [router])

  return (
    <div data-testid="auth-callback-container" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
      <div className="text-center">
        <div 
          data-testid="loading-spinner"
          role="status"
          aria-label="Loading"
          className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"
        ></div>
        <p className="text-lg text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
