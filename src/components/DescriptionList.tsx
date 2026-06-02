import type { RepairDescription } from '../types'
import DescriptionCard from './DescriptionCard'

interface DescriptionListProps {
  items: RepairDescription[]
  categoryLabels: Record<string, string>
  listIds: Set<string>
  onToggleList: (id: string) => void
  onCopied: () => void
}

export default function DescriptionList({
  items,
  categoryLabels,
  listIds,
  onToggleList,
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
          inList={listIds.has(item.id)}
          onToggleList={onToggleList}
          onCopied={onCopied}
        />
      ))}
    </div>
  )
}
