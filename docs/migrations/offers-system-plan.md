# Offers System — Staged Implementation Plan

> ⚠️ **REVISED — staging superseded (2026-06-15).** A critical review folded this per-type 9-stage structure into the concern-based phases in [`offers-system-migration.md` §20](offers-system-migration.md) (the authoritative plan). The per-stage detail below is still useful background, but **follow §20 + the §20.0 decision gate** for execution. Key change: per-type dashboard work was consolidated (four stages → one phase) to avoid four stages editing the same dashboard file.

> **Based on:** [`offers-system-migration.md`](offers-system-migration.md) (the master spec / source of truth).
> **Grounded in:** [`offers-system-gap-analysis.md`](offers-system-gap-analysis.md).
> **Date:** 2026-06-15
> **Status:** Plan only — no implementation files changed.
> **Covers:** Services, Classes, Bundles, Subscriptions — shared foundation first, then type-specific.

## How to read this plan

- **9 stages**, grouped **shared foundation (1–3) → type-specific (4–7) → cross-cutting finish (8–9).**
- **One shared offers architecture** throughout — no per-type forks of shared infrastructure. Type behaviour is *configuration + screen-local composition*, never duplicated primitives.
- Every stage ends green on the quality gate: `npx tsc --noEmit && npx next lint && npm run smoke`.
- **One stage at a time.** Stage 1 is the hard gate; nothing type-specific is meaningful until the data seam carries real data.

**Dependency spine:**
```
1 (data seam) ─→ 2 (list/selector) ─→ 3 (wizard shell + shared steps + shared dashboard)
                                            │
                          ┌─────────────────┼─────────────────┐
                          ▼                 ▼                 ▼
                    4 (services)      5 (classes)       6 (bundles)   7 (subscriptions)
                          └─────────────────┴─────────────────┴───────────────┘
                                            ▼
                                   8 (related, modules write-back, preview, publish)
                                            ▼
                                   9 (integration, a11y, responsive, cleanup)
```
Stages 4–7 are independent of each other once 3 is green (can be done in any order or parallelised by lane). 1→2→3 are strictly sequential.

---

## Stage 1 — Shared offers data model, persistence & type handling

### Goal
Widen the persisted record and the create seam so **every** offer type round-trips the data its wizard collects. This is the keystone: it unblocks all four dashboards.

### Why now
Nothing downstream is real until the data exists. Today `offerFromDraft` drops all type-specific fields, so class/bundle/subscription persist only name/category/price/icon. Every later stage reads this data.

### Files likely to change
- `src/lib/data/offers.ts` — widen `DemoOffer` with optional fields
- `src/lib/store/offersStore.ts` — rewrite `offerFromDraft` per-type branches; use id helper
- `src/lib/ids.ts` *(new)* — SSR-safe id helper
- `src/lib/store/wizardStore.ts` — import `MobileSettings`/`ClassDraft`/`SubscriptionDraft` types for reuse (no shape change yet)
- `smoke.tsx` — per-type `offerFromDraft` round-trip assertions

### Existing components to reuse
None (data/store only). Reuse existing types: `MobileSettings`, `ClassDraft`, `BundleDraft`, `SubscriptionDraft` from `wizardStore.ts`.

### New components required
None. `src/lib/ids.ts` is a utility module:
```ts
let seq = 0;
export const nextId = (prefix: string) => `${prefix}_${String(++seq).padStart(4, "0")}`;
```

### Offer types affected
All four.

### Data/state/persistence changes
Add to `DemoOffer` (all optional → back-compatible with 23 seeds):
```ts
description?: string;
deposit?: { enabled: boolean; amount: string };
locationModes?: { inSalon: boolean; mobile: boolean; remote: boolean };
locationIds?: string[];
mobile?: MobileSettings;
staffIds?: string[];
durationMin?: number;                 // already present; now carried for class too if modelled
classDetails?: ClassDraft;
bundle?: { kind: "fixed" | "flexible"; serviceIds: string[]; priceMode: "fixed" | "discount"; discountPercent: string };
subscription?: SubscriptionDraft;
```
Rewrite `offerFromDraft` so each `type` branch carries its sub-block (service: location/deposit/staff; class: + `classDetails`; bundle: + `bundle` snapshot, keep discount math; subscription: + `subscription` snapshot). Replace `Math.random()` id with `nextId(prefix)`.

