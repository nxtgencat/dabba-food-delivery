import { Outlet } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider } from '../../context/AuthContext'
import { CartProvider } from '../../context/CartContext'
import { CatalogProvider } from '../../context/CatalogContext'
import { OrdersProvider } from '../../context/OrdersContext'

/** Context providers for every route, signed in or not. The shell lives in ProtectedLayout. */
export function AppProviders() {
  return (
    <AuthProvider>
      <CatalogProvider>
        <OrdersProvider>
          <CartProvider>
            <Outlet />
          </CartProvider>
        </OrdersProvider>
      </CatalogProvider>
      <ToastContainer
        position="bottom-right"
        autoClose={3200}
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable={false}
        theme="light"
        toastClassName="!rounded-[8px] !border !border-line !bg-surface !text-ink !text-[13px] !font-sans !shadow-[0_10px_28px_rgb(17_19_19/0.12)]"
        className="!font-sans"
      />
    </AuthProvider>
  )
}
