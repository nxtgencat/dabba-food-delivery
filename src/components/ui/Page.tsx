import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { cn } from '../../lib/cn'
import type { ReactNode } from 'react'

export function PageHeader({
  title,
  finding,
  actions,
  headingId = 'page-title',
}: {
  title: string
  finding?: ReactNode
  actions?: ReactNode
  headingId?: string
}) {
  return (
    <div className="flex flex-col gap-3 pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <h1 id={headingId} className="text-[24px] leading-8 font-semibold tracking-[-0.015em] outline-none">
          {title}
        </h1>
        {finding ? <div className="mt-1 max-w-[76ch] text-[13px] leading-5 text-muted">{finding}</div> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function SectionHeading({
  title,
  meta,
  action,
  className,
}: {
  title: string
  meta?: ReactNode
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-baseline justify-between gap-3', className)}>
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <h2 className="text-[15px] leading-5 font-semibold">{title}</h2>
        {meta ? <span className="text-[13px] leading-4 text-faint">{meta}</span> : null}
      </div>
      {action}
    </div>
  )
}

export function Panel({
  children,
  className,
  as: Tag = 'section',
}: {
  children: ReactNode
  className?: string
  as?: 'section' | 'div' | 'article'
}) {
  return <Tag className={cn('panel', className)}>{children}</Tag>
}

export function ViewAll({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-0.5 text-[13px] font-medium text-muted transition-colors hover:text-ink"
    >
      {children}
      <ChevronRight size={13} strokeWidth={1.7} />
    </Link>
  )
}
