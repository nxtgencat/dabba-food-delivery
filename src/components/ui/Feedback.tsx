import { useEffect, useState, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { cn } from '../../lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="skeleton skeleton-text"
          style={{ width: index === lines - 1 ? '62%' : '100%' }}
        />
      ))}
    </div>
  )
}

export function SkeletonRows({ rows = 4, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex items-center gap-4 border-t border-rule py-3 first:border-0">
          <Skeleton className="h-9 w-9 shrink-0 rounded-[4px]" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3 w-[45%]" />
            <Skeleton className="h-2.5 w-[28%]" />
          </div>
          {Array.from({ length: Math.max(0, columns - 2) }).map((__, cell) => (
            <Skeleton key={cell} className="hidden h-3 w-14 sm:block" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="panel overflow-hidden">
          <Skeleton className="aspect-[16/9] w-full rounded-none" />
          <div className="space-y-2.5 p-4">
            <Skeleton className="h-3.5 w-3/5" />
            <Skeleton className="h-2.5 w-4/5" />
            <Skeleton className="h-2.5 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-control border-t-ink',
        className,
      )}
    />
  )
}

export function EmptyState({
  icon,
  title,
  body,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  body: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 py-12 text-center',
        className,
      )}
    >
      {icon ? <div className="mb-3 text-faint">{icon}</div> : null}
      <h3 className="text-[15px] font-semibold">{title}</h3>
      <p className="mt-1.5 max-w-[46ch] text-[13px] leading-5 text-muted">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

export function ErrorBlock({
  title,
  body,
  onRetry,
  className,
}: {
  title: string
  body: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-wrap items-start gap-3 rounded-[6px] bg-pill-negative-bg px-4 py-3',
        className,
      )}
    >
      <AlertTriangle size={16} strokeWidth={1.6} className="mt-0.5 shrink-0 text-pill-negative-ink" />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium text-pill-negative-ink">{title}</p>
        <p className="mt-0.5 text-[13px] leading-[18px] text-pill-negative-ink/80">{body}</p>
      </div>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="btn btn-sm btn-secondary">
          <RefreshCw size={13} strokeWidth={1.7} />
          Try again
        </button>
      ) : null}
    </div>
  )
}

/** Shows a skeleton for a beat and then the content: used where there is no data fetch
 *  to hang a loading state on (a simulated service call), never to hide slow work. */
export function useSimulatedLoading(key: string, delay = 420) {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    const timer = window.setTimeout(() => setLoading(false), delay)
    return () => window.clearTimeout(timer)
  }, [key, delay])
  return loading
}
