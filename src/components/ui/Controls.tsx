import { Link } from 'react-router-dom'
import { cn } from '../../lib/cn'
import type { MealFilter } from '../../lib/catalog'

const options: { id: MealFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'veg', label: 'Veg' },
  { id: 'nonveg', label: 'Non-veg' },
]

export function DietToggle({
  value,
  onChange,
  className,
}: {
  value: MealFilter
  onChange: (next: MealFilter) => void
  className?: string
}) {
  return (
    <div
      className={cn('inline-flex h-9 items-center gap-0.5 rounded-[6px] bg-sunken p-0.5', className)}
      role="group"
      aria-label="Filter by diet"
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange(option.id)}
          aria-pressed={value === option.id}
          className={cn(
            'h-8 rounded-[4px] px-3 text-[13px] font-medium transition-colors',
            value === option.id
              ? 'bg-surface text-ink'
              : 'text-muted hover:text-ink',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function Breadcrumbs({
  items,
}: {
  items: { label: string; to?: string }[]
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-1.5">
      <ol className="flex flex-wrap items-center gap-1 text-[13px] leading-4 text-faint">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1">
            {item.to ? (
              <Link to={item.to} className="transition-colors hover:text-ink">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-muted">
                {item.label}
              </span>
            )}
            {index < items.length - 1 ? (
              <span aria-hidden="true" className="text-control">
                /
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  )
}