### Routes affected
None.

### Testing steps
1. `npx tsc --noEmit` — zero new errors across all 23 seeds + reader screens
2. `npm run smoke` — existing needles pass + new per-type round-trip assertions
3. Smoke each type: a filled draft → `offerFromDraft` → object carries the type's fields; an `emptyDraft` → no crash

### Acceptance criteria
- [ ] `DemoOffer` has all optional fields; seeds + consumers compile unchanged
- [ ] `offerFromDraft` carries the correct sub-block for each of the four types
- [ ] Ids come from `nextId`; no `Math.random()` in `offersStore`
- [ ] Quality gate green

### Risks
- **Type leakage:** `ClassDraft`/`SubscriptionDraft` snapshots embedded in `DemoOffer` couple data shapes — acceptable (single source), but keep them optional. **Mitigation:** optional fields + `tsc` over all readers.
- **Seed compatibility:** a non-optional field would break 23 seeds. **Mitigation:** every new field optional.

---

## Stage 2 — Shared routes, catalogue/list tabs & type selector

### Goal
Confirm and lock the shared entry surface: catalogue tabs for all four types, type selector that resets + seeds the draft, and the full route graph (zero dangling). Fix only the small entry-path quirks.

### Why now
The entry surface is shared by all types and is already mostly correct — verifying it now (before type-specific work) gives a trusted baseline and removes the one dead control. Cheap, isolating, no dependency on type internals.

### Files likely to change
- `src/app/new/page.tsx` — remove/wire the dead "Watch a quick tutorial" button
- `src/app/app/services/page.tsx` — verify only (tabs/search/chips)
- `src/app/new/type/page.tsx` — verify reset+seed behaviour

### Existing components to reuse
`SERVICE_TYPES`, `useOffersStore`, chip/tab rows, `ScreenHeader`, type selector cards, `resetDraft`/`updateDraft`.

### New components required
None.

### Offer types affected
All four (shared surface).

### Data/state/persistence changes
None (reads only). Confirms `/new/type` calls `resetDraft()` then `updateDraft({type})`.

### Routes affected
Verify all 14 `/new/*` routes + branch targets resolve; confirm catalogue → `/new` → `/new/type` → per-type first step.

### Testing steps
1. `npm run dev`; walk catalogue tabs (Services/Classes/Bundles/Subscriptions) — each shows its seeds
2. Search + category chips filter within a tab
3. "New" → `/new` → "Get started" → `/new/type` → each card routes to its first step with a clean draft
4. Confirm intro has no dead button

### Acceptance criteria
- [ ] All four tabs render their seed offers; search/chips work per tab
- [ ] Type selector resets + seeds the draft; each type lands on its correct first step
- [ ] No dead "Watch a quick tutorial" button
- [ ] No dangling routes; quality gate green

### Risks
- Low. Mostly verification. **Risk:** removing the tutorial button leaves an unbalanced layout. **Mitigation:** check the intro at 378px after removal.

---

## Stage 3 — Shared wizard shell, common steps & shared dashboard reads real data

### Goal
Lock the shared wizard chrome + common steps (basics/locations/staff/price reused across types) and make the **shared dashboard shell** render real data from Stage 1 (kill the hardcoded summary). Extract `SummaryRow`.

### Why now
This is the shared seam between creation and display. Doing it before type-specific stages means each type stage builds on a correct shell and a working summary-row primitive, instead of re-fixing the dashboard four times.

