import { Outlet } from 'react-router-dom'
import { ProtectedRoute } from '../../routes/ProtectedRoute'
import { AppShell } from './AppShell'
import { KitchenSwitchDialog } from '../cart/KitchenSwitchDialog'
import { DemoAutoSignIn } from './DemoAutoSignIn'

export function ProtectedLayout() {
  return (
    <DemoAutoSignIn>
      <ProtectedRoute>
        <AppShell>
          <Outlet />
          <KitchenSwitchDialog />
        </AppShell>
      </ProtectedRoute>
    </DemoAutoSignIn>
  )
}
