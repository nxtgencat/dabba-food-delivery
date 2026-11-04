import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Bike, MapPin, Phone, Printer, ReceiptText, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { Breadcrumbs } from '../../components/ui/Controls'
import { EmptyState } from '../../components/ui/Feedback'
import { Modal } from '../../components/ui/Modal'
import { Panel, SectionHeading } from '../../components/ui/Page'
import { DietMark, OrderPill, PaymentPill } from '../../components/ui/Status'
import { OrderTimeline, OrderTracker } from '../../components/orders/OrderTracker'
import { useOrders } from '../../hooks/useApp'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatClock, formatINR, formatINRPrecise, formatMinutes, formatRelative, minutesUntil } from '../../lib/format'
import { orderStatusMeta } from '../../data/demo'
import { nextOrderStatus } from '../../lib/cart'

const methodLabel = { card: 'Card', upi: 'UPI', wallet: 'Dabba wallet' }

export function OrderDetailPage() {
  const { orderId } = useParams()
  const { getOrder, advanceOrder, cancelOrder } = useOrders()
  const navigate = useNavigate()
  const [cancelling, setCancelling] = useState(false)
  const [reason, setReason] = useState('Customer changed their mind')
  const order = getOrder(orderId ?? '')
  useDocumentTitle(order ? `Order ${order.id}` : 'Order')

  if (!order) {
    return (
      <Panel>
        <EmptyState
          title="That order is not on this device"
          body="Orders are stored in this browser. A cleared storage removes them, and a link from another device cannot open one."
          action={
            <Link to="/orders" className="btn btn-primary">
              Back to the board
            </Link>
          }
        />
      </Panel>
    )
  }

  const eta = minutesUntil(order.promisedAt)
  const next = nextOrderStatus(order)
  const live = Boolean(next)

  return (
    <div className="app-fade">
      <Breadcrumbs items={[{ label: 'Orders', to: '/orders' }, { label: order.id }]} />

      <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-mono text-[24px] leading-8 font-semibold tracking-tight">{order.id}</h1>
            <OrderPill status={order.status} />
            <PaymentPill status={order.payment.status} />
          </div>
          <p className="mt-1 text-[13px] leading-5 text-muted">
            {order.customer.name} · {order.kitchenName}, {order.kitchenArea} · placed{' '}
            {formatRelative(order.placedAt)}
          </p>
          {live ? (
            <p className="mt-0.5 text-[13px] leading-4 text-faint">
              Promised by {formatClock(order.promisedAt)} ·{' '}
              {eta < 0 ? (
                <span className="font-medium text-negative">{formatMinutes(Math.abs(eta))} past</span>
              ) : (
                `in ${formatMinutes(eta)}`
              )}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => toast.success('The invoice is prepared for printing. This demo does not open a file.')}
          >
            <Printer size={15} strokeWidth={1.7} />
            Invoice
          </button>
          {live ? (
            <>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  cancelOrder(order.id, reason)
                  setCancelling(false)
                }}
                aria-label={`Cancel ${order.id}`}
              >
                <X size={15} strokeWidth={1.8} />
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const updated = advanceOrder(order.id)
                  if (updated?.status === 'delivered') toast.success('Delivered. The board is clear.')
                }}
                className="btn btn-primary"
              >
                Move to {next ? orderStatusMeta[next].label.toLowerCase() : 'the next stage'}
              </button>
            </>
          ) : (
            <Link to="/order-history" className="btn btn-secondary">
              <ArrowLeft size={15} strokeWidth={1.7} />
              History
            </Link>
          )}
        </div>
      </div>

      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_344px]">
        <div className="min-w-0 space-y-3">
          <Panel className="p-4 sm:p-5">
            <SectionHeading title="Tracking" meta={order.rider ? `rider ${order.rider.name}` : 'kitchen to door'} />
            <div className="mt-4">
              <OrderTracker order={order} />
            </div>
            {order.rider ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-[6px] bg-raised px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-surface">
                    <Bike size={15} strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className="text-[13px] leading-4 font-medium">{order.rider.name}</p>
                    <p className="num text-[13px] leading-4 text-faint">{order.rider.phone}</p>
                  </div>
                </div>
                <a href={`tel:${order.rider.phone.replace(/\s/g, '')}`} className="btn btn-secondary btn-sm">
                  <Phone size={13} strokeWidth={1.7} />
                  Call the rider
                </a>
              </div>
            ) : null}
          </Panel>

          <Panel className="p-4 sm:p-5">
            <SectionHeading title="The order" meta={`${order.items.reduce((sum, item) => sum + item.qty, 0)} ${order.items.reduce((sum, item) => sum + item.qty, 0) === 1 ? 'item' : 'items'}`} />
            <ul className="mt-3 divide-y divide-rule">
              {order.items.map((item) => (
                <li key={item.dishId} className="flex items-center gap-3 py-2.5 first:pt-0">
                  <img
                    src={item.image}
                    alt=""
                    width={44}
                    height={44}
                    loading="lazy"
                    className="h-11 w-11 rounded-[4px] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-[13px] leading-4 font-medium">
                      <DietMark diet={item.diet} />
                      <span className="truncate">{item.name}</span>
                    </p>
                    <p className="num text-[13px] leading-4 text-faint">
                      {item.qty} × {formatINR(item.price)}
                    </p>
                  </div>
                  <p className="num text-[13px] leading-4 font-medium">{formatINR(item.price * item.qty)}</p>
                </li>
              ))}
            </ul>

            <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-[13px] leading-[18px]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Subtotal</dt>
                <dd className="num">{formatINR(order.pricing.subtotal)}</dd>
              </div>
              {order.pricing.discount > 0 ? (
                <div className="flex justify-between gap-3 text-pill-positive-ink">
                  <dt>Coupon {order.couponCode}</dt>
                  <dd className="num">−{formatINR(order.pricing.discount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Delivery</dt>
                <dd className="num">
                  {order.pricing.deliveryFee ? formatINR(order.pricing.deliveryFee) : 'Free'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Packaging</dt>
                <dd className="num">{formatINR(order.pricing.packaging)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">GST, 5%</dt>
                <dd className="num">{formatINRPrecise(order.pricing.tax)}</dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-line pt-2">
                <dt className="text-[13px] font-semibold">Total</dt>
                <dd className="num text-[13px] font-semibold">{formatINRPrecise(order.pricing.total)}</dd>
              </div>
            </dl>
          </Panel>

          <Panel className="p-4 sm:p-5">
            <SectionHeading title="Stages" meta="every timestamp kept with the order" />
            <div className="mt-3">
              <OrderTimeline order={order} />
            </div>
          </Panel>
        </div>

        <aside className="space-y-3">
          <Panel className="p-4">
            <div className="flex items-center gap-1.5">
              <MapPin size={13} strokeWidth={1.7} className="text-muted" />
              <p className="text-[13px] leading-4 font-medium">Delivery</p>
            </div>
            <p className="mt-2 text-[13px] leading-5 font-medium">{order.customer.name}</p>
            <p className="num text-[13px] leading-4 text-faint">{order.customer.phone}</p>
            <p className="mt-1.5 text-[13px] leading-[18px] text-muted">{order.customer.address}</p>
            {order.customer.note ? (
              <p className="mt-2 rounded-[4px] bg-raised px-2 py-1.5 text-[13px] leading-4 text-muted">
                “{order.customer.note}”
              </p>
            ) : null}
          </Panel>

          <Panel className="p-4">
            <div className="flex items-center gap-1.5">
              <ReceiptText size={13} strokeWidth={1.7} className="text-muted" />
              <p className="text-[13px] leading-4 font-medium">Payment</p>
            </div>
            <dl className="mt-2 space-y-1.5 text-[13px] leading-4">
              <div className="flex justify-between gap-2">
                <dt className="text-faint">Method</dt>
                <dd>{methodLabel[order.payment.method]}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-faint">Reference</dt>
                <dd className="font-mono text-[13px]">{order.payment.reference}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-faint">State</dt>
                <dd>{order.payment.status}</dd>
              </div>
              {order.cancelledAt ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-faint">Cancelled</dt>
                  <dd>{formatClock(order.cancelledAt)}</dd>
                </div>
              ) : null}
            </dl>
          </Panel>

          <Panel className="p-4">
            <p className="text-[13px] leading-4 font-medium">Repeat this order</p>
            <p className="mt-1 text-[13px] leading-[18px] text-muted">
              Reorder puts the same dishes back in a fresh basket at today’s prices.
            </p>
            <ul className="mt-2 space-y-1">
              {order.items.map((item) => (
                <li key={item.dishId} className="flex justify-between gap-2 text-[13px] leading-4">
                  <span className="truncate text-muted">
                    {item.qty} × {item.name}
                  </span>
                  <span className="num shrink-0 text-faint">{formatINR(item.price)}</span>
                </li>
              ))}
            </ul>
            <Link to="/menu" className="btn btn-secondary btn-sm mt-2.5">
              Rebuild from the menu
            </Link>
          </Panel>

          <Panel className="p-4">
            <p className="text-[13px] leading-4 font-medium">Invoice</p>
            <p className="mt-1 text-[13px] leading-[18px] text-muted">
              A demonstration receipt. No tax invoice is issued for a simulated order.
            </p>
            <dl className="mt-2 space-y-1 text-[13px] leading-4">
              <div className="flex justify-between gap-2">
                <dt className="text-faint">Order</dt>
                <dd className="font-mono text-[12px]">{order.id}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-faint">Paid</dt>
                <dd className="num">{formatINRPrecise(order.pricing.total)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-faint">Stages</dt>
                <dd className="num">{order.timeline.length}</dd>
              </div>
            </dl>
            <button
              type="button"
              className="btn btn-secondary btn-sm mt-2.5"
              onClick={() => toast.success('The invoice is prepared. This demo does not write a file.')}
            >
              <Printer size={13} strokeWidth={1.7} />
              Print the receipt
            </button>
          </Panel>

          <Panel className="p-4">
            <p className="text-[13px] leading-4 font-medium">After this order</p>
            <p className="mt-1 text-[13px] leading-[18px] text-muted">
              {live
                ? `Promised by ${formatClock(order.promisedAt)}. Stages are timestamped as they happen, so the rider and the customer read the same record.`
                : `Closed ${formatRelative(order.deliveredAt ?? order.placedAt)}. The full stage list is kept with the order.`}
            </p>
            <dl className="mt-2 space-y-1 text-[13px] leading-4">
              <div className="flex justify-between gap-2">
                <dt className="text-faint">Placed</dt>
                <dd className="num">{formatClock(order.placedAt)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-faint">Promised</dt>
                <dd className="num">{formatClock(order.promisedAt)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-faint">Rider</dt>
                <dd>{order.rider ? order.rider.name.split(' ')[0] : 'not assigned'}</dd>
              </div>
            </dl>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to="/menu" className="btn btn-secondary btn-sm">
                Rebuild the order
              </Link>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => toast.success('The invoice is prepared. This demo does not write a file.')}
              >
                <Printer size={13} strokeWidth={1.7} />
                Receipt
              </button>
            </div>
          </Panel>
        </aside>
      </div>

      <Modal
        open={cancelling}
        onClose={() => setCancelling(false)}
        title={`Cancel ${order.id}?`}
        description="The kitchen is told at once and the payment is refunded. A delivered order cannot be cancelled."
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setCancelling(false)}>
              Keep the order
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                cancelOrder(order.id, reason)
                setCancelling(false)
                navigate('/orders')
              }}
            >
              Cancel and refund
            </button>
          </>
        }
      >
        <label htmlFor="cancel-reason" className="field-label">
          Reason, kept on the order
        </label>
        <select
          id="cancel-reason"
          className="field"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        >
          <option>Customer changed their mind</option>
          <option>Kitchen is out of an ingredient</option>
          <option>Address is not serviceable tonight</option>
          <option>Duplicate order</option>
        </select>
      </Modal>
    </div>
  )
}
