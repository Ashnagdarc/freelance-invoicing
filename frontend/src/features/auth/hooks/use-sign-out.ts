import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Path } from '@/router/paths'
import { SESSION_HIDDEN_ATTR, setSigningOut } from '../session-guard'
import { useAuth } from './use-auth'

/** Shared by the header button and the account menu, so a double click only leaves once. */
let leaving = false

/**
 * Sign out of this browser, open the public front page, and leave the
 * sign-in page as the entry behind it. Back then shows the sign-in form.
 * The private page is replaced before the session drops, so the auth guard
 * does not fight the navigation, and the screen stays hidden until the
 * front page is signed out.
 */
export function useSignOut() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  return useCallback(async () => {
    if (leaving) return
    leaving = true
    setSigningOut(true)
    document.documentElement.setAttribute(SESSION_HIDDEN_ATTR, '')

    try {
      // Replace the private page with the sign-in page, then open the public
      // front page on top of it. Back returns to the sign-in form.
      await navigate(Path.Login, { replace: true })
      await navigate(Path.Home)
      await logout()
      // Stay in the signing-out state until the signed-out page has rendered,
      // so the private page cannot redirect over the front page.
      await new Promise((resolve) => setTimeout(resolve, 0))
    } finally {
      document.documentElement.removeAttribute(SESSION_HIDDEN_ATTR)
      setSigningOut(false)
      leaving = false
    }
  }, [logout, navigate])
}
