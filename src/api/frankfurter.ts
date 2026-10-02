const API_BASE = 'https://api.frankfurter.app'

export type CurrencyMap = Record<string, string>

export interface RatesResponse {
  amount: number
  base: string
  date: string
  rates: Record<string, number>
}

export interface TimeseriesResponse {
  amount: number
  base: string
  start_date: string
  end_date: string
  rates: Record<string, Record<string, number>>
}

/** INR per 1 unit of foreign currency */
export type InrRates = Record<string, number>

export async function fetchCurrencies(): Promise<CurrencyMap> {
  const res = await fetch(`${API_BASE}/currencies`)
  if (!res.ok) throw new Error('Could not load currency list')
  return res.json()
}

function invertToInrPerUnit(ratesFromInr: Record<string, number>): InrRates {
  const out: InrRates = {}
  for (const [code, foreignPerInr] of Object.entries(ratesFromInr)) {
    if (foreignPerInr > 0) out[code] = 1 / foreignPerInr
  }
  return out
}

export async function fetchLatestInrRates(
  codes: string[],
): Promise<{ date: string; rates: InrRates; fetchedAt: Date }> {
  if (codes.length === 0) {
    return { date: '', rates: {}, fetchedAt: new Date() }
  }
  const symbols = codes.join(',')
  const res = await fetch(`${API_BASE}/latest?from=INR&to=${encodeURIComponent(symbols)}`)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    if (res.status === 404 || /not found|unknown/i.test(text)) {
      throw new Error(
        `One or more currency codes are not supported by Frankfurter (${codes.join(', ')}). Try a different ISO code.`,
      )
    }
    throw new Error('Failed to fetch latest rates. Please try again.')
  }
  const data: RatesResponse = await res.json()
  return {
    date: data.date,
    rates: invertToInrPerUnit(data.rates),
    fetchedAt: new Date(),
  }
}

/** Previous available business day rates (INR per 1 foreign) for % change */
export async function fetchPreviousInrRates(
  codes: string[],
  latestDate: string,
): Promise<{ date: string; rates: InrRates } | null> {
  if (codes.length === 0 || !latestDate) return null

  const end = new Date(`${latestDate}T12:00:00Z`)
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - 10)
  const startStr = start.toISOString().slice(0, 10)
  const symbols = codes.join(',')

  const res = await fetch(
    `${API_BASE}/${startStr}..${latestDate}?from=INR&to=${encodeURIComponent(symbols)}`,
  )
  if (!res.ok) return null

  const data: TimeseriesResponse = await res.json()
  const dates = Object.keys(data.rates).sort()
  if (dates.length < 2) return null

  const prevDate = dates[dates.length - 2]
  const prevFromInr = data.rates[prevDate]
  if (!prevFromInr) return null

  return {
    date: prevDate,
    rates: invertToInrPerUnit(prevFromInr),
  }
}

export function pctChange(current: number, previous: number): number | null {
  if (!previous || previous === 0) return null
  return ((current - previous) / previous) * 100
}

export async function validateCurrencyCode(
  code: string,
  known: CurrencyMap,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const upper = code.trim().toUpperCase()
  if (!/^[A-Z]{3}$/.test(upper)) {
    return { ok: false, message: 'Enter a 3-letter ISO currency code (e.g. EUR).' }
  }
  if (upper === 'INR') {
    return { ok: false, message: 'INR is already the base currency.' }
  }
  if (known[upper]) {
    return { ok: true }
  }
  // Probe API in case list is stale or code exists but wasn't cached
  const res = await fetch(`${API_BASE}/latest?from=${upper}&to=INR`)
  if (!res.ok) {
    return {
      ok: false,
      message: `${upper} is not supported by Frankfurter (ECB set). Try another code.`,
    }
  }
  return { ok: true }
}
