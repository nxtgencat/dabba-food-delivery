import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'
import { CatalogContext } from '../context/CatalogContext'
import { OrdersContext } from '../context/OrdersContext'

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}

export function useCart() {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside CartProvider')
  return value
}

export function useCatalog() {
  const value = useContext(CatalogContext)
  if (!value) throw new Error('useCatalog must be used inside CatalogProvider')
  return value
}

export function useOrders() {
  const value = useContext(OrdersContext)
  if (!value) throw new Error('useOrders must be used inside OrdersProvider')
  return value
}
