import type { RepairDescription } from '../types'

// Case-insensitive substring search across title, description and keywords.
// Every whitespace-separated term in the query must match somewhere.
export function searchDescriptions(
  items: RepairDescription[],
  query: string,
  categoryId: string | null,
): RepairDescription[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean)

  return items.filter((item) => {
    if (categoryId && item.category !== categoryId) return false
    if (terms.length === 0) return true

    const haystack = [
      item.title,
      item.description,
      item.qbItemName ?? '',
      ...(item.keywords ?? []),
    ]
      .join(' ')
      .toLowerCase()

    return terms.every((term) => haystack.includes(term))
  })
}
