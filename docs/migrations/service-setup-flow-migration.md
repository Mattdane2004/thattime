# Service Setup Flow — Migration Spec

> ⚠️ **SUPERSEDED (2026-06-15)** by [`offers-system-migration.md`](offers-system-migration.md), which covers all four offer types. Kept for history — do not action this services-only spec.

> **Status:** Spec only — no implementation yet.
> **Date:** 2026-06-15
> **Scope:** The **service** offer type only (Hub/Services entry → 4‑step wizard → service dashboard). Class / bundle / subscription are out of scope here.
> **Reference:** Legacy app at `~/Desktop/That-time/Apps/that-time-app` (read‑only — never imported, moved, or copied). Behaviour traced end‑to‑end and confirmed by the product owner.
> **Source of truth:** the current **thattime** Next.js app — its framework, routing, state, data model, and component library win wherever they differ from the legacy app.

---

## 1. Overview

Rebuild the legacy "create a service" experience inside the new app, faithful to the **UX structure and content** of the old flow but expressed entirely in the new app's architecture. The new app **already implements** this flow end‑to‑end (type selector → basics → locations → staff → price → dashboard); this migration therefore (a) confirms parity with the traced legacy flow, (b) aligns the **entry path** to preserve the type selector, and (c) closes the one real gap — **the created service must be a correct, persisted record** whose settings round‑trip to the dashboard and the Offerings list, fixing the legacy bug where created services were never saved.

The deliverable of this document is the migration plan; **no flow code is written yet.**

---

## 2. Legacy reference summary

Traced flow (legacy, hash‑routed React‑Router SPA, plain JS, single shared `draft` via `<Outlet context>`):

```
Hub ▸ "Services" tile (/services)
ServicesList ▸ "+"  → resetDraft → /new
TypeSelector "What are you adding?" ▸ "Service" → updateDraft({type:'service'}) → /new/basics
1. Basics     /new/basics     icon · name · category · description        (Step 1 of 4)
2. Locations  /new/locations  In-salon / Mobile / Remote (+ settings)     (Step 2 of 4)
3. Staff      /new/staff      "Who offers it?" searchable multi-select    (Step 3 of 4)
4. Price      /new/price      price · duration · optional deposit         (Step 4 of 4)
   "Create service" → status:'draft' → /service (dashboard)
Service Dashboard /service ▸ summary · photos · Advanced · Preview/Publish
```

- **Completion is the dashboard**, not a separate success screen — landing in **Draft** status with a **Publish** footer.
- Validation gates: Basics needs name + category; Locations needs ≥1 mode enabled; Staff needs ≥1 member; Price needs a price and duration > 0.
- Sheets: IconSheet, CategorySheet → NewCategorySheet (Basics); InSalonSheet, MobileSheet, RemoteSheet (Locations).
- **Known legacy bug:** `create()` only sets `status:'draft'` and navigates — it never persists to `savedOffers`, so created services never appear in the list and are lost on `resetDraft`. **Do not reproduce this.**

Full field‑level trace is the agreed reference for this spec.

---

## 3. New app target architecture

| Concern | New app standard |
|---|---|
| Framework | Next.js 14 App Router, React 18, TypeScript (strict), Turbopack |
| Routing | File‑based segments under `src/app/**`; `useRouter().push` / `<Link>` for navigation |
| Wizard chrome | `/new/*` segments wrapped by `src/app/new/layout.tsx` → `AppFrame` (full‑screen phone frame, **no tab bar**) |
| State | **Zustand** — `useWizardStore` (the draft), `useOffersStore` (catalogue), `useCategoriesStore` (categories). In‑memory/session‑scoped, no backend |
| Persistence seam | `offerFromDraft(draft, offers)` → `useOffersStore.addOffer(offer)` → catalogue; the Offerings list and dashboard both read `useOffersStore` |
| Styling | Tailwind 3.4 on Figma **design tokens** (semantic classes: `bg-canvas`, `text-navy`, `text-muted`, `border-border`, `bg-success/10`, …). **No inline hex** in `className` (data‑driven category colours via `style={{…}}` + `tintFromHex` are the established exception) |
| Components | Compose from `@/components/ui` (atoms/molecules/organisms). Frame‑scoped overlays `Sheet`/`BottomSheet` (not Radix portals) |
| Icons | `lucide-react` only |
| Quality gate | `npx tsc --noEmit && npx next lint && npm run smoke` (unused vars fatal; SSR‑safe: no `Date.now()`/argless `new Date()`/`Math.random()` at module/render top level) |
| Lane ownership | **Austin:** `src/components/ui/**`, tokens, `tailwind.config.ts`. **Matt:** `src/app/**`, `src/lib/data`, `src/lib/store`. New shared component → add to barrel `src/components/ui/index.ts` + a `smoke.tsx` render check |

