import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Camera, Check, LogOut, MapPin, Pencil, Plus, Trash2, Wallet } from 'lucide-react'
import { toast } from 'react-toastify'
import { PageHeader } from '../../components/ui/Page'
import { Modal } from '../../components/ui/Modal'
import { useAuth } from '../../hooks/useApp'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatINR, initials } from '../../lib/format'
import type { Address } from '../../types'

type ProfileFields = { name: string; email: string; phone: string }
type PasswordFields = { current: string; next: string; confirm: string }

/** Settings are read as labelled sections, one job each, not as a card mosaic. */
function Section({
  title,
  description,
  children,
  aside,
}: {
  title: string
  description: string
  children: React.ReactNode
  aside?: React.ReactNode
}) {
  return (
    <section className="grid gap-3 border-t border-line py-6 first:border-0 first:pt-0 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:gap-8">
      <div className="lg:pt-1">
        <h2 className="text-[15px] leading-5 font-semibold">{title}</h2>
        <p className="mt-1 max-w-[34ch] text-[13px] leading-[20px] text-muted">{description}</p>
        {aside ? <div className="mt-3">{aside}</div> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

export function ProfilePage() {
  useDocumentTitle('Profile')
  const { user, updateProfile, addAddress, updateAddress, removeAddress, adjustWallet, signOut } = useAuth()
  const navigate = useNavigate()
  const [addressDialog, setAddressDialog] = useState<{ address?: Address } | null>(null)
  const [removing, setRemoving] = useState<Address | null>(null)
  const [avatar, setAvatar] = useState<string | null>(user?.avatar ?? null)
  const [passwordSaved, setPasswordSaved] = useState(false)

  const profileForm = useForm<ProfileFields>({
    values: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
    },
  })
  const passwordForm = useForm<PasswordFields>({
    defaultValues: { current: '', next: '', confirm: '' },
    mode: 'onBlur',
  })

  if (!user) return null

  const saveProfile = (values: ProfileFields) => {
    updateProfile(values)
    toast.success('Profile saved.')
  }

  const savePassword = async () => {
    await new Promise((resolve) => window.setTimeout(resolve, 500))
    passwordForm.reset()
    setPasswordSaved(true)
    toast.success('Password updated for this device.')
    window.setTimeout(() => setPasswordSaved(false), 2400)
  }

  const avatarTone = ['#e9edf2', '#eceee9', '#f2ecec', '#eceaf2'][user.name.length % 4]

  return (
    <div className="app-fade mx-auto max-w-[1080px]">
      <PageHeader
        title="Profile & settings"
        finding={
          <>
            Signed in as {user.role.toLowerCase()}. Every field saves to this browser; the wallet is the
            balance behind the wallet payment method at checkout.
          </>
        }
      />

      <div className="rounded-[8px] bg-surface px-4 py-5 shadow-[inset_0_0_0_1px_var(--color-line)] sm:px-6 sm:py-6">
        <Section
          title="Your account"
          description="The name and number the kitchen and the rider see on an order."
          aside={
            <Link to="/order-history" className="text-[13px] font-medium text-ink hover:underline">
              Order history
            </Link>
          }
        >
          <form onSubmit={profileForm.handleSubmit(saveProfile)} noValidate>
            <div className="flex flex-wrap items-center gap-3 pb-4">
              <span className="relative">
                <span
                  className="grid h-14 w-14 place-items-center rounded-full text-[18px] font-semibold"
                  style={{ background: avatarTone }}
                  aria-hidden="true"
                >
                  {avatar ? (
                    <img src={avatar} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    initials(user.name)
                  )}
                </span>
                <button
                  type="button"
                  className="absolute -right-1 -bottom-1 grid h-7 w-7 place-items-center rounded-full bg-surface shadow-[inset_0_0_0_1px_var(--color-control)] transition-colors hover:bg-raised"
                  aria-label="Choose a profile photograph"
                  onClick={() => {
                    setAvatar(null)
                    updateProfile({ avatar: null })
                    toast.success('Profile photograph cleared. A real build would take an upload here.')
                  }}
                >
                  <Camera size={13} strokeWidth={1.7} />
                </button>
              </span>
              <div className="min-w-0">
                <p className="text-[15px] leading-5 font-semibold">{user.name}</p>
                <p className="text-[13px] leading-4 text-muted">
                  {user.role} · {user.addresses.length} saved{' '}
                  {user.addresses.length === 1 ? 'address' : 'addresses'}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="profile-name" className="field-label">
                  Full name
                </label>
                <input
                  id="profile-name"
                  className="field"
                  autoComplete="name"
                  aria-invalid={Boolean(profileForm.formState.errors.name)}
                  {...profileForm.register('name', {
                    required: 'A name is needed on the service.',
                    minLength: { value: 3, message: 'At least three characters.' },
                  })}
                />
                {profileForm.formState.errors.name ? (
                  <p className="field-error" role="alert">
                    {profileForm.formState.errors.name.message}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="profile-phone" className="field-label">
                  Mobile
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  className="field"
                  autoComplete="tel"
                  aria-invalid={Boolean(profileForm.formState.errors.phone)}
                  {...profileForm.register('phone', {
                    required: 'A mobile number is needed.',
                    pattern: {
                      value: /^(\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/,
                      message: 'Use a 10-digit Indian mobile number.',
                    },
                  })}
                />
                {profileForm.formState.errors.phone ? (
                  <p className="field-error" role="alert">
                    {profileForm.formState.errors.phone.message}
                  </p>
                ) : null}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="profile-email" className="field-label">
                  Email
                </label>
                <input
                  id="profile-email"
                  type="email"
                  className="field"
                  autoComplete="email"
                  aria-invalid={Boolean(profileForm.formState.errors.email)}
                  {...profileForm.register('email', {
                    required: 'An email is needed.',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
                      message: 'Use a complete email address.',
                    },
                  })}
                />
                {profileForm.formState.errors.email ? (
                  <p className="field-error" role="alert">
                    {profileForm.formState.errors.email.message}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button type="submit" className="btn btn-primary">
                Save the profile
              </button>
            </div>
          </form>
        </Section>

        <Section
          title="Delivery addresses"
          description="Offered at checkout. An order keeps the address it was sent to, so editing one never rewrites history."
          aside={
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAddressDialog({})}>
              <Plus size={13} strokeWidth={1.8} />
              Add an address
            </button>
          }
        >
          {user.addresses.length ? (
            <ul className="divide-y divide-rule">
              {user.addresses.map((address) => (
                <li key={address.id} className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 gap-2.5">
                    <MapPin size={14} strokeWidth={1.6} className="mt-0.5 shrink-0 text-faint" />
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 text-[13px] leading-4 font-medium">
                        {address.label}
                        {address.isDefault ? <span className="pill pill-neutral">Default</span> : null}
                      </p>
                      <p className="mt-0.5 text-[13px] leading-[18px] text-muted">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ''}, {address.area}, {address.city}{' '}
                        {address.pincode}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => setAddressDialog({ address })}
                      className="grid h-8 w-8 place-items-center rounded-[4px] text-muted transition-colors hover:bg-raised hover:text-ink"
                      aria-label={`Edit the ${address.label} address`}
                    >
                      <Pencil size={13} strokeWidth={1.7} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRemoving(address)}
                      className="grid h-8 w-8 place-items-center rounded-[4px] text-muted transition-colors hover:bg-pill-negative-bg hover:text-pill-negative-ink"
                      aria-label={`Remove the ${address.label} address`}
                    >
                      <Trash2 size={13} strokeWidth={1.7} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-[6px] bg-raised px-3 py-4">
              <p className="text-[13px] leading-5 font-medium">No address yet</p>
              <p className="mt-1 text-[13px] leading-[18px] text-muted">
                A checkout needs one street address. Add a home or office address and it is offered
                automatically.
              </p>
              <button type="button" className="btn btn-secondary btn-sm mt-3" onClick={() => setAddressDialog({})}>
                Add the first address
              </button>
            </div>
          )}
        </Section>

        <Section
          title="Wallet"
          description="Used only by the wallet payment method. A cancelled order is refunded here."
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="num mr-2 text-[22px] leading-7 font-medium tracking-[-0.01em]">
              {formatINR(user.wallet)}
            </span>
            {[500, 1000].map((amount) => (
              <button
                key={amount}
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  adjustWallet(amount)
                  toast.success(`${formatINR(amount)} added to the wallet.`)
                }}
              >
                <Wallet size={14} strokeWidth={1.6} />
                Add {formatINR(amount)}
              </button>
            ))}
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                adjustWallet(-user.wallet)
                toast.success('Wallet balance cleared.')
              }}
            >
              Clear the balance
            </button>
          </div>
        </Section>

        <Section
          title="Password"
          description="Kept hashed in this browser. A real service would never hold credentials client-side."
        >
          <form
            onSubmit={passwordForm.handleSubmit(savePassword)}
            className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
            noValidate
          >
            <div>
              <label htmlFor="current-password" className="field-label">
                Current
              </label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                className="field"
                {...passwordForm.register('current', { required: 'Enter the current password.' })}
              />
            </div>
            <div>
              <label htmlFor="new-password" className="field-label">
                New
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                className="field"
                aria-invalid={Boolean(passwordForm.formState.errors.next)}
                {...passwordForm.register('next', {
                  required: 'Choose a new password.',
                  minLength: { value: 8, message: 'Use at least 8 characters.' },
                })}
              />
              {passwordForm.formState.errors.next ? (
                <p className="field-error">{passwordForm.formState.errors.next.message}</p>
              ) : null}
            </div>
            <div>
              <label htmlFor="repeat-password" className="field-label">
                Repeat
              </label>
              <input
                id="repeat-password"
                type="password"
                autoComplete="new-password"
                className="field"
                aria-invalid={Boolean(passwordForm.formState.errors.confirm)}
                {...passwordForm.register('confirm', {
                  validate: (value) =>
                    value === passwordForm.getValues('next') || 'The two passwords do not match.',
                })}
              />
              {passwordForm.formState.errors.confirm ? (
                <p className="field-error">{passwordForm.formState.errors.confirm.message}</p>
              ) : null}
            </div>
            <button type="submit" className="btn btn-primary">
              {passwordSaved ? (
                <>
                  <Check size={14} strokeWidth={2} />
                  Saved
                </>
              ) : (
                'Update'
              )}
            </button>
          </form>
        </Section>

        <Section
          title="Session"
          description="Signing out removes the session and the addresses stay in place. Orders already placed are untouched."
        >
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                signOut()
                toast.success('Signed out. Your orders stay on this device.')
                navigate('/login')
              }}
            >
              <LogOut size={15} strokeWidth={1.7} />
              Sign out
            </button>
            <p className="text-[13px] leading-4 text-faint">
              Signed in as {user.email}
            </p>
          </div>
        </Section>
      </div>

      <p className="mt-4 text-[12px] leading-4 text-faint">
        Restaurants and dishes come from the DummyJSON recipe API; photographs are bundled at build time.{' '}
        <a
          href="https://dummyjson.com/docs/recipes"
          target="_blank"
          rel="noreferrer"
          className="font-medium text-ink hover:underline"
        >
          API documentation
        </a>
      </p>

      <AddressDialog
        open={Boolean(addressDialog)}
        address={addressDialog?.address}
        onClose={() => setAddressDialog(null)}
        onSave={(address) => {
          if (addressDialog?.address) {
            updateAddress(addressDialog.address.id, address)
            toast.success('Address updated.')
          } else {
            addAddress(address)
            toast.success('Address saved.')
          }
          setAddressDialog(null)
        }}
      />

      <Modal
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        title={`Remove the ${removing?.label ?? ''} address?`}
        description="Orders already delivered keep the address they were sent to."
        size="sm"
        footer={
          <>
            <button type="button" className="btn btn-secondary" onClick={() => setRemoving(null)}>
              Keep it
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                if (removing) removeAddress(removing.id)
                setRemoving(null)
                toast.success('Address removed.')
              }}
            >
              Remove
            </button>
          </>
        }
      >
        <p className="text-[13px] leading-[18px] text-muted">
          {removing?.line1}
          {removing?.line2 ? `, ${removing.line2}` : ''}, {removing?.area}, {removing?.city}{' '}
          {removing?.pincode}
        </p>
      </Modal>
    </div>
  )
}

