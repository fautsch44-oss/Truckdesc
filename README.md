# Trailer Repair Descriptions

A simple web app that holds a library of **pre-approved trailer repair
descriptions**. The chief mechanic searches and **copies** the right
description with one tap; the office pastes it straight into a QuickBooks
invoice — no more re-writing every repair from scratch.

- 📱 Works on phone, tablet, and PC (just open the website).
- 🔎 Fast search + categories (brakes, suspension, lighting, tires, …).
- 📋 One-tap **Copy**, plus **Select** mode to copy several line items at once.
- ✏️ A **Manage** screen to add/edit descriptions, with Import/Export.
- 💵 Free static hosting on Netlify. No server, no database, no monthly cost.

## How it's used day to day

1. Mechanic opens the site, finds the repair, taps **Copy**.
2. Office opens the QuickBooks invoice and pastes the description into a line item.
3. To bill several repairs at once: tap **Select**, check the repairs, then
   **Copy selected** — each description is copied on its own line.

## Run locally (for developers)

```bash
npm install
npm run dev          # open http://localhost:5173
npm run dev -- --host  # also reachable from a phone on the same Wi-Fi
npm run build        # production build into ./dist
npm run preview      # preview the production build
```

## Deploy to Netlify

The repo includes `netlify.toml` (build command `npm run build`, publish `dist`).

1. Push this repo to GitHub.
2. In Netlify → **Add new project → Import from Git**, pick this repo, accept the
   detected settings, and deploy.
3. You get a URL like `your-shop.netlify.app`. Bookmark it / "Add to Home Screen"
   on the phones and PCs. Every push to the repo auto-redeploys.

## Adding or editing descriptions

Two ways:

- **In the app (easiest):** open **Manage**, add/edit/delete entries. Changes are
  saved in that browser. Click **Export JSON** to download the updated list, then
  send the file to whoever publishes the site (or replace
  `src/data/descriptions.json` and push) so everyone gets the update.
- **Directly in code:** edit `src/data/descriptions.json` and push. Each entry:

  ```json
  {
    "id": "brakes-replace-brake-chamber",
    "category": "brakes",
    "title": "Replace brake chamber",
    "description": "Removed and replaced defective brake chamber...",
    "keywords": ["air chamber", "diaphragm"]
  }
  ```

  Categories live in `src/data/categories.json`.

## Importing an existing list

If you already have a list of repairs (Excel/CSV/notes), convert it:

```bash
# Export your Excel sheet to CSV first, then:
npm run ingest -- path/to/your-list.csv
```

This writes `src/data/descriptions.imported.json` with a best-guess category for
each row. Review the categories, then merge the entries into
`src/data/descriptions.json`.

## Project structure

```
src/
  data/        categories.json, descriptions.json   # the content
  lib/         store.ts, search.ts, clipboard.ts     # data + copy logic
  components/  search, filter, cards, manage screen
scripts/       ingest.ts                             # import an existing list
netlify.toml                                         # deploy config
```
