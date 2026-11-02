import { hasStoredSession } from '@/api/token-storage'
import { Path } from '@/router/paths'

/**
 * Set on `<html>` while a page is frozen or a sign-out is in progress, so a
 * restored snapshot cannot show a freelancer's clients or invoices.
 */
export const SESSION_HIDDEN_ATTR = 'data-left-session'

let installed = false
let signingOut = false

/** True while sign-out is moving from a private page to the public front page. */
export function isSigningOut(): boolean {
  return signingOut
}

export function setSigningOut(value: boolean): void {
  signingOut = value
}

export function concealPageOnHide(): void {
  document.documentElement.setAttribute(SESSION_HIDDEN_ATTR, '')
}

/**
 * The back-forward cache restores the signed-in screen as it was, including
 * data that is no longer in storage. Send that visitor to the sign-in page
 * while the snapshot is still hidden.
 */
export function concealRestoredPage(
  event: { persisted: boolean },
  redirect: (url: string) => void = (url) => window.location.replace(url),
): void {
  if (event.persisted && !hasStoredSession()) {
    redirect(Path.Login)
    return
  }
  document.documentElement.removeAttribute(SESSION_HIDDEN_ATTR)
}

export function installSessionGuard(): void {
  if (installed) return
  installed = true

  window.addEventListener('pagehide', () => {
    concealPageOnHide()
  })
  window.addEventListener('pageshow', (event) => {
    concealRestoredPage(event)
  })
}
