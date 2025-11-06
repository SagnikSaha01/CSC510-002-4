import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { supabase } from '@/lib/supabase'
import AuthCallback from '@/app/auth/callback/page'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => new URLSearchParams('code=test_code'),
}))

// Mock supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      exchangeCodeForSession: jest.fn(),
    },
  },
}))

describe('AuthCallback Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('1. Component renders loading state', () => {
    render(<AuthCallback />)
    expect(screen.getByText('Completing sign in...')).toBeInTheDocument()
  })

  test('2. Loading spinner is present', () => {
    render(<AuthCallback />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('animate-spin')
  })

  test('3. Loading text has correct styling', () => {
    render(<AuthCallback />)
    const text = screen.getByText('Completing sign in...')
    expect(text).toHaveClass('text-lg', 'text-muted-foreground')
  })

  test('4. Container has gradient background', () => {
    render(<AuthCallback />)
    const container = screen.getByTestId('auth-callback-container')
    expect(container).toHaveClass('bg-gradient-to-br')
  })

  test('5. Content is centered', () => {
    render(<AuthCallback />)
    const container = screen.getByTestId('auth-callback-container')
    expect(container).toHaveClass('flex', 'items-center', 'justify-center')
  })

  test('6. Loading spinner has correct styling', () => {
    render(<AuthCallback />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('rounded-full', 'h-12', 'w-12', 'border-b-2', 'border-primary')
  })

  test('7. Loading spinner is accessible', () => {
    render(<AuthCallback />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveAttribute('role', 'status')
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
  })

  test('8. Page has proper semantic structure', () => {
    render(<AuthCallback />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByText('Completing sign in...')).toBeInTheDocument()
  })
})