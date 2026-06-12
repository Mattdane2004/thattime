# Matt status — handoff for Austin

_Latest status from the UX/screens side. Overwritten each session._

## This morning's work
- **Onboarding rebuilt** to the new Figma flow (B2B owner, staff join, B2C client) — `components/onboarding2` + `lib/store/onboarding2.ts`, route-per-screen under `app/onboarding/*`.
- **Mid-fi product app screens** (Figma 11990-94642): Home, Schedule, Clients (list + detail), Messages (list + thread), Checkout, Notifications, Quick-add — under `app/app/*`.
- **Interaction polish rounds:** appointment details sheet everywhere; Up-Next lifecycle queue; schedule filters + 12/24h clock + calendar layouts; clients command-centre (structured allergies, wallet/loyalty, documents/notes+images, settings); notifications accept-linger + working tabs; messages client/business split; lunch-break swipe-away.
- **Checkout:** services multi-select, products keep qty steppers; customer tip sheet; selectable discount cards; **Bank transfer → "Other"** with editable amount; **gift card now takes code + amount**; **time-off = 2-step flow** (type + date range, then per-day full/half).
- **Cleanup branch:** retire the old onboarding flow + stale routes, data-dedupe proposal.

## Where it lives (routes/files — fits WAYS_OF_WORKING.md)
- `src/app/{onboarding,app,client}/**` — all screens (one `page.tsx` each).
- `src/components/onboarding2/**` — onboarding shell/controls (+ migrated `MobileFrame`/`RouteTransition` on the cleanup branch).
- `src/components/app/**` — product chrome I reuse: `AppFrame`, `AppTabBar`, `AppointmentSheetHost`, `QuickActions`, `UpNextCard`, `ui.tsx`.
- `src/lib/data/product.ts` — **one** screen-data module (services, products, clientRows, pastAppointments, forms, agenda/grid, conversations, notifications, clientNotes).
- `src/lib/store/appStore.ts` (product) + `onboarding2.ts` (signup) — **one store per concern**.

## How I build a screen
`page.tsx` composes existing chrome (`AppFrame`/`AppTabBar`/`AppointmentSheetHost`) + local `useState` for sheet/step flow + Zustand (`useAppStore`) for cross-screen state; demo data imported from `lib/data/product.ts`. Inline Tailwind for now, **tokens only** (`bg-navy`, `text-muted`, `border-border` — no hex). Gate `tsc + next lint + smoke` green before every commit. **No new parallel data/store modules** — I extend `product.ts`/`appStore.ts`.

## Status / needs Austin
- **Not in `main` yet (please merge or tell me to):**
  - **PR #2 `onboarding-cleanup`** — open, mergeable. Deletes `src/components/onboarding/*`, `src/lib/store.ts`, `src/lib/savings.ts` (all verified 0 importers), removes `/home`, `/setup/[slug]`, `/client-placeholder`. `main` still has all of these.
  - **4 commits on `onboarding`** beyond the manual merge cut (`0709952`): status dropdown, selectable discount cards, "Other" payment, gift-card + 2-step time-off. PR #1 shows "open" on GitHub but its earlier content is already in `main`.
- **I did NOT touch your lane:** `src/components/ui/**`, `tailwind.config.ts`, `src/lib/tokens/**`, `src/app/globals.css` — untouched.
- **Shared `lib/data` dupe (your call):** `product.ts` (mine, 12 importers) vs `offers.ts`/`products.ts` (yours, ~7). Proposal in **`docs/data-dedupe-proposal.md`** — `offers.ts` becomes canonical catalogue, `product.ts` shrinks to screen-data via a thin adapter so my importers don't change. **Nothing migrated — needs your sign-off.**

## Open questions
1. Which flow should I build next, and are there frames? (awaiting before I start `ux-<flow>`.)
2. Data-dedupe: agree `offers.ts` canonical? Then I'll do the `product.ts` adapter on my side.
3. Merge order for cleanup vs your `rollout` — confirm nothing still imports the old flow before PR #2 lands.

## Branches / PRs
- **PR #1** `onboarding` → content in `main`; **4 later commits still pending.**
- **PR #2** `onboarding-cleanup` → open, mergeable, **not in `main`.**
