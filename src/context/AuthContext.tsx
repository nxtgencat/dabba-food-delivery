import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Address, AuthValue, Session, StoredUser, UserProfile } from '../types'
import { hashPassword, readStorage, removeStorage, storageKeys, writeStorage } from '../lib/storage'

export const AuthContext = createContext<AuthValue | null>(null)

const DEMO_EMAIL = 'arjun@dabba.test'
const DEMO_PASSWORD = 'dabba1234'
const DEMO_HASH = '75bf5cae43ddf5622fac8e1c85f3b48558de381490539a0e8f130cb6bebb0556'

const defaultAddresses: Address[] = [
  {
    id: 'addr-office',
    label: 'Office',
    line1: 'Flat 1104, One BKC, G Block',
    line2: 'Bandra Kurla Complex',
    area: 'BKC',
    city: 'Mumbai',
    pincode: '400051',
    isDefault: true,
  },
  {
    id: 'addr-home',
    label: 'Home',
    line1: 'Flat 7B, Sea Breeze, Carter Road',
    line2: 'Bandra West',
    area: 'Bandra West',
    city: 'Mumbai',
    pincode: '400050',
    isDefault: false,
  },
]

const demoUser: StoredUser = {
  id: 'u-demo-manager',
  name: 'Arjun Nair',
  email: DEMO_EMAIL,
  phone: '+91 98200 41192',
  passwordHash: DEMO_HASH,
  role: 'Service manager',
  avatar: null,
  wallet: 1250,
  addresses: defaultAddresses,
  createdAt: '2026-08-19T09:00:00.000Z',
}

export const demoCredentials = { email: DEMO_EMAIL, password: DEMO_PASSWORD }

function seedUsers(): StoredUser[] {
  const existing = readStorage<StoredUser[]>(storageKeys.users, [])
  if (existing.some((user) => user.email.toLowerCase() === DEMO_EMAIL)) return existing
  const next = [demoUser, ...existing]
  writeStorage(storageKeys.users, next)
  return next
}

