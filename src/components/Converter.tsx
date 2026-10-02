import { useEffect, useMemo, useState } from 'react'

interface ConverterProps {
  code: string
  inrPerUnit: number | undefined
  currencyName?: string
}

function formatAmount(n: number): string {
  if (!Number.isFinite(n)) return ''
  if (Math.abs(n) >= 1_000_000) return n.toLocaleString('en-IN', { maximumFractionDigits: 2 })
  if (Math.abs(n) >= 1) return n.toLocaleString('en-IN', { maximumFractionDigits: 4 })
  return n.toLocaleString('en-IN', { maximumFractionDigits: 6 })
}

export function Converter({ code, inrPerUnit, currencyName }: ConverterProps) {
  const [amount, setAmount] = useState('1')
  const [fromForeign, setFromForeign] = useState(true)

  useEffect(() => {
    setAmount('1')
    setFromForeign(true)
  }, [code])

  const numeric = useMemo(() => {
    const n = parseFloat(amount.replace(/,/g, ''))
    return Number.isFinite(n) ? n : NaN
  }, [amount])

  const result = useMemo(() => {
    if (!inrPerUnit || !Number.isFinite(numeric)) return null
    if (fromForeign) return numeric * inrPerUnit
    return numeric / inrPerUnit
  }, [inrPerUnit, numeric, fromForeign])

  const swap = () => {
    if (result != null) {
      setAmount(String(Number(result.toFixed(6))))
    }
    setFromForeign((v) => !v)
  }

  const leftLabel = fromForeign ? code : 'INR'
  const rightLabel = fromForeign ? 'INR' : code
  const leftHint = fromForeign
    ? currencyName || code
    : 'Indian Rupee'
  const rightHint = fromForeign
    ? 'Indian Rupee'
    : currencyName || code

  return (
    <section className="converter" aria-label="Currency converter">
      <div className="converter-header">
        <h2>Converter</h2>
        <p className="muted">
          {inrPerUnit != null
            ? `1 ${code} = ₹${formatAmount(inrPerUnit)}`
            : 'Select a currency with a valid rate'}
        </p>
      </div>

      <div className="converter-grid">
        <label className="field">
          <span className="field-label">
            Amount ({leftLabel})
            <small>{leftHint}</small>
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={inrPerUnit == null}
            aria-label={`Amount in ${leftLabel}`}
          />
        </label>

        <button
          type="button"
          className="btn-swap"
          onClick={swap}
          disabled={inrPerUnit == null}
          title="Swap direction"
          aria-label="Swap conversion direction"
        >
          ⇄
        </button>

        <label className="field">
          <span className="field-label">
            Equals ({rightLabel})
            <small>{rightHint}</small>
          </span>
          <input
            type="text"
            readOnly
            value={result != null ? formatAmount(result) : '—'}
            aria-label={`Result in ${rightLabel}`}
            className="result-input"
          />
        </label>
      </div>
    </section>
  )
}
