import { isToday, isYesterday, parseISO, subDays, format } from 'date-fns'
import type { Dish, Order } from '../types'

export const isActiveOrder = (order: Order) =>
  order.status === 'placed' || order.status === 'preparing' || order.status === 'out_for_delivery'

export const isCancelled = (order: Order) => order.status === 'cancelled'

/** An order counts as paid money only when the kitchen actually served it or is serving it. */
export const earningOrders = (orders: Order[]) =>
  orders.filter((order) => order.payment.status === 'paid' && !isCancelled(order))

export const takingsOf = (orders: Order[]) =>
  earningOrders(orders).reduce((sum, order) => sum + order.pricing.total, 0)

export const ordersForDay = (orders: Order[], day: Date) =>
  orders.filter((order) => {
    const placed = parseISO(order.placedAt)
    return (
      placed.getFullYear() === day.getFullYear() &&
      placed.getMonth() === day.getMonth() &&
      placed.getDate() === day.getDate()
    )
  })

export interface EveningPoint {
  date: Date
  label: string
  takings: number
  orders: number
}

/** Seven evenings ending today, oldest first. */
export function eveningSeries(orders: Order[], today = new Date()): EveningPoint[] {
  const points: EveningPoint[] = []
  for (let offset = 6; offset >= 0; offset--) {
    const day = subDays(today, offset)
    const dayOrders = earningOrders(ordersForDay(orders, day))
    points.push({
      date: day,
      label: offset === 0 ? 'Tonight' : offset === 1 ? 'Yesterday' : format(day, 'EEE'),
      takings: dayOrders.reduce((sum, order) => sum + order.pricing.total, 0),
      orders: dayOrders.length,
    })
  }
  return points
}

export interface ServiceSummary {
  kitchens: number
  dishes: number
  soldOut: number
  ordersTonight: number
  totalOrders: number
  totalDelivered: number
  customers: number
  active: number
  delivered: number
  cancelled: number
  customersTonight: number
  takingsTonight: number
  weekTakings: number
  averageBasket: number
  late: Order[]
  premisingSoon: Order[]
  activeOrders: Order[]
  newOrders: Order[]
  deliveredOrders: Order[]
}

export function summariseService(
  orders: Order[],
  dishes: Dish[],
  kitchens: number,
  today = new Date(),
): ServiceSummary {
  const tonight = ordersForDay(orders, today)
  const activeOrders = orders.filter(isActiveOrder)
  const deliveredToday = tonight.filter((order) => order.status === 'delivered')
  const takings = takingsOf(tonight)
  const weekEarning = earningOrders(orders).filter((order) => {
    const placed = parseISO(order.placedAt).getTime()
    return today.getTime() - placed < 7 * 86400000
  })
  const weekTakings = weekEarning.reduce((sum, order) => sum + order.pricing.total, 0)
  const allEarning = earningOrders(orders)
  const late = activeOrders
    .filter((order) => parseISO(order.promisedAt).getTime() < today.getTime())
    .sort((a, b) => parseISO(a.promisedAt).getTime() - parseISO(b.promisedAt).getTime())
  return {
    kitchens,
    dishes: dishes.filter((dish) => dish.available).length,
    soldOut: dishes.filter((dish) => !dish.available).length,
    ordersTonight: tonight.length,
    totalOrders: orders.length,
    totalDelivered: orders.filter((order) => order.status === 'delivered').length,
    customers: new Set(orders.map((order) => order.customer.phone)).size,
    active: activeOrders.length,
    delivered: deliveredToday.length,
    cancelled: tonight.filter((order) => order.status === 'cancelled').length,
    customersTonight: new Set(tonight.map((order) => order.customer.phone)).size,
    takingsTonight: takings,
    weekTakings,
    averageBasket: allEarning.length
      ? Math.round(
          allEarning.reduce((sum, order) => sum + order.pricing.total, 0) / allEarning.length,
        )
      : 0,
    late,
    premisingSoon: activeOrders
      .filter((order) => {
        const promised = parseISO(order.promisedAt).getTime()
        return promised >= today.getTime() && promised - today.getTime() < 15 * 60000
      })
      .sort((a, b) => parseISO(a.promisedAt).getTime() - parseISO(b.promisedAt).getTime()),
    activeOrders: activeOrders.sort(
      (a, b) => parseISO(a.promisedAt).getTime() - parseISO(b.promisedAt).getTime(),
    ),
    newOrders: tonight.filter((order) => order.status === 'placed'),
    deliveredOrders: deliveredToday,
  }
}

export const isTodayIso = (iso: string) => isToday(parseISO(iso))
export const isYesterdayIso = (iso: string) => isYesterday(parseISO(iso))

export const recentOrders = (orders: Order[], count = 6) =>
  [...orders]
    .sort((a, b) => parseISO(b.placedAt).getTime() - parseISO(a.placedAt).getTime())
    .slice(0, count)

export interface OrderFilter {
  query?: string
  status?: string
  kitchenId?: string
  day?: 'all' | 'today' | 'week'
}

export function filterOrders(orders: Order[], filter: OrderFilter): Order[] {
  const query = filter.query?.trim().toLowerCase() ?? ''
  return orders.filter((order) => {
    if (filter.status && filter.status !== 'all' && order.status !== filter.status) return false
    if (filter.kitchenId && filter.kitchenId !== 'all' && order.kitchenId !== filter.kitchenId) return false
    if (filter.day === 'today' && !isToday(parseISO(order.placedAt))) return false
    if (filter.day === 'week') {
      const placed = parseISO(order.placedAt).getTime()
      if (Date.now() - placed > 7 * 86400000) return false
    }
    if (!query) return true
    return (
      order.id.toLowerCase().includes(query) ||
      order.customer.name.toLowerCase().includes(query) ||
      order.customer.phone.replace(/\s/g, '').includes(query.replace(/\s/g, '')) ||
      order.kitchenName.toLowerCase().includes(query) ||
      order.items.some((item) => item.name.toLowerCase().includes(query))
    )
  })
}

export const sortOrdersNewest = (orders: Order[]) =>
  [...orders].sort((a, b) => parseISO(b.placedAt).getTime() - parseISO(a.placedAt).getTime())
