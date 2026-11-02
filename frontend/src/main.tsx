import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import { installSessionGuard } from '@/features/auth/session-guard'
import { applyColorMode } from '@/shared/utils/color-mode'
import { App } from './app'

// Hide a page the browser restores from memory after sign-out.
installSessionGuard()

// Set light/dark before the first paint so there's no flash
applyColorMode()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
