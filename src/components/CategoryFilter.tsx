import type { Category } from '../types'

interface CategoryFilterProps {
  categories: Category[]
  selected: string | null
  counts: Record<string, number>
  onSelect: (id: string | null) => void
}

export default function CategoryFilter({
  categories,
  selected,
  counts,
  onSelect,
}: CategoryFilterProps) {
  return (
    <div className="chips">
      <button
        className={`chip${selected === null ? ' active' : ''}`}
        onClick={() => onSelect(null)}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`chip${selected === cat.id ? ' active' : ''}`}
          onClick={() => onSelect(cat.id)}
        >
          {cat.label}
          {counts[cat.id] ? ` (${counts[cat.id]})` : ''}
        </button>
      ))}
    </div>
  )
}
