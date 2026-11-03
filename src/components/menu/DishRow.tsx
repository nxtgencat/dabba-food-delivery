import { Link } from 'react-router-dom'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import type { Dish } from '../../types'
import { formatINR } from '../../lib/format'
import { DietMark } from '../ui/Status'
import { cn } from '../../lib/cn'

export function DishRow({
  dish,
  kitchenName,
  onEdit,
  onDelete,
  onToggle,
  onAdd,
}: {
  dish: Dish
  kitchenName: string
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  onAdd: () => void
}) {
  return (
    <li className="row-hover border-t border-rule first:border-0">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <Link
          to={`/menu/${dish.id}`}
          aria-label={`Open ${dish.name}`}
          className="shrink-0"
        >
          <img
            src={dish.image}
            alt=""
            width={44}
            height={44}
            loading="lazy"
            className="h-11 w-11 rounded-[4px] object-cover"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-1.5">
            <DietMark diet={dish.diet} />
            <Link
              to={`/menu/${dish.id}`}
              className="truncate text-[13px] leading-[18px] font-medium hover:underline"
            >
              {dish.name}
            </Link>
          </p>
          <p className="mt-0.5 truncate text-[13px] leading-4 text-faint">
            <span className="num font-medium text-muted lg:hidden">{formatINR(dish.price)} · </span>
            {kitchenName} · {dish.cuisine}
            <span className="lg:hidden"> · {dish.category}</span>
          </p>
        </div>

        <span className="hidden w-[100px] shrink-0 text-[13px] leading-4 text-muted lg:block">
          {dish.category}
        </span>

        <span className="num hidden w-[90px] shrink-0 text-right text-[13px] leading-4 font-medium lg:block">
          {formatINR(dish.price)}
        </span>

        <span className="w-[104px] shrink-0">
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={!dish.available}
            className={cn(
              'pill max-w-full transition-colors',
              dish.available ? 'pill-positive' : 'pill-warning',
            )}
            title={dish.available ? 'Mark sold out' : 'Put back on sale'}
          >
            <span className="dot" aria-hidden="true" />
            <span className="truncate">
              {dish.available ? 'On sale' : `Sold out${dish.soldOutAt ? ` ${dish.soldOutAt}` : ''}`}
            </span>
          </button>
        </span>

        <div className="flex shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={onAdd}
            disabled={!dish.available}
            className="grid h-8 w-8 place-items-center rounded-[4px] text-muted transition-colors hover:bg-raised hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Add ${dish.name} to the basket`}
            title="Add to basket"
          >
            <Plus size={15} strokeWidth={1.7} />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="grid h-8 w-8 place-items-center rounded-[4px] text-muted transition-colors hover:bg-raised hover:text-ink"
            aria-label={`Edit ${dish.name}`}
            title="Edit dish"
          >
            <Pencil size={14} strokeWidth={1.7} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="grid h-8 w-8 place-items-center rounded-[4px] text-muted transition-colors hover:bg-pill-negative-bg hover:text-pill-negative-ink"
            aria-label={`Remove ${dish.name} from the menu`}
            title="Remove dish"
          >
            <Trash2 size={14} strokeWidth={1.7} />
          </button>
        </div>
      </div>
    </li>
  )
}
