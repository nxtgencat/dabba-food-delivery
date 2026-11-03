import { Link } from 'react-router-dom'
import { Bike, Clock3, MapPin } from 'lucide-react'
import type { Dish, Kitchen } from '../../types'
import { formatINR, formatOpenState } from '../../lib/format'
import { dishRating, dishReviewTotal } from '../../lib/catalog'
import { DietMark, Rating } from '../ui/Status'
import { cn } from '../../lib/cn'

export function RestaurantCard({
  kitchen,
  dishes,
  className,
}: {
  kitchen: Kitchen
  dishes: Dish[]
  className?: string
}) {
  const hero = dishes.find((dish) => dish.id === kitchen.heroDishId) ?? dishes[0]
  const rating = dishRating(dishes)
  const reviews = dishReviewTotal(dishes)
  const open = formatOpenState(kitchen.openTime, kitchen.closeTime)
  const from = dishes.length ? Math.min(...dishes.map((dish) => dish.price)) : 0

  return (
    <Link
      to={`/restaurants/${kitchen.slug}`}
      className={cn(
        'card-pressable group flex flex-col overflow-hidden rounded-[8px] bg-surface shadow-[inset_0_0_0_1px_var(--color-line)]',
        className,
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-sunken">
        {hero ? (
          <img
            src={hero.image}
            alt={`${hero.name} at ${kitchen.name}`}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            loading="lazy"
            width={640}
            height={360}
          />
        ) : null}
        <span className="absolute top-2.5 left-2.5">
          <span className={open.open ? 'pill bg-surface/95 text-ink' : 'pill bg-surface/95 text-muted'}>
            <span
              className={cn('dot', open.open ? 'text-positive' : 'text-faint')}
              aria-hidden="true"
            />
            {open.open ? 'Open now' : 'Closed'}
          </span>
        </span>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[14px] leading-5 font-semibold">{kitchen.name}</h3>
          <Rating value={rating} count={reviews} className="mt-0.5 shrink-0" />
        </div>
        <p className="mt-0.5 truncate text-[13px] leading-4 text-muted">
          {kitchen.cuisine} · {kitchen.area}
        </p>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-4 text-faint">
          <span className="inline-flex items-center gap-1">
            <Clock3 size={12} strokeWidth={1.6} />
            {kitchen.deliveryMinutes} min
          </span>
          <span className="inline-flex items-center gap-1">
            <Bike size={12} strokeWidth={1.6} />
            {kitchen.deliveryFee === 0 ? 'Free delivery' : formatINR(kitchen.deliveryFee)}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin size={12} strokeWidth={1.6} />
            {kitchen.dishIds.length} dishes
          </span>
        </div>
        <p className="mt-2.5 text-[13px] leading-4 text-faint">
          From {formatINR(from)} · {open.label}
        </p>
      </div>
    </Link>
  )
}

export function DishCard({ dish, onAdd }: { dish: Dish; onAdd?: () => void }) {
  return (
    <article className="card-pressable group flex flex-col overflow-hidden rounded-[8px] bg-surface shadow-[inset_0_0_0_1px_var(--color-line)]">
      <Link to={`/menu/${dish.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-sunken">
          <img
            src={dish.image}
            alt={dish.name}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            loading="lazy"
            width={480}
            height={360}
          />
          {!dish.available ? (
            <span className="absolute inset-0 grid place-items-center bg-[rgb(243_244_244/0.72)]">
              <span className="pill bg-surface text-muted">Sold out{dish.soldOutAt ? ` ${dish.soldOutAt}` : ''}</span>
            </span>
          ) : null}
          <span className="absolute top-2 left-2">
            <span className="grid h-5 w-5 place-items-center rounded-[3px] bg-surface/95">
              <DietMark diet={dish.diet} />
            </span>
          </span>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/menu/${dish.id}`} className="min-w-0">
            <h3 className="text-[13px] leading-[18px] font-semibold group-hover:underline">{dish.name}</h3>
          </Link>
          <p className="num shrink-0 text-[13px] leading-[18px] font-semibold">{formatINR(dish.price)}</p>
        </div>
        <p className="mt-1 line-clamp-2 text-[13px] leading-4 text-muted">{dish.description}</p>
        <div className="mt-2 flex items-center gap-2 text-[13px] leading-4 text-faint">
          <Rating value={dish.rating} count={dish.reviewCount} />
          <span aria-hidden="true">·</span>
          <span>{dish.prepMinutes + dish.cookMinutes} min</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{dish.category}</span>
        </div>
        {onAdd ? (
          <button
            type="button"
            onClick={onAdd}
            disabled={!dish.available}
            className="btn btn-secondary btn-sm mt-2.5 w-full"
          >
            {dish.available ? 'Add to basket' : 'Sold out'}
          </button>
        ) : null}
      </div>
    </article>
  )
}
