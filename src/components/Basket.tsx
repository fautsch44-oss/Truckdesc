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

// Optional: import a contact from the phone (Android Chrome only).
const contactPickerSupported =
  typeof navigator !== 'undefined' &&
  'contacts' in navigator &&
  typeof (navigator as any).contacts?.select === 'function'

export default function Basket({ items, onRemove, onClear, onToast }: BasketProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [recipients, setRecipients] = useState<Recipient[]>(() => loadRecipients())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')

  const sorted = sortRecipients(recipients)

  const listText = items.map((i) => i.description).join('\n')

  useEffect(() => {
    if (open) setDraft(listText)
  }, [open, listText])

  // Each time the panel opens, preselect the most-recurrent contact.
  useEffect(() => {
    if (open && sorted.length > 0) setSelectedId(sorted[0].id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function persist(next: Recipient[]) {
    setRecipients(next)
    saveRecipients(next)
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
      // user cancelled or not supported
    }
  }

  function deleteContact(id: string) {
    persist(removeRecipient(recipients, id))
    if (selectedId === id) setSelectedId(null)
  }

  function sendWhatsApp() {
    const text = draft.trim()
    if (!text) return
    const recipient = recipients.find((r) => r.id === selectedId)
    window.open(whatsappLink(recipient?.number ?? '', text), '_blank')
    if (recipient) persist(recordSend(recipients, recipient.id))
  }

  async function copyAll() {
    const ok = await copyText(draft.trim())
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
              <h2>Selected repairs ({items.length})</h2>
              <button className="link-btn dark" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>

            <div className="chip-list">
              {items.map((i) => (
                <span className="sel-chip" key={i.id}>
                  {i.title}
                  <button
                    className="sel-chip-x"
                    onClick={() => onRemove(i.id)}
                    aria-label={`Remove ${i.title}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <label className="field-label">Message (you can edit before sending)</label>
            <textarea
              className="sheet-textarea"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
            />

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
                Send by WhatsApp
              </button>
              <button className="btn btn-ghost" onClick={copyAll}>
                Copy text
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  onClear()
                  setOpen(false)
                }}
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
