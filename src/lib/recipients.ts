import type { Recipient } from '../types'

const KEY = 'waRecipients'

export function loadRecipients(): Recipient[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed as Recipient[]
    }
  } catch {
    // ignore corrupt storage
  }
  return []
}

export function saveRecipients(list: Recipient[]): void {
  localStorage.setItem(KEY, JSON.stringify(list))
}

// Most-recurrent first (by send count, then most recent).
export function sortRecipients(list: Recipient[]): Recipient[] {
  return [...list].sort((a, b) => b.count - a.count || b.lastUsed - a.lastUsed)
}

export function onlyDigits(number: string): string {
  return number.replace(/[^0-9]/g, '')
}

export function addRecipient(list: Recipient[], name: string, number: string): Recipient[] {
  const digits = onlyDigits(number)
  const existing = list.find((r) => onlyDigits(r.number) === digits)
  if (existing) {
    return list.map((r) =>
      r.id === existing.id ? { ...r, name: name.trim() || r.name } : r,
    )
  }
  const rec: Recipient = {
    id: `r-${Date.now().toString(36)}`,
    name: name.trim() || number.trim(),
    number: number.trim(),
    count: 0,
    lastUsed: 0,
  }
  return [...list, rec]
}

// Bump a recipient's usage so it floats to the top of the "most recurrent" list.
export function recordSend(list: Recipient[], id: string): Recipient[] {
  return list.map((r) =>
    r.id === id ? { ...r, count: r.count + 1, lastUsed: Date.now() } : r,
  )
}

export function removeRecipient(list: Recipient[], id: string): Recipient[] {
  return list.filter((r) => r.id !== id)
}
