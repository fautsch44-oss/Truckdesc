import { useState } from 'react'
import { copyText } from '../lib/clipboard'

interface CopyButtonProps {
  text: string
  onCopied?: () => void
  label?: string
}

export default function CopyButton({ text, onCopied, label = 'Copy' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleClick() {
    const ok = await copyText(text)
    if (ok) {
      setCopied(true)
      onCopied?.()
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <button className={`btn btn-copy${copied ? ' copied' : ''}`} onClick={handleClick}>
      {copied ? '✓ Copied' : label}
    </button>
  )
}
