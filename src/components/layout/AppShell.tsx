import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  LogOut,
  Menu,
  ShoppingBasket,
  Store,
  UserRound,
  X,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { useAuth, useCart, useCatalog } from '../../hooks/useApp'
import { initials } from '../../lib/format'
import { cn } from '../../lib/cn'
import { Wordmark } from '../brand/TiffinMark'
import { SidebarNav } from './SidebarNav'

function AccountMenu({ compact = false }: { compact?: boolean }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: MouseEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  if (!user) return null

  return (
    <div ref={wrap} className={cn('relative', compact && 'w-full')}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'flex items-center gap-2.5 rounded-[6px] text-left transition-colors hover:bg-raised',
          compact ? 'w-full p-2' : 'w-full p-1.5',
        )}
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-active text-[13px] font-semibold text-ink">
          {initials(user.name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] leading-4 font-medium">{user.name}</span>
          <span className="block truncate text-[13px] leading-4 text-faint">{user.role}</span>
        </span>
        <ChevronDown size={14} strokeWidth={1.6} className="shrink-0 text-faint" />
      </button>
      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="absolute bottom-full left-0 z-40 mb-2 w-full min-w-[228px] overflow-hidden rounded-[8px] border border-line bg-surface shadow-[0_10px_28px_rgb(17_19_19/0.12)]"
        >
          <div className="px-3 py-2.5">
            <p className="truncate text-[13px] font-medium">{user.name}</p>
            <p className="truncate text-[13px] text-faint">{user.email}</p>
          </div>
          <div className="h-px bg-rule" />
          <Link
            to="/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex h-9 items-center gap-2.5 px-3 text-[13px] text-muted transition-colors hover:bg-raised hover:text-ink"
          >
            <UserRound size={15} strokeWidth={1.5} />
            Profile & addresses
          </Link>
          <Link
            to="/order-history"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex h-9 items-center gap-2.5 px-3 text-[13px] text-muted transition-colors hover:bg-raised hover:text-ink"
          >
            <Store size={15} strokeWidth={1.5} />
            Order history
          </Link>
          <div className="h-px bg-rule" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              signOut()
              toast.success('Signed out. The basket stays on this device.')
              navigate('/login')
            }}
            className="flex h-9 w-full items-center gap-2.5 px-3 text-[13px] text-muted transition-colors hover:bg-raised hover:text-ink"
          >
            <LogOut size={15} strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const { itemCount } = useCart()
  const { status, source } = useCatalog()
  const [sheet, setSheet] = useState(false)

  useEffect(() => {
    setSheet(false)
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = sheet ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [sheet])

  return (
    <div className="min-h-svh bg-ground">
      <a href="#main" className="skip-link">
        Skip to the page
      </a>
      <div className="mx-auto grid min-h-svh max-w-[1560px] lg:grid-cols-[248px_minmax(0,1fr)]">
        <aside className="sticky top-0 hidden h-svh flex-col gap-2 px-4 py-5 lg:flex">
          <Link to="/" className="mb-4 px-2" aria-label="Dabba home">
            <Wordmark />
          </Link>
          <SidebarNav />
          <div className="mt-2 border-t border-line pt-2">
            <AccountMenu />
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <header className="sticky top-0 z-30 flex h-12 items-center gap-2 bg-ground/95 px-4 backdrop-blur-[2px] lg:hidden">
            <button
              type="button"
              onClick={() => setSheet(true)}
              className="btn btn-ghost h-9 w-9 p-0"
              aria-label="Open navigation"
              aria-expanded={sheet}
            >
              <Menu size={18} strokeWidth={1.6} />
            </button>
            <Link to="/" aria-label="Dabba home" className="mr-auto">
              <Wordmark compact />
            </Link>
            <Link
              to="/cart"
              className="relative grid h-9 w-9 place-items-center rounded-[6px] text-muted transition-colors hover:bg-raised hover:text-ink"
              aria-label={`Basket, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
            >
              <ShoppingBasket size={18} strokeWidth={1.5} />
              {itemCount > 0 ? (
                <span className="num absolute top-1 right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-ink px-1 text-[13px] leading-none font-medium text-invert">
                  {itemCount}
                </span>
              ) : null}
            </Link>
          </header>

          <main id="main" className="min-w-0 flex-1 px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-7">
            {source === 'bundled' && status === 'degraded' ? (
              <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-[6px] bg-pill-warning-bg px-3 py-2 text-[13px] leading-4 text-pill-warning-ink">
                <span className="font-medium">Showing the bundled catalogue.</span>
                <span>The recipe service did not answer; dishes and photographs still work.</span>
              </div>
            ) : null}
            {children}
          </main>
        </div>
      </div>

      {sheet ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setSheet(false)}
            className="absolute inset-0 bg-[rgb(17_19_19/0.55)]"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className="sheet-enter relative flex h-full w-[min(84vw,300px)] flex-col bg-ground px-4 py-5"
          >
            <div className="mb-4 flex items-center justify-between px-2">
              <Wordmark compact />
              <button
                type="button"
                onClick={() => setSheet(false)}
                className="btn btn-ghost h-9 w-9 p-0"
                aria-label="Close navigation"
              >
                <X size={18} strokeWidth={1.6} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarNav onNavigate={() => setSheet(false)} />
            </div>
            <div className="mt-2 border-t border-line pt-2">
              <AccountMenu compact />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
