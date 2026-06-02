import type { RepairDescription } from '../types'
import DescriptionCard from './DescriptionCard'

interface DescriptionListProps {
  items: RepairDescription[]
  categoryLabels: Record<string, string>
  selectMode: boolean
  selectedIds: Set<string>
  onToggleSelect: (id: string) => void
  onCopied: () => void
}

export default function DescriptionList({
  items,
  categoryLabels,
  selectMode,
  selectedIds,
  onToggleSelect,
  onCopied,
}: DescriptionListProps) {
  if (items.length === 0) {
    return <div className="empty">No matching repairs. Try a different search.</div>
  }

  return (
    <div className="list">
      {items.map((item) => (
        <DescriptionCard
          key={item.id}
          item={item}
          categoryLabel={categoryLabels[item.category] ?? item.category}
          selectMode={selectMode}
          selected={selectedIds.has(item.id)}
          onToggleSelect={onToggleSelect}
          onCopied={onCopied}
        />
      ))}
    </div>
  )
}