---

## 4. Route mapping

| Legacy (hash) | New app | Status |
|---|---|---|
| Hub `/services` tile | `/app/hub` → **Offerings** tile (`href:/app/services`) | ✅ exists |
| `ServicesList /services` | `/app/services` (Offerings list) | ✅ exists |
| `TypeSelector /new` | Intro `/new` (page.tsx) → **`/new/type`** (selector) | ✅ exists (note: new app adds an intro screen before the selector) |
| `/new/service` redirect alias | _n/a_ — type carried in `draft.type` set by `/new/type` | ✅ pattern differs (no query alias needed) |
| `/new/basics` (Step 1) | `/new/basics` | ✅ exists |
| `/new/locations` (Step 2) | `/new/locations` | ✅ exists |
| `/new/staff` (Step 3) | `/new/staff` | ✅ exists |
| `/new/price` (Step 4) | `/new/price` | ✅ exists |
| `/service` (dashboard) | `/app/services/[id]` (`?created=1` success banner) | ✅ exists |
| `/service/{photos,preview,settings,…}` | `/app/services/[id]/{photos,preview,settings,variants,products,related,resources,forms}` | ✅ exist (advanced; out of core scope) |

**Entry decision:** preserve the **type selector** in the path. The new app routes the Offerings list's **"New"** button to `/new` (intro) → `/new/type`. Keep this; the legacy "+" → selector behaviour is preserved by `/new/type`. (Optional simplification: point "New" straight at `/new/type` to drop the intro — defer to product; the spec assumes the intro stays.)

---

## 5. Screen‑by‑screen mapping

Legend: ✅ built & matches · 🔧 align to legacy · ➕ fix/extend.

| Legacy screen | New file | Status & notes |
|---|---|---|
| Hub Services tile | `src/app/app/hub/page.tsx` (`offerings` tile) | ✅ Entry preserved as "Offerings". |
| ServicesList | `src/app/app/services/page.tsx` | ✅ Type tabs, search, category chips w/ counts, grouped rows, Draft chip, "New" → `/new`, empty state. Reads `useOffersStore` so **created services appear here**. |
| TypeSelector | `src/app/new/type/page.tsx` | ✅ "What are you adding?" 4 cards; Service → `resetDraft()` + `updateDraft({type})` → `/new/basics`. |
| Basics | `src/app/new/basics/page.tsx` | ✅ Icon (IconSheet), Name, Category (CategorySheet + New‑category sub‑sheet), Description. |
| Locations | `src/app/new/locations/page.tsx` | ✅ In‑salon / Mobile / Remote mode cards with "Edit settings" → InSalon/Mobile sheets. |
| Staff | `src/app/new/staff/page.tsx` | ✅ "Who offers it?" search + role filter + multi‑select. 🔧 Empty-state copy says "invite instructors" even for services — fix to "team members". |
| Price | `src/app/new/price/page.tsx` | ✅ Price, hours/min duration, deposit toggle + amount → **"Create service"**. 🔧 legacy also had a Fixed/Percentage deposit type (optional fidelity — see §9). |
| Service Dashboard | `src/app/app/services/[id]/page.tsx` | ✅ "Edit service", `?created=1` banner, summary, photos, Advanced, Preview/Publish. ➕ summary card currently shows **hardcoded** "In‑salon · Mobile" / "£20" / "24h" instead of the real offer — fix via §10. |

---

## 6. Component library mapping

