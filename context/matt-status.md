# Matt status — handoff for Austin

_Latest status from the UX/screens side. Overwritten each session._

## This session (12 June, afternoon)

Two branches, two PRs, both gate-green (tsc + lint + smoke) and verified in dev.
Nothing merged — both left for you.

### 1. PR #3 — `ux-data-adapter` (the agreed dedupe)
- **offers.ts is now the canonical catalogue.** It gains the six salon services
  the mid-fi screens book by name (Cut & Style, Cut & Colour, Blow Dry & Style,
  Colour Treatment, Haircut, Cut & Beard) — categorised with the
  `lib/tokens/categories.ts` vocabulary (Hair / Colour / Barbering).
- **product.ts `services`/`serviceCategories` are derived views** of offers.ts
  (published, duration-bearing services only). Same shapes — none of the 12
  importers changed. Appointment lookups by name (price/duration/category) all
  resolve.
- Visible effect: booking pickers (checkout add-service, quick-add,
  appointment-sheet catalogue) now list the full 16-service catalogue; schedule
  filter chips derive from catalogue categories.
- **Left for you:** folding the retail lists (`product.ts#products` →
  `products.ts`), per docs/data-dedupe-proposal.md.

### 2. PR #4 — `ux-client-booking` (new flow, my pick)
The consumer side of the core loop — a client books an appointment:
- `/client/business` — Salon Soho profile (hero, rating, services from
  offers.ts, team strip from team.ts, about/hours, reviews, sticky Book CTA;
  per-service Book preselects it).
- `/client/book` → `professional` → `time` → `review` → `confirmed` —
  route-per-screen like the signup flow, composing onboarding2 chrome
  (Screen/Title/PrimaryButton/SelectCard). Multi-select services with running
  total; Any professional + bookable roster; fixed demo day strip
  (Wed 4 – Sat 14 Mar 2026, Sundays closed) with deterministic slot thinning
  (SSR-safe, no Date()); review card; confirmed screen resets the draft.
- New files (greped first, no parallels): `lib/data/clientApp.ts`
  (client-facing presentation data ONLY — catalogue/roster stay in
  offers.ts/team.ts) and `lib/store/clientBooking.ts` (booking draft store).
- Client home cards parameterized and now open the profile (was a dead-end
  push to /client/signup).
- smoke.tsx covers all six screens.

## Merge notes
- PRs #3 and #4 are **independent** — either order works. #4 reads offers.ts
  directly; once #3 lands the salon six appear in the client pickers too.
- I did **not** touch your lane: `src/components/ui/**`, `tailwind.config.ts`,
  `src/lib/tokens/**`, `src/app/globals.css` (read categories.ts only).
- This status file rides on the `ux-client-booking` branch (my account can't
  push to org main — fork + REST API PRs as before).

## Open questions
1. The chrome `CheckCircle`/`PrimaryButton` still carry `bg-[#111]` hexes from
   the original onboarding build — flagging for your token rollout rather than
   touching them mid-flight.
2. Client home tab bar (Home/Find/Message/Schedule) is still inert — Find
   (search/browse) feels like my next flow unless you'd rather I take
   something else.
3. The `/app/b2c` placeholder could now deep-link into `/client/home` since
   the client side has a real loop — say the word and I'll wire it.

## Branches / PRs
- **PR #3** `ux-data-adapter` → open, independent, small.
- **PR #4** `ux-client-booking` → open, contains this status file.
