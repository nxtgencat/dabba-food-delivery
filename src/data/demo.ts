import { addMinutes, formatISO, set } from 'date-fns'
import type {
  Dish,
  Kitchen,
  MenuCategory,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  Recipe,
  TimelineEntry,
} from '../types'
import {
  buildDescription,
  categoryForRecipe,
  customersSeed,
  kitchenByRecipeId,
  kitchensSeed,
  priceByRecipeId,
  ridersSeed,
  soldOutSeed,
  vegetarianIds,
} from './seed'

/** Deterministic pseudo-random stream so demo orders look varied but never change between reloads. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pick = <T,>(random: () => number, list: T[]): T => list[Math.floor(random() * list.length)]

export function recipeToDish(recipe: Recipe): Dish {
  const category = categoryForRecipe(recipe)
  const kitchenId = kitchenByRecipeId[recipe.id] ?? 'k-tiffin'
  const soldOut = soldOutSeed[recipe.id]
  return {
    id: `r${recipe.id}`,
    recipeId: recipe.id,
    kitchenId,
    name: recipe.name,
    description: buildDescription(recipe, category),
    ingredients: recipe.ingredients,
    instructions: recipe.instructions,
    // The same photograph the API serves, bundled at build time so the menu
    // does not depend on a CDN or a network for its pictures.
    image: `/food/${recipe.id}.webp`,
    price: priceByRecipeId[recipe.id] ?? 299,
    category,
    cuisine: recipe.cuisine,
    diet: vegetarianIds.has(recipe.id) ? 'veg' : 'nonveg',
    available: !soldOut,
    soldOutAt: soldOut?.at ?? null,
    soldOutCompare: soldOut?.compare ?? null,
    rating: recipe.rating,
    reviewCount: recipe.reviewCount,
    prepMinutes: recipe.prepTimeMinutes,
    cookMinutes: recipe.cookTimeMinutes,
    calories: recipe.caloriesPerServing,
    difficulty: recipe.difficulty,
    custom: false,
  }
}

export function buildKitchens(dishes: Dish[]): Kitchen[] {
  return kitchensSeed.map((kitchen) => {
    const own = dishes.filter((dish) => dish.kitchenId === kitchen.id)
    const hero =
      own.find((dish) => dish.id === kitchen.heroDishId) ?? own[0] ?? null
    return {
      ...kitchen,
      dishIds: own.map((dish) => dish.id),
      heroDishId: hero ? hero.id : kitchen.heroDishId,
    }
  })
}

const packagingFor = (subtotal: number) => (subtotal > 0 ? 20 : 0)
const taxFor = (amount: number) => Math.round(amount * 0.05)

export interface DemoBuild {
  orders: Order[]
  anchor: string
}

/**
 * Builds the demo service history: four past evenings plus tonight's live board.
 * Totals are always the sum of the lines a customer can see, and every KPI is
 * derived from these rows later.
 */
