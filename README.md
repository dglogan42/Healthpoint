# Healthpoint Finder

A Google Maps–linked healthcare and community services locator for Aotearoa New Zealand. Search for chemists, GPs, physios, urgent care, NGOs, ACC/WINZ assistance, and community support near you — powered by [Healthpoint](https://www.healthpoint.co.nz/) data.

## Features

- **Interactive map** — color-coded pins by provider type (Google Maps)
- **Healthcare finder** — pharmacy, GP, physio, chiropractor, dentist, optometrist, mental health, allied health
- **24h / urgent & after-hours** — emergency departments, accident clinics, after-hours GPs and pharmacies
- **Community Services Locator** — 20+ service types (food support, housing, disability, counselling, Kaupapa Māori, youth, and more)
- **NGOs & private healthcare** — community health organisations and private hospitals
- **ACC / WINZ assistance** — injury cover providers and MSD service centres
- **Essential helplines** — tap-to-call 111, Healthline, 1737, Lifeline, and more
- **Voice search** — browser speech recognition with optional Gemini natural-language parsing
- **Accessibility** — skip links, screen reader announcements, keyboard navigation, WCAG-focused markup

## Quick start

### Prerequisites

- Node.js 20+
- npm

### Install and run

```bash
cd healthpoint-finder
npm install
cp .env.example .env
# Edit .env with your API keys (see below)
npm run dev
```

- **Frontend:** http://localhost:5173/
- **API:** http://localhost:3002/

The app runs in **demo mode** without API keys, using sample NZ provider data around Auckland, Wellington, and Christchurch.

## Environment variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_GOOGLE_MAPS_API_KEY` | For map | Google Maps JavaScript API |
| `GOOGLE_GEOCODING_API_KEY` | Optional | Address search (can reuse Maps key) |
| `HEALTHPOINT_API_KEY` | Optional | Live Healthpoint FHIR data — [register](https://www.healthpointapi.com/get-started) |
| `HEALTHPOINT_BASE_URL` | Optional | Healthpoint FHIR endpoint (default: UAT) |
| `GEMINI_API_KEY` | Optional | Smarter voice search parsing — [get key](https://aistudio.google.com/apikey) |
| `PORT` | Optional | API server port (default: `3002`) |

## Voice search

1. Open the app in **Chrome** or **Edge**
2. Click **Voice search** below the address field
3. Say e.g. *"find a chemist near Ponsonby"* or *"food bank in Auckland"*

With `GEMINI_API_KEY` set, voice queries are parsed into location, category, and service type. Without it, a local keyword parser is used.

**Siri (iPhone):** Ask Siri to open the page in Chrome, then use the voice search button. Siri cannot invoke web speech APIs directly.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend + API in development |
| `npm run build` | Build client and server for production |
| `npm start` | Run production API server |
| `npm run preview` | Preview production frontend build |
| `npm run a11y:static` | Run static accessibility checks |
| `npm run a11y:test` | Run WCAG 2.0 AA audit (requires Chrome) |

## Project structure

```
healthpoint-finder/
├── src/                    # React frontend
│   ├── components/         # UI components (map, search, filters, voice)
│   ├── hooks/              # Data fetching, geolocation, voice search
│   └── types/              # Shared TypeScript types
├── server/                 # Express API
│   └── src/
│       ├── data/           # Categories, demo providers, helplines
│       ├── routes/         # API routes
│       └── services/       # Healthpoint FHIR, geocoding, voice parsing
├── scripts/                # Accessibility audit scripts
└── .env.example            # Environment template
```

## Data sources

- [Healthpoint](https://www.healthpoint.co.nz/) — NZ national health services directory
- [Family Services Directory](https://www.familyservices.govt.nz/directory/) — MSD community services (linked)
- Demo provider data when live API keys are not configured

## Disclaimer

This app is **not** for clinical decision-making. Always call **111** in an emergency. Verify provider details on Healthpoint or by contacting the service directly.

## License

MIT License — see [LICENSE](LICENSE).

Copyright (c) 2026 David Logan