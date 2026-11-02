import { useState } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { createTestQueryClient } from '@/__tests__/test-utils'
import type { AuthUser } from '@/features/auth/types'
import { Provider } from '@/shared/components/ui/provider'
import { routes } from '@/router/routes'
import { SESSION_HIDDEN_ATTR } from '@/features/auth/session-guard'

vi.mock('@/features/auth/hooks/use-auth', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '@/features/auth/hooks/use-auth'

const useAuthMock = vi.mocked(useAuth)

const user: AuthUser = {
  id: '1',
  email: 'ada@example.com',
  displayName: 'Ada',
  photoURL: null,
  emailVerified: true,
  providerId: 'password',
}

const pages = [
  '/',
  '/dashboard',
  '/support',
  '/terms',
  '/privacy',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password/token',
  '/missing-page',
]

function authValue(signedIn: boolean, logout: () => Promise<void>) {
  return {
    user: signedIn ? user : null,
    isLoading: false,
    isAuthenticated: signedIn,
    error: null,
    login: vi.fn(),
    register: vi.fn(),
    logout,
    sendPasswordResetEmail: vi.fn(),
    confirmPasswordReset: vi.fn(),
  }
}

function renderRouter(router: ReturnType<typeof createMemoryRouter>, signedIn: boolean) {
  useAuthMock.mockReturnValue(authValue(signedIn, vi.fn()))
  return render(
    <Provider>
      <QueryClientProvider client={createTestQueryClient()}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Provider>,
  )
}

describe('Sign out', () => {
  afterEach(() => {
    document.documentElement.removeAttribute(SESSION_HIDDEN_ATTR)
  })

  it.each(pages)('is on %s while a freelancer is signed in', (path) => {
    renderRouter(createMemoryRouter(routes, { initialEntries: [path] }), true)

    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
  })

  it('is absent when nobody is signed in', () => {
    renderRouter(createMemoryRouter(routes, { initialEntries: ['/'] }), false)

    expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument()
  })

  it('opens the sign-in page instead of a private page when the session is gone', async () => {
    renderRouter(createMemoryRouter(routes, { initialEntries: ['/dashboard'] }), false)

    expect(screen.queryByRole('heading', { name: 'Dashboard' })).not.toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getByText('Enter your credentials to access your account.')).toBeInTheDocument()
    })
  })

  it('opens the public front page, and Back shows the sign-in page without the previous screen', async () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ['/support', '/dashboard'],
      initialIndex: 1,
    })
    const queryClient = createTestQueryClient()

    function SignedInApp() {
      const [signedIn, setSignedIn] = useState(true)
      useAuthMock.mockReturnValue(
        authValue(signedIn, async () => {
          setSignedIn(false)
        }),
      )

      return (
        <Provider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </Provider>
      )
    }

    render(<SignedInApp />)
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }))

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/')
      expect(screen.getByRole('link', { name: /Get started/ })).toBeInTheDocument()
    })
    expect(screen.queryByRole('heading', { name: 'Dashboard' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sign out' })).not.toBeInTheDocument()
    expect(screen.queryByText('ada@example.com')).not.toBeInTheDocument()

    await act(async () => {
      await router.navigate(-1)
    })

    await waitFor(() => {
      expect(screen.getByText('Enter your credentials to access your account.')).toBeInTheDocument()
    })
    expect(router.state.location.pathname).toBe('/login')
    expect(screen.queryByRole('heading', { name: 'Dashboard' })).not.toBeInTheDocument()
    expect(screen.queryByText('ada@example.com')).not.toBeInTheDocument()
  })
})
