# Complete Offers System — Gap Analysis

> **Status:** Analysis only — no implementation.
> **Date:** 2026-06-15
> **Scope:** The entire offers area across all four types — **Services, Classes, Bundles, Subscriptions** — covering catalogue, type selector, shared + type-specific creation, dashboards, advanced modules, related/upsell, preview/publish, and persistence.
> **Reference (read-only):** legacy app `/Users/mathewdane/Desktop/That-time/Apps/that-time-app` (Vite + React 19 + react-router v7 + Tailwind v4, plain JS, in-memory `<Outlet context>` draft).
> **Source of truth:** the new **thattime** app (Next.js 14 App Router + TS + Tailwind 3.4 + Zustand). Its architecture, routing, component library, data model, and persistence patterns win wherever the two differ.
> **Supersedes scope of:** `service-setup-flow-migration.md` + `service-setup-flow-plan.md` (services-only — now folded into this wider plan).

---

## 0. Headline finding

The new app's offer flows are **structurally further along than expected but functionally hollow for 3 of the 4 types.** All 14 creation routes exist and every navigation path resolves (zero dangling routes). The legacy "never persists" bug is **already fixed** — all four wizards call `offerFromDraft → addOffer`. **But** `offerFromDraft` and `DemoOffer` only model a service's *headline* fields, so class/bundle/subscription creation throws away almost everything the wizard collected, and the single shared dashboard hardcodes its summary. The real work is **not building screens — it's widening the data seam and making the dashboard read it**, then filling type-specific dashboard depth.

This inverts the naive assumption: the expensive part isn't the wizards (they exist), it's **persistence + dashboard parity per type**.

---

## 1. What exists in the OLD app (per type)

| Area | Service | Class | Bundle | Subscription |
|---|---|---|---|---|
| Wizard steps | 4: basics → locations → staff → price | **7**: basics → attendees → dates → set-times → location → staff → price | 4 (3 for "pack"): basics → services → order&gaps → pricing | 4: type → basics → benefits → billing (frequency branch: → frequency-sessions → frequency-billing) |
| Entry branch | from type selector → basics | type selector → basics?type=class | → basics | type selector → **subscription-type first**, then basics |
| Dashboard | `Dashboard.jsx` `/service` (the "shared" one, but redirects other types away) | `ClassDashboard.jsx` `/class` (grouped advanced) | `BundleDashboard.jsx` `/bundle` (Overview/Advanced tabs) | `SubscriptionDashboard` → Frequency or **Legacy** variant (5 tabs) |
| Summary card | price, locations, staff, deposit, cancellation | + schedule, lead instructor, attendees, delivery | included services, bundle duration | price/period, benefit, billing, rules |
| Advanced modules | variants, products, related, resources, forms, settings, notifications | requirements, agenda, materials, certificates, equipment, bookings, models, session-packs, pricing-tiers, visibility, online-link, products, resources, forms, settings, notifications | included, pricing/order, resources, forms, settings | benefits, terms/renewals, frequency-sessions/billing, forms, settings, notifications, visibility |
| Related/upsell | **RelatedServices** group builder (service only) | — | (bundle *is* a package concept) | "included offers" via benefits |
| Preview | shared `ServicePreview` (read-only, no publish) | same | same | same |
| Publish | status toggle only | status toggle **+ persists** (only type that does) | status toggle only | status toggle only |

**Old-app draft model:** one fat `emptyDraft` envelope shared by all types (App.jsx), with `classDetails` / `bundleDetails` / `subscriptionDetails` sub-objects. Step counts via `wizardTotalFor = {service:4, class:7, bundle:4, subscription:4}`.

---

## 2. What ALREADY exists in the NEW app (per type)

**Creation routes — all 14 present, zero dangling:**

