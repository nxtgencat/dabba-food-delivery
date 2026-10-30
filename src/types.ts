export type OrderStatus =
  | 'placed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'

export type PaymentMethod = 'card' | 'upi' | 'wallet'

export type PaymentStatus = 'paid' | 'refunded' | 'failed'

export type DietKind = 'veg' | 'nonveg'

export type MenuCategory =
  | 'Mains'
  | 'Breakfast'
  | 'Snacks'
  | 'Sides'
  | 'Desserts'
  | 'Drinks'

export type CatalogStatus = 'loading' | 'ready' | 'degraded' | 'error'

export interface Recipe {
  id: number
  name: string
  ingredients: string[]
  instructions: string[]
  prepTimeMinutes: number
  cookTimeMinutes: number
  servings: number
  difficulty: string
  cuisine: string
  caloriesPerServing: number
  tags: string[]
  userId: number
  image: string
  rating: number
  reviewCount: number
  mealType: string[]
}

export interface Dish {
  id: string
  recipeId: number | null
  kitchenId: string
  name: string
  description: string
  ingredients: string[]
  instructions: string[]
  image: string
  price: number
  category: MenuCategory
  cuisine: string
  diet: DietKind
  available: boolean
  soldOutAt: string | null
  soldOutCompare: string | null
  rating: number
  reviewCount: number
  prepMinutes: number
  cookMinutes: number
  calories: number
  difficulty: string
  custom: boolean
}

export interface Kitchen {
  id: string
  slug: string
  name: string
  cuisine: string
  tags: string[]
  blurb: string
  area: string
  address: string
  deliveryMinutes: number
  deliveryFee: number
  openTime: string
  closeTime: string
  dishIds: string[]
  heroDishId: string
}

export interface Address {
  id: string
  label: string
  line1: string
  line2?: string
  area: string
  city: string
  pincode: string
  isDefault: boolean
}

export interface StoredUser {
  id: string
  name: string
  email: string
  phone: string
  passwordHash: string
  role: 'Service manager' | 'Shift lead'
  avatar: string | null
  wallet: number
  addresses: Address[]
  createdAt: string
}

export interface Session {
  userId: string
  signedInAt: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  role: 'Service manager' | 'Shift lead'
  avatar: string | null
  wallet: number
  addresses: Address[]
}

export interface CartLine {
  dishId: string
  kitchenId: string
  name: string
  price: number
  image: string
  diet: DietKind
  qty: number
}

export interface CartState {
  kitchenId: string | null
  kitchenName: string | null
  deliveryFee: number
  deliveryMinutes: number
  lines: CartLine[]
  couponCode: string | null
}

export interface Coupon {
  code: string
  title: string
  description: string
  kind: 'percent' | 'flat' | 'delivery'
  value: number
  maxDiscount: number | null
  minSubtotal: number
}

export interface OrderItem {
  dishId: string
  name: string
  price: number
  qty: number
  image: string
  diet: DietKind
}

export interface OrderPricing {
  subtotal: number
  discount: number
  deliveryFee: number
  packaging: number
  tax: number
  total: number
}

export interface OrderCustomer {
  name: string
  phone: string
  address: string
  note: string
}

export interface OrderRider {
  name: string
  phone: string
}

export interface TimelineEntry {
  status: OrderStatus | 'confirmed'
  at: string
  note: string
}

export interface Order {
  id: string
  demoSeed: boolean
  kitchenId: string
  kitchenName: string
  kitchenArea: string
  items: OrderItem[]
  customer: OrderCustomer
  pricing: OrderPricing
  couponCode: string | null
  payment: {
    method: PaymentMethod
    status: PaymentStatus
    reference: string
  }
  status: OrderStatus
  placedAt: string
  promisedAt: string
  deliveredAt: string | null
  cancelledAt: string | null
  rider: OrderRider | null
  timeline: TimelineEntry[]
  cancelReason: string | null
}

export interface SeedCustomer {
  name: string
  phone: string
  address: string
  area: string
}

export interface CatalogValue {
  dishes: Dish[]
  kitchens: Kitchen[]
  status: CatalogStatus
  source: 'live' | 'bundled'
  fetchedAt: string | null
  error: string | null
  retry: () => void
  addDish: (input: DishInput) => void
  updateDish: (id: string, patch: Partial<DishInput>) => void
  deleteDish: (id: string) => void
  getDish: (id: string) => Dish | undefined
  getKitchen: (id: string) => Kitchen | undefined
}

export interface DishInput {
  kitchenId: string
  name: string
  description: string
  price: number
  category: MenuCategory
  cuisine: string
  diet: DietKind
  image: string
  available: boolean
  soldOutAt?: string | null
  prepMinutes: number
}

export type AuthError = 'invalid' | 'exists' | 'unknown'

export interface AuthValue {
  user: UserProfile | null
  signIn: (email: string, password: string, persist?: boolean) => Promise<{ ok: boolean; error?: AuthError }>
  register: (input: {
    name: string
    email: string
    phone: string
    password: string
  }) => Promise<{ ok: boolean; error?: AuthError }>
  signOut: () => void
  updateProfile: (patch: Partial<Pick<UserProfile, 'name' | 'email' | 'phone' | 'avatar'>>) => void
  addAddress: (address: Omit<Address, 'id'>) => void
  updateAddress: (id: string, address: Omit<Address, 'id'>) => void
  removeAddress: (id: string) => void
  adjustWallet: (delta: number) => void
}

export interface OrdersValue {
  orders: Order[]
  placeOrder: (input: {
    kitchenId: string
    kitchenName: string
    kitchenArea: string
    items: OrderItem[]
    customer: OrderCustomer
    pricing: OrderPricing
    couponCode: string | null
    payment: Order['payment']
    promisedAt: string
    rider: OrderRider | null
  }) => Order
  advanceOrder: (id: string) => Order | undefined
  cancelOrder: (id: string, reason: string) => Order | undefined
  getOrder: (id: string) => Order | undefined
  nextStatus: (order: Order) => OrderStatus | null
}

export interface CartValue {
  cart: CartState
  itemCount: number
  addLine: (line: Omit<CartLine, 'qty'>, kitchen: Kitchen, qty?: number) => void
  removeLine: (dishId: string) => void
  setQty: (dishId: string, qty: number) => void
  clearCart: () => void
  applyCoupon: (code: string) => { ok: boolean; message: string }
  removeCoupon: () => void
  pendingKitchen: Kitchen | null
  pendingLine: { line: Omit<CartLine, 'qty'>; kitchen: Kitchen; qty: number } | null
  confirmSwitch: () => void
  cancelSwitch: () => void
}
