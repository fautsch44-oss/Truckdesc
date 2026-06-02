import { useEffect, useMemo, useState } from 'react'
import type { Category, RepairDescription } from './types'
import categoriesData from './data/categories.json'
import { loadDescriptions, saveDescriptions, resetToSeed } from './lib/store'
import { searchDescriptions } from './lib/search'
import SearchBar from './components/SearchBar'
import CategoryFilter from './components/CategoryFilter'
import DescriptionList from './components/DescriptionList'
import Basket from './components/Basket'
import Toast from './components/Toast'
import ManageScreen from './components/manage/ManageScreen'

const categories = (categoriesData as Category[]).sort((a, b) => a.order - b.order)

type View = 'library' | 'manage'

export default function App() {
  const [items, setItems] = useState<RepairDescription[]>(() => loadDescriptions())
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
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

  const filtered = useMemo(
    () => searchDescriptions(items, query, category),
    [items, query, category],
  )

  // Selected items in the order they were added (Set preserves insertion order).
  const selectedItems = useMemo(() => {
    const byId = new Map(items.map((i) => [i.id, i]))
    return [...selectedIds].map((id) => byId.get(id)).filter(Boolean) as RepairDescription[]
  }, [selectedIds, items])

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 1800)
  }

  function updateItems(next: RepairDescription[]) {
    setItems(next)
    saveDescriptions(next)
  }

  function toggleList(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
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
          <h1>Truck Repair Descriptions</h1>
          <button className="nav-btn" onClick={() => navigate('manage')}>
            Manage
          </button>
        </div>
        <SearchBar value={query} onChange={setQuery} />
      </div>

      <CategoryFilter
        categories={categories}
        selected={category}
        counts={counts}
        onSelect={setCategory}
      />

      <DescriptionList
        items={filtered}
        categoryLabels={categoryLabels}
        listIds={selectedIds}
        onToggleList={toggleList}
        onCopied={() => showToast('Copied to clipboard')}
      />

      <Basket
        items={selectedItems}
        onRemove={toggleList}
        onClear={() => setSelectedIds(new Set())}
        onToast={showToast}
      />

      <Toast message={toast} />
    </div>
  )
}
