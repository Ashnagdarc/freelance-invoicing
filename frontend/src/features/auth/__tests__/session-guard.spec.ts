import { setTokens } from '@/api/token-storage'
import { Path } from '@/router/paths'
import { SESSION_HIDDEN_ATTR, concealPageOnHide, concealRestoredPage } from '../session-guard'

describe('session guard', () => {
  afterEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute(SESSION_HIDDEN_ATTR)
  })

  it('hides the page when the browser freezes it', () => {
    concealPageOnHide()

    expect(document.documentElement.getAttribute(SESSION_HIDDEN_ATTR)).toBe('')
  })

  it('sends a restored page to the sign-in page when this browser is signed out', () => {
    document.documentElement.setAttribute(SESSION_HIDDEN_ATTR, '')
    const redirect = vi.fn()

    concealRestoredPage({ persisted: true }, redirect)

    expect(redirect).toHaveBeenCalledWith(Path.Login)
    expect(document.documentElement.hasAttribute(SESSION_HIDDEN_ATTR)).toBe(true)
  })

  it('shows a restored page again when this browser is still signed in', () => {
    setTokens('access-1', 'refresh-1')
    document.documentElement.setAttribute(SESSION_HIDDEN_ATTR, '')
    const redirect = vi.fn()

    concealRestoredPage({ persisted: true }, redirect)

    expect(redirect).not.toHaveBeenCalled()
    expect(document.documentElement.hasAttribute(SESSION_HIDDEN_ATTR)).toBe(false)
  })

  it('shows a normal page load', () => {
    document.documentElement.setAttribute(SESSION_HIDDEN_ATTR, '')
    const redirect = vi.fn()

    concealRestoredPage({ persisted: false }, redirect)

    expect(redirect).not.toHaveBeenCalled()
    expect(document.documentElement.hasAttribute(SESSION_HIDDEN_ATTR)).toBe(false)
  })
})
