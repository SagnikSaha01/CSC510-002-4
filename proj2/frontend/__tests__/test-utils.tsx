import { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Mock Supabase client
export const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
    signInWithOAuth: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
}

// Mock user data
export const mockUser = {
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
export const mockSession = {
  access_token: 'mock-access-token-abc123',
  refresh_token: 'mock-refresh-token-xyz789',
  expires_in: 3600,
  expires_at: 1704067200,
  token_type: 'bearer',
  user: mockUser,
}

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { ...options })

export * from '@testing-library/react'
export { customRender as render }
