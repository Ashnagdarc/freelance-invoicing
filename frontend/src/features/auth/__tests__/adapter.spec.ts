import { ACCESS_TOKEN_KEY, getAccessToken, getRefreshToken, setTokens } from '@/api/token-storage'

const me = { id: 1, email: 'ada@example.com', first_name: 'Ada', last_name: '' }

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

/** Route fetch calls by URL path; each entry is consumed in order. */
function mockFetch(routes: Record<string, Response[]>) {
  const fetchMock = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
    const path = new URL(String(input)).pathname
    const next = routes[path]?.shift()
    if (!next) throw new Error(`Unexpected request to ${path}`)
    return next
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

/** Load a fresh adapter (module state included) and wait for its first auth state. */
async function restoredUser() {
  vi.resetModules()
  const { createAuthAdapter } = await import('../adapter')
  const adapter = createAuthAdapter()
  return new Promise((resolve) => adapter.onAuthStateChanged(resolve))
}

describe('auth adapter session restore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('restores the user from stored tokens after a reload', async () => {
    setTokens('access-1', 'refresh-1')
    mockFetch({ '/api/auth/me/': [jsonResponse(200, me)] })

    const user = await restoredUser()

    expect(user).toMatchObject({ email: 'ada@example.com', displayName: 'Ada' })
  })

  it('renews an expired access token before giving up', async () => {
    setTokens('expired', 'refresh-1')
    mockFetch({
      '/api/auth/me/': [jsonResponse(401, { detail: 'expired' }), jsonResponse(200, me)],
      '/api/auth/refresh/': [jsonResponse(200, { access: 'access-2', refresh: 'refresh-2' })],
    })

    const user = await restoredUser()

    expect(user).toMatchObject({ email: 'ada@example.com' })
    expect(getAccessToken()).toBe('access-2')
    expect(getRefreshToken()).toBe('refresh-2')
  })

  it('signs out and clears tokens when the refresh token is rejected', async () => {
    setTokens('expired', 'revoked')
    mockFetch({
      '/api/auth/me/': [jsonResponse(401, { detail: 'expired' })],
      '/api/auth/refresh/': [jsonResponse(401, { detail: 'invalid' })],
    })

    const user = await restoredUser()

    expect(user).toBeNull()
    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
  })

  it('reports signed out without calling the API when nothing is stored', async () => {
    const fetchMock = mockFetch({})

    const user = await restoredUser()

    expect(user).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('stays signed out after a reload', async () => {
    setTokens('access-1', 'refresh-1')
    mockFetch({
      '/api/auth/me/': [jsonResponse(200, me)],
      '/api/auth/logout/': [jsonResponse(200, { detail: 'Successfully logged out.' })],
    })

    vi.resetModules()
    const { createAuthAdapter } = await import('../adapter')
    const adapter = createAuthAdapter()
    await new Promise((resolve) => adapter.onAuthStateChanged(resolve))
    await adapter.signOut()

    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()

    vi.resetModules()
    const reloaded = await import('../adapter')
    const next = reloaded.createAuthAdapter()
    const user = await new Promise((resolve) => next.onAuthStateChanged(resolve))

    expect(user).toBeNull()
    expect(getAccessToken()).toBeNull()
  })

  it('tells the server about this browser only, and leaves another device\'s token alone', async () => {
    const phoneRefresh = 'phone-refresh-token'
    setTokens('laptop-access', 'laptop-refresh')
    const fetchMock = mockFetch({
      '/api/auth/me/': [jsonResponse(200, me)],
      '/api/auth/logout/': [jsonResponse(200, { detail: 'Successfully logged out.' })],
    })

    vi.resetModules()
    const { createAuthAdapter } = await import('../adapter')
    const adapter = createAuthAdapter()
    await new Promise((resolve) => adapter.onAuthStateChanged(resolve))
    await adapter.signOut()

    const logoutCall = fetchMock.mock.calls.find(([input]) => String(input).includes('/api/auth/logout/'))
    expect(logoutCall?.[1]?.body).toBeDefined()
    expect(JSON.parse(String(logoutCall?.[1]?.body))).toEqual({ refresh: 'laptop-refresh' })
    expect(String(logoutCall?.[1]?.body)).not.toContain(phoneRefresh)
    expect(getRefreshToken()).toBeNull()
  })

  it('drops the session in another tab on this computer', async () => {
    setTokens('access-1', 'refresh-1')
    mockFetch({ '/api/auth/me/': [jsonResponse(200, me)] })

    vi.resetModules()
    const { createAuthAdapter } = await import('../adapter')
    const adapter = createAuthAdapter()
    const seen: unknown[] = []
    adapter.onAuthStateChanged((user) => seen.push(user))
    await new Promise((resolve) => adapter.onAuthStateChanged((user) => resolve(user)))

    localStorage.clear()
    window.dispatchEvent(new StorageEvent('storage', { key: ACCESS_TOKEN_KEY }))

    expect(seen.at(-1)).toBeNull()
  })

  it('does not store tokens from a refresh that finishes after sign-out', async () => {
    setTokens('expired', 'refresh-1')
    let releaseRefresh: (response: Response) => void = () => {}
    const refreshGate = new Promise<Response>((resolve) => {
      releaseRefresh = resolve
    })

    const fetchMock = vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
      const path = new URL(String(input)).pathname
      if (path === '/api/auth/me/') return jsonResponse(401, { detail: 'expired' })
      if (path === '/api/auth/refresh/') return refreshGate
      if (path === '/api/auth/logout/') return jsonResponse(200, { detail: 'ok' })
      throw new Error(`Unexpected request to ${path}`)
    })
    vi.stubGlobal('fetch', fetchMock)

    vi.resetModules()
    const { createAuthAdapter } = await import('../adapter')
    const adapter = createAuthAdapter()

    await vi.waitFor(() => {
      expect(fetchMock.mock.calls.some(([input]) => String(input).includes('/refresh/'))).toBe(true)
    })

    await adapter.signOut()
    releaseRefresh(jsonResponse(200, { access: 'new-access', refresh: 'new-refresh' }))
    await refreshGate
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(getAccessToken()).toBeNull()
    expect(getRefreshToken()).toBeNull()
    expect(adapter.getCurrentUser()).toBeNull()
  })
})
