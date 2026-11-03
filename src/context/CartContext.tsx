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
import { toast } from 'react-toastify'
import type { CartState, CartValue, Kitchen, CartLine } from '../types'
import {
  applyCouponToCart,
  cartItemCount,
  cartLineFromDish,
  emptyCart,
  newCartForKitchen,
} from '../lib/cart'
import { readStorage, storageKeys, writeStorage } from '../lib/storage'

export const CartContext = createContext<CartValue | null>(null)

interface PendingLine {
  line: Omit<CartLine, 'qty'>
  kitchen: Kitchen
  qty: number
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(() =>
    readStorage<CartState>(storageKeys.cart, emptyCart),
  )
  const [pending, setPending] = useState<PendingLine | null>(null)
  const firstWrite = useRef(true)

  useEffect(() => {
    if (firstWrite.current) {
      firstWrite.current = false
    }
    writeStorage(storageKeys.cart, cart)
  }, [cart])

  // A coupon can stop being valid when the basket shrinks; the pricing function
  // already ignores it, and this drops the code so the field does not lie.
  useEffect(() => {
    if (!cart.couponCode) return
    const code = cart.couponCode
    const result = applyCouponToCart(cart, code)
    if (!result.ok) {
      setCart((prev) => (prev.couponCode === code ? { ...prev, couponCode: null } : prev))
    }
  }, [cart])

  const addLine = useCallback<CartValue['addLine']>(
    (line, kitchen, qty = 1) => {
      setCart((prev) => {
        if (prev.kitchenId && prev.kitchenId !== kitchen.id && prev.lines.length) {
          setPending({ line, kitchen, qty })
          return prev
        }
        if (!prev.kitchenId || prev.kitchenId !== kitchen.id) {
          return newCartForKitchen(kitchen, line, qty)
        }
        const existing = prev.lines.find((entry) => entry.dishId === line.dishId)
        if (existing) {
          return {
            ...prev,
            lines: prev.lines.map((entry) =>
              entry.dishId === line.dishId ? { ...entry, qty: entry.qty + qty } : entry,
            ),
          }
        }
        return { ...prev, lines: [...prev.lines, { ...line, qty }] }
      })
    },
    [],
  )

  const removeLine = useCallback((dishId: string) => {
    setCart((prev) => {
      const lines = prev.lines.filter((line) => line.dishId !== dishId)
      if (!lines.length) return { ...emptyCart }
      return { ...prev, lines }
    })
  }, [])

  const setQty = useCallback((dishId: string, qty: number) => {
    setCart((prev) => {
      if (qty <= 0) {
        const lines = prev.lines.filter((line) => line.dishId !== dishId)
        return lines.length ? { ...prev, lines } : { ...emptyCart }
      }
      return {
        ...prev,
        lines: prev.lines.map((line) =>
          line.dishId === dishId ? { ...line, qty: Math.min(20, qty) } : line,
        ),
      }
    })
  }, [])

  const clearCart = useCallback(() => {
    setCart({ ...emptyCart })
  }, [])

  const applyCoupon = useCallback<CartValue['applyCoupon']>(
    (code) => {
      const result = applyCouponToCart(cart, code)
      if (result.ok) {
        setCart(result.cart)
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
      return { ok: result.ok, message: result.message }
    },
    [cart],
  )

  const removeCoupon = useCallback(() => {
    setCart((prev) => ({ ...prev, couponCode: null }))
  }, [])

  const confirmSwitch = useCallback(() => {
    if (!pending) return
    setCart(newCartForKitchen(pending.kitchen, pending.line, pending.qty))
    toast.success(`Basket moved to ${pending.kitchen.name}.`)
    setPending(null)
  }, [pending])

  const cancelSwitch = useCallback(() => setPending(null), [])

  const itemCount = useMemo(() => cartItemCount(cart), [cart])

  const value = useMemo<CartValue>(
    () => ({
      cart,
      itemCount,
      addLine,
      removeLine,
      setQty,
      clearCart,
      applyCoupon,
      removeCoupon,
      pendingKitchen: pending?.kitchen ?? null,
      pendingLine: pending,
      confirmSwitch,
      cancelSwitch,
    }),
    [
      cart,
      itemCount,
      addLine,
      removeLine,
      setQty,
      clearCart,
      applyCoupon,
      removeCoupon,
      pending,
      confirmSwitch,
      cancelSwitch,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCartValue() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}

export { cartLineFromDish }
