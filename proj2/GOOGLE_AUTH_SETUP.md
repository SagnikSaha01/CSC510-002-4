# Google Authentication with Supabase Setup Guide

This guide will help you set up Google authentication for the Vibe Eats application using Supabase.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- A Google Cloud account (sign up at https://console.cloud.google.com)

## Step 1: Set Up Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** user type
   - Fill in the required fields (App name, User support email, Developer contact)
   - Add scopes: `email`, `profile`, `openid`
   - Save and continue
6. Back at Create OAuth client ID:
   - Application type: **Web application**
   - Name: `Vibe Eats`
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - Your production URL (e.g., `https://yourdomain.com`)
   - Authorized redirect URIs:
     - `https://YOUR_SUPABASE_PROJECT_URL/auth/v1/callback`
     - Example: `https://abcdefghijklmnop.supabase.co/auth/v1/callback`
7. Click **Create**
8. Copy the **Client ID** and **Client Secret** - you'll need these for Supabase

## Step 2: Configure Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select your existing project
3. Navigate to **Authentication** > **Providers**
4. Find **Google** in the list and toggle it on
5. Enter your Google OAuth credentials:
   - **Client ID**: Paste the Client ID from Google
   - **Client Secret**: Paste the Client Secret from Google
6. Click **Save**

## Step 3: Get Supabase Configuration

1. In your Supabase project, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://abcdefghijklmnop.supabase.co`)
   - **anon public** key (the API key under "Project API keys")

## Step 4: Configure Your Frontend Environment

1. Navigate to the `frontend` directory
2. Create a `.env.local` file (copy from `.env.local.example`):
   ```bash
   cp .env.local.example .env.local
   ```
3. Open `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Save the file

## Step 5: Configure Redirect URLs in Supabase

1. In Supabase Dashboard, go to **Authentication** > **URL Configuration**
2. Add the following to **Redirect URLs**:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)
3. Set **Site URL** to:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)

## Step 6: Test the Authentication

1. Start your frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```
2. Open your browser to `http://localhost:3000`
3. Click on **Sign In** button in the header
4. You should see the login page with a **Continue with Google** button
5. Click the button and complete the Google sign-in flow
6. After successful authentication, you should be redirected back to the home page
7. Your user avatar and dropdown menu should appear in the header

## Features Implemented

### Authentication Components

1. **Login Page** (`/login`)
   - Beautiful, modern design with gradient background
   - Google sign-in button with loading states
   - Error handling and display
   - Automatic redirect if already logged in

2. **Auth Callback** (`/auth/callback`)
   - Handles the OAuth callback from Google
   - Shows loading state during authentication
   - Error handling with redirect to login on failure

3. **Header Component Updates**
   - User avatar with profile picture from Google
   - Dropdown menu with:
     - User name and email display
     - Profile link
     - My Orders link
     - Sign out button
   - Sign In button when not authenticated
   - Loading state during authentication check

4. **Auth Context**
   - Global authentication state management
   - `useAuth()` hook for accessing user data
   - Sign in and sign out functions
   - Automatic session management

## File Structure

```
frontend/
├── app/
│   ├── auth/
│   │   └── callback/
│   │       └── page.tsx          # OAuth callback handler
│   ├── login/
│   │   └── page.tsx              # Login page
│   └── layout.tsx                # Updated with AuthProvider
├── components/
│   ├── google-sign-in-button.tsx # Google sign-in button
│   └── header.tsx                # Updated with auth UI
├── contexts/
│   └── auth-context.tsx          # Authentication context
├── lib/
│   └── supabase.ts               # Supabase client configuration
└── .env.local                    # Environment variables (create this!)
```

## Using Authentication in Your Components

You can use the `useAuth` hook in any component to access authentication state:

```tsx
"use client"

import { useAuth } from '@/contexts/auth-context'

export default function MyComponent() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Please sign in</div>
  }

  return (
    <div>
      <p>Welcome, {user.user_metadata?.full_name}!</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

## Protecting Routes

To protect routes and require authentication, you can create a protected route wrapper:

```tsx
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'

export default function ProtectedPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return <div>Protected content</div>
}
```

## Troubleshooting

### Issue: "Invalid redirect URL"
- Make sure you've added all redirect URLs in both Google Cloud Console and Supabase
- Check that URLs match exactly (including http/https)

### Issue: "Authentication failed"
- Verify your Google Client ID and Secret in Supabase are correct
- Ensure Google OAuth is enabled in Supabase Authentication > Providers

### Issue: "Environment variables not found"
- Make sure `.env.local` exists in the `frontend` directory
- Restart your Next.js development server after adding environment variables
- Verify variable names start with `NEXT_PUBLIC_`

### Issue: User data not showing
- Check browser console for errors
- Verify Supabase URL and anon key are correct
- Ensure you're using the correct Supabase project

## Security Notes

- Never commit `.env.local` to version control (it's in `.gitignore`)
- Keep your Supabase anon key safe - it's meant to be public but don't share it unnecessarily
- The Client Secret from Google should NEVER be exposed in frontend code (it stays in Supabase)
- For production, make sure to use HTTPS for all redirect URLs

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
