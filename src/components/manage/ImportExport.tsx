import { useRef } from 'react'
import type { RepairDescription } from '../../types'
import { exportJson } from '../../lib/store'

interface ImportExportProps {
  items: RepairDescription[]
  onImport: (items: RepairDescription[]) => void
}

export default function ImportExport({ items, onImport }: ImportExportProps) {
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result))
        if (!Array.isArray(parsed)) throw new Error('not an array')
        const valid = parsed.filter(
          (x) => x && typeof x.id === 'string' && typeof x.title === 'string' && typeof x.description === 'string',
        )
        if (valid.length === 0) throw new Error('no valid entries')
        onImport(valid as RepairDescription[])
        alert(`Imported ${valid.length} descriptions.`)
      } catch {
        alert('Could not read that file. Please choose a valid descriptions.json file.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="manage-toolbar">
      <button className="btn btn-ghost" onClick={() => exportJson(items)}>
        Export JSON
      </button>
      <button className="btn btn-ghost" onClick={() => fileRef.current?.click()}>
        Import JSON
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </div>
  )
}
