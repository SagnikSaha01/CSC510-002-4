import { renderHook, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/contexts/auth-context'

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

// Mock user data
const mockUser = {
  id: 'test-user-id-12345',
  email: 'testuser@example.com',
  user_metadata: {
    full_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
    email: 'testuser@example.com',
  },
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
  app_metadata: {},
  role: 'authenticated',
}

// Mock session data
const mockSession = {
  access_token: 'mock-access-token-abc123',
  refresh_token: 'mock-refresh-token-xyz789',
  expires_in: 3600,
  expires_at: 1704067200,
  token_type: 'bearer',
  user: mockUser,
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

describe('AuthContext', () => {
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
  })

  describe('Initialization', () => {
    test('should initialize with null user and loading true', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      expect(result.current.loading).toBe(true)
      expect(result.current.user).toBeNull()
      expect(result.current.session).toBeNull()
    })

    test('should load existing session on mount', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toEqual(mockUser)
      expect(result.current.session).toEqual(mockSession)
      expect(mockSupabaseClient.auth.getSession).toHaveBeenCalledTimes(1)
    })

    test('should handle no existing session on mount', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toBeNull()
      expect(result.current.session).toBeNull()
    })

    test('should set up auth state change listener', () => {
      renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalledTimes(1)
      expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalledWith(
        expect.any(Function)
      )
    })

    test('should clean up subscription on unmount', () => {
      const unsubscribe = jest.fn()
      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: {
          subscription: { unsubscribe },
        },
      })

      const { unmount } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      unmount()

      expect(unsubscribe).toHaveBeenCalledTimes(1)
    })
  })

  describe('signInWithGoogle', () => {
    test('should call signInWithOAuth with correct parameters', async () => {
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: {
          url: 'https://accounts.google.com/o/oauth2/auth',
          provider: 'google',
        },
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.signInWithGoogle()
      })

      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
        },
      })
    })

    test('should handle sign in error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const errorMessage = 'OAuth provider error'

      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: null,
        error: { message: errorMessage, status: 400 },
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await expect(
        act(async () => {
          await result.current.signInWithGoogle()
        })
      ).rejects.toEqual({ message: errorMessage, status: 400 })

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error signing in with Google:',
        { message: errorMessage, status: 400 }
      )

      consoleErrorSpy.mockRestore()
    })

    test('should include redirect URL with callback path', async () => {
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'mock-url', provider: 'google' },
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.signInWithGoogle()
      })

      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: expect.stringContaining('/auth/callback'),
        },
      })
    })
  })

  describe('signOut', () => {
    test('should call supabase signOut', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.signOut()
      })

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalledTimes(1)
    })

    test('should handle sign out error', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const errorMessage = 'Failed to sign out'

      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: { message: errorMessage, status: 500 },
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await expect(
        act(async () => {
          await result.current.signOut()
        })
      ).rejects.toEqual({ message: errorMessage, status: 500 })

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error signing out:',
        { message: errorMessage, status: 500 }
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('Auth State Changes', () => {
    test('should update user and session on SIGNED_IN event', async () => {
      let authCallback: any

      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        authCallback = callback
        return {
          data: {
            subscription: { unsubscribe: jest.fn() },
          },
        }
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toBeNull()

      // Trigger auth state change
      act(() => {
        authCallback('SIGNED_IN', mockSession)
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
        expect(result.current.session).toEqual(mockSession)
      })
    })

    test('should clear user and session on SIGNED_OUT event', async () => {
      let authCallback: any

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        authCallback = callback
        return {
          data: {
            subscription: { unsubscribe: jest.fn() },
          },
        }
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      // Trigger sign out event
      act(() => {
        authCallback('SIGNED_OUT', null)
      })

      await waitFor(() => {
        expect(result.current.user).toBeNull()
        expect(result.current.session).toBeNull()
      })
    })

    test('should update loading state after auth state change', async () => {
      let authCallback: any

      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        authCallback = callback
        return {
          data: {
            subscription: { unsubscribe: jest.fn() },
          },
        }
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      act(() => {
        authCallback('TOKEN_REFRESHED', mockSession)
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('useAuth Hook', () => {
    test('should provide all required context values', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current).toHaveProperty('user')
      expect(result.current).toHaveProperty('session')
      expect(result.current).toHaveProperty('signInWithGoogle')
      expect(result.current).toHaveProperty('signOut')
      expect(result.current).toHaveProperty('loading')

      expect(typeof result.current.signInWithGoogle).toBe('function')
      expect(typeof result.current.signOut).toBe('function')
      expect(typeof result.current.loading).toBe('boolean')
    })
  })

  describe('Edge Cases', () => {
    test('should handle rapid sign in attempts', async () => {
      mockSupabaseClient.auth.signInWithOAuth.mockResolvedValue({
        data: { url: 'mock-url', provider: 'google' },
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Multiple rapid calls
      await act(async () => {
        await Promise.all([
          result.current.signInWithGoogle(),
          result.current.signInWithGoogle(),
          result.current.signInWithGoogle(),
        ])
      })

      expect(mockSupabaseClient.auth.signInWithOAuth).toHaveBeenCalledTimes(3)
    })

    test('should handle session with missing user metadata', async () => {
      const sessionWithoutMetadata = {
        ...mockSession,
        user: {
          ...mockUser,
          user_metadata: {},
        },
      }

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: sessionWithoutMetadata },
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toEqual(sessionWithoutMetadata.user)
      expect(result.current.user?.user_metadata).toEqual({})
    })

    test('should handle null session user', async () => {
      const sessionWithNullUser = {
        ...mockSession,
        user: null,
      }

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: sessionWithNullUser },
        error: null,
      })

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.user).toBeNull()
    })
  })
})
