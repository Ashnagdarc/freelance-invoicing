import { Text } from '@chakra-ui/react'
import { useAuth } from '@/features/auth/hooks/use-auth'

/** The account email, shown in every shell while a freelancer is signed in. */
export function SignedInEmail() {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated || !user?.email) return null

  return (
    <Text textStyle="sm" maxW={{ base: '32', md: '64' }} truncate title={user.email}>
      {user.email}
    </Text>
  )
}
