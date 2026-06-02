import { useMemo, useRef, useState } from 'react'
import type { RepairDescription } from '../types'
import { searchDescriptions } from '../lib/search'

interface SearchAutocompleteProps {
  items: RepairDescription[]
  addedIds: Set<string>
  onAdd: (id: string) => void
}

// Type a couple of letters -> instant suggestions. Tap one to add it straight
// to the list. The goal is the fewest keystrokes possible.
export default function SearchAutocomplete({ items, addedIds, onAdd }: SearchAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const matches = useMemo(() => {
    if (query.trim().length === 0) return []
    return searchDescriptions(items, query, null).slice(0, 12)
  }, [items, query])

  const open = focused && query.trim().length > 0

  function pick(id: string) {
    onAdd(id)
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <div className="ac-wrap">
      <input
        ref={inputRef}
        className="search-input"
        type="search"
        inputMode="search"
        placeholder="Type to search… (e.g. abs, oil, clutch)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        autoComplete="off"
        autoCapitalize="off"
      />
      {open && (
        <div className="ac-dropdown">
          {matches.length === 0 ? (
            <div className="ac-empty">No matches</div>
          ) : (
            matches.map((m) => {
              const added = addedIds.has(m.id)
              return (
                <button
                  key={m.id}
                  className={`ac-item${added ? ' added' : ''}`}
                  // onMouseDown fires before input blur, so the tap registers
                  onMouseDown={(e) => {
                    e.preventDefault()
                    pick(m.id)
                  }}
                >
                  <span className="ac-item-text">{m.description}</span>
                  <span className="ac-item-add">{added ? '✓' : '+'}</span>
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}
