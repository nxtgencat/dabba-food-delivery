import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Search, Users } from 'lucide-react'
import { PageHeader } from '../../components/ui/Page'
import { EmptyState } from '../../components/ui/Feedback'
import { useOrders } from '../../hooks/useApp'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatINR, formatRelative, initials } from '../../lib/format'
import { isActiveOrder } from '../../lib/analytics'
import { cn } from '../../lib/cn'

interface CustomerRow {
  name: string
  phone: string
  address: string
  orders: number
  spent: number
  lastAt: string
  active: number
  cancelled: number
}

const toneOf = (index: number) =>
  ['bg-[#e9edf2] text-[#2b3a4a]', 'bg-[#eceee9] text-[#333d30]', 'bg-[#f2ecec] text-[#47312f]', 'bg-[#eceaf2] text-[#383049]'][
    index % 4
  ]

export function CustomersPage() {
  useDocumentTitle('Customers')
  const { orders } = useOrders()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'spent' | 'orders' | 'recent'>('spent')

  const customers = useMemo(() => {
    const map = new Map<string, CustomerRow>()
    for (const order of orders) {
      const key = order.customer.phone
      const existing = map.get(key)
      const spent = order.payment.status === 'paid' ? order.pricing.total : 0
      if (!existing) {
        map.set(key, {
          name: order.customer.name,
          phone: order.customer.phone,
          address: order.customer.address,
          orders: 1,
          spent,
          lastAt: order.placedAt,
          active: isActiveOrder(order) ? 1 : 0,
          cancelled: order.status === 'cancelled' ? 1 : 0,
        })
      } else {
        existing.orders += 1
        existing.spent += spent
        if (order.placedAt > existing.lastAt) {
          existing.lastAt = order.placedAt
          existing.address = order.customer.address
        }
        if (isActiveOrder(order)) existing.active += 1
        if (order.status === 'cancelled') existing.cancelled += 1
      }
    }
    const list = [...map.values()]
    if (sort === 'orders') return list.sort((a, b) => b.orders - a.orders || b.spent - a.spent)
    if (sort === 'recent') return list.sort((a, b) => b.lastAt.localeCompare(a.lastAt))
    return list.sort((a, b) => b.spent - a.spent)
  }, [orders, sort])

  const visible = customers.filter((customer) => {
    if (!query.trim()) return true
    const needle = query.trim().toLowerCase()
    return (
      customer.name.toLowerCase().includes(needle) ||
      customer.phone.replace(/\s/g, '').includes(needle.replace(/\s/g, '')) ||
      customer.address.toLowerCase().includes(needle)
    )
  })

  const totalSpent = customers.reduce((sum, customer) => sum + customer.spent, 0)
  const repeat = customers.filter((customer) => customer.orders > 1).length

  return (
    <div className="app-fade">
      <PageHeader
        title="Customers"
        finding={
          <>
            {customers.length} people have ordered on this device; {repeat} have come back more than
            once. Every order keeps its own address, so a customer can move without losing history.
          </>
        }
      />

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[8px] bg-line p-px sm:grid-cols-4">
        {[
          { label: 'Customers', value: String(customers.length), note: 'distinct phone numbers' },
          { label: 'Repeat guests', value: String(repeat), note: 'more than one order' },
          { label: 'Spent', value: formatINR(totalSpent), note: 'on paid orders' },
          {
            label: 'Average lifetime',
            value: customers.length ? formatINR(Math.round(totalSpent / customers.length)) : '₹0',
            note: 'per customer',
          },
        ].map((cell) => (
          <div key={cell.label} className="bg-surface px-4 py-3.5">
            <p className="text-[13px] leading-4 text-muted">{cell.label}</p>
            <p className="num mt-1 text-[20px] leading-7 font-medium">{cell.value}</p>
            <p className="mt-0.5 truncate text-[13px] leading-4 text-faint">{cell.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-0 flex-1 sm:max-w-[320px]">
          <Search
            size={15}
            strokeWidth={1.7}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Name, phone or street"
            aria-label="Search customers"
            className="field pl-9"
          />
        </div>
        <select
          className="field h-10 w-auto min-w-[150px]"
          value={sort}
          onChange={(event) => setSort(event.target.value as typeof sort)}
          aria-label="Sort customers"
        >
          <option value="spent">Most spent</option>
          <option value="orders">Most orders</option>
          <option value="recent">Most recent</option>
        </select>
        <span className="text-[13px] leading-4 text-faint sm:ml-auto">
          {visible.length} of {customers.length}
        </span>
      </div>

      <div className="mt-3">
        {visible.length ? (
          <ul className="overflow-hidden rounded-[8px] bg-surface shadow-[inset_0_0_0_1px_var(--color-line)]">
            {visible.map((customer, index) => (
              <li
                key={customer.phone}
                className="row-hover flex flex-wrap items-center gap-3 border-t border-rule px-4 py-3 first:border-0 sm:flex-nowrap"
              >
                <span
                  className={cn(
                    'grid h-9 w-9 shrink-0 place-items-center rounded-full text-[13px] font-semibold',
                    toneOf(index),
                  )}
                  aria-hidden="true"
                >
                  {initials(customer.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] leading-[18px] font-medium">{customer.name}</p>
                  <p className="num truncate text-[13px] leading-4 text-faint">{customer.phone}</p>
                </div>
                <p className="hidden min-w-0 max-w-[240px] flex-1 truncate text-[13px] leading-4 text-muted md:block">
                  {customer.address}
                </p>
                <div className="flex shrink-0 items-center gap-4">
                  <div className="w-14 text-right">
                    <p className="num text-[13px] leading-4 font-medium">{customer.orders}</p>
                    <p className="text-[13px] leading-4 text-faint">
                      {customer.orders === 1 ? 'order' : 'orders'}
                    </p>
                  </div>
                  <div className="w-20 text-right">
                    <p className="num text-[13px] leading-4 font-medium">{formatINR(customer.spent)}</p>
                    <p className="text-[13px] leading-4 text-faint">spent</p>
                  </div>
                  <div className="hidden w-24 text-right sm:block">
                    <p className="text-[13px] leading-4 text-muted">{formatRelative(customer.lastAt)}</p>
                    <p className="text-[13px] leading-4 text-faint">last order</p>
                  </div>
                  {customer.active ? (
                    <span className="pill pill-hue">
                      <span className="dot" aria-hidden="true" />
                      {customer.active} live
                    </span>
                  ) : (
                    <Link
                      to={`/orders?query=${encodeURIComponent(customer.phone)}`}
                      className="inline-flex items-center gap-0.5 text-[13px] font-medium text-muted transition-colors hover:text-ink"
                    >
                      Orders
                      <ArrowUpRight size={12} strokeWidth={1.7} />
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="panel">
            <EmptyState
              icon={<Users size={22} strokeWidth={1.4} />}
              title={orders.length ? 'No customer matches' : 'No customers yet'}
              body={
                orders.length
                  ? 'Nothing matches that name, number or street. Clear the search to see everyone.'
                  : 'A customer appears here with their first order. Take one from the menu to start the list.'
              }
              action={
                orders.length ? (
                  <button type="button" className="btn btn-secondary" onClick={() => setQuery('')}>
                    Clear the search
                  </button>
                ) : (
                  <Link to="/restaurants" className="btn btn-primary">
                    Choose a kitchen
                  </Link>
                )
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}
