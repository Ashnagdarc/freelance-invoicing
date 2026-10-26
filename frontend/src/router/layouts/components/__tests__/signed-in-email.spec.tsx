import { screen, renderWithProviders } from '@/__tests__/test-utils'
import type { AuthUser } from '@/features/auth/types'
import { SignedInEmail } from '../signed-in-email'

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

describe('SignedInEmail', () => {
  it('shows the email of the signed-in freelancer', () => {
    useAuthMock.mockReturnValue({
      user,
      isLoading: false,
      isAuthenticated: true,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      sendPasswordResetEmail: vi.fn(),
      confirmPasswordReset: vi.fn(),
    })

    renderWithProviders(<SignedInEmail />)

    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
  })

  it('renders nothing when nobody is signed in', () => {
    useAuthMock.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      sendPasswordResetEmail: vi.fn(),
      confirmPasswordReset: vi.fn(),
    })

    renderWithProviders(<SignedInEmail />)

    expect(screen.queryByText('ada@example.com')).not.toBeInTheDocument()
  })
})
