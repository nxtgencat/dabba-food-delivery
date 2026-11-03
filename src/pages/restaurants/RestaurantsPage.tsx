import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Search } from 'lucide-react'
import { PageHeader } from '../../components/ui/Page'
import { RestaurantCard } from '../../components/catalog/Cards'
import { SkeletonCards, EmptyState } from '../../components/ui/Feedback'
import { useCatalog } from '../../hooks/useApp'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { dishPriceFrom, dishRating } from '../../lib/catalog'
import { formatOpenState } from '../../lib/format'

export function RestaurantsPage() {
  useDocumentTitle('Restaurants')
  const { kitchens, dishes, status } = useCatalog()

  const list = useMemo(
    () =>
      kitchens
        .map((kitchen) => ({
          kitchen,
          own: dishes.filter((dish) => dish.kitchenId === kitchen.id),
        }))
        .sort((a, b) => dishRating(b.own) - dishRating(a.own)),
    [kitchens, dishes],
  )

  const open = list.filter(({ kitchen }) => formatOpenState(kitchen.openTime, kitchen.closeTime).open)
  const loading = status === 'loading'

  return (
    <div className="app-fade">
      <PageHeader
        title="Restaurants"
        finding={
          <>
            {list.length} kitchens on the roster, {open.length} open for the current window. Every kitchen
            keeps its own basket, its own fee and its own rider.
          </>
        }
        actions={
          <Link to="/menu" className="btn btn-primary">
            <Search size={15} strokeWidth={1.7} />
            Find a dish
          </Link>
        }
      />

      {loading ? (
        <SkeletonCards count={6} />
      ) : list.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={<MapPin size={22} strokeWidth={1.4} />}
            title="No kitchens are on the roster"
            body="The catalogue service answered with no dishes, so there are no kitchens to show. Reload the catalogue from the overview."
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {list.map(({ kitchen, own }) => (
            <RestaurantCard key={kitchen.id} kitchen={kitchen} dishes={own} />
          ))}
        </div>
      )}

      <section className="mt-6">
        <h2 className="mb-2 text-[15px] leading-5 font-semibold">How the roster works</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            {
              title: 'One kitchen per basket',
              body: 'Dishes from a single kitchen share a packing bench and a rider. Adding from another kitchen asks before it replaces the basket.',
            },
            {
              title: 'Ratings come from dishes',
              body: 'A kitchen’s rating and review count are weighted across the dishes on its menu, so nothing is typed in twice.',
            },
            {
              title: 'Hours are the kitchen’s own',
              body: 'Dosa Junction serves breakfast and lunch; everyone else runs dinner. Closed kitchens stay on the roster but cannot take a basket.',
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[8px] bg-surface px-4 py-3.5 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <p className="text-[13px] leading-5 font-medium">{item.title}</p>
              <p className="mt-1 text-[13px] leading-[18px] text-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-5 text-[13px] leading-4 text-faint">
        Prices are the lowest on each menu. Ratings and photographs come from the DummyJSON recipe
        catalogue; kitchens, addresses and hours are sample data for this demonstration.
        {list.length
          ? ` Points of departure range from ${Math.min(...list.map(({ own }) => dishPriceFrom(own)))} rupees.`
          : ''}
      </p>
    </div>
  )
}
