# Consolidation — port tracker

Repurposing this repo into **one Next.js + TypeScript product app**. The live
app is `that-time-onboarding/` (Next 14, App Router, TS). The legacy
`that-time-app/` (Vite + React Router, JS) is kept **only as the porting source**
for the screens below and is deleted once they land.

See `memory/thattime-consolidation.md` for the why.

## Done

- **Phase 0** — gitignore, flattened nested repos, pushed clean monorepo.
- **Phase 1** — unified design tokens (`tailwind.config.ts`, `globals.css`,
  `src/lib/tokens/categories.ts`). Onboarding's system is canonical; the
  product's service-category palette folded in as a separate `category.*` scale.
- **Phase 2** — shared domain types in `src/lib/types/` (`business`, `staff`,
  `client`, `offer`). `store.ts` sources its enums from here (single source of
  truth).
- **Phase 3** — `/app` route group: `AppFrame` + `AppTabBar` shell.
- **Phase 4 (in progress)** — ported screens (JS→TS, react-router→App Router),
  each rendered green by `npm run smoke`:
  - Hub → `/app/hub` (back-nav)
  - Home dashboard → `/app` (`lib/data/home.ts`)
  - Clients directory → `/app/clients` (`lib/data/clients.ts`; validates `ClientListItem`)
  - Team roster → `/app/team` (`lib/data/team.ts`; validates `Staff` enums)
  - Messages → `/app/messages` (`lib/data/messages.ts`)
  - Schedule "My Day" agenda → `/app/schedule` (`lib/data/schedule.ts`)
  - Client profile → `/app/clients/[id]` (`lib/data/clientDetail.ts`)
  - Conversation thread → `/app/messages/[id]` (`lib/data/conversationThreads.ts`)
  - Service wizard → `/new` → `/new/basics` → `/new/price` (`useWizardStore`)
  - **Milestones reached:**
    - Core app fully navigable — all four bottom tabs (Home, Schedule, Clients,
      Message) + Team + Hub + onboarding → `/app/hub` handoff.
    - Three complete user flows: **Clients** (list → profile), **Messages**
      (list → thread), **service creation** (type → basics → price → create).
    - A representative of every screen type is now ported (dashboard, list,
      detail, chat, multi-step wizard) — the pattern is proven end to end.
  - **Pattern established:** port the screen self-contained (typed `lib/data/*`,
    shared tokens), defer cross-screen *mutations* (block/import/merge, edits)
    to a future shared app-state slice, add a smoke render. Replicate per screen.
  - **Still to port (the bulk):** detail screens (Client profile, Conversation,
    full Schedule calendar views, Team schedule/pay tabs), Marketing, B2C client
    view, and the 20-screen **service wizard** + 40+ module screens. The wizard
    is the next major effort and needs the shared draft/app-state slice built
    first (planned: a Zustand `useAppStore` slice, mirroring the legacy App.jsx
    Outlet context — draft, savedOffers, teamMembers, client mutations, toasts).
- **Local testing** — `npm run smoke` renders the ported pages with
  `react-dom/server` (bypasses Next's compiler) and checks shared tokens.
  Currently 22 checks, all passing. **Note:** `next dev`/`next build` hang in
  some environments (observed with Node 20 & 24) — the smoke test is the
  fallback runtime check; run `npm run dev` locally for the full click-through.

## Backlog — screens to port from `that-time-app/src/routes` (~135 files)

Port each into `that-time-onboarding/src/app/app/<route>/`, JS→TS, react-router
→ App Router (`useNavigate`→`useRouter`, `<Link>` from `next/link`,
`useOutletContext`→ a shared client context/store). Type the mock data it needs
into `src/lib/data/` as you go (do NOT bulk-port data ahead of screens).

| Group | Source | Notes |
|---|---|---|
| Home dashboard | `routes/main/Home.jsx` (+ `data/homeToday.js`) | up-next, stats, team-today |
| Schedule | `routes/main/Schedule.jsx` | calendar |
| Clients | `routes/main/Clients.jsx`, `routes/main/client/*` | uses `Client` type (done) |
| Team | `routes/Team.jsx`, `routes/team/*` | uses `Staff` type (done) |
| Service wizard | `routes/wizard/*` (20 screens) | the big one; needs `ClassDetails` typed |
| Offer dashboards | `routes/*Dashboard.jsx`, `routes/modules/*` | service/class/bundle/subscription |
| Marketing / B2C | `routes/Marketing.jsx`, `routes/ClientView.jsx` | public surfaces |
| Messaging | `routes/main/Messages.jsx`, `Conversation.jsx` | |
| Sheets / pickers | `components/sheets/*`, pickers | shared UI — promote to `components/ui/` |

## Shared context

`that-time-app/src/App.jsx` holds a single react-router `Outlet` context
(`draft`, `savedOffers`, `categories`, `teamMembers`, `teamRequests`, …). Port it
to a React context provider (or extend the Zustand store) wrapping `/app`.

## Cleanup (after the relevant ports land)

- Remove `that-time-onboarding/src/app/setup-hub/` — superseded by `/app`.
- Delete unused Geist font files in `src/app/fonts/` (the app renders the system
  stack; see Phase 1).
- Decide on `owner-onboarding/` + `owner-onboarding/B2C/` — separate design
  explorations (coral/Inter), not part of this lineage. Remove or archive.
- Delete `that-time-app/` once its screens are fully ported.
- Promote `that-time-onboarding/` to the repo root.

## `ClassDetails`

Deliberately left open (`[key: string]: unknown`) in `src/lib/types/offer.ts`.
Type it fully when porting the class wizard/dashboard screens.