### Files likely to change
- `src/app/app/services/[id]/page.tsx` — derive summary from `offer.*`; use `SummaryRow`
- `src/components/ui/molecules/SummaryRow.tsx` *(new)* + barrel `index.ts` + `smoke.tsx`
- `src/app/new/basics/page.tsx`, `locations/page.tsx`, `staff/page.tsx`, `price/page.tsx` — verify shared chrome/branching (no structural change expected)

### Existing components to reuse
`WizardTitle`, `WizardFooter`, `TOTAL_STEPS`, `FieldLabel`, `fieldInput`, `Toggle`, `Sheet`, `iconFor`, `tintFromHex`, `MapPin`/`Users` icons.

### New components required
- **`SummaryRow`** (molecule) — icon · label · value · chevron. Used by the shared shell now and every per-type summary later (≥2× → barrel + smoke).

### Offer types affected
All four (shared shell). Service is the visible test case; class/bundle/subscription get correct shared rows + graceful fallbacks now, full per-type summaries in Stages 5–7.

### Data/state/persistence changes
Read-only derivation on the dashboard:
- Locations label from `offer.locationModes` (fallback "Location not set")
- Deposit from `offer.deposit` (fallback "—")
- Cancellation → "—" (belongs to Settings module)
- Staff count from `offer.staffIds`

### Routes affected
`/app/services/[id]` (display only).

### Testing steps
1. Seed offer dashboard (e.g. `svc_classic_haircut`) → fallbacks render, no crash
2. Create a service (locations + deposit + staff) → dashboard shows real values
3. `npm run smoke` includes a `SummaryRow` render check

### Acceptance criteria
- [ ] No hardcoded `In-salon · Mobile`/`£20`/`24h` in the dashboard
- [ ] Service dashboard shows real locations/deposit/staff; seed offers fall back gracefully
- [ ] `SummaryRow` exported from barrel with a smoke check
- [ ] Quality gate green

### Risks
- **Fallback gaps:** seed offers lack the new optional fields; unguarded reads crash. **Mitigation:** optional chaining + explicit fallbacks; test a seed offer first.
- **Premature per-type rows:** resist building class/bundle summaries here. **Mitigation:** shell + shared rows only; defer to 5–7.

---

## Stage 4 — Services: fixes & advanced options

### Goal
Bring the service flow to full parity: confirm all four steps against the legacy trace, fix the staff copy quirk, and confirm the service advanced module rows (variants/products/related/resources/forms/settings) are correct (write-back deferred to Stage 8).

### Why now
Services is the most complete type and shares the most with the shell from Stage 3 — finishing it first validates the shared foundation end-to-end before the heavier types.

### Files likely to change
- `src/app/new/staff/page.tsx` — empty-state copy ("team members" not "instructors" for services)
- `src/app/new/basics|locations|price/page.tsx` — verify parity only
- `src/app/app/services/[id]/page.tsx` — confirm service advanced rows

### Existing components to reuse
All service step components (already built): icon/category sheets, In-salon/Mobile sheets, `ModeCard`, deposit toggle, duration inputs, `SummaryRow`.

### New components required
- **`StepperInput`** (molecule) — if extracted here (radius/notice steppers); else defer to Stage 5. Barrel + smoke if added.

### Offer types affected
Service (and `StepperInput`, if extracted, benefits class/subscription later).

### Data/state/persistence changes
None beyond Stage 1. Service draft → offer already round-trips after Stage 1.

### Routes affected
`/new/basics|locations|staff|price`, `/app/services/[id]` (service rows).

### Testing steps
1. Full service create → dashboard shows real data (locations/staff/deposit) — end-to-end proof of Stages 1+3
2. Staff empty state (no bookable members) reads "add staff", not "instructors"
3. Each service advanced row navigates to its existing page

### Acceptance criteria
- [ ] Service wizard matches legacy parity; "Create service" persists a correct record
- [ ] Staff copy type-correct
- [ ] Service dashboard summary + advanced rows all correct (write-back still local — fixed in Stage 8)
- [ ] Quality gate green

