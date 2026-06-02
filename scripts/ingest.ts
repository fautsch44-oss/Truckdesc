/*
 * One-off importer: convert an existing list of repair descriptions into the
 * app's descriptions.json schema.
 *
 * Supports CSV / TSV / plain text with NO external dependencies (Node 22+).
 *   - CSV/TSV: expects a header row. Recognized columns (case-insensitive):
 *       title | name | repair        -> title
 *       description | desc | detail   -> description (falls back to title)
 *       category | block | system     -> category id (best-guess mapped)
 *       keywords | tags               -> comma/semicolon separated keywords
 *   - Plain text (.txt): one description per non-empty line; the first ~8 words
 *     become the title, the line becomes the description, category = "misc".
 *
 * Usage:
 *   npm run ingest -- <inputFile> [outputFile]
 *   (default output: src/data/descriptions.imported.json — review, then merge
 *    into src/data/descriptions.json)
 *
 * For Excel (.xlsx): export the sheet to CSV first, then run this on the CSV.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { extname, resolve } from 'node:path'

interface Entry {
  id: string
  category: string
  title: string
  description: string
  keywords?: string[]
}

const KNOWN_CATEGORIES = [
  'brakes',
  'suspension',
  'air-system',
  'lighting-electrical',
  'tires-wheels',
  'doors',
  'flooring',
  'refrigeration',
  'frame',
  'landing-gear',
  'kingpin-coupling',
  'misc',
]

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60)
}

// Map free-text category/keywords to one of the app's category ids.
function guessCategory(text: string): string {
  const t = text.toLowerCase()
  const rules: [string, RegExp][] = [
    ['brakes', /brake|drum|shoe|lining|slack|abs|chamber/],
    ['suspension', /suspension|air bag|air spring|shock|leaf|bushing|ride height/],
    ['air-system', /air line|gladhand|glad hand|air tank|relay valve|air leak|petcock/],
    ['lighting-electrical', /light|lamp|wiring|harness|electric|7-?way|marker|abs lamp/],
    ['tires-wheels', /tire|tyre|wheel|rim|stud|lug|tread|flat/],
    ['doors', /door|hinge|latch|roll-?up|gasket|seal/],
    ['flooring', /floor|board|cross ?member|deck/],
    ['refrigeration', /reefer|refriger|thermo ?king|carrier|refrigerant|defrost/],
    ['frame', /frame|rail|rub rail|mud flap|crack|weld/],
    ['landing-gear', /landing gear|dolly|crank|gearbox/],
    ['kingpin-coupling', /kingpin|king pin|upper coupler|fifth wheel|coupling/],
  ]
  for (const [cat, re] of rules) if (re.test(t)) return cat
  const exact = slugify(text)
  if (KNOWN_CATEGORIES.includes(exact)) return exact
  return 'misc'
}

function splitDelimited(content: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false
  for (let i = 0; i < content.length; i++) {
    const ch = content[i]
    if (inQuotes) {
      if (ch === '"' && content[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        field += ch
      }
    } else if (ch === '"') {
      inQuotes = true
    } else if (ch === delimiter) {
      row.push(field)
      field = ''
    } else if (ch === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (ch !== '\r') {
      field += ch
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''))
}

function header(name: string, headers: string[]): number {
  return headers.findIndex((h) => h.trim().toLowerCase() === name)
}

function fromDelimited(content: string, delimiter: string): Entry[] {
  const rows = splitDelimited(content, delimiter)
  if (rows.length === 0) return []
  const headers = rows[0]
  const titleIdx = [header('title', headers), header('name', headers), header('repair', headers)].find((i) => i >= 0) ?? 0
  const descIdx = [header('description', headers), header('desc', headers), header('detail', headers)].find((i) => i >= 0) ?? -1
  const catIdx = [header('category', headers), header('block', headers), header('system', headers)].find((i) => i >= 0) ?? -1
  const kwIdx = [header('keywords', headers), header('tags', headers)].find((i) => i >= 0) ?? -1

  return rows.slice(1).map((cols) => {
    const title = (cols[titleIdx] ?? '').trim()
    const description = descIdx >= 0 && cols[descIdx]?.trim() ? cols[descIdx].trim() : title
    const catCell = catIdx >= 0 ? (cols[catIdx] ?? '').trim() : ''
    const catText = catCell || `${title} ${description}`
    const keywords = kwIdx >= 0 ? (cols[kwIdx] ?? '').split(/[,;]/).map((k) => k.trim()).filter(Boolean) : undefined
    const category = guessCategory(catText)
    return {
      id: `${category}-${slugify(title)}`,
      category,
      title,
      description,
      ...(keywords && keywords.length ? { keywords } : {}),
    }
  }).filter((e) => e.title)
}

function fromPlainText(content: string): Entry[] {
  return content
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const title = line.split(/\s+/).slice(0, 8).join(' ')
      const category = guessCategory(line)
      return { id: `${category}-${slugify(title)}`, category, title, description: line }
    })
}

function main() {
  const [, , inputArg, outputArg] = process.argv
  if (!inputArg) {
    console.error('Usage: npm run ingest -- <inputFile> [outputFile]')
    process.exit(1)
  }
  const inputPath = resolve(inputArg)
  const content = readFileSync(inputPath, 'utf8')
  const ext = extname(inputPath).toLowerCase()

  let entries: Entry[]
  if (ext === '.csv') entries = fromDelimited(content, ',')
  else if (ext === '.tsv') entries = fromDelimited(content, '\t')
  else entries = fromPlainText(content)

  // De-duplicate ids.
  const seen = new Map<string, number>()
  for (const e of entries) {
    const n = seen.get(e.id) ?? 0
    seen.set(e.id, n + 1)
    if (n > 0) e.id = `${e.id}-${n + 1}`
  }

  const outputPath = resolve(outputArg ?? 'src/data/descriptions.imported.json')
  writeFileSync(outputPath, JSON.stringify(entries, null, 2))
  console.log(`Imported ${entries.length} entries -> ${outputPath}`)
  console.log('Review category assignments, then merge into src/data/descriptions.json')
}

main()
