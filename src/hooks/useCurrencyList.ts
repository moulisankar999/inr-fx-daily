import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'inr-fx-daily-currencies'
export const DEFAULT_CURRENCIES = ['USD', 'GBP', 'SGD', 'MYR', 'CNY'] as const

function loadStored(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [...DEFAULT_CURRENCIES]
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return [...DEFAULT_CURRENCIES]
    const codes = parsed
      .filter((c): c is string => typeof c === 'string')
      .map((c) => c.toUpperCase())
      .filter((c) => /^[A-Z]{3}$/.test(c) && c !== 'INR')
    return codes.length > 0 ? [...new Set(codes)] : [...DEFAULT_CURRENCIES]
  } catch {
    return [...DEFAULT_CURRENCIES]
  }
}

export function useCurrencyList() {
  const [currencies, setCurrencies] = useState<string[]>(() => loadStored())

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currencies))
  }, [currencies])

  const addCurrency = useCallback((code: string) => {
    const upper = code.trim().toUpperCase()
    setCurrencies((prev) => (prev.includes(upper) ? prev : [...prev, upper]))
  }, [])

  const removeCurrency = useCallback((code: string) => {
    setCurrencies((prev) => {
      if (prev.length <= 1) return prev
      return prev.filter((c) => c !== code)
    })
  }, [])

  const resetDefaults = useCallback(() => {
    setCurrencies([...DEFAULT_CURRENCIES])
  }, [])

  return { currencies, addCurrency, removeCurrency, resetDefaults }
}
