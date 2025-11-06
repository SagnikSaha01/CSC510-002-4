import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import Header from '@/components/header'

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>
})

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}))

// Mock Auth Context
jest.mock('@/contexts/auth-context')

import { useAuth } from '@/contexts/auth-context'

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('Header Component', () => {
  const mockSignOut = jest.fn()

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    user_metadata: {
      full_name: 'John Doe',
      avatar_url: 'https://example.com/avatar.jpg',
    },
    aud: 'authenticated',
    role: 'authenticated',
    created_at: '2024-01-01',
  } as any

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()

    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      signInWithGoogle: jest.fn(),
      signOut: mockSignOut,
      loading: false,
    })
  })

  afterEach(() => {
    localStorage.clear()
  })

  // ===== Basic Rendering Tests =====

  test('1. Renders without crashing', () => {
    render(<Header />)
    expect(screen.getByText('Vibe Eats')).toBeInTheDocument()
  })

  test('2. Displays logo text', () => {
    render(<Header />)
    expect(screen.getByText('Vibe Eats')).toBeInTheDocument()
  })

  test('3. Displays logo emoji', () => {
    render(<Header />)
    expect(screen.getByText('🍽️')).toBeInTheDocument()
  })

  test('4. Logo links to home page', () => {
    render(<Header />)
    const logo = screen.getByText('Vibe Eats').closest('a')
    expect(logo).toHaveAttribute('href', '/')
  })

  test('5. Shows Restaurant Sign Up button', () => {
    render(<Header />)
    expect(screen.getByText('Restaurant Sign Up')).toBeInTheDocument()
  })

  test('6. Restaurant Sign Up links to correct page', () => {
    render(<Header />)
    const link = screen.getByText('Restaurant Sign Up').closest('a')
    expect(link).toHaveAttribute('href', '/restaurant/setup')
  })

  test('7. Shows cart icon', () => {
    render(<Header />)
    const cartLinks = screen.getAllByRole('link')
    const cartLink = cartLinks.find(link => link.getAttribute('href') === '/cart')
    expect(cartLink).toBeInTheDocument()
  })

  test('8. Cart icon links to cart page', () => {
    render(<Header />)
    const cartLinks = screen.getAllByRole('link')
    const cartLink = cartLinks.find(link => link.getAttribute('href') === '/cart')
    expect(cartLink).toHaveAttribute('href', '/cart')
  })

  // ===== Cart Count Tests =====

  test('9. Does not show count badge when cart is empty', () => {
    render(<Header />)
    const badge = screen.queryByText(/^\d+$/)
    expect(badge).not.toBeInTheDocument()
  })

  test('10. Shows cart count from localStorage', () => {
    localStorage.setItem('cart', JSON.stringify([
      { id: 1, quantity: 2 },
      { id: 2, quantity: 3 },
    ]))

    render(<Header />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  test('11. Updates count on localStorage change', () => {
    render(<Header />)

    // Simulate storage event from another tab
    localStorage.setItem('cart', JSON.stringify([
      { id: 1, quantity: 1 },
    ]))
    fireEvent(window, new Event('storage'))

    waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  test('12. Handles invalid cart data gracefully', () => {
    localStorage.setItem('cart', 'invalid json')

    render(<Header />)
    const badge = screen.queryByText(/^\d+$/)
    expect(badge).not.toBeInTheDocument()
  })

  test('13. Handles non-array cart data', () => {
    localStorage.setItem('cart', JSON.stringify({ not: 'an array' }))

    render(<Header />)
    const badge = screen.queryByText(/^\d+$/)
    expect(badge).not.toBeInTheDocument()
  })

  test('14. Calculates total quantity correctly', () => {
    localStorage.setItem('cart', JSON.stringify([
      { id: 1, quantity: 5 },
      { id: 2, quantity: 3 },
      { id: 3, quantity: 2 },
    ]))

    render(<Header />)
    expect(screen.getByText('10')).toBeInTheDocument()
  })

  test('15. Handles missing quantity field', () => {
    localStorage.setItem('cart', JSON.stringify([
      { id: 1 }, // no quantity field
      { id: 2, quantity: 2 },
    ]))

    render(<Header />)
    expect(screen.getByText('3')).toBeInTheDocument() // 1 (default) + 2
  })

  // ===== Authentication States Tests =====

  test('16. Shows Sign In button when not authenticated', () => {
    render(<Header />)
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  test('17. Sign In button links to login page', () => {
    render(<Header />)
    const link = screen.getByText('Sign In').closest('a')
    expect(link).toHaveAttribute('href', '/login')
  })

  test('18. Shows loading state when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      signInWithGoogle: jest.fn(),
      signOut: mockSignOut,
      loading: true,
    })

    render(<Header />)
    const loader = document.querySelector('.animate-pulse')
    expect(loader).toBeInTheDocument()
  })

  test('19. Shows user avatar when authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      signInWithGoogle: jest.fn(),
      signOut: mockSignOut,
      loading: false,
    })

    render(<Header />)
    const avatar = screen.getByAltText('John Doe')
    expect(avatar).toBeInTheDocument()
  })

  test('20. Avatar displays user image', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      signInWithGoogle: jest.fn(),
      signOut: mockSignOut,
      loading: false,
    })

    render(<Header />)
    const avatar = screen.getByAltText('John Doe')
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg')
  })

  test('21. Shows user initials as fallback', () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      signInWithGoogle: jest.fn(),
      signOut: mockSignOut,
      loading: false,
    })

    render(<Header />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  test('22. Handles single name for initials', () => {
    const singleNameUser = {
      ...mockUser,
      user_metadata: { full_name: 'John' },
    }

    mockUseAuth.mockReturnValue({
      user: singleNameUser,
      session: null,
      signInWithGoogle: jest.fn(),
      signOut: mockSignOut,
      loading: false,
    })

    render(<Header />)
    expect(screen.getByText('J')).toBeInTheDocument()
  })

  test('23. Shows "U" when no full name', () => {
    const noNameUser = {
      ...mockUser,
      user_metadata: {},
    }

    mockUseAuth.mockReturnValue({
      user: noNameUser,
      session: null,
      signInWithGoogle: jest.fn(),
      signOut: mockSignOut,
      loading: false,
    })

    render(<Header />)
    expect(screen.getByText('U')).toBeInTheDocument()
  })

  // ===== Dropdown Menu Tests =====

  test('24. Opens dropdown on avatar click', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      signInWithGoogle: jest.fn(),
      signOut: mockSignOut,
      loading: false,
    })

    render(<Header />)
    const avatarButton = screen.getByRole('button')
    fireEvent.click(avatarButton)

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  test('25. Dropdown shows user email', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      signInWithGoogle: jest.fn(),
      signOut: mockSignOut,
      loading: false,
    })

    render(<Header />)
    const avatarButton = screen.getByRole('button')
    fireEvent.click(avatarButton)

    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument()
    })
  })

  test('26. Dropdown has My Orders link', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      signInWithGoogle: jest.fn(),
      signOut: mockSignOut,
      loading: false,
    })

    render(<Header />)
    const avatarButton = screen.getByRole('button')
    fireEvent.click(avatarButton)

    await waitFor(() => {
      expect(screen.getByText('My Orders')).toBeInTheDocument()
    })
  })

  test('27. My Orders links to cart page', async () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      signInWithGoogle: jest.fn(),
      signOut: mockSignOut,
      loading: false,
    })

    render(<Header />)
    const avatarButton = screen.getByRole('button')
    fireEvent.click(avatarButton)

    await waitFor(() => {
      const link = screen.getByText('My Orders').closest('a')
      expect(link).toHaveAttribute('href', '/cart')
    })
  })

  // ===== Cleanup Tests =====

  test('31. Cleans up storage event listener on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
    const { unmount } = render(<Header />)

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function))
    removeEventListenerSpy.mockRestore()
  })

  // ===== Styling Tests =====

  test('32. Header has sticky positioning', () => {
    render(<Header />)
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('sticky', 'top-0')
  })

  test('33. Header has backdrop blur', () => {
    render(<Header />)
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('backdrop-blur-md')
  })
})
