import { Modal } from '../ui/Modal'
import { useCart } from '../../hooks/useApp'
import { formatINR } from '../../lib/format'

/** Switching kitchens replaces the basket, so the change is always asked for, never silent. */
export function KitchenSwitchDialog() {
  const { pendingLine, pendingKitchen, cart, confirmSwitch, cancelSwitch } = useCart()

  if (!pendingLine || !pendingKitchen) return null

  return (
    <Modal
      open
      onClose={cancelSwitch}
      title="Start a new basket?"
      description="A basket holds dishes from one kitchen, because each kitchen packs and rides on its own."
      size="sm"
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={cancelSwitch}>
            Keep {cart.kitchenName ?? 'the current basket'}
          </button>
          <button type="button" className="btn btn-primary" onClick={confirmSwitch}>
            Start with {pendingKitchen.name}
          </button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="rounded-[6px] bg-raised px-3 py-2.5">
          <p className="text-[13px] leading-4 text-faint">In the basket now</p>
          <p className="mt-0.5 text-[13px] font-medium">{cart.kitchenName}</p>
          <p className="mt-0.5 text-[13px] text-muted">
            {cart.lines.length} {cart.lines.length === 1 ? 'dish' : 'dishes'} ·{' '}
            {formatINR(cart.lines.reduce((sum, line) => sum + line.price * line.qty, 0))}
          </p>
        </div>
        <div className="rounded-[6px] bg-sunken px-3 py-2.5">
          <p className="text-[13px] leading-4 text-faint">You are adding</p>
          <p className="mt-0.5 text-[13px] font-medium">{pendingLine.line.name}</p>
          <p className="mt-0.5 text-[13px] text-muted">From {pendingKitchen.name}</p>
        </div>
      </div>
    </Modal>
  )
}
