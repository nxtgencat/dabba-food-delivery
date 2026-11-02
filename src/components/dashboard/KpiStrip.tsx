import { cn } from '../../lib/cn'

export interface KpiCell {
  label: string
  value: string
  unit?: string
  note?: string
  /** True while the value's own source is still being fetched, so the cell keeps
   *  its final size with a flat bar instead of a dash that reads as "no data". */
  pending?: boolean
}

/** One divided container, label over value: the studied screens' default for headline numbers.
 *  The dividers are a 1px gap in the container's line colour, so any cell count lands level. */
export function KpiStrip({
  cells,
  className,
}: {
  cells: KpiCell[]
  className?: string
}) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-px overflow-hidden rounded-[8px] bg-line p-px sm:grid-cols-4',
        className,
      )}
    >
      {cells.map((cell, index) => (
        <div key={cell.label} className="min-w-0 bg-surface px-4 py-3.5">
          <p className="truncate text-[13px] leading-4 text-muted">{cell.label}</p>
          {cell.pending ? (
            <div className="skeleton mt-2 h-6 w-14" aria-hidden="true" />
          ) : (
            <p
              className={cn(
                'num mt-1 truncate leading-7 font-medium tracking-[-0.01em]',
                index === 0 ? 'text-[30px]' : 'text-[20px]',
              )}
            >
              {cell.value}
              {cell.unit ? (
                <span className="ml-1 text-[13px] font-normal text-muted">{cell.unit}</span>
              ) : null}
            </p>
          )}
          {cell.note ? (
            <p className="mt-0.5 truncate text-[12px] leading-4 text-faint">{cell.note}</p>
          ) : null}
        </div>
      ))}
    </div>
  )
}
