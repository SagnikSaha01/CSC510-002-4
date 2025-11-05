import { renderHook, act } from '@testing-library/react'
import { useRecommendations, type Recommendation } from '@/hooks/use-recommendations'

describe('useRecommendations Hook', () => {
  const mockRecommendations: Recommendation[] = [
    {
      id: 1,
      menu_item_id: 'menu-1',
      restaurant_id: 'rest-1',
      restaurant_name: 'Restaurant A',
      title: 'Pizza',
      description: 'Delicious pizza',
      image: '/pizza.jpg',
      price: 15.99,
      distance: 2.5,
      rating: 4.5,
      category: 'Italian',
    },
    {
      id: 2,
      menu_item_id: 'menu-2',
      restaurant_id: 'rest-2',
      restaurant_name: 'Restaurant B',
      title: 'Burger',
      description: 'Tasty burger',
      image: '/burger.jpg',
      price: 10.99,
      distance: 1.2,
      rating: 4.8,
      category: 'American',
    },
    {
      id: 3,
      menu_item_id: 'menu-3',
      restaurant_id: 'rest-3',
      restaurant_name: 'Restaurant C',
      title: 'Sushi',
      description: 'Fresh sushi',
      image: '/sushi.jpg',
      price: 20.00,
      distance: 3.5,
      rating: 4.2,
      category: 'Japanese',
    },
  ]

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  // ===== Initialization Tests =====

  test('1. Initializes with empty favorites', () => {
    const { result } = renderHook(() => useRecommendations())

    expect(result.current.favorites).toEqual([])
  })

  test('2. Initializes with relevance sort by default', () => {
    const { result } = renderHook(() => useRecommendations())

    expect(result.current.sortBy).toBe('relevance')
  })

  test('3. Initializes with showFavoritesOnly as false', () => {
    const { result } = renderHook(() => useRecommendations())

    expect(result.current.showFavoritesOnly).toBe(false)
  })

  test('4. Loads favorites from localStorage on mount', () => {
    localStorage.setItem('vibe-eats-favorites', JSON.stringify([1, 2, 3]))

    const { result } = renderHook(() => useRecommendations())

    expect(result.current.favorites).toEqual([1, 2, 3])
  })

  test('5. Handles invalid localStorage data gracefully', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
    localStorage.setItem('vibe-eats-favorites', 'invalid json')

    const { result } = renderHook(() => useRecommendations())

    expect(result.current.favorites).toEqual([])
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to load favorites:',
      expect.any(Error)
    )

    consoleErrorSpy.mockRestore()
  })

  // ===== toggleFavorite Tests =====

  test('6. Adds item to favorites', () => {
    const { result } = renderHook(() => useRecommendations())

    act(() => {
      result.current.toggleFavorite(1)
    })

    expect(result.current.favorites).toContain(1)
  })

  test('7. Removes item from favorites', () => {
    const { result } = renderHook(() => useRecommendations())

    act(() => {
      result.current.toggleFavorite(1)
    })

    expect(result.current.favorites).toContain(1)

    act(() => {
      result.current.toggleFavorite(1)
    })

    expect(result.current.favorites).not.toContain(1)
  })

  test('8. Adds multiple items to favorites', () => {
    const { result } = renderHook(() => useRecommendations())

    act(() => {
      result.current.toggleFavorite(1)
      result.current.toggleFavorite(2)
      result.current.toggleFavorite(3)
    })

    expect(result.current.favorites).toEqual([1, 2, 3])
  })

  test('9. Saves favorites to localStorage', () => {
    const { result } = renderHook(() => useRecommendations())

    act(() => {
      result.current.toggleFavorite(1)
      result.current.toggleFavorite(2)
    })

    const savedFavorites = JSON.parse(localStorage.getItem('vibe-eats-favorites') || '[]')
    expect(savedFavorites).toEqual([1, 2])
  })

  test('10. Updates localStorage when removing favorite', () => {
    const { result } = renderHook(() => useRecommendations())

    act(() => {
      result.current.toggleFavorite(1)
      result.current.toggleFavorite(2)
    })

    act(() => {
      result.current.toggleFavorite(1)
    })

    const savedFavorites = JSON.parse(localStorage.getItem('vibe-eats-favorites') || '[]')
    expect(savedFavorites).toEqual([2])
  })

  // ===== isFavorite Tests =====

  test('11. isFavorite returns true for favorited items', () => {
    const { result } = renderHook(() => useRecommendations())

    act(() => {
      result.current.toggleFavorite(1)
    })

    expect(result.current.isFavorite(1)).toBe(true)
  })

  test('12. isFavorite returns false for non-favorited items', () => {
    const { result } = renderHook(() => useRecommendations())

    expect(result.current.isFavorite(1)).toBe(false)
  })

  test('13. isFavorite updates after toggle', () => {
    const { result } = renderHook(() => useRecommendations())

    expect(result.current.isFavorite(1)).toBe(false)

    act(() => {
      result.current.toggleFavorite(1)
    })

    expect(result.current.isFavorite(1)).toBe(true)

    act(() => {
      result.current.toggleFavorite(1)
    })

    expect(result.current.isFavorite(1)).toBe(false)
  })

  // ===== sortRecommendations Tests =====

  test('14. Sorts by price (low to high)', () => {
    const { result } = renderHook(() => useRecommendations())

    act(() => {
      result.current.setSortBy('price-low')
    })

    const sorted = result.current.sortRecommendations(mockRecommendations)

    expect(sorted[0].title).toBe('Burger') // $10.99
    expect(sorted[1].title).toBe('Pizza') // $15.99
    expect(sorted[2].title).toBe('Sushi') // $20.00
  })

  test('15. Sorts by price (high to low)', () => {
    const { result } = renderHook(() => useRecommendations())

    act(() => {
      result.current.setSortBy('price-high')
    })

    const sorted = result.current.sortRecommendations(mockRecommendations)

    expect(sorted[0].title).toBe('Sushi') // $20.00
    expect(sorted[1].title).toBe('Pizza') // $15.99
    expect(sorted[2].title).toBe('Burger') // $10.99
  })

  test('16. Sorts by rating (high to low)', () => {
    const { result } = renderHook(() => useRecommendations())

    act(() => {
      result.current.setSortBy('rating')
    })

    const sorted = result.current.sortRecommendations(mockRecommendations)

    expect(sorted[0].title).toBe('Burger') // 4.8
    expect(sorted[1].title).toBe('Pizza') // 4.5
    expect(sorted[2].title).toBe('Sushi') // 4.2
  })

  test('17. Sorts by distance (low to high)', () => {
    const { result } = renderHook(() => useRecommendations())

    act(() => {
      result.current.setSortBy('distance')
    })

    const sorted = result.current.sortRecommendations(mockRecommendations)

    expect(sorted[0].title).toBe('Burger') // 1.2 km
    expect(sorted[1].title).toBe('Pizza') // 2.5 km
    expect(sorted[2].title).toBe('Sushi') // 3.5 km
  })

  test('18. Relevance sort keeps original order', () => {
    const { result } = renderHook(() => useRecommendations())

    act(() => {
      result.current.setSortBy('relevance')
    })

    const sorted = result.current.sortRecommendations(mockRecommendations)

    expect(sorted[0].title).toBe('Pizza')
    expect(sorted[1].title).toBe('Burger')
    expect(sorted[2].title).toBe('Sushi')
  })

  test('19. Sorting does not mutate original array', () => {
    const { result } = renderHook(() => useRecommendations())

    act(() => {
      result.current.setSortBy('price-low')
    })

    const originalOrder = [...mockRecommendations]
    result.current.sortRecommendations(mockRecommendations)

    expect(mockRecommendations).toEqual(originalOrder)
  })

  test('20. Handles empty recommendations array', () => {
    const { result } = renderHook(() => useRecommendations())

    act(() => {
      result.current.setSortBy('price-low')
    })

    const sorted = result.current.sortRecommendations([])

    expect(sorted).toEqual([])
  })

  test('21. Handles single item array', () => {
    const { result } = renderHook(() => useRecommendations())

    act(() => {
      result.current.setSortBy('price-low')
    })

    const singleItem = [mockRecommendations[0]]
    const sorted = result.current.sortRecommendations(singleItem)

    expect(sorted).toEqual(singleItem)
  })

  // ===== setSortBy Tests =====

  test('22. Updates sortBy state', () => {
    const { result } = renderHook(() => useRecommendations())

    act(() => {
      result.current.setSortBy('price-low')
    })

    expect(result.current.sortBy).toBe('price-low')
  })

  test('23. Can change sort option multiple times', () => {
    const { result } = renderHook(() => useRecommendations())

    act(() => {
      result.current.setSortBy('price-low')
    })
    expect(result.current.sortBy).toBe('price-low')

    act(() => {
      result.current.setSortBy('rating')
    })
    expect(result.current.sortBy).toBe('rating')

    act(() => {
      result.current.setSortBy('distance')
    })
    expect(result.current.sortBy).toBe('distance')
  })

  // ===== setShowFavoritesOnly Tests =====

  test('24. Updates showFavoritesOnly state', () => {
    const { result } = renderHook(() => useRecommendations())

    act(() => {
      result.current.setShowFavoritesOnly(true)
    })

    expect(result.current.showFavoritesOnly).toBe(true)
  })

  test('25. Toggles showFavoritesOnly', () => {
    const { result } = renderHook(() => useRecommendations())

    act(() => {
      result.current.setShowFavoritesOnly(true)
    })
    expect(result.current.showFavoritesOnly).toBe(true)

    act(() => {
      result.current.setShowFavoritesOnly(false)
    })
    expect(result.current.showFavoritesOnly).toBe(false)
  })

  // ===== Integration Tests =====

  test('26. Persists favorites across re-renders', () => {
    const { result, rerender } = renderHook(() => useRecommendations())

    act(() => {
      result.current.toggleFavorite(1)
      result.current.toggleFavorite(2)
    })

    rerender()

    expect(result.current.favorites).toEqual([1, 2])
  })

  test('27. Maintains sort option across favorites changes', () => {
    const { result } = renderHook(() => useRecommendations())

    act(() => {
      result.current.setSortBy('price-low')
      result.current.toggleFavorite(1)
    })

    expect(result.current.sortBy).toBe('price-low')
  })

  test('28. Returns all expected properties', () => {
    const { result } = renderHook(() => useRecommendations())

    expect(result.current).toHaveProperty('favorites')
    expect(result.current).toHaveProperty('toggleFavorite')
    expect(result.current).toHaveProperty('isFavorite')
    expect(result.current).toHaveProperty('sortBy')
    expect(result.current).toHaveProperty('setSortBy')
    expect(result.current).toHaveProperty('showFavoritesOnly')
    expect(result.current).toHaveProperty('setShowFavoritesOnly')
    expect(result.current).toHaveProperty('sortRecommendations')
  })

  test('29. All functions are callable', () => {
    const { result } = renderHook(() => useRecommendations())

    expect(typeof result.current.toggleFavorite).toBe('function')
    expect(typeof result.current.isFavorite).toBe('function')
    expect(typeof result.current.setSortBy).toBe('function')
    expect(typeof result.current.setShowFavoritesOnly).toBe('function')
    expect(typeof result.current.sortRecommendations).toBe('function')
  })

  test('30. Handles rapid favorite toggles', () => {
    const { result } = renderHook(() => useRecommendations())

    act(() => {
      result.current.toggleFavorite(1)
      result.current.toggleFavorite(1)
      result.current.toggleFavorite(1)
      result.current.toggleFavorite(1)
    })

    expect(result.current.favorites).toEqual([])
  })
})
