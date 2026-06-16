# Offers System — Master Migration Spec

> **Status:** Spec only — no implementation yet. **This is the source of truth** for the offers area.
> **Date:** 2026-06-15
> **Supersedes:** `service-setup-flow-migration.md` and `service-setup-flow-plan.md` (services-only — kept for history; do not action them).
> **Grounded in:** `offers-system-gap-analysis.md` (4-agent re-inspection of both apps).
> **Scope:** The complete offers area — **Services, Classes, Bundles, Subscriptions** — catalogue, type selector, shared + type-specific creation, dashboards, advanced modules, related/upsell, preview/publish, persistence.
> **Reference (read-only):** legacy app `/Users/mathewdane/Desktop/That-time/Apps/that-time-app` — never imported, moved, or copied; used only to understand flows/screens/copy/intent.
> **Source of truth:** the new **thattime** app (Next.js 14 App Router + TS + Tailwind 3.4 + Zustand). Its architecture, routing, component library, data model, and persistence patterns win wherever the two differ.

---

## 1. Guiding principles

1. **One shared spine, four branches.** The four offer types share a single catalogue, type selector, basics step, wizard chrome, persistence seam, dashboard shell, preview, and publish. Type-specific behaviour lives only where it must (type-specific wizard steps, per-type summary blocks, type-specific advanced modules). **Never fork shared infrastructure to add a type.**
2. **The data seam is the keystone.** `offerFromDraft` + `DemoOffer` are the single point where every type persists. Widening them once unblocks all four dashboards. This is the highest-leverage change in the whole migration.
3. **The new app is already structurally complete.** All 14 `/new` routes exist with zero dangling routes; the legacy never-persists bug is already fixed. This migration is **mostly data + dashboard depth + wiring dead modules**, not greenfield screen-building.
4. **Compose, don't recreate.** Reuse `@/components/ui`. Add a new shared component only when it's used ≥2× and genuinely primitive. Per-type compositions stay screen-local.
5. **Simplifications the new app already made are deliberate** (class 6 vs old 7 steps, bundle dropped order&gaps, subscription dropped the frequency branch). These are product decisions to confirm — not bugs to auto-revert.

---

## 2. Target architecture (the source-of-truth contract)

| Concern | Standard |
|---|---|
| Framework | Next.js 14 App Router, React 18, TypeScript (strict), Turbopack |
| Routing | File-based segments under `src/app/**`; `useRouter().push` / `<Link>` |
| Creation chrome | `/new/*` wrapped by `src/app/new/layout.tsx` → `AppFrame` (phone frame, no tab bar) |
| State | **Zustand** — `useWizardStore` (draft), `useOffersStore` (catalogue), `useCategoriesStore`, `useTeamStore`. In-memory, session-scoped |
| Persistence seam | `offerFromDraft(draft, offers)` → `addOffer` → catalogue; list + dashboard both read `useOffersStore` |
| Styling | Tailwind 3.4 on design tokens (`bg-canvas`, `text-navy`, `text-muted`, …). **No inline hex** (data-driven category colour via `style` + `tintFromHex` is the only exception) |
| Components | Compose from `@/components/ui`; frame-scoped `Sheet`/`BottomSheet` (not Radix portals) |
| Icons | `lucide-react` only |
| Quality gate | `npx tsc --noEmit && npx next lint && npm run smoke` (unused vars fatal; no `Date.now()`/argless `new Date()`/`Math.random()` at module/render top level) |
| Lane ownership | **Austin:** `src/components/ui/**`, tokens, `tailwind.config.ts`. **Matt:** `src/app/**`, `src/lib/data`, `src/lib/store`. New shared component → barrel `index.ts` + `smoke.tsx` |

---

## 3. Shared offer architecture

The offers system is a single surface (`/app/services` and `/new`) that handles all four types via a `type` discriminator.

```
CATALOGUE  /app/services            type tabs · search · category chips · grouped rows  (all 4 types)
   │  "New"
INTRO      /new                      optional intro screen
TYPE       /new/type                 "What are you adding?" → resetDraft + updateDraft({type}) → branch
   │
BASICS     /new/basics              SHARED step 1 (icon · name · category · description) → branch by type
   ├─ service        → locations → staff → price                         (4 steps)
   ├─ class          → participants → schedule → locations → staff → pricing  (6 steps)
   ├─ bundle         → services → pricing                                (3 steps)
   └─ subscription   → type → benefits → billing                         (4 steps)
   │  final step → offerFromDraft → addOffer → resetDraft
DASHBOARD  /app/services/[id]?created=1   shared shell + per-type summary + advanced + Preview/Publish
```

