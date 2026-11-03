import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Search, SlidersHorizontal, UtensilsCrossed } from 'lucide-react'
import { toast } from 'react-toastify'
import { PageHeader } from '../../components/ui/Page'
import { DietToggle } from '../../components/ui/Controls'
import { ErrorBlock, EmptyState, SkeletonCards, Spinner } from '../../components/ui/Feedback'
import { DishRow } from '../../components/menu/DishRow'
import { DishFormDialog } from '../../components/menu/DishFormDialog'
import { Modal } from '../../components/ui/Modal'
import { useCart, useCatalog } from '../../hooks/useApp'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { cartLineFromDish } from '../../lib/cart'
import { filterDishes, sortDishes, type MealFilter } from '../../lib/catalog'
import { categoryOrder } from '../../data/demo'
import { cn } from '../../lib/cn'
import type { Dish } from '../../types'

export function MenuPage() {
  useDocumentTitle('Menu')
  const { dishes, kitchens, status, error, retry, deleteDish, updateDish } = useCatalog()
  const { addLine, cart, itemCount } = useCart()
  const [params, setParams] = useSearchParams()
  const kitchenFilter = params.get('kitchen') ?? 'all'
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [diet, setDiet] = useState<MealFilter>('all')
  const [sort, setSort] = useState('popular')
  const [availability, setAvailability] = useState<'all' | 'available' | 'soldout'>('all')
  const [editing, setEditing] = useState<Dish | null>(null)
  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Dish | null>(null)
  const [busy, setBusy] = useState(false)

  const own = useMemo(
    () => dishes.filter((dish) => kitchenFilter === 'all' || dish.kitchenId === kitchenFilter),
    [dishes, kitchenFilter],
  )
  const categories = useMemo(() => {
    const present = new Set(own.map((dish) => dish.category))
    return categoryOrder.filter((entry) => present.has(entry))
  }, [own])
  const visible = useMemo(
    () =>
      sortDishes(
        filterDishes(own, {
          query,
          category,
          diet,
          availableOnly: availability === 'available',
        }).filter((dish) => (availability === 'soldout' ? !dish.available : true)),
        sort,
      ),
    [own, query, category, diet, availability, sort],
  )

  const kitchenName = (id: string) => kitchens.find((kitchen) => kitchen.id === id)?.name ?? ''

  const add = (dish: Dish) => {
    const kitchen = kitchens.find((entry) => entry.id === dish.kitchenId)
    if (!kitchen) return
    addLine(cartLineFromDish(dish), kitchen)
    if (cart.kitchenId === kitchen.id || !cart.lines.length) {
      toast.success(`${dish.name} added to the basket.`)
    }
  }

  const toggleAvailability = (dish: Dish) => {
    updateDish(dish.id, {
      available: !dish.available,
      soldOutAt: dish.available
        ? new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
        : null,
    })
    toast.success(
      dish.available ? `${dish.name} marked sold out.` : `${dish.name} is back on sale.`,
    )
  }

  const confirmDelete = async () => {
    if (!deleting) return
    setBusy(true)
    await new Promise((resolve) => window.setTimeout(resolve, 420))
    deleteDish(deleting.id)
    setBusy(false)
    toast.success(`${deleting.name} removed from the menu.`)
    setDeleting(null)
  }

  const soldOut = dishes.filter((dish) => !dish.available).length
  const loading = status === 'loading'

  return (
    <div className="app-fade">
      <PageHeader
        title="Menu"
        finding={
          <>
            {dishes.length} dishes across {kitchens.length} kitchens; {soldOut} sold out tonight.
            Dishes are served from the live catalogue and can be added, edited or taken off sale here.
          </>
        }
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
            <Plus size={15} strokeWidth={1.8} />
            Add a dish
          </button>
        }
      />

      {error ? (
        <ErrorBlock
          className="mb-4"
          title="Live catalogue unavailable"
          body={`${error} The bundled snapshot is on screen; changes you make now are kept on this device.`}
          onRetry={retry}
        />
      ) : null}

        <div className="flex flex-col gap-2.5 xl:flex-row xl:flex-wrap xl:items-center">
        <div className="relative min-w-0 flex-1 xl:max-w-[320px]">
          <Search
            size={15}
            strokeWidth={1.7}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-faint"
          />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search dishes or ingredients"
            aria-label="Search dishes"
            className="field pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
        <label className="flex items-center gap-2 text-[13px] text-faint">
          <SlidersHorizontal size={13} strokeWidth={1.6} />
          <span className="sr-only">Kitchen</span>
          <select
            className="field h-9 w-auto min-w-[150px]"
            value={kitchenFilter}
            onChange={(event) => {
              const next = new URLSearchParams(params)
              if (event.target.value === 'all') next.delete('kitchen')
              else next.set('kitchen', event.target.value)
              setParams(next, { replace: true })
            }}
            aria-label="Filter by kitchen"
          >
            <option value="all">Every kitchen</option>
            {kitchens.map((kitchen) => (
              <option key={kitchen.id} value={kitchen.id}>
                {kitchen.name}
              </option>
            ))}
          </select>
        </label>
        <DietToggle value={diet} onChange={setDiet} />
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
        <div className="inline-flex h-9 items-center gap-0.5 rounded-[6px] bg-sunken p-0.5" role="group" aria-label="Filter by availability">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'available', label: 'On sale' },
              { id: 'soldout', label: 'Sold out' },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setAvailability(option.id)}
              aria-pressed={availability === option.id}
              className={cn(
                'h-8 rounded-[4px] px-2.5 text-[13px] font-medium transition-colors',
                availability === option.id ? 'bg-surface text-ink' : 'text-muted hover:text-ink',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span className="text-[13px] leading-4 text-faint">
          {visible.length} {visible.length === 1 ? 'dish' : 'dishes'}
        </span>
        </div>
        </div>

      <div className="scroll-x mt-2.5 flex gap-1.5 pb-1" role="group" aria-label="Filter by category">
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

      <div className="mt-3">
        {loading ? (
          <SkeletonCards count={9} />
        ) : visible.length ? (
          <>
            <div className="hidden grid-cols-[minmax(0,1fr)_100px_90px_104px_96px] gap-3 px-4 pb-1.5 text-[13px] leading-4 text-faint lg:grid">
              <span>Dish</span>
              <span>Category</span>
              <span className="text-right">Price</span>
              <span>Status</span>
              <span className="text-right">Actions</span>
            </div>
            <ul className="overflow-hidden rounded-[8px] bg-surface shadow-[inset_0_0_0_1px_var(--color-line)]">
              {visible.map((dish) => (
                <DishRow
                  key={dish.id}
                  dish={dish}
                  kitchenName={kitchenName(dish.kitchenId)}
                  onEdit={() => setEditing(dish)}
                  onDelete={() => setDeleting(dish)}
                  onToggle={() => toggleAvailability(dish)}
                  onAdd={() => add(dish)}
                />
              ))}
            </ul>
            <p className="mt-2.5 text-[13px] leading-4 text-faint">
              Showing {visible.length} of {dishes.length} dishes. Edits and new dishes are kept in this
              browser and survive a reload.
            </p>
          </>
        ) : (
          <div className="overflow-hidden rounded-[8px] bg-surface shadow-[inset_0_0_0_1px_var(--color-line)]">
            <EmptyState
              icon={<UtensilsCrossed size={22} strokeWidth={1.4} />}
              title={dishes.length ? 'No dish matches these filters' : 'The menu is empty'}
              body={
                dishes.length
                  ? 'Clear the search or the category filter, or switch the availability filter back to every dish.'
                  : 'The catalogue returned no dishes. Reload it, or add the first dish by hand.'
              }
              action={
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setQuery('')
                      setCategory('all')
                      setDiet('all')
                      setAvailability('all')
                      setParams({}, { replace: true })
                    }}
                  >
                    Clear the filters
                  </button>
                  <button type="button" className="btn btn-primary" onClick={() => setCreating(true)}>
                    Add a dish
                  </button>
                </div>
              }
            />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] leading-4 text-faint">
        <span>Photographs and base recipes: DummyJSON.</span>
        <Link to="/restaurants" className="font-medium text-ink hover:underline">
          Browse by restaurant
        </Link>
        {itemCount > 0 ? (
          <Link to="/cart" className="font-medium text-ink hover:underline">
            Basket holds {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Link>
        ) : null}
      </div>

      <DishFormDialog
        open={creating}
        onClose={() => setCreating(false)}
        kitchens={kitchens}
        defaultKitchen={kitchenFilter === 'all' ? kitchens[0]?.id : kitchenFilter}
      />
      <DishFormDialog
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        kitchens={kitchens}
        dish={editing}
        defaultKitchen={editing?.kitchenId}
      />

      <Modal
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        title={`Take ${deleting?.name ?? 'this dish'} off the menu?`}
        description="It disappears from the menu and every restaurant page at once. Orders already placed keep their line."
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setDeleting(null)}>
              Keep it
            </button>
            <button type="button" className="btn btn-danger" onClick={confirmDelete} disabled={busy}>
              {busy ? <Spinner className="h-3.5 w-3.5 border-white/40 border-t-white" /> : null}
              {busy ? 'Removing' : 'Remove the dish'}
            </button>
          </>
        }
      >
        <p className="text-[13px] leading-5 text-muted">
          If it is only sold out for tonight, use <span className="font-medium text-ink">Sold out</span>{' '}
          instead: the dish stays on the menu with the time it sold.
        </p>
      </Modal>
    </div>
  )
}
