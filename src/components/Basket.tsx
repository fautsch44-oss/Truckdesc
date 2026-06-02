import { useEffect, useState } from 'react'
import type { Recipient, RepairDescription } from '../types'
import { copyText } from '../lib/clipboard'
import {
  loadRecipients,
  saveRecipients,
  sortRecipients,
  addRecipient,
  recordSend,
  removeRecipient,
} from '../lib/recipients'

interface BasketProps {
  items: RepairDescription[]
  onRemove: (id: string) => void
  onClear: () => void
  onToast: (msg: string) => void
}

function whatsappLink(number: string, text: string): string {
  const digits = number.replace(/[^0-9]/g, '')
  const base = digits ? `https://wa.me/${digits}` : 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(text)}`
}

function money(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

// Build the WhatsApp message from the truck name, each repair + its price,
// and the total.
function buildMessage(
  truck: string,
  items: RepairDescription[],
  prices: Record<string, string>,
): string {
  const lines: string[] = []
  if (truck.trim()) lines.push(`Truck: ${truck.trim()}`)
  let total = 0
  let hasPrice = false
  for (const item of items) {
    const raw = (prices[item.id] ?? '').trim()
    const num = parseFloat(raw)
    if (raw !== '' && !isNaN(num)) {
      total += num
      hasPrice = true
      lines.push(`• ${item.description} - $${money(num)}`)
    } else {
      lines.push(`• ${item.description}`)
    }
  }
  if (hasPrice) lines.push(`Total: $${money(total)}`)
  return lines.join('\n')
}

const contactPickerSupported =
  typeof navigator !== 'undefined' &&
  'contacts' in navigator &&
  typeof (navigator as any).contacts?.select === 'function'

export default function Basket({ items, onRemove, onClear, onToast }: BasketProps) {
  const [open, setOpen] = useState(false)
  const [truck, setTruck] = useState('')
  const [prices, setPrices] = useState<Record<string, string>>({})
  const [recipients, setRecipients] = useState<Recipient[]>(() => loadRecipients())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')

  const sorted = sortRecipients(recipients)

  // Each time the panel opens, preselect the most-recurrent contact.
  useEffect(() => {
    if (open && sorted.length > 0) setSelectedId(sorted[0].id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const total = items.reduce((sum, item) => {
    const num = parseFloat((prices[item.id] ?? '').trim())
    return sum + (isNaN(num) ? 0 : num)
  }, 0)

  function persist(next: Recipient[]) {
    setRecipients(next)
    saveRecipients(next)
  }

  function setPrice(id: string, value: string) {
    setPrices((prev) => ({ ...prev, [id]: value }))
  }

  function saveContact() {
    if (!newNumber.trim()) return
    const next = addRecipient(recipients, newName, newNumber)
    persist(next)
    const digits = newNumber.replace(/[^0-9]/g, '')
    const justAdded = next.find((r) => r.number.replace(/[^0-9]/g, '') === digits)
    if (justAdded) setSelectedId(justAdded.id)
    setNewName('')
    setNewNumber('')
    setAdding(false)
  }

  async function pickFromPhone() {
    try {
      const res = await (navigator as any).contacts.select(['name', 'tel'], { multiple: false })
      if (res && res[0]) {
        setNewName(res[0].name?.[0] ?? '')
        setNewNumber(res[0].tel?.[0] ?? '')
        setAdding(true)
      }
    } catch {
      // user cancelled or unsupported
    }
  }

  function deleteContact(id: string) {
    persist(removeRecipient(recipients, id))
    if (selectedId === id) setSelectedId(null)
  }

  // After sending, reset for the next truck: clear repairs, truck, prices.
  function resetForNextTruck() {
    onClear()
    setTruck('')
    setPrices({})
    setOpen(false)
  }

  function sendWhatsApp() {
    const text = buildMessage(truck, items, prices).trim()
    if (!text) return
    const recipient = recipients.find((r) => r.id === selectedId)
    window.open(whatsappLink(recipient?.number ?? '', text), '_blank')
    if (recipient) persist(recordSend(recipients, recipient.id))
    resetForNextTruck()
    onToast('Sent — ready for next truck')
  }

  async function copyAll() {
    const ok = await copyText(buildMessage(truck, items, prices).trim())
    if (ok) onToast('Copied to clipboard')
  }

  if (items.length === 0) return null

  return (
    <>
      {!open && (
        <div className="basket-bar" onClick={() => setOpen(true)}>
          <span>🧰 {items.length} selected</span>
          <button className="btn btn-send">Review &amp; send</button>
        </div>
      )}

      {open && (
        <div className="sheet-overlay" onClick={() => setOpen(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="sheet-head">
              <h2>Invoice ({items.length})</h2>
              <button className="link-btn dark" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>

            <div className="field">
              <label>Truck / Unit</label>
              <input
                value={truck}
                onChange={(e) => setTruck(e.target.value)}
                placeholder="e.g. Unit 1234 / plate"
              />
            </div>

            <label className="field-label">Repairs &amp; price</label>
            <div className="line-items">
              {items.map((item) => (
                <div className="line-item" key={item.id}>
                  <span className="line-desc">{item.description}</span>
                  <div className="line-price">
                    <span className="line-price-sign">$</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={prices[item.id] ?? ''}
                      onChange={(e) => setPrice(item.id, e.target.value)}
                    />
                  </div>
                  <button
                    className="sel-chip-x"
                    onClick={() => onRemove(item.id)}
                    aria-label={`Remove ${item.title}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {total > 0 && (
              <div className="total-row">
                <span>Total</span>
                <strong>${money(total)}</strong>
              </div>
            )}

            <label className="field-label">Send to</label>
            {sorted.length > 0 && (
              <div className="rcp-list">
                {sorted.map((r, idx) => (
                  <span
                    key={r.id}
                    className={`rcp-chip${selectedId === r.id ? ' active' : ''}`}
                    onClick={() => setSelectedId(r.id)}
                  >
                    {idx === 0 && r.count > 0 ? '★ ' : ''}
                    {r.name}
                    {r.count > 0 ? <span className="rcp-count">{r.count}</span> : null}
                    <button
                      className="sel-chip-x"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteContact(r.id)
                      }}
                      aria-label={`Delete ${r.name}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {adding ? (
              <div className="rcp-form">
                <div className="field">
                  <label>Contact name</label>
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Office / Boss" />
                </div>
                <div className="field">
                  <label>WhatsApp number (with country code)</label>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    placeholder="e.g. 1 305 555 1234"
                  />
                </div>
                <div className="rcp-form-actions">
                  <button className="btn btn-add" onClick={saveContact}>
                    Save contact
                  </button>
                  <button className="btn btn-ghost" onClick={() => setAdding(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="rcp-add-row">
                <button className="link-btn" onClick={() => setAdding(true)}>
                  + Add contact
                </button>
                {contactPickerSupported && (
                  <button className="link-btn" onClick={pickFromPhone}>
                    Import from phone
                  </button>
                )}
              </div>
            )}

            <div className="sheet-actions">
              <button className="btn btn-send" onClick={sendWhatsApp}>
                Send &amp; next truck
              </button>
              <button className="btn btn-ghost" onClick={copyAll}>
                Copy text
              </button>
              <button className="btn btn-ghost" onClick={resetForNextTruck}>
                Clear all
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
