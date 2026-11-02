import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ChefHat, ShoppingBasket, UserPlus, UtensilsCrossed } from 'lucide-react'
import { PageHeader, Panel, SectionHeading, ViewAll } from '../../components/ui/Page'
import { KpiStrip } from '../../components/dashboard/KpiStrip'
import { AttentionCard } from '../../components/dashboard/AttentionCard'
import { ErrorBlock } from '../../components/ui/Feedback'
import { OrderPill } from '../../components/ui/Status'
import { StatusLegend } from '../../components/dashboard/StatusLegend'
import { EveningChart } from '../../components/dashboard/EveningChart'
import { SellOutStrip } from '../../components/dashboard/SellOutStrip'
import { useCatalog, useOrders } from '../../hooks/useApp'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { eveningSeries, ordersForDay, recentOrders, summariseService } from '../../lib/analytics'
import { formatClock, formatINR, formatMinutes, formatNumber, minutesUntil } from '../../lib/format'
import type { Dish, Kitchen, OrderStatus } from '../../types'

const quickActions = [
  {
    to: '/orders',
    label: 'Advance the board',
    detail: 'Move live orders through the pass',
    icon: ChefHat,
  },
  {
    to: '/cart',
    label: 'Take an order',
    detail: 'Build a basket from tonight’s menu',
    icon: ShoppingBasket,
  },
  {
    to: '/menu',
    label: 'Change the menu',
    detail: 'Add a dish, set it sold out',
    icon: UtensilsCrossed,
  },
  {
    to: '/customers',
    label: 'Open customers',
    detail: 'Repeat guests and their addresses',
    icon: UserPlus,
  },
]

