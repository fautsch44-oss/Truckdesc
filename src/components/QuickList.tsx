import type { RepairDescription } from '../types'

interface QuickListProps {
  items: RepairDescription[]
  addedIds: Set<string>
  onToggle: (id: string) => void
}

// Compact one-line rows. Tap a row to add/remove it from the list — no big
// cards, minimal scrolling.
export default function QuickList({ items, addedIds, onToggle }: QuickListProps) {
  if (items.length === 0) {
    return <div className="empty">Pick a category above, or type to search.</div>
  }

  return (
    <div className="rows">
      {items.map((item) => {
        const added = addedIds.has(item.id)
        return (
          <button
            key={item.id}
            className={`row${added ? ' added' : ''}`}
            onClick={() => onToggle(item.id)}
          >
            <span className="row-title">{item.description}</span>
            {item.frequency ? <span className="row-freq">★{item.frequency}</span> : null}
            <span className="row-add">{added ? '✓' : '+'}</span>
          </button>
        )
      })}
    </div>
  )
}
