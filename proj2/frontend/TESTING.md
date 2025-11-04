# Frontend Testing Guide - Google Auth

## Overview
This document describes the Jest testing setup for the Google Authentication feature in the Vibe Eats application.

## Test Coverage Results

```
----------------------------|---------|----------|---------|---------|-------------------
File                        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------------------|---------|----------|---------|---------|-------------------
All files                   |   98.14 |     90.9 |   83.33 |      98 |
 components                 |     100 |      100 |     100 |     100 |
  google-sign-in-button.tsx |     100 |      100 |     100 |     100 |
 contexts                   |   97.61 |       90 |      80 |   97.36 |
  auth-context.tsx          |   97.61 |       90 |      80 |   97.36 | 27
----------------------------|---------|----------|---------|---------|-------------------

Test Suites: 2 passed, 2 total
Tests:       36 passed, 36 total
```

## Setup

### Dependencies Installed
- `jest` - JavaScript testing framework
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom jest matchers for DOM testing
- `@testing-library/user-event` - User interaction simulation
- `@testing-library/dom` - DOM testing utilities
- `jest-environment-jsdom` - Browser-like environment for Jest
- `@types/jest` - TypeScript types for Jest

### Configuration Files
- `jest.config.js` - Jest configuration with Next.js support
- `jest.setup.js` - Global test setup
- `__tests__/test-utils.tsx` - Testing utilities and helpers

## Test Files

### 1. Auth Context Tests (`__tests__/contexts/auth-context.test.tsx`)

Tests for the authentication context covering:

#### Initialization Tests (5 tests)
- Initial auth state (null user, loading true)
- Loading existing session on mount
- No existing session handling
- Auth state change listener setup
- Subscription cleanup on unmount

#### Sign In Tests (4 tests)
- Successful Google sign-in initiation
- Sign-in error handling
- Redirect URL configuration
- Network error handling

#### Sign Out Tests (2 tests)
- Successful sign-out
- Sign-out error handling

#### Auth State Changes (3 tests)
- User and session updates on SIGNED_IN event
- Clearing user and session on SIGNED_OUT event
- Loading state updates after auth changes

#### useAuth Hook (1 test)
- Provides all required context values

#### Edge Cases (3 tests)
- Rapid sign-in attempts
- Session with missing user metadata
- Null session user handling

**Total: 18 tests**
**Coverage: 97.61% statements, 90% branches, 80% functions, 97.36% lines**

### 2. Google Sign-In Button Tests (`__tests__/components/google-sign-in-button.test.tsx`)

Tests for the Google Sign-In button component covering:

#### Rendering Tests (4 tests)
- Button renders with correct text
- Google logo SVG display
- CSS classes application
- Initial enabled state

#### User Interaction Tests (5 tests)
- Click triggers signInWithGoogle
- Loading state display during sign-in
- Loading spinner display
- Button disabled during loading
- Prevention of multiple clicks

#### Error Handling Tests (3 tests)
- Graceful error handling
- Console error logging
- Loading state reset after error

#### Accessibility Tests (3 tests)
- Keyboard accessibility
- Proper button role
- Disabled state for accessibility

#### Visual States (3 tests)
- Default text display
- Loading text display
- Google logo in all states

#### Integration Tests (1 test)
- Integration with AuthContext

**Total: 18 tests**
**Coverage: 100% statements, 100% branches, 100% functions, 100% lines**

## Running Tests

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

### Run Coverage for Auth Files Only
```bash
npm run test:coverage:auth
```

### Alternative Coverage Command
```bash
npm test -- --coverage --collectCoverageFrom="contexts/**/*.{tsx,ts}" --collectCoverageFrom="components/google-sign-in-button.tsx"
```

## Test Structure

### Mocking Strategy
- **Supabase Client**: Mocked using `jest.mock()` with factory function
- **Next.js Router**: Mocked using `jest.mock()` for `next/navigation`
- **Mock Data**: Predefined mock user and session data for consistent testing

### Common Patterns
```typescript
// Setup
beforeEach(() => {
  jest.clearAllMocks()
  mockSupabaseClient.auth.getSession.mockResolvedValue({
    data: { session: null },
    error: null,
  })
})

// Testing async operations
await act(async () => {
  await result.current.signInWithGoogle()
})

await waitFor(() => {
  expect(result.current.loading).toBe(false)
})
```

## Known Issues

### Act Warnings
Some tests produce "act(...)" warnings in the console. These are informational and don't affect test validity. They occur during the auth context initialization when the loading state is set asynchronously.

## Coverage Thresholds

Configured in `jest.config.js`:
```javascript
coverageThreshold: {
  global: {
    branches: 70,
    functions: 70,
    lines: 70,
    statements: 70,
  },
}
```

Current coverage **exceeds all thresholds**:
- Statements: 98.14% (target: 70%)
- Branches: 90.9% (target: 70%)
- Functions: 83.33% (target: 70%)
- Lines: 98% (target: 70%)

## Best Practices

1. **Always clear mocks** in `beforeEach()` to ensure test isolation
2. **Use `act()` and `waitFor()`** for async operations to avoid race conditions
3. **Mock external dependencies** (Supabase, Router) to keep tests fast and deterministic
4. **Test user interactions** using `@testing-library/user-event` for realistic simulations
5. **Test error scenarios** to ensure graceful error handling
6. **Test accessibility** features to ensure inclusive design

## Adding New Tests

When adding new auth-related features:

1. Create test file in `__tests__/` directory
2. Import and use test utilities from `__tests__/test-utils.tsx`
3. Mock Supabase client and other external dependencies
4. Write tests covering happy path, error cases, and edge cases
5. Ensure coverage remains above thresholds
6. Run tests locally before committing

## CI/CD Integration

Add to your CI pipeline:
```yaml
- name: Run tests
  run: |
    cd frontend
    npm test -- --coverage --ci
```

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Next.js Applications](https://nextjs.org/docs/testing)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
