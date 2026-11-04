import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, Search, Tags } from 'lucide-react'
import { toast } from 'react-toastify'
import { PageHeader } from '../../components/ui/Page'
import { EmptyState } from '../../components/ui/Feedback'
import { OrderPill, PaymentPill } from '../../components/ui/Status'
import { Modal } from '../../components/ui/Modal'
import { useCatalog, useOrders } from '../../hooks/useApp'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { filterOrders, sortOrdersNewest } from '../../lib/analytics'
import { formatINR, formatINRPrecise, formatRelative } from '../../lib/format'
import { cn } from '../../lib/cn'
import type { Order, OrderStatus } from '../../types'

const statusOptions: { id: 'all' | OrderStatus; label: string }[] = [
  { id: 'all', label: 'Every status' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
  { id: 'out_for_delivery', label: 'On the way' },
  { id: 'preparing', label: 'Preparing' },
  { id: 'placed', label: 'Placed' },
]

const PAGE = 12

export function OrderHistoryPage() {
  useDocumentTitle('Order history')
  const { orders } = useOrders()
  const { kitchens } = useCatalog()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'all' | 'month' | 'week'>('month')
  const [status, setStatus] = useState<'all' | OrderStatus>('all')
  const [kitchenId, setKitchenId] = useState('all')
  const [invoice, setInvoice] = useState<Order | null>(null)
  const [shown, setShown] = useState(PAGE)

  const visible = useMemo(() => {
    const filtered = filterOrders(orders, {
      query,
      status,
      kitchenId,
      day: tab === 'week' ? 'week' : 'all',
    }).filter((order) => {
      if (tab !== 'month') return true
      return Date.now() - new Date(order.placedAt).getTime() < 31 * 86400000
    })
    return sortOrdersNewest(filtered)
  }, [orders, query, status, kitchenId, tab])

  const spent = visible
    .filter((order) => order.payment.status === 'paid')
    .reduce((sum, order) => sum + order.pricing.total, 0)
  const cancelled = visible.filter((order) => order.status === 'cancelled').length

  return (
    <div className="app-fade">
      <PageHeader
        title="Order history"
        finding={
          <>
            {visible.length} orders in this view, {formatINR(spent)} paid, {cancelled} cancelled. Every
            line keeps the price it was charged, so an old receipt never changes.
          </>
        }
        actions={
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => toast.success('A CSV export is prepared in a real build. This demo keeps the data in the browser.')}
          >
            <Download size={15} strokeWidth={1.7} />
            Export
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-2.5">
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
            placeholder="Order, customer or dish"
            aria-label="Search old orders"
            className="field pl-9"
          />
        </div>
        <select
          className="field h-10 w-auto min-w-[136px]"
          value={status}
          onChange={(event) => setStatus(event.target.value as typeof status)}
          aria-label="Filter by status"
        >
          {statusOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          className="field h-10 w-auto min-w-[150px]"
          value={kitchenId}
          onChange={(event) => setKitchenId(event.target.value)}
          aria-label="Filter by kitchen"
        >
          <option value="all">Every kitchen</option>
          {kitchens.map((kitchen) => (
            <option key={kitchen.id} value={kitchen.id}>
              {kitchen.name}
            </option>
          ))}
        </select>
        <div className="inline-flex h-10 items-center gap-0.5 rounded-[6px] bg-sunken p-0.5" role="group" aria-label="Period">
          {(
            [
              { id: 'week', label: '7 days' },
              { id: 'month', label: '31 days' },
              { id: 'all', label: 'All time' },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setTab(option.id)}
              aria-pressed={tab === option.id}
              className={cn(
                'h-9 rounded-[4px] px-3 text-[13px] font-medium transition-colors',
                tab === option.id ? 'bg-surface text-ink' : 'text-muted hover:text-ink',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span className="text-[13px] leading-4 text-faint sm:ml-auto">
          {visible.length} {visible.length === 1 ? 'order' : 'orders'}
        </span>
      </div>

      <div className="mt-3">
        {visible.length ? (
          <>
            <ul className="space-y-2">
              {visible.slice(0, shown).map((order) => (
              <li
                key={order.id}
                className="rounded-[8px] bg-surface shadow-[inset_0_0_0_1px_var(--color-line)]"
              >
                <div className="flex flex-wrap items-start gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/orders/${order.id}`}
                        className="font-mono text-[13px] leading-4 font-medium tracking-tight hover:underline"
                      >
                        {order.id}
                      </Link>
                      <OrderPill status={order.status} />
                      <PaymentPill status={order.payment.status} />
                    </div>
                    <p className="mt-1 text-[13px] leading-4 text-muted">
                      {order.kitchenName} · {order.customer.name} · {formatRelative(order.placedAt)}
                    </p>
                    <p className="mt-1 line-clamp-1 text-[13px] leading-4 text-faint">
                      {order.items.map((item) => `${item.qty} × ${item.name}`).join(' · ')}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <p className="num text-[15px] leading-5 font-semibold">
                      {formatINR(order.pricing.total)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 rounded-b-[8px] bg-raised px-4 py-2">
                  <button
                    type="button"
                    className="text-[13px] font-medium text-muted transition-colors hover:text-ink"
                    onClick={() => setInvoice(order)}
                  >
                    View receipt
                  </button>
                  <span className="text-control" aria-hidden="true">
                    ·
                  </span>
                  <Link
                    to={`/orders/${order.id}`}
                    className="text-[13px] font-medium text-muted transition-colors hover:text-ink"
                  >
                    Order details
                  </Link>
                  {order.status !== 'cancelled' ? (
                    <>
                      <span className="text-control" aria-hidden="true">
                        ·
                      </span>
                      <Link
                        to="/menu"
                        className="text-[13px] font-medium text-muted transition-colors hover:text-ink"
                      >
                        Reorder
                      </Link>
                    </>
                  ) : null}
                  <Link
                    to={`/restaurants`}
                    className="ml-auto text-[13px] font-medium text-ink hover:underline"
                  >
                    {order.kitchenName}
                  </Link>
                </div>
              </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="panel">
            <EmptyState
              icon={<Tags size={22} strokeWidth={1.4} />}
              title="No order in this view"
              body="Nothing matches this period, status and search together. A longer period usually finds it."
              action={
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setTab('all')
                    setStatus('all')
                    setKitchenId('all')
                    setQuery('')
                  }}
                >
                  Widen the filters
                </button>
              }
            />
          </div>
        )}
      </div>

      {visible.length > shown ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] leading-4 text-faint">
            Showing {Math.min(shown, visible.length)} of {visible.length} orders
          </p>
          <button type="button" className="btn btn-secondary" onClick={() => setShown((n) => n + PAGE)}>
            Show {Math.min(PAGE, visible.length - shown)} more
          </button>
        </div>
      ) : visible.length ? (
        <p className="mt-3 text-[12px] leading-4 text-faint">
          All {visible.length} orders in this view are shown.
        </p>
      ) : null}

      <Modal
        open={Boolean(invoice)}
        onClose={() => setInvoice(null)}
        title={`Receipt ${invoice?.id ?? ''}`}
        description="A demonstration receipt. No tax invoice is issued for a simulated order."
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setInvoice(null)}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                toast.success('Invoice downloaded as a demo. No file is written in this build.')
                setInvoice(null)
              }}
            >
              <Download size={14} strokeWidth={1.7} />
              Download
            </button>
          </>
        }
      >
        {invoice ? (
          <div className="text-[13px] leading-[18px]">
            <div className="flex justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold">Dabba dinner service</p>
                <p className="text-[13px] text-faint">Bandra West, Mumbai 400050</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[13px]">{invoice.id}</p>
                <p className="text-[13px] text-faint">{formatRelative(invoice.placedAt)}</p>
              </div>
            </div>
            <div className="mt-3 rounded-[4px] bg-raised px-2.5 py-2 text-[13px]">
              <p className="font-medium">{invoice.customer.name}</p>
              <p className="text-muted">{invoice.customer.address}</p>
              <p className="mt-0.5 text-faint">{invoice.customer.phone}</p>
            </div>
            <ul className="mt-3 space-y-1">
              {invoice.items.map((item) => (
                <li key={item.dishId} className="flex justify-between gap-3">
                  <span className="text-muted">
                    {item.qty} × {item.name}
                  </span>
                  <span className="num">{formatINRPrecise(item.price * item.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-2 space-y-0.5 border-t border-line pt-2">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Subtotal</dt>
                <dd className="num">{formatINRPrecise(invoice.pricing.subtotal)}</dd>
              </div>
              {invoice.pricing.discount > 0 ? (
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Discount</dt>
                  <dd className="num">−{formatINRPrecise(invoice.pricing.discount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Delivery</dt>
                <dd className="num">{formatINRPrecise(invoice.pricing.deliveryFee)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Packaging</dt>
                <dd className="num">{formatINRPrecise(invoice.pricing.packaging)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">GST, 5%</dt>
                <dd className="num">{formatINRPrecise(invoice.pricing.tax)}</dd>
              </div>
            </dl>
            <div className="mt-2 flex justify-between gap-3 border-t border-line pt-2 text-[13px] font-semibold">
              <span>Paid</span>
              <span className="num">{formatINRPrecise(invoice.pricing.total)}</span>
            </div>
            <p className="mt-3 text-[13px] leading-4 text-faint">
              Payment {invoice.payment.reference} · {invoice.payment.status}. This document is for
              demonstration only.
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

export type { Order }
