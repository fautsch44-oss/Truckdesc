import type { RepairDescription } from '../types'
import seedDescriptions from '../data/descriptions.json'

const STORAGE_KEY = 'repairDescriptions'

// The committed JSON is the shipped baseline. Local edits made on the Manage
// screen are kept in localStorage so they survive reloads on the same device,
// and can be exported to a file to re-commit and share with everyone.
export function loadDescriptions(): RepairDescription[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as RepairDescription[]
    }
  } catch {
    // ignore corrupt storage and fall back to seed
  }
  return seedDescriptions as RepairDescription[]
}

export function saveDescriptions(items: RepairDescription[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

// Discard local edits and return to the committed dataset.
export function resetToSeed(): RepairDescription[] {
  localStorage.removeItem(STORAGE_KEY)
  return seedDescriptions as RepairDescription[]
}

export function exportJson(items: RepairDescription[]): void {
  const blob = new Blob([JSON.stringify(items, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'descriptions.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60)
}
