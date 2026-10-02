import { useState } from 'react'
import { AddCurrency } from './components/AddCurrency'
import { Converter } from './components/Converter'
import { RateCard } from './components/RateCard'
import { DEFAULT_CURRENCIES, useCurrencyList } from './hooks/useCurrencyList'
import { useRates } from './hooks/useRates'
import './App.css'

function formatFetchedAt(d: Date | null): string {
  if (!d) return '—'
  return d.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  })
}

export default function App() {
  const { currencies, addCurrency, removeCurrency, resetDefaults } = useCurrencyList()
  const {
    loading,
    error,
    date,
    fetchedAt,
    rates,
    prevDate,
    prevRates,
    currencyNames,
    refresh,
  } = useRates(currencies)

  const [selected, setSelected] = useState<string>(DEFAULT_CURRENCIES[0])

  const activeCode = currencies.includes(selected) ? selected : currencies[0]

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-inner">
          <div className="brand">
            <span className="brand-mark" aria-hidden>
              ₹
            </span>
            <div>
              <h1>INR FX Daily</h1>
              <p className="tagline">Live foreign exchange vs Indian Rupee</p>
            </div>
          </div>

          <div className="meta-bar">
            <div className="meta-item">
              <span className="meta-label">Rate date</span>
              <strong>{date || '—'}</strong>
              {prevDate && (
                <span className="meta-sub">vs {prevDate}</span>
              )}
            </div>
            <div className="meta-item">
              <span className="meta-label">Last refresh</span>
              <strong>{formatFetchedAt(fetchedAt)} IST</strong>
            </div>
            <button
              type="button"
              className="btn primary"
              onClick={refresh}
              disabled={loading}
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        {error && (
          <div className="banner error" role="alert">
            {error}
          </div>
        )}

        <section className="toolbar">
          <AddCurrency
            existing={currencies}
            currencyNames={currencyNames}
            onAdd={(code) => {
              addCurrency(code)
              setSelected(code)
            }}
          />
          <button type="button" className="btn ghost" onClick={resetDefaults}>
            Reset defaults
          </button>
        </section>

        <section className="rates-grid" aria-label="Exchange rates">
          {loading && Object.keys(rates).length === 0 ? (
            <div className="skeleton-grid">
              {currencies.map((c) => (
                <div key={c} className="skeleton-card" />
              ))}
            </div>
          ) : (
            currencies.map((code) => (
              <RateCard
                key={code}
                code={code}
                name={currencyNames[code]}
                inrPerUnit={rates[code]}
                prevInrPerUnit={prevRates[code]}
                onRemove={() => removeCurrency(code)}
                canRemove={currencies.length > 1}
                onSelect={() => setSelected(code)}
                selected={activeCode === code}
              />
            ))
          )}
        </section>

        <Converter
          code={activeCode}
          inrPerUnit={rates[activeCode]}
          currencyName={currencyNames[activeCode]}
        />

        <footer className="footer">
          <p>
            Rates from{' '}
            <a
              href="https://www.frankfurter.app"
              target="_blank"
              rel="noreferrer"
            >
              Frankfurter
            </a>{' '}
            (ECB reference rates). No API key required. Not for trading advice.
          </p>
        </footer>
      </main>
    </div>
  )
}