### Risks
- Low — services is the known-good path. **Risk:** `StepperInput` extraction touches the Austin lane. **Mitigation:** coordinate, or defer extraction to Stage 5.

---

## Stage 5 — Classes: flow & class-specific dashboard/options

### Goal
Complete the class type: verify the 6-step wizard, persist `classDetails`, add the class dashboard summary (schedule/instructors/attendees), and build the missing class advanced module pages (requirements, agenda, materials, certificates).

### Why now
Class is the heaviest type (most steps, most modules, most dead rows). It depends on the shell (3) and the data seam (1) being solid, and it's the biggest single chunk of type-specific work.

### Files likely to change
- `src/app/new/class-participants|class-schedule|class-pricing/page.tsx` — verify + close model deltas
- `src/app/app/services/[id]/page.tsx` — `ClassSummary` branch; wire the 4 dead rows to real pages
- `src/app/app/services/[id]/{requirements,agenda,materials,certificates}/page.tsx` *(new)*
- `src/lib/store/wizardStore.ts` — `ClassDraft` additions only if product wants per-weekday/waitlist (Appendix decision)

### Existing components to reuse
`WizardChrome`, `Sheet`, `SummaryRow`, `StepperInput`, locations/staff steps (shared), `useTeamStore` (Instructor filter), `ListRow`, `EmptyState`.

### New components required
- **`ClassSummary`** — screen-local dashboard block (not barrel).
- Class module pages — screen-local, composing existing primitives.

### Offer types affected
Class.

### Data/state/persistence changes
`offerFromDraft` already carries `classDetails` after Stage 1. New module pages persist via `updateOffer` (or local state, with write-back unified in Stage 8 — pick one and be consistent; prefer `updateOffer` from the start here to avoid rework).

### Routes affected
`/new/class-*`; `/app/services/[id]/{requirements,agenda,materials,certificates}` (new).

### Testing steps
1. Full class create (capacity/min, dates/times/repeat, instructors, per-attendee price) → dashboard shows schedule/instructors/attendees
2. Each previously-dead class row now opens a real page
3. Class appears under Classes tab with Draft pill

### Acceptance criteria
- [ ] Class wizard persists `classDetails`; dashboard shows type-correct summary
- [ ] requirements/agenda/materials/certificates pages exist and are reachable
- [ ] Appendix class deltas (steps/weekday/waitlist) resolved per product
- [ ] Quality gate green

### Risks
- **Scope creep:** old app has many class modules (session-packs, pricing-tiers, visibility, online-link). **Mitigation:** build only the 4 named; `log`/document the rest as backlog.
- **`new Date()` SSR:** class schedule formatting must keep dates arg'd. **Mitigation:** lint + render-top-level check.

---

## Stage 6 — Bundles: flow & bundle-specific composition

### Goal
Complete the bundle type: verify the 3-step wizard, persist the `bundle` snapshot, and add the bundle dashboard summary (included services + fixed/discount pricing). Resolve the flexible-kind decision.

### Why now
Bundle is light and independent; after the shell + data seam it's a small, self-contained type. Doing it after class keeps the two structurally-different types (class/bundle) separate and reviewable.

### Files likely to change
- `src/app/new/bundle-services|bundle-pricing/page.tsx` — verify + flexible "choose N" if approved
- `src/app/app/services/[id]/page.tsx` — `BundleSummary` branch
- `src/lib/store/wizardStore.ts` — `bundle.chooseCount?` only if flexible is made real

### Existing components to reuse
`WizardChrome`, `SummaryRow`, `SegmentedControl` (fixed/discount), `ListRow`, offers filtered to published services, existing discount math in `offerFromDraft`.

### New components required
- **`BundleSummary`** — screen-local dashboard block (included services list + pricing).

### Offer types affected
Bundle.

### Data/state/persistence changes
`bundle` snapshot persists after Stage 1. If flexible becomes real, add `chooseCount` to `BundleDraft` + carry it in `offerFromDraft`.

