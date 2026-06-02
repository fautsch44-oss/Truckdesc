interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="search-wrap">
      <input
        className="search-input"
        type="search"
        inputMode="search"
        placeholder="Search repairs (e.g. brake chamber, tail light)…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        autoCapitalize="off"
      />
    </div>
  )
}
