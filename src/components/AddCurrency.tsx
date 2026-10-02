import { useState, type FormEvent } from 'react'
import { validateCurrencyCode, type CurrencyMap } from '../api/frankfurter'

interface AddCurrencyProps {
  existing: string[]
  currencyNames: CurrencyMap
  onAdd: (code: string) => void
}

export function AddCurrency({ existing, currencyNames, onAdd }: AddCurrencyProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const code = value.trim().toUpperCase()
    setError(null)

    if (!code) {
      setError('Enter a currency code.')
      return
    }
    if (existing.includes(code)) {
      setError(`${code} is already in your list.`)
      return
    }

    setChecking(true)
    try {
      const result = await validateCurrencyCode(code, currencyNames)
      if (!result.ok) {
        setError(result.message)
        return
      }
      onAdd(code)
      setValue('')
    } catch {
      setError('Could not verify that code. Try again.')
    } finally {
      setChecking(false)
    }
  }

  return (
    <form className="add-currency" onSubmit={submit}>
      <label className="field grow">
        <span className="field-label">Add currency</span>
        <div className="add-row">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value.toUpperCase())
              setError(null)
            }}
            placeholder="e.g. EUR, JPY, AUD"
            maxLength={3}
            aria-invalid={!!error}
            aria-describedby={error ? 'add-error' : undefined}
          />
          <button type="submit" className="btn primary" disabled={checking}>
            {checking ? 'Checking…' : 'Add'}
          </button>
        </div>
      </label>
      {error && (
        <p id="add-error" className="form-error" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
