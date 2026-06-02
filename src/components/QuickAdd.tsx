import { useState } from 'react'
import type { Category, RepairDescription } from '../types'
import { slugify } from '../lib/store'

interface QuickAddProps {
  categories: Category[]
  defaultCategory: string | null
  onSave: (entry: RepairDescription) => void
  onClose: () => void
}

// Fast "feed the database" form: pick the truck part (category), type the
// repair, save. "Save & add another" keeps the category so the mechanic can
// keep adding without re-selecting.
export default function QuickAdd({ categories, defaultCategory, onSave, onClose }: QuickAddProps) {
  const [category, setCategory] = useState(defaultCategory ?? categories[0]?.id ?? 'other-varios')
  const [description, setDescription] = useState('')
  const [savedCount, setSavedCount] = useState(0)

  function build(): RepairDescription | null {
    const text = description.trim()
    if (!text) return null
    return {
      id: `${category}-${slugify(text)}-${Date.now().toString(36)}`,
      category,
      title: text,
      description: text,
    }
  }

  function handleSave(addAnother: boolean) {
    const entry = build()
    if (!entry) return
    onSave(entry)
    setSavedCount((n) => n + 1)
    setDescription('')
    if (!addAnother) onClose()
  }

  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-head">
          <h2>Add repair</h2>
          <button className="link-btn dark" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="field">
          <label>Truck part / classification</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Repair description (this is what gets sent)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. REPLACE AIR DRYER CARTRIDGE"
            autoFocus
          />
        </div>

        {savedCount > 0 && (
          <p className="hint">Saved {savedCount} this session. Keep going or close.</p>
        )}

        <div className="sheet-actions">
          <button className="btn btn-send" onClick={() => handleSave(false)}>
            Save
          </button>
          <button className="btn btn-add" onClick={() => handleSave(true)}>
            Save &amp; add another
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
