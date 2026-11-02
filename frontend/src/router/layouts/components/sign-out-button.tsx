import { Button } from '@chakra-ui/react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { useSignOut } from '@/features/auth/hooks/use-sign-out'

/** Visible on every page while a freelancer is signed in. */
export function SignOutButton() {
  const { isAuthenticated } = useAuth()
  const signOut = useSignOut()

  if (!isAuthenticated) return null

  return (
    <Button type="button" variant="ghost" size="sm" onClick={() => void signOut()}>
      Sign out
    </Button>
  )
}
