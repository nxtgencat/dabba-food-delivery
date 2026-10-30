import { differenceInCalendarDays, format, isToday, isYesterday, parseISO } from 'date-fns'

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const inrPrecise = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const number = new Intl.NumberFormat('en-IN')

export const formatINR = (value: number) => inr.format(value)
export const formatINRPrecise = (value: number) => inrPrecise.format(value)
export const formatNumber = (value: number) => number.format(value)

export const formatClock = (iso: string) => format(parseISO(iso), 'HH:mm')

export const formatDay = (iso: string) => format(parseISO(iso), 'EEE d MMM')

export const formatDate = (iso: string) => format(parseISO(iso), 'd MMM yyyy')

export const formatDateTime = (iso: string) => format(parseISO(iso), "d MMM yyyy, HH:mm")

export const formatRelative = (iso: string): string => {
  const date = parseISO(iso)
  if (isToday(date)) return `Today, ${format(date, 'HH:mm')}`
  if (isYesterday(date)) return `Yesterday, ${format(date, 'HH:mm')}`
  const days = differenceInCalendarDays(new Date(), date)
  if (days > 0 && days < 7) return `${format(date, 'EEEE')}, ${format(date, 'HH:mm')}`
  return format(date, 'd MMM, HH:mm')
}

export const formatShortDate = (iso: string) => {
  const date = parseISO(iso)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'd MMM')
}

export const minutesUntil = (iso: string) => Math.round((parseISO(iso).getTime() - Date.now()) / 60000)

export const formatMinutes = (minutes: number) => {
  if (minutes <= 0) return 'now'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest ? `${hours} h ${rest} min` : `${hours} h`
}

export const plural = (count: number, one: string, many = `${one}s`) =>
  `${count} ${count === 1 ? one : many}`

export const clockToMinutes = (clock: string) => {
  const [h, m] = clock.split(':').map(Number)
  return h * 60 + (m || 0)
}

export const isKitchenOpen = (openTime: string, closeTime: string, now = new Date()) => {
  const minutes = now.getHours() * 60 + now.getMinutes()
  const open = clockToMinutes(openTime)
  const close = clockToMinutes(closeTime)
  if (close > open) return minutes >= open && minutes < close
  return minutes >= open || minutes < close
}

export const formatOpenState = (openTime: string, closeTime: string, now = new Date()) => {
  const open = isKitchenOpen(openTime, closeTime, now)
  return {
    open,
    label: open ? `Open until ${closeTime}` : `Opens ${openTime}`,
  }
}

export const initials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

export const pct = (value: number) => `${Math.round(value * 100)}%`

export const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
