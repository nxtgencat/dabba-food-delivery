import { Link, useParams } from 'react-router-dom'
import { ArrowRight, Check, ChefHat, Clock3, MapPin, ReceiptText } from 'lucide-react'
import { EmptyState } from '../../components/ui/Feedback'
import { Panel } from '../../components/ui/Page'
import { OrderTracker } from '../../components/orders/OrderTracker'
import { useAuth, useOrders } from '../../hooks/useApp'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatClock, formatINR, formatINRPrecise, formatMinutes, formatRelative, minutesUntil } from '../../lib/format'
import { TiffinMark } from '../../components/brand/TiffinMark'

export function ConfirmationPage() {
  const { orderId } = useParams()
  const { getOrder } = useOrders()
  const { user } = useAuth()
  const order = getOrder(orderId ?? '')
  useDocumentTitle('Order confirmed')

  if (!order) {
    return (
      <Panel>
        <EmptyState
          title="That order is not on this device"
          body="Orders live in this browser. If the storage was cleared, the order and its receipt are gone."
          action={
            <Link to="/orders" className="btn btn-primary">
              Open the board
            </Link>
          }
        />
      </Panel>
    )
  }

  const eta = minutesUntil(order.promisedAt)

  return (
    <div className="app-fade mx-auto max-w-[820px]">
      <div className="flex flex-col items-center pt-2 pb-5 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-pill-positive-bg text-pill-positive-ink">
          <Check size={24} strokeWidth={2.4} />
        </span>
        <h1 className="mt-3 text-[26px] leading-8 font-semibold tracking-[-0.02em]">
          The tiffin is with the kitchen
        </h1>
        <p className="mt-1.5 max-w-[46ch] text-[13px] leading-5 text-muted">
          {order.id} is paid and confirmed. {order.kitchenName} has the order; the rider will call{' '}
          {order.customer.phone} at the door.
        </p>
      </div>

      <Panel className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-raised px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5">
            <TiffinMark size={24} className="text-ink" />
            <div>
              <p className="font-mono text-[13px] leading-4 font-medium tracking-tight">{order.id}</p>
              <p className="text-[13px] leading-4 text-faint">{formatRelative(order.placedAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[13px] leading-4 text-faint">Arrives by</p>
              <p className="num flex items-center justify-end gap-1 text-[13px] leading-5 font-medium">
                <Clock3 size={12} strokeWidth={1.7} />
                {formatClock(order.promisedAt)}
                <span className="text-[13px] font-normal text-faint">
                  ({eta > 0 ? formatMinutes(eta) : 'due now'})
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[13px] leading-4 text-faint">Paid</p>
              <p className="num text-[13px] leading-5 font-semibold">{formatINRPrecise(order.pricing.total)}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-4 sm:p-5 md:grid-cols-[minmax(0,1fr)_260px]">
          <div>
            <h2 className="text-[13px] leading-5 font-semibold">What happens next</h2>
            <div className="mt-3">
              <OrderTracker order={order} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-[6px] bg-raised px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-[13px] leading-4 text-faint">
                <ChefHat size={12} strokeWidth={1.7} />
                Kitchen
              </p>
              <p className="mt-0.5 text-[13px] leading-4 font-medium">{order.kitchenName}</p>
              <p className="text-[13px] leading-4 text-faint">{order.kitchenArea}</p>
            </div>
            <div className="rounded-[6px] bg-raised px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-[13px] leading-4 text-faint">
                <MapPin size={12} strokeWidth={1.7} />
                Delivering to
              </p>
              <p className="mt-0.5 text-[13px] leading-4 font-medium">{order.customer.name}</p>
              <p className="mt-0.5 text-[13px] leading-[18px] text-muted">{order.customer.address}</p>
              {order.customer.note ? (
                <p className="mt-1 text-[13px] leading-4 text-faint">“{order.customer.note}”</p>
              ) : null}
            </div>
            <div className="rounded-[6px] bg-raised px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-[13px] leading-4 text-faint">
                <ReceiptText size={12} strokeWidth={1.7} />
                Receipt
              </p>
              <ul className="mt-1 space-y-0.5">
                {order.items.map((item) => (
                  <li key={item.dishId} className="flex justify-between gap-2 text-[13px] leading-4">
                    <span className="truncate text-muted">
                      {item.qty} × {item.name}
                    </span>
                    <span className="num shrink-0">{formatINR(item.price * item.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-1 flex justify-between border-t border-line pt-1 text-[13px] leading-4">
                <span className="font-medium">Paid</span>
                <span className="num font-medium">{formatINR(order.pricing.total)}</span>
              </div>
            </div>
            {order.payment.method === 'wallet' ? (
              <p className="text-[13px] leading-4 text-faint">
                Paid from the Dabba wallet. Balance now {formatINR(user?.wallet ?? 0)}.
              </p>
            ) : null}
          </div>
        </div>
      </Panel>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
        <Link to={`/orders/${order.id}`} className="btn btn-primary">
          Track this order
          <ArrowRight size={15} strokeWidth={1.8} />
        </Link>
        <Link to="/orders" className="btn btn-secondary">
          The live board
        </Link>
        <Link to="/menu" className="btn btn-ghost">
          Order something else
        </Link>
      </div>
    </div>
  )
}
