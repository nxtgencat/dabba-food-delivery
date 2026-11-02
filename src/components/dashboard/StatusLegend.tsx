import { Link } from 'react-router-dom'
import type { OrderStatus } from '../../types'
import { SectionHeading } from '../ui/Page'

const stages: { id: OrderStatus; label: string }[] = [
  { id: 'placed', label: 'Placed' },
  { id: 'preparing', label: 'Preparing' },
  { id: 'out_for_delivery', label: 'On the way' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
]

const swatch: Record<OrderStatus, string> = {
  placed: 'bg-[#cfd4d4]',
  preparing: 'bg-[#8f9696]',
  out_for_delivery: 'bg-hue',
  delivered: 'bg-positive',
  cancelled: 'bg-negative',
}

/** The evening at a glance: each stage's share as a bar, the counts as a legend table. */
export function StatusLegend({
  counts,
  total,
}: {
  counts: Record<OrderStatus, number>
  total: number
}) {
  const safeTotal = Math.max(1, total)
  return (
    <section className="panel flex flex-col overflow-hidden">
      <header className="px-4 pt-4 sm:px-5">
        <SectionHeading title="Tonight by stage" meta={`${total} orders`} />
      </header>

      <div className="px-4 pt-3 sm:px-5">
        <div className="mt-3 flex h-2.5 w-full overflow-hidden rounded-[2px]" role="img" aria-label={`Order stages across ${total} orders`}>
          {stages.map((stage) => {
            const count = counts[stage.id]
            if (!count) return null
            return (
              <span
                key={stage.id}
                className={`bar-grow ${swatch[stage.id]}`}
                style={{ width: `${(count / safeTotal) * 100}%` }}
              />
            )
          })}
        </div>
      </div>

      <ul className="mt-3 px-4 pb-2 sm:px-5">
        {stages.map((stage) => {
          const count = counts[stage.id]
          return (
            <li
              key={stage.id}
              className="flex items-center gap-2.5 border-t border-rule py-2 first:border-0"
            >
              <span className={`h-2 w-2 shrink-0 rounded-[1px] ${swatch[stage.id]}`} aria-hidden="true" />
              <span className="flex-1 text-[13px] leading-4 text-muted">{stage.label}</span>
              <span className="num text-[13px] leading-4 font-medium">{count}</span>
              <span className="num w-10 text-right text-[13px] leading-4 text-faint">
                {total ? `${Math.round((count / total) * 100)}%` : '–'}
              </span>
            </li>
          )
        })}
      </ul>

      <div className="mx-4 mb-3 rounded-[6px] bg-raised px-3 py-2.5 sm:mx-5">
        <p className="text-[12px] leading-4 text-faint">Still to serve tonight</p>
        <p className="num mt-0.5 text-[16px] leading-6 font-medium">
          {counts.placed + counts.preparing + counts.out_for_delivery}
          <span className="ml-1.5 text-[12px] font-normal text-muted">
            of {total} {total === 1 ? 'order' : 'orders'}
          </span>
        </p>
      </div>

      <div className="mt-auto px-4 pb-4 sm:px-5">
        <Link to="/orders" className="text-[13px] font-medium text-ink hover:underline">
          Work the whole board
        </Link>
      </div>
    </section>
  )
}
