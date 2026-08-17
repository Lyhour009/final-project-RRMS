import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback
}

const KHMER_MONTHS = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
]

// `Intl.DateTimeFormat`/`toLocaleDateString("km-KH", ...)` renders correctly
// in a plain Node process but produces English on this Next.js version's
// Turbopack dev SSR path while the browser renders Khmer — a server/client
// mismatch that breaks hydration. Formatting Khmer dates by hand sidesteps
// runtime ICU/locale data entirely, so server and client always agree.
export function formatKhmerDate(
  value?: string | null,
  options?: { withDay?: boolean },
) {
  if (!value) return "-"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  const month = KHMER_MONTHS[date.getUTCMonth()]
  const year = date.getUTCFullYear()

  if (options?.withDay) {
    return `${date.getUTCDate()} ${month} ${year}`
  }

  return `${month} ${year}`
}

// Bills are stored with a full date (e.g. "2026-08-01") but only the
// year-month is meaningful for a billing period, so this trims to "2026-08".
export function formatBillingMonth(value?: string | null) {
  if (!value) return "-"
  return String(value).slice(0, 7)
}