export function DashboardPage() {
  useDocumentTitle('Overview')
  const { orders, advanceOrder } = useOrders()
  const { dishes, kitchens, status, error, retry } = useCatalog()
  const [range, setRange] = useState<'7' | '4'>('7')

  const [today] = useState(() => new Date())
  const summary = useMemo(
    () => summariseService(orders, dishes, kitchens.length, today),
    [orders, dishes, kitchens.length, today],
  )
  const series = useMemo(() => eveningSeries(orders, today), [orders, today])
  const recent = useMemo(() => recentOrders(orders, 6), [orders])
  const tonightOrders = useMemo(() => ordersForDay(orders, today), [orders, today])

  const statusCounts = useMemo(() => {
    const counts: Record<OrderStatus, number> = {
      placed: 0,
      preparing: 0,
      out_for_delivery: 0,
      delivered: 0,
      cancelled: 0,
    }
    for (const order of tonightOrders) counts[order.status]++
    return counts
  }, [tonightOrders])

  const catalogueLoading = status === 'loading'
  // Only the catalogue cells wait for the API. Orders, the chart and the board are
  // local data and are never held back by a network call.
  const kpis = [
    {
      label: 'Takings tonight',
      value: formatINR(summary.takingsTonight),
      note: `${tonightOrders.filter((o) => o.payment.status === 'paid').length} paid orders`,
    },
    { label: 'Total orders', value: String(summary.totalOrders), note: 'across the service' },
    {
      label: 'Active orders',
      value: String(summary.active),
      note: summary.late.length ? `${summary.late.length} past the window` : 'inside the window',
    },
    {
      label: 'Delivered',
      value: String(summary.totalDelivered),
      note: `${summary.delivered} tonight`,
    },
    {
      label: 'Restaurants',
      value: String(summary.kitchens),
      note: catalogueLoading ? 'loading the roster' : 'on the roster',
      pending: catalogueLoading,
    },
    {
      label: 'Food items',
      value: String(dishes.length),
      note: catalogueLoading ? 'loading the menu' : `${summary.soldOut} sold out`,
      pending: catalogueLoading,
    },
    {
      label: 'Customers',
      value: String(summary.customers),
      note: `${summary.customersTonight} tonight`,
    },
    {
      label: 'Revenue, 7 evenings',
      value: formatINR(summary.weekTakings),
      note: `${formatINR(summary.averageBasket)} average basket`,
    },
  ]

  return (
    <div className="app-fade">
      <PageHeader
        title="Tonight’s service"
        finding={
          <>
            {summary.late.length ? (
              <>
                <span className="font-medium text-ink">{summary.late.length} late</span> of{' '}
                {summary.active} live orders, {summary.premisingSoon.length} due within the quarter hour.
              </>
            ) : (
              <>
                <span className="font-medium text-ink">Every live order is inside its window.</span> Dinner
                closes at 22:45; {summary.active} {summary.active === 1 ? 'order is' : 'orders are'} moving.
              </>
            )}{' '}
            {formatNumber(summary.ordersTonight)} orders and {formatINR(summary.takingsTonight)} taken since 17:00.
          </>
        }
        actions={
          <>
            <Link to="/restaurants" className="btn btn-secondary">
              Browse kitchens
            </Link>
            <Link to="/cart" className="btn btn-primary">
              Take an order
            </Link>
          </>
        }
      />

      {error ? (
        <ErrorBlock
          className="mb-4"
          title={`Live catalogue unavailable · showing the bundled list`}
          body={`${error} The dishes, photographs and prices are the bundled snapshot, so the menu still works.`}
          onRetry={retry}
        />
      ) : null}

      <KpiStrip cells={kpis} />

      <ul className="mt-3 grid grid-cols-1 gap-px overflow-hidden rounded-[8px] bg-line p-px sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map((action) => (
          <li key={action.to} className="bg-surface">
            <Link
              to={action.to}
              className="flex h-full items-center gap-2.5 px-3.5 py-3 transition-colors hover:bg-raised"
            >
              <action.icon size={16} strokeWidth={1.5} className="shrink-0 text-muted" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] leading-4 font-medium">{action.label}</span>
                <span className="mt-0.5 block truncate text-[12px] leading-4 text-faint">
                  {action.detail}
                </span>
              </span>
              <ArrowUpRight size={13} strokeWidth={1.6} className="shrink-0 text-control" />
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
        <Panel className="overflow-hidden">
          <header className="flex flex-wrap items-baseline justify-between gap-2 px-4 pt-4 sm:px-5">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <h2 className="text-[15px] leading-5 font-semibold">Takings by evening</h2>
              <span className="text-[13px] leading-4 text-faint">Paid orders, 17:00 to close</span>
            </div>
            <div className="inline-flex h-7 items-center rounded-[5px] bg-sunken p-0.5" role="group" aria-label="Evenings shown">
              {(['7', '4'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRange(option)}
                  aria-pressed={range === option}
                  className={`h-6 rounded-[4px] px-2 text-[13px] font-medium transition-colors ${
                    range === option ? 'bg-surface text-ink' : 'text-muted hover:text-ink'
                  }`}
                >
                  {option === '7' ? '7 evenings' : '4 evenings'}
                </button>
              ))}
            </div>
          </header>
          <EveningChart points={range === '7' ? series : series.slice(-4)} />
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-4 pb-4 sm:grid-cols-3 sm:px-5">
            <div>
              <p className="text-[13px] leading-4 text-faint">Tonight so far</p>
              <p className="num text-[13px] leading-5 font-medium">{formatINR(summary.takingsTonight)}</p>
            </div>
            <div>
              <p className="text-[13px] leading-4 text-faint">Yesterday, whole evening</p>
              <p className="num text-[13px] leading-5">
                {formatINR(series.length > 1 ? series[series.length - 2].takings : 0)}
              </p>
            </div>
            <div className="hidden sm:block">
              <p className="text-[13px] leading-4 text-faint">Average basket</p>
              <p className="num text-[13px] leading-5">{formatINR(summary.averageBasket)}</p>
            </div>
          </div>
        </Panel>

        <AttentionCard
          late={summary.late}
          soon={summary.premisingSoon}
          live={summary.activeOrders}
          activeCount={summary.active}
          onAdvance={advanceOrder}
        />
      </div>

      <div className="mt-3 grid items-start gap-3 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,1fr)]">
        <Panel className="overflow-hidden">
          <div className="px-4 pt-4 pb-2 sm:px-5">
            <SectionHeading
              title="Recent orders"
              meta={`${summary.activeOrders.length} live now`}
              action={<ViewAll to="/orders">Whole board</ViewAll>}
            />
          </div>
            <div className="scroll-x">
              <table className="w-full min-w-[620px]">
                <thead>
                  <tr className="text-left text-[13px] leading-4 text-faint">
                    <th className="px-4 pb-2 font-normal sm:px-5">Order</th>
                    <th className="px-3 pb-2 font-normal">Kitchen</th>
                    <th className="px-3 pb-2 font-normal">Placed</th>
                    <th className="px-3 pb-2 font-normal">Status</th>
                    <th className="px-4 pb-2 text-right font-normal sm:px-5">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((order) => (
                    <tr key={order.id} className="row-hover">
                      <td className="border-t border-rule px-4 py-2.5 sm:px-5">
                        <Link to={`/orders/${order.id}`} className="group flex items-baseline gap-2">
                          <span className="font-mono text-[13px] leading-4 font-medium tracking-tight group-hover:underline">
                            {order.id}
                          </span>
                          <span className="truncate text-[13px] leading-4 text-faint">
                            {order.customer.name}
                          </span>
                        </Link>
                      </td>
                      <td className="border-t border-rule px-3 py-2.5 text-[13px] leading-4 text-muted">
                        {order.kitchenName}
                      </td>
                      <td className="num border-t border-rule px-3 py-2.5 text-[13px] leading-4 text-muted">
                        {minutesUntil(order.placedAt) > -600
                          ? `${formatMinutes(Math.abs(minutesUntil(order.placedAt)))} ago`
                          : formatClock(order.placedAt)}
                      </td>
                      <td className="border-t border-rule px-3 py-2.5">
                        <OrderPill status={order.status} />
                      </td>
                      <td className="num border-t border-rule px-4 py-2.5 text-right text-[13px] leading-4 font-medium sm:px-5">
                        {formatINR(order.pricing.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </Panel>

        <StatusLegend counts={statusCounts} total={tonightOrders.length} />      </div>

      <div className="mt-3">
        <SellOutStrip dishes={dishes} kitchens={kitchens} />
      </div>

      <div className="mt-3">
        <KitchenLoad kitchens={kitchens} dishes={dishes} />
      </div>
    </div>
  )
}

/** Which kitchens are carrying the evening: dishes on sale, sold out, and their window. */
function KitchenLoad({ kitchens, dishes }: { kitchens: Kitchen[]; dishes: Dish[] }) {
  const rows = kitchens
    .map((kitchen) => {
      const own = dishes.filter((dish) => dish.kitchenId === kitchen.id)
      const soldOut = own.filter((dish) => !dish.available).length
      return { kitchen, onSale: own.length - soldOut, soldOut }
    })
    .sort((a, b) => b.onSale - a.onSale)

  return (
    <section className="overflow-hidden rounded-[8px] bg-surface shadow-[inset_0_0_0_1px_var(--color-line)]">
      <header className="flex flex-wrap items-baseline justify-between gap-2 px-4 pt-3.5 sm:px-5">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
          <h2 className="text-[15px] leading-5 font-semibold">Kitchen load</h2>
          <span className="text-[13px] leading-4 text-faint">
            {dishes.length} dishes across {kitchens.length} kitchens
          </span>
        </div>
        <ViewAll to="/restaurants">Roster</ViewAll>
      </header>
      <ul className="mt-2.5 grid grid-cols-2 gap-px bg-line sm:grid-cols-4 xl:grid-cols-7">
        {rows.map((row) => (
          <li key={row.kitchen.id} className="bg-surface px-4 py-3">
            <Link
              to={`/restaurants/${row.kitchen.slug}`}
              className="block truncate text-[13px] leading-4 font-medium hover:underline"
            >
              {row.kitchen.name}
            </Link>
            <p className="mt-0.5 text-[12px] leading-4 text-faint">
              {row.onSale} on sale{row.soldOut ? ` · ${row.soldOut} out` : ''}
            </p>
            <div className="mt-2 flex h-1 w-full overflow-hidden rounded-[1px] bg-sunken" aria-hidden="true">
              <span
                className="bar-grow bg-ink"
                style={{ width: `${(row.onSale / Math.max(1, row.onSale + row.soldOut)) * 100}%` }}
              />
            </div>
            <p className="mt-1.5 truncate text-[12px] leading-4 text-faint">
              {row.kitchen.deliveryMinutes} min · {row.kitchen.area}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