| Type | Steps that exist | `TOTAL_STEPS` |
|---|---|---|
| Service | basics → locations → staff → price | 4 |
| Class | basics → class-participants → class-schedule → locations → staff → class-pricing | 6 |
| Bundle | basics → bundle-services → bundle-pricing | 3 |
| Subscription | basics → subscription-type → subscription-benefits → subscription-billing | 4 |

Plus `/new` (intro) + `/new/type` (selector). All branch targets from `basics` resolve to real files.

**Draft model (`wizardStore.ts`):** `ServiceDraft` carries service fields top-level + `classDetails: ClassDraft`, `bundle: BundleDraft`, `subscription: SubscriptionDraft` sub-objects, each with its own `empty*` constant and `update*` action. Reasonably complete for service/class; thin for bundle/subscription (see §3).

**Catalogue (`/app/services`):** fully handles all four types via tabs (`SERVICE_TYPES`), reads live from `useOffersStore`, search + category chips + grouped rows + Draft pill. Newly created offers appear here.

**Dashboard (`/app/services/[id]`):** one shared component, `isClass` branch only. Advanced module list per type. Footer Preview + Publish/Unpublish (status toggle works).

**Advanced sub-routes that exist (8):** `variants`, `products`, `related`, `resources`, `forms`, `settings`, `photos`, `preview` — all real screens (local state only).

**Persistence:** `useOffersStore` (Zustand, in-memory, session-only). `offerFromDraft → addOffer` persists created offers to the catalogue for all four types. Bundle discount price math works. `setStatus` toggles publish.

**Seed data (`DemoOffer`):** 18 services, 3 classes, 1 bundle, 1 subscription (23 total).

---

## 3. What is MISSING in the new app

### 3a. The data seam (the critical gap — blocks everything)
`offerFromDraft` (`offersStore.ts:27-47`) carries only `id, type, name, category, price, durationMin (service only), status, icon`. **Every type-specific field is dropped on create:**
- Service: `description`, `deposit*`, `locationModes`, `locationIds`, `mobile`, `staffIds`
- Class: the **entire** `classDetails` (capacity, minParticipants, schedule, dates, times, repeat, bookingStructure)
- Bundle: `serviceIds`, `kind` (only used transiently for price math, never stored)
- Subscription: the **entire** `subscription` block (subType, benefitType, billingPeriod, sessions, credit, discount, joiningFee, term)

`DemoOffer` (`offers.ts:8-18`) has no fields to hold any of this. **This is the single highest-leverage fix** — until it lands, class/bundle/subscription dashboards have nothing real to show.

### 3b. Dashboard depth per type
- One shared dashboard with only an `isClass` branch. **Bundle and subscription render the service layout** — no included-services list, no billing/benefit summary.
- Summary card values hardcoded (§4).
- No per-type summary rows (class schedule/instructors/attendees; bundle contents; subscription billing/benefit).

### 3c. Missing advanced module sub-routes
- **Class:** `requirements`, `agenda`, `materials`, `certificates` are listed on the dashboard but have **no `href` and no page** (dead buttons). Old app has all of these.
- **All types:** `notifications` row is a dead button (no route).
- Old-app modules with no new-app equivalent: class `session-packs`, `pricing-tiers`, `equipment`, `bookings`, `models`, `visibility`, `online-link`; bundle `included`/`order` editors; subscription `benefits`/`terms`/`frequency-*` editors.

### 3d. Module write-back
Every existing module editor (variants/products/related/resources/forms/photos) persists to **local component state only** — nothing flows back to the offer/store. (Explicitly "backlog" in code comments.)

### 3e. Thin type modelling
- **Bundle `flexible` kind** is cosmetic — no "choose N of M" count field; flexible and fixed behave identically. No expiry/validity window.
- **Subscription** has two overlapping taxonomies: `subType` (set on type page, never read again) vs `benefitType` (drives everything). `access` benefit has no fields. Type page has no continue gate.
- **Class** captures `repeat`/`repeatWeeks` but only as a summary line — no per-weekday selection; no waitlist / per-session capacity; the old app's multi-session course modelling is collapsed.
- `durationMin` is dropped for all non-service types.

