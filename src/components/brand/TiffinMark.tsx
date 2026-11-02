import { cn } from '../../lib/cn'

/** The mark is the tiffin itself: three tiers, drawn as steel strokes. */
export function TiffinMark({ className, size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={cn('shrink-0', className)}
      role="img"
      aria-label="Dabba"
      fill="none"
    >
      <rect x="6" y="4.5" width="20" height="4.5" rx="2.25" stroke="currentColor" strokeWidth="1.7" />
      <rect x="4.5" y="11" width="23" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.7" />
      <rect x="6" y="19" width="20" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.7" />
      <path d="M16 4.5V2.2M11.5 27v2.4M20.5 27v2.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <TiffinMark size={compact ? 24 : 26} />
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-[-0.01em]">dabba</span>
        {!compact ? (
          <span className="mt-0.5 text-[11px] leading-3 text-faint">Dinner service</span>
        ) : null}
      </span>
    </span>
  )
}
