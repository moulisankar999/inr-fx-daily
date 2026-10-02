import { pctChange } from '../api/frankfurter'

interface RateCardProps {
  code: string
  name?: string
  inrPerUnit: number | undefined
  prevInrPerUnit: number | undefined
  onRemove: () => void
  canRemove: boolean
  onSelect: () => void
  selected: boolean
}

function formatRate(n: number): string {
  if (n >= 100) return n.toFixed(2)
  if (n >= 10) return n.toFixed(3)
  if (n >= 1) return n.toFixed(4)
  return n.toFixed(6)
}

export function RateCard({
  code,
  name,
  inrPerUnit,
  prevInrPerUnit,
  onRemove,
  canRemove,
  onSelect,
  selected,
}: RateCardProps) {
  const change =
    inrPerUnit != null && prevInrPerUnit != null
      ? pctChange(inrPerUnit, prevInrPerUnit)
      : null

  return (
    <article
      className={`rate-card${selected ? ' selected' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      aria-pressed={selected}
    >
      <div className="rate-card-top">
        <div className="rate-code-wrap">
          <span className="rate-flag-ish" aria-hidden>
            {code.slice(0, 2)}
          </span>
          <div>
            <h3 className="rate-code">{code}</h3>
            {name && <p className="rate-name">{name}</p>}
          </div>
        </div>
        <button
          type="button"
          className="btn-icon"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          disabled={!canRemove}
          title={canRemove ? `Remove ${code}` : 'Keep at least one currency'}
          aria-label={`Remove ${code}`}
        >
          ×
        </button>
      </div>

      <div className="rate-value">
        {inrPerUnit != null ? (
          <>
            <span className="rate-inr">₹{formatRate(inrPerUnit)}</span>
            <span className="rate-unit">per 1 {code}</span>
          </>
        ) : (
          <span className="rate-missing">—</span>
        )}
      </div>

      {change != null && (
        <div
          className={`rate-change ${change > 0 ? 'up' : change < 0 ? 'down' : 'flat'}`}
          title="Change vs previous available day"
        >
          <span aria-hidden>{change > 0 ? '▲' : change < 0 ? '▼' : '●'}</span>
          {change > 0 ? '+' : ''}
          {change.toFixed(2)}%
        </div>
      )}
    </article>
  )
}
