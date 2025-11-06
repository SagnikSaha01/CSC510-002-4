import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoginPage from '@/app/login/page'

// Mock the useRouter hook
const mockPush = jest.fn()
const mockGet = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => ({
    get: mockGet,
  }),
}))

// Mock the useAuth hook
const mockUseAuth = jest.fn()
jest.mock('@/contexts/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}))

// Mock the GoogleSignInButton component
jest.mock('@/components/google-sign-in-button', () => ({
  GoogleSignInButton: () => <button>Sign in with Google</button>,
}))

describe('LoginPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default mock implementation
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
    })
    mockGet.mockReturnValue(null)
  })

  // ===== Initial Rendering Tests =====

  test('1. Component renders without crashing', () => {
    render(<LoginPage />)
    expect(screen.getByText('Vibe Eats')).toBeInTheDocument()
  })

  test('2. Shows loading spinner when loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    })
    render(<LoginPage />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('animate-spin')
  })

  test('3. Displays title and subtitle', () => {
    render(<LoginPage />)
    expect(screen.getByText('Vibe Eats')).toBeInTheDocument()
    expect(screen.getByText('Discover your perfect meal match')).toBeInTheDocument()
  })

  test('4. Shows sign in section', () => {
    render(<LoginPage />)
    expect(screen.getByText('Sign in to continue')).toBeInTheDocument()
    expect(screen.getByText('Sign in with Google')).toBeInTheDocument()
  })

  test('5. Shows terms and privacy links', () => {
    render(<LoginPage />)
    expect(screen.getByText(/terms of service/i)).toBeInTheDocument()
    expect(screen.getByText(/privacy policy/i)).toBeInTheDocument()
  })

  // ===== Authentication Tests =====

  test('6. Redirects when user is authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: '123' },
      loading: false,
    })
    render(<LoginPage />)
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  test('7. Does not redirect when loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    })
    render(<LoginPage />)
    expect(mockPush).not.toHaveBeenCalled()
  })

  // ===== Error Handling Tests =====

  test('8. Shows authentication failed error', () => {
    mockGet.mockReturnValue('authentication_failed')
    render(<LoginPage />)
    expect(screen.getByText('Authentication failed. Please try again.')).toBeInTheDocument()
  })

  test('9. Shows callback error', () => {
    mockGet.mockReturnValue('callback_failed')
    render(<LoginPage />)
    expect(screen.getByText('Sign in process failed. Please try again.')).toBeInTheDocument()
  })

  test('10. Shows generic error for unknown error types', () => {
    mockGet.mockReturnValue('unknown_error')
    render(<LoginPage />)
    expect(screen.getByText('An error occurred. Please try again.')).toBeInTheDocument()
  })

  // ===== UI Tests =====

  test('11. Page has gradient background', () => {
    render(<LoginPage />)
    const mainDiv = screen.getByTestId('page-container')
    expect(mainDiv).toHaveClass('bg-gradient-to-br')
  })

  test('12. Card has proper styling', () => {
    render(<LoginPage />)
    const card = screen.getByTestId('login-card')
    expect(card).toHaveClass('bg-card', 'border', 'rounded-2xl', 'shadow-2xl')
  })

  test('13. Loading spinner has correct styling', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: true,
    })
    render(<LoginPage />)
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('animate-spin', 'border-primary')
  })
})