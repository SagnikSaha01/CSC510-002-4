# Cart Page Tests

Comprehensive test suite for the shopping cart page functionality.

## Test Coverage

This test suite includes **63 tests** covering:

### Test Categories

1. **Initial Rendering & State** (7 tests)
   - Component mounting and initial state
   - Loading states
   - Authentication checks
   - Empty cart states

2. **Cart Items Display** (8 tests)
   - Item rendering
   - Price display
   - Image handling
   - Quantity display
   - Subtotal calculations

3. **Quantity Controls** (6 tests)
   - Increment/decrement functionality
   - Minimum quantity validation
   - UI updates
   - API integration

4. **Remove Item** (4 tests)
   - Item removal functionality
   - UI updates
   - API integration
   - Styling

5. **Order Summary** (6 tests)
   - Item count calculations
   - Subtotal calculations
   - Total calculations
   - Dynamic updates

6. **Checkout Button** (7 tests)
   - Button rendering
   - Loading states
   - Disabled states
   - API integration
   - Styling

7. **Success Dialog** (10 tests)
   - Dialog appearance
   - Content verification
   - User interactions
   - Navigation
   - Styling

8. **Loading States** (3 tests)
   - Loading spinners
   - Loading messages
   - State transitions

9. **Hook Integration** (5 tests)
   - useCart hook
   - useAuth hook
   - Data fetching
   - User changes

10. **Error Handling** (3 tests)
    - Graceful degradation
    - Error recovery
    - UI stability

11. **Accessibility** (4 tests)
    - Button labels
    - Image alt text
    - Link accessibility
    - Form labels

## Running the Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test __tests__/app/cart/page.test.tsx
```

### Run Tests Matching Pattern
```bash
npm test -- --testNamePattern="Checkout"
```

## Test Structure

Each test follows this pattern:

```typescript
test('Description of what is being tested', async () => {
  // Arrange: Set up test data and mocks
  render(<CartPage />)
  
  // Act: Perform actions (clicks, inputs, etc.)
  await waitFor(() => {
    const button = screen.getByRole('button', { name: /checkout/i })
    fireEvent.click(button)
  })
  
  // Assert: Verify expected outcomes
  await waitFor(() => {
    expect(screen.getByText('Order Successful!')).toBeInTheDocument()
  })
})
```

## Mocking Strategy

The tests use Jest mocks for:

- **`useCart` hook**: Mocks cart operations (fetch, add, remove)
- **`useAuth` hook**: Mocks authentication state
- **`Header` component**: Simplified mock to isolate cart page testing

### Example Mock Setup

```typescript
mockUseCart.mockReturnValue({
  cart: [],
  fetchCart: mockFetchCart,
  addToCart: mockAddToCart,
  removeFromCart: mockRemoveFromCart,
  isLoading: false,
  error: null,
  getCartCount: mockGetCartCount,
})
```

## Test Data

Sample cart items used in tests:

```typescript
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
```

## Coverage Goals

Current coverage targets (configured in `jest.config.js`):

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Debugging Tests

### View Test Output
```bash
npm test -- --verbose
```

### Debug Specific Test
```bash
npm test -- --testNamePattern="Success dialog appears" --verbose
```

### Check Coverage for Specific File
```bash
npm test -- --coverage --collectCoverageFrom="app/cart/page.tsx"
```

## Common Issues

### Issue: Tests timing out
**Solution**: Increase timeout in test:
```typescript
test('my test', async () => {
  // ... test code
}, 10000) // 10 second timeout
```

### Issue: "Cannot find module" errors
**Solution**: Ensure path aliases in `jest.config.js` match `tsconfig.json`

### Issue: Mock not working
**Solution**: Clear mocks in `beforeEach`:
```typescript
beforeEach(() => {
  jest.clearAllMocks()
})
```

## Adding New Tests

When adding new tests:

1. Follow the existing naming convention: `test('N. Description', ...)`
2. Group related tests together
3. Use descriptive test names
4. Include both positive and negative test cases
5. Test edge cases and error conditions
6. Maintain isolation between tests

## Related Documentation

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Next.js Applications](https://nextjs.org/docs/testing)
- [Main Testing Documentation](../../TESTING.md)
