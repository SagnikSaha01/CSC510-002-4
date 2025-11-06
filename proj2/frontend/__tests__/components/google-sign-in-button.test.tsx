import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GoogleSignInButton } from '@/components/google-sign-in-button'
import { AuthProvider } from '@/contexts/auth-context'

// Mock the supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
}))

// Import after mocking
import { supabase } from '@/lib/supabase'
const mockSupabaseClient = supabase as jest.Mocked<typeof supabase>

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

describe('GoogleSignInButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Default mock implementations
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    })

    mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: jest.fn(),
        },
      },
    })

    mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
      data: {
        url: 'https://accounts.google.com/o/oauth2/auth',
        provider: 'google',
      },
      error: null,
    })
  })

  const renderButton = () => {
    return render(
      <AuthProvider>
        <GoogleSignInButton />
      </AuthProvider>
    )
  }

  describe('Rendering', () => {
    test('should render the button with correct text', () => {
      renderButton()

      const button = screen.getByRole('button', { name: /continue with google/i })
      expect(button).toBeInTheDocument()
    })

    test('should display Google logo SVG', () => {
      renderButton()

      const button = screen.getByRole('button')
      const svg = button.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    test('should have correct CSS classes', () => {
      renderButton()

      const button = screen.getByRole('button')
      expect(button).toHaveClass('w-full')
      expect(button).toHaveClass('bg-white')
      expect(button).toHaveClass('hover:bg-gray-50')
    })

    test('should be enabled initially', () => {
      renderButton()

      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })
  })

  describe('User Interaction', () => {
    test('should call signInWithGoogle when clicked', async () => {
      const user = userEvent.setup()
      renderButton()

      const button = screen.getByRole('button', { name: /continue with google/i })
      await user.click(button)

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledTimes(1)
      })
    })

    test('should show loading state when signing in', async () => {
      const user = userEvent.setup()

      // Make signInWithOAuth take some time
      mockSupabaseClient.auth.signInWithOAuth.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          data: { url: 'mock-url', provider: 'google' },
          error: null,
        }), 100))
      )

      renderButton()

      const button = screen.getByRole('button', { name: /continue with google/i })
      await user.click(button)

      // Check loading state
      expect(screen.getByText(/signing in/i)).toBeInTheDocument()
      expect(button).toBeDisabled()

      // Wait for loading to finish
      await waitFor(() => {
        expect(button).not.toBeDisabled()
      }, { timeout: 200 })
    })

    test('should display loading spinner during sign in', async () => {
      const user = userEvent.setup()

      mockSupabaseClient.auth.signInWithOAuth.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          data: { url: 'mock-url', provider: 'google' },
          error: null,
        }), 100))
      )

      renderButton()

      const button = screen.getByRole('button')
      await user.click(button)

      // Check for loading spinner (it has animate-spin class)
      const spinner = button.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()

      await waitFor(() => {
        expect(button.querySelector('.animate-spin')).not.toBeInTheDocument()
      }, { timeout: 200 })
    })

    test('should be disabled during loading', async () => {
      const user = userEvent.setup()

      mockSupabaseClient.auth.signInWithOAuth.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          data: { url: 'mock-url', provider: 'google' },
          error: null,
        }), 100))
      )

      renderButton()

      const button = screen.getByRole('button')
      await user.click(button)

      expect(button).toBeDisabled()

      await waitFor(() => {
        expect(button).not.toBeDisabled()
      }, { timeout: 200 })
    })

    test('should prevent multiple clicks during loading', async () => {
      const user = userEvent.setup()

      mockSupabaseClient.auth.signInWithOAuth.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          data: { url: 'mock-url', provider: 'google' },
          error: null,
        }), 100))
      )

      renderButton()

      const button = screen.getByRole('button')

      // Try to click multiple times rapidly
      await user.click(button)
      await user.click(button)
      await user.click(button)

      // Should only be called once because button is disabled after first click
      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledTimes(1)

      await waitFor(() => {
        expect(button).not.toBeDisabled()
      }, { timeout: 200 })
    })
  })

  describe('Error Handling', () => {
    test('should handle sign in error gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const user = userEvent.setup()

      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: { message: 'OAuth error', status: 400 },
      })

      renderButton()

      const button = screen.getByRole('button')
      await user.click(button)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled()
      })

      // Button should be re-enabled after error
      expect(button).not.toBeDisabled()
      expect(screen.getByText(/continue with google/i)).toBeInTheDocument()

      consoleErrorSpy.mockRestore()
    })

    test('should log error to console on failure', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const user = userEvent.setup()
      const error = new Error('Network error')

      mockSupabaseClient.auth.signInWithOAuth.mockRejectedValue(error)

      renderButton()

      const button = screen.getByRole('button')
      await user.click(button)

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to sign in:', error)
      })

      consoleErrorSpy.mockRestore()
    })

    test('should reset loading state after error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const user = userEvent.setup()

      mockSupabaseClient.auth.signInWithOAuth.mockRejectedValue(
        new Error('Failed')
      )

      renderButton()

      const button = screen.getByRole('button')
      await user.click(button)

      await waitFor(() => {
        expect(button).not.toBeDisabled()
      })

      expect(screen.getByText(/continue with google/i)).toBeInTheDocument()

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Accessibility', () => {
    test('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      renderButton()

      const button = screen.getByRole('button')

      // Focus and activate with keyboard
      button.focus()
      expect(button).toHaveFocus()

      await user.keyboard('{Enter}')

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalled()
      })
    })

    test('should have proper button role', () => {
      renderButton()

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    test('should maintain disabled state for accessibility during loading', async () => {
      const user = userEvent.setup()

      mockSupabaseClient.auth.signInWithOAuth.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          data: { url: 'mock-url', provider: 'google' },
          error: null,
        }), 100))
      )

      renderButton()

      const button = screen.getByRole('button')
      await user.click(button)

      expect(button).toHaveAttribute('disabled')

      await waitFor(() => {
        expect(button).not.toHaveAttribute('disabled')
      }, { timeout: 200 })
    })
  })

  describe('Visual States', () => {
    test('should display "Continue with Google" text in default state', () => {
      renderButton()

      expect(screen.getByText(/continue with google/i)).toBeInTheDocument()
    })

    test('should display "Signing in..." text in loading state', async () => {
      const user = userEvent.setup()

      mockSupabaseClient.auth.signInWithOAuth.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          data: { url: 'mock-url', provider: 'google' },
          error: null,
        }), 100))
      )

      renderButton()

      const button = screen.getByRole('button')
      await user.click(button)

      expect(screen.getByText(/signing in/i)).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument()
      }, { timeout: 200 })
    })

    test('should show Google logo in both states', async () => {
      const user = userEvent.setup()

      mockSupabaseClient.auth.signInWithOAuth.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          data: { url: 'mock-url', provider: 'google' },
          error: null,
        }), 100))
      )

      renderButton()

      const button = screen.getByRole('button')

      // Check initial state has SVG
      expect(button.querySelector('svg')).toBeInTheDocument()

      await user.click(button)

      // Check loading state has SVG (spinner)
      expect(button.querySelector('svg')).toBeInTheDocument()

      await waitFor(() => {
        expect(button).not.toBeDisabled()
      }, { timeout: 200 })
    })
  })

  describe('Integration with AuthContext', () => {
    test('should use signInWithGoogle from auth context', async () => {
      const user = userEvent.setup()
      renderButton()

      const button = screen.getByRole('button')
      await user.click(button)

      await waitFor(() => {
        expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            redirectTo: expect.stringContaining('/auth/callback'),
          },
        })
      })
    })
  })
})
