export interface Category {
  id: string
  label: string
  order: number
}

export interface RepairDescription {
  id: string
  category: string
  title: string
  description: string
  keywords?: string[]
  frequency?: number
  laborNotes?: string
  partsNotes?: string
  unitPrice?: number
  qbItemName?: string
}

export interface Recipient {
  id: string
  name: string
  number: string
  count: number
  lastUsed: number
}
