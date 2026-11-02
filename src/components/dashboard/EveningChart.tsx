import { useId } from 'react'
import type { EveningPoint } from '../../lib/analytics'
import { formatINR, formatShortDate } from '../../lib/format'
import { useCharts } from '../../hooks/useCharts'

/** One question: did the evening's takings come in? Tonight is the one coloured bar. */
export function EveningChart({ points }: { points: EveningPoint[] }) {
  const id = useId().replace(/:/g, '')
  const labels = points.map((point) => formatShortDate(point.date.toISOString()))
  const values = points.map((point) => point.takings)
  const total = values.reduce((sum, value) => sum + value, 0)

  const ref = useCharts(
    (charts, node) => {
      charts.bars(node, {
        labels,
        values,
        format: (value) => formatINR(value),
        tickFormat: (value) => (value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)),
        height: 236,
        highlight: points.length - 1,
        xAt: points.map((_, index) => index),
      })
    },
    [labels.join('|'), values.join('|'), id],
  )

  const tonight = points[points.length - 1]
  const prior = points[points.length - 2]

  return (
    <figure className="px-4 pt-3 pb-2 sm:px-5">
      <div ref={ref} className="chart" />
      <figcaption className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-[13px] leading-4 text-faint">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-[1px] bg-hue" aria-hidden="true" />
          {tonight.label}, {formatINR(tonight.takings)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-[1px] bg-[#cfd4d4]" aria-hidden="true" />
          Earlier evenings
        </span>
        <span className="ml-auto">
          {points.length} evenings · {formatINR(total)} total
        </span>
      </figcaption>
      {prior ? (
        <p className="sr-only">
          Tonight {formatINR(tonight.takings)}; {prior.label} {formatINR(prior.takings)}.
        </p>
      ) : null}
    </figure>
  )
}
