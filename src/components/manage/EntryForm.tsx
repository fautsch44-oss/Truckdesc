import { useState } from 'react'
import type { Category, RepairDescription } from '../../types'
import { slugify } from '../../lib/store'

interface EntryFormProps {
  categories: Category[]
  initial?: RepairDescription
  onSave: (entry: RepairDescription) => void
  onCancel: () => void
}

export default function EntryForm({ categories, initial, onSave, onCancel }: EntryFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [category, setCategory] = useState(initial?.category ?? categories[0]?.id ?? 'misc')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [keywords, setKeywords] = useState((initial?.keywords ?? []).join(', '))
  const [qbItemName, setQbItemName] = useState(initial?.qbItemName ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return
    const entry: RepairDescription = {
      id: initial?.id ?? `${category}-${slugify(title)}-${Date.now().toString(36)}`,
      category,
      title: title.trim(),
      description: description.trim(),
      keywords: keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
      qbItemName: qbItemName.trim() || undefined,
    }
    onSave(entry)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>Title (short name)</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="field">
        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label>Description (the text that gets copied)</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
      </div>
      <div className="field">
        <label>Keywords (comma separated, optional)</label>
        <input value={keywords} onChange={(e) => setKeywords(e.target.value)} />
      </div>
      <div className="field">
        <label>QuickBooks item name (optional)</label>
        <input value={qbItemName} onChange={(e) => setQbItemName(e.target.value)} />
      </div>
      <div className="card-actions">
        <button type="submit" className="btn btn-copy">
          Save
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
