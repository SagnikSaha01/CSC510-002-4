# Copilot Instructions for CSC510-002-4

## Project Architecture
- **Backend (`proj2/backend`)**: Flask API for restaurant recommendations, cart, and Google Auth. Integrates with Supabase and OpenAI. Key files: `app.py`, `ai_service.py`, `cartRoutes.py`, `restaurantRoutes.py`.
- **Frontend (`proj2/frontend`)**: Next.js app with React components. Handles UI, Google Auth, and communicates with backend via API routes. Key files: `components/`, `contexts/auth-context.tsx`, `app/`, `lib/supabase.ts`.
- **Testing**: Backend uses `pytest` (see `AI_SERVICE_TESTING.md`), frontend uses `jest` and React Testing Library (see `TESTING.md`).

## Developer Workflows
- **Backend**:
  - Install dependencies: `pip install -r requirements.txt` (in `backend`)
  - Run tests: `python -m pytest` or use coverage commands from `AI_SERVICE_TESTING.md`
  - Lint: `flake8 .` (strict errors) and `black --check .`
  - Environment: `.env` file required for Supabase/OpenAI keys (dummy values used in CI)
- **Frontend**:
  - Install dependencies: `pnpm install` (in `frontend`)
  - Run dev server: `pnpm dev`
  - Run tests: `pnpm test` or coverage commands in `TESTING.md`
  - Lint: `pnpm lint`

## Conventions & Patterns
- **Backend**:
  - All external API calls (OpenAI, Supabase) are mocked in tests; see `AI_SERVICE_TESTING.md` for fixtures and mocking strategy.
  - Error handling is explicit; test error paths for invalid JSON, API errors, and missing fields.
  - Test classes group related functionality; maintain 100% coverage for `ai_service.py`.
- **Frontend**:
  - Use React context for auth state (`auth-context.tsx`).
  - Mock Supabase and Next.js router in tests using `jest.mock()`.
  - Test accessibility and error scenarios for UI components.
  - Coverage thresholds set in `jest.config.js` (70% minimum, current coverage >98%).

## Integration Points
- **Supabase**: Used for auth and data storage. Backend and frontend both integrate; see `lib/supabase.ts` and `.env` config.
- **OpenAI**: Used for AI recommendations in backend (`ai_service.py`).
- **Google Auth**: Frontend UI (`google-sign-in-button.tsx`), backend routes, and tests in both (`test_google_auth.py`, `auth-context.test.tsx`).

## CI/CD
- **GitHub Actions**: Workflow in `.github/workflows/ci.yml` runs lint, tests, and uploads coverage for both backend and frontend. Uses dummy `.env` values for CI.

## Key Files & Docs
- `README.md`: Project overview
- `AI_SERVICE_TESTING.md`: Backend AI service test strategy
- `TESTING.md`: Frontend test strategy
- `.github/workflows/ci.yml`: CI pipeline

## Example Patterns
- Backend test:
  ```python
  @patch('ai_service.openai_client')
  def test_successful_recommendation_generation(self, mock_client, sample_restaurants, sample_ai_response, mock_openai_completion):
      mock_openai_completion.choices[0].message.content = sample_ai_response
      mock_client.chat.completions.create.return_value = mock_openai_completion
      result = get_ai_recommendations("happy", sample_restaurants)
      assert isinstance(result, list)
  ```
- Frontend test:
  ```typescript
  jest.mock("@supabase/supabase-js", () => ({
    createClient: jest.fn(() => mockSupabaseClient)
  }))
  ```

---

If any section is unclear or missing, please provide feedback to improve these instructions.