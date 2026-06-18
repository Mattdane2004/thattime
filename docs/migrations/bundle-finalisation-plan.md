# Bundle finalisation plan

> **Status — all phases shipped & verified (2026-06-17).** B0 data model +
> `estimateBundle`, B1 Order & gaps wizard step (drag-reorder + per-service sheet +
> connectors), B2 pricing (Total value + Require deposit), B3 tabbed dashboard
> (Overview timeline + Advanced inherited forms/resources) and the
> `/app/services/[id]/order` editor route. Gate green; live-verified via SPA.

Bring the **bundle** offer type up to the same fidelity the service flow now has.
Three feedback areas, mapped to four Figma frames in file `6HHqcoM9m33N8Kz4R5E4tO`:

| # | Area | Figma node | What it adds |
|---|------|-----------|--------------|
| 1 | **Order & gaps** (new wizard step) | `12231-52864` | Order the services, add time gaps, link two services to run together, split into separate-day bookings — all editable from a per-service bottom sheet, with a visual timeline. |
| 2 | **Pricing** (existing step, updates) | `12231-52996` | Fixed `£` vs discount `%` (already present), **+ "Total value £X · N services" subline**, **+ "Require deposit" toggle**. |
| 3 | **Bundle dashboard** (Overview) | `12231-53053` | Tabbed dashboard. Overview = ready-to-publish card, Price, Included services, **Order & gaps timeline**. |
| 3 | **Bundle dashboard** (Advanced) | `12231-53287` | Advanced tab = **Forms inherited from services**, **Resources inherited from services**, Bundle settings. |

> Standing rule: pull each frame, review, lock decisions via questions, then build —
> model + page → smoke needle → `npx tsc --noEmit && npx next lint && npm run smoke`
> green → verify live via SPA clicks → screenshot. One phase at a time.

---

## Current state (grounding)

- **Wizard flow** is `basics (1) → bundle-services (2) → bundle-pricing (3)`,
  `TOTAL_STEPS.bundle = 3`. `bundle-services` already does fixed/flexible kind +
  multi-select; `bundle-pricing` already does the fixed/discount toggle and create.
  ([bundle-services](src/app/new/bundle-services/page.tsx),
  [bundle-pricing](src/app/new/bundle-pricing/page.tsx))
- **Draft model** `BundleDraft` = `{ kind, serviceIds, chooseCount, priceMode,
  discountPercent }`. `serviceIds` is an array but order is not yet meaningful.
  ([wizardStore](src/lib/store/wizardStore.ts:98))
- **Persisted snapshot** `DemoOffer.bundle` mirrors those five fields; written by
  `offerFromDraft` (which also computes the discounted `price`).
  ([offers](src/lib/data/offers.ts:151), [offersStore](src/lib/store/offersStore.ts:75))
- **Dashboard** is the shared `/app/services/[id]` page. Bundles render
  `BundleSummary` (two rows: included services + pricing) inside the single-scroll
  layout. **No tabs, no timeline, no inherited rows yet.**
  ([dashboard](src/app/app/services/[id]/page.tsx:296))

So the work is: **one new wizard step + ordering data model**, **two small pricing
additions**, and a **bundle-specific tabbed dashboard** that reuses existing module
routes for the inherited/settings rows.

---

## Data model changes (shared across all three phases)

> **Decisions locked** (see questions at the foot of this doc): the relationship is
> anchored to the service **below** (`links[i]` = what happens *after*
> `serviceIds[i]`), so `links.length === serviceIds.length` and the **last** row may
> still carry trailing extra time. Reorder is **drag-and-drop + up/down**. Inherited
> forms/resources are **inherited (read-only) + bundle-level (editable)**. `linked`
> means **run concurrently**.

Add an ordered link list describing the relationship **after each service**.
`links[i]` describes what happens after `serviceIds[i]` → `serviceIds[i+1]`
(so `links.length === serviceIds.length`). The final entry only supports
`back_to_back` / `gap` (no following service to link or split from).

```ts
// wizardStore.ts + offers.ts
export type BundleLinkKind =
  | "back_to_back"  // default — the next service runs straight after this one
  | "gap"           // extra time after this service (gapMin); valid on the last row too
  | "linked"        // the next service runs at the SAME time as this one (overlap)
  | "separate";     // the next service is a separate booking, gapDays later (multi-day)

export interface BundleLink {
  kind: BundleLinkKind;
  gapMin?: number;   // kind === "gap"      → e.g. 60
  gapDays?: number;  // kind === "separate" → e.g. 2
}
```

- `BundleDraft` gains `links: BundleLink[]`. `DemoOffer.bundle` gains the same.
- `offerFromDraft` copies `links`. When `serviceIds` changes in `bundle-services`,
  keep `links` in sync (truncate/pad with `back_to_back`). Reordering on the Order
  page reorders `serviceIds` and `links` together.
- **Timeline estimate** (`estimateBundle(serviceIds, links, offers)`): walk the
  list; `back_to_back`/`gap` add the next service's duration (+ `gapMin`);
  `linked` overlaps so it adds `max(0, nextDur − prevDur)` to the *current visit*;
  `separate` closes the current visit and starts a new one. Returns total minutes
  per visit + number of visits → renders "Estimated 2h 30m" (and "over N days"
  when any `separate` exists). Pure, SSR-safe, lives in `src/lib/data/bundles.ts`.

---

## Phase B1 — Order & gaps wizard step  · Figma `12231-52864`

**New route** `/new/bundle-order`, inserted between `bundle-services` and
`bundle-pricing`. `TOTAL_STEPS.bundle: 3 → 4`. Renumber: services `step={2}`,
**order `step={3}`**, pricing `step={4}`. Wire `bundle-services` Next →
`/new/bundle-order`; `bundle-order` Back → `/new/bundle-services`, Next →
`/new/bundle-pricing`; `bundle-pricing` Back → `/new/bundle-order`.

