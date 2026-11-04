import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ClipboardList } from 'lucide-react'
import { PageHeader } from '../../components/ui/Page'
import { EmptyState } from '../../components/ui/Feedback'
import { OrderPill } from '../../components/ui/Status'
import { useCatalog, useOrders } from '../../hooks/useApp'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { filterOrders, sortOrdersNewest } from '../../lib/analytics'
import { formatClock, formatINR, formatMinutes, formatRelative, minutesUntil } from '../../lib/format'
import { cn } from '../../lib/cn'
import type { OrderStatus } from '../../types'

const tabs: { id: 'all' | OrderStatus; label: string }[] = [
  { id: 'all', label: 'Every order' },
  { id: 'placed', label: 'Placed' },
  { id: 'preparing', label: 'Preparing' },
  { id: 'out_for_delivery', label: 'On the way' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
]

export function OrdersPage() {
  useDocumentTitle('Orders')
  const { orders, advanceOrder } = useOrders()
  const { kitchens } = useCatalog()
  const [tab, setTab] = useState<'all' | OrderStatus>('all')
  const [query, setQuery] = useState('')
  const [kitchenId, setKitchenId] = useState('all')
  const [day, setDay] = useState<'all' | 'today' | 'week'>('today')

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: orders.length }
    for (const order of orders) map[order.status] = (map[order.status] ?? 0) + 1
    return map
  }, [orders])

  const visible = useMemo(
    () =>
      sortOrdersNewest(
        filterOrders(orders, { query, status: tab, kitchenId, day }),
      ),
    [orders, query, tab, kitchenId, day],
  )

  const late = visible.filter(
    (order) =>
      (order.status === 'placed' || order.status === 'preparing' || order.status === 'out_for_delivery') &&
      minutesUntil(order.promisedAt) < 0,
  ).length

  return (
    <div className="app-fade">
      <PageHeader
        title="Orders"
        finding={
          <>
            {counts.all} orders on this device, {counts.out_for_delivery ?? 0} on the road and{' '}
            {counts.preparing ?? 0} in a kitchen.{' '}
            {late ? `${late} past the promised window.` : 'No live order is past its window.'}
          </>
        }
        actions={
          <Link to="/cart" className="btn btn-primary">
            Take an order
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-0 flex-1 sm:max-w-[300px]">
          <Search
            size={15}
            strokeWidth={1.7}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Order, customer or dish"
            aria-label="Search orders"
            className="field pl-9"
          />
        </div>
        <select
          className="field h-10 w-auto min-w-[150px]"
          value={kitchenId}
          onChange={(event) => setKitchenId(event.target.value)}
          aria-label="Filter by kitchen"
        >
          <option value="all">Every kitchen</option>
          {kitchens.map((kitchen) => (
            <option key={kitchen.id} value={kitchen.id}>
              {kitchen.name}
            </option>
          ))}
        </select>
        <div className="inline-flex h-10 items-center gap-0.5 rounded-[6px] bg-sunken p-0.5" role="group" aria-label="Period">
          {(
            [
              { id: 'today', label: 'Tonight' },
              { id: 'week', label: '7 days' },
              { id: 'all', label: 'All' },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setDay(option.id)}
              aria-pressed={day === option.id}
              className={cn(
                'h-9 rounded-[4px] px-3 text-[13px] font-medium transition-colors',
                day === option.id ? 'bg-surface text-ink' : 'text-muted hover:text-ink',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span className="text-[13px] leading-4 text-faint sm:ml-auto">
          {visible.length} {visible.length === 1 ? 'order' : 'orders'}
        </span>
      </div>

      <div className="scroll-x mt-3 flex gap-4 border-b border-line" role="tablist" aria-label="Order status">
        {tabs.map((entry) => (
          <button
            key={entry.id}
            role="tab"
            type="button"
            aria-selected={tab === entry.id}
            onClick={() => setTab(entry.id)}
            className={cn(
              'relative -mb-px flex shrink-0 items-baseline gap-1.5 pb-2.5 text-[13px] leading-4 transition-colors',
              tab === entry.id ? 'font-medium text-ink' : 'text-muted hover:text-ink',
            )}
          >
            {entry.label}
            <span className="num text-[13px] text-faint">{counts[entry.id] ?? 0}</span>
            {tab === entry.id ? (
              <span className="absolute inset-x-0 -bottom-px h-0.5 bg-ink" aria-hidden="true" />
            ) : null}
          </button>
        ))}
      </div>

      <div className="mt-3">
        {visible.length === 0 ? (
          <div className="panel">
            <EmptyState
              icon={<ClipboardList size={22} strokeWidth={1.4} />}
              title="No order in this view"
              body="Nothing matches the tab, the period and the search together. Widen the period or clear the search."
              action={
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setTab('all')
                    setQuery('')
                    setKitchenId('all')
                    setDay('all')
                  }}
                >
                  Clear the filters
                </button>
              }
            />
          </div>
        ) : (
          <>
            <div className="panel overflow-hidden">
              <div className="scroll-x">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="text-left text-[13px] leading-4 text-faint">
                      <th className="px-4 pt-3 pb-2 font-normal">Order</th>
                      <th className="px-3 pt-3 pb-2 font-normal">Kitchen</th>
                      <th className="px-3 pt-3 pb-2 font-normal">Promised</th>
                      <th className="px-3 pt-3 pb-2 font-normal">Status</th>
                      <th className="px-3 pt-3 pb-2 text-right font-normal">Items</th>
                      <th className="px-3 pt-3 pb-2 text-right font-normal">Total</th>
                      <th className="px-4 pt-3 pb-2 text-right font-normal">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.slice(0, 40).map((order) => {
                      const eta = minutesUntil(order.promisedAt)
                      const live =
                        order.status === 'placed' ||
                        order.status === 'preparing' ||
                        order.status === 'out_for_delivery'
                      return (
                        <tr key={order.id} className="row-hover">
                          <td className="border-t border-rule px-4 py-2.5">
                            <Link to={`/orders/${order.id}`} className="block group">
                              <span className="font-mono text-[13px] leading-4 font-medium tracking-tight group-hover:underline">
                                {order.id}
                              </span>
                              <span className="mt-0.5 block text-[13px] leading-4 text-faint">
                                {order.customer.name} · {formatRelative(order.placedAt)}
                              </span>
                            </Link>
                          </td>
                          <td className="border-t border-rule px-3 py-2.5 text-[13px] leading-4 text-muted">
                            {order.kitchenName}
                          </td>
                          <td className="border-t border-rule px-3 py-2.5">
                            <span className="num block text-[13px] leading-4">{formatClock(order.promisedAt)}</span>
                            <span
                              className={cn(
                                'block text-[13px] leading-4',
                                live && eta < 0 ? 'font-medium text-negative' : 'text-faint',
                              )}
                            >
                              {live
                                ? eta < 0
                                  ? `${formatMinutes(Math.abs(eta))} late`
                                  : `in ${formatMinutes(eta)}`
                                : order.status === 'cancelled'
                                  ? 'cancelled'
                                  : 'served'}
                            </span>
                          </td>
                          <td className="border-t border-rule px-3 py-2.5">
                            <OrderPill status={order.status} />
                          </td>
                          <td className="num border-t border-rule px-3 py-2.5 text-right text-[13px] leading-4 text-muted">
                            {order.items.reduce((sum, item) => sum + item.qty, 0)}
                          </td>
                          <td className="num border-t border-rule px-3 py-2.5 text-right text-[13px] leading-4 font-medium">
                            {formatINR(order.pricing.total)}
                          </td>
                          <td className="border-t border-rule px-4 py-2.5 text-right">
                            {live ? (
                              <button
                                type="button"
                                onClick={() => advanceOrder(order.id)}
                                className="btn btn-sm btn-secondary"
                              >
                                Advance
                              </button>
                            ) : (
                              <Link
                                to={`/orders/${order.id}`}
                                className="text-[13px] font-medium text-muted transition-colors hover:text-ink"
                              >
                                Details
                              </Link>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-2.5 text-[13px] leading-4 text-faint">
              {visible.length > 40
                ? `Showing the newest 40 of ${visible.length}. The history screen has the full ledger.`
                : `All ${visible.length} matching orders are shown.`}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