export function toProfile(user: StoredUser): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    wallet: user.wallet,
    addresses: user.addresses,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<StoredUser[]>(() => seedUsers())
  const [session, setSession] = useState<Session | null>(() => {
    const stored = readStorage<Session | null>(storageKeys.session, null)
    if (stored) return stored
    try {
      const tab = window.sessionStorage.getItem(storageKeys.session)
      return tab ? (JSON.parse(tab) as Session) : null
    } catch {
      return null
    }
  })

  const persistUsers = useCallback((next: StoredUser[]) => {
    setUsers(next)
    writeStorage(storageKeys.users, next)
  }, [])

  useEffect(() => {
    if (!session) return
    if (!users.some((user) => user.id === session.userId)) {
      removeStorage(storageKeys.session)
      setSession(null)
    }
  }, [session, users])

  const signIn = useCallback<AuthValue['signIn']>(
    async (email, password, persist = true) => {
      const clean = email.trim().toLowerCase()
      const user = users.find((entry) => entry.email.toLowerCase() === clean)
      if (!user) return { ok: false, error: 'invalid' }
      const digest = await hashPassword(clean, password)
      if (digest !== user.passwordHash) return { ok: false, error: 'invalid' }
      const next: Session = { userId: user.id, signedInAt: new Date().toISOString() }
      // A tab-only session lives in sessionStorage; the copy in localStorage is
      // removed so closing the tab really does end it.
      if (persist) {
        writeStorage(storageKeys.session, next)
      } else {
        removeStorage(storageKeys.session)
        try {
          window.sessionStorage.setItem(storageKeys.session, JSON.stringify(next))
        } catch {
          // A private window may refuse; the in-memory session still works.
        }
      }
      setSession(next)
      return { ok: true }
    },
    [users],
  )

  const register = useCallback<AuthValue['register']>(
    async (input) => {
      const clean = input.email.trim().toLowerCase()
      if (users.some((entry) => entry.email.toLowerCase() === clean)) {
        return { ok: false, error: 'exists' }
      }
      const passwordHash = await hashPassword(clean, input.password)
      const created: StoredUser = {
        id: `u-${Date.now().toString(36)}`,
        name: input.name.trim(),
        email: clean,
        phone: input.phone.trim(),
        passwordHash,
        role: 'Shift lead',
        avatar: null,
        wallet: 500,
        addresses: [],
        createdAt: new Date().toISOString(),
      }
      persistUsers([created, ...users])
      const next: Session = { userId: created.id, signedInAt: new Date().toISOString() }
      writeStorage(storageKeys.session, next)
      setSession(next)
      return { ok: true }
    },
    [users, persistUsers],
  )

  const signOut = useCallback(() => {
    removeStorage(storageKeys.session)
    try {
      window.sessionStorage.removeItem(storageKeys.session)
    } catch {
      // ignore
    }
    setSession(null)
  }, [])

  const patchUser = useCallback(
    (id: string, patch: (user: StoredUser) => StoredUser) => {
      persistUsers(users.map((user) => (user.id === id ? patch(user) : user)))
    },
    [users, persistUsers],
  )

  const updateProfile = useCallback<AuthValue['updateProfile']>(
    (patch) => {
      if (!session) return
      patchUser(session.userId, (user) => ({
        ...user,
        ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
        ...(patch.email !== undefined ? { email: patch.email.trim().toLowerCase() } : {}),
        ...(patch.phone !== undefined ? { phone: patch.phone.trim() } : {}),
        ...(patch.avatar !== undefined ? { avatar: patch.avatar } : {}),
      }))
    },
    [session, patchUser],
  )

  const addAddress = useCallback<AuthValue['addAddress']>(
    (address) => {
      if (!session) return
      patchUser(session.userId, (user) => {
        const created: Address = {
          ...address,
          id: `addr-${Date.now().toString(36)}`,
          isDefault: address.isDefault || user.addresses.length === 0,
        }
        const next = created.isDefault
          ? [...user.addresses.map((entry) => ({ ...entry, isDefault: false })), created]
          : [...user.addresses, created]
        return { ...user, addresses: next }
      })
    },
    [session, patchUser],
  )

  const updateAddress = useCallback<AuthValue['updateAddress']>(
    (id, address) => {
      if (!session) return
      patchUser(session.userId, (user) => {
        const next = user.addresses.map((entry) =>
          entry.id === id
            ? { ...address, id }
            : address.isDefault
              ? { ...entry, isDefault: false }
              : entry,
        )
        return { ...user, addresses: next }
      })
    },
    [session, patchUser],
  )

  const removeAddress = useCallback<AuthValue['removeAddress']>(
    (id) => {
      if (!session) return
      patchUser(session.userId, (user) => {
        const next = user.addresses.filter((entry) => entry.id !== id)
        if (next.length && !next.some((entry) => entry.isDefault)) next[0] = { ...next[0], isDefault: true }
        return { ...user, addresses: next }
      })
    },
    [session, patchUser],
  )

  const adjustWallet = useCallback<AuthValue['adjustWallet']>(
    (delta) => {
      if (!session) return
      patchUser(session.userId, (user) => ({
        ...user,
        wallet: Math.max(0, Math.round((user.wallet + delta) * 100) / 100),
      }))
    },
    [session, patchUser],
  )

  const user = useMemo<UserProfile | null>(() => {
    if (!session) return null
    const found = users.find((entry) => entry.id === session.userId)
    return found ? toProfile(found) : null
  }, [session, users])

  const value = useMemo<AuthValue>(
    () => ({ user, signIn, register, signOut, updateProfile, addAddress, updateAddress, removeAddress, adjustWallet }),
    [user, signIn, register, signOut, updateProfile, addAddress, updateAddress, removeAddress, adjustWallet],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthValue() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
