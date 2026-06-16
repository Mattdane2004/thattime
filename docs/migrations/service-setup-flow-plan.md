# Service Setup Flow — Staged Implementation Plan

> ⚠️ **SUPERSEDED (2026-06-15)** by [`offers-system-migration.md`](offers-system-migration.md), whose Phase 0–6 plan covers all four offer types. Kept for history — do not action this services-only plan.

> **Based on:** [`service-setup-flow-migration.md`](service-setup-flow-migration.md)
> **Date:** 2026-06-15
> **Status:** Plan only — no implementation files changed

## Overview

The service creation flow is **already structurally complete** in the new app. All routes exist; all four wizard steps are wired; `offerFromDraft → addOffer` already persists created services. The staged work is:

- **Real code changes:** Stages 1, 7, 10, 12
- **Verification passes** (fix only what deviates): Stages 2–6, 8–9, 11

Build order matters: Stage 1 widens `DemoOffer` and fixes `offerFromDraft` — everything downstream depends on it. Complete Stages in sequence. Each stage ends green on the quality gate:

```bash
npx tsc --noEmit && npx next lint && npm run smoke
```

Do not start the next stage until the current one passes.

---

## Stage 1 — Data model and draft setup

### Goal

Lay the foundation for the whole migration. Extend `DemoOffer` with optional fields for all wizard-collected data; rewrite `offerFromDraft` to carry those fields through for services; add a smoke assertion confirming the round-trip. Optionally extract a shared SSR-safe id helper.

This is the only stage that changes shared data-model code. Everything else depends on it.

### Files likely to change

| File | Change |
|---|---|
| `src/lib/data/offers.ts` | Add 6 optional fields to `DemoOffer` |
| `src/lib/store/offersStore.ts` | Rewrite `offerFromDraft` service branch to carry the new fields |
| `src/lib/ids.ts` *(new, optional)* | SSR-safe incrementing id helper (replaces `Math.random()` in `offerFromDraft`) |
| `smoke.tsx` | New assertion: `offerFromDraft` round-trip carries all fields |

### Existing components to reuse

None — data and store only. `MobileSettings` is already exported from `src/lib/store/wizardStore.ts`; import it rather than re-declaring.

### New components required

None. `src/lib/ids.ts` is a small utility module, not a component.

### Data or state changes

Add to `DemoOffer` in `src/lib/data/offers.ts` (all optional; the 23 seed offers are unchanged):

```ts
description?: string;
deposit?: { enabled: boolean; amount: string };
locationModes?: { inSalon: boolean; mobile: boolean; remote: boolean };
locationIds?: string[];   // empty array = all locations
mobile?: MobileSettings;  // imported from wizardStore
staffIds?: string[];
```

Extend the service branch of `offerFromDraft` in `src/lib/store/offersStore.ts`:

```ts
// service fields only (class/bundle/subscription branches unchanged)
description: draft.description || undefined,
deposit: draft.depositEnabled
  ? { enabled: true, amount: draft.depositAmount }
  : undefined,
locationModes: { ...draft.locationModes },
locationIds: [...draft.locationIds],
mobile: draft.locationModes.mobile ? { ...draft.mobile } : undefined,
staffIds: [...draft.staffIds],
```

SSR-safe id (optional but recommended): replace `Math.random()` in `offerFromDraft` with an incrementing module-level counter (safe because it only runs in event-handler context, but a named helper is cleaner):

```ts
// src/lib/ids.ts
let seq = 0;
export const nextId = (prefix: string) => `${prefix}_${String(++seq).padStart(4, "0")}`;
```

### Validation rules

- TypeScript strict mode — no new required fields; `tsc --noEmit` must still pass over all 23 seed offers and all consuming screens
- `offerFromDraft` called with a sparse draft (no description/deposit/locations/staff) must not crash — all new fields guard via `|| undefined` or optional chaining

### How to test

1. `npx tsc --noEmit` — zero new errors
2. `npm run smoke` — existing needles still pass
3. New smoke assertion verifies a draft with description `"test"`, `depositEnabled: true`, `depositAmount: "20"`, `locationModes: {inSalon:true,mobile:false,remote:false}`, `staffIds:["m1"]` round-trips through `offerFromDraft` and the returned object carries all fields
4. A second call with `emptyDraft` returns an object without crashing (all new fields `undefined` or empty array)

