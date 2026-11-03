import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Bike, Clock3, MapPin, Search, Star } from 'lucide-react'
import { toast } from 'react-toastify'
import { Breadcrumbs, DietToggle } from '../../components/ui/Controls'
import { EmptyState, SkeletonCards } from '../../components/ui/Feedback'
import { Panel } from '../../components/ui/Page'
import { DishCard } from '../../components/catalog/Cards'
import { useCart, useCatalog } from '../../hooks/useApp'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { cartLineFromDish } from '../../lib/cart'
import { filterDishes, sortDishes, type MealFilter } from '../../lib/catalog'
import { formatINR, formatOpenState } from '../../lib/format'
import { categoryOrder } from '../../data/demo'
import { cn } from '../../lib/cn'

export function RestaurantDetailPage() {
  const { slug } = useParams()
  const { kitchens, dishes, status } = useCatalog()
  const { addLine, cart } = useCart()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [diet, setDiet] = useState<MealFilter>('all')
  const [sort, setSort] = useState('popular')

  const kitchen = kitchens.find((entry) => entry.slug === slug)
  useDocumentTitle(kitchen ? kitchen.name : 'Restaurant')

  const own = useMemo(
    () => dishes.filter((dish) => dish.kitchenId === kitchen?.id),
    [dishes, kitchen?.id],
  )
  const categories = useMemo(() => {
    const present = new Set(own.map((dish) => dish.category))
    return categoryOrder.filter((entry) => present.has(entry))
  }, [own])

  const visible = useMemo(
    () => sortDishes(filterDishes(own, { query, category, diet }), sort),
    [own, query, category, diet, sort],
  )

  const rating = own.length
    ? Math.round(
        (own.reduce((sum, dish) => sum + dish.rating * dish.reviewCount, 0) /
          Math.max(1, own.reduce((sum, dish) => sum + dish.reviewCount, 0))) *
          10,
      ) / 10
    : 0
  const reviews = own.reduce((sum, dish) => sum + dish.reviewCount, 0)
  const hero = own.find((dish) => dish.id === kitchen?.heroDishId) ?? own[0]

  const add = (dishId: string) => {
    const dish = own.find((entry) => entry.id === dishId)
    if (!dish || !kitchen) return
    addLine(cartLineFromDish(dish), kitchen)
    if (cart.kitchenId === kitchen.id || !cart.lines.length) {
      toast.success(`${dish.name} added to the basket.`)
    }
  }

  if (status === 'loading') {
    return (
      <div className="space-y-4">
        <div className="skeleton h-5 w-40" />
        <div className="skeleton h-[200px] rounded-[8px]" />
        <SkeletonCards count={6} />
      </div>
    )
  }

  if (!kitchen) {
    return (
      <Panel>
        <EmptyState
          title="That kitchen is not on the roster"
          body="The restaurant may have left the roster, or the link may be old. Every kitchen is listed on the restaurants screen."
          action={
            <Link to="/restaurants" className="btn btn-primary">
              All restaurants
            </Link>
          }
        />
      </Panel>
    )
  }

  const open = formatOpenState(kitchen.openTime, kitchen.closeTime)
  const from = own.length ? Math.min(...own.map((dish) => dish.price)) : 0

  return (
    <div className="app-fade">
      <Breadcrumbs items={[{ label: 'Restaurants', to: '/restaurants' }, { label: kitchen.name }]} />

      <Panel className="overflow-hidden">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="order-2 p-4 sm:p-5 lg:order-1 lg:py-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className={open.open ? 'pill pill-positive' : 'pill pill-neutral'}>
                <span className={cn('dot', open.open ? '' : 'text-faint')} aria-hidden="true" />
                {open.open ? 'Open now' : 'Closed'}
              </span>
              <span className="text-[13px] leading-4 text-faint">{open.label}</span>
            </div>
            <h1 className="mt-2 text-[26px] leading-8 font-semibold tracking-[-0.02em] sm:text-[30px]">
              {kitchen.name}
            </h1>
            <p className="mt-1 text-[13px] leading-5 text-muted">
              {kitchen.cuisine} · {kitchen.tags.join(' · ')}
            </p>
            <p className="mt-2.5 max-w-[58ch] text-[13px] leading-[21px]">{kitchen.blurb}</p>

            <dl className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              <div>
                <dt className="text-[13px] leading-4 text-faint">Rating</dt>
                <dd className="mt-0.5 flex items-center gap-1.5 text-[13px] leading-5 font-medium">
                  <Star size={13} strokeWidth={1.7} className="text-ink" />
                  {rating ? rating.toFixed(1) : 'New'}
                  <span className="text-[13px] font-normal text-faint">
                    {reviews.toLocaleString('en-IN')} reviews
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-[13px] leading-4 text-faint">Delivery</dt>
                <dd className="mt-0.5 flex items-center gap-1.5 text-[13px] leading-5 font-medium">
                  <Clock3 size={13} strokeWidth={1.7} />
                  {kitchen.deliveryMinutes} min
                  <span className="text-[13px] font-normal text-faint">kitchen to door</span>
                </dd>
              </div>
              <div>
                <dt className="text-[13px] leading-4 text-faint">Fee</dt>
                <dd className="mt-0.5 flex items-center gap-1.5 text-[13px] leading-5 font-medium">
                  <Bike size={13} strokeWidth={1.7} />
                  {formatINR(kitchen.deliveryFee)}
                  <span className="text-[13px] font-normal text-faint">per order</span>
                </dd>
              </div>
              <div>
                <dt className="text-[13px] leading-4 text-faint">From</dt>
                <dd className="num mt-0.5 text-[13px] leading-5 font-medium">{formatINR(from)}</dd>
              </div>
            </dl>

            <p className="mt-4 flex items-start gap-1.5 text-[13px] leading-[18px] text-muted">
              <MapPin size={13} strokeWidth={1.7} className="mt-0.5 shrink-0" />
              {kitchen.address}
            </p>
          </div>

          {hero ? (
            <div className="relative order-1 aspect-[16/9] bg-sunken lg:order-2 lg:aspect-auto">
              <img
                src={hero.image}
                alt={`${hero.name}, the kitchen's signature dish`}
                className="h-full w-full object-cover lg:absolute lg:inset-0"
                width={640}
                height={480}
              />
              {/* Neutral scrim only, so the caption stays legible on the photograph. */}
              <div className="taste-skill-ignore absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,rgb(17_19_19/0.62),transparent)] p-3.5">
                <p className="text-[13px] leading-4 text-white/75">Most ordered from this kitchen</p>
                <p className="text-[13px] leading-5 font-medium text-white">
                  {hero.name} · {formatINR(hero.price)}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </Panel>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-[300px]">
          <Search
            size={15}
            strokeWidth={1.7}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${kitchen.name}’s menu`}
            aria-label={`Search dishes at ${kitchen.name}`}
            className="field pl-9"
          />
        </div>
        <DietToggle value={diet} onChange={setDiet} />
        <label className="flex items-center gap-2 text-[13px] text-faint">
          Sort
          <select
            className="field h-9 w-auto min-w-[132px]"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            aria-label="Sort dishes"
          >
            <option value="popular">Most reviewed</option>
            <option value="rating">Highest rated</option>
            <option value="price-asc">Price, low first</option>
            <option value="price-desc">Price, high first</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>
        <span className="text-[13px] leading-4 text-faint sm:ml-auto">
          {visible.length} of {own.length} dishes
        </span>
      </div>

      <div className="scroll-x mt-3 flex gap-1.5 pb-1" role="group" aria-label="Filter by category">
        {['all', ...categories].map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => setCategory(entry)}
            aria-pressed={category === entry}
            className={cn(
              'h-8 shrink-0 rounded-[5px] px-3 text-[13px] font-medium transition-colors',
              category === entry
                ? 'bg-ink text-invert'
                : 'bg-surface text-muted shadow-[inset_0_0_0_1px_var(--color-line)] hover:text-ink',
            )}
          >
            {entry === 'all' ? 'Everything' : entry}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {visible.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((dish) => (
              <DishCard key={dish.id} dish={dish} onAdd={() => add(dish.id)} />
            ))}
          </div>
        ) : (
          <Panel>
            <EmptyState
              title={query ? 'No dish matches that' : 'Nothing in this corner of the menu'}
              body={
                query
                  ? `Nothing at ${kitchen.name} matches “${query}”. Try an ingredient or clear the filters.`
                  : 'Every dish here is filtered out. Clear the category or diet filter to see the rest of the menu.'
              }
              action={
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setQuery('')
                    setCategory('all')
                    setDiet('all')
                  }}
                >
                  Clear the filters
                </button>
              }
            />
          </Panel>
        )}
      </div>
    </div>
  )
}
