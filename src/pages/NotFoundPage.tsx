import { Link } from 'react-router-dom'
import { ArrowLeft, Search } from 'lucide-react'
import { TiffinMark } from '../components/brand/TiffinMark'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export function NotFoundPage() {
  useDocumentTitle('Not found')
  return (
    <div className="app-fade">
      <div className="mx-auto max-w-[560px] pt-4">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-surface shadow-[inset_0_0_0_1px_var(--color-line)]">
          <TiffinMark size={24} />
        </span>
        <h1 className="mt-4 text-[24px] leading-8 font-semibold tracking-[-0.02em]">This table is not set</h1>
        <p className="mt-1.5 max-w-[52ch] text-[13px] leading-5 text-muted">
          The address does not match a screen. Every destination in the service is one click away.
        </p>
        <Link to="/" className="btn btn-primary mt-4">
          <ArrowLeft size={15} strokeWidth={1.7} />
          Back to the overview
        </Link>
      </div>

      <section className="mt-6">
        <h2 className="text-[15px] leading-5 font-semibold">Where the service lives</h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { to: '/', label: 'The dinner overview', note: 'Tonight’s board, takings and sell-outs' },
            { to: '/restaurants', label: 'Restaurants', note: 'Seven kitchens and their menus' },
            { to: '/menu', label: 'The menu', note: 'Every dish, filterable by kitchen and diet' },
            { to: '/orders', label: 'Live orders', note: 'Advance a stage or open a receipt' },
            { to: '/order-history', label: 'Order history', note: 'Receipts, filters and reorders' },
            { to: '/customers', label: 'Customers', note: 'Repeat guests and their addresses' },
            { to: '/profile', label: 'Profile & settings', note: 'Addresses, wallet and password' },
            { to: '/cart', label: 'The basket', note: 'The current order, if there is one' },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="card-pressable flex flex-col rounded-[6px] bg-surface px-3.5 py-3 shadow-[inset_0_0_0_1px_var(--color-line)]"
            >
              <span className="flex items-center gap-1.5 text-[13px] leading-4 font-medium">
                <Search size={13} strokeWidth={1.6} className="text-muted" />
                {link.label}
              </span>
              <span className="mt-0.5 text-[12px] leading-4 text-faint">{link.note}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