| Legacy component | New app equivalent (`@/components/ui` unless noted) |
|---|---|
| `BottomSheet` (chrome) | `Sheet` / `BottomSheet` (frame‑scoped Overlays) |
| `ScreenHeader` | `ScreenHeader` (organism) |
| `WizardFooter` | `WizardFooter` + `TOTAL_STEPS` (WizardChrome) |
| Wizard title/hint | `WizardTitle` (WizardChrome) |
| `TextField` | `Input` / `Textarea` (or `fieldInput` class + `FieldLabel`) |
| `Toggle` | `Toggle` (WizardChrome, display) / `Switch` / `ToggleRow` |
| `Pill` | `Chip` / `Segmented` / inline chip rows |
| `DurationPicker` | inline hours/min inputs in `price/page.tsx` (no library primitive needed) |
| `DepositControl` | inline deposit toggle + amount in `price/page.tsx` |
| `LocationCards` | inline `ModeCard` in `locations/page.tsx` |
| `HelpTrigger` | not ported — header shows a static "Help" label (no help content system in new app) |
| `HubCard` | hub tile in `hub/page.tsx` |
| `EmptyState` / `FAB` | `EmptyState` exists; list uses inline empty state + a "New" pill (no FAB), matching current new‑app pattern |

---

## 7. Existing components to reuse (no new code)

- **Chrome:** `ScreenHeader`, `WizardTitle`, `WizardFooter`, `TOTAL_STEPS`, `FieldLabel`, `Toggle`, `fieldInput` (all from `@/components/ui`).
- **Overlays:** `Sheet` (used by Icon, Category, New‑category, In‑salon, Mobile sheets) with a `sticky bottom-0` footer button.
- **Inputs/atoms:** `Input`, `Textarea`, `Switch`/`Toggle`, `Chip`, `SegmentedControl`/`Segmented`, `Card`, `ListRow`, `EmptyState`.
- **Layout:** `AppFrame` (via `new/layout.tsx`), `AppTabBar` (app shell only — not in the wizard).
- **Data/helpers:** `serviceIcons` + `iconFor` (`@/lib/data/serviceIcons`), `defaultCategories` + `categorySwatches` + `tintFromHex` (`@/lib/tokens/categories`), `businessLocations` (`@/lib/data/locations`), `useTeamStore` members.

---

## 8. New components required (only if necessary)

**None required for the service flow** — every screen composes existing primitives, and the Basics/Locations sheets are already built screen‑local on top of `Sheet`. The persistence fix (§10) is store/data only.

> If a future deposit `Fixed/Percentage` toggle (§9) is desired, reuse `SegmentedControl` — still no new shared component.

---

## 9. Data model mapping

Legacy single `draft` (App.jsx) → new **`ServiceDraft`** (`src/lib/store/wizardStore.ts`) for in‑flight state, and **`DemoOffer`** (`src/lib/data/offers.ts`) for the persisted record.

| Legacy `draft` field | `ServiceDraft` (wizard) | `DemoOffer` (persisted) | Notes |
|---|---|---|---|
| `type` | `type` | `type` | ✅ |
| `name` | `name` | `name` | ✅ |
| `category` | `category` | `category` | ✅ |
| `description` | `description` | — | ➕ add optional `description?` to carry through |
| `iconKey:{name}` | `icon` (string key) | `icon?` | ✅ already threaded |
| `locations.{inSalon,mobile,remote}` | `locationModes{inSalon,mobile,remote}` + `locationIds[]` + `mobile:MobileSettings` | — | ➕ add optional `locationModes?`,`locationIds?`,`mobile?` |
| `staff[]` | `staffIds[]` | — | ➕ add optional `staffIds?` |
| `price` | `price` | `price` | ✅ |
| `durationMin` | `durationMin` | `durationMin?` (service) | ✅ |
| `depositEnabled/Type/Amount` | `depositEnabled`,`depositAmount` | — | ➕ add optional `deposit?{enabled,amount}`. 🔧 legacy `depositType` (fixed/percent) is **not** modelled in the new app — add only if product wants it |
| `status` | — (set at create) | `status:'draft'` | ✅ |
| `settings` (inherit nulls) | — | — | Out of core scope (lives in the dashboard Settings sub‑route; not part of creation) |

**`DemoOffer` additions (all optional, back‑compatible with the 23 seed offers and ~10 reader screens):**
```ts
description?: string;
deposit?: { enabled: boolean; amount: string };
locationModes?: { inSalon: boolean; mobile: boolean; remote: boolean };
locationIds?: string[];
mobile?: MobileSettings;
staffIds?: string[];
```

---

## 10. Draft state & persistence approach

- **In‑flight:** the wizard mutates a single `useWizardStore` draft via `updateDraft` / `updateMobile` (shallow/nested merge), seeded from `emptyDraft`. `/new/type` calls `resetDraft()` then `updateDraft({type})`.
- **Create (the fix):** `Price → "Create service"` calls `offerFromDraft(draft, offers)` → `addOffer(offer)` → `resetDraft()` → `router.push('/app/services/{id}?created=1')`. `addOffer` prepends to `useOffersStore.offers`, so the new service **appears in the Offerings list immediately** and opens its dashboard. **This already works** — the legacy "never persists" bug is not present in the new app.
- **Correctness gap to close:** `offerFromDraft` currently carries only `id/type/name/category/price/durationMin/status/icon`. Extend it to also carry `description`, `deposit`, `locationModes`, `locationIds`, `mobile`, `staffIds` (per §9) so the dashboard renders the **real** service instead of the hardcoded "In‑salon · Mobile / £20 / 24h" placeholders. Then point the dashboard summary card at `offer.*`.
- **SSR‑safe id:** the create id uses `Math.random()` inside the click handler (not at module top level), so it passes the gate today; prefer replacing it with a shared SSR‑safe counter helper (`src/lib/ids.ts`) to satisfy the spirit of the rule and remove the `Math.random` usage. Optional but recommended.
- **Persistence scope:** session‑local Zustand (no `localStorage`/backend), consistent with the rest of the app. Created offers reset on full reload — acceptable for the prototype; flag, don't "fix," unless `zustand/persist` is adopted app‑wide.

---

## 11. Validation rules

| Step | Rule (gates the footer Next/Create) |
|---|---|
| Basics | `Boolean(name.trim() && category)` |
| Locations | at least one of `locationModes.inSalon/mobile/remote` enabled |
| Staff | `staffIds.length > 0` |
| Price | `Boolean(price && durationMin > 0 && (!depositEnabled || depositAmount))` |
| New‑category sub‑sheet | name non‑empty (`"Add category"` button is `disabled` when blank); case‑insensitive duplicate **silently no-ops in the store** — no UI feedback |

Disabled state greys the footer button (existing `WizardFooter` `disabled` behaviour). No inline field errors beyond the disabled button (matches legacy).

---

## 12. Navigation rules

- **Entry:** Hub ▸ Offerings → `/app/services` → "New" → `/new` (intro) → `/new/type` → Service → `/new/basics`.
- **Wizard forward:** basics → `/new/locations` → `/new/staff` → `/new/price`.
- **Wizard back (ScreenHeader):** Steps 1 and 4 use **X‑close → `/app/hub`** (no back chevron in the header — confirmed: `basics/page.tsx:51` `onClose`, `price/page.tsx:37` `onClose`). Steps 2–3 use **back‑chevron → previous step** (`locations/page.tsx:46` `onBack`, `staff/page.tsx:44` `onBack`).
- **Wizard back (WizardFooter):** The footer provides a back button at **all four steps** including step 1, which goes back to the type selector (`/new/type`) — see `basics/page.tsx:119` `onBack`. Steps 2–4 footer back goes to the immediately preceding step.
- **Create:** Price → `/app/services/{id}?created=1`.
- **Dashboard:** back → previous (`router.back()`); Preview → `/app/services/{id}/preview`; Publish toggles `useOffersStore.setStatus`.
- Header right action across wizard steps: a static **"Help"** label (no help system).

---

## 13. Bottom sheet / modal requirements

All frame‑scoped `Sheet` (render inside `AppFrame`, never a body portal), with a `sticky bottom-0` footer button:

| Sheet | Host step | Behaviour |
|---|---|---|
| **Icons** | Basics | preview + search + category‑chip filter + grid; **commit on "Save"** (staged local pick) → `updateDraft({icon})` |
| **Category** | Basics | search + colour‑dot list; **live** select on tap → `updateDraft({category})`; "New category" opens sub‑sheet; "Done" closes |
| **New category** | Basics (from Category) | name + colour swatch; **commit on "Add category"** → `useCategoriesStore.addCategory` + select; duplicate guard is **silent and in the store** (`addCategory` does a case-insensitive name check and no-ops silently on a duplicate — the UI shows no error) |
| **In‑salon locations** | Locations | search + "All locations" + per‑salon checkboxes; **live** → `locationIds`; "Save settings" closes |
| **Mobile settings** | Locations | travel‑fee toggle, flat/per‑mile, fee, radius stepper, min‑notice stepper + Days/Hours; **live** → `mobile`; "Save settings" closes |

(Remote was a settings sheet in legacy; in the new app Remote is a toggle‑only mode card — no settings sheet needed unless platform capture is desired later.)

---

## 14. Loading, empty, error, and success states

- **Loading:** none — all state is synchronous in‑memory Zustand (no fetch/spinner). Don't introduce loading UI.
- **Empty:** Offerings list shows an inline empty state ("Nothing here yet" + "New offering"). In the wizard, the icon/category show muted placeholders; staff shows "No matches" (when search has no results) or "No eligible team members yet — invite instructors from the Team section." (when no bookable members exist). 🔧 The latter copy says "instructors" even for services (`staff/page.tsx:113`) — this is a parity fix: should read "team members" for the service flow.
- **Error:** no per‑screen error UI; rely on the app's normal rendering (every draft field has a default, so screens don't crash on empty state). Validation surfaces only as disabled footer buttons.
- **Success / completion:** **no separate success screen.** On create, land on `/app/services/{id}?created=1` which shows a one‑line **success banner** ("{name} created as a draft — publish it when you're ready."), the offer in **Draft** status, and a **Publish** footer. This is the completion state.

---

## 15. Accessibility requirements

- Every icon‑only control has an `aria-label` (back, close, more, add, sheet close, filter, stepper ±) — match the existing pattern in `services/page.tsx` and the dashboard.
- Toggles use `role="switch"` + `aria-checked` (existing `Switch`/`ToggleRow`); the filter button uses `aria-pressed`.
- Sheets: focusable close button labelled "Close"; backdrop click closes; trap not required (frame‑scoped) but the trigger should restore focus.
- Inputs paired with visible `FieldLabel`/`Label`; number inputs use `inputMode` (`decimal`/`numeric`).
- Selected list rows convey state non‑colour‑only (check glyph + fill), not colour alone.
- Targets ≥ 40px tall; maintain token contrast (navy on canvas/surface).

---

## 16. Responsive behaviour

- The app renders inside `AppFrame`: full‑height on mobile (`h-[100dvh] w-full`), fixed phone frame on `sm+` (`378×756`, rounded, shadowed). Design for the **~378px** frame width.
- Wizard content scrolls within `flex-1 overflow-y-auto`; the `WizardFooter` and sheet footers stay pinned.
- Horizontal chip/tab rows use `overflow-x-auto` (type tabs, category chips, icon‑category filter).
- No separate desktop layout — the frame is the canonical viewport; verify at 378px and at full‑height mobile.

---

## 17. Known legacy quirks to avoid

1. **Never‑persists bug:** legacy `create()` only set `status:'draft'` and navigated. The new flow **must** `offerFromDraft → addOffer` so the service is a real record in `useOffersStore` and shows in the Offerings list. *(Already satisfied — keep it.)*
2. **Hardcoded dashboard summary:** don't ship the placeholder "In‑salon · Mobile / £20 / 24h"; read real values from the persisted offer (§10).
3. **Dead buttons — intro page:** The `/new` intro page has a `"Watch a quick tutorial"` button with no `onClick` (`new/page.tsx:55`). Remove it or wire it — no dead controls. (The `"Don't see a location? Configure now"` link in InSalonSheet is **already wired** to `/app/setup` — no action needed there.)
4. **No inline hex / no hand‑rolled primitives:** use tokens + `@/components/ui`; data‑driven category colour via `style` + `tintFromHex` is the only exception.
5. **SSR‑safety:** keep `Math.random()`/`Date` out of module/render top level (prefer the shared id helper).
6. **Don't port the legacy draft architecture** (Outlet context, `emptyServiceSettings` inherit‑null model, `@phosphor-icons`, hash routing). Use Zustand + App Router + lucide.
7. **Don't reintroduce a separate success screen** — completion is the dashboard.

---

## 18. Acceptance criteria

- [ ] From `/app/hub` → Offerings → "New" → type selector → choosing **Service** lands on `/new/basics` with `draft.type==='service'`.
- [ ] All four steps render with correct content, "Step N of 4", and the legacy validation gates.
- [ ] Basics opens Icon, Category, and New‑category sheets; selections persist to the draft and render on the page.
- [ ] Locations toggles In‑salon/Mobile/Remote and opens In‑salon + Mobile settings sheets; "≥1 mode" gate works; summaries reflect chosen settings.
- [ ] Staff search + role filter work; ≥1 selection required to continue.
- [ ] Price requires price + duration > 0 (+ deposit amount when enabled); "Create service" creates the offer.
- [ ] **The created service is persisted** (`useOffersStore`), appears under the **Services** tab of `/app/services` with a **Draft** chip, and opens its dashboard with the `?created=1` success banner.
- [ ] The dashboard summary card shows the **real** price/duration, locations, staff, and deposit from the created offer (not placeholders).
- [ ] **Publish** flips status to "Active"/published and is reflected in the list; **Preview** opens the client preview.
- [ ] Staff empty state when no bookable members reads "No eligible team members yet — add staff from the Team section." (not "instructors").
- [ ] The intro page (`/new`) has no dead controls — "Watch a quick tutorial" is removed or wired.
- [ ] Quality gate green: `tsc --noEmit`, `next lint`, `npm run smoke` (incl. an `offerFromDraft` round‑trip assertion).
- [ ] Verified in the browser preview: full create → list → dashboard round‑trip.

---

## 19. Staged implementation plan

> Build order; each stage ends green on the quality gate. **Lane:** stages 1–2 & 4–6 are `src/app`/`src/lib` (Matt); no Austin‑lane changes are required unless a new shared primitive is introduced (none expected).

1. **Persistence/correctness seam (foundation).** Extend `DemoOffer` (optional `description`/`deposit`/`locationModes`/`locationIds`/`mobile`/`staffIds`); rewrite `offerFromDraft` to carry them through for services; add a shared SSR‑safe id helper and use it. Add a smoke assertion that `offerFromDraft` round‑trips these fields.
2. **Dashboard reads real data.** Replace the hardcoded summary ("In‑salon · Mobile" / "£20" / "24h") with values derived from `offer.*` (locations summary from `locationModes`/`locationIds`/`mobile`; deposit from `offer.deposit`; staff count from `offer.staffIds`). Keep the success banner + Preview/Publish.
3. **Entry parity check.** Confirm Hub Offerings → list → "New" → `/new/type` → Service → `/new/basics`; verify the type selector resets and seeds the draft. (Likely no code change.)
4. **Wizard parity pass.** Verify Basics/Locations/Staff/Price against the legacy trace (content, sheets, validation, navigation); adjust copy/fields only where they drift. Decide on optional deposit `Fixed/Percentage` (§9) — implement with `SegmentedControl` if wanted.
5. **States & a11y pass.** Confirm empty/validation/success states and the accessibility checklist (§15). Remove the dead "Watch a quick tutorial" button from `/new/page.tsx`. Fix staff empty-state copy (service path: "team members" not "instructors"). Remove any remaining dead controls (§17).
6. **Verification.** Run the quality gate, then a browser‑preview walkthrough (create → list shows the new Draft → dashboard shows real data → Publish flips status). Capture proof.

---

*This spec documents the target; implementation begins only on approval.*
