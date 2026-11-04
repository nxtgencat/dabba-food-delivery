import { Bike, Check, ChefHat, ClipboardCheck, X } from 'lucide-react'
import type { Order } from '../../types'
import { formatClock } from '../../lib/format'
import { cn } from '../../lib/cn'

const steps = [
  { id: 'placed', label: 'Order placed', icon: ClipboardCheck },
  { id: 'preparing', label: 'In the kitchen', icon: ChefHat },
  { id: 'out_for_delivery', label: 'Out for delivery', icon: Bike },
  { id: 'delivered', label: 'Delivered', icon: Check },
] as const

const indexOf = (order: Order) => {
  if (order.status === 'cancelled') return -1
  return steps.findIndex((step) => step.id === order.status)
}

/** The tiffin stack as the progress meter: each tier fills as the order moves. */
export function OrderTracker({ order }: { order: Order }) {
  if (order.status === 'cancelled') {
    return (
      <div className="flex items-start gap-2.5 rounded-[6px] bg-pill-negative-bg px-3.5 py-3">
        <X size={16} strokeWidth={1.8} className="mt-0.5 shrink-0 text-pill-negative-ink" />
        <div>
          <p className="text-[13px] leading-4 font-medium text-pill-negative-ink">Cancelled</p>
          <p className="mt-0.5 text-[13px] leading-[18px] text-pill-negative-ink/85">
            {order.cancelReason ?? 'The order was cancelled.'}
            {order.payment.status === 'refunded' ? ' The payment is refunded.' : ''}
          </p>
        </div>
      </div>
    )
  }

  const active = indexOf(order)
  const timeOf = (id: string) => order.timeline.find((entry) => entry.status === id)?.at

  return (
    <div>
      <ol className="flex items-center gap-1" aria-label="Order progress">
        {steps.map((step, index) => {
          const done = index < active
          const current = index === active
          const reached = done || current
          return (
            <li key={step.id} className="flex min-w-0 flex-1 items-center gap-1">
              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    'flex h-1.5 w-full rounded-[2px]',
                    reached ? (current ? 'bg-hue' : 'bg-ink') : 'bg-sunken',
                  )}
                  aria-hidden="true"
                />
                <p
                  className={cn(
                    'mt-1.5 flex items-center gap-1 truncate text-[13px] leading-4',
                    current ? 'font-medium text-ink' : reached ? 'text-muted' : 'text-faint',
                  )}
                >
                  <step.icon size={11} strokeWidth={1.8} className="shrink-0" />
                  <span className="truncate">{step.label}</span>
                </p>
                <p className="num text-[11px] leading-3.5 text-faint">
                  {timeOf(step.id) ? formatClock(timeOf(step.id) as string) : '—'}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
      <p className="mt-2 text-[13px] leading-4 text-faint">
        Promised by {formatClock(order.promisedAt)}
        {order.rider ? ` · rider ${order.rider.name}, ${order.rider.phone}` : ''}
      </p>
    </div>
  )
}

/** The full receipt of stages, for an order detail page. */
export function OrderTimeline({ order }: { order: Order }) {
  return (
    <ol className="space-y-0">
      {order.timeline.map((entry, index) => {
        const isLast = index === order.timeline.length - 1
        return (
          <li key={`${entry.status}-${entry.at}`} className="relative flex gap-3 pb-4 last:pb-0">
            {!isLast ? (
              <span
                className="absolute top-3.5 left-[5px] h-full w-px bg-line"
                aria-hidden="true"
              />
            ) : null}
            <span
              className={cn(
                'relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full',
                entry.status === 'cancelled'
                  ? 'bg-negative'
                  : isLast
                    ? 'bg-hue'
                    : 'bg-ink',
              )}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="text-[13px] leading-4 font-medium">
                {entry.status === 'confirmed' ? 'Payment cleared' : entry.note}
              </p>
              <p className="num mt-0.5 text-[13px] leading-4 text-faint">
                {formatClock(entry.at)} · {entry.status.replace('_', ' ')}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
