import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { formatISO, isSameDay, parseISO } from 'date-fns'
import { toast } from 'react-toastify'
import type { Order, OrderStatus, OrdersValue, TimelineEntry } from '../types'
import { buildDemoHistory, orderStatusMeta, recipeToDish } from '../data/demo'
import { readStorage, storageKeys, writeStorage } from '../lib/storage'
import { buildOrder, nextOrderStatus } from '../lib/cart'
import { bundledRecipes } from '../lib/api'

export const OrdersContext = createContext<OrdersValue | null>(null)

// Bump when the seeded board changes shape, so a browser holding an older board
// rebuilds it once instead of showing a stale evening next to new code.
const DEMO_VERSION = '2026-11-04.2'
// The seeded board describes a service in progress. After this many minutes it no
// longer matches the clock (every live order would read as late), so it is rebuilt
// from the current minute. Orders the visitor placed are always kept.
const DEMO_FRESH_MINUTES = 20

const STATUS_NOTES: Record<OrderStatus, string> = {
  placed: 'Order received by the kitchen',
  preparing: 'Moved to the kitchen pass',
  out_for_delivery: 'Rider left with the tiffin',
  delivered: 'Handed to the customer',
  cancelled: 'Cancelled',
}

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    const stored = readStorage<Order[] | null>(storageKeys.orders, null)
    const anchor = readStorage<string | null>(storageKeys.demoAnchor, null)
    const anchorDate = anchor ? parseISO(anchor) : new Date()
    const sameDay = anchor ? isSameDay(anchorDate, new Date()) : false
    const fresh = anchor ? Date.now() - anchorDate.getTime() < DEMO_FRESH_MINUTES * 60000 : false
    const version = readStorage<string | null>(`${storageKeys.demoAnchor}.version`, null)
    // The seeded service board follows the calendar and the clock: on a new day, or
    // once it has aged past the service fiction, it is rebuilt from now, while the
    // orders the visitor placed are kept.
    if (stored && stored.length && sameDay && fresh && version === DEMO_VERSION) return stored
    const kept = (stored ?? []).filter((order) => !order.demoSeed)
    const built = buildDemoHistory(buildFromSnapshot(), new Date())
    const next = [...kept, ...built.orders]
    writeStorage(storageKeys.orders, next)
    writeStorage(storageKeys.demoAnchor, built.anchor)
    writeStorage(`${storageKeys.demoAnchor}.version`, DEMO_VERSION)
    return next
  })
  const firstWrite = useRef(true)

  useEffect(() => {
    if (firstWrite.current) firstWrite.current = false
    writeStorage(storageKeys.orders, orders)
  }, [orders])

  const placeOrder = useCallback<OrdersValue['placeOrder']>((input) => {
    const order = buildOrder({
      cart: {
        kitchenId: input.kitchenId,
        kitchenName: input.kitchenName,
        deliveryFee: input.pricing.deliveryFee,
        deliveryMinutes: 35,
        lines: [],
        couponCode: input.couponCode,
      },
      customer: input.customer,
      pricing: input.pricing,
      payment: input.payment,
      rider: input.rider,
    })
    const withItems: Order = { ...order, items: input.items, kitchenArea: input.kitchenArea, promisedAt: input.promisedAt }
    setOrders((prev) => [withItems, ...prev])
    return withItems
  }, [])

  const advanceOrder = useCallback<OrdersValue['advanceOrder']>(
    (id) => {
      let updated: Order | undefined
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== id) return order
          const next = nextOrderStatus(order)
          if (!next) return order
          const now = new Date()
          const entry: TimelineEntry = {
            status: next,
            at: formatISO(now),
            note: STATUS_NOTES[next],
          }
          const timeline = [...order.timeline, entry]
          updated = {
            ...order,
            status: next,
            timeline,
            deliveredAt: next === 'delivered' ? formatISO(now) : order.deliveredAt,
            rider: next === 'out_for_delivery' || next === 'delivered' ? order.rider : order.rider,
            // Once the visitor works an order it stops being seeded scenery and is
            // kept even when the sample evening is rebuilt.
            demoSeed: false,
          }
          return updated
        }),
      )
      if (updated) {
        toast.success(`${id} is now ${orderStatusMeta[updated.status].label.toLowerCase()}.`)
      }
      return updated
    },
    [],
  )

  const cancelOrder = useCallback<OrdersValue['cancelOrder']>(
    (id, reason) => {
      let updated: Order | undefined
      setOrders((prev) =>
        prev.map((order) => {
          if (order.id !== id || order.status === 'delivered' || order.status === 'cancelled') {
            return order
          }
          const now = new Date()
          updated = {
            ...order,
            status: 'cancelled',
            cancelledAt: formatISO(now),
            cancelReason: reason,
            payment: { ...order.payment, status: 'refunded' },
            demoSeed: false,
            timeline: [
              ...order.timeline,
              { status: 'cancelled', at: formatISO(now), note: reason },
            ],
          }
          return updated
        }),
      )
      if (updated) toast.success(`${id} cancelled. The payment is refunded.`)
      return updated
    },
    [],
  )

  const getOrder = useCallback(
    (id: string) => orders.find((order) => order.id === id),
    [orders],
  )

  const value = useMemo<OrdersValue>(
    () => ({ orders, placeOrder, advanceOrder, cancelOrder, getOrder, nextStatus: nextOrderStatus }),
    [orders, placeOrder, advanceOrder, cancelOrder, getOrder],
  )

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>
}

export function useOrdersValue() {
  const context = useContext(OrdersContext)
  if (!context) throw new Error('useOrders must be used inside OrdersProvider')
  return context
}

function buildFromSnapshot() {
  return bundledRecipes().map(recipeToDish)
}