### Routes affected
`/new/bundle-*`; `/app/services/[id]` (bundle branch).

### Testing steps
1. Create a fixed bundle (≥2 services, fixed price) → dashboard lists included services + price
2. Create a discount bundle → price = computed discount; dashboard shows it
3. Bundle under Bundles tab with Draft pill

### Acceptance criteria
- [ ] Bundle wizard persists contents + pricing; dashboard shows included services + pricing
- [ ] Flexible-kind decision resolved (cosmetic kept, or `chooseCount` added)
- [ ] Quality gate green

### Risks
- **Flexible ambiguity:** shipping cosmetic-flexible may mislead. **Mitigation:** either make it real or hide the toggle — decide in Stage 3/Appendix.
- **Order&gaps absence:** old app sequenced services. **Mitigation:** confirmed deferred per Appendix; note in UI if needed.

---

## Stage 7 — Subscriptions: flow & recurring/payment-specific options

### Goal
Complete the subscription type: reconcile the `subType`/`benefitType` taxonomies, add the type-page gate, persist the `subscription` snapshot, and add the subscription dashboard summary (billing/benefit/joining fee/term).

### Why now
Subscription has the most internal model tidy-up (overlapping taxonomies). Doing it last among types means the shared shell + summary pattern are proven, so the focus is purely on the recurring/billing specifics.

### Files likely to change
- `src/app/new/subscription-type|subscription-benefits|subscription-billing/page.tsx` — reconcile taxonomies + add type gate
- `src/app/app/services/[id]/page.tsx` — `SubscriptionSummary` branch
- `src/lib/store/wizardStore.ts` — drop or wire `subType`; tidy `SubscriptionDraft`

### Existing components to reuse
`WizardChrome` (note: subscription pages hand-roll the heading — switch to `WizardTitle` for consistency), `SummaryRow`, `SegmentedControl`, `StepperInput` (sessions/term), `Toggle`.

### New components required
- **`SubscriptionSummary`** — screen-local dashboard block.

### Offer types affected
Subscription.

### Data/state/persistence changes
`subscription` snapshot persists after Stage 1. Reconcile taxonomy: make `benefitType` the single driver; remove unused `subType` or derive it. Add a continue gate on the type page.

### Routes affected
`/new/subscription-*`; `/app/services/[id]` (subscription branch).

### Testing steps
1. Create each benefit type (sessions/credit/discount/access) → dashboard shows billing + benefit
2. Type page now gates continue on an explicit selection
3. Subscription under Subscriptions tab with Draft pill; billing price/period correct

### Acceptance criteria
- [ ] Subscription wizard persists its block; dashboard shows billing/benefit summary
- [ ] `subType`/`benefitType` reconciled to one driver; type page gates continue
- [ ] Subscription pages use `WizardTitle` (chrome consistency)
- [ ] Quality gate green

### Risks
- **Taxonomy refactor:** touching `SubscriptionDraft` affects 3 pages + persistence. **Mitigation:** do the model change first, then the pages, `tsc` between.
- **Frequency branch absence:** old app had it. **Mitigation:** confirmed collapsed per Appendix.

---

## Stage 8 — Related offers, advanced module write-back, preview & publish

### Goal
Cross-cutting wiring: make all advanced module editors persist to the offer (replace local-state-only), wire the dead notifications row, make preview read the real offer, and confirm publish across all types.

### Why now
This unifies behaviour that spans all types and modules. Doing it once after every type exists avoids wiring write-back per type and lets a single consistent `updateOffer` pattern cover everything.

### Files likely to change
- `src/app/app/services/[id]/{variants,products,related,resources,forms,photos}/page.tsx` — persist via `updateOffer`
- `src/app/app/services/[id]/notifications/page.tsx` *(new)*
- `src/app/app/services/[id]/preview/page.tsx` — read real offer
- `src/app/app/services/[id]/page.tsx` — wire notifications row; remove orphaned `OFFER_MODULES`
- `src/lib/data/offers.ts` — remove orphaned `OFFER_MODULES` constant

