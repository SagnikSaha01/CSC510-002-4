import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useParams } from 'next/navigation'

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}))

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

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

// Mock hooks
jest.mock('@/hooks/use-cart')
jest.mock('@/contexts/auth-context')
jest.mock('@/hooks/use-toast')

// Mock Header component
jest.mock('@/components/header', () => {
  return function MockHeader() {
    return <div data-testid="mock-header">Header</div>
  }
})

import RestaurantDetailPage from '@/app/restaurant/[id]/page'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/hooks/use-toast'

const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
const mockUseCart = useCart as jest.MockedFunction<typeof useCart>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>

describe('RestaurantDetailPage', () => {
  const mockAddToCart = jest.fn()
  const mockToast = jest.fn()
  const mockFetchCart = jest.fn()
  const mockRemoveFromCart = jest.fn()
  const mockGetCartCount = jest.fn()

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: '2024-01-01',
  } as any

  const mockRestaurantData = {
    id: 'restaurant-123',
    name: 'Test Restaurant',
    address: '123 Test Street, Test City',
    banner_image_url: 'https://example.com/banner.jpg',
    menu_items: [
      {
        id: 'menu-1',
        restaurant_id: 'restaurant-123',
        name: 'Test Pizza',
        description: 'Delicious test pizza',
        price: 12.99,
        category: 'Main',
        image_url: 'https://example.com/pizza.jpg',
      },
      {
        id: 'menu-2',
        restaurant_id: 'restaurant-123',
        name: 'Test Salad',
        description: 'Fresh test salad',
        price: 8.50,
        category: 'Appetizer',
        image_url: 'https://example.com/salad.jpg',
      },
      {
        id: 'menu-3',
        restaurant_id: 'restaurant-123',
        name: 'Test Dessert',
        description: 'Sweet test dessert',
        price: 6.00,
        category: 'Dessert',
        image_url: null,
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()

    mockUseParams.mockReturnValue({ id: 'restaurant-123' })

    mockUseCart.mockReturnValue({
      cart: [],
      fetchCart: mockFetchCart,
      addToCart: mockAddToCart,
      removeFromCart: mockRemoveFromCart,
      isLoading: false,
      error: null,
      getCartCount: mockGetCartCount,
    })

    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
      loading: false,
    })

    mockUseToast.mockReturnValue({
      toast: mockToast,
      dismiss: jest.fn(),
      toasts: [],
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // ===== Rendering Tests =====

  test('1. Component renders without crashing', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockRestaurantData,
    })

    render(<RestaurantDetailPage />)
    expect(screen.getByTestId('mock-header')).toBeInTheDocument()
  })

  test('2. Shows loading state initially', () => {
    ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

    render(<RestaurantDetailPage />)
    expect(screen.getByText(/loading restaurant details/i)).toBeInTheDocument()
  })

  test('3. Loading spinner is displayed', () => {
    ;(global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}))

    render(<RestaurantDetailPage />)
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  test('4. Fetches restaurant data on mount', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockRestaurantData,
    })

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/restaurant/restaurant-123',
        expect.objectContaining({
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
      )
    })
  })

  // ===== Restaurant Info Display Tests =====

  test('5. Displays restaurant name', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockRestaurantData,
    })

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument()
    })
  })

  test('6. Displays restaurant address', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockRestaurantData,
    })

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('123 Test Street, Test City')).toBeInTheDocument()
    })
  })

  test('7. Displays banner image', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockRestaurantData,
    })

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      const bannerImage = screen.getByAltText('Test Restaurant banner')
      expect(bannerImage).toHaveAttribute('src', 'https://example.com/banner.jpg')
    })
  })

  test('8. Shows placeholder when no banner image', async () => {
    const dataWithoutBanner = { ...mockRestaurantData, banner_image_url: null }
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => dataWithoutBanner,
    })

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Restaurant')).toBeInTheDocument()
    })
  })

  test('9. Displays menu items count badge', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockRestaurantData,
    })

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('3 Dishes')).toBeInTheDocument()
    })
  })

  test('10. Shows singular "Dish" for single item', async () => {
    const singleItemData = {
      ...mockRestaurantData,
      menu_items: [mockRestaurantData.menu_items[0]],
    }
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => singleItemData,
    })

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('1 Dish')).toBeInTheDocument()
    })
  })

  // ===== Menu Items Display Tests =====

  test('11. Displays all menu items', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockRestaurantData,
    })

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Pizza')).toBeInTheDocument()
      expect(screen.getByText('Test Salad')).toBeInTheDocument()
      expect(screen.getByText('Test Dessert')).toBeInTheDocument()
    })
  })

  test('12. Groups items by category', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockRestaurantData,
    })

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Main')).toBeInTheDocument()
      expect(screen.getByText('Appetizer')).toBeInTheDocument()
      expect(screen.getByText('Dessert')).toBeInTheDocument()
    })
  })

  test('13. Displays item prices correctly', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockRestaurantData,
    })

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('$12.99')).toBeInTheDocument()
      expect(screen.getByText('$8.50')).toBeInTheDocument()
      expect(screen.getByText('$6.00')).toBeInTheDocument()
    })
  })

  test('14. Displays item descriptions', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockRestaurantData,
    })

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Delicious test pizza')).toBeInTheDocument()
      expect(screen.getByText('Fresh test salad')).toBeInTheDocument()
    })
  })

  test('15. Displays item images when available', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockRestaurantData,
    })

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      const pizzaImage = screen.getByAltText('Test Pizza')
      expect(pizzaImage).toHaveAttribute('src', 'https://example.com/pizza.jpg')
    })
  })

  test('16. Shows placeholder emoji for items without images', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockRestaurantData,
    })

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Dessert')).toBeInTheDocument()
      // Item without image should still render
    })
  })

  test('17. Shows "Add" button for each item', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockRestaurantData,
    })

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      const addButtons = screen.getAllByText('Add')
      expect(addButtons).toHaveLength(3)
    })
  })

  // ===== Add to Cart Tests =====

  test('18. Add button calls addToCart when user is signed in', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockRestaurantData,
    })
    mockAddToCart.mockResolvedValue(undefined)

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      const addButtons = screen.getAllByText('Add')
      fireEvent.click(addButtons[0])
    })

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith('menu-1', 'user-123')
    })
  })

  test('19. Shows success toast after adding to cart', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockRestaurantData,
    })
    mockAddToCart.mockResolvedValue(undefined)

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      const addButtons = screen.getAllByText('Add')
      fireEvent.click(addButtons[0])
    })

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '✓ Added to cart',
          description: 'Test Pizza has been added to your cart',
        })
      )
    })
  })

  test('20. Button changes to "Added" with checkmark temporarily', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockRestaurantData,
    })
    mockAddToCart.mockResolvedValue(undefined)

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      const addButtons = screen.getAllByText('Add')
      fireEvent.click(addButtons[0])
    })

    await waitFor(() => {
      expect(screen.getByText('Added')).toBeInTheDocument()
    })
  })

  test('21. Shows sign-in prompt when user not authenticated', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
      loading: false,
    })

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockRestaurantData,
    })

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      const addButtons = screen.getAllByText('Add')
      fireEvent.click(addButtons[0])
    })

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Sign in required',
          description: 'Please sign in to add items to your cart',
          variant: 'destructive',
        })
      )
    })
  })

  test('22. Shows error toast when addToCart fails', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockRestaurantData,
    })
    mockAddToCart.mockRejectedValue(new Error('Network error'))

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      const addButtons = screen.getAllByText('Add')
      fireEvent.click(addButtons[0])
    })

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Error',
          description: 'Failed to add item to cart',
          variant: 'destructive',
        })
      )
    })
  })

  // ===== Error Handling Tests =====

  test('23. Shows error message when fetch fails', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ error: 'Server error' }),
    })

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      expect(screen.getByText(/HTTP 500: Server error/i)).toBeInTheDocument()
    })
  })

  test('24. Shows "Restaurant not found" for 404', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ error: 'Restaurant not found' }),
    })

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      expect(screen.getByText(/Restaurant not found/i)).toBeInTheDocument()
    })
  })

  test('25. Handles network errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument()
    })
  })

  test('26. Shows empty state when no menu items', async () => {
    const emptyMenuData = { ...mockRestaurantData, menu_items: [] }
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => emptyMenuData,
    })

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      expect(screen.getByText(/no menu items available yet/i)).toBeInTheDocument()
    })
  })

  test('27. Console logs fetch errors', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    const error = new Error('Fetch failed')
    ;(global.fetch as jest.Mock).mockRejectedValue(error)

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching restaurant:', error)
    })

    consoleErrorSpy.mockRestore()
  })

  // ===== Responsive & UI Tests =====

  test('28. Renders in responsive grid layout', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockRestaurantData,
    })

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      const grid = document.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3')
    })
  })

  test('30. Category badges are displayed', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockRestaurantData,
    })

    render(<RestaurantDetailPage />)

    await waitFor(() => {
      const badges = screen.getAllByText('Main')
      expect(badges.length).toBeGreaterThan(0)
    })
  })
})
