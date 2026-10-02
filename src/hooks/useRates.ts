import { useCallback, useEffect, useState } from 'react'
import {
  fetchCurrencies,
  fetchLatestInrRates,
  fetchPreviousInrRates,
  type CurrencyMap,
  type InrRates,
} from '../api/frankfurter'

export interface RatesState {
  loading: boolean
  error: string | null
  date: string
  fetchedAt: Date | null
  rates: InrRates
  prevDate: string | null
  prevRates: InrRates
  currencyNames: CurrencyMap
  refresh: () => void
}

export function useRates(codes: string[]): RatesState {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [date, setDate] = useState('')
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null)
  const [rates, setRates] = useState<InrRates>({})
  const [prevDate, setPrevDate] = useState<string | null>(null)
  const [prevRates, setPrevRates] = useState<InrRates>({})
  const [currencyNames, setCurrencyNames] = useState<CurrencyMap>({})
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    fetchCurrencies()
      .then((map) => {
        if (!cancelled) setCurrencyNames(map)
      })
      .catch(() => {
        /* names are optional */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const codesKey = codes.join(',')

  useEffect(() => {
    let cancelled = false
    const codeList = codesKey ? codesKey.split(',') : []

    async function load() {
      if (codeList.length === 0) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        const latest = await fetchLatestInrRates(codeList)
        if (cancelled) return
        setDate(latest.date)
        setRates(latest.rates)
        setFetchedAt(latest.fetchedAt)

        const prev = await fetchPreviousInrRates(codeList, latest.date)
        if (cancelled) return
        if (prev) {
          setPrevDate(prev.date)
          setPrevRates(prev.rates)
        } else {
          setPrevDate(null)
          setPrevRates({})
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load rates')
          setRates({})
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [codesKey, tick])

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  return {
    loading,
    error,
    date,
    fetchedAt,
    rates,
    prevDate,
    prevRates,
    currencyNames,
    refresh,
  }
}