### Existing components to reuse
`updateOffer` (store), `SummaryRow`, existing module editors, preview layout, `setStatus` (publish).

### New components required
- Notifications module page — screen-local.

### Offer types affected
All four.

### Data/state/persistence changes
Module editors write to the offer via `updateOffer(id, patch)` instead of local state (needs corresponding optional `DemoOffer` fields for module data — add as required, optional). Preview derives from `offer.*`.

### Routes affected
All `[id]/*` module routes + `[id]/preview` + new `[id]/notifications`.

### Testing steps
1. Edit a module (e.g. variants), navigate away + back → selection persists
2. Preview a created offer → shows its real name/price/locations (not `Salon Soho`/`4.9`)
3. Publish/Unpublish each type → Draft↔Active reflected in list + dashboard

### Acceptance criteria
- [ ] Module edits persist to the offer and survive navigation
- [ ] Preview reads the real offer; no hardcoded content
- [ ] Notifications row wired; no dead module rows; `OFFER_MODULES` removed
- [ ] Publish works for all four types
- [ ] Quality gate green

### Risks
- **Largest surface:** 6+ editors. **Mitigation:** one editor as the pattern, then replicate; do after types are stable.
- **Model sprawl:** each module needs offer fields. **Mitigation:** optional fields; only add what an editor actually saves.

---

## Stage 9 — Final integration, testing, responsive & cleanup

### Goal
End-to-end verification across all four types, full a11y + 378px responsive pass, remove residual dead controls, and a final quality-gate sweep. Optional: reload durability decision.

### Why now
Everything exists and persists; this is the consolidation pass that proves the whole offers system holds together and is shippable.

### Files likely to change
- Any file with residual dead controls or a11y gaps (sweep)
- `smoke.tsx` — final coverage review (all four create round-trips)
- Optionally `src/lib/store/offersStore.ts` — `zustand/persist` if approved

### Existing components to reuse
All.

### New components required
None.

### Offer types affected
All four.

### Data/state/persistence changes
Optional `zustand/persist` (product decision). Otherwise none.

### Routes affected
All offer routes (verification).

### Testing steps
1. Full round-trip per type: Hub → catalogue tab → New → type → wizard → Create → list (Draft) → dashboard (real data) → module edit persists → Preview (real) → Publish (Active)
2. a11y: aria-labels on icon buttons, `role="switch"`+`aria-checked` on toggles, `inputMode` on numbers, non-colour selected state
3. Responsive: every wizard step + dashboard + sheets at 378px — no clipping, sticky footers pinned
4. `npx tsc --noEmit && npx next lint && npm run smoke`

### Acceptance criteria
- [ ] All four types complete the full round-trip with real data end-to-end
- [ ] a11y checklist passes; 378px layout clean
- [ ] No dead controls anywhere in the offers area
- [ ] Quality gate green; (optional) reload durability decided
- [ ] Capture browser-preview proof per type

### Risks
- **Regression surface:** broad final pass can surface earlier gaps. **Mitigation:** per-type round-trip catches integration breaks; fix in place.

---

## Stage count rationale

Nine stages is the floor that keeps each review safe:
- **Stages 1–3** can't merge — data seam, entry surface, and shell/dashboard are genuinely sequential dependencies, and bundling them would make a single huge unreviewable diff across store + routes + dashboard.
- **Stages 4–7 are one-per-type** — each is the smallest independently-shippable unit of type-specific work, and they share the shell so they don't duplicate components.
- **Stages 8–9** are cross-cutting and must come after all types exist (write-back + integration), so they can't fold into the per-type stages.

Collapsing further (e.g. merging two types) would create diffs touching the same shared dashboard file in conflicting ways — less safe, not more efficient.

*Implementation begins only on approval, one stage at a time.*
