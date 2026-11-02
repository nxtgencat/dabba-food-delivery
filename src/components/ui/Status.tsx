import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'
import type { OrderStatus, PaymentStatus } from '../../types'

type Tone = 'positive' | 'negative' | 'warning' | 'neutral' | 'hue'

const toneClass: Record<Tone, string> = {
  positive: 'pill pill-positive',
  negative: 'pill pill-negative',
  warning: 'pill pill-warning',
  neutral: 'pill pill-neutral',
  hue: 'pill pill-hue',
}

export function Pill({
  children,
  tone = 'neutral',
  dot,
  className,
}: {
  children: React.ReactNode
  tone?: Tone
  dot?: boolean
  className?: string
}) {
  return (
    <span className={cn(toneClass[tone], className)}>
      {dot ? <span className="dot" /> : null}
      {children}
    </span>
  )
}

const orderTone: Record<OrderStatus, Tone> = {
  placed: 'neutral',
  preparing: 'warning',
  out_for_delivery: 'hue',
  delivered: 'positive',
  cancelled: 'negative',
}

const orderLabel: Record<OrderStatus, string> = {
  placed: 'Placed',
  preparing: 'Preparing',
  out_for_delivery: 'On the way',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export function OrderPill({ status }: { status: OrderStatus }) {
  return (
    <Pill tone={orderTone[status]} dot>
      {orderLabel[status]}
    </Pill>
  )
}

export function PaymentPill({ status }: { status: PaymentStatus }) {
  if (status === 'paid') {
    return (
      <Pill tone="positive">
        <Check size={10} strokeWidth={2.4} />
        Paid
      </Pill>
    )
  }
  if (status === 'refunded') {
    return <Pill tone="neutral">Refunded</Pill>
  }
  return <Pill tone="negative">Failed</Pill>
}

export function DietMark({ diet }: { diet: 'veg' | 'nonveg' }) {
  return (
    <span
      className={cn(
        'inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[2px] border',
        diet === 'veg' ? 'border-positive text-positive' : 'border-negative text-negative',
      )}
      role="img"
      aria-label={diet === 'veg' ? 'Vegetarian' : 'Non-vegetarian'}
      title={diet === 'veg' ? 'Vegetarian' : 'Non-vegetarian'}
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          diet === 'veg' ? 'bg-positive' : 'bg-negative',
        )}
        style={
          diet === 'nonveg'
            ? { clipPath: 'polygon(50% 0, 100% 100%, 0 100%)', borderRadius: 0 }
            : undefined
        }
      />
    </span>
  )
}

export function Rating({ value, count, className }: { value: number; count?: number; className?: string }) {
  if (!value) return <span className={cn('text-[13px] text-faint', className)}>New</span>
  return (
    <span className={cn('inline-flex items-baseline gap-1.5 text-[13px]', className)}>
      <span className="num font-medium text-ink">{value.toFixed(1)}</span>
      {count !== undefined ? (
        <span className="num text-faint">({count.toLocaleString('en-IN')})</span>
      ) : null}
    </span>
  )
}
