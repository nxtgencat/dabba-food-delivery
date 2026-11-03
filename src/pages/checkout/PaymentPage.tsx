import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
  Smartphone,
  Wallet,
  XCircle,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { PageHeader, Panel, SectionHeading } from '../../components/ui/Page'
import { EmptyState } from '../../components/ui/Feedback'
import { useAuth, useCart, useOrders } from '../../hooks/useApp'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { cartPricing } from '../../lib/cart'
import { formatINR, formatINRPrecise, formatMinutes } from '../../lib/format'
import { ridersSeed } from '../../data/seed'
import type { CheckoutDraft } from './CheckoutPage'
import type { PaymentMethod } from '../../types'
import { cn } from '../../lib/cn'

const draftKey = 'dabba.v1.checkout-draft'

type Outcome = 'idle' | 'processing' | 'success' | 'failed'

const declineCards = new Set(['4000 0000 0000 0002', '4000000000000002'])
const declineUpi = new Set(['fail@upi', 'declined@upi'])

function readDraft(): CheckoutDraft | null {
  try {
    const raw = window.localStorage.getItem(draftKey)
    return raw ? (JSON.parse(raw) as CheckoutDraft) : null
  } catch {
    return null
  }
}

export function PaymentPage() {
  useDocumentTitle('Payment')
  const { cart, clearCart, itemCount } = useCart()
  const { user, adjustWallet } = useAuth()
  const { placeOrder } = useOrders()
  const navigate = useNavigate()
  const [method, setMethod] = useState<PaymentMethod>('card')
  const [outcome, setOutcome] = useState<Outcome>('idle')
  const [failure, setFailure] = useState<string | null>(null)
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [upi, setUpi] = useState('')
  const [processingStep, setProcessingStep] = useState('')

  const draft = useMemo(() => readDraft(), [])
  const pricing = cartPricing(cart)

  useEffect(() => {
    if (!draft) navigate('/checkout', { replace: true })
  }, [draft, navigate])

  if (!cart.lines.length) {
    return (
      <div className="app-fade">
        <PageHeader title="Payment" finding="There is no open basket to pay for." />
        <Panel>
          <EmptyState
            icon={<Banknote size={26} strokeWidth={1.4} />}
            title="The basket closed"
            body="A payment starts from a basket. Nothing has been charged; start again from a kitchen."
            action={
              <Link to="/restaurants" className="btn btn-primary">
                Browse restaurants
              </Link>
            }
          />
        </Panel>
      </div>
    )
  }

  if (!draft) return null

  const pay = async () => {
    setFailure(null)
    if (method === 'card') {
      const digits = card.number.replace(/\s/g, '')
      if (digits.length < 16) {
        setFailure('The card number needs 16 digits.')
        return
      }
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) {
        setFailure('Use the expiry as MM/YY.')
        return
      }
      if (!/^\d{3,4}$/.test(card.cvv)) {
        setFailure('The security code is three or four digits.')
        return
      }
      if (card.name.trim().length < 3) {
        setFailure('Add the name printed on the card.')
        return
      }
      if (declineCards.has(digits)) {
        setOutcome('failed')
        setFailure('The bank declined this card. Try another card or another method.')
        return
      }
    }
    if (method === 'upi') {
      if (!/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(upi.trim())) {
        setFailure('Enter a UPI ID such as name@bank.')
        return
      }
      if (declineUpi.has(upi.trim().toLowerCase())) {
        setOutcome('failed')
        setFailure('The UPI handle declined the collect request.')
        return
      }
    }
    if (method === 'wallet' && (user?.wallet ?? 0) < pricing.total) {
      setOutcome('failed')
      setFailure(
        `The wallet holds ${formatINR(user?.wallet ?? 0)}; this order needs ${formatINRPrecise(pricing.total)}.`,
      )
      return
    }

    setOutcome('processing')
    setProcessingStep('Contacting the payment gateway')
    await new Promise((resolve) => window.setTimeout(resolve, 700))
    setProcessingStep('Holding the amount with the bank')
    await new Promise((resolve) => window.setTimeout(resolve, 700))
    setProcessingStep('Confirming with the kitchen')
    await new Promise((resolve) => window.setTimeout(resolve, 600))

    const reference =
      method === 'card'
        ? `CARD-${card.number.replace(/\s/g, '').slice(-4)}-${Math.floor(Math.random() * 900 + 100)}`
        : method === 'upi'
          ? `UPI-${upi.split('@')[0].slice(0, 6).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`
          : `WLT-${Math.floor(Math.random() * 900000 + 100000)}`

    if (method === 'wallet') adjustWallet(-pricing.total)

    const order = placeOrder({
      kitchenId: cart.kitchenId ?? 'k-tiffin',
      kitchenName: cart.kitchenName ?? 'Tiffin & Co.',
      kitchenArea: draft.address.area,
      items: cart.lines.map((line) => ({
        dishId: line.dishId,
        name: line.name,
        price: line.price,
        qty: line.qty,
        image: line.image,
        diet: line.diet,
      })),
      customer: {
        name: draft.contact.name,
        phone: draft.contact.phone,
        address: `${draft.address.line1}${draft.address.line2 ? `, ${draft.address.line2}` : ''}, ${draft.address.area}, ${draft.address.city} ${draft.address.pincode}`,
        note: draft.contact.note,
      },
      pricing,
      couponCode: cart.couponCode,
      payment: { method, status: 'paid', reference },
      promisedAt: new Date(Date.now() + (cart.deliveryMinutes || 35) * 60000).toISOString(),
      rider: ridersSeed[Math.floor(Math.random() * ridersSeed.length)],
    })

    window.localStorage.removeItem(draftKey)
    clearCart()
    setOutcome('success')
    toast.success(`Payment cleared. ${order.id} is with the kitchen.`)
    navigate(`/orders/${order.id}/confirmed`, { replace: true })
  }

  return (
    <div className="app-fade">
      <PageHeader
        title="Payment"
        finding={
          <>
            {itemCount} {itemCount === 1 ? 'dish' : 'dishes'} for{' '}
            <span className="font-medium text-ink">{draft.contact.name}</span> at {draft.address.label},
            {' '}
            {draft.address.area}. No real money moves; this is a demonstration gateway.
          </>
        }
        actions={
          <Link to="/checkout" className="btn btn-secondary">
            <ArrowLeft size={15} strokeWidth={1.7} />
            Address
          </Link>
        }
      />

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_364px]">
        <div className="min-w-0 space-y-3">
          <Panel className="p-4 sm:p-5">
            <SectionHeading title="Choose how to pay" meta="one method per order" />
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {(
                [
                  { id: 'card', label: 'Card', icon: CreditCard, note: 'Visa, Mastercard, RuPay' },
                  { id: 'upi', label: 'UPI', icon: Smartphone, note: 'Pay by any UPI handle' },
                  { id: 'wallet', label: 'Wallet', icon: Wallet, note: `${formatINR(user?.wallet ?? 0)} available` },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setMethod(option.id)
                    setFailure(null)
                    setOutcome('idle')
                  }}
                  aria-pressed={method === option.id}
                  className={cn(
                    'flex flex-col rounded-[6px] p-3 text-left transition-colors',
                    method === option.id
                      ? 'bg-active shadow-[inset_0_0_0_1.5px_var(--color-ink)]'
                      : 'bg-surface shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-raised',
                  )}
                >
                  <option.icon size={17} strokeWidth={1.5} className="text-ink" />
                  <span className="mt-1.5 text-[13px] leading-4 font-medium">{option.label}</span>
                  <span className="mt-0.5 text-[13px] leading-4 text-faint">{option.note}</span>
                </button>
              ))}
            </div>

            <div className="mt-4">
              {method === 'card' ? (
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px_90px]">
                  <div className="sm:col-span-3">
                    <label htmlFor="card-number" className="field-label">
                      Card number
                    </label>
                    <input
                      id="card-number"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      className="field num"
                      placeholder="4111 1111 1111 1111"
                      value={card.number}
                      onChange={(event) => {
                        const digits = event.target.value.replace(/\D/g, '').slice(0, 16)
                        setCard({ ...card, number: digits.replace(/(.{4})/g, '$1 ').trim() })
                      }}
                    />
                    <p className="mt-1 text-[13px] leading-4 text-faint">
                      Test card 4111 1111 1111 1111 succeeds; 4000 0000 0000 0002 is declined.
                    </p>
                  </div>
                  <div className="sm:col-span-3">
                    <label htmlFor="card-name" className="field-label">
                      Name on the card
                    </label>
                    <input
                      id="card-name"
                      autoComplete="cc-name"
                      className="field"
                      placeholder="ARJUN NAIR"
                      value={card.name}
                      onChange={(event) => setCard({ ...card, name: event.target.value })}
                    />
                  </div>
                  <div>
                    <label htmlFor="card-expiry" className="field-label">
                      Expiry
                    </label>
                    <input
                      id="card-expiry"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      className="field num"
                      placeholder="MM/YY"
                      value={card.expiry}
                      onChange={(event) => {
                        const digits = event.target.value.replace(/\D/g, '').slice(0, 4)
                        const next = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
                        setCard({ ...card, expiry: next })
                      }}
                    />
                  </div>
                  <div>
                    <label htmlFor="card-cvv" className="field-label">
                      CVV
                    </label>
                    <input
                      id="card-cvv"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      type="password"
                      className="field num"
                      placeholder="123"
                      maxLength={4}
                      value={card.cvv}
                      onChange={(event) => setCard({ ...card, cvv: event.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                  <div className="flex items-end pb-0.5">
                    <p className="flex items-center gap-1.5 text-[13px] leading-4 text-faint">
                      <Lock size={11} strokeWidth={1.7} />
                      3-D Secure
                    </p>
                  </div>
                </div>
              ) : null}

              {method === 'upi' ? (
                <div className="max-w-[380px]">
                  <label htmlFor="upi-id" className="field-label">
                    UPI handle
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="upi-id"
                      className="field"
                      placeholder="yourname@okhdfcbank"
                      autoComplete="off"
                      value={upi}
                      onChange={(event) => setUpi(event.target.value)}
                    />
                    <span className="shrink-0 rounded-[4px] bg-sunken px-2 py-1 font-mono text-[13px] tracking-wide text-muted">
                      UPI
                    </span>
                  </div>
                  <p className="mt-1.5 text-[13px] leading-4 text-faint">
                    A collect request goes to the handle. In this demo, fail@upi declines.
                  </p>
                </div>
              ) : null}

              {method === 'wallet' ? (
                <div className="max-w-[420px] rounded-[6px] bg-raised p-3.5">
                  <p className="text-[13px] leading-4 text-faint">Dabba wallet</p>
                  <p className="num mt-0.5 text-[22px] leading-7 font-semibold">
                    {formatINR(user?.wallet ?? 0)}
                  </p>
                  <p className="mt-1 text-[13px] leading-[18px] text-muted">
                    The amount is held from the wallet now and refunded to it if the order is cancelled
                    before the kitchen starts.
                  </p>
                  {(user?.wallet ?? 0) < pricing.total ? (
                    <p className="mt-2 text-[13px] leading-4 text-pill-negative-ink">
                      The wallet is {formatINR(pricing.total - (user?.wallet ?? 0))} short. Choose card
                      or UPI, or top up from the profile.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            {failure ? (
              <div className="mt-4 flex items-start gap-2.5 rounded-[6px] bg-pill-negative-bg px-3.5 py-3" role="alert">
                <XCircle size={16} strokeWidth={1.7} className="mt-0.5 shrink-0 text-pill-negative-ink" />
                <div>
                  <p className="text-[13px] leading-4 font-medium text-pill-negative-ink">
                    The payment did not go through
                  </p>
                  <p className="mt-0.5 text-[13px] leading-[18px] text-pill-negative-ink/85">{failure}</p>
                  <p className="mt-1 text-[13px] leading-4 text-pill-negative-ink/70">
                    Nothing was charged and the basket is untouched.
                  </p>
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={pay}
              disabled={outcome === 'processing'}
              className="btn btn-primary btn-lg mt-4 w-full sm:w-auto sm:min-w-[240px]"
            >
              {outcome === 'processing' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {processingStep || 'Processing'}
                </>
              ) : (
                `Pay ${formatINRPrecise(pricing.total)}`
              )}
            </button>
            <p className="mt-2.5 flex items-center gap-1.5 text-[13px] leading-4 text-faint">
              <ShieldCheck size={12} strokeWidth={1.7} />
              Demo gateway · no card data leaves this browser tab.
            </p>
          </Panel>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Panel className="p-4 sm:p-5">
            <SectionHeading title="This order" meta={cart.kitchenName ?? undefined} />
            <ul className="mt-3 space-y-1.5">
              {cart.lines.map((line) => (
                <li key={line.dishId} className="flex items-start justify-between gap-3 text-[13px] leading-4">
                  <span className="min-w-0 text-muted">
                    <span className="num">{line.qty} × </span>
                    {line.name}
                  </span>
                  <span className="num shrink-0 font-medium">{formatINR(line.price * line.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t border-line pt-3 text-[13px] leading-4">
              {pricing.discount > 0 ? (
                <div className="flex justify-between gap-3 text-pill-positive-ink">
                  <dt>{cart.couponCode}</dt>
                  <dd className="num">−{formatINR(pricing.discount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Delivery</dt>
                <dd className="num">{pricing.deliveryFee ? formatINR(pricing.deliveryFee) : 'Free'}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Packaging</dt>
                <dd className="num">{formatINR(pricing.packaging)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">GST, 5%</dt>
                <dd className="num">{formatINRPrecise(pricing.tax)}</dd>
              </div>
            </dl>
            <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-line pt-3">
              <p className="text-[13px] leading-5 font-semibold">Total</p>
              <p className="num text-[22px] leading-7 font-semibold">{formatINRPrecise(pricing.total)}</p>
            </div>
            <p className="mt-2.5 flex items-start gap-1.5 text-[13px] leading-4 text-faint">
              <CheckCircle2 size={12} strokeWidth={1.7} className="mt-0.5 shrink-0" />
              Arrives in about {formatMinutes(cart.deliveryMinutes || 35)} from the kitchen pass.
            </p>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