### 3f. Preview is hardcoded
`preview/page.tsx` shows static rating `4.9`, a fixed description, and `Salon Soho · 14 Greek Street` regardless of offer; only name/category/duration/price are real.

### 3g. Persistence durability
Store is not wrapped in `zustand/persist` — created offers and status changes are lost on full reload. Acceptable for a prototype; flag, don't necessarily fix.

---

## 4. What EXISTS but is broken or disconnected

| Issue | Location | Detail |
|---|---|---|
| **Hardcoded location summary** | `[id]/page.tsx:135` | literal `"In-salon · Mobile"` — ignores the offer |
| **Hardcoded deposit** | `[id]/page.tsx:146` | literal `£20` |
| **Hardcoded cancellation** | `[id]/page.tsx:150` | literal `24h` |
| **Hardcoded class duration** | `[id]/page.tsx:117-118` | literal `"per attendee"` |
| **Staff row has no count/names** | `[id]/page.tsx:140` | static "Staff members"/"Instructors" label |
| **Dead class advanced rows** | `[id]/page.tsx:60-64` | requirements/agenda/materials/certificates — no href, no page |
| **Dead notifications row** | `[id]/page.tsx` | no route for either type |
| **Module write-disconnect** | all 8 module pages | local state only; nothing reaches the store |
| **Hardcoded preview content** | `preview/page.tsx:33,36-41` | rating/description/location static |
| **`durationMin` dropped** | `offersStore.ts:43` | non-service types never store duration |
| **Dead "Watch a quick tutorial"** | `new/page.tsx:55` | button with no `onClick` |
| **Staff empty-state copy** | `staff/page.tsx:113` | says "instructors" even for services |
| **`OFFER_MODULES` orphaned** | `offers.ts:67-75` | unused constant; dashboard builds lists inline |

None of these is a crash — they're correctness/parity gaps and dead controls.

---

## 5. Features SHARED across offer types

These should be built/fixed **once** and reused by all four:

1. **Type selector** (`/new/type`) — already shared.
2. **Basics step** (`/new/basics`) — shared by all four (icon/name/category/description + branch routing).
3. **Wizard chrome** — `WizardTitle`, `WizardFooter`, `TOTAL_STEPS`, `FieldLabel`, `fieldInput`, `Toggle`.
4. **Sheets infrastructure** — `Sheet`/`BottomSheet`; Icon, Category, New-category sheets (basics) used by all.
5. **Persistence seam** — `offerFromDraft → addOffer → resetDraft → /app/services/{id}?created=1`. **One function, four branches.** Widening it serves every type at once.
6. **Catalogue list** — already type-agnostic via tabs.
7. **Dashboard shell** — header, identity row, success banner, photos strip, advanced list scaffold, Preview/Publish footer.
8. **Advanced modules shared by ≥2 types** — forms, resources, settings, notifications, products (service+class), variants.
9. **Preview + Publish** — one preview component, one `setStatus` toggle.
10. **Deposit, locations, staff** — shared by service + class.

## 6. Features that are TYPE-SPECIFIC

| Type | Specific to it |
|---|---|
| **Service** | locations/staff/price are its core; related-services group builder |
| **Class** | attendees (capacity/min/booking-structure), schedule (dates/times/repeat/course), instructors, requirements, agenda, materials, certificates, session-packs, pricing-tiers, visibility, online-link, "per attendee" pricing |
| **Bundle** | included-services picker, fixed-vs-discount/package-tier pricing, order & gaps, no locations/staff |
| **Subscription** | type (frequency/credit/membership), benefits (sessions/credit/discount/access), billing period, joining fee, minimum term, cancellation/pause rules; no locations/staff/duration |

---

## 7. Existing new-app components to REUSE (no new code)

- **Chrome:** `ScreenHeader`, `WizardTitle`, `WizardFooter`, `TOTAL_STEPS`, `FieldLabel`, `fieldInput`, `Toggle` (`@/components/ui`).
- **Overlays:** `Sheet` / `BottomSheet` (frame-scoped) — pattern proven by Icon/Category/InSalon/Mobile sheets.
- **Atoms/molecules:** `Input`, `Textarea`, `Switch`/`ToggleRow`, `Chip`, `SegmentedControl`/`Segmented`, `Card`, `ListRow`, `EmptyState`.
- **Layout:** `AppFrame` (via `new/layout.tsx`), `AppTabBar` (app shell).
- **Stores/data:** `useWizardStore` (+ `updateMobile`/`updateClass`/`updateBundle`/`updateSubscription` already exist), `useOffersStore`, `useCategoriesStore`, `useTeamStore`, `serviceIcons`+`iconFor`, `defaultCategories`+`categorySwatches`+`tintFromHex`, `businessLocations`.
- **Patterns to copy in-repo (not the old app):** the existing service `ModeCard`/sheet pattern, the dashboard summary-row pattern, the module-row list pattern.

## 8. New components GENUINELY needed

Deliberately minimal — prefer composition. Candidates (add to barrel + smoke only if reused ≥2×):

1. **`SummaryRow`** (molecule) — the dashboard summary card rows (icon + label + value + chevron) are repeated and will multiply across type-specific summaries. One shared row is worth extracting. *(Likely yes.)*
2. **`StepperInput`** (molecule) — +/- stepper (radius, notice, capacity, sessions, term). Already hand-rolled in 2+ places. *(Likely yes.)*
3. **Type-specific dashboard summary blocks** — these are screen-local compositions, **not** shared primitives. Build inline in the dashboard per type (`ClassSummary`, `BundleSummary`, `SubscriptionSummary`), not in the barrel.
4. **Advanced module editor pages** (requirements/agenda/materials/certificates/etc.) — screen-local pages under `[id]/`, composing existing primitives. Not shared components.

**Not needed:** DurationPicker, DepositControl, LocationCards — already inlined; HelpTrigger — no help system; FAB — list uses a "New" pill. Avoid recreating retired `ui.tsx`/`controls.tsx`/`shared.tsx`.

## 9. Old-app behaviours NOT to copy (bugs / legacy quirks)

1. **Never-persists bug** — old `create()` for service/bundle/subscription only sets `status:'draft'` and navigates; never calls `upsertSavedOffer` (`wizard/Price.jsx:34-37`, `BundlePricing.jsx`, `SubscriptionBilling.jsx`). Created offers vanish on `resetDraft`. **New app already fixes this — keep it.**
2. **Per-type dashboard redirect shim** — `Dashboard.jsx` redirects class/bundle/subscription away but still carries dead `modulesFor()` branches for them. Use **one shared dashboard with type branches** (new-app pattern), not 4 files + dead code.
3. **No `resetDraft` on entry** — old type selector only patches `type`; draft is a long-lived singleton. **New app's `/new/type` correctly calls `resetDraft()` — keep it.**
4. **Inconsistent class `step` numbers** — old class screens hardcode WizardFooter step props inconsistently because each file doubles as a dashboard editor. New app should derive step from a single ordered source (`TOTAL_STEPS` + explicit step props per linear order).
5. **Dead route stubs** — `AdvancedSectionStub`, `additional-staff`, `class-forms`, `class-notifications`, legacy `ClassTickets`. Don't port; wire real modules or omit.
6. **No-op header "More" buttons, non-functional hero icon button, residual `publishError` state, mock Members panel** — don't reproduce dead controls.
7. **`Date.now()`/`Math.random()` ids** — old app fine (client-only); new app must keep ids out of module/render top level. Prefer a shared SSR-safe id helper over `Math.random()` in `offerFromDraft`.
8. **`@phosphor-icons`, hash routing, Outlet-context draft, Tailwind v4** — don't port the architecture; use lucide + App Router + Zustand + Tailwind 3.4.
9. **"Legacy" subscription dashboard** — the old app itself names the credit/membership path `LegacySubscriptionDashboard`. Design the new subscription dashboard cleanly around `benefitType`; don't copy the legacy split.
10. **Bundle "pack" 3-step variant** — adds branching complexity; the new bundle model has no `pack`. Omit unless product asks.

