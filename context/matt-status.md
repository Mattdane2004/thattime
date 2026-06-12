# Matt status — handoff for Austin

_Latest status from the UX/screens side. Overwritten each session._

## Landed (merged to main — thanks for the merges)
- **PR #3** data dedupe: offers.ts is the canonical catalogue, product.ts derives.
- **PR #4** client booking flow (B2C: profile → services → professional → time → confirmed).
- **PR #5** AppHeader avatar → business hub.
- **PR #6** client detail reorg (Overview / Appointments / Record) — merged at its
  first commit; the rest of that branch continues below.

## Pending — PR #7 (`ux-client-record`, synced with main, gate green: 259 smoke checks)
One branch, four logical chunks (full history kept, no squash):
1. **Client section rounds 2–4** (Matt's UX feedback): list bulk actions (tag
   picker / block-with-reason / unblock / delete-confirm, inline filter chips);
   profile header identity-first with sticky section nav; Overview dashboard
   (allergy strip → compact next-appt card with 3-dot sheet → stats → attention
   rail → Manage); dedicated **wallet / reviews / settings** pages; record flows
   (allergy: free text + reaction dropdown + severity slider; full patch-test
   flow; datable notes).
2. **Booking page**: full-page takeover in our own language — lifecycle step row
   for status, Message/Reschedule/Cancel tiles, category-accented services,
   contextual Save (only after edits), notes & photos → client record.
   **Classes** open the same way from Schedule.
3. **B2C consumer app** (`/c/*`, built via Codex — commit cb656d5): home feed,
   explore, bookings, checkout, confirmed, create, inbox.
4. **Tooling**: `npm run dev:preview` runs a second dev server beside the primary
   (own `.next-preview` dist dir + autoPort) — lets Claude/Codex preview without
   fighting your `npm run dev` over port 3000 or the build cache.

## Notes for the component-library migration
- Heaviest screens to migrate: `app/clients/*` (list, detail + wallet/reviews/
  settings), `components/app/AppointmentSheet.tsx` (now a full-page booking
  view), `app/schedule/page.tsx` (class page is a full-page takeover too).
- Recurring patterns ripe for `components/ui`: chip-select rows, toggle rows
  (settings), full-page takeover shell (header/body/footer), record-section
  heading + action, severity slider.
- I did NOT touch your lane (`components/ui/**`, tailwind config, tokens,
  globals.css) — read `tokens/categories.ts` only (service accent bars).

## Open questions
1. Merge PR #7 when you're ready — it's self-contained and synced; main stays
   green (gate run on the merged state).
2. `/c/*` (consumer app) vs `/client/*` (B2C signup + booking flow) now overlap —
   worth a decision on which becomes canonical before screens migrate.
