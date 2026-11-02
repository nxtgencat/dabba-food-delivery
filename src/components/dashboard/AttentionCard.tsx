import { Link } from 'react-router-dom'
import { ArrowUpRight, Flame, Timer } from 'lucide-react'
import type { Order } from '../../types'
import { formatClock, formatINR, formatMinutes, minutesUntil } from '../../lib/format'
import { OrderPill } from '../ui/Status'
import { cn } from '../../lib/cn'

/** Tonight's board: what is late, what is close, what is next to do. */
export function AttentionCard({
  late,
  soon,
  live,
  activeCount,
  onAdvance,
}: {
  late: Order[]
  soon: Order[]
  live: Order[]
  activeCount: number
  onAdvance: (id: string) => void
}) {
  const lateIds = new Set(late.map((order) => order.id))
  const soonIds = new Set(soon.map((order) => order.id))
  // Late first, then due soon, then the rest of the live board: the card always
  // holds four rows, so it fills the height its neighbour sets.
  const rows = [...late, ...soon, ...live.filter((order) => !lateIds.has(order.id) && !soonIds.has(order.id))].slice(0, 4)
  const first = late[0] ?? soon[0]
  const isLate = late.length > 0

  return (
    <section className="panel flex h-full flex-col overflow-hidden">
      <header className="flex items-baseline justify-between gap-3 px-4 pt-4">
        <h2 className="text-[15px] leading-5 font-semibold">Needs a hand</h2>
        <span className="text-[13px] leading-4 text-faint">{activeCount} in play</span>
      </header>

      <div className="px-4 pt-3">
        <div
          className={cn(
            'flex items-start gap-2.5 rounded-[6px] px-3 py-2.5',
            isLate ? 'bg-pill-negative-bg' : 'bg-pill-warning-bg',
          )}
        >
          {isLate ? (
            <Flame size={15} strokeWidth={1.7} className="mt-0.5 shrink-0 text-pill-negative-ink" />
          ) : (
            <Timer size={15} strokeWidth={1.7} className="mt-0.5 shrink-0 text-pill-warning-ink" />
          )}
          <div className="min-w-0">
            <p
              className={cn(
                'text-[13px] leading-4 font-medium',
                isLate ? 'text-pill-negative-ink' : 'text-pill-warning-ink',
              )}
            >
              {isLate
                ? `${late.length} ${late.length === 1 ? 'order is' : 'orders are'} past the promised time`
                : soon.length
                  ? `${soon.length} ${soon.length === 1 ? 'order is' : 'orders are'} due within 15 minutes`
                  : 'Every live order is inside its window'}
            </p>
            <p
              className={cn(
                'mt-0.5 text-[13px] leading-4',
                isLate ? 'text-pill-negative-ink/80' : 'text-pill-warning-ink/85',
              )}
            >
              {first
                ? isLate
                  ? `Latest: ${first.id} for ${first.customer.name.split(' ')[0]}, ${formatMinutes(Math.abs(minutesUntil(first.promisedAt)))} past.`
                  : `Next: ${first.id}, due ${formatMinutes(minutesUntil(first.promisedAt))} from now.`
                : `${activeCount} orders moving; the next promise is still ahead.`}
            </p>
          </div>
        </div>
      </div>

      <ul className="mt-2 divide-y divide-rule px-4">
        {rows.map((order) => {
          const lateOrder = lateIds.has(order.id)
          const soonOrder = soonIds.has(order.id)
          return (
            <li key={order.id} className="flex items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="flex items-baseline gap-1.5 text-[13px] leading-4">
                  <Link
                    to={`/orders/${order.id}`}
                    className="font-mono text-[13px] font-medium tracking-tight hover:underline"
                  >
                    {order.id}
                  </Link>
                  <span className="truncate text-muted">· {order.kitchenName}</span>
                </p>
                <p className="mt-0.5 truncate text-[13px] leading-4 text-faint">
                  {order.customer.name} · {formatINR(order.pricing.total)} ·{' '}
                  {lateOrder
                    ? `${formatMinutes(Math.abs(minutesUntil(order.promisedAt)))} late`
                    : soonOrder
                      ? `due ${formatMinutes(minutesUntil(order.promisedAt))}`
                      : `promised ${formatClock(order.promisedAt)}`}
                </p>
              </div>
              <OrderPill status={order.status} />
              <button
                type="button"
                onClick={() => onAdvance(order.id)}
                className="btn btn-sm btn-secondary shrink-0"
                aria-label={`Move ${order.id} to the next stage`}
              >
                Advance
              </button>
            </li>
          )
        })}
      </ul>

      {!rows.length ? (
        <div className="flex flex-1 flex-col justify-center px-4 py-8">
          <p className="text-[13px] leading-5 font-medium">No live orders.</p>
          <p className="mt-1 text-[13px] leading-[18px] text-muted">
            The next basket will appear here the moment it is paid.
          </p>
        </div>
      ) : (
        <div className="flex-1" aria-hidden="true" />
      )}

      <footer className="px-4 pt-3 pb-4">
        <Link
          to="/orders"
          className="inline-flex items-center gap-1 text-[13px] leading-4 font-medium text-ink transition-colors hover:text-muted"
        >
          Open the live board
          <ArrowUpRight size={13} strokeWidth={1.7} />
        </Link>
      </footer>
    </section>
  )
}
