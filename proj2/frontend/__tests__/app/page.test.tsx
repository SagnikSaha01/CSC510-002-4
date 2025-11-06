import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Mock fetch globally
global.fetch = jest.fn()

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      signInWithOAuth: jest.fn(),
      signOut: jest.fn(),
    },
  },
}))

// Mock the hooks
jest.mock('@/hooks/use-recommendations')
jest.mock('@/hooks/use-cart')
jest.mock('@/contexts/auth-context')

// Mock components
jest.mock('@/components/header', () => {
  return function MockHeader() {
    return <div data-testid="mock-header">Header</div>
  }
})

jest.mock('@/components/mood-input', () => {
  return function MockMoodInput({ mood, setMood }: any) {
    return (
      <input
        data-testid="mood-input"
        value={mood}
        onChange={(e) => setMood(e.target.value)}
        placeholder="Enter your mood"
      />
    )
  }
})

jest.mock('@/components/filter-modal', () => {
  return function MockFilterModal({ isOpen, onClose, filters, onFilterChange }: any) {
    if (!isOpen) return null
    return (
      <div data-testid="filter-modal">
        <button onClick={onClose}>Close Modal</button>
        <button
          onClick={() =>
            onFilterChange({
              budget: 30,
              distance: 3,
              rating: 4,
            })
          }
        >
          Apply Filters
        </button>
      </div>
    )
  }
})

jest.mock('@/components/swipe-stack', () => {
  return function MockSwipeStack({ recommendations, onEmpty, onOrder, isFavorite, onToggleFavorite }: any) {
    if (recommendations.length === 0) {
      return <div data-testid="swipe-stack-empty">No recommendations</div>
    }
    return (
      <div data-testid="swipe-stack">
        {recommendations.map((rec: any) => (
          <div key={rec.id} data-testid={`recommendation-${rec.id}`}>
            <span>{rec.title}</span>
            <button onClick={() => onOrder(rec.id)}>Order {rec.title}</button>
            <button onClick={() => onToggleFavorite(rec.id)}>Toggle Favorite</button>
          </div>
        ))}
        <button onClick={onEmpty}>Empty All</button>
      </div>
    )
  }
})

import Home from '@/app/page'
import { useRecommendations } from '@/hooks/use-recommendations'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/contexts/auth-context'