### Acceptance criteria

- [ ] `DemoOffer` has all six optional fields; every existing seed offer and consumer screen compiles without change
- [ ] `offerFromDraft` for a fully-filled service draft returns an object containing all six new fields
- [ ] `offerFromDraft` for an empty draft (just name/category) returns an object without crashing
- [ ] Quality gate green

---

## Stage 2 — Routes and navigation skeleton

### Goal

Walk the full navigation path in the browser and confirm every link and `router.push` resolves to the correct page with no 404 or blank screen. No code changes are expected; document and fix any deviations found.

### Files likely to change

None expected. If a link target is wrong: the specific `href` or `router.push` argument in that page file.

### Existing components to reuse

All routes already exist under `src/app/`.

### New components required

None.

### Data or state changes

None.

### Validation rules

None — navigation only.

### How to test

1. `npm run dev`
2. Walk the full path manually:
   - Hub → "Offerings" tile → `/app/services`
   - `/app/services` → "New" button → `/new` (intro)
   - `/new` → "Get started" → `/new/type` (type selector)
   - `/new/type` → "Service" card → `/new/basics`
   - At `/new/basics`: WizardFooter back → `/new/type`; header X-close → `/app/hub`
   - Complete each step forward: basics → locations → staff → price (verify forward links)
3. Use browser back button at each step; confirm it stays within the wizard

### Acceptance criteria

- [ ] Every hop above resolves without 404, blank screen, or unexpected redirect
- [ ] At `/new/basics` the wizard shows "Step 1 of 4" and service-specific placeholder copy ("e.g. Classic haircut")
- [ ] WizardFooter back at Step 1 → `/new/type`; header X-close → `/app/hub`
- [ ] Steps 2–3 show a back-chevron in the header (not X-close); Step 4 shows X-close (same as Step 1)

---

## Stage 3 — Services list and entry points

### Goal

Confirm the Offerings list at `/app/services` renders seed services correctly across all UI elements (type tabs, search, category chips, grouped rows, Draft chip, "New" button), and that the entry path from Hub → list → "New" is intact.

### Files likely to change

`src/app/app/services/page.tsx` — verify only; minor copy or filter fixes if found.

### Existing components to reuse

`useOffersStore`, chip row, grouped list rows, `Link` to `/new`, `Search` + filter icon, `offerMeta`.

### New components required

None.

### Data or state changes

None. (Newly created services appear here after Stage 9.)

### Validation rules

None for this stage.

### How to test

1. Open `/app/services`
2. Confirm "Services" tab is active by default; seed services appear grouped by category
3. Confirm `svc_skin_consultation` has a "Draft" chip; all others show no chip
4. Type "cut" in search → list narrows to matching names
5. Tap a category chip → list filters to that category only; tap "All" → resets
6. Tap "New" → navigates to `/new`

### Acceptance criteria

- [ ] Seed services appear correctly under the Services tab, grouped by category
- [ ] "Draft" chip only on the draft seed service
- [ ] Search narrows the list; category chips filter correctly; "All" chip shows count
- [ ] "New" pill navigates to `/new`

---

## Stage 4 — Type selector

### Goal

Confirm the type selector at `/new/type` resets the wizard draft, seeds `draft.type = "service"`, and routes to `/new/basics` correctly. All four type cards must be tappable and branch correctly.

### Files likely to change

`src/app/new/type/page.tsx` — verify only; no changes expected.

### Existing components to reuse

Type cards (icon + label + description + chevron), `ScreenHeader`, `useWizardStore` (`resetDraft`, `updateDraft`).

### New components required

None.

### Data or state changes

On service tap: `resetDraft()` → `updateDraft({ type: 'service' })` → `router.push('/new/basics')`. Both actions already in `pick()` at line 24.

### Validation rules

No gate — any card tap navigates immediately.

### How to test

1. Navigate to `/new/type`
2. Tap "Service" → confirm landing on `/new/basics` with "Step 1 of 4" and service copy
3. Navigate back; tap "Class" → confirm it routes to `/new/class-participants` (out of scope but proves branching works)
4. Navigate back; tap "Service" again → confirm the draft is clean (name is empty, not carrying stale class state)

### Acceptance criteria

- [ ] "Service" → `resetDraft()` + `updateDraft({type:'service'})` → `/new/basics`
- [ ] All four type cards route to their respective first step
- [ ] "What are you adding?" heading renders with subtitle "You can change this later."
- [ ] Back → `/new` intro

---

## Stage 5 — Basics step

### Goal

Verify all four fields (icon, name, category, description) are editable and write to the draft; that the three sheets (Icons, Category, New-category) open, commit, and close correctly; and that the validation gate works.

### Files likely to change

`src/app/new/basics/page.tsx` — verify only; fix any sheet behaviour, copy, or layout drift found.

### Existing components to reuse

`ScreenHeader`, `WizardTitle`, `WizardFooter`, `FieldLabel`, `fieldInput`, `Sheet`, `useCategoriesStore`, `serviceIcons` + `iconFor`, `tintFromHex`, `categorySwatches`.

### New components required

None. `IconSheet` and `CategorySheet` (including the new-category sub-sheet) are already defined inline in this file.

### Data or state changes

All writes via `updateDraft({icon, name, category, description})` and `useCategoriesStore.addCategory`. Already wired.

### Validation rules

| Gate | Condition |
|---|---|
| Next button | `Boolean(draft.name.trim() && draft.category)` |
| "Add category" button | `disabled` when `name.trim() === ""` |
| Duplicate category | Silent no-op in store (no user-visible error to add) |

### How to test

1. Open basics with a fresh service draft; confirm Next is disabled
2. Enter a name → Next still disabled (no category); pick a category → Next enables
3. Open icon sheet → search "crown" → filter by "Beauty" → pick Crown → "Save" → icon tile updates
4. Open category sheet → search "Col" → only Colour shows → tap it → sheet shows colour dot + name selected; "Done" closes → chip renders on basics page
5. Open category sheet → "New category" → type "My Test", pick purple → "Add category" → closes → "My Test" selected; open again and try adding "My Test" again → no duplicate appears in list (silent)
6. Enter description text → textarea retains value when navigating away and back

### Acceptance criteria

- [ ] All four fields editable; values persist to draft immediately
- [ ] Icon sheet: search + category-chip filter work; staged commit ("Save"); selected icon renders on tile with category colour tint
- [ ] Category sheet: search, live-select, "Done" closes; selected category renders with colour dot
- [ ] New-category sub-sheet: name + colour swatch; "Add category" commits; duplicate silently ignored; new category auto-selected
- [ ] Validation gate: Next disabled with no name or no category; enabled with both

---

## Stage 6 — Locations step and settings sheets

### Goal

Confirm the three mode cards toggle independently; In-salon and Mobile open their settings sheets; sheet changes are reflected in the card summary immediately; the ≥1 mode gate works.

### Files likely to change

`src/app/new/locations/page.tsx` — verify only; fix any summary-text, sheet behaviour, or layout issues found.

### Existing components to reuse

`ScreenHeader`, `WizardTitle`, `WizardFooter`, `Sheet`, `Toggle`, `useWizardStore` (`draft.locationModes`, `draft.locationIds`, `draft.mobile`, `updateDraft`, `updateMobile`), `businessLocations`.

### New components required

None. `ModeCard`, `InSalonSheet`, and `MobileSheet` are already defined inline in this file.

### Data or state changes

| Action | Store call |
|---|---|
| Toggle a mode | `updateDraft({ locationModes: { ...modes, [key]: !modes[key] } })` |
| Select all locations | `updateDraft({ locationIds: [] })` |
| Select specific salons | `updateDraft({ locationIds: [...ids] })` |
| Mobile fee/radius/notice | `updateMobile(patch)` |

### Validation rules

Next disabled until `modes.inSalon || modes.mobile || modes.remote`.

Note: `emptyDraft` seeds `locationModes.inSalon = true` — confirm the page renders with In-salon pre-selected on first load.

### How to test