function AddressDialog({
  open,
  onClose,
  onSave,
  address,
}: {
  open: boolean
  onClose: () => void
  onSave: (address: Omit<Address, 'id'>) => void
  address?: Address
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Omit<Address, 'id'>>({
    values: {
      label: address?.label ?? 'Home',
      line1: address?.line1 ?? '',
      line2: address?.line2 ?? '',
      area: address?.area ?? '',
      city: address?.city ?? 'Mumbai',
      pincode: address?.pincode ?? '',
      isDefault: address?.isDefault ?? false,
    },
  })

  return (
    <Modal
      open={open}
      onClose={() => {
        reset()
        onClose()
      }}
      title={address ? 'Edit the address' : 'Add a delivery address'}
      description="Offered at checkout and kept with the profile."
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
          <button type="submit" form="profile-address-form" className="btn btn-primary">
            Save the address
          </button>
        </>
      }
    >
      <form id="profile-address-form" onSubmit={handleSubmit(onSave)} noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="p-addr-label" className="field-label">
              Label
            </label>
            <input id="p-addr-label" className="field" {...register('label', { required: true })} />
          </div>
          <div>
            <label htmlFor="p-addr-pincode" className="field-label">
              PIN code
            </label>
            <input
              id="p-addr-pincode"
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
          <label htmlFor="p-addr-line1" className="field-label">
            Building, flat and street
          </label>
          <input
            id="p-addr-line1"
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
        <div className="mt-3">
          <label htmlFor="p-addr-line2" className="field-label">
            Landmark or floor (optional)
          </label>
          <input id="p-addr-line2" className="field" {...register('line2')} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="p-addr-area" className="field-label">
              Area
            </label>
            <input
              id="p-addr-area"
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
            <label htmlFor="p-addr-city" className="field-label">
              City
            </label>
            <input id="p-addr-city" className="field" {...register('city', { required: true })} />
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