**Single source of truth per concern:**
- Draft: `useWizardStore` — `ServiceDraft` envelope with `classDetails`/`bundle`/`subscription` sub-objects.
- Catalogue: `useOffersStore` (seeded from `demoOffers`).
- Persisted record: `DemoOffer` (one shape, optional type-specific fields).
- Step counts: `TOTAL_STEPS = { service:4, class:6, bundle:3, subscription:4 }` (`WizardChrome.tsx`).

---

## 4. Shared list & type selector behaviour

### Catalogue (`/app/services`) — already type-agnostic, keep as-is
- Type tabs from `SERVICE_TYPES` (Services / Classes / Bundles / Subscriptions); one active at a time.
- Reads live from `useOffersStore`; filters by `type` → name search → category chip; groups by category with counts.
- Draft pill on `status==="draft"`; row subtitle from `offerMeta(o)`; "New" → `/new`.
- 🔧 Minor: the list row uses `o.type` for its icon, never `o.icon` — harmless; leave unless product wants the chosen icon in the list too.

### Type selector (`/new/type`) — keep, it's correct
- "What are you adding?" — 4 cards (Service / Class / Bundle / Subscription).
- On pick: **`resetDraft()` then `updateDraft({type})`** then branch to `/new/basics` (or the type's first step). This correctly avoids the legacy long-lived-singleton-draft quirk.
- 🔧 Intro (`/new`) has a dead "Watch a quick tutorial" button (`new/page.tsx:55`) — remove or wire.

---

## 5. Shared creation flow patterns

| Pattern | Implementation | Reuse |
|---|---|---|
| Wizard chrome | `WizardTitle` + `WizardFooter` (`step`, `total`, `onBack`, `onNext`, `nextLabel`, `disabled`) | all steps, all types |
| Step counting | `TOTAL_STEPS[type]`; footer shows "Step N of M" | all |
| Field inputs | `FieldLabel` + `fieldInput` / `Input` / `Textarea` | all |
| Toggles | `Toggle` (display) / `Switch` / `ToggleRow` | all |
| Bottom sheets | frame-scoped `Sheet` with `sticky bottom-0` footer button | basics, locations, any type-specific picker |
| Branch routing | `basics.onContinue` switches on `draft.type` → first type step | all |
| Create | final step → `offerFromDraft → addOffer → resetDraft → /app/services/{id}?created=1` | all |

**Consistency rules across types:**
- Every wizard's final button is `"Create {type}"` (not "Next").
- Basics is identical for all four (icon/name/category/description); only the hint copy and branch target differ.
- Header: step 1 = X-close → `/app/hub`; intermediate steps = back-chevron; footer always has a Back.
- Validation gates disable the footer Next/Create; no inline field errors (matches legacy minimalism).

---

## 6. Type-specific wizard steps

> All steps below **already exist** as `page.tsx` files. This section is the parity contract, not a build list. 🔧 = align to legacy/confirm; ➕ = model gap to close.

### Service (4) — `basics → locations → staff → price`
- **Locations** — In-salon / Mobile / Remote mode cards; In-salon + Mobile open settings sheets. Gate: ≥1 mode.
- **Staff** — "Who offers it?" search + role filter + multi-select. Gate: ≥1. 🔧 empty-state copy says "instructors" even for services (`staff/page.tsx:113`).
- **Price** — price + hours/min duration + optional deposit. Gate: `price && durationMin>0 && (!deposit || amount)`.

### Class (6) — `basics → class-participants → class-schedule → locations → staff → class-pricing`
- **Participants** ("Attendees") — booking structure (seat-based / private group), capacity, min, auto-cancel. Gate: seat → `capacity>0 && min>0 && min<=capacity`.
- **Schedule** ("Select dates") — single/multi, dates, start/end times, repeat/weeks. Gate: ≥1 valid date + times. 🔧 new app folds the old app's separate "Set the times" step into this one (6 vs 7) — confirm acceptable. ➕ no per-weekday selection / waitlist / per-session capacity (old app had more).
- **Locations / Staff** — shared with service (staff filters to Instructor system role).
- **Pricing** — "per attendee" price + deposit. Gate: `price && (!deposit || amount)`. ➕ no `durationMin` modelled for class (implied by times).

### Bundle (3) — `basics → bundle-services → bundle-pricing`
- **Included services** — pick from published services; fixed vs flexible kind. Gate: `serviceIds.length >= 2`.
- **Pricing** — fixed total vs % discount (discount math works in `offerFromDraft`). Gate: fixed → price; discount → percent.
- ➕ `flexible` kind is cosmetic (no "choose N of M" count); no order&gaps step (old app had `bundle-order`); no expiry. Confirm scope in Phase 3.

### Subscription (4) — `basics → subscription-type → subscription-benefits → subscription-billing`
- **Type** — frequency / credit / membership. ➕ no continue gate (default exists); `subType` is set but never read after this page.
- **Benefits** — `benefitType` (sessions/credit/discount/access) drives fields. Gate varies; `access` has no fields.
- **Billing** — price + period + joining fee + min term. Gate: `price`.
- 🔧 two overlapping taxonomies (`subType` vs `benefitType`); old app's frequency branch (`frequency-sessions`/`frequency-billing`) is collapsed. Reconcile in Phase 3. No locations/staff/duration (correct for subscriptions).

---

## 7. Offer dashboards

**One shared dashboard** (`/app/services/[id]`) with type branches — **not** four files (the old app's 4-dashboard + redirect-shim approach is a legacy quirk to avoid).

### Shared shell (all types)
Header (`Edit {type}`) → `?created=1` success banner → identity row (icon/name/category•type/status pill) → **summary card** → photos strip → **advanced module list** → footer (Preview + Publish/Unpublish).

### Summary card — currently hardcoded, must derive (Phase 1) ➕
| Field | Current (broken) | Target |
|---|---|---|
| Locations | `"In-salon · Mobile"` (`[id]/page.tsx:135`) | derive from `offer.locationModes` |
| Deposit | `£20` (`:146`) | `offer.deposit?.enabled ? £amount : "—"` |
| Cancellation | `24h` (`:150`) | `"—"` (lives in Settings module, not creation) |
| Staff | static label (`:140`) | count from `offer.staffIds` |
| Class duration | `"per attendee"` (`:117-118`) | keep for class; derive for service |

### Per-type summary blocks (Phase 2) — screen-local compositions on a shared `SummaryRow`
- **Class:** schedule (dates/times/repeat), lead instructor(s), attendees/capacity, delivery.
- **Bundle:** included-services list + pricing (fixed/discount).
- **Subscription:** billing price/period, benefit summary, joining fee/term.
- **Service:** the existing rows (locations, staff, deposit).

---

## 8. Advanced options

Advanced module list per type. Shared modules built once; type-specific where needed.

| Module | Route `[id]/…` | Status | Types |
|---|---|---|---|
| variants | `/variants` | ✅ exists (local state) | service, (bundle/sub) |
| products | `/products` | ✅ exists | service, class |
| related/upsells | `/related` | ✅ exists | service |
| resources | `/resources` | ✅ exists | service, class, bundle |
| forms | `/forms` | ✅ exists | all |
| settings | `/settings` | ✅ exists (mutates store: archive/delete) | all |
| photos | `/photos` | ✅ exists | all |
| preview | `/preview` | ✅ exists (hardcoded content) | all |
| **notifications** | — | ➕ dead button, no route | all |
| **requirements** | — | ➕ dead row, no page | class |
| **agenda** | — | ➕ dead row, no page | class |
| **materials** | — | ➕ dead row, no page | class |
| **certificates** | — | ➕ dead row, no page | class |

- **Phase 4** builds the 5 missing pages (notifications + 4 class modules), composing existing primitives.
- **Old-app extras** (session-packs, pricing-tiers, equipment, bookings, models, visibility, online-link, bundle order editor, subscription terms editor) — **explicitly deferred** unless product prioritises; list them as backlog, don't silently drop.
- **Phase 5** makes all module editors write back to the offer via `updateOffer` (currently local-state-only).

---

## 9. Related services & related components

- **Related/upsell** (`/related`) — exists, service-only, reads `demoOffers`. Old app had a richer group builder (audience + discount); the new app's single cross-sell list is the simpler source-of-truth pattern — keep it; extend only if product asks.
- Bundles are themselves the "package of services" concept — no separate related module needed.
- Subscriptions surface "included offers" via the benefits step — not a related module.

---

## 10. Preview & publish

- **Preview** (`/preview`) — one shared client-facing component. ➕ currently hardcodes rating `4.9`, description, and `Salon Soho · 14 Greek Street` (`preview/page.tsx:33,36-41`); Phase 6 makes it read the real offer.
- **Publish** — `setStatus(id, "published"|"draft")` toggle in the footer; drives the Draft/Active pill in both list and dashboard. Works for all types — keep. Completion is the dashboard (no separate success screen).

---

## 11. Persistence & saved-offer behaviour

- **Model:** `useOffersStore` (Zustand, in-memory, session-only), seeded from `demoOffers`. `addOffer` prepends; `updateOffer` merges; `setStatus` toggles; `removeOffer`.
- **Create seam:** `offerFromDraft(draft, offers) → addOffer → resetDraft → /app/services/{id}?created=1`. ✅ already wired for all four types — the legacy never-persists bug is **not** present.
- **The real gap (Phase 0):** `offerFromDraft` only carries `id/type/name/category/price/durationMin(service)/status/icon`. It must carry the type-specific sub-block so dashboards have real data (§19).
- **SSR-safe id:** replace `Math.random()` in `offerFromDraft` with a shared id helper (`src/lib/ids.ts`).
- **Durability:** not wrapped in `zustand/persist` — created offers reset on full reload. Acceptable for prototype; flag as a product decision in Phase 6, don't auto-adopt.

---

## 12. Known broken / disconnected areas (new app)

| # | Issue | Location | Fix phase |
|---|---|---|---|
| 1 | `offerFromDraft` drops all type-specific data | `offersStore.ts:27-47` | 0 |
| 2 | Hardcoded summary (`In-salon · Mobile`/`£20`/`24h`) | `[id]/page.tsx:135,146,150` | 1 |
| 3 | Staff row no count; class duration `"per attendee"` literal | `[id]/page.tsx:117-118,140` | 1–2 |
| 4 | Bundle/subscription render the service dashboard layout | `[id]/page.tsx` (only `isClass` branch) | 2 |
| 5 | 4 dead class advanced rows + dead notifications row | `[id]/page.tsx:60-64` | 4 |
| 6 | All module editors write to local state only | 8 module pages | 5 |
| 7 | Preview content hardcoded | `preview/page.tsx:33-41` | 6 |
| 8 | `durationMin` dropped for non-service types | `offersStore.ts:43` | 0 |
| 9 | Dead "Watch a quick tutorial" button | `new/page.tsx:55` | 3 |
| 10 | Staff empty-state copy says "instructors" for services | `staff/page.tsx:113` | 3 |
| 11 | `OFFER_MODULES` constant orphaned | `offers.ts:67-75` | 4 (cleanup) |

---

## 13. Legacy behaviours to PRESERVE

1. **Type selector resets the draft** before seeding `type` (new app already does — keep).
2. **Completion is the dashboard** in Draft status with a Publish footer — no separate success screen.
3. **Basics is shared** across all four types (icon/name/category/description).
4. **Per-type summary richness** — class shows schedule/instructors/attendees; bundle shows contents; subscription shows billing/benefit (rebuild as shared-shell branches, not separate dashboards).
5. **Advanced module breadth** for class (requirements/agenda/materials/certificates) — these are real legacy modules, not invented.
6. **Validation minimalism** — gates disable the footer; no inline field errors.
7. **Bundle discount math** — sum of included service prices × (1 − discount%).

## 14. Legacy bugs to AVOID

1. **Never-persists bug** — old `create()` for service/bundle/subscription never called `upsertSavedOffer` (`wizard/Price.jsx:34-37` etc.). New app fixes it — keep fixed.
2. **Four dashboards + redirect shim + dead `modulesFor()` branches** — use one shared dashboard.
3. **Long-lived singleton draft** (no reset on entry) — keep the new app's `resetDraft()` on type pick.
4. **Inconsistent hardcoded class step numbers** (files double as editors) — derive step from a single ordered source.
5. **Dead route stubs** (`AdvancedSectionStub`, `additional-staff`, `class-forms`, `class-notifications`, legacy `ClassTickets`) — don't port.
6. **No-op header "More", non-functional hero icon button, residual `publishError`, mock Members panel** — don't reproduce dead controls.
7. **`Date.now()`/`Math.random()` ids** — use an SSR-safe helper.
8. **`@phosphor-icons`, hash routing, Outlet-context draft, Tailwind v4** — don't port the architecture.
9. **Self-named "Legacy" subscription dashboard** — design cleanly around `benefitType`.
10. **Bundle "pack" 3-step variant** — omit; the new model has no `pack`.

---

## 15. Existing new-app components to REUSE (no new code)

- **Chrome:** `ScreenHeader`, `WizardTitle`, `WizardFooter`, `TOTAL_STEPS`, `FieldLabel`, `fieldInput`, `Toggle`.
- **Overlays:** `Sheet` / `BottomSheet`.
- **Atoms/molecules:** `Input`, `Textarea`, `Switch`/`ToggleRow`, `Chip`, `SegmentedControl`/`Segmented`, `Card`, `ListRow`, `EmptyState`.
- **Layout:** `AppFrame`, `AppTabBar`.
- **Stores/data:** `useWizardStore` (+ `updateMobile`/`updateClass`/`updateBundle`/`updateSubscription`), `useOffersStore`, `useCategoriesStore`, `useTeamStore`, `serviceIcons`+`iconFor`, `defaultCategories`+`categorySwatches`+`tintFromHex`, `businessLocations`.

## 16. New components required (only where necessary)

Add to the barrel + `smoke.tsx` **only if reused ≥2×**:
1. **`SummaryRow`** (molecule) — dashboard summary row (icon · label · value · chevron); multiplies across per-type summaries. **Yes.**
2. **`StepperInput`** (molecule) — +/- stepper (radius, notice, capacity, sessions, term); already hand-rolled in ≥2 places. **Yes.**

**Screen-local only (not barrel):** per-type dashboard summary blocks (`ClassSummary`/`BundleSummary`/`SubscriptionSummary`), and the new advanced module pages (requirements/agenda/materials/certificates/notifications).

**Not needed:** DurationPicker, DepositControl, LocationCards (inlined), HelpTrigger (no help system), FAB (list uses a "New" pill). Don't recreate retired `ui.tsx`/`controls.tsx`/`shared.tsx`.

---

## 17. Data model changes

### `DemoOffer` (`src/lib/data/offers.ts`) — add optional, back-compatible fields
All optional so the 23 seed offers and ~10 reader screens compile unchanged.

```ts
// shared
description?: string;
deposit?: { enabled: boolean; amount: string };
// service + class
locationModes?: { inSalon: boolean; mobile: boolean; remote: boolean };
locationIds?: string[];
mobile?: MobileSettings;          // from wizardStore
staffIds?: string[];
durationMin?: number;             // already exists; now also carried for class if modelled
// type-specific snapshots (persist what the wizard collected)
classDetails?: ClassDraft;        // from wizardStore
bundle?: { kind: "fixed" | "flexible"; serviceIds: string[]; priceMode: "fixed" | "discount"; discountPercent: string };
subscription?: SubscriptionDraft; // from wizardStore
```

### `offerFromDraft` (`src/lib/store/offersStore.ts`) — carry the right sub-block per type
- **service:** + description, deposit, locationModes, locationIds, mobile, staffIds
- **class:** + description, deposit, locationModes, locationIds, staffIds, `classDetails` snapshot
- **bundle:** + description, `bundle` snapshot (keep existing discount price math)
- **subscription:** + description, deposit(if used), `subscription` snapshot
- Replace `Math.random()` id with `nextId(prefix)` from `src/lib/ids.ts`.

### `wizardStore.ts` — mostly sufficient; tighten thin spots in Phase 3
- Bundle: add `chooseCount?` if flexible "choose N of M" is wanted.
- Subscription: reconcile `subType`/`benefitType` (drop or wire `subType`).
- Class: add per-weekday / waitlist fields only if product wants old-app parity.

### `src/lib/ids.ts` (new) — SSR-safe id helper
```ts
let seq = 0;
export const nextId = (prefix: string) => `${prefix}_${String(++seq).padStart(4, "0")}`;
```

---

## 18. Route mapping (old → new)

| Legacy (hash) | New app | Status |
|---|---|---|
| `/services` list | `/app/services` (tabs: all 4 types) | ✅ |
| `/new` type selector | `/new` (intro) → `/new/type` | ✅ |
| `/new/basics` | `/new/basics` | ✅ shared |
| `/new/locations`,`/staff`,`/price` | same | ✅ service+class |
| `/new/class-participants`,`-schedule`,`-schedule-times`,`-location`,`-staff` | `/new/class-participants`,`-schedule`,`locations`,`staff`,`class-pricing` | ✅ (6 vs 7 — times folded) |
| `/new/bundle-services`,`-order`,`-pricing` | `/new/bundle-services`,`bundle-pricing` | ✅ (order&gaps dropped) |
| `/new/subscription-type`,`-benefits`,`-billing`,`/frequency-*` | `/new/subscription-type`,`-benefits`,`-billing` | ✅ (frequency branch collapsed) |
| `/service`,`/class`,`/bundle`,`/subscription` dashboards | `/app/services/[id]` (one shared) | ✅ unified |
| `/{type}/{module}` editors | `/app/services/[id]/{variants,products,related,resources,forms,settings,photos,preview}` | ✅ 8 exist; ➕ requirements/agenda/materials/certificates/notifications missing |
| `/{type}/preview` | `/app/services/[id]/preview` | ✅ (content hardcoded) |

No new routes are needed for creation. New routes needed: 5 advanced module pages (Phase 4).

---

## 19. Acceptance criteria

**Per type, create → persist → dashboard round-trip:**
- [ ] Each type's wizard completes with correct steps, "Step N of M", and validation gates.
- [ ] On "Create {type}", the offer persists to `useOffersStore`, appears under the correct catalogue tab with a Draft pill, and opens its dashboard with `?created=1`.
- [ ] The dashboard shows **real** data for that type (no hardcoded `In-salon · Mobile`/`£20`/`24h`): service → locations/staff/deposit; class → schedule/instructors/attendees; bundle → included services + pricing; subscription → billing/benefit.
- [ ] Publish toggles Draft↔Active in both dashboard and list; Preview opens the client preview reading the real offer.

**Shared infrastructure:**
- [ ] Type selector resets + seeds the draft; basics is identical across types; final buttons read "Create {type}".
- [ ] `offerFromDraft` round-trips each type's fields (smoke assertion per type).
- [ ] No dead controls: tutorial button, notifications row, and the 4 class advanced rows are wired or removed.
- [ ] Staff empty-state copy is type-correct.
- [ ] Module editors persist to the offer (Phase 5).

**Quality:**
- [ ] `tsc --noEmit`, `next lint`, `npm run smoke` green at every phase.
- [ ] 378px responsive + a11y pass (aria-labels, role=switch, inputMode, non-colour selected state).
- [ ] All 23 seed offers render without crash given the new optional fields.

---

## 20. Staged implementation plan

> **This is the authoritative staging.** It supersedes the per-type 9-stage structure in `offers-system-plan.md`, which was revised after a critical review (see §20.3). The plan is organised **by concern (data → dashboard → wizards → modules), not by type**, because a per-type split forced four separate stages to all edit the same dashboard file (`[id]/page.tsx`) — duplicated context and merge risk. Concern-based phases each touch one seam cleanly and can still be committed type-by-type internally.

> **Dependency spine:** `0 → 1 → {2, 3} → 4 → 5 → 6`. Phase 0 gates everything; Phases 2 (dashboards) and 3 (wizard parity) are independent of each other once 1 is green. Each phase ends green on `npx tsc --noEmit && npx next lint && npm run smoke`. One phase at a time.

### 20.0 Decision gate — resolve BEFORE Phase 3 ⛔
These product decisions change the data model and wizard structure; resolving them late causes rework in Phases 2–5. Resolve at the latest before Phase 3 (ideally up front). Defaults in **bold** are the recommendation (keep the new app's simpler structure unless told otherwise).

| Decision | Options | Default | Affects |
|---|---|---|---|
| Subscription taxonomy | reconcile `subType`↔`benefitType` to one driver / keep both | **one driver (`benefitType`); drop `subType`** | wizardStore + 3 sub pages + persistence |
| Bundle flexible kind | make real (`chooseCount`) / keep cosmetic / hide toggle | **make real with `chooseCount`** (cosmetic misleads) | BundleDraft + bundle-services + offerFromDraft |
| Class steps | keep 6 (times folded) / restore 7 (separate set-times) | **keep 6** | class-schedule page |
| Bundle order&gaps | add `/new/bundle-order` / omit | **omit** | new route + BundleDraft |
| Class schedule depth | add per-weekday/waitlist / keep simple | **keep simple** | ClassDraft |
| Reload durability | `zustand/persist` / session-only | **session-only** (prototype) | offersStore |

### Phase 0 — Data seam (foundation, unblocks all 4 types) ⭐
- Widen `DemoOffer` with optional fields (§17); add `src/lib/ids.ts`.
- Rewrite `offerFromDraft` to carry the right sub-block per type; replace `Math.random()` with `nextId`.
- Smoke: per-type round-trip assertion (pure function — no store-render needed).
- **Better pattern locked here:** persistence happens on **create**, not publish (the new app already does this; the old app only persisted class, on publish). Keep it.
- **AC:** every type's draft persists its fields; all 23 seed offers compile/render unchanged.
- **Risk:** highest-blast-radius data change — feeds ~10 reader screens + 23 seeds. Mitigation: every new field optional; `tsc` over all consumers before merge.

### Phase 1 — Shared dashboard reads real data + shared primitives
- Replace hardcoded summary values (`In-salon · Mobile`/`£20`/`24h`/staff label) with values derived from `offer.*`; graceful fallbacks for seed offers that lack the optional fields.
- **Create both shared primitives here (pinned — no longer "if it lands"):** `SummaryRow` (icon·label·value·chevron) and `StepperInput` (±). Barrel `index.ts` + `smoke.tsx` for each. They exist before any type stage needs them.
- **AC:** service dashboard shows real locations/deposit/staff; every seed offer dashboard renders without crash; both primitives exported + smoke-checked.
- **Risks:** (a) the dashboard is the screen all 23 seeds use — wrong fallbacks break every existing offer; test a seed offer first. (b) `StepperInput` extraction edits the already-shipped service `MobileSheet` (radius/notice steppers) — regression risk to a working flow; diff carefully. (c) `SummaryRow` smoke must use the **prop-override** pattern (Zustand `setState` doesn't reflect in `renderToString`).

### Phase 2 — Per-type dashboard summaries (one file, four branches)
- Branch the shared dashboard shell by `offer.type`; add screen-local `ClassSummary` / `BundleSummary` / `SubscriptionSummary` composed on `SummaryRow` (service keeps its existing rows). **Not barrel components.**
- Commit type-by-type within the phase for reviewability.
- **AC:** bundle/subscription/class dashboards show type-correct summaries (schedule/instructors/attendees; included services + pricing; billing/benefit) — not the service layout.
- **Risk:** all four branches live in `[id]/page.tsx`; keep each `*Summary` self-contained to avoid cross-type coupling.

### Phase 3 — Creation parity pass (all four wizards) — needs §20.0 resolved
- Verify each wizard against the legacy trace; fix shared quirks (staff empty-state copy → "team members" for services; remove the dead "Watch a quick tutorial" button).
- Apply the §20.0 decisions: subscription taxonomy reconcile (model first, then the 3 pages, `tsc` between); bundle flexible `chooseCount` if approved; subscription type-page continue gate; switch subscription pages to `WizardTitle` for chrome consistency.
- **AC:** wizards match agreed parity; §20.0 decisions implemented; final buttons read "Create {type}".
- **Risk:** the subscription taxonomy change touches `SubscriptionDraft` + 3 pages + persistence — sequence model→pages→persistence, `tsc` at each step.

### Phase 4 — Advanced module pages (build the missing 5; persist from day one)
- Build the 5 missing pages (notifications + class requirements/agenda/materials/certificates) composing existing primitives. **New pages persist via `updateOffer` immediately** — do NOT build them on local state and redo in Phase 5.
- This phase **extends `DemoOffer`** with the optional fields these modules save (explicit dependency — the model grows again here, by design).
- Remove orphaned `OFFER_MODULES`; `log`/document deferred old-app extras (session-packs, pricing-tiers, visibility, online-link, bundle order, subscription terms) rather than silently dropping.
- **Use the existing `settings/page.tsx` as the write-back template** (it already mutates the store via `setStatus`/archive/delete — the established pattern, don't invent one).
- **AC:** no dead module rows; the 5 new pages persist to the offer; deferred items documented.

### Phase 5 — Retrofit the pre-existing editors + preview real data
- Retrofit only the **6 pre-existing local-state editors** (variants, products, related, resources, forms, photos) to persist via `updateOffer` — the new Phase-4 pages already persist, so there's no double work.
- Make `preview/page.tsx` read the real offer (remove hardcoded `4.9`/description/`Salon Soho · 14 Greek Street`).
- **AC:** module edits survive navigate-away-and-back and reflect on the dashboard; preview shows the real offer.
- **Risk:** 6 editors + model fields; do one editor as the reference, then replicate; add only the offer fields an editor actually saves.

### Phase 6 — Integration, publish, a11y, responsive, cleanup
- Full round-trip per type (Hub → tab → New → wizard → Create → list Draft → dashboard real data → module edit persists → Preview real → Publish Active).
- Confirm Publish/Unpublish across all types; full a11y + 378px responsive sweep; remove any residual dead controls.
- Optional `zustand/persist` only if §20.0 chose durability.
- **AC:** all four types pass the round-trip; a11y + responsive clean; quality gate green; browser-preview proof captured per type.

---

## 20.3 What the critical review changed

The earlier per-type 9-stage plan (`offers-system-plan.md`) was reviewed and revised into the concern-based phases above. Findings:

1. **Duplicated work consolidated** — the 9-stage plan had **four separate stages (services/classes/bundles/subscriptions) each editing `[id]/page.tsx`**. Merged into one dashboard phase (Phase 2, four branches) and one wizard-parity phase (Phase 3). Module-building was split across a type stage and a module stage; consolidated into Phase 4 (build) + Phase 5 (retrofit).
2. **Stages safely combined** — the standalone "routes/catalogue/selector verify" stage was too thin to review alone; its one real change (dead tutorial button) moved into Phase 3, its verification into Phase 6's round-trip.
3. **Over-large stage split** — the old "classes" stage bundled wizard + dashboard + four new module pages. The four module pages moved to Phase 4 (with all other module work), leaving class wizard/dashboard inside the shared Phases 2–3.
4. **Missing dependencies surfaced** — (a) `SummaryRow`/`StepperInput` were "extract if it lands here"; now pinned to Phase 1. (b) Module write-back needs extra `DemoOffer` fields not added in Phase 0; Phase 4 now explicitly extends the model. (c) Store-driven smoke needs the prop-override pattern; noted in Phase 1.
5. **Risk to existing services** — Phase 0 (data model) and Phase 1 (dashboard rewrite) both have high blast radius over the 23 seeds and ~10 readers; mitigations added (optional fields, seed-first testing). `StepperInput` extraction edits shipped service code — flagged.
6. **Legacy-bug risk** — reaffirmed in §14: don't reintroduce persist-on-publish (Phase 0 locks persist-on-create), four-dashboard redirect shim, dead stubs, or `Math.random()` ids.
7. **Better new-app patterns adopted** — persistence on create (not publish); one shared dashboard; `updateOffer` + the existing `settings/page.tsx` as the write-back template; new module pages persist from day one rather than local-state-then-rework.
8. **Uncertainty to resolve first** — the §20.0 decision gate collects every model/structure decision that must be settled before Phase 3, with recommended defaults.

---

## Appendix — Open product decisions (now tracked in §20.0 Decision gate)

| Decision | New app today | Old app | Recommendation |
|---|---|---|---|

| Decision | New app today | Old app | Recommendation |
|---|---|---|---|
| Class steps | 6 (times folded into schedule) | 7 | Keep 6 unless per-session times needed |
| Bundle order&gaps | dropped | `bundle-order` step | Keep dropped; add only if sequencing matters |
| Bundle flexible | cosmetic | "choose N of M" | Add `chooseCount` if flexible is real |
| Subscription frequency branch | collapsed into benefits | `frequency-sessions/billing` | Keep collapsed; reconcile `subType`/`benefitType` |
| Reload durability | session-only | session-only | Defer `persist` unless required |
| Created icon in list rows | type icon only | n/a | Optional nicety |

*Implementation begins only on approval.*