**Screen** (`WizardTitle` "Order & gaps" / "Drag services into order and add breaks
or overlaps between them."):
1. **Estimated bundle timeline** card at top — "Estimated 3 hours" from
   `estimateBundle`.
2. **Ordered service list** — each row: drag handle, service glyph, name,
   "`{dur}m · £{price}`", a 3-dot menu (opens the editor sheet).
3. **Visual connectors** between rows, driven by `links[i]`:
   - `back_to_back` → rows simply stacked (no connector).
   - `gap` → a **small dotted line** segment under the row with a "`{gapMin}m extra
     time`" pill.
   - `linked` → a **solid vertical line joining the two rows** with a "Linked" label
     (they run at the same time).
   - `separate` → a **horizontal rule** across the list with a "`{gapDays}-day gap`"
     label (a new booking/visit starts below).

**Per-service editor sheet** (frame-scoped `Sheet`, pinned footer) — opened from a
row's 3-dot. Lets you:
- **Move up / Move down** (reorders `serviceIds` + `links` together).
- **Timing / linking to the next service** — segmented control over the four
  `BundleLinkKind`s; `gap` reveals a minutes input, `separate` reveals a days input.
  On the **last** row, only `back_to_back` / `gap` (trailing extra time) are offered.
- Save / Reset, consistent with the settings/variant sheets.

**Drag-and-drop reorder** (in addition to the sheet's up/down): the rows support
pointer-driven drag — the grabbed row lifts (shadow + scale) and the other rows
animate via `translateY` to open a slot; dropping commits the new order to
`serviceIds` + `links`. Implemented with pointer events + transforms (no library),
SSR-safe. Up/down in the sheet remains the keyboard-accessible fallback.

---

## Phase B2 — Pricing step updates  · Figma `12231-52996`

Keep the existing fixed/discount toggle and create logic. Add:
1. **"Total value £X · N services" subline** under the title (the summed list price;
   we already compute `sumPrice`). Replaces the current
   "`N services · £X if bought separately`" subtitle to match the frame's "Pricing
   style" + "Total value £105.00 · 4 services".
2. **"Require deposit" toggle** at the bottom — reuses the existing
   `draft.depositEnabled` / `depositAmount` / `depositType` fields (currently only
   collected for service/class). When on, reveal the amount + £/% control already
   used elsewhere, and have `offerFromDraft` carry `offer.deposit` for bundles too
   (today it's gated to service/class — extend to bundle).
3. Footer stays "Create bundle" but at `step={4}` / `total=4`.

---

## Phase B3 — Bundle dashboard (tabs)  · Figma `12231-53053` + `12231-53287`

The shared `/app/services/[id]` page gains a **bundle-only tabbed layout** (other
types keep today's single scroll). When `offer.type === "bundle"`, render
**Overview / Advanced** tabs between the offer header and the Preview/Publish footer.

### Overview tab · `12231-53053`
- **Ready-to-publish card** — "Bundle setup is complete." success card (shown when
  the bundle has ≥2 services + pricing set; otherwise a "finish setup" variant).
- **Price row** — "10% off · list value £105" (discount) or "£50 fixed · list value
  £105". Taps the existing `PriceDurationSheet` (or a bundle price sheet).
- **Included services row** — "4 selected · Classic haircut, Colour consultation +2
  more". Taps back into selection (sheet or `/app/services/[id]/services`).
- **Order & gaps section** — the **read-only timeline** (same connectors as B1:
  linked lines, dotted gap segments, separate-day rules) + "Estimated 2h 30m". Tap
  → **`/app/services/[id]/order`** to edit (reuses the B1 editor on the saved offer
  via `updateOffer`, mirroring how location/staff were extracted).

### Advanced tab · `12231-53287`
- **Forms inherited from services** — "Review forms inherited from N services".
  Aggregate `offer.forms` across the component services (read-only, grouped by
  service) **plus** the bundle's own `offer.forms` editor on top. Row →
  `/app/services/[id]/forms`, which renders an "Inherited from services" section
  above the bundle's own attach-forms section when `offer.type === "bundle"`.
- **Resources inherited from services** — "Review resources inherited from N
  services". Same pattern over `offer.resources` → `/app/services/[id]/resources`.
- **Bundle settings** — "Booking rules, payments, policies" → existing
  `/app/services/[id]/settings`.

> Inherited aggregation is **derived read-only** from the component services'
> persisted `forms` / `resources` (count = number of component services that have
> any); the bundle's own additions live in its own `offer.forms`/`offer.resources`
> and stay fully editable.

---

## Build order & checkpoints

1. **B0 model** — `BundleLink`/`links` on draft + offer; `estimateBundle` in
   `src/lib/data/bundles.ts`; keep `links` in sync on selection change. Gate green.
2. **B1** — `/new/bundle-order` page + editor sheet + connectors; renumber steps;
   `TOTAL_STEPS.bundle = 4`. Smoke needle for the new step. Verify SPA flow
   basics → services → order → pricing.
3. **B2** — pricing subline + deposit toggle; extend `offerFromDraft` deposit to
   bundle. Verify create persists deposit + links.
4. **B3** — bundle tabbed dashboard (Overview timeline + Advanced inherited rows) +
   `/app/services/[id]/order` editor route. Smoke needles. Verify on a seeded
   bundle (`bun_cut_colour`) and a freshly-created one.

Each checkpoint: `npx tsc --noEmit && npx next lint && npm run smoke` green, then
live SPA verification + screenshot before moving on.

---

## Decisions (resolved 2026-06-17)

- **Q1 — Link anchor → service BELOW.** The per-service sheet edits the relationship
  to the **next** service ("what happens after this service?"). `links[i]` is the
  after-config of `serviceIds[i]`. The **last row can still add trailing extra
  time** (gap only — linked/separate are hidden there).
- **Q2 — Reorder → drag-and-drop AND up/down.** The list supports pointer
  drag-and-drop with a clear live reorder animation (the dragged row lifts and
  others shift to make room), **and** the sheet has Move up / Move down.
- **Q3 — Inherited forms/resources → inherited + bundle-level.** The Advanced rows
  show forms/resources **inherited** from the component services (read-only, linking
  through to each) **and** let the bundle attach **its own** bundle-level
  forms/resources on top (reusing the existing forms/resources editors on
  `offer.forms` / `offer.resources`).
- **Q4 — Linked → concurrent.** Two linked services run at the same time; the
  timeline counts them once, taking the longer duration (e.g. haircut + face mask).
