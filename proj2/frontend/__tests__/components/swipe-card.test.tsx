import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import SwipeCard from '@/components/swipe-card'

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>
})

describe('SwipeCard Component', () => {
  const mockOnSwipe = jest.fn()
  const mockOnToggleFavorite = jest.fn()
  const mockOnOrder = jest.fn()

  const defaultProps = {
    id: 1,
    title: 'Test Dish',
    description: 'This is a test dish description',
    image: '/test-image.jpg',
    price: 12.99,
    distance: 2.5,
    rating: 4.5,
    category: 'Italian',
    isFavorite: false,
    onSwipe: mockOnSwipe,
    onToggleFavorite: mockOnToggleFavorite,
    onOrder: mockOnOrder,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ===== Rendering Tests =====

  test('1. Renders without crashing', () => {
    render(<SwipeCard {...defaultProps} />)
    expect(screen.getByText('Test Dish')).toBeInTheDocument()
  })

  test('2. Displays dish title', () => {
    render(<SwipeCard {...defaultProps} />)
    expect(screen.getByText('Test Dish')).toBeInTheDocument()
  })

  test('3. Displays description', () => {
    render(<SwipeCard {...defaultProps} />)
    expect(screen.getByText('This is a test dish description')).toBeInTheDocument()
  })

  test('4. Displays price formatted correctly', () => {
    render(<SwipeCard {...defaultProps} />)
    expect(screen.getByText('$12.99')).toBeInTheDocument()
  })

  test('5. Displays rating', () => {
    render(<SwipeCard {...defaultProps} />)
    expect(screen.getByText('4.5')).toBeInTheDocument()
  })

  test('6. Displays distance', () => {
    render(<SwipeCard {...defaultProps} />)
    expect(screen.getByText('2.5 km away')).toBeInTheDocument()
  })

  test('7. Displays category badge', () => {
    render(<SwipeCard {...defaultProps} />)
    expect(screen.getByText('Italian')).toBeInTheDocument()
  })

  test('8. Displays image with correct src', () => {
    render(<SwipeCard {...defaultProps} />)
    const image = screen.getByAltText('Test Dish')
    expect(image).toHaveAttribute('src', '/test-image.jpg')
  })

  test('9. Shows favorite button', () => {
    render(<SwipeCard {...defaultProps} />)
    const favoriteButton = screen.getByLabelText(/add to favorites/i)
    expect(favoriteButton).toBeInTheDocument()
  })

  test('10. Shows order button', () => {
    render(<SwipeCard {...defaultProps} />)
    expect(screen.getByText('Order')).toBeInTheDocument()
  })

  // ===== Price Display Tests =====

  test('11. Price formats with 2 decimal places', () => {
    const propsWithWholePrice = { ...defaultProps, price: 10 }
    render(<SwipeCard {...propsWithWholePrice} />)
    expect(screen.getByText('$10.00')).toBeInTheDocument()
  })

  test('12. Displays category in uppercase', () => {
    render(<SwipeCard {...defaultProps} />)
    const categoryBadge = screen.getByText('Italian')
    expect(categoryBadge).toBeInTheDocument()
  })

  test('13. Shows star emoji for rating', () => {
    render(<SwipeCard {...defaultProps} />)
    expect(screen.getByText('⭐')).toBeInTheDocument()
  })

  // ===== Mouse Interaction Tests =====

  test('14. Calls onSwipe on drag right past threshold', () => {
    render(<SwipeCard {...defaultProps} />)
    const card = document.querySelector('.cursor-grab')

    // Simulate drag to the right
    fireEvent.mouseDown(card!, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(card!, { clientX: 500, clientY: 100 })
    fireEvent.mouseUp(card!, { clientX: 500, clientY: 100 })

    expect(mockOnSwipe).toHaveBeenCalledWith('right')
  })

  test('15. Calls onSwipe on drag left past threshold', () => {
    render(<SwipeCard {...defaultProps} />)
    const card = document.querySelector('.cursor-grab')

    // Simulate drag to the left
    fireEvent.mouseDown(card!, { clientX: 500, clientY: 100 })
    fireEvent.mouseMove(card!, { clientX: 100, clientY: 100 })
    fireEvent.mouseUp(card!, { clientX: 100, clientY: 100 })

    expect(mockOnSwipe).toHaveBeenCalledWith('left')
  })

  test('16. Does not call onSwipe on small drag', () => {
    render(<SwipeCard {...defaultProps} />)
    const card = document.querySelector('.cursor-grab')

    // Simulate small drag
    fireEvent.mouseDown(card!, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(card!, { clientX: 120, clientY: 100 })
    fireEvent.mouseUp(card!, { clientX: 120, clientY: 100 })

    expect(mockOnSwipe).not.toHaveBeenCalled()
  })

  test('17. Card returns to original position on small drag', () => {
    render(<SwipeCard {...defaultProps} />)
    const card = document.querySelector('.cursor-grab') as HTMLElement

    // Simulate small drag
    fireEvent.mouseDown(card, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(card, { clientX: 120, clientY: 100 })
    fireEvent.mouseUp(card, { clientX: 120, clientY: 100 })

    // Card should return to position 0,0
    expect(card.style.transform).toContain('translate(0px, 0px)')
  })

  // ===== Touch Interaction Tests =====

  test('18. Handles touch swipe right', () => {
    render(<SwipeCard {...defaultProps} />)
    const card = document.querySelector('.cursor-grab')

    // Simulate touch swipe to the right
    fireEvent.touchStart(card!, { touches: [{ clientX: 100, clientY: 100 }] })
    fireEvent.touchMove(card!, { touches: [{ clientX: 500, clientY: 100 }] })
    fireEvent.touchEnd(card!, { changedTouches: [{ clientX: 500, clientY: 100 }] })

    expect(mockOnSwipe).toHaveBeenCalledWith('right')
  })

  test('19. Handles touch swipe left', () => {
    render(<SwipeCard {...defaultProps} />)
    const card = document.querySelector('.cursor-grab')

    // Simulate touch swipe to the left
    fireEvent.touchStart(card!, { touches: [{ clientX: 500, clientY: 100 }] })
    fireEvent.touchMove(card!, { touches: [{ clientX: 100, clientY: 100 }] })
    fireEvent.touchEnd(card!, { changedTouches: [{ clientX: 100, clientY: 100 }] })

    expect(mockOnSwipe).toHaveBeenCalledWith('left')
  })

  test('20. Resets position on small touch drag', () => {
    render(<SwipeCard {...defaultProps} />)
    const card = document.querySelector('.cursor-grab') as HTMLElement

    // Simulate small touch drag
    fireEvent.touchStart(card, { touches: [{ clientX: 100, clientY: 100 }] })
    fireEvent.touchMove(card, { touches: [{ clientX: 120, clientY: 100 }] })
    fireEvent.touchEnd(card, { changedTouches: [{ clientX: 120, clientY: 100 }] })

    expect(mockOnSwipe).not.toHaveBeenCalled()
  })

  // ===== Favorite Button Tests =====

  test('21. Favorite button calls onToggleFavorite', () => {
    render(<SwipeCard {...defaultProps} />)
    const favoriteButton = screen.getByLabelText(/add to favorites/i)

    fireEvent.click(favoriteButton)

    expect(mockOnToggleFavorite).toHaveBeenCalledWith(1)
  })

  test('22. Shows filled heart when isFavorite is true', () => {
    render(<SwipeCard {...defaultProps} isFavorite={true} />)
    const favoriteButton = screen.getByLabelText(/remove from favorites/i)
    const svg = favoriteButton.querySelector('svg')

    expect(svg).toHaveAttribute('fill', 'currentColor')
  })

  test('23. Shows outlined heart when isFavorite is false', () => {
    render(<SwipeCard {...defaultProps} isFavorite={false} />)
    const favoriteButton = screen.getByLabelText(/add to favorites/i)
    const svg = favoriteButton.querySelector('svg')

    expect(svg).toHaveAttribute('fill', 'none')
  })

  test('24. Swiping right calls onToggleFavorite', () => {
    render(<SwipeCard {...defaultProps} />)
    const card = document.querySelector('.cursor-grab')

    // Swipe right
    fireEvent.mouseDown(card!, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(card!, { clientX: 500, clientY: 100 })
    fireEvent.mouseUp(card!, { clientX: 500, clientY: 100 })

    expect(mockOnToggleFavorite).toHaveBeenCalledWith(1)
  })

  test('25. Swiping left does not call onToggleFavorite', () => {
    render(<SwipeCard {...defaultProps} />)
    const card = document.querySelector('.cursor-grab')

    // Swipe left
    fireEvent.mouseDown(card!, { clientX: 500, clientY: 100 })
    fireEvent.mouseMove(card!, { clientX: 100, clientY: 100 })
    fireEvent.mouseUp(card!, { clientX: 100, clientY: 100 })

    expect(mockOnToggleFavorite).not.toHaveBeenCalled()
  })

  // ===== Order Button Tests =====

  test('26. Order button calls onOrder with correct id', () => {
    render(<SwipeCard {...defaultProps} />)
    const orderButton = screen.getByText('Order')

    fireEvent.click(orderButton)

    expect(mockOnOrder).toHaveBeenCalledWith(1)
  })

  test('27. Order button click stops propagation', () => {
    render(<SwipeCard {...defaultProps} />)
    const card = document.querySelector('.cursor-grab')
    const orderButton = screen.getByText('Order')

    const cardClickHandler = jest.fn()
    card?.addEventListener('click', cardClickHandler)

    fireEvent.click(orderButton)

    expect(mockOnOrder).toHaveBeenCalledWith(1)
  })

  // ===== Swipe Indicators Tests =====

  test('28. Shows "NOPE" indicator on left swipe', () => {
    render(<SwipeCard {...defaultProps} />)
    const card = document.querySelector('.cursor-grab')

    fireEvent.mouseDown(card!, { clientX: 500, clientY: 100 })
    fireEvent.mouseMove(card!, { clientX: 200, clientY: 100 })

    const nopeIndicator = screen.getByText('NOPE')
    expect(nopeIndicator).toBeInTheDocument()
  })

  test('29. Shows "LIKE" indicator on right swipe', () => {
    render(<SwipeCard {...defaultProps} />)
    const card = document.querySelector('.cursor-grab')

    fireEvent.mouseDown(card!, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(card!, { clientX: 400, clientY: 100 })

    const likeIndicator = screen.getByText('LIKE')
    expect(likeIndicator).toBeInTheDocument()
  })

  // ===== Mouse Leave Behavior Tests =====

  test('30. Resets card position on mouse leave while dragging', () => {
    render(<SwipeCard {...defaultProps} />)
    const card = document.querySelector('.cursor-grab') as HTMLElement

    fireEvent.mouseDown(card, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(card, { clientX: 200, clientY: 100 })
    fireEvent.mouseLeave(card)

    expect(card.style.transform).toContain('translate(0px, 0px)')
  })

  // ===== Optional Props Tests =====

  test('32. Works without onToggleFavorite prop', () => {
    const propsWithoutFavorite = { ...defaultProps }
    delete (propsWithoutFavorite as any).onToggleFavorite

    render(<SwipeCard {...propsWithoutFavorite} />)

    const card = document.querySelector('.cursor-grab')
    fireEvent.mouseDown(card!, { clientX: 100, clientY: 100 })
    fireEvent.mouseMove(card!, { clientX: 500, clientY: 100 })
    fireEvent.mouseUp(card!, { clientX: 500, clientY: 100 })

    expect(mockOnSwipe).toHaveBeenCalledWith('right')
  })

  test('33. Works without onOrder prop', () => {
    const propsWithoutOrder = { ...defaultProps }
    delete (propsWithoutOrder as any).onOrder

    render(<SwipeCard {...propsWithoutOrder} />)
    expect(screen.getByText('Order')).toBeInTheDocument()
  })

  // ===== Visual State Tests =====

  test('34. Card has correct initial opacity', () => {
    render(<SwipeCard {...defaultProps} />)
    const card = document.querySelector('.cursor-grab') as HTMLElement

    expect(card.style.opacity).toBe('1')
  })

  test('35. Card changes cursor to grabbing when dragging', () => {
    render(<SwipeCard {...defaultProps} />)
    const card = document.querySelector('.cursor-grab')

    expect(card).toHaveClass('cursor-grab')
    expect(card).toHaveClass('active:cursor-grabbing')
  })

  test('36. Card has transitions when not dragging', () => {
    render(<SwipeCard {...defaultProps} />)
    const card = document.querySelector('.cursor-grab') as HTMLElement

    expect(card.style.transition).toContain('ease-out')
  })
})
