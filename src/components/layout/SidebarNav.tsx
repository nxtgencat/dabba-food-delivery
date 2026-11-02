import { NavLink } from 'react-router-dom'
import {
  ClipboardList,
  CookingPot,
  LayoutGrid,
  LifeBuoy,
  ReceiptText,
  Settings2,
  ShoppingBasket,
  Store,
  Tags,
  Users,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import type { Order } from '../../types'
import { useOrders } from '../../hooks/useApp'

export const primaryNav = [
  { to: '/', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/orders', label: 'Orders', icon: ClipboardList, end: false, queue: true },
  { to: '/restaurants', label: 'Restaurants', icon: Store, end: false },
  { to: '/menu', label: 'Menu', icon: CookingPot, end: false },
  { to: '/customers', label: 'Customers', icon: Users, end: false },
]

export const workspaceNav = [
  { to: '/cart', label: 'Basket', icon: ShoppingBasket },
  { to: '/checkout', label: 'Checkout', icon: ReceiptText },
  { to: '/order-history', label: 'Order history', icon: Tags },
]

const isLive = (order: Order) =>
  order.status === 'placed' || order.status === 'preparing' || order.status === 'out_for_delivery'

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { orders } = useOrders()
  const liveCount = orders.filter(isLive).length

  return (
    <nav aria-label="Main" className="flex flex-1 flex-col">
      <ul className="space-y-0.5">
        {primaryNav.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex h-8 items-center gap-2.5 rounded-[6px] px-2 text-[13px] leading-4 transition-colors',
                  isActive
                    ? 'bg-active font-medium text-ink'
                    : 'text-muted hover:bg-raised hover:text-ink',
                )
              }
            >
              <item.icon size={16} strokeWidth={1.5} className="shrink-0" />
              <span className="truncate">{item.label}</span>
              {item.queue && liveCount > 0 ? (
                <span className="num ml-auto rounded-[3px] bg-ink px-1.5 py-0.5 text-[11px] leading-3 font-medium text-invert">
                  {liveCount}
                </span>
              ) : null}
            </NavLink>
          </li>
        ))}
      </ul>

      <p className="mt-6 mb-2 px-2 text-[13px] leading-4 text-faint">Service desk</p>
      <ul className="space-y-0.5">
        {workspaceNav.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex h-8 items-center gap-2.5 rounded-[6px] px-2 text-[13px] leading-4 transition-colors',
                  isActive
                    ? 'bg-active font-medium text-ink'
                    : 'text-muted hover:bg-raised hover:text-ink',
                )
              }
            >
              <item.icon size={16} strokeWidth={1.5} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <ul className="space-y-0.5">
          <li>
            <NavLink
              to="/profile"
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex h-8 items-center gap-2.5 rounded-[6px] px-2 text-[13px] leading-4 transition-colors',
                  isActive ? 'bg-active font-medium text-ink' : 'text-muted hover:bg-raised hover:text-ink',
                )
              }
            >
              <Settings2 size={16} strokeWidth={1.5} />
              Profile & settings
            </NavLink>
          </li>
          <li>
            <a
              href="https://dummyjson.com/docs/recipes"
              target="_blank"
              rel="noreferrer"
              className="flex h-8 items-center gap-2.5 rounded-[6px] px-2 text-[13px] leading-4 text-muted transition-colors hover:bg-raised hover:text-ink"
            >
              <LifeBuoy size={16} strokeWidth={1.5} />
              Catalogue source
            </a>
          </li>
        </ul>
      </div>
    </nav>
  )
}
