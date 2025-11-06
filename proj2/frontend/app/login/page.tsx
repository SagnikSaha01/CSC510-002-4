"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { GoogleSignInButton } from '@/components/google-sign-in-button'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  useEffect(() => {
    if (!loading && user) {
      router.push('/')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div data-testid="page-container" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
        <div data-testid="loading-spinner" className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div data-testid="page-container" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 px-4">
      <div className="w-full max-w-md">
        <div data-testid="login-card" className="bg-card border border-border rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Logo/Brand Section */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold text-foreground">Vibe Eats</h1>
            <p className="text-muted-foreground text-sm">
              Discover your perfect meal match
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {error === 'authentication_failed' && 'Authentication failed. Please try again.'}
              {error === 'callback_failed' && 'Sign in process failed. Please try again.'}
              {!['authentication_failed', 'callback_failed'].includes(error) && 'An error occurred. Please try again.'}
            </div>
          )}

          {/* Sign In Section */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">Sign in to continue</span>
              </div>
            </div>

            <GoogleSignInButton />
          </div>

          {/* Footer Text */}
          <div className="text-center text-xs text-muted-foreground pt-4">
            <p>
              By signing in, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            New to Vibe Eats? Signing in with Google will create an account for you.
          </p>
        </div>
      </div>
    </div>
  )
}