export function buildDemoHistory(dishes: Dish[], anchorDate: Date): DemoBuild {
  const random = mulberry32(20261104)
  const byId = new Map(dishes.map((dish) => [dish.id, dish]))
  const kitchens = buildKitchens(dishes)
  const orders: Order[] = []
  let counter = 1180

  const makeItems = (kitchen: Kitchen, count: number): OrderItem[] => {
    const pool = kitchen.dishIds.map((id) => byId.get(id)).filter((d): d is Dish => Boolean(d))
    const chosen = new Set<string>()
    const items: OrderItem[] = []
    for (let i = 0; i < count && pool.length; i++) {
      const dish = pick(random, pool)
      if (chosen.has(dish.id)) continue
      chosen.add(dish.id)
      items.push({
        dishId: dish.id,
        name: dish.name,
        price: dish.price,
        qty: random() > 0.78 ? 2 : 1,
        image: dish.image,
        diet: dish.diet,
      })
    }
    return items
  }

  const priceItems = (items: OrderItem[], kitchen: Kitchen) => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0)
    const packaging = packagingFor(subtotal)
    const tax = taxFor(subtotal)
    return {
      subtotal,
      discount: 0,
      deliveryFee: kitchen.deliveryFee,
      packaging,
      tax,
      total: subtotal + kitchen.deliveryFee + packaging + tax,
    }
  }

  const dayPlans: {
    daysAgo: number
    count: number
    mix: OrderStatus[]
  }[] = [
    { daysAgo: 4, count: 24, mix: ['delivered', 'delivered', 'delivered', 'cancelled'] },
    { daysAgo: 3, count: 27, mix: ['delivered', 'delivered', 'delivered', 'delivered'] },
    { daysAgo: 2, count: 22, mix: ['delivered', 'delivered', 'cancelled', 'delivered'] },
    { daysAgo: 1, count: 29, mix: ['delivered', 'delivered', 'delivered', 'cancelled', 'delivered'] },
  ]

  for (const plan of dayPlans) {
    for (let i = 0; i < plan.count; i++) {
      const kitchen = pick(random, kitchens)
      const customer = pick(random, customersSeed)
      const rider = pick(random, ridersSeed)
      const items = makeItems(kitchen, 1 + Math.floor(random() * 3))
      if (!items.length) continue
      const pricing = priceItems(items, kitchen)
      const placedHour = 17 + Math.floor(random() * 6)
      const placedMinute = Math.floor(random() * 60)
      const placedAt = set(anchorDate, {
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      })
      placedAt.setDate(placedAt.getDate() - plan.daysAgo)
      placedAt.setHours(placedHour, placedMinute, 0, 0)
      const promisedAt = addMinutes(placedAt, kitchen.deliveryMinutes + 8)
      const status = pick(random, plan.mix)
      const travel = kitchen.deliveryMinutes + Math.floor(random() * 14) - 4
      const deliveredAt =
        status === 'delivered'
          ? formatISO(addMinutes(placedAt, travel + 6))
          : null
      const cancelledAt = status === 'cancelled' ? formatISO(addMinutes(placedAt, 4)) : null
      const method: PaymentMethod = pick(random, ['card', 'upi', 'upi', 'wallet'])
      const timeline: TimelineEntry[] = [
        { status: 'placed', at: formatISO(placedAt), note: 'Order received by the kitchen' },
        { status: 'confirmed', at: formatISO(addMinutes(placedAt, 1)), note: 'Payment cleared' },
        {
          status: 'preparing',
          at: formatISO(addMinutes(placedAt, 3)),
          note: kitchen.name,
        },
      ]
      if (status === 'delivered' && deliveredAt) {
        timeline.push({
          status: 'out_for_delivery',
          at: formatISO(addMinutes(placedAt, travel)),
          note: `${rider.name} picked up the tiffin`,
        })
        timeline.push({
          status: 'delivered',
          at: deliveredAt,
          note: 'Handed to the customer',
        })
      }
      if (status === 'cancelled' && cancelledAt) {
        timeline.push({
          status: 'cancelled',
          at: cancelledAt,
          note: 'Customer cancelled before the kitchen started',
        })
      }
      counter += 3 + Math.floor(random() * 5)
      orders.push({
        id: `DB-${counter}`,
        demoSeed: true,
        kitchenId: kitchen.id,
        kitchenName: kitchen.name,
        kitchenArea: kitchen.area,
        items,
        customer: {
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          note: '',
        },
        pricing: {
          ...pricing,
          discount: status === 'cancelled' ? 0 : pricing.discount,
        },
        couponCode: null,
        payment: {
          method,
          status: status === 'cancelled' ? 'refunded' : 'paid',
          reference: `${method === 'upi' ? 'UPI' : method === 'card' ? 'CARD' : 'WLT'}-${Math.floor(random() * 900000 + 100000)}`,
        },
        status,
        placedAt: formatISO(placedAt),
        promisedAt: formatISO(promisedAt),
        deliveredAt,
        cancelledAt,
        rider:
          status === 'delivered' || status === 'out_for_delivery'
            ? rider
            : null,
        timeline,
        cancelReason:
          status === 'cancelled' ? 'Customer cancelled before the kitchen started' : null,
      })
    }
  }

  // Tonight's live board: a full evening in every stage. Ages are chosen so the
  // promised window tells the truth — two orders are late, the rest are inside it.
  const now = anchorDate
  const tonight: {
    minutesAgo: number
    status: OrderStatus
    kitchenId: string
    deliveredAfter?: number
  }[] = [
    { minutesAgo: 176, status: 'delivered', kitchenId: 'k-tiffin', deliveredAfter: 44 },
    { minutesAgo: 162, status: 'delivered', kitchenId: 'k-oven', deliveredAfter: 39 },
    { minutesAgo: 148, status: 'delivered', kitchenId: 'k-wok', deliveredAfter: 52 },
    { minutesAgo: 121, status: 'delivered', kitchenId: 'k-sugar', deliveredAfter: 37 },
    { minutesAgo: 98, status: 'cancelled', kitchenId: 'k-casa' },
    { minutesAgo: 64, status: 'out_for_delivery', kitchenId: 'k-casa' },
    { minutesAgo: 58, status: 'out_for_delivery', kitchenId: 'k-oven' },
    { minutesAgo: 33, status: 'out_for_delivery', kitchenId: 'k-wok' },
    { minutesAgo: 21, status: 'preparing', kitchenId: 'k-casa' },
    { minutesAgo: 16, status: 'preparing', kitchenId: 'k-tiffin' },
    { minutesAgo: 12, status: 'preparing', kitchenId: 'k-sugar' },
    { minutesAgo: 6, status: 'placed', kitchenId: 'k-tiffin' },
    { minutesAgo: 3, status: 'placed', kitchenId: 'k-oven' },
  ]

  for (const [index, entry] of tonight.entries()) {
    const kitchen =
      kitchens.find((item) => item.id === entry.kitchenId) ?? kitchens[index % kitchens.length]
    const customer = customersSeed[(index * 5 + 2) % customersSeed.length]
    const rider = ridersSeed[index % ridersSeed.length]
    const items = makeItems(kitchen, 1 + (index % 3))
    if (!items.length) continue
    const pricing = priceItems(items, kitchen)
    const placedAt = addMinutes(now, -entry.minutesAgo)
    const promisedAt = addMinutes(placedAt, kitchen.deliveryMinutes)
    const timeline: TimelineEntry[] = [
      { status: 'placed', at: formatISO(placedAt), note: 'Order received by the kitchen' },
      { status: 'confirmed', at: formatISO(addMinutes(placedAt, 1)), note: 'Payment cleared' },
    ]
    if (entry.status !== 'placed') {
      timeline.push({
        status: 'preparing',
        at: formatISO(addMinutes(placedAt, 4)),
        note: kitchen.name,
      })
    }
    if (entry.status === 'out_for_delivery' || entry.status === 'delivered') {
      timeline.push({
        status: 'out_for_delivery',
        at: formatISO(addMinutes(placedAt, Math.max(8, kitchen.deliveryMinutes - 14))),
        note: `${rider.name} picked up the tiffin`,
      })
    }
    const deliveredAt =
      entry.status === 'delivered'
        ? formatISO(addMinutes(placedAt, entry.deliveredAfter ?? kitchen.deliveryMinutes + 4))
        : null
    if (entry.status === 'delivered' && deliveredAt) {
      timeline.push({ status: 'delivered', at: deliveredAt, note: 'Handed to the customer' })
    }
    const cancelledAt = entry.status === 'cancelled' ? formatISO(addMinutes(placedAt, 6)) : null
    if (entry.status === 'cancelled' && cancelledAt) {
      timeline.push({
        status: 'cancelled',
        at: cancelledAt,
        note: 'Customer cancelled before the kitchen started',
      })
    }
    const method: PaymentMethod = index % 4 === 0 ? 'wallet' : index % 3 === 0 ? 'card' : 'upi'
    counter += 2
    orders.push({
      id: `DB-${counter}`,
      demoSeed: true,
      kitchenId: kitchen.id,
      kitchenName: kitchen.name,
      kitchenArea: kitchen.area,
      items,
      customer: {
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        note: index === 9 ? 'Leave at the door, no bell.' : '',
      },
      pricing,
      couponCode: index === 4 ? 'DINNER50' : null,
      payment: {
        method,
        status: entry.status === 'cancelled' ? 'refunded' : 'paid',
        reference: `UPI-${770000 + index * 137}`,
      },
      status: entry.status,
      placedAt: formatISO(placedAt),
      promisedAt: formatISO(promisedAt),
      deliveredAt,
      cancelledAt,
      rider: entry.status === 'out_for_delivery' || entry.status === 'delivered' ? rider : null,
      timeline,
      cancelReason:
        entry.status === 'cancelled' ? 'Customer cancelled before the kitchen started' : null,
    })
  }

  const next = new Date(anchorDate)
  next.setSeconds(0, 0)
  return { orders, anchor: formatISO(next) }
}

export const orderStatusMeta: Record<
  OrderStatus,
  { label: string; tone: 'positive' | 'negative' | 'warning' | 'neutral' | 'hue' }
> = {
  placed: { label: 'Placed', tone: 'neutral' },
  preparing: { label: 'Preparing', tone: 'warning' },
  out_for_delivery: { label: 'Out for delivery', tone: 'hue' },
  delivered: { label: 'Delivered', tone: 'positive' },
  cancelled: { label: 'Cancelled', tone: 'negative' },
}

export const categoryOrder: MenuCategory[] = [
  'Mains',
  'Breakfast',
  'Snacks',
  'Desserts',
  'Drinks',
]

export const kitchenIds = kitchensSeed.map((kitchen) => kitchen.id)