1. Open locations with a fresh draft; confirm In-salon is pre-selected (navy border, filled check)
2. Deselect In-salon → Next disables; re-select → Next re-enables
3. Open In-salon sheet → select a specific salon; close → summary updates from "All locations" to the salon name + count
4. Toggle "All locations" → summary resets to "All locations"
5. Enable Mobile; open Mobile sheet → toggle travel fee on → set "Per mile", amount 20, radius 15, notice 3 Days → "Save settings" → card summary shows "15 miles · £20 per mile · 3d notice"
6. Enable Remote → check circle fills; no sheet (no "Edit settings" row)
7. Deselect all three → Next disables

### Acceptance criteria

- [ ] Each mode card independently toggleable; selected = navy border + filled check circle
- [ ] In-salon sheet: search, "All locations" row, per-salon checkboxes, selected-only filter, "Save settings" closes
- [ ] Mobile sheet: travel-fee toggle, flat/per-mile selector, fee input, radius stepper, notice stepper + Days/Hours segmented; "Save settings" closes
- [ ] Mode card summaries update to reflect sheet settings after close
- [ ] Remote is a toggle-only mode — no settings sheet
- [ ] Next disabled until ≥1 mode enabled

---

## Stage 7 — Staff step

### Goal

Fix the staff empty-state copy (currently says "instructors" for all offer types); verify search, role filter, multi-select, and the ≥1 selection gate.

### Files likely to change

`src/app/new/staff/page.tsx` — one copy fix + verification.

### Existing components to reuse

`ScreenHeader`, `WizardTitle`, `WizardFooter`, `useTeamStore`, `Search`, `SlidersHorizontal` filter, avatar initials, `Check` glyph.

### New components required

None.

### Data or state changes

`updateDraft({ staffIds })` — already wired. No store changes.

### Specific fix

In `staff/page.tsx` the empty-state condition at line 113 uses the same copy for both class and service. Change the service path:

**Before:**
```ts
{eligible.length === 0
  ? "No eligible team members yet — invite instructors from the Team section."
  : "No matches"}
```

**After:**
```ts
{eligible.length === 0
  ? isClass
    ? "No eligible team members yet — invite instructors from the Team section."
    : "No eligible team members yet — add staff from the Team section."
  : "No matches"}
```

### Validation rules

Next disabled until `draft.staffIds.length > 0`.

### How to test

1. Open staff; confirm title is "Who offers it?" (not "Who teaches it?")
2. Type in search → list narrows; clear → full list returns
3. Tap filter button → role chip row appears; pick a role → list filters; all chip → resets
4. Tap a staff member → square check fills navy; tap again → deselects; Next enables with ≥1, disables at 0
5. (To test empty state): if all team members are non-bookable or none exist, confirm copy reads "add staff" not "invite instructors"

### Acceptance criteria

- [ ] Title reads "Who offers it?" for service type
- [ ] Search + role filter narrow list correctly
- [ ] Multi-select toggles correctly (navy square check on/off)
- [ ] Next disabled with 0 selections, enabled with ≥1
- [ ] Empty state for no bookable members reads "add staff from the Team section" (not "instructors") when `type === "service"`

---

## Stage 8 — Price step

### Goal

Verify the price input, hours + minutes duration grid, and deposit toggle + conditional amount field; confirm all three inputs interact correctly with the draft; confirm the validation gate blocks "Create service" until the conditions are satisfied.

### Files likely to change

`src/app/new/price/page.tsx` — verify only; fix any validation, input behaviour, or layout issues found.

### Existing components to reuse

`ScreenHeader`, `WizardTitle`, `WizardFooter`, `FieldLabel`, `fieldInput`, `Toggle`, `useWizardStore`.

### New components required

None. Duration is decomposed to `hours + mins` inline in this file — no `DurationPicker` primitive needed.

### Data or state changes

| Field | Draft key | Notes |
|---|---|---|
| Price | `price` (string) | Big £-prefix input |
| Hours | derived from `durationMin` | `Math.floor(durationMin / 60)` |
| Minutes | derived from `durationMin` | `durationMin % 60` |
| Deposit toggle | `depositEnabled` (bool) | Shows/hides amount field |
| Deposit amount | `depositAmount` (string) | Only validated when `depositEnabled` |

### Validation rules

```ts
Boolean(draft.price && draft.durationMin > 0 && (!draft.depositEnabled || draft.depositAmount))
```

"Create service" button (`WizardFooter nextLabel`) is disabled until this resolves to `true`.

### How to test

1. Open price with a fresh draft; confirm "Create service" is disabled
2. Enter price "65" → still disabled (duration is 60min from `emptyDraft` — wait, `emptyDraft.durationMin = 60` so duration > 0; the gate may already be satisfied by price alone if deposit is off)
3. Confirm: with `emptyDraft` defaults (durationMin=60, depositEnabled=false), entering a price alone should enable "Create service"
4. Toggle deposit on → amount field appears; "Create service" disables again (no amount); enter "20" → re-enables; toggle deposit off → amount field hides; re-enables
5. Clear price → disables; set hours to 0 and mins to 0 → disables (durationMin = 0)
6. WizardFooter back → `/new/staff`; header X-close → `/app/hub`

### Acceptance criteria

- [ ] £ prefix large input, hours + minutes grid, deposit toggle + conditional amount field all render and update draft
- [ ] With `emptyDraft` defaults (duration 60min, no deposit), entering price enables "Create service"
- [ ] With deposit enabled, a deposit amount is also required
- [ ] "Create service" is the `nextLabel` — not "Next"
- [ ] Back in WizardFooter → `/new/staff`; header X-close → `/app/hub`

---

## Stage 9 — Create service and end-to-end persistence

### Goal

After Stages 1–8, run the complete round-trip in the browser: fill all four wizard steps → "Create service" → offer is persisted → appears in the Offerings list with a Draft chip → its dashboard opens with the `?created=1` banner and correct data. No code changes; this is a system-level verification of Stage 1's foundation.

### Files likely to change

None. If issues surface, they trace back to Stage 1 (`offerFromDraft`) or a prior verification stage.

### Existing components to reuse

`offerFromDraft`, `addOffer`, `resetDraft`, `router.push` — all already wired in `price/page.tsx`.

### New components required

None.

### Data or state changes

After "Create service":
- `useOffersStore.offers` gains the new record at index 0
- `useWizardStore.draft` resets to `emptyDraft`

### Validation rules

The created offer must have `status: 'draft'` and a unique `id`.

### How to test

Complete wizard with real, distinct data to confirm fields round-trip:

1. Navigate to `/new/type` → Service → basics
2. Basics: pick Crown icon, name "Luxury Facial", category "Beauty", description "An indulgent facial treatment"
3. Locations: enable In-salon + Mobile; open Mobile sheet → radius 8mi, notice 4h, flat fee £15; close
4. Staff: select 2 members
5. Price: £65, 1h 30min, deposit £20
6. Tap "Create service"

Verify:
- Navigates to `/app/services/{id}?created=1`
- Success banner: "Luxury Facial created as a draft — publish it when you're ready."
- Navigate back → `/app/services` → Services tab → "Luxury Facial" at top with "Draft" chip, "£65 · 90min" meta, category "Beauty"
- Tap the row → dashboard; name/icon/category/price all match what was entered

### Acceptance criteria

- [ ] "Create service" navigates to the new dashboard with `?created=1` banner
- [ ] The new service appears at the top of the Offerings list under the Services tab
- [ ] Service status is Draft; "Draft" chip renders in the list row
- [ ] Dashboard shows correct name, icon, category, price, duration from the wizard
- [ ] Wizard draft is reset — starting a second service begins with a clean form
- [ ] No crash; no duplicate IDs on repeated creates

---

## Stage 10 — Service dashboard draft state

### Goal

Replace the hardcoded `"In-salon · Mobile"`, `"£20"`, and `"24h"` placeholders in the summary card with values derived from the offer fields added in Stage 1. Seed offers (which have none of the optional fields) must render gracefully with fallbacks.

### Files likely to change

`src/app/app/services/[id]/page.tsx` — summary card section only.

### Existing components to reuse

`MapPin`, `Users`, `ChevronRight` — all already imported. `offer.locationModes`, `offer.staffIds`, `offer.deposit` from Stage 1.

### New components required

None.

### Data or state changes

Read-only — derives display strings from `offer.*`. No store writes.

**Locations row** (replaces hardcoded `"In-salon · Mobile"`):

```ts
const locationLabel = (() => {
  const m = offer.locationModes;
  if (!m) return "Location not set";
  const parts = [
    m.inSalon && "In-salon",
    m.mobile && "Mobile",
    m.remote && "Remote",
  ].filter(Boolean);
  return parts.join(" · ") || "Location not set";
})();
```

**Staff row** (replaces static `"Staff members"` label):

```ts
const staffLabel = offer.staffIds?.length
  ? `${offer.staffIds.length} staff member${offer.staffIds.length > 1 ? "s" : ""}`
  : isClass ? "Instructors" : "Staff members";
```

**Deposit stat** (replaces hardcoded `"£20"`):

```ts
const depositDisplay = offer.deposit?.enabled ? `£${offer.deposit.amount}` : "—";
```

**Cancellation stat** (replaces hardcoded `"24h"`): Change to `"—"` — this field is out of scope for the creation wizard and belongs to the Settings advanced module.

### Validation rules

All new derivations must guard against `undefined` optional fields:
- `offer.locationModes` may be `undefined` on seed offers → show "Location not set"
- `offer.staffIds` may be `undefined` → fall back to role label
- `offer.deposit` may be `undefined` → show "—"

### How to test

1. Open any seed offer dashboard (e.g. `/app/services/svc_classic_haircut`) → location row shows "Location not set"; deposit stat shows "—"; cancellation shows "—"; staff row shows "Staff members"
2. Create "Luxury Facial" (In-salon + Mobile, 2 staff, deposit £20) → dashboard shows:
   - Location row: "In-salon · Mobile"
   - Staff row: "2 staff members"
   - Deposit stat: "£20"
   - Cancellation stat: "—"
3. Create a Remote-only service, no deposit → location row: "Remote"; deposit: "—"

### Acceptance criteria

- [ ] Seed offer dashboards render without crash; optional-field rows show graceful fallbacks
- [ ] Created service with multiple location modes shows correct joined label (e.g. "In-salon · Mobile")
- [ ] Staff row shows count when `staffIds` present; falls back to label when absent
- [ ] Deposit stat shows real amount when `offer.deposit.enabled`; shows "—" otherwise
- [ ] Cancellation stat shows "—" (not hardcoded "24h")
- [ ] Quality gate green

---

## Stage 11 — Preview and Publish

### Goal

Confirm both footer buttons on the dashboard work correctly: Preview navigates to the client-facing preview route; Publish toggles offer status (Draft ↔ Active) and updates both the dashboard chip and the Offerings list chip in real time.

### Files likely to change

`src/app/app/services/[id]/page.tsx` — verify only; no changes expected.

### Existing components to reuse

`setStatus` from `useOffersStore`, `<Link>` for Preview, `statusLabel` from `@/lib/data/offers` (maps `"published"` → `"Active"`).

### New components required

None.

### Data or state changes

`useOffersStore.setStatus(id, 'published' | 'draft')` — mutates the offer in place in `offers[]`. Already implemented. `useOffersStore` reactivity propagates to all subscribers (list + dashboard) immediately.

### Validation rules

None — no gate on Publish.

### How to test

1. Create a new service → land on dashboard with "Draft" chip (navy canvas background)
2. Confirm "Publish" button is visible in the footer
3. Tap "Publish" → chip changes to "Active" (green/`bg-success/10 text-success`); button label changes to "Unpublish"
4. Tap "Unpublish" → chip returns to "Draft"; button returns to "Publish"
5. Navigate to `/app/services` → Services tab → confirm the chip in the list row matches current status
6. Navigate back to dashboard; tap "Publish" again; navigate to list → shows "Active" (no chip, or "Active" label — check what `offerMeta` renders for a published offer without a "Draft" chip)
7. Tap "Preview" → confirm it navigates to `/app/services/{id}/preview` (a 404 or placeholder is acceptable; the link must not crash the app)

### Acceptance criteria

- [ ] "Publish" toggles `status` to `"published"`; dashboard chip shows "Active" in green; button becomes "Unpublish"
- [ ] "Unpublish" toggles back to `"draft"`; chip shows "Draft"; button becomes "Publish"
- [ ] Status change is reflected immediately in the Offerings list (no page reload needed)
- [ ] "Preview" link navigates to `/app/services/{id}/preview` without crashing

---

## Stage 12 — Final polish, responsive checks, and accessibility

### Goal

Close all remaining gaps: remove the dead "Watch a quick tutorial" button on the intro page; confirm all accessibility requirements from spec §15; verify the 378px frame viewport; run the full quality gate.

### Files likely to change

| File | Change |
|---|---|
| `src/app/new/page.tsx` | Remove or wire the `"Watch a quick tutorial"` button (no `onClick`) |
| `src/app/new/staff/page.tsx` | Confirm Stage 7 copy fix is in place |
| `smoke.tsx` | Final review: all four wizard needles + `offerFromDraft` round-trip from Stage 1 |

### Existing components to reuse

All. No new code beyond the button removal.

### New components required

None.

### Data or state changes

None.

### Accessibility checklist

Run through `src/app/new/**` and `src/app/app/services/[id]/page.tsx`:

| Check | Where to look |
|---|---|
| `aria-label` on icon-only controls | Back/Close/More buttons; filter `SlidersHorizontal`; sheet close; stepper ± buttons (`aria-label="Less"` / `"More"`) |
| `aria-pressed` on toggle-style buttons | `SlidersHorizontal` filter buttons in staff + InSalonSheet (`aria-pressed={selectedOnly}`) |
| `role="switch"` + `aria-checked` on toggles | `Toggle` component used in locations + price — confirm the component sets these |
| `<label>` or `aria-label` on inputs | All `<input>` and `<textarea>` in basics/price — confirm paired with a visible `FieldLabel` |
| `inputMode` on numeric inputs | Price + deposit: `inputMode="decimal"`; hours/mins/radius/notice: `inputMode="numeric"` |
| Non-colour state for selected rows | Icon grid (navy border), category list (dot), salon checkboxes (check glyph), staff rows (check glyph) — each must have a visible non-colour indicator |
| Tap targets ≥ 40px | Stepper buttons (h-8/h-9), icon grid cells (aspect-square ≈ 56px), chip buttons |

### Responsive checks (378px AppFrame width)

- Each wizard step: no horizontal text overflow; chip rows scroll with `overflow-x-auto`; sticky `WizardFooter` stays pinned at bottom
- Dashboard: summary card, Advanced list, two-button footer all fit within 378px
- Sheets: sheet content scrolls; sticky footer button remains visible

### How to test

1. `npm run dev`
2. Browser DevTools → Accessibility panel → spot-check aria-labels on back/close/stepper buttons
3. Resize to 378px; walk through each wizard step and the dashboard; look for overflow or clipping
4. Confirm `/new` intro has no dead "Watch a quick tutorial" button (removed or wired)
5. Run quality gate: `npx tsc --noEmit && npx next lint && npm run smoke`

### Acceptance criteria

- [ ] "Watch a quick tutorial" button is removed from `/new/page.tsx`, or has a wired `onClick`
- [ ] Every icon-only interactive element across the wizard and dashboard has an `aria-label`
- [ ] `aria-pressed` on filter buttons; `role="switch"` + `aria-checked` on Toggle components
- [ ] All inputs are paired with a visible label element
- [ ] Number inputs use the correct `inputMode`
- [ ] Selected state is always conveyed by a glyph, not colour alone
- [ ] All four wizard steps and the dashboard render correctly at 378px — no clipping, sticky footers pinned
- [ ] Quality gate: `tsc --noEmit`, `next lint`, `npm run smoke` — all green
- [ ] Full browser round-trip: Hub → list → New → type → basics → locations → staff → price → Create → list (Draft) → dashboard (real data) → Publish → list (Active)

---

## Dependency order

```
Stage 1 (data model)
    ↓
Stages 2–8 (routes + screen verifications, can be sequential or parallel)
    ↓
Stage 9 (end-to-end round-trip — verifies Stage 1 + 2–8 together)
    ↓
Stage 10 (dashboard real data — depends on Stage 1 fields being present)
    ↓
Stage 11 (Preview/Publish — depends on Stage 10 dashboard being correct)
    ↓
Stage 12 (polish + quality gate — final pass over everything)
```

**Stage 1 must always go first.** Stages 2–8 are logically independent of each other but build a growing confidence baseline that Stage 9 then validates as a whole.
