# Cart Page Test Suite

## Overview

Comprehensive test suite with **63 tests** for the shopping cart functionality, including cart display, item management, quantity controls, checkout flow, and success dialog.

## Quick Start

```bash
# Run cart tests only
npm run test:cart

# Run with coverage
npm run test:cart:coverage

# Run in watch mode
npm run test:watch -- __tests__/app/cart
```

## Test File Location

- **Test File**: `__tests__/app/cart/page.test.tsx`
- **Component Under Test**: `app/cart/page.tsx`
- **Test Documentation**: `__tests__/app/cart/README.md`

## Test Summary

| Category | Tests | Description |
|----------|-------|-------------|
| Initial Rendering & State | 7 | Component mounting, loading, authentication |
| Cart Items Display | 8 | Item rendering, prices, images, quantities |
| Quantity Controls | 6 | Increment/decrement, validation |
| Remove Item | 4 | Item removal functionality |
| Order Summary | 6 | Calculations and dynamic updates |
| Checkout Button | 7 | Checkout flow and states |
| Success Dialog | 10 | Dialog appearance and interactions |
| Loading States | 3 | Spinners and transitions |
| Hook Integration | 5 | useCart and useAuth integration |
| Error Handling | 3 | Graceful degradation |
| Accessibility | 4 | ARIA labels, alt text |
| **Total** | **63** | **Complete frontend coverage** |

## Key Features Tested

### ✅ Cart Management
- Load cart data from backend API
- Display cart items with images, prices, quantities
- Handle empty cart state
- Show authentication requirements

### ✅ Item Operations
- Update item quantities (increment/decrement)
- Remove items from cart
- Prevent quantity below 1
- Optimistic UI updates

### ✅ Order Summary
- Calculate item count
- Calculate subtotal
- Display total
- Update dynamically on changes

### ✅ Checkout Flow
- Process checkout
- Remove all items from cart
- Show loading state
- Display success dialog
- Clear cart after checkout

### ✅ User Experience
- Loading spinners
- Error handling
- Success notifications
- Accessible UI elements

## Running Tests

### All Tests
```bash
npm test
```

### Cart Tests Only
```bash
npm run test:cart
```

### With Coverage Report
```bash
npm run test:cart:coverage
```

### Watch Mode (for development)
```bash
npm run test:watch -- __tests__/app/cart
```

### Specific Test Pattern
```bash
npm test -- --testNamePattern="Checkout"
```

## Coverage Targets

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

## Mock Configuration

The tests mock the following dependencies:

1. **`@/hooks/use-cart`**: Cart operations (fetch, add, remove, count)
2. **`@/contexts/auth-context`**: Authentication state and methods
3. **`@/components/header`**: Simplified Header component

## Test Data

Sample cart with 2 items:
- Margherita Pizza: $12.99 × 2 = $25.98
- Caesar Salad: $8.50 × 1 = $8.50
- **Total**: $34.48

## Common Commands

```bash
# Run all tests
npm test

# Run cart tests
npm run test:cart

# Run with coverage
npm run test:coverage

# Run specific test file
npm test __tests__/app/cart/page.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="dialog"

# Watch mode
npm run test:watch

# Update snapshots
npm test -- --updateSnapshot
```

## Continuous Integration

These tests are designed to run in CI/CD pipelines. They:

- Use mocked dependencies (no real API calls)
- Run quickly (isolated unit tests)
- Provide clear failure messages
- Generate coverage reports

## Documentation

- **Detailed Test Documentation**: `__tests__/app/cart/README.md`
- **Main Testing Docs**: `TESTING.md`
- **Jest Configuration**: `jest.config.js`
- **Test Setup**: `jest.setup.js`

## Test Statistics

- **Total Tests**: 63
- **Test File Size**: ~900 lines
- **Coverage Target**: 70%
- **Execution Time**: ~3-5 seconds
- **Dependencies Mocked**: 3

## Next Steps

To run the tests:

1. **Navigate to frontend directory**:
   ```bash
   cd proj2/frontend
   ```

2. **Install dependencies** (if not already installed):
   ```bash
   npm install
   ```

3. **Run the tests**:
   ```bash
   npm run test:cart
   ```

4. **View coverage report**:
   ```bash
   npm run test:cart:coverage
   ```

The coverage report will be generated in `coverage/lcov-report/index.html`.

## Success Criteria

All 63 tests should pass with:
- ✅ No errors
- ✅ No warnings
- ✅ Coverage above 70% for all metrics
- ✅ Execution time under 10 seconds

Enjoy testing! 🎉
