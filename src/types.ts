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
  laborNotes?: string
  partsNotes?: string
  unitPrice?: number
  qbItemName?: string
}
