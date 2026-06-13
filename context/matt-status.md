# Matt status — handoff for Austin

_Latest status from the UX/screens side. Overwritten each session._

## Landed (merged to main — thanks for the merges)
- **PR #3** data dedupe: offers.ts is the canonical catalogue, product.ts derives.
- **PR #4** client booking flow (B2C: profile → services → professional → time → confirmed).
- **PR #5** AppHeader avatar → business hub.
- **PR #6** client detail reorg (Overview / Appointments / Record).

## Pending — PR #7 (`ux-client-record` → main, gate green, mergeable/no conflicts)
The whole UX/screens body of work, landed as a clean base for the component-library
migration. Full history kept (no squash). Latest four commits this session:

1. **Retire legacy client surfaces, consolidate on `/c`** — removed the `/app/b2c`
   placeholder, the old `/client/book/*` flow, `/client/business`, and the legacy
   `/client/home` (now a redirect to `/c/home`); dropped the unused clientBooking
   store; repointed onboarding entry points (intent → `/client/signup`,
   verify → `/client/setup`).
2. **History-based back navigation** — every fixed back-arrow now uses
   `router.back()`; `AppointmentSheet` *suspends* (instead of closing) when the
   user detours to a client profile / message thread and restores with full state
   on back; tab nav clears a suspended detour.
3. **Ported Hub / Offerings / Team / wizard** from the parallel design branch
   (worktree `competent-hellman-b98ef2`): Hub "Menu" (this-week stats + Profile
   tab), Offerings (Services/Classes/Bundles/Subscriptions tabs + Settings page),
   Team (Members/Shifts/Pay + member detail: schedule/permissions/pay + pay runs),
   reworked offer-creation wizard (intro + type + class-pricing + WizardChrome).
   New stores: `offersStore`, `teamStore`. "Switch to B2C" → `/c/home`.
4. **Smoke checks** updated for the `/c` surfaces and the ported Hub/Team/Offerings.

Earlier on the branch: the full **B2C consumer app** under `/c/*` (home feed,
stories, explore, salon social pages, type-aware booking, checkout, bookings,
inbox, profile, settings) backed by `src/lib/data/b2c.ts`; the client-section
rounds 2–4; the full-page booking takeover; and the `dev:preview` second-server
tooling.

**Gate (what Vercel runs):** `tsc --noEmit` ✅ · `next lint` ✅ (no unused-var
errors) · `npm run smoke` ✅.

## Notes for the component-library migration
- Heaviest screens to migrate: `app/clients/*`, `components/app/AppointmentSheet.tsx`
  (full-page booking view), `app/schedule/page.tsx`, the new `app/c/*` consumer
  surfaces, and `app/app/{hub,services,team}` + `app/new/*` (ported).
- Recurring patterns ripe for `components/ui`: chip-select rows, toggle rows,
  full-page takeover shell (header/body/footer), record-section heading + action,
  severity slider, the new social card / story / offer-strip primitives in `/c`.
- New shared client bits already extracted: `components/client/{ClientTabBar,shared}.tsx`
  (Avatar, Stars, OfferTypeBadge, GridTile) — candidates to fold into your library.
- I did NOT touch your lane (`components/ui/**`, tailwind config, tokens,
  globals.css) — read `tokens/categories.ts` only (service accent bars).

## Open questions
1. **Merge PR #7 when ready** — mergeable, no conflicts, gate green. I'm read-only
   on the org repo so the merge click is yours.
2. `/c/*` (consumer app) is now canonical for B2C; `/client/*` is just the signup
   onboarding that hands off into it. The old `/client/home` is a redirect — safe
   to delete once nothing references it.
3. The ported Hub/Team/wizard came from another in-progress worktree; its own
   session may still have that work uncommitted on `claude/competent-hellman-b98ef2`.
   Files now match what's in PR #7, so a later PR from that branch should be a
   trivial merge — worth a heads-up to whoever owns it.
