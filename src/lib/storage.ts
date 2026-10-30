const NS = 'dabba.v1'

export const storageKeys = {
  users: `${NS}.users`,
  session: `${NS}.session`,
  cart: `${NS}.cart`,
  orders: `${NS}.orders`,
  demoAnchor: `${NS}.demo-anchor`,
  dishOverrides: `${NS}.dish-overrides`,
  deletedDishes: `${NS}.deleted-dishes`,
} as const

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // A full quota or a private window should not break the interface: the session
    // keeps working from memory and the next write simply fails.
  }
}

export function removeStorage(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export async function hashPassword(email: string, password: string): Promise<string> {
  const input = `dabba-v1::${email.trim().toLowerCase()}::${password}`
  if (globalThis.crypto?.subtle) {
    const bytes = new TextEncoder().encode(input)
    const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  }
  // Fallback for a non-secure context: still never store the raw password.
  let hash = 5381
  for (let i = 0; i < input.length; i++) hash = (hash * 33) ^ input.charCodeAt(i)
  return `fallback-${(hash >>> 0).toString(16)}`
}
