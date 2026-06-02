import { useEffect, useState } from 'react'
import type { RepairDescription } from '../types'
import { copyText } from '../lib/clipboard'

interface BasketProps {
  items: RepairDescription[]
  onRemove: (id: string) => void
  onClear: () => void
  onToast: (msg: string) => void
}

const WA_NUMBER_KEY = 'waNumber'

// Build a WhatsApp deep link. With a number it opens a chat with that contact;
// without one, WhatsApp asks who to send it to. Works on phone app and web.
function whatsappLink(number: string, text: string): string {
  const digits = number.replace(/[^0-9]/g, '')
  const base = digits ? `https://wa.me/${digits}` : 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(text)}`
}

export default function Basket({ items, onRemove, onClear, onToast }: BasketProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [waNumber, setWaNumber] = useState(() => localStorage.getItem(WA_NUMBER_KEY) ?? '')

  const listText = items.map((i) => i.description).join('\n')

  // Refresh the editable text whenever the panel opens or the selection changes.
  useEffect(() => {
    if (open) setDraft(listText)
  }, [open, listText])

  function saveNumber(value: string) {
    setWaNumber(value)
    localStorage.setItem(WA_NUMBER_KEY, value)
  }

  function sendWhatsApp() {
    const text = draft.trim()
    if (!text) return
    window.open(whatsappLink(waNumber, text), '_blank')
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

            <div className="field">
              <label>Send to WhatsApp number (optional, with country code)</label>
              <input
                type="tel"
                inputMode="tel"
                placeholder="e.g. 1 305 555 1234"
                value={waNumber}
                onChange={(e) => saveNumber(e.target.value)}
              />
            </div>

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
