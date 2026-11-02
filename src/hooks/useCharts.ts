import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    Charts?: ChartsApi
  }
}

interface ChartBase {
  labels: string[]
  format?: (value: number) => string
  tickFormat?: (value: number) => string
  height?: number
  annotations?: { at?: number; from?: number; to?: number; label: string; short?: string }[]
  reference?: { value: number; label?: string } | { value: number; label?: string }[]
  xAt?: number[]
}

interface LineOptions extends ChartBase {
  series: { name: string; values: (number | null)[]; colour?: string; dash?: boolean }[]
  fill?: boolean
  min?: number
  max?: number
  step?: boolean
  today?: number | null
  todayLabel?: string
  endLabel?: boolean
  yTicks?: number[]
  legend?: HTMLElement | string | null
}

interface BarsOptions extends ChartBase {
  values: number[]
  highlight?: number | number[] | null
  dim?: number[]
  colour?: string
  mutedColour?: string
}

interface TimeStripRow {
  label: string
  sub?: string
  value?: string
  note?: string
  at?: string
  compare?: string
}

interface TimeStripOptions {
  open?: string
  close?: string
  step?: number
  todayLabel?: string
  compareLabel?: string | null
  labelWidth?: number
  valueWidth?: number
  rowHeight?: number
  legend?: HTMLElement | string | null
}

interface ChartsApi {
  line: (el: HTMLElement, options: LineOptions) => { legend?: HTMLElement | null }
  bars: (el: HTMLElement, options: BarsOptions) => void
  timeStrip: (
    el: HTMLElement,
    rows: TimeStripRow[],
    options?: TimeStripOptions,
  ) => { svg: SVGSVGElement | null; legend?: HTMLElement | null }
  fmt: {
    int: (value: number) => string
    dec: (digits: number) => (value: number) => string
    pct: (digits?: number) => (value: number) => string
    money: (currency?: string, digits?: number) => (value: number) => string
    compact: (value: number) => string
    signed: (format?: (value: number) => string) => (value: number) => string
    clock: (minutes: number) => string
  }
}

/** The chart helpers live in a plain script (src/lib/charts.js) and draw into the returned ref.
 *  The draw waits for the self-hosted face so text widths are measured on the real font, and
 *  runs again if the element changes width. It never animates on its own: the charts are data,
 *  and a reduced-motion reader gets the same picture without motion. */
export function useCharts(
  draw: (charts: ChartsApi, node: HTMLElement) => void,
  deps: unknown[],
) {
  const ref = useRef<HTMLDivElement | null>(null)
  const callback = useRef(draw)
  callback.current = draw

  useEffect(() => {
    const node = ref.current
    const charts = window.Charts
    if (!node || !charts) return
    let cancelled = false
    let width = node.clientWidth

    const run = () => {
      if (cancelled) return
      callback.current(charts, node)
    }

    if (document.fonts?.status === 'loaded') run()
    else document.fonts?.ready.then(run).catch(run)

    const observer =
      'ResizeObserver' in window
        ? new ResizeObserver(() => {
            if (Math.abs(node.clientWidth - width) < 6) return
            width = node.clientWidth
            // Redraw on the next frame: a synchronous redraw inside the observer
            // callback can enqueue another resize and trip the loop warning.
            window.requestAnimationFrame(run)
          })
        : null
    observer?.observe(node)

    return () => {
      cancelled = true
      observer?.disconnect()
      node.innerHTML = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}

export type { ChartsApi, LineOptions, BarsOptions, TimeStripRow, TimeStripOptions }
