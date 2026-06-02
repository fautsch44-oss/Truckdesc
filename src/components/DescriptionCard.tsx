import { useState } from 'react'
import type { RepairDescription } from '../types'
import CopyButton from './CopyButton'

interface DescriptionCardProps {
  item: RepairDescription
  categoryLabel: string
  selectMode: boolean
  selected: boolean
  onToggleSelect: (id: string) => void
  onCopied: () => void
}

export default function DescriptionCard({
  item,
  categoryLabel,
  selectMode,
  selected,
  onToggleSelect,
  onCopied,
}: DescriptionCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card">
      <div className="card-head">
        {selectMode && (
          <input
            className="card-check"
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect(item.id)}
            aria-label={`Select ${item.title}`}
          />
        )}
        <div style={{ flex: 1 }}>
          <h3 className="card-title">{item.title}</h3>
          <span className="badge">{categoryLabel}</span>
          {item.frequency ? (
            <span className="badge badge-freq">★ used {item.frequency}×</span>
          ) : null}
        </div>
      </div>

      <p
        className={`card-desc${expanded ? '' : ' clamped'}`}
        onClick={() => setExpanded((v) => !v)}
      >
        {item.description}
      </p>

      <div className="card-actions">
        <CopyButton text={item.description} onCopied={onCopied} />
        <button className="btn btn-ghost" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Less' : 'More'}
        </button>
      </div>
    </div>
  )
}