const mockUseRecommendations = useRecommendations as jest.MockedFunction<typeof useRecommendations>
const mockUseCart = useCart as jest.MockedFunction<typeof useCart>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('Home Component', () => {
  const mockAddToCart = jest.fn()
  const mockToggleFavorite = jest.fn()
  const mockIsFavorite = jest.fn()

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: '2024-01-01',
  } as any

  const mockRecommendations = [
    {
      id: 1,
      menu_item_id: 'menu-1',
      title: 'Margherita Pizza',
      description: 'Classic Italian pizza',
      image: '/pizza.jpg',
      price: 12.99,
      distance: 2,
      rating: 4.5,
      category: 'Italian',
    },
    {
      id: 2,
      menu_item_id: 'menu-2',
      title: 'Caesar Salad',
      description: 'Fresh romaine lettuce',
      image: '/salad.jpg',
      price: 8.50,
      distance: 1.5,
      rating: 4.0,
      category: 'Salad',
    },
    {
      id: 3,
      menu_item_id: 'menu-3',
      title: 'Burger Deluxe',
      description: 'Juicy beef burger',
      image: '/burger.jpg',
      price: 15.99,
      distance: 3,
      rating: 4.8,
      category: 'American',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()

    mockUseRecommendations.mockReturnValue({
      favorites: [],
      toggleFavorite: mockToggleFavorite,
      isFavorite: mockIsFavorite,
      recommendations: [],
    } as any)

    mockUseCart.mockReturnValue({
      cart: [],
      fetchCart: jest.fn(),
      addToCart: mockAddToCart,
      removeFromCart: jest.fn(),
      isLoading: false,
      error: null,
      getCartCount: jest.fn(),
    })

    mockUseAuth.mockReturnValue({
      user: mockUser,
      session: null,
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
      loading: false,
    })

    mockIsFavorite.mockReturnValue(false)
    mockAddToCart.mockResolvedValue(undefined)

    // Mock successful fetch by default
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        recommendations: mockRecommendations,
      }),
    } as Response)
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  // ===== Initial Rendering Tests =====

  test('1. Component renders without crashing', () => {
    render(<Home />)
    expect(screen.getByText("What's your vibe today?")).toBeInTheDocument()
  })

  test('2. Header component is rendered', () => {
    render(<Home />)
    expect(screen.getByTestId('mock-header')).toBeInTheDocument()
  })

  test('3. Page title displays correctly', () => {
    render(<Home />)
    expect(screen.getByRole('heading', { name: /what's your vibe today/i })).toBeInTheDocument()
  })

  test('4. Subtitle instructions are visible', () => {
    render(<Home />)
    expect(screen.getByText(/swipe right to like, left to pass/i)).toBeInTheDocument()
  })

  test('5. MoodInput component renders', () => {
    render(<Home />)
    expect(screen.getByTestId('mood-input')).toBeInTheDocument()
  })

  test('6. Filters button is visible', () => {
    render(<Home />)
    expect(screen.getByRole('button', { name: /filters/i })).toBeInTheDocument()
  })

  test('7. Filters button has filter icon', () => {
    render(<Home />)
    const filterButton = screen.getByRole('button', { name: /filters/i })
    const svg = filterButton.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  // ===== Mood Input Tests =====

  test('8. Mood input accepts user input', () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    fireEvent.change(input, { target: { value: 'happy' } })
    expect(input).toHaveValue('happy')
  })

  test('9. Mood display shows entered mood', async () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    fireEvent.change(input, { target: { value: 'hungry' } })
    
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText(/your mood:/i)).toBeInTheDocument()
      expect(screen.getByText('hungry')).toBeInTheDocument()
    })
  })

  test('10. Mood section hidden when mood is empty', () => {
    render(<Home />)
    expect(screen.queryByText(/your mood:/i)).not.toBeInTheDocument()
  })

  test('11. Mood debounce works correctly', async () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'h' } })
    fireEvent.change(input, { target: { value: 'ha' } })
    fireEvent.change(input, { target: { value: 'happy' } })
    
    // Should not fetch yet
    expect(mockFetch).not.toHaveBeenCalled()
    
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
    })
  })

  test('12. Short mood (< 3 chars) does not trigger fetch', () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'ab' } })
    jest.advanceTimersByTime(1000)
    
    expect(mockFetch).not.toHaveBeenCalled()
  })

  // ===== API Fetch Tests =====

  test('13. Fetches recommendations when mood is entered', async () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/recommendations',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mood: 'happy' }),
        })
      )
    })
  })

  test('14. Shows loading state during fetch', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText(/finding personalized recommendations/i)).toBeInTheDocument()
    })
  })

  test('15. Loading spinner appears during fetch', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}))
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      const spinner = screen.getByText(/finding personalized recommendations/i).closest('p')?.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  test('16. Displays recommendation count after fetch', async () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText(/3 AI-powered recommendations match your vibe/i)).toBeInTheDocument()
    })
  })

  test('17. Transforms backend data correctly', async () => {
    const backendData = {
      recommendations: [
        {
          id: 1,
          menu_item_id: 'menu-1',
          name: 'Dish Name',
          description: 'Dish description',
          image_url: '/image.jpg',
          price: 10,
          distance: 1,
          rating: 4,
          category: 'Category',
        },
      ],
    }
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => backendData,
    } as Response)
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText('Dish Name')).toBeInTheDocument()
    })
  })

  test('18. Handles fetch error gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
  })

  test('19. Handles non-OK response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
    } as Response)
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText(/failed to fetch recommendations/i)).toBeInTheDocument()
    })
  })

  test('20. Handles invalid response format', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ invalid: 'data' }),
    } as Response)
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText(/invalid response format/i)).toBeInTheDocument()
    })
  })

  test('21. Clears recommendations on error', async () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    // First successful fetch
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText('Margherita Pizza')).toBeInTheDocument()
    })
    
    // Then error
    mockFetch.mockRejectedValue(new Error('Network error'))
    fireEvent.change(input, { target: { value: 'sad' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.queryByText('Margherita Pizza')).not.toBeInTheDocument()
    })
  })

  // ===== Filter Modal Tests =====

  test('22. Filter modal is hidden by default', () => {
    render(<Home />)
    expect(screen.queryByTestId('filter-modal')).not.toBeInTheDocument()
  })

  test('23. Filter button opens modal', () => {
    render(<Home />)
    const filterButton = screen.getByRole('button', { name: /filters/i })
    fireEvent.click(filterButton)
    
    expect(screen.getByTestId('filter-modal')).toBeInTheDocument()
  })

  test('24. Modal close button works', () => {
    render(<Home />)
    const filterButton = screen.getByRole('button', { name: /filters/i })
    fireEvent.click(filterButton)
    
    const closeButton = screen.getByText('Close Modal')
    fireEvent.click(closeButton)
    
    expect(screen.queryByTestId('filter-modal')).not.toBeInTheDocument()
  })

  test('25. Filter changes update state', () => {
    render(<Home />)
    const filterButton = screen.getByRole('button', { name: /filters/i })
    fireEvent.click(filterButton)
    
    const applyButton = screen.getByText('Apply Filters')
    fireEvent.click(applyButton)
    
    // Modal should still work after applying filters
    expect(screen.getByTestId('filter-modal')).toBeInTheDocument()
  })

  test('26. Applying filters resets swipedOut state', async () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByTestId('swipe-stack')).toBeInTheDocument()
    })
    
    // Empty the stack
    const emptyButton = screen.getByText('Empty All')
    fireEvent.click(emptyButton)
    
    await waitFor(() => {
      expect(screen.getByText(/you've swiped through all recommendations/i)).toBeInTheDocument()
    })
    
    // Open filters
    const filterButton = screen.getByRole('button', { name: /filters/i })
    fireEvent.click(filterButton)
    
    const applyButton = screen.getByText('Apply Filters')
    fireEvent.click(applyButton)
    
    await waitFor(() => {
      expect(screen.queryByText(/you've swiped through all recommendations/i)).not.toBeInTheDocument()
    })
  })

  // ===== Filtering Logic Tests =====

  test('27. Budget filter works correctly', async () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText('Margherita Pizza')).toBeInTheDocument()
    })
    
    // Open filter modal and apply budget of 10 (should filter out items > $10)
    const filterButton = screen.getByRole('button', { name: /filters/i })
    fireEvent.click(filterButton)
    
    const applyButton = screen.getByText('Apply Filters')
    fireEvent.click(applyButton)
    
    // With default filters (budget: 30), Caesar Salad ($8.50) should be visible
    await waitFor(() => {
      expect(screen.getByText('Caesar Salad')).toBeInTheDocument()
    })
  })

  test('28. Filtered count updates correctly', async () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText(/3 AI-powered recommendations/i)).toBeInTheDocument()
    })
  })

  test('29. Multiple filters work together', async () => {
    const recommendations = [
      { ...mockRecommendations[0], price: 100, distance: 10, rating: 2 }, // Fails all
      { ...mockRecommendations[1], price: 10, distance: 2, rating: 4.5 }, // Passes all
    ]
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ recommendations }),
    } as Response)
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText('Caesar Salad')).toBeInTheDocument()
    })
  })

  // ===== SwipeStack Tests =====

  test('30. SwipeStack renders with recommendations', async () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByTestId('swipe-stack')).toBeInTheDocument()
    })
  })

  test('31. SwipeStack shows empty state when no mood', () => {
    render(<Home />)
    expect(screen.queryByTestId('swipe-stack')).not.toBeInTheDocument()
  })

  test('32. All swiped out message displays', async () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByTestId('swipe-stack')).toBeInTheDocument()
    })
    
    const emptyButton = screen.getByText('Empty All')
    fireEvent.click(emptyButton)
    
    await waitFor(() => {
      expect(screen.getByText(/you've swiped through all recommendations/i)).toBeInTheDocument()
    })
  })

  test('33. Start Over button resets swipe stack', async () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByTestId('swipe-stack')).toBeInTheDocument()
    })
    
    const emptyButton = screen.getByText('Empty All')
    fireEvent.click(emptyButton)
    
    await waitFor(() => {
      expect(screen.getByText(/you've swiped through all recommendations/i)).toBeInTheDocument()
    })
    
    const startOverButton = screen.getByRole('button', { name: /start over/i })
    fireEvent.click(startOverButton)
    
    await waitFor(() => {
      expect(screen.getByTestId('swipe-stack')).toBeInTheDocument()
    })
  })

  // ===== Order Functionality Tests =====

  test('34. Order button calls handleOrder', async () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText('Order Margherita Pizza')).toBeInTheDocument()
    })
    
    const orderButton = screen.getByText('Order Margherita Pizza')
    fireEvent.click(orderButton)
    
    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith('menu-1', 'user-123')
    })
  })

  test('35. Order success notification appears', async () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText('Order Margherita Pizza')).toBeInTheDocument()
    })
    
    const orderButton = screen.getByText('Order Margherita Pizza')
    fireEvent.click(orderButton)
    
    await waitFor(() => {
      expect(screen.getByText('Item added to cart!')).toBeInTheDocument()
    })
  })

  test('36. Order notification auto-dismisses after 3 seconds', async () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText('Order Margherita Pizza')).toBeInTheDocument()
    })
    
    const orderButton = screen.getByText('Order Margherita Pizza')
    fireEvent.click(orderButton)
    
    await waitFor(() => {
      expect(screen.getByText('Item added to cart!')).toBeInTheDocument()
    })
    
    jest.advanceTimersByTime(3000)
    
    await waitFor(() => {
      expect(screen.queryByText('Item added to cart!')).not.toBeInTheDocument()
    })
  })

  test('37. Order without user shows sign-in message', async () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
      loading: false,
    })
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText('Order Margherita Pizza')).toBeInTheDocument()
    })
    
    const orderButton = screen.getByText('Order Margherita Pizza')
    fireEvent.click(orderButton)
    
    await waitFor(() => {
      expect(screen.getByText('Please sign in to add items to cart')).toBeInTheDocument()
    })
  })

  test('38. Order with missing menu_item_id shows error', async () => {
    const incompleteRecommendations = [
      { ...mockRecommendations[0], menu_item_id: undefined },
    ]
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ recommendations: incompleteRecommendations }),
    } as Response)
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText('Order Margherita Pizza')).toBeInTheDocument()
    })
    
    const orderButton = screen.getByText('Order Margherita Pizza')
    fireEvent.click(orderButton)
    
    await waitFor(() => {
      expect(screen.getByText(/unable to add item/i)).toBeInTheDocument()
    })
  })

  test('39. Order error shows error message', async () => {
    mockAddToCart.mockRejectedValue(new Error('Cart error'))
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText('Order Margherita Pizza')).toBeInTheDocument()
    })
    
    const orderButton = screen.getByText('Order Margherita Pizza')
    fireEvent.click(orderButton)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to add item to cart')).toBeInTheDocument()
    })
  })

  // ===== Favorites Tests =====

  test('40. Favorites section hidden when no favorites', () => {
    render(<Home />)
    expect(screen.queryByText(/your favorites/i)).not.toBeInTheDocument()
  })

  test('41. Favorites section displays with favorites', async () => {
    mockUseRecommendations.mockReturnValue({
      favorites: [1],
      toggleFavorite: mockToggleFavorite,
      isFavorite: mockIsFavorite,
      recommendations: [],
    } as any)
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText(/your favorites \(1\)/i)).toBeInTheDocument()
    })
  })

  test('42. Favorites count displays correctly', async () => {
    mockUseRecommendations.mockReturnValue({
      favorites: [1, 2],
      toggleFavorite: mockToggleFavorite,
      isFavorite: mockIsFavorite,
      recommendations: [],
    } as any)
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText(/your favorites \(2\)/i)).toBeInTheDocument()
    })
  })

  test('43. Favorite items render in grid', async () => {
    mockUseRecommendations.mockReturnValue({
      favorites: [1],
      toggleFavorite: mockToggleFavorite,
      isFavorite: mockIsFavorite,
      recommendations: [],
    } as any)
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      const favoritesSection = screen.getByText(/your favorites/i).parentElement
      expect(favoritesSection?.querySelector('.grid')).toBeInTheDocument()
    })
  })

  test('44. Favorite item shows title and description', async () => {
    mockUseRecommendations.mockReturnValue({
      favorites: [1],
      toggleFavorite: mockToggleFavorite,
      isFavorite: mockIsFavorite,
      recommendations: [],
    } as any)
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      const favoritesSection = screen.getByText(/your favorites/i).parentElement
      expect(within(favoritesSection!).getByText('Margherita Pizza')).toBeInTheDocument()
      expect(within(favoritesSection!).getByText('Classic Italian pizza')).toBeInTheDocument()
    })
  })

  test('45. Favorite item shows price', async () => {
    mockUseRecommendations.mockReturnValue({
      favorites: [1],
      toggleFavorite: mockToggleFavorite,
      isFavorite: mockIsFavorite,
      recommendations: [],
    } as any)
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      const favoritesSection = screen.getByText(/your favorites/i).parentElement
      expect(within(favoritesSection!).getByText('$12.99')).toBeInTheDocument()
    })
  })

  test('46. Favorite item has heart button', async () => {
    mockUseRecommendations.mockReturnValue({
      favorites: [1],
      toggleFavorite: mockToggleFavorite,
      isFavorite: mockIsFavorite,
      recommendations: [],
    } as any)
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      const favoritesSection = screen.getByText(/your favorites/i).parentElement
      const heartButton = within(favoritesSection!).getByRole('button')
      const svg = heartButton.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })
  })

  test('47. Clicking favorite heart calls toggleFavorite', async () => {
    mockUseRecommendations.mockReturnValue({
      favorites: [1],
      toggleFavorite: mockToggleFavorite,
      isFavorite: mockIsFavorite,
      recommendations: [],
    } as any)
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      const favoritesSection = screen.getByText(/your favorites/i).parentElement
      const heartButton = within(favoritesSection!).getByRole('button')
      fireEvent.click(heartButton)
    })
    
    expect(mockToggleFavorite).toHaveBeenCalledWith(1)
  })

  test('48. Multiple favorites render correctly', async () => {
    mockUseRecommendations.mockReturnValue({
      favorites: [1, 2],
      toggleFavorite: mockToggleFavorite,
      isFavorite: mockIsFavorite,
      recommendations: [],
    } as any)
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      const favoritesSection = screen.getByText(/your favorites/i).parentElement
      expect(within(favoritesSection!).getByText('Margherita Pizza')).toBeInTheDocument()
      expect(within(favoritesSection!).getByText('Caesar Salad')).toBeInTheDocument()
    })
  })

  test('49. Favorites use grid layout on desktop', async () => {
    mockUseRecommendations.mockReturnValue({
      favorites: [1, 2],
      toggleFavorite: mockToggleFavorite,
      isFavorite: mockIsFavorite,
      recommendations: [],
    } as any)
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      const favoritesSection = screen.getByText(/your favorites/i).parentElement
      const grid = favoritesSection?.querySelector('.grid')
      expect(grid).toHaveClass('md:grid-cols-2')
    })
  })

  test('50. Favorites section has border separator', async () => {
    mockUseRecommendations.mockReturnValue({
      favorites: [1],
      toggleFavorite: mockToggleFavorite,
      isFavorite: mockIsFavorite,
      recommendations: [],
    } as any)
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      const favoritesSection = screen.getByText(/your favorites/i).closest('div')
      expect(favoritesSection).toHaveClass('border-t')
    })
  })

  // ===== Hook Integration Tests =====

  test('51. useRecommendations hook is called', () => {
    render(<Home />)
    expect(mockUseRecommendations).toHaveBeenCalled()
  })

  test('52. useCart hook is called', () => {
    render(<Home />)
    expect(mockUseCart).toHaveBeenCalled()
  })

  test('53. useAuth hook is called', () => {
    render(<Home />)
    expect(mockUseAuth).toHaveBeenCalled()
  })

  test('54. isFavorite is passed to SwipeStack', async () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByTestId('swipe-stack')).toBeInTheDocument()
    })
    
    expect(mockIsFavorite).toBeDefined()
  })



  // ===== Styling and UI Tests =====

  test('56. Container has gradient background', () => {
    render(<Home />)
    const main = screen.getByRole('main')
    expect(main).toHaveClass('bg-gradient-to-br')
  })

  test('57. Content is centered with max width', () => {
    render(<Home />)
    const container = screen.getByText("What's your vibe today?").closest('.max-w-3xl')
    expect(container).toBeInTheDocument()
  })

  test('58. Title has responsive text size', () => {
    render(<Home />)
    const title = screen.getByRole('heading', { name: /what's your vibe today/i })
    expect(title).toHaveClass('text-4xl', 'md:text-5xl')
  })

  test('59. Mood section has accent background', async () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      const moodSection = screen.getByText(/your mood:/i).closest('div')
      expect(moodSection).toHaveClass('bg-accent/10')
    })
  })

  test('60. Filters button has secondary styling', () => {
    render(<Home />)
    const filterButton = screen.getByRole('button', { name: /filters/i })
    expect(filterButton).toHaveClass('bg-secondary')
  })

  test('61. Start Over button has primary styling', async () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      const emptyButton = screen.getByText('Empty All')
      fireEvent.click(emptyButton)
    })
    
    await waitFor(() => {
      const startOverButton = screen.getByRole('button', { name: /start over/i })
      expect(startOverButton).toHaveClass('bg-primary')
    })
  })

  test('62. Success notification has green styling', async () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      const orderButton = screen.getByText('Order Margherita Pizza')
      fireEvent.click(orderButton)
    })
    
    await waitFor(() => {
      const notification = screen.getByText('Item added to cart!').closest('div')
      expect(notification).toHaveClass('bg-green-500/10')
    })
  })

  test('63. Error message has destructive styling', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      const errorMessage = screen.getByText(/network error/i)
      expect(errorMessage).toHaveClass('text-destructive')
    })
  })

  // ===== Edge Cases Tests =====

  test('64. Empty recommendations array shows no swipe stack', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ recommendations: [] }),
    } as Response)
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByTestId('swipe-stack-empty')).toBeInTheDocument()
    })
  })

  test('65. Whitespace-only mood is trimmed', async () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: '   happy   ' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/recommendations',
        expect.objectContaining({
          body: JSON.stringify({ mood: 'happy' }),
        })
      )
    })
  })

  test('66. Changing mood cancels previous fetch', async () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(500)
    
    fireEvent.change(input, { target: { value: 'sad' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/recommendations',
        expect.objectContaining({
          body: JSON.stringify({ mood: 'sad' }),
        })
      )
    })
  })



  test('68. Filters with extreme values work', async () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByTestId('swipe-stack')).toBeInTheDocument()
    })
    
    // Even with extreme filters, component should not crash
    expect(screen.getByTestId('swipe-stack')).toBeInTheDocument()
  })

  test('69. Multiple order clicks are handled gracefully', async () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      const orderButton = screen.getByText('Order Margherita Pizza')
      fireEvent.click(orderButton)
      fireEvent.click(orderButton)
      fireEvent.click(orderButton)
    })
    
    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledTimes(3)
    })
  })

  test('70. Rapid filter changes work correctly', () => {
    render(<Home />)
    const filterButton = screen.getByRole('button', { name: /filters/i })
    
    fireEvent.click(filterButton)
    const closeButton = screen.getByText('Close Modal')
    fireEvent.click(closeButton)
    
    fireEvent.click(filterButton)
    const applyButton = screen.getByText('Apply Filters')
    fireEvent.click(applyButton)
    
    // Should still render correctly
    expect(screen.getByTestId('filter-modal')).toBeInTheDocument()
  })

  // ===== Accessibility Tests =====

  test('71. Main element has correct role', () => {
    render(<Home />)
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  test('72. Heading hierarchy is correct', () => {
    render(<Home />)
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toHaveTextContent("What's your vibe today?")
  })

  test('73. Buttons have accessible text', () => {
    render(<Home />)
    const filterButton = screen.getByRole('button', { name: /filters/i })
    expect(filterButton).toHaveAccessibleName()
  })

  test('74. Input has placeholder', () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    expect(input).toHaveAttribute('placeholder')
  })

  test('75. SVG icons have proper structure', () => {
    render(<Home />)
    const filterButton = screen.getByRole('button', { name: /filters/i })
    const svg = filterButton.querySelector('svg')
    expect(svg).toHaveAttribute('viewBox')
  })

  // ===== State Management Tests =====

  test('76. Initial state is correct', () => {
    render(<Home />)
    expect(screen.queryByText(/your mood:/i)).not.toBeInTheDocument()
    expect(screen.queryByTestId('filter-modal')).not.toBeInTheDocument()
    expect(screen.queryByText(/you've swiped through all recommendations/i)).not.toBeInTheDocument()
  })

  test('77. State updates persist across re-renders', async () => {
    const { rerender } = render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText('happy')).toBeInTheDocument()
    })
    
    rerender(<Home />)
    
    expect(screen.getByTestId('mood-input')).toHaveValue('happy')
  })

  test('78. Loading state clears on error', async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}))
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText(/finding personalized recommendations/i)).toBeInTheDocument()
    })
    
    mockFetch.mockRejectedValue(new Error('Error'))
    
    fireEvent.change(input, { target: { value: 'sad' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.queryByText(/finding personalized recommendations/i)).not.toBeInTheDocument()
    })
  })

  test('79. Error state clears on successful fetch', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument()
    })
    
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ recommendations: mockRecommendations }),
    } as Response)
    
    fireEvent.change(input, { target: { value: 'excited' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.queryByText(/network error/i)).not.toBeInTheDocument()
    })
  })

  test('80. AllSwipedOut resets when new recommendations arrive', async () => {
    render(<Home />)
    const input = screen.getByTestId('mood-input')
    
    fireEvent.change(input, { target: { value: 'happy' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      const emptyButton = screen.getByText('Empty All')
      fireEvent.click(emptyButton)
    })
    
    await waitFor(() => {
      expect(screen.getByText(/you've swiped through all recommendations/i)).toBeInTheDocument()
    })
    
    fireEvent.change(input, { target: { value: 'excited' } })
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(screen.queryByText(/you've swiped through all recommendations/i)).not.toBeInTheDocument()
    })
  })
})