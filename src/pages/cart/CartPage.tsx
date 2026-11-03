import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Minus, Plus, ShoppingBasket, Tag, Trash2, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { PageHeader, Panel, SectionHeading } from '../../components/ui/Page'
import { EmptyState } from '../../components/ui/Feedback'
import { Modal } from '../../components/ui/Modal'
import { DietMark } from '../../components/ui/Status'
import { useCart, useCatalog } from '../../hooks/useApp'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { cartPricing, coupons } from '../../lib/cart'
import { formatINR, formatINRPrecise } from '../../lib/format'
import { cn } from '../../lib/cn'

export function CartPage() {
  useDocumentTitle('Basket')
  const { cart, itemCount, setQty, removeLine, clearCart, applyCoupon, removeCoupon, addLine } = useCart()
  const { kitchens, dishes } = useCatalog()
  const [code, setCode] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)

  const pricing = cartPricing(cart)
  const kitchen = kitchens.find((entry) => entry.id === cart.kitchenId)
  const freeDeliveryAt = 399
  const freeDeliveryLeft = Math.max(0, freeDeliveryAt - pricing.subtotal)
  const popular = useMemo(() => {
    const ranked = [...dishes]
      .filter((dish) => dish.available && dish.reviewCount > 0)
      .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
    const seen = new Set<string>()
    return ranked
      .filter((dish) => {
        if (seen.has(dish.kitchenId)) return false
        seen.add(dish.kitchenId)
        return true
      })
      .slice(0, 3)
  }, [dishes])

  if (!cart.lines.length) {
    return (
      <div className="app-fade">
        <PageHeader
          title="Basket"
          finding="An empty basket. Every order starts at a kitchen, and one basket carries one kitchen."
        />
        <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Panel>
            <EmptyState
              icon={<ShoppingBasket size={26} strokeWidth={1.4} />}
              title="Nothing in the basket yet"
              body="Pick a kitchen and add a dish. The basket is kept on this device, so it is here when you come back."
              action={
                <div className="flex flex-wrap justify-center gap-2">
                  <Link to="/restaurants" className="btn btn-primary">
                    Browse restaurants
                  </Link>
                  <Link to="/menu" className="btn btn-secondary">
                    Open the menu
                  </Link>
                </div>
              }
            />
            {popular.length ? (
              <div className="border-t border-rule px-4 pb-4 sm:px-5">
                <p className="pt-3 text-[13px] leading-4 font-medium">Often ordered tonight</p>
                <ul className="mt-2 divide-y divide-rule">
                  {popular.map((dish) => {
                    const home = kitchens.find((entry) => entry.id === dish.kitchenId)
                    return (
                      <li key={dish.id} className="flex items-center gap-3 py-2.5">
                        <Link to={`/menu/${dish.id}`} className="shrink-0" aria-label={`Open ${dish.name}`}>
                          <img
                            src={dish.image}
                            alt=""
                            width={40}
                            height={40}
                            loading="lazy"
                            className="h-10 w-10 rounded-[4px] object-cover"
                          />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link
                            to={`/menu/${dish.id}`}
                            className="block truncate text-[13px] leading-4 font-medium hover:underline"
                          >
                            {dish.name}
                          </Link>
                          <p className="truncate text-[12px] leading-4 text-faint">
                            {home?.name} · {formatINR(dish.price)}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary shrink-0"
                          onClick={() => {
                            if (home) {
                              addLine(
                                {
                                  dishId: dish.id,
                                  kitchenId: dish.kitchenId,
                                  name: dish.name,
                                  price: dish.price,
                                  image: dish.image,
                                  diet: dish.diet,
                                },
                                home,
                              )
                              toast.success(`${dish.name} added to the basket.`)
                            }
                          }}
                          aria-label={`Add ${dish.name} to the basket`}
                        >
                          Add
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : null}
          </Panel>
          <Panel className="flex h-full flex-col p-4 sm:p-5">
            <h2 className="text-[15px] leading-5 font-semibold">How a basket works</h2>
            <ul className="mt-2.5 space-y-2.5">
              {[
                'One kitchen per basket: dishes share a packing bench and one rider.',
                'The basket survives a reload and a sign-out on this device.',
                'A coupon is checked against the basket total every time a line changes.',
                'Checkout asks for a saved address and never charges a real card.',
              ].map((line) => (
                <li key={line} className="flex gap-2 text-[13px] leading-[18px] text-muted">
                  <span className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-control" aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>

            <h3 className="mt-5 text-[13px] leading-4 font-medium">Before you check out</h3>
            <dl className="mt-2 space-y-2">
              {[
                {
                  q: 'What does delivery cost?',
                  a: 'The kitchen sets its own fee, shown in the summary. FREEBIKE removes it over ₹399.',
                },
                {
                  q: 'Can a coupon be added later?',
                  a: 'Yes: the coupon field stays on this screen and the total updates at once.',
                },
                {
                  q: 'What if a dish sells out?',
                  a: 'The kitchen marks it sold out with a time; a new basket cannot add it.',
                },
              ].map((item) => (
                <div key={item.q}>
                  <dt className="text-[13px] leading-[18px] font-medium">{item.q}</dt>
                  <dd className="text-[13px] leading-[18px] text-muted">{item.a}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-auto flex flex-wrap gap-2 pt-4">
              <Link to="/orders" className="btn btn-secondary btn-sm">
                Live orders
              </Link>
              <Link to="/order-history" className="btn btn-ghost btn-sm">
                Order history
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    )
  }

  const submitCoupon = (event: React.FormEvent) => {
    event.preventDefault()
    const result = applyCoupon(code)
    if (result.ok) setCode('')
  }

  return (
    <div className="app-fade">
      <PageHeader
        title="Basket"
        finding={
          <>
            {itemCount} {itemCount === 1 ? 'dish' : 'dishes'} from{' '}
            <span className="font-medium text-ink">{cart.kitchenName}</span>
            {kitchen ? `, ${kitchen.area}` : ''}. The basket stays on this device until you clear it.
          </>
        }
        actions={
          <>
            <Link to="/menu" className="btn btn-secondary">
              Add another dish
            </Link>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setConfirmClear(true)}
            >
              Clear
            </button>
          </>
        }
      />

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_364px]">
        <div className="min-w-0 space-y-3">
          <Panel className="overflow-hidden">
            <header className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4 pb-2 sm:px-5">
              <SectionHeading
                title="From the kitchen"
                meta={kitchen ? `${kitchen.deliveryMinutes} min · ${formatINR(kitchen.deliveryFee)} fee` : undefined}
              />
              {kitchen ? (
                <Link
                  to={`/restaurants/${kitchen.slug}`}
                  className="text-[13px] font-medium text-muted transition-colors hover:text-ink"
                >
                  Kitchen page
                </Link>
              ) : null}
            </header>
            <ul className="px-4 pb-2 sm:px-5">
              {cart.lines.map((line) => (
                <li
                  key={line.dishId}
                  className="flex flex-wrap items-center gap-3 border-t border-rule py-3 first:border-0 sm:flex-nowrap"
                >
                  <Link to={`/menu/${line.dishId}`} className="shrink-0" aria-label={`Open ${line.name}`}>
                    <img
                      src={line.image}
                      alt=""
                      width={56}
                      height={56}
                      loading="lazy"
                      className="h-14 w-14 rounded-[4px] object-cover"
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/menu/${line.dishId}`}
                      className="flex items-center gap-1.5 text-[13px] leading-[18px] font-medium hover:underline"
                    >
                      <DietMark diet={line.diet} />
                      <span className="truncate">{line.name}</span>
                    </Link>
                    <p className="num mt-0.5 text-[13px] leading-4 text-faint">
                      {formatINR(line.price)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setQty(line.dishId, line.qty - 1)}
                      className="grid h-8 w-8 place-items-center rounded-[4px] text-muted shadow-[inset_0_0_0_1px_var(--color-control)] transition-colors hover:bg-raised hover:text-ink"
                      aria-label={
                        line.qty === 1 ? `Remove the last ${line.name}` : `One fewer ${line.name}`
                      }
                    >
                      {line.qty === 1 ? <Trash2 size={13} strokeWidth={1.7} /> : <Minus size={14} strokeWidth={1.8} />}
                    </button>
                    <span className="num w-7 text-center text-[13px] font-medium" aria-live="polite">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(line.dishId, line.qty + 1)}
                      className="grid h-8 w-8 place-items-center rounded-[4px] text-muted shadow-[inset_0_0_0_1px_var(--color-control)] transition-colors hover:bg-raised hover:text-ink"
                      aria-label={`One more ${line.name}`}
                    >
                      <Plus size={14} strokeWidth={1.8} />
                    </button>
                  </div>
                  <p className="num w-16 shrink-0 text-right text-[13px] leading-4 font-semibold">
                    {formatINR(line.price * line.qty)}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      removeLine(line.dishId)
                      toast.success(`${line.name} removed from the basket.`)
                    }}
                    className="grid h-7 w-7 place-items-center rounded-[4px] text-faint transition-colors hover:bg-pill-negative-bg hover:text-pill-negative-ink"
                    aria-label={`Remove ${line.name}`}
                  >
                    <X size={14} strokeWidth={1.8} />
                  </button>
                </li>
              ))}
            </ul>
            {freeDeliveryLeft > 0 ? (
              <div className="mx-4 mb-4 rounded-[6px] bg-raised px-3 py-2 text-[13px] leading-4 text-muted sm:mx-5">
                Add {formatINR(freeDeliveryLeft)} more and the delivery fee is on us. The FREEBIKE
                coupon applies the change at checkout.
              </div>
            ) : null}
          </Panel>

          <Panel className="p-4 sm:p-5">
            <SectionHeading title="Coupons" meta="one code per basket" />
            {cart.couponCode ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[6px] bg-pill-positive-bg px-3 py-2.5">
                <div>
                  <p className="flex items-center gap-1.5 text-[13px] leading-4 font-medium text-pill-positive-ink">
                    <Tag size={13} strokeWidth={1.7} />
                    {cart.couponCode}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-4 text-pill-positive-ink/80">
                    {pricing.discount > 0
                      ? `${formatINR(pricing.discount)} off the basket`
                      : 'The delivery fee is removed at checkout'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    removeCoupon()
                    toast.success('Coupon removed.')
                  }}
                  className="btn btn-sm btn-secondary bg-transparent"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={submitCoupon} className="mt-3 flex gap-2">
                <input
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  placeholder="Coupon code"
                  className="field font-mono text-[13px] tracking-wide"
                  aria-label="Coupon code"
                  autoComplete="off"
                />
                <button type="submit" className="btn btn-secondary shrink-0" disabled={!code.trim()}>
                  Apply
                </button>
              </form>
            )}
            <ul className="mt-3 grid gap-1.5 sm:grid-cols-3">
              {coupons.map((coupon) => (
                <li key={coupon.code} className="rounded-[6px] border border-rule px-3 py-2">
                  <p className="font-mono text-[13px] leading-4 font-medium tracking-wide">
                    {coupon.code}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-4 text-muted">{coupon.title}</p>
                  <p className="mt-0.5 text-[13px] leading-4 text-faint">
                    From {formatINR(coupon.minSubtotal)}
                  </p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Panel className="p-4 sm:p-5">
            <SectionHeading title="Order summary" meta={`${itemCount} ${itemCount === 1 ? 'dish' : 'dishes'}`} />
            <dl className="mt-3 space-y-2 text-[13px] leading-[18px]">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Subtotal</dt>
                <dd className="num font-medium">{formatINR(pricing.subtotal)}</dd>
              </div>
              {pricing.discount > 0 ? (
                <div className="flex justify-between gap-3 text-pill-positive-ink">
                  <dt>Coupon {cart.couponCode}</dt>
                  <dd className="num font-medium">−{formatINR(pricing.discount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Delivery</dt>
                <dd className="num font-medium">
                  {pricing.deliveryFee ? formatINR(pricing.deliveryFee) : 'Free'}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Packaging</dt>
                <dd className="num font-medium">{formatINR(pricing.packaging)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">GST, 5%</dt>
                <dd className="num font-medium">{formatINRPrecise(pricing.tax)}</dd>
              </div>
            </dl>
            <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-line pt-3">
              <p className="text-[13px] leading-5 font-semibold">To pay</p>
              <p className="num text-[22px] leading-7 font-semibold">{formatINRPrecise(pricing.total)}</p>
            </div>
            <Link to="/checkout" className="btn btn-primary btn-lg mt-4 w-full">
              Continue to checkout
              <ArrowRight size={16} strokeWidth={1.8} />
            </Link>
            <p className="mt-2.5 text-[13px] leading-4 text-faint">
              No payment is taken in this demonstration. The next screen collects the delivery address
              and the payment method.
            </p>
          </Panel>

          {kitchen ? (
            <Panel className="mt-3 p-4">
              <p className="text-[13px] leading-4 font-medium">{cart.kitchenName}</p>
              <p className="mt-1 text-[13px] leading-4 text-faint">{kitchen.address}</p>
              <p className="mt-1.5 text-[13px] leading-4 text-muted">
                Delivery estimate {kitchen.deliveryMinutes} minutes from the kitchen pass.
              </p>
            </Panel>
          ) : null}
        </aside>
      </div>

      {confirmClear ? (
        <Modal
          open
          onClose={() => setConfirmClear(false)}
          title="Clear the basket?"
          description={`${itemCount} ${itemCount === 1 ? 'dish' : 'dishes'} from ${cart.kitchenName} will be removed. This cannot be undone.`}
          size="sm"
          footer={
            <>
              <button type="button" className="btn btn-secondary" onClick={() => setConfirmClear(false)}>
                Keep it
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  clearCart()
                  setConfirmClear(false)
                  toast.success('Basket cleared.')
                }}
              >
                Clear the basket
              </button>
            </>
          }
        >
          <p className="text-[13px] leading-[18px] text-muted">
            The menu and your past orders are untouched. Cleared baskets do not appear in the order
            history.
          </p>
        </Modal>
      ) : null}

      <div className={cn('mt-3', 'lg:hidden')}>
        <p className="text-[13px] leading-4 text-faint">
          Basket totals include packaging and a 5% GST line, exactly as they will read at checkout.
        </p>
      </div>
    </div>
  )
}
