import { Avatar, Box, Menu, Portal, Text } from '@chakra-ui/react'
import { LogOut, Settings, User } from 'lucide-react'
import { useSignOut } from '@/features/auth/hooks/use-sign-out'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { displayName } from '@/features/auth/utils/display-name'

export function UserMenu() {
  const { user } = useAuth()
  const signOut = useSignOut()

  return (
    <Menu.Root positioning={{ placement: 'bottom-end' }}>
      <Menu.Trigger aria-label="Account menu" borderRadius="full" focusVisibleRing="outside" cursor="pointer">
        <Avatar.Root size="sm">
          <Avatar.Fallback name={displayName(user, 'User')} />
        </Avatar.Root>
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content minW="60">
            <Box px="2.5" py="2">
              <Text textStyle="sm" fontWeight="medium" truncate>
                {user?.displayName || 'User'}
              </Text>
              <Text textStyle="xs" color="fg.muted" truncate>
                {user?.email}
              </Text>
            </Box>
            <Menu.Separator />
            <Menu.Item value="profile">
              <User size={16} />
              Profile
            </Menu.Item>
            <Menu.Item value="settings">
              <Settings size={16} />
              Settings
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item value="logout" onClick={() => void signOut()}>
              <LogOut size={16} />
              Sign out
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Portal>
    </Menu.Root>
  )
}
