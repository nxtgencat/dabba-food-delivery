import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const widths = {
  sm: 'max-w-[420px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
}

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  const panel = useRef<HTMLDivElement | null>(null)
  const restore = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    restore.current = document.activeElement as HTMLElement | null
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onClose()
      }
      if (event.key !== 'Tab' || !panel.current) return
      const focusable = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => {
      panel.current?.querySelector<HTMLElement>('input, select, textarea, button')?.focus()
    }, 40)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
      restore.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-[rgb(17_19_19/0.38)]"
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
        className={cn(
          'modal-enter relative flex max-h-[92svh] w-full flex-col rounded-t-[10px] bg-surface sm:rounded-[8px]',
          widths[size],
        )}
      >
        <header className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 sm:px-6 sm:pt-6">
          <div>
            <h2 id="modal-title" className="text-[17px] leading-6 font-semibold">
              {title}
            </h2>
            {description ? (
              <p id="modal-description" className="mt-1 text-[13px] leading-5 text-muted">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost -mt-1 -mr-2 h-8 w-8 shrink-0 rounded-[6px] p-0"
            aria-label="Close"
          >
            <X size={16} strokeWidth={1.6} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6">{children}</div>
        {footer ? (
          <footer className="flex flex-wrap items-center justify-end gap-2 rounded-b-[8px] bg-raised px-5 py-3.5 sm:px-6">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
