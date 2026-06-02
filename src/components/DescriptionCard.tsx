import { useState } from 'react'
import type { RepairDescription } from '../types'
import CopyButton from './CopyButton'

interface DescriptionCardProps {
  item: RepairDescription
  categoryLabel: string
  inList: boolean
  onToggleList: (id: string) => void
  onCopied: () => void
}

export default function DescriptionCard({
  item,
  categoryLabel,
  inList,
  onToggleList,
  onCopied,
}: DescriptionCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`card${inList ? ' card-selected' : ''}`}>
      <div className="card-head">
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
        <button
          className={`btn ${inList ? 'btn-added' : 'btn-add'}`}
          onClick={() => onToggleList(item.id)}
        >
          {inList ? '✓ Added' : '+ Add'}
        </button>
        <CopyButton text={item.description} onCopied={onCopied} label="Copy" />
        <button className="btn btn-ghost" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Less' : 'More'}
        </button>
      </div>
    </div>
  )
}
