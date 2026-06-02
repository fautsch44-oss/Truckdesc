import type { Category } from '../types'

interface CategoryGridProps {
  categories: Category[]
  counts: Record<string, number>
  active: string | null
  onSelect: (id: string | null) => void
}

// Big tappable buttons: press "ENGINE" or "TRANSMISSION" to jump straight to
// that group's repairs. Tapping the active one again clears the filter.
export default function CategoryGrid({ categories, counts, active, onSelect }: CategoryGridProps) {
  return (
    <div className="cat-grid">
      {categories.map((c) => (
        <button
          key={c.id}
          className={`cat-btn${active === c.id ? ' active' : ''}`}
          onClick={() => onSelect(active === c.id ? null : c.id)}
        >
          <span className="cat-btn-label">{c.label}</span>
          <span className="cat-btn-count">{counts[c.id] ?? 0}</span>
        </button>
      ))}
    </div>
  )
}
