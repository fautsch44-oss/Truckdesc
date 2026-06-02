import { useEffect, useMemo, useState } from 'react'
import type { Category, RepairDescription } from './types'
import categoriesData from './data/categories.json'
import { loadDescriptions, saveDescriptions, resetToSeed } from './lib/store'
import SearchAutocomplete from './components/SearchAutocomplete'
import CategoryGrid from './components/CategoryGrid'
import QuickList from './components/QuickList'
import QuickAdd from './components/QuickAdd'
import Basket from './components/Basket'
import Toast from './components/Toast'
import ManageScreen from './components/manage/ManageScreen'

const categories = (categoriesData as Category[]).sort((a, b) => a.order - b.order)

type View = 'library' | 'manage'

export default function App() {
  const [items, setItems] = useState<RepairDescription[]>(() => loadDescriptions())
  const [category, setCategory] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showAdd, setShowAdd] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [view, setView] = useState<View>(
    () => (window.location.hash === '#manage' ? 'manage' : 'library'),
  )

  useEffect(() => {
    function onHash() {
      setView(window.location.hash === '#manage' ? 'manage' : 'library')
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const categoryLabels = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c.label])),
    [],
  )

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const item of items) c[item.category] = (c[item.category] ?? 0) + 1
    return c
  }, [items])

  // What the compact list shows: the active category, or the most-used repairs
  // as quick picks when nothing is selected yet.
  const listItems = useMemo(() => {
    if (category) return items.filter((i) => i.category === category)
    return items
      .filter((i) => (i.frequency ?? 0) > 0)
      .sort((a, b) => (b.frequency ?? 0) - (a.frequency ?? 0))
  }, [items, category])

  const selectedItems = useMemo(() => {
    const byId = new Map(items.map((i) => [i.id, i]))
    return [...selectedIds].map((id) => byId.get(id)).filter(Boolean) as RepairDescription[]
  }, [selectedIds, items])

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 1600)
  }

  function updateItems(next: RepairDescription[]) {
    setItems(next)
    saveDescriptions(next)
  }

  function add(id: string) {
    setSelectedIds((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
    showToast('Added')
  }

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function addDescription(entry: RepairDescription) {
    updateItems([entry, ...items])
    setCategory(entry.category)
    showToast('Saved to library')
  }

  function navigate(v: View) {
    window.location.hash = v === 'manage' ? '#manage' : ''
    setView(v)
  }

  if (view === 'manage') {
    return (
      <div className="app">
        <div className="topbar">
          <div className="topbar-row">
            <h1>Manage Descriptions</h1>
            <button className="nav-btn" onClick={() => navigate('library')}>
              ← Back
            </button>
          </div>
        </div>
        <ManageScreen
          categories={categories}
          items={items}
          categoryLabels={categoryLabels}
          onChange={updateItems}
          onReset={() => setItems(resetToSeed())}
        />
      </div>
    )
  }

  return (
    <div className="app">
      <div className="topbar">
        <div className="topbar-row">
          <div className="brand">
            <img
              src="/logo.png"
              alt=""
              className="brand-logo"
              onError={(e) => {
                ;(e.currentTarget as HTMLImageElement).style.display = 'none'
              }}
            />
            <h1>Truckdesc</h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="nav-btn" onClick={() => setShowAdd(true)}>
              + Add
            </button>
            <button className="nav-btn" onClick={() => navigate('manage')}>
              Manage
            </button>
          </div>
        </div>
        <SearchAutocomplete items={items} addedIds={selectedIds} onAdd={add} />
      </div>

      <CategoryGrid
        categories={categories}
        counts={counts}
        active={category}
        onSelect={setCategory}
      />

      <div className="section-title">
        {category ? categoryLabels[category] : '★ Most used'}
        {category && (
          <button className="link-btn dark" onClick={() => setCategory(null)}>
            Clear
          </button>
        )}
      </div>

      <QuickList items={listItems} addedIds={selectedIds} onToggle={toggle} />

      <div className="add-here">
        <button className="btn btn-ghost" onClick={() => setShowAdd(true)}>
          {category ? `+ Add to ${categoryLabels[category]}` : '+ Add new repair'}
        </button>
      </div>

      {showAdd && (
        <QuickAdd
          categories={categories}
          defaultCategory={category}
          onSave={addDescription}
          onClose={() => setShowAdd(false)}
        />
      )}

      <Basket
        items={selectedItems}
        onRemove={toggle}
        onClear={() => setSelectedIds(new Set())}
        onToast={showToast}
      />

      <Toast message={toast} />
    </div>
  )
}
