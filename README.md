# INR FX Daily

A polished single-page app for daily foreign-exchange rates **always versus INR** (Indian Rupee), inspired by Xe-style rate boards.

## Features

- Default watchlist: **USD, GBP, SGD, MYR, CNY** vs INR
- Add any ISO 4217 code supported by the API; list persists in `localStorage`
- Remove currencies (at least one must remain)
- Shows **INR per 1 unit** of foreign currency
- Bidirectional converter (foreign → INR and INR → foreign)
- Last rate date, last refresh time (IST), and **Refresh**
- Day-over-day **% change** when Frankfurter history has a prior business day
- Mobile-friendly modern UI, no login

## Stack

- Vite + React + TypeScript
- [Frankfurter API](https://frankfurter.dev) — free ECB reference rates, **no API key**

## API used

Base URL: `https://api.frankfurter.dev/v1`

| Endpoint | Purpose |
| --- | --- |
| `GET /currencies` | Currency code → name map |
| `GET /latest?from=INR&to=USD,GBP,…` | Latest rates (foreign units per 1 INR; inverted in-app to INR per 1 foreign) |
| `GET /{start}..{end}?from=INR&to=…` | Recent timeseries for previous-day % change |
| `GET /latest?from={CODE}&to=INR` | Validate an added code |

Unsupported codes show a friendly error (Frankfurter only covers the ECB currency set).

## Run locally

```bash
cd inr-fx-daily
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

### Scripts

| Script | Command | Description |
| --- | --- | --- |
| Dev server | `npm run dev` | Hot-reload development server |
| Production build | `npm run build` | Typecheck + Vite build → `dist/` |
| Preview build | `npm run preview` | Serve the production build locally |

## Notes

- Rates are ECB reference rates via Frankfurter — informational only, not trading advice.
- Weekends/holidays use the last available business day.
