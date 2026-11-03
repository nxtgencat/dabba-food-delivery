import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Clock3, Flame, Minus, Plus, Star, Users } from 'lucide-react'
import { toast } from 'react-toastify'
import { Breadcrumbs } from '../../components/ui/Controls'
import { EmptyState, Skeleton } from '../../components/ui/Feedback'
import { Panel, SectionHeading } from '../../components/ui/Page'
import { DishCard } from '../../components/catalog/Cards'
import { DietMark, Pill } from '../../components/ui/Status'
import { useCart, useCatalog } from '../../hooks/useApp'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { cartLineFromDish } from '../../lib/cart'
import { formatINR, formatOpenState } from '../../lib/format'
import { cn } from '../../lib/cn'

export function DishDetailPage() {
  const { dishId } = useParams()
  const { dishes, kitchens, status } = useCatalog()
  const { addLine, cart, setQty, removeLine } = useCart()
  const [qty, setLocalQty] = useState(1)

  const dish = dishes.find((entry) => entry.id === dishId)
  useDocumentTitle(dish ? dish.name : 'Dish')

  const kitchen = kitchens.find((entry) => entry.id === dish?.kitchenId)
  const own = useMemo(
    () =>
      dish
        ? dishes.filter((entry) => entry.kitchenId === dish.kitchenId && entry.id !== dish.id).slice(0, 3)
        : [],
    [dishes, dish],
  )

  const inBasket = cart.lines.find((line) => line.dishId === dish?.id)

  if (status === 'loading') {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Skeleton className="h-[360px] rounded-[8px]" />
        <Skeleton className="h-[320px] rounded-[8px]" />
      </div>
    )
  }

  if (!dish || !kitchen) {
    return (
      <Panel>
        <EmptyState
          title="That dish is no longer on the menu"
          body="It may have been removed or renamed. The menu lists every dish that is currently served."
          action={
            <Link to="/menu" className="btn btn-primary">
              Back to the menu
            </Link>
          }
        />
      </Panel>
    )
  }

  const open = formatOpenState(kitchen.openTime, kitchen.closeTime)
  const totalMinutes = dish.prepMinutes + dish.cookMinutes

  const addToBasket = () => {
    addLine(cartLineFromDish(dish), kitchen, qty)
    if (cart.kitchenId === kitchen.id || !cart.lines.length) {
      toast.success(`${qty} × ${dish.name} added to the basket.`)
    }
  }

  return (
    <div className="app-fade">
      <Breadcrumbs
        items={[
          { label: 'Menu', to: '/menu' },
          { label: kitchen.name, to: `/restaurants/${kitchen.slug}` },
          { label: dish.name },
        ]}
      />

      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_356px]">
        <div className="min-w-0 space-y-3">
          <Panel className="overflow-hidden">
            <div className="aspect-[16/10] bg-sunken sm:aspect-[2/1]">
              <img
                src={dish.image}
                alt={dish.name}
                className="h-full w-full object-cover"
                width={960}
                height={480}
              />
            </div>
            <div className="p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-[4px] bg-sunken px-2 py-1 text-[12px] leading-none text-muted">
                      <DietMark diet={dish.diet} />
                      {dish.diet === 'veg' ? 'Vegetarian' : 'Non-vegetarian'}
                    </span>
                    <Pill tone="neutral">{dish.category}</Pill>
                    {dish.soldOutAt && !dish.available ? (
                      <Pill tone="warning" dot>
                        Sold out {dish.soldOutAt}
                      </Pill>
                    ) : (
                      <Pill tone="positive" dot>
                        On sale
                      </Pill>
                    )}
                    {dish.custom ? <Pill tone="hue">Added here</Pill> : null}
                  </div>
                  <h1 className="mt-2.5 text-[26px] leading-8 font-semibold tracking-[-0.02em]">
                    {dish.name}
                  </h1>
                  <p className="mt-1 text-[13px] leading-5 text-muted">
                    {dish.cuisine} · {kitchen.name}, {kitchen.area}
                  </p>
                </div>
                <p className="num text-[24px] leading-8 font-semibold">{formatINR(dish.price)}</p>
              </div>

              <p className="mt-4 max-w-[68ch] text-[14px] leading-[22px]">{dish.description}</p>

              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
                <div>
                  <dt className="flex items-center gap-1 text-[12px] leading-4 text-faint">
                    <Star size={11} strokeWidth={1.7} />
                    Rating
                  </dt>
                  <dd className="num mt-0.5 text-[13px] leading-5 font-medium">
                    {dish.rating ? dish.rating.toFixed(1) : 'New'}
                    <span className="ml-1 text-[12px] font-normal text-faint">
                      {dish.reviewCount ? `${dish.reviewCount} reviews` : 'no reviews yet'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-[12px] leading-4 text-faint">
                    <Clock3 size={11} strokeWidth={1.7} />
                    Cook time
                  </dt>
                  <dd className="num mt-0.5 text-[13px] leading-5 font-medium">{totalMinutes} min</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-[12px] leading-4 text-faint">
                    <Flame size={11} strokeWidth={1.7} />
                    Calories
                  </dt>
                  <dd className="num mt-0.5 text-[13px] leading-5 font-medium">
                    {dish.calories ? `${dish.calories} kcal` : 'not published'}
                    <span className="ml-1 text-[12px] font-normal text-faint">per serving</span>
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1 text-[12px] leading-4 text-faint">
                    <Users size={11} strokeWidth={1.7} />
                    Difficulty
                  </dt>
                  <dd className="mt-0.5 text-[13px] leading-5 font-medium">{dish.difficulty}</dd>
                </div>
              </dl>
            </div>
          </Panel>

          <div className="grid items-start gap-3 md:grid-cols-2">
            <Panel className="p-4 sm:p-5">
              <SectionHeading title="Ingredients" meta={`${dish.ingredients.length}`} />
              {dish.ingredients.length ? (
                <ul className="mt-2.5 grid gap-1.5">
                  {dish.ingredients.map((ingredient) => (
                    <li key={ingredient} className="flex items-start gap-2 text-[13px] leading-[18px]">
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-control" aria-hidden="true" />
                      {ingredient}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2.5 text-[13px] leading-[18px] text-muted">
                  This dish was added by hand and has no published ingredient list yet.
                </p>
              )}
            </Panel>

            <Panel className="p-4 sm:p-5">
              <SectionHeading title="At the kitchen" meta={kitchen.name} />
              {dish.instructions.length ? (
                <ol className="mt-2.5 space-y-2.5">
                  {dish.instructions.map((step, index) => (
                    <li key={step} className="flex gap-2.5 text-[13px] leading-[18px] text-muted">
                      <span className="num mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-sunken text-[11px] leading-none font-medium text-ink">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-2.5 text-[13px] leading-[18px] text-muted">
                  No method is published for this dish. The kitchen follows its own card.
                </p>
              )}
            </Panel>
          </div>
        </div>

        <aside className="space-y-3">
          <Panel className="overflow-hidden">
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] leading-4 font-medium">{kitchen.name}</p>
                <span className={open.open ? 'pill pill-positive' : 'pill pill-neutral'}>
                  <span className={cn('dot', open.open ? '' : 'text-faint')} aria-hidden="true" />
                  {open.open ? 'Open' : 'Closed'}
                </span>
              </div>
              <p className="mt-1 text-[13px] leading-4 text-faint">
                {open.label} · {kitchen.deliveryMinutes} min delivery · {formatINR(kitchen.deliveryFee)} fee
              </p>

              <div className="mt-3 flex items-center justify-between gap-3 rounded-[6px] bg-raised px-3 py-2.5">
                <div>
                  <p className="text-[12px] leading-4 text-faint">Line total</p>
                  <p className="num text-[16px] leading-6 font-semibold">{formatINR(dish.price * qty)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setLocalQty((value) => Math.max(1, value - 1))}
                    className="grid h-8 w-8 place-items-center rounded-[4px] bg-surface text-muted shadow-[inset_0_0_0_1px_var(--color-control)] transition-colors hover:text-ink"
                    aria-label="One fewer"
                    disabled={qty <= 1}
                  >
                    <Minus size={14} strokeWidth={1.8} />
                  </button>
                  <span className="num w-7 text-center text-[13px] font-medium" aria-live="polite">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setLocalQty((value) => Math.min(20, value + 1))}
                    className="grid h-8 w-8 place-items-center rounded-[4px] bg-surface text-muted shadow-[inset_0_0_0_1px_var(--color-control)] transition-colors hover:text-ink"
                    aria-label="One more"
                    disabled={qty >= 20}
                  >
                    <Plus size={14} strokeWidth={1.8} />
                  </button>
                </div>
              </div>

              {inBasket ? (
                <div className="mt-2.5 flex items-center justify-between gap-2 rounded-[6px] px-1 py-1 text-[13px]">
                  <span className="text-muted">
                    In the basket: <span className="num font-medium text-ink">{inBasket.qty}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setQty(dish.id, inBasket.qty - 1)}
                      className="grid h-7 w-7 place-items-center rounded-[4px] bg-surface text-muted shadow-[inset_0_0_0_1px_var(--color-control)] hover:text-ink"
                      aria-label="Remove one from the basket"
                    >
                      <Minus size={13} strokeWidth={1.8} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setQty(dish.id, inBasket.qty + 1)}
                      className="grid h-7 w-7 place-items-center rounded-[4px] bg-surface text-muted shadow-[inset_0_0_0_1px_var(--color-control)] hover:text-ink"
                      aria-label="Add one more to the basket"
                    >
                      <Plus size={13} strokeWidth={1.8} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeLine(dish.id)}
                      className="ml-1 text-[13px] text-faint hover:text-negative"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : null}

              <button
                type="button"
                onClick={addToBasket}
                disabled={!dish.available}
                className="btn btn-primary btn-lg mt-3 w-full"
              >
                {dish.available ? `Add ${qty} to the basket` : 'Sold out tonight'}
              </button>
              <Link to="/cart" className="btn btn-secondary mt-2 w-full">
                Open the basket{cart.lines.length ? ` (${cart.lines.length})` : ''}
              </Link>
              {!dish.available ? (
                <p className="mt-2.5 text-[13px] leading-4 text-muted">
                  The kitchen marked this sold out{dish.soldOutAt ? ` at ${dish.soldOutAt}` : ''}. Try
                  another dish from the same kitchen, or check back tomorrow.
                </p>
              ) : (
                <p className="mt-2.5 text-[13px] leading-4 text-faint">
                  Packed at {kitchen.name}; the promised time is set when the order is placed.
                </p>
              )}
            </div>

            <div className="bg-raised px-4 py-3 sm:px-5">
              <p className="text-[12px] leading-4 font-medium">Nutrition</p>
              <dl className="mt-1.5 space-y-1 text-[13px] leading-4">
                <div className="flex justify-between gap-2">
                  <dt className="text-faint">Energy</dt>
                  <dd className="num">{dish.calories ? `${dish.calories} kcal` : 'not published'}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-faint">Prep</dt>
                  <dd className="num">{dish.prepMinutes} min</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-faint">Cook</dt>
                  <dd className="num">{dish.cookMinutes} min</dd>
                </div>
              </dl>
              <Link
                to={`/restaurants/${kitchen.slug}`}
                className="mt-2 inline-block text-[13px] font-medium text-ink hover:underline"
              >
                All of {kitchen.name}
              </Link>
            </div>
          </Panel>

          {own.length ? (
            <Panel className="overflow-hidden">
              <header className="px-4 pt-3.5">
                <SectionHeading title="Also from this kitchen" meta={`${own.length} dishes`} />
              </header>
              <ul className="mt-2 px-4 pb-3">
                {own.map((other) => (
                  <li key={other.id} className="flex items-center gap-2.5 border-t border-rule py-2 first:border-0">
                    <Link to={`/menu/${other.id}`} className="shrink-0" aria-label={`Open ${other.name}`}>
                      <img
                        src={other.image}
                        alt=""
                        width={36}
                        height={36}
                        loading="lazy"
                        className="h-9 w-9 rounded-[3px] object-cover"
                      />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/menu/${other.id}`}
                        className="block truncate text-[13px] leading-4 font-medium hover:underline"
                      >
                        {other.name}
                      </Link>
                      <p className="num text-[12px] leading-4 text-faint">
                        {formatINR(other.price)}
                        {!other.available ? ' · sold out' : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        addLine(cartLineFromDish(other), kitchen)
                        toast.success(`${other.name} added to the basket.`)
                      }}
                      disabled={!other.available}
                      className="btn btn-sm btn-secondary shrink-0"
                      aria-label={`Add ${other.name} to the basket`}
                    >
                      <Plus size={13} strokeWidth={1.8} />
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}
        </aside>
      </div>

      {own.length ? (
        <section className="mt-6">
          <SectionHeading title="Also from this kitchen" meta={`${kitchen.name}, ${kitchen.area}`} />
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {own.map((other) => (
              <DishCard key={other.id} dish={other} onAdd={() => addLine(cartLineFromDish(other), kitchen)} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}