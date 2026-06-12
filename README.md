# thattime

The **That Time** product app — a booking/scheduling platform for beauty &
wellness businesses. Next.js 14 (App Router) + TypeScript + Tailwind.

The repo also holds the onboarding flow; the consolidation of the original
prototypes into this single app is tracked in [`context/PORTING.md`](./context/PORTING.md).
Team workflow and conventions live in [`context/WAYS_OF_WORKING.md`](./context/WAYS_OF_WORKING.md).

## Local development

```bash
npm install
npm run dev        # Turbopack dev server → http://localhost:3000
```

`npm run dev` uses **Turbopack** (`next dev --turbo`). If you ever need the
classic webpack dev server, use `npm run dev:webpack`.

Start at `/onboarding/welcome` (the root redirects there). From the end of
onboarding you land in the product app at `/app` — Home, Schedule, Clients,
Messages, the Hub (Services / Team / Marketing / Setup), and service creation
under `/new`.

## Other scripts

```bash
npm run build      # production build (Vercel runs this)
npm run lint       # eslint
npm run smoke      # lightweight render check of ported screens (react-dom/server)
```

`npm run smoke` renders the ported pages and asserts key content — a fast
sanity check that doesn't need the full dev server.

## Deploy

Vercel auto-detects the Next.js app at the repo root — import the repo and
deploy, no extra configuration needed.
