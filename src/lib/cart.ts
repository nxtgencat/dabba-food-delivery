import { addMinutes, formatISO } from 'date-fns'
import type {
  CartLine,
  CartState,
  Coupon,
  Dish,
  Kitchen,
  Order,
  OrderItem,
  OrderPricing,
} from '../types'

export const coupons: Coupon[] = [
  {
    code: 'DINNER50',
    title: '₹50 off dinner',
    description: 'Valid on any basket over ₹499, once per evening.',
    kind: 'flat',
    value: 50,
    maxDiscount: null,
    minSubtotal: 499,
  },
  {
    code: 'FRESH15',
    title: '15% off the table',
    description: '15% off, up to ₹120, on baskets over ₹699.',
    kind: 'percent',
    value: 0.15,
    maxDiscount: 120,
    minSubtotal: 699,
  },
  {
    code: 'FREEBIKE',
    title: 'Delivery on us',
    description: 'The delivery fee is removed on baskets over ₹399.',
    kind: 'delivery',
    value: 0,
    maxDiscount: null,
    minSubtotal: 399,
  },
]

export const emptyCart: CartState = {
  kitchenId: null,
  kitchenName: null,
  deliveryFee: 0,
  deliveryMinutes: 0,
  lines: [],
  couponCode: null,
}

export const cartSubtotal = (cart: CartState) =>
  cart.lines.reduce((sum, line) => sum + line.price * line.qty, 0)

export const cartItemCount = (cart: CartState) =>
  cart.lines.reduce((sum, line) => sum + line.qty, 0)

export function couponDiscount(cart: CartState): number {
  if (!cart.couponCode) return 0
  const coupon = coupons.find((entry) => entry.code === cart.couponCode)
  if (!coupon) return 0
  const subtotal = cartSubtotal(cart)
  if (subtotal < coupon.minSubtotal) return 0
  if (coupon.kind === 'percent') {
    const value = Math.round(subtotal * coupon.value)
    return coupon.maxDiscount ? Math.min(value, coupon.maxDiscount) : value
  }
  if (coupon.kind === 'flat') return Math.min(coupon.value, subtotal)
  return 0
}

export function cartPricing(cart: CartState): OrderPricing {
  const subtotal = cartSubtotal(cart)
  const discount = couponDiscount(cart)
  const coupon = coupons.find((entry) => entry.code === cart.couponCode)
  const freeDelivery = Boolean(coupon?.kind === 'delivery' && subtotal >= (coupon?.minSubtotal ?? 0))
  const deliveryFee = subtotal > 0 && !freeDelivery ? cart.deliveryFee : 0
  const packaging = subtotal > 0 ? 20 : 0
  const tax = Math.round((subtotal - discount) * 0.05)
  return {
    subtotal,
    discount,
    deliveryFee,
    packaging,
    tax,
    total: Math.max(0, subtotal - discount + deliveryFee + packaging + tax),
  }
}

export function isValidCoupon(code: string): Coupon | null {
  const clean = code.trim().toUpperCase()
  return coupons.find((entry) => entry.code === clean) ?? null
}

export function applyCouponToCart(cart: CartState, code: string): {
  cart: CartState
  ok: boolean
  message: string
} {
  const coupon = isValidCoupon(code)
  if (!coupon) {
    return { cart, ok: false, message: `“${code.trim() || 'That code'}” is not a code we run.` }
  }
  if (cart.lines.length === 0) {
    return { cart, ok: false, message: 'Add a dish before applying a coupon.' }
  }
  const subtotal = cartSubtotal(cart)
  if (subtotal < coupon.minSubtotal) {
    return {
      cart,
      ok: false,
      message: `${coupon.code} needs a basket of ₹${coupon.minSubtotal}. You are ₹${coupon.minSubtotal - subtotal} short.`,
    }
  }
  return {
    cart: { ...cart, couponCode: coupon.code },
    ok: true,
    message: `${coupon.code} applied. ${coupon.title.toLowerCase()} is in the total.`,
  }
}

export function cartLineFromDish(dish: Dish): Omit<CartLine, 'qty'> {
  return {
    dishId: dish.id,
    kitchenId: dish.kitchenId,
    name: dish.name,
    price: dish.price,
    image: dish.image,
    diet: dish.diet,
  }
}

export function orderItemsFromCart(cart: CartState): OrderItem[] {
  return cart.lines.map((line) => ({
    dishId: line.dishId,
    name: line.name,
    price: line.price,
    qty: line.qty,
    image: line.image,
    diet: line.diet,
  }))
}

export function newCartForKitchen(kitchen: Kitchen, line: Omit<CartLine, 'qty'>, qty = 1): CartState {
  return {
    kitchenId: kitchen.id,
    kitchenName: kitchen.name,
    deliveryFee: kitchen.deliveryFee,
    deliveryMinutes: kitchen.deliveryMinutes,
    lines: [{ ...line, qty }],
    couponCode: null,
  }
}

const orderId = () => {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5)
  const noise = Math.floor(Math.random() * 36 ** 2)
    .toString(36)
    .toUpperCase()
    .padStart(2, '0')
  return `DB-4${stamp}${noise}`
}

export function buildOrder(input: {
  cart: CartState
  customer: Order['customer']
  pricing: OrderPricing
  payment: Order['payment']
  rider: Order['rider']
}): Order {
  const now = new Date()
  const promised = addMinutes(now, input.cart.deliveryMinutes || 35)
  return {
    id: orderId(),
    demoSeed: false,
    kitchenId: input.cart.kitchenId ?? 'k-tiffin',
    kitchenName: input.cart.kitchenName ?? 'Tiffin & Co.',
    kitchenArea: 'Mumbai',
    items: orderItemsFromCart(input.cart),
    customer: input.customer,
    pricing: input.pricing,
    couponCode: input.cart.couponCode,
    payment: input.payment,
    status: 'placed',
    placedAt: formatISO(now),
    promisedAt: formatISO(promised),
    deliveredAt: null,
    cancelledAt: null,
    rider: input.rider,
    timeline: [
      { status: 'placed', at: formatISO(now), note: 'Order received by the kitchen' },
      { status: 'confirmed', at: formatISO(now), note: 'Payment cleared' },
    ],
    cancelReason: null,
  }
}

export const nextOrderStatus = (order: Order) => {
  if (order.status === 'placed') return 'preparing' as const
  if (order.status === 'preparing') return 'out_for_delivery' as const
  if (order.status === 'out_for_delivery') return 'delivered' as const
  return null
}

export const stageLabel: Record<string, string> = {
  placed: 'Order placed',
  confirmed: 'Payment cleared',
  preparing: 'In the kitchen',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}
