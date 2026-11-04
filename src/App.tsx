import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppProviders } from './components/layout/AppProviders'
import { ProtectedLayout } from './components/layout/ProtectedLayout'
import { PublicOnlyRoute } from './routes/ProtectedRoute'
import { PageSkeleton } from './components/ui/PageSkeleton'
import { RouteError } from './components/ui/RouteError'

const LoginPage = lazy(() => import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const ForgotPasswordPage = lazy(() =>
  import('./pages/auth/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
)
const DashboardPage = lazy(() =>
  import('./pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const RestaurantsPage = lazy(() =>
  import('./pages/restaurants/RestaurantsPage').then((m) => ({ default: m.RestaurantsPage })),
)
const RestaurantDetailPage = lazy(() =>
  import('./pages/restaurants/RestaurantDetailPage').then((m) => ({ default: m.RestaurantDetailPage })),
)
const MenuPage = lazy(() => import('./pages/menu/MenuPage').then((m) => ({ default: m.MenuPage })))
const DishDetailPage = lazy(() =>
  import('./pages/menu/DishDetailPage').then((m) => ({ default: m.DishDetailPage })),
)
const CartPage = lazy(() => import('./pages/cart/CartPage').then((m) => ({ default: m.CartPage })))
const CheckoutPage = lazy(() =>
  import('./pages/checkout/CheckoutPage').then((m) => ({ default: m.CheckoutPage })),
)
const PaymentPage = lazy(() =>
  import('./pages/checkout/PaymentPage').then((m) => ({ default: m.PaymentPage })),
)
const ConfirmationPage = lazy(() =>
  import('./pages/checkout/ConfirmationPage').then((m) => ({ default: m.ConfirmationPage })),
)
const OrdersPage = lazy(() => import('./pages/orders/OrdersPage').then((m) => ({ default: m.OrdersPage })))
const OrderDetailPage = lazy(() =>
  import('./pages/orders/OrderDetailPage').then((m) => ({ default: m.OrderDetailPage })),
)
const CustomersPage = lazy(() =>
  import('./pages/customers/CustomersPage').then((m) => ({ default: m.CustomersPage })),
)
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })))
const OrderHistoryPage = lazy(() =>
  import('./pages/history/OrderHistoryPage').then((m) => ({ default: m.OrderHistoryPage })),
)
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

const wrap = (element: React.ReactNode) => (
  <Suspense fallback={<PageSkeleton />}>{element}</Suspense>
)

const router = createBrowserRouter([
  {
    element: <AppProviders />,
    errorElement: <RouteError />,
    children: [
      {
        element: <ProtectedLayout />,
        children: [
          { path: '/', element: wrap(<DashboardPage />) },
          { path: '/restaurants', element: wrap(<RestaurantsPage />) },
          { path: '/restaurants/:slug', element: wrap(<RestaurantDetailPage />) },
          { path: '/menu', element: wrap(<MenuPage />) },
          { path: '/menu/:dishId', element: wrap(<DishDetailPage />) },
          { path: '/cart', element: wrap(<CartPage />) },
          { path: '/checkout', element: wrap(<CheckoutPage />) },
          { path: '/checkout/payment', element: wrap(<PaymentPage />) },
          { path: '/orders', element: wrap(<OrdersPage />) },
          { path: '/orders/:orderId', element: wrap(<OrderDetailPage />) },
          { path: '/orders/:orderId/confirmed', element: wrap(<ConfirmationPage />) },
          { path: '/customers', element: wrap(<CustomersPage />) },
          { path: '/profile', element: wrap(<ProfilePage />) },
          { path: '/order-history', element: wrap(<OrderHistoryPage />) },
          { path: '*', element: wrap(<NotFoundPage />) },
        ],
      },
      {
        path: '/login',
        element: (
          <PublicOnlyRoute>
            <Suspense fallback={<PageSkeleton bare />}>
              <LoginPage />
            </Suspense>
          </PublicOnlyRoute>
        ),
        errorElement: <RouteError />,
      },
      {
        path: '/register',
        element: (
          <PublicOnlyRoute>
            <Suspense fallback={<PageSkeleton bare />}>
              <RegisterPage />
            </Suspense>
          </PublicOnlyRoute>
        ),
        errorElement: <RouteError />,
      },
      {
        path: '/forgot-password',
        element: (
          <PublicOnlyRoute>
            <Suspense fallback={<PageSkeleton bare />}>
              <ForgotPasswordPage />
            </Suspense>
          </PublicOnlyRoute>
        ),
        errorElement: <RouteError />,
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
