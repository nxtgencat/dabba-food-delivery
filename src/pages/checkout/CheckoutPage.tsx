import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, ArrowRight, MapPin, ShoppingBasket, Truck } from 'lucide-react'
import { toast } from 'react-toastify'
import { PageHeader, Panel, SectionHeading } from '../../components/ui/Page'
import { EmptyState } from '../../components/ui/Feedback'
import { Modal } from '../../components/ui/Modal'
import { DietMark, Pill } from '../../components/ui/Status'
import { useAuth, useCart, useCatalog } from '../../hooks/useApp'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { cartPricing } from '../../lib/cart'
import { formatINR, formatINRPrecise } from '../../lib/format'
import type { Address } from '../../types'
import { cn } from '../../lib/cn'

interface ContactFields {
  name: string
  phone: string
  note: string
}

export interface CheckoutDraft {
  address: Address
  contact: ContactFields
}

const draftKey = 'dabba.v1.checkout-draft'

function readDraft(): CheckoutDraft | null {
  try {
    const raw = window.localStorage.getItem(draftKey)
    return raw ? (JSON.parse(raw) as CheckoutDraft) : null
  } catch {
    return null
  }
}

export function CheckoutPage() {
  useDocumentTitle('Checkout')
  const { cart, itemCount } = useCart()
  const { user, addAddress } = useAuth()
  const { kitchens } = useCatalog()
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pricing = cartPricing(cart)
  const kitchen = kitchens.find((entry) => entry.id === cart.kitchenId)
  const addresses = user?.addresses ?? []
  const draft = useMemo(() => readDraft(), [])
  const selected =
    addresses.find((address) => address.id === (selectedId ?? draft?.address.id ?? '')) ??
    addresses.find((address) => address.isDefault) ??
    addresses[0] ??
    null

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFields>({
    defaultValues: {
      name: draft?.contact.name ?? user?.name ?? '',
      phone: draft?.contact.phone ?? user?.phone ?? '',
      note: draft?.contact.note ?? '',
    },
    mode: 'onBlur',
  })
  useEffect(() => {
    reset({
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      note: draft?.contact.note ?? '',
    })
  }, [user?.name, user?.phone, reset, draft?.contact.note])

  if (!cart.lines.length) {
    return (
      <div className="app-fade">
        <PageHeader title="Checkout" finding="An empty basket cannot be checked out." />
        <Panel>
          <EmptyState
            icon={<ShoppingBasket size={26} strokeWidth={1.4} />}
            title="There is nothing to pay for"
            body="A checkout needs at least one dish. Add something from a kitchen and the address step opens with it."
            action={
              <Link to="/restaurants" className="btn btn-primary">
                Choose a kitchen
              </Link>
            }
          />
        </Panel>
      </div>
    )
  }

  const onContinue = (contact: ContactFields) => {
    if (!selected) {
      setError('Choose a delivery address before continuing.')
      toast.error('A delivery address is needed.')
      return
    }
    setError(null)
    const payload: CheckoutDraft = { address: selected, contact }
    window.localStorage.setItem(draftKey, JSON.stringify(payload))
    navigate('/checkout/payment')
  }

  return (
    <div className="app-fade">
      <PageHeader
        title="Checkout"
        finding={
          <>
            The basket is packed by{' '}
            <span className="font-medium text-ink">{cart.kitchenName}</span>. Confirm where it is going
            and who receives it.
          </>
        }
        actions={
          <Link to="/cart" className="btn btn-secondary">
            <ArrowLeft size={15} strokeWidth={1.7} />
            Back to the basket
          </Link>
        }
      />

      <form onSubmit={handleSubmit(onContinue)} noValidate>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_364px]">
          <div className="min-w-0 space-y-3">
            <Panel className="p-4 sm:p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <SectionHeading title="Deliver to" meta={`${addresses.length} saved`} />
                <Link
                  to="/profile"
                  className="text-[13px] font-medium text-muted transition-colors hover:text-ink"
                >
                  Manage addresses
                </Link>
              </div>

              {addresses.length ? (
                <fieldset className="mt-3 grid gap-2 sm:grid-cols-2">
                  <legend className="sr-only">Delivery address</legend>
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={cn(
                        'flex cursor-pointer items-start gap-2.5 rounded-[6px] p-3 transition-colors',
                        selected?.id === address.id
                          ? 'bg-active shadow-[inset_0_0_0_1px_var(--color-ink)]'
                          : 'bg-surface shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-raised',
                      )}
                    >
                      <input
                        type="radio"
                        name="delivery-address"
                        value={address.id}
                        checked={selected?.id === address.id}
                        onChange={() => {
                          setSelectedId(address.id)
                          setError(null)
                        }}
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[var(--color-ink)]"
                      />
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5">
                          <span className="text-[13px] leading-4 font-medium">{address.label}</span>
                          {address.isDefault ? <Pill tone="neutral">Default</Pill> : null}
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-4 text-muted">
                          {address.line1}
                          {address.line2 ? `, ${address.line2}` : ''}
                        </span>
                        <span className="block text-[13px] leading-4 text-faint">
                          {address.area}, {address.city} {address.pincode}
                        </span>
                      </span>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAdding(true)}
                    className="flex min-h-[84px] items-center justify-center gap-1.5 rounded-[6px] border border-dashed border-control text-[13px] font-medium text-muted transition-colors hover:bg-raised hover:text-ink"
                  >
                    <MapPin size={14} strokeWidth={1.6} />
                    Add an address
                  </button>
                </fieldset>
              ) : (
                <div className="mt-3 rounded-[6px] bg-raised px-3 py-4">
                  <p className="text-[13px] leading-5 font-medium">No address saved yet</p>
                  <p className="mt-1 text-[13px] leading-[18px] text-muted">
                    A delivery needs a street address and a contact number. Add one here, or on the
                    profile screen.
                  </p>
                  <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={() => setAdding(true)}>
                    Add the first address
                  </button>
                </div>
              )}
              {error ? (
                <p className="field-error" role="alert">
                  {error}
                </p>
              ) : null}
            </Panel>

            <Panel className="p-4 sm:p-5">
              <SectionHeading title="Who receives it" meta="the rider calls this number" />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="contact-name" className="field-label">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    className="field"
                    autoComplete="name"
                    aria-invalid={Boolean(errors.name)}
                    {...register('name', {
                      required: 'The rider needs a name at the door.',
                      minLength: { value: 2, message: 'Use at least two characters.' },
                    })}
                  />
                  {errors.name ? (
                    <p className="field-error" role="alert">
                      {errors.name.message}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label htmlFor="contact-phone" className="field-label">
                    Mobile
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    className="field"
                    autoComplete="tel"
                    aria-invalid={Boolean(errors.phone)}
                    {...register('phone', {
                      required: 'A mobile number is needed for the call.',
                      pattern: {
                        value: /^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/,
                        message: 'Use a 10-digit Indian mobile number.',
                      },
                    })}
                  />
                  {errors.phone ? (
                    <p className="field-error" role="alert">
                      {errors.phone.message}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="mt-3">
                <label htmlFor="contact-note" className="field-label">
                  Note for the kitchen or rider (optional)
                </label>
                <input
                  id="contact-note"
                  className="field"
                  placeholder="Ring the bell twice; leave at the door."
                  {...register('note', { maxLength: { value: 140, message: 'Keep it under 140 characters.' } })}
                />
                {errors.note ? <p className="field-error">{errors.note.message}</p> : null}
              </div>
            </Panel>

            <Panel className="p-4 sm:p-5">
              <SectionHeading title="In the tiffin" meta={`${itemCount} ${itemCount === 1 ? 'dish' : 'dishes'}`} />
              <ul className="mt-3 divide-y divide-rule">
                {cart.lines.map((line) => (
                  <li key={line.dishId} className="flex items-center gap-3 py-2 first:pt-0 last:pb-0">
                    <img
                      src={line.image}
                      alt=""
                      width={36}
                      height={36}
                      loading="lazy"
                      className="h-9 w-9 rounded-[3px] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-[13px] leading-4 font-medium">
                        <DietMark diet={line.diet} />
                        <span className="truncate">{line.name}</span>
                      </p>
                      <p className="num text-[13px] leading-4 text-faint">
                        {line.qty} × {formatINR(line.price)}
                      </p>
                    </div>
                    <p className="num text-[13px] leading-4 font-medium">
                      {formatINR(line.price * line.qty)}
                    </p>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <Panel className="p-4 sm:p-5">
              <SectionHeading title="Payment summary" />
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
              <button type="submit" className="btn btn-primary btn-lg mt-4 w-full">
                Continue to payment
                <ArrowRight size={16} strokeWidth={1.8} />
              </button>
              <p className="mt-2.5 flex items-start gap-1.5 text-[13px] leading-4 text-faint">
                <Truck size={12} strokeWidth={1.6} className="mt-0.5 shrink-0" />
                {kitchen
                  ? `${kitchen.name} promises ${kitchen.deliveryMinutes} minutes from the kitchen pass.`
                  : 'The promised time is set when the order is placed.'}
              </p>
            </Panel>
          </aside>
        </div>
      </form>

      <AddressDialog
        open={adding}
        onClose={() => setAdding(false)}
        onSave={(address) => {
          addAddress(address)
          setSelectedId(null)
          setAdding(false)
          toast.success('Address saved to the profile.')
        }}
      />
    </div>
  )
}

function AddressDialog({
  open,
  onClose,
  onSave,
}: {
  open: boolean
  onClose: () => void
  onSave: (address: Omit<Address, 'id'>) => void
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Omit<Address, 'id'>>({
    defaultValues: {
      label: 'Home',
      line1: '',
      line2: '',
      area: '',
      city: 'Mumbai',
      pincode: '',
      isDefault: false,
    },
  })

  const submit = (values: Omit<Address, 'id'>) => {
    onSave(values)
    reset()
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        reset()
        onClose()
      }}
      title="Add a delivery address"
      description="Saved to the profile, so it is offered at every checkout."
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              reset()
              onClose()
            }}
          >
            Cancel
          </button>
          <button type="submit" form="address-form" className="btn btn-primary">
            Save the address
          </button>
        </>
      }
    >
      <form id="address-form" onSubmit={handleSubmit(submit)} noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="addr-label" className="field-label">
              Label
            </label>
            <input id="addr-label" className="field" {...register('label', { required: true })} />
          </div>
          <div>
            <label htmlFor="addr-pincode" className="field-label">
              PIN code
            </label>
            <input
              id="addr-pincode"
              inputMode="numeric"
              className="field num"
              aria-invalid={Boolean(errors.pincode)}
              {...register('pincode', {
                required: 'A PIN code is needed.',
                pattern: { value: /^[1-9]\d{5}$/, message: 'Use the 6-digit PIN code.' },
              })}
            />
            {errors.pincode ? (
              <p className="field-error" role="alert">
                {errors.pincode.message}
              </p>
            ) : null}
          </div>
        </div>
        <div className="mt-3">
          <label htmlFor="addr-line1" className="field-label">
            Building, flat and street
          </label>
          <input
            id="addr-line1"
            className="field"
            aria-invalid={Boolean(errors.line1)}
            {...register('line1', { required: 'A street address is needed.' })}
          />
          {errors.line1 ? (
            <p className="field-error" role="alert">
              {errors.line1.message}
            </p>
          ) : null}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="addr-area" className="field-label">
              Area
            </label>
            <input
              id="addr-area"
              className="field"
              aria-invalid={Boolean(errors.area)}
              {...register('area', { required: 'Name the neighbourhood.' })}
            />
            {errors.area ? (
              <p className="field-error" role="alert">
                {errors.area.message}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="addr-city" className="field-label">
              City
            </label>
            <input id="addr-city" className="field" {...register('city', { required: true })} />
          </div>
        </div>
        <label className="mt-3 flex cursor-pointer items-center gap-2 text-[13px] text-muted">
          <input type="checkbox" className="h-3.5 w-3.5 accent-[var(--color-ink)]" {...register('isDefault')} />
          Make this the default address
        </label>
      </form>
    </Modal>
  )
}
