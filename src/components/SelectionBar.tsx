interface SelectionBarProps {
  count: number
  onCopy: () => void
  onClear: () => void
}

export default function SelectionBar({ count, onCopy, onClear }: SelectionBarProps) {
  return (
    <div className="selection-bar">
      <span>{count} selected</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="link-btn" onClick={onClear}>
          Clear
        </button>
        <button className="btn btn-copy" onClick={onCopy} disabled={count === 0}>
          Copy selected
        </button>
      </div>
    </div>
  )
}
