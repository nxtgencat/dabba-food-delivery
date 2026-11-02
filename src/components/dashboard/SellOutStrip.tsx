import { Link } from 'react-router-dom'
import type { Dish, Kitchen } from '../../types'
import { SectionHeading, ViewAll } from '../ui/Page'
import { useCharts } from '../../hooks/useCharts'

/** The signature element: the moment each dish sold out, against last evening's moment. */
export function SellOutStrip({ dishes, kitchens }: { dishes: Dish[]; kitchens: Kitchen[] }) {
  const soldOut = dishes
    .filter((dish) => !dish.available && dish.soldOutAt)
    .sort((a, b) => (a.soldOutAt ?? '').localeCompare(b.soldOutAt ?? ''))
  const kitchenName = (id: string) => kitchens.find((kitchen) => kitchen.id === id)?.name ?? ''

  const rows = soldOut.map((dish) => ({
    label: dish.name,
    sub: kitchenName(dish.kitchenId),
    value: dish.soldOutAt ?? '',
    note: dish.soldOutCompare ? `was ${dish.soldOutCompare} last evening` : undefined,
    at: dish.soldOutAt ?? undefined,
    compare: dish.soldOutCompare ?? undefined,
  }))

  const ref = useCharts(
    (charts, node) => {
      charts.timeStrip(node, rows, {
        open: '17:00',
        close: '23:30',
        step: 60,
        todayLabel: 'Tonight',
        compareLabel: 'Last evening',
        rowHeight: 52,
      })
    },
    [rows.map((row) => `${row.label}${row.value}`).join('|')],
  )

  const onSale = dishes.filter((dish) => dish.available).length

  return (
    <section className="panel flex h-full flex-col overflow-hidden">
      <header className="flex items-baseline justify-between gap-3 px-4 pt-4 sm:px-5">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <SectionHeading title="Sold out tonight" />
          <span className="text-[13px] leading-4 text-faint">times on the service window</span>
        </div>
        <ViewAll to="/menu">Menu</ViewAll>
      </header>

      {rows.length ? (
        <>
          <div ref={ref} className="chart px-4 pt-3 sm:px-5" />
          <p className="px-4 pt-1 text-[13px] leading-4 text-faint sm:px-5">
            A filled dot is tonight’s sell-out time; the hollow tick is the same dish last evening.
            {onSale ? ` ${onSale} dishes are still on sale.` : ''}
          </p>
          <div className="mt-auto flex flex-wrap gap-2 px-4 pt-3 pb-4 sm:px-5">
            <Link to="/menu" className="btn btn-secondary btn-sm">
              Open the menu
            </Link>
            <Link to="/restaurants" className="btn btn-ghost btn-sm">
              By restaurant
            </Link>
          </div>
        </>
      ) : (
        <div className="px-4 py-6 sm:px-5">
          <p className="text-[13px] leading-5 font-medium">Nothing has sold out yet.</p>
          <p className="mt-1 text-[13px] leading-[18px] text-muted">
            {onSale} dishes are on sale. When one runs out, the time it sold is recorded here against
            last evening’s time.
          </p>
          <div className="flex flex-wrap gap-2 pt-3">
            <Link to="/menu" className="btn btn-secondary btn-sm">
              Open the menu
            </Link>
            <Link to="/restaurants" className="btn btn-ghost btn-sm">
              By restaurant
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