---

## 10. Most efficient implementation order

Ordered to **maximise shared leverage and unblock dependents first.** Each phase ends green on `npx tsc --noEmit && npx next lint && npm run smoke`.

### Phase 0 — Data seam (foundation, unblocks all 4 types) ⭐
Widen `DemoOffer` with optional, type-spanning fields (description, deposit, locationModes/Ids, mobile, staffIds, **classDetails, bundle, subscription** snapshots). Rewrite `offerFromDraft` to carry the right sub-block per type. Add a shared SSR-safe id helper. Smoke: round-trip assertion per type.
*Why first: every dashboard and summary depends on real persisted data. One change, four types unblocked.*

### Phase 1 — Shared dashboard reads real data
Replace hardcoded summary values (`In-salon · Mobile` / `£20` / `24h` / staff label) with derived values from Phase 0. Extract `SummaryRow`. Graceful fallbacks for seed offers lacking optional fields.
*Why second: makes service + the shared shell correct for all types before adding per-type depth.*

### Phase 2 — Per-type dashboard summaries
Add `BundleSummary` (included services + pricing), `SubscriptionSummary` (billing/benefit), and extend the class branch (schedule/instructors/attendees). Screen-local compositions on `SummaryRow`.
*Why third: bundle/subscription currently render the service layout — this is the most visible type gap.*

### Phase 3 — Creation parity pass (all four wizards)
Verify each wizard against the legacy trace; tighten thin models where product wants it (bundle flexible "choose N", subscription `subType`/`benefitType` reconciliation + type-page gate, class repeat/weekday). Fix shared quirks (staff copy, dead tutorial button). Mostly verification + small fixes since screens exist.

### Phase 4 — Advanced modules: wire the dead rows
Build the 4 missing class module pages (requirements, agenda, materials, certificates) + notifications, composing existing primitives. Decide scope for old-app extras (session-packs, pricing-tiers, visibility, online-link) — defer low-value ones explicitly.

### Phase 5 — Module write-back
Make existing module editors (variants/products/related/resources/forms/photos) persist to the offer via `updateOffer`, replacing local-state-only. Largest surface; do after the model is stable.

### Phase 6 — Preview, polish, a11y, responsive
Make preview read the real offer. Full a11y + 378px responsive pass. Optional: `zustand/persist` for reload durability (flag as product decision). Final quality gate + end-to-end round-trip per type.

**Dependency spine:** `Phase 0 → Phase 1 → {Phase 2, Phase 3} → Phase 4 → Phase 5 → Phase 6`. Phases 2 and 3 can proceed in parallel once 1 is green. Phase 0 is the hard gate for everything.

---

## Appendix — Reconciliation notes (old ↔ new step counts)

| Type | Old steps | New steps | Delta to decide |
|---|---|---|---|
| Service | 4 | 4 | parity ✅ |
| Class | 7 (incl. set-times, separate location/remote) | 6 (set-times folded into schedule) | new app collapses times into `class-schedule`; confirm acceptable vs old 7-step |
| Bundle | 4 (3 for pack) | 3 (no order&gaps) | old `bundle-order` (order + gaps/timing) not ported — decide if needed |
| Subscription | 4 (+ frequency-sessions/billing branch) | 4 (type→benefits→billing, no frequency branch) | old frequency branch collapsed into benefits; confirm the `subType` reconciliation in Phase 3 |

These deltas are **product decisions**, not bugs — the new app deliberately simplified. Flag each for confirmation in Phase 3 rather than auto-restoring old structure.
