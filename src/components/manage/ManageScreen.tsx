import { useState } from 'react'
import type { Category, RepairDescription } from '../../types'
import EntryForm from './EntryForm'
import ImportExport from './ImportExport'

interface ManageScreenProps {
  categories: Category[]
  items: RepairDescription[]
  categoryLabels: Record<string, string>
  onChange: (items: RepairDescription[]) => void
  onReset: () => void
}

export default function ManageScreen({
  categories,
  items,
  categoryLabels,
  onChange,
  onReset,
}: ManageScreenProps) {
  const [editing, setEditing] = useState<RepairDescription | null>(null)
  const [adding, setAdding] = useState(false)

  function upsert(entry: RepairDescription) {
    const exists = items.some((i) => i.id === entry.id)
    onChange(exists ? items.map((i) => (i.id === entry.id ? entry : i)) : [entry, ...items])
    setEditing(null)
    setAdding(false)
  }

  function remove(id: string) {
    if (confirm('Delete this description?')) {
      onChange(items.filter((i) => i.id !== id))
    }
  }

  if (adding || editing) {
    return (
      <div className="manage">
        <h2>{editing ? 'Edit description' : 'Add description'}</h2>
        <EntryForm
          categories={categories}
          initial={editing ?? undefined}
          onSave={upsert}
          onCancel={() => {
            setEditing(null)
            setAdding(false)
          }}
        />
      </div>
    )
  }

  return (
    <div className="manage">
      <h2>Manage descriptions ({items.length})</h2>
      <p className="hint">
        Changes are saved on this device. Use <strong>Export JSON</strong> and send the file to
        whoever publishes the site (or commit it) so everyone gets the update.
      </p>

      <div className="manage-toolbar">
        <button className="btn btn-copy" onClick={() => setAdding(true)}>
          + Add description
        </button>
      </div>

      <ImportExport items={items} onImport={onChange} />

      {items.map((item) => (
        <div className="manage-row" key={item.id}>
          <div>
            <strong>{item.title}</strong>
            <div className="hint">{categoryLabels[item.category] ?? item.category}</div>
          </div>
          <div className="manage-row-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => setEditing(item)}>
              Edit
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => remove(item.id)}>
              Delete
            </button>
          </div>
        </div>
      ))}

      <div style={{ marginTop: 24 }}>
        <button className="btn btn-ghost btn-sm" onClick={onReset}>
          Reset to published list
        </button>
      </div>
    </div>
  )
}
