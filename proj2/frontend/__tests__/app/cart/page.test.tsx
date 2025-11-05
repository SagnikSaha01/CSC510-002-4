import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

// Mock Supabase client before any imports
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
jest.mock('@/hooks/use-cart')
jest.mock('@/contexts/auth-context')
jest.mock('@/components/header', () => {
  return function MockHeader() {
    return <div data-testid="mock-header">Header</div>
  }
})

import CartPage from '@/app/cart/page'
import { useCart } from '@/hooks/use-cart'
import { useAuth } from '@/contexts/auth-context'

const mockUseCart = useCart as jest.MockedFunction<typeof useCart>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

describe('CartPage Component', () => {
  const mockFetchCart = jest.fn()
  const mockAddToCart = jest.fn()
  const mockRemoveFromCart = jest.fn()
  const mockGetCartCount = jest.fn()
  
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: '2024-01-01',
  } as any

  const mockCartItems = [
    {
      id: 'cart-item-1',
      menu_items: {
        id: 'menu-1',
        name: 'Margherita Pizza',
        price: 12.99,
        image_url: '/pizza.jpg',
      },
      quantity: 2,
    },
    {
      id: 'cart-item-2',
      menu_items: {
        id: 'menu-2',
        name: 'Caesar Salad',
        price: 8.50,
        image_url: '/salad.jpg',
      },
      quantity: 1,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    
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

    mockFetchCart.mockResolvedValue(mockCartItems)
  })

  // ===== Initial Rendering & State Tests =====
  
  test('1. Component renders without crashing', () => {
    render(<CartPage />)
    expect(screen.getByText('Your Cart')).toBeInTheDocument()
  })

  test('2. Header component is rendered', () => {
    render(<CartPage />)
    expect(screen.getByTestId('mock-header')).toBeInTheDocument()
  })

  test('3. Page title displays "Your Cart"', () => {
    render(<CartPage />)
    expect(screen.getByRole('heading', { name: /your cart/i })).toBeInTheDocument()
  })

  test('4. Initial loading state shows spinner', async () => {
    mockFetchCart.mockImplementation(() => new Promise(() => {})) // Never resolves
    render(<CartPage />)
    expect(screen.getByText(/loading your cart/i)).toBeInTheDocument()
  })

  test('5. Unauthenticated user sees sign-in prompt', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      session: null,
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
      loading: false,
    })
    
    render(<CartPage />)
    expect(screen.getByText(/please sign in to view your cart/i)).toBeInTheDocument()
  })

  test('6. Empty cart shows empty state message', async () => {
    mockFetchCart.mockResolvedValue([])
    render(<CartPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
    })
  })

  test('7. "Browse Recommendations" link in empty state', async () => {
    mockFetchCart.mockResolvedValue([])
    render(<CartPage />)
    
    await waitFor(() => {
      const link = screen.getByRole('link', { name: /browse recommendations/i })
      expect(link).toHaveAttribute('href', '/')
    })
  })

  // ===== Cart Items Display Tests =====

  test('8. Cart items render correctly', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Margherita Pizza')).toBeInTheDocument()
      expect(screen.getByText('Caesar Salad')).toBeInTheDocument()
    })
  })

  test('9. Each item shows correct title', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Margherita Pizza')).toBeInTheDocument()
    })
  })

  test('11. Each item shows correct quantity', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      const quantities = screen.getAllByText('2')
      expect(quantities.length).toBeGreaterThan(0)
    })
  })

  test('13. Item image displays with src', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      const images = screen.getAllByRole('img')
      expect(images[0]).toHaveAttribute('src', '/pizza.jpg')
    })
  })

  test('14. Item image shows placeholder on missing image', async () => {
    const itemsWithoutImage = [{
      ...mockCartItems[0],
      menu_items: { ...mockCartItems[0].menu_items, image_url: undefined }
    }]
    mockFetchCart.mockResolvedValue(itemsWithoutImage)
    
    render(<CartPage />)
    
    await waitFor(() => {
      const image = screen.getByRole('img')
      expect(image).toHaveAttribute('src', '/placeholder.svg')
    })
  })

  test('15. Multiple items render in correct order', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      const items = screen.getAllByRole('heading', { level: 3 })
      expect(items[0]).toHaveTextContent('Margherita Pizza')
      expect(items[1]).toHaveTextContent('Caesar Salad')
    })
  })

  // ===== Quantity Controls Tests =====

  test('16. Increment button calls updateQuantity with +1', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      const incrementButtons = screen.getAllByText('+')
      fireEvent.click(incrementButtons[0])
    })

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith('menu-1', 'user-123', 3)
    })
  })

  test('17. Decrement button calls updateQuantity with -1', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      const decrementButtons = screen.getAllByText('−')
      fireEvent.click(decrementButtons[0])
    })

    await waitFor(() => {
      expect(mockAddToCart).toHaveBeenCalledWith('menu-1', 'user-123', 1)
    })
  })

  test('19. Quantity display updates after increment', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    const incrementButtons = screen.getAllByText('+')
    fireEvent.click(incrementButtons[0])

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument()
    })
  })

  test('21. Quantity buttons are clickable', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      const incrementButtons = screen.getAllByText('+')
      const decrementButtons = screen.getAllByText('−')
      
      expect(incrementButtons[0]).not.toBeDisabled()
      expect(decrementButtons[0]).not.toBeDisabled()
    })
  })

  // ===== Remove Item Tests =====

  test('22. Remove button is visible for each item', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      const removeButtons = screen.getAllByText('Remove')
      expect(removeButtons).toHaveLength(2)
    })
  })

  test('23. Remove button calls removeItem with correct id', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      const removeButtons = screen.getAllByText('Remove')
      fireEvent.click(removeButtons[0])
    })

    await waitFor(() => {
      expect(mockRemoveFromCart).toHaveBeenCalledWith('menu-1', 'user-123')
    })
  })

  test('24. Remove button has destructive styling', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      const removeButtons = screen.getAllByText('Remove')
      expect(removeButtons[0]).toHaveClass('text-destructive')
    })
  })

  test('25. Item disappears from UI after removal', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Margherita Pizza')).toBeInTheDocument()
    })

    const removeButtons = screen.getAllByText('Remove')
    fireEvent.click(removeButtons[0])

    await waitFor(() => {
      expect(screen.queryByText('Margherita Pizza')).not.toBeInTheDocument()
    })
  })

  // ===== Order Summary Tests =====

  test('26. Order Summary section renders', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Order Summary')).toBeInTheDocument()
    })
  })

  test('27. Total item count is correct', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      const summarySection = screen.getByText('Order Summary').closest('aside')
      expect(summarySection).toHaveTextContent('3') // 2 + 1
    })
  })

  test('29. Total matches subtotal', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      const totalElements = screen.getAllByText('$34.48')
      expect(totalElements.length).toBeGreaterThanOrEqual(2) // Subtotal and Total
    })
  })

  // ===== Checkout Button Tests =====

  test('32. Checkout button renders', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /checkout/i })).toBeInTheDocument()
    })
  })

  test('33. Checkout button disabled when cart is empty', async () => {
    mockFetchCart.mockResolvedValue([])
    render(<CartPage />)
    
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /checkout/i })).not.toBeInTheDocument()
    })
  })

  test('34. Checkout button disabled during checkout', async () => {
    mockRemoveFromCart.mockImplementation(() => new Promise(() => {})) // Never resolves
    render(<CartPage />)
    
    await waitFor(() => {
      const checkoutButton = screen.getByRole('button', { name: /checkout/i })
      fireEvent.click(checkoutButton)
    })

    await waitFor(() => {
      const processingButton = screen.getByRole('button', { name: /processing/i })
      expect(processingButton).toBeDisabled()
    })
  })

  test('35. Checkout button shows loading spinner', async () => {
    mockRemoveFromCart.mockImplementation(() => new Promise(() => {}))
    render(<CartPage />)
    
    await waitFor(() => {
      const checkoutButton = screen.getByRole('button', { name: /checkout/i })
      fireEvent.click(checkoutButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/processing/i)).toBeInTheDocument()
    })
  })

  test('36. Checkout button text changes to "Processing..."', async () => {
    mockRemoveFromCart.mockImplementation(() => new Promise(() => {}))
    render(<CartPage />)
    
    await waitFor(() => {
      const checkoutButton = screen.getByRole('button', { name: /checkout/i })
      fireEvent.click(checkoutButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Processing...')).toBeInTheDocument()
    })
  })

  test('37. Checkout button calls handleCheckout', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      const checkoutButton = screen.getByRole('button', { name: /checkout/i })
      fireEvent.click(checkoutButton)
    })

    await waitFor(() => {
      expect(mockRemoveFromCart).toHaveBeenCalled()
    })
  })

  test('38. Checkout button has correct styling', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      const checkoutButton = screen.getByRole('button', { name: /checkout/i })
      expect(checkoutButton).toHaveClass('bg-primary')
    })
  })

  // ===== Success Dialog Tests =====

  test('39. Success dialog is hidden by default', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      expect(screen.queryByText('Order Successful!')).not.toBeInTheDocument()
    })
  })

  test('40. Success dialog appears after successful checkout', async () => {
    mockRemoveFromCart.mockResolvedValue(undefined)
    render(<CartPage />)
    
    await waitFor(() => {
      const checkoutButton = screen.getByRole('button', { name: /checkout/i })
      fireEvent.click(checkoutButton)
    })

    await waitFor(() => {
      expect(screen.getByText('Order Successful!')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('41. Success dialog shows success icon', async () => {
    mockRemoveFromCart.mockResolvedValue(undefined)
    render(<CartPage />)
    
    await waitFor(() => {
      const checkoutButton = screen.getByRole('button', { name: /checkout/i })
      fireEvent.click(checkoutButton)
    })

    await waitFor(() => {
      const dialog = screen.getByText('Order Successful!').closest('div')
      const svg = dialog?.querySelector('svg')
      expect(svg).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('42. Success dialog shows "Order Successful!" heading', async () => {
    mockRemoveFromCart.mockResolvedValue(undefined)
    render(<CartPage />)
    
    await waitFor(() => {
      const checkoutButton = screen.getByRole('button', { name: /checkout/i })
      fireEvent.click(checkoutButton)
    })

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /order successful!/i })).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('43. Success dialog shows thank you message', async () => {
    mockRemoveFromCart.mockResolvedValue(undefined)
    render(<CartPage />)
    
    await waitFor(() => {
      const checkoutButton = screen.getByRole('button', { name: /checkout/i })
      fireEvent.click(checkoutButton)
    })

    await waitFor(() => {
      expect(screen.getByText(/thank you for choosing vibe eats/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('44. "Continue Shopping" button in dialog', async () => {
    mockRemoveFromCart.mockResolvedValue(undefined)
    render(<CartPage />)
    
    await waitFor(() => {
      const checkoutButton = screen.getByRole('button', { name: /checkout/i })
      fireEvent.click(checkoutButton)
    })

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /continue shopping/i })).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  test('45. "Continue Shopping" calls closeSuccessDialog', async () => {
    mockRemoveFromCart.mockResolvedValue(undefined)
    render(<CartPage />)
    
    await waitFor(() => {
      const checkoutButton = screen.getByRole('button', { name: /checkout/i })
      fireEvent.click(checkoutButton)
    })

    await waitFor(() => {
      const continueButton = screen.getByRole('button', { name: /continue shopping/i })
      fireEvent.click(continueButton)
    }, { timeout: 3000 })

    await waitFor(() => {
      expect(screen.queryByText('Order Successful!')).not.toBeInTheDocument()
    })
  })

  test('46. "Back to Home" link in dialog', async () => {
    mockRemoveFromCart.mockResolvedValue(undefined)
    render(<CartPage />)
    
    await waitFor(() => {
      const checkoutButton = screen.getByRole('button', { name: /checkout/i })
      fireEvent.click(checkoutButton)
    })

    await waitFor(() => {
      const homeLink = screen.getByRole('link', { name: /back to home/i })
      expect(homeLink).toHaveAttribute('href', '/')
    }, { timeout: 3000 })
  })

  test('47. Success dialog has backdrop overlay', async () => {
    mockRemoveFromCart.mockResolvedValue(undefined)
    render(<CartPage />)
    
    await waitFor(() => {
      const checkoutButton = screen.getByRole('button', { name: /checkout/i })
      fireEvent.click(checkoutButton)
    })

    await waitFor(() => {
      const overlay = screen.getByText('Order Successful!').closest('.fixed')
      expect(overlay).toHaveClass('bg-black/50')
    }, { timeout: 3000 })
  })

  test('48. Success dialog is centered', async () => {
    mockRemoveFromCart.mockResolvedValue(undefined)
    render(<CartPage />)
    
    await waitFor(() => {
      const checkoutButton = screen.getByRole('button', { name: /checkout/i })
      fireEvent.click(checkoutButton)
    })

    await waitFor(() => {
      const overlay = screen.getByText('Order Successful!').closest('.fixed')
      expect(overlay).toHaveClass('flex', 'items-center', 'justify-center')
    }, { timeout: 3000 })
  })

  // ===== Loading States Tests =====

  test('49. Cart loading spinner displays', () => {
    mockFetchCart.mockImplementation(() => new Promise(() => {}))
    render(<CartPage />)
    
    expect(screen.getByText(/loading your cart/i)).toBeInTheDocument()
  })

  test('50. Loading message "Loading your cart..."', () => {
    mockFetchCart.mockImplementation(() => new Promise(() => {}))
    render(<CartPage />)
    
    expect(screen.getByText('Loading your cart...')).toBeInTheDocument()
  })

  test('51. Cart items render after loading completes', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      expect(screen.queryByText(/loading your cart/i)).not.toBeInTheDocument()
      expect(screen.getByText('Margherita Pizza')).toBeInTheDocument()
    })
  })

  // ===== Integration with Hooks Tests =====

  test('52. useCart hook is called', () => {
    render(<CartPage />)
    expect(mockUseCart).toHaveBeenCalled()
  })

  test('53. useAuth hook is called', () => {
    render(<CartPage />)
    expect(mockUseAuth).toHaveBeenCalled()
  })

  test('54. fetchCart is called on mount', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      expect(mockFetchCart).toHaveBeenCalled()
    })
  })

  test('55. fetchCart is called with user.id', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      expect(mockFetchCart).toHaveBeenCalledWith('user-123')
    })
  })

  test('56. Cart reloads when user changes', async () => {
    const { rerender } = render(<CartPage />)
    
    await waitFor(() => {
      expect(mockFetchCart).toHaveBeenCalledTimes(1)
    })

    const newUser = { ...mockUser, id: 'new-user-456', email: 'new@example.com' }
    mockUseAuth.mockReturnValue({
      user: newUser,
      session: null,
      signInWithGoogle: jest.fn(),
      signOut: jest.fn(),
      loading: false,
    })

    rerender(<CartPage />)

    await waitFor(() => {
      expect(mockFetchCart).toHaveBeenCalledWith('new-user-456')
    })
  })

  // ===== Error Handling Tests =====

  test('57. Cart continues to function if one item fails to load', async () => {
    const partialItems = [mockCartItems[0]]
    mockFetchCart.mockResolvedValue(partialItems)
    
    render(<CartPage />)
    
    await waitFor(() => {
      expect(screen.getByText('Margherita Pizza')).toBeInTheDocument()
      expect(screen.queryByText('Caesar Salad')).not.toBeInTheDocument()
    })
  })

  test('58. Empty state after failed load', async () => {
    mockFetchCart.mockRejectedValue(new Error('Failed to load'))
    
    render(<CartPage />)
    
    await waitFor(() => {
      expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument()
    })
  })

  test('59. Quantity controls remain functional after error', async () => {
    mockAddToCart.mockRejectedValueOnce(new Error('Network error'))
    render(<CartPage />)
    
    await waitFor(() => {
      const incrementButtons = screen.getAllByText('+')
      fireEvent.click(incrementButtons[0])
    })

    // Should still be able to interact
    await waitFor(() => {
      const decrementButtons = screen.getAllByText('−')
      expect(decrementButtons[0]).not.toBeDisabled()
    })
  })

  // ===== Accessibility Tests =====

  test('60. All buttons have accessible labels', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button.textContent || button.getAttribute('aria-label')).toBeTruthy()
      })
    })
  })

  test('61. Images have alt text', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      const images = screen.getAllByRole('img')
      images.forEach(img => {
        expect(img).toHaveAttribute('alt')
      })
    })
  })

  test('62. Links have accessible names', async () => {
    mockFetchCart.mockResolvedValue([])
    render(<CartPage />)
    
    await waitFor(() => {
      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link.textContent || link.getAttribute('aria-label')).toBeTruthy()
      })
    })
  })

  test('63. Form controls have labels', async () => {
    render(<CartPage />)
    
    await waitFor(() => {
      expect(screen.getAllByText('Quantity')).toBeTruthy()
    })
  })
})
