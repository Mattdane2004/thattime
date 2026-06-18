# Service Creation & Management — Finalisation Plan

> **Status:** Plan only — no implementation until questions below are resolved.
> **Scope:** The **service** offer type only (creation wizard + the `/app/services/[id]` management/dashboard surface). Classes/bundles/subscriptions are out of scope for this pass.
> **Figma file:** `6HHqcoM9m33N8Kz4R5E4tO` (ThatTime — Internal). All links below use
> `https://www.figma.com/design/6HHqcoM9m33N8Kz4R5E4tO/ThatTime---Internal?node-id=<NODE>&m=dev`.
> **Figma MCP note:** the desktop app's active tab must be on this file/page for agents to fetch a node. Several frames failed to load last session because the tab had moved — before building each phase, open the file and confirm `get_design_context` resolves the listed nodes.
> **Builds on:** `service-flow-figma-tidy.md` (memory) — last session delivered the splash, input contrast, sheet-clipping, mobile radius/fee split, remote settings, per-location staff (wizard), duration fix, and first-pass advanced-module empty states. This plan upgrades those to the full Figma-specified behaviour.

---

## Feedback → Figma map (reference index)

| Area | Feedback | Figma node(s) |
|---|---|---|
| Catalogue | Rename "Offerings" → "Services" | — (copy change) |
| Mobile location | Map view with radius from base address; radius grows with the slider | `12216-39677` |
| Who offers it | Per-location staff assignment when multiple locations selected | `12216-39599` |
| Booking-details (dashboard) | Price/duration, deposit, cancellation cards editable via bottom sheets | `12216-36386` (price & duration), `12216-36813` (deposit), `12216-36596` (cancellation), `12216-39677` (location), `12216-39599` (staff) |
| Variants — Duration | Price + duration, optional name, several variants, optional staff/days | `12216-37394` |
| Variants — Staff | Pick a staff member → bottom sheet to edit their pricing | `12216-37117`, `12216-40696` |
| Variants — Location | Pick a location → bottom sheet to edit pricing | `12216-37191`, `12216-40829` |
| Variants — Time & day | Days + specific times + price adjustment | `12216-37476` |
| Variants — list | Search + filter pills | `12216-40259` |
| Product preferences | Question + single/multi-select + products/groups + price-override sheet | `12216-40492`, `12216-40386`, `12216-40545` |
| Product preferences — list | List shows preference groups you click into to edit | `12216-40342` |
| Related / upsells | Group services, name the group, optional discount or plain upsell; multiple groups | `12216-37590`, `12216-37670`, `12216-37753`, `12216-37818` |
| Resources | Add rooms AND equipment together; room↔equipment links with toggle; edit reservation window + buffers + notes sheet | `12216-39788`, `12216-39894`, `12216-39993`, `12216-43961` |
| Forms | "Required" toggle on selected forms | `12216-40138` |
| Notifications | Assign a notification preset (built in Marketing) | `12216-41152` |
| Settings | Expanded settings + bottom-sheet pickers (7) | `12216-38584` (base), `12216-38864`, `12216-38030`, `12216-38210`, `12216-38390`, `12216-38907`, `12216-39114`, `12216-39291` |

---

## ✅ Decisions (locked 2026-06-16)

1. **Mobile map** → **Stylized mock map** (SVG/CSS radius ring scaling with the slider; no map dependency, no API key).
2. **Notifications presets** → **Placeholder presets now** (seed a few sample presets + a "Manage in Marketing" link; wire to real Marketing presets later).
3. **Catalogue title** → **Rename H1 to "Services", keep the type tabs.**
4. **Per-location staff** → **Also editable from the dashboard** "Edit staff" sheet (`12216-39599`), reusing the wizard's per-location logic.

(All **[ASSUMED]** notes in the phases below are now confirmed by the matching decision.)

---

## Phase 1 — Naming + entry polish (small, fast)

**Goal:** Rename the catalogue to "Services"; confirm wizard parity.
**Changes:**
- `src/app/app/services/page.tsx` — H1 "Offerings" → "Services". **[ASSUMED]** keep the type tabs (pending Q3).
- Verify the wizard per-location-staff (already shipped) still passes; no change expected.
**Figma:** — (copy) · `12216-39599` (staff reference).
**Data:** none.
**Risk:** low. The list shows all four types; if it becomes "Services" the tabs may read oddly — Q3.

---

## Phase 2 — Dashboard summary card → editable via bottom sheets

**Goal:** On `/app/services/[id]`, the summary rows become tappable, each opening a frame-scoped bottom sheet that edits the offer via `updateOffer`. This makes the dashboard the real management surface (today the rows are read-only).
**Sheets (one per row):**
- **Price & duration** — `12216-36386`
- **Deposit** — `12216-36813`
- **Cancellation policy** — `12216-36596`
- **Locations** (in-salon/mobile/remote, reusing the wizard sheets) — `12216-39677`
- **Staff** (incl. per-location when multiple) — `12216-39599` · **[ASSUMED]** yes per Q4
**Changes:**
- `src/app/app/services/[id]/page.tsx` — wire each `SummaryRow` to open a sheet; reuse `Sheet` + `footer`.
- New screen-local sheet components (price/duration, deposit, cancellation) OR reuse the wizard sheet bodies (locations/mobile/remote/staff) — factor the wizard sheet bodies into shared components so the wizard and dashboard share one implementation.
**Data:** edits write to `offer.{price,durationMin,deposit,locationModes,locationIds,mobile,remote,staffIds,staffByLocation}` via `updateOffer`. Add a `cancellation` field to `DemoOffer` (currently the dashboard shows "—").
**Risk:** medium — touches the dashboard + factoring wizard sheets for reuse.

---

## Phase 3 — Mobile location map view

**Goal:** In the Mobile settings sheet, show a map centred on the base address with a radius ring; dragging the radius slider grows the ring. **[ASSUMED]** stylized mock map (pending Q1).
**Changes:**
- `src/app/new/locations/page.tsx` `MobileSheet` (and the dashboard location sheet from Phase 2) — add a map panel above the radius slider; the ring scales with `radiusMiles`.
- New `MapRadius` component (SVG/CSS mock, or a real map provider if Q1 says so).
**Figma:** `12216-39677`.
**Data:** base address from `businessLocations` / business settings; no new persisted field unless real geocoding is added.
**Risk:** depends entirely on Q1 (mock = low; real map = new dependency + API key + cost).

---

## Phase 4 — Variants: full per-type flows + search/filter

**Goal:** Replace the first-pass variant configure form with the four real type flows from Figma, plus list search/filter.
**Per type:**
- **Duration** (`12216-37394`) — set price + duration, optional name, **create several**; optionally restrict to certain staff and certain days.
- **Staff** (`12216-37117` list, `12216-40696` edit sheet) — show staff list; tapping a member opens a price-edit bottom sheet for that service.
- **Location** (`12216-37191` list, `12216-40829` edit sheet) — show locations; tap → price-edit bottom sheet.
- **Time & day** (`12216-37476`) — pick days + specific time window + price adjustment.
- **List** (`12216-40259`) — search box + filter pills (All / Duration / Staff / Time & day / Location).
**Changes:**
- `src/app/app/services/[id]/variants/page.tsx` — extend the view machine; per-type configure screens + the two pricing sheets.
- Extend `OfferVariant` (`offers.ts`): add `staffIds?`, `days?`, `timeWindow?`, and per-entity pricing maps for staff/location variants.
**Risk:** medium-high — the largest module; staff/location variants need per-entity price sheets.

---

## Phase 5 — Product preferences (question builder)

**Goal:** Products becomes a **preference group** builder, not a product tick-list.
**Flow:** set a question (e.g. "Which oil would you like?") → single- or multi-select → choose products or product groups → optionally override a product's price via a bottom sheet → save as a named preference. List shows preference groups you can click into and edit.
**Figma:** `12216-40492` (setup), `12216-40386` (pick list), `12216-40545` (filled), `12216-40342` (list).
**Changes:**
- `src/app/app/services/[id]/products/page.tsx` — view machine: list/empty → build (question + select mode + products + price overrides) → list.
- Replace `offer.productIds` with `offer.productPrefs?: { id; question; selectMode: "single"|"multi"; productIds; priceOverrides?: Record<id,string> }[]`.
**Risk:** medium — new data shape + price-override sheet.

---

## Phase 6 — Related services / upsells (group builder)

**Goal:** Related becomes an **upsell group** builder.
**Flow:** select a range of services → name the group (e.g. "Beard maintenance") → optionally add a discount for adding another service from the group, or leave as a plain upsell (no discount) → optional audience → save. Multiple groups live in the list.
**Figma:** `12216-37590` (name & services), `12216-37670` (discount), `12216-37753` (audience), `12216-37818` (saved/add-another).
**Changes:**
- `src/app/app/services/[id]/related/page.tsx` — multi-step group builder + list.
- Replace `offer.relatedIds` with `offer.upsellGroups?: { id; name; serviceIds; discountPercent?; audience? }[]`.
**Risk:** medium — multi-step wizard + new data shape.

---

## Phase 7 — Resources (rooms + equipment + edit-times sheet)

**Goal:** Assign rooms AND equipment together with room↔equipment relationships, plus per-resource scheduling settings.
**Behaviour:**
- Add both types in one session (not either/or).
- Selecting a **room** shows its attached equipment; each can be toggled on/off (need the room, not necessarily its equipment).
- Selecting **equipment** that lives in a room auto-assigns that room by default.
- Tapping a selected resource opens a bottom sheet to edit: reservation window (how long it's needed), buffer before/after (heat-up/cool-down), and staff notes.
**Figma:** `12216-39788` (assign room), `12216-39894` (assign equipment), `12216-39993` (list), `12216-43961` (edit-times sheet).
**Changes:**
- `src/app/app/services/[id]/resources/page.tsx` — combined add flow + relationships + edit sheet.
- Extend `resourcesCatalog` data to model room→equipment links (**needs data** — see note).
- Replace `offer.resourceIds` with `offer.resources?: { id; reservationMins?; bufferBefore?; bufferAfter?; notes? }[]`.
**Risk:** medium-high — needs room↔equipment data that may not exist yet.

---

## Phase 8 — Forms required toggle + Notifications presets

**Goal:**
- **Forms** (`12216-40138`) — add a "Required" toggle per selected form. Extend `offer.formIds` → `offer.forms?: { id; required: boolean }[]`.
- **Notifications** (`12216-41152`) — assign a notification **preset** (built in Marketing). **[ASSUMED]** build placeholder presets + a "manage in Marketing" link now (pending Q2).
**Changes:**
- `forms/page.tsx` — Required toggle on the assigned list.
- `notifications/page.tsx` — preset picker instead of per-reminder toggles; seed a few placeholder presets.
**Risk:** forms = low; notifications = depends on Q2.

---

## Phase 9 — Settings expansion + bottom-sheet pickers

**Goal:** Expand the settings screen and make the rules editable via bottom sheets (7 pickers).
**Pickers:** who can book (`12216-38864`), lead time (`12216-38030`), max advance booking (`12216-38210`), buffer time (`12216-38390`), cancellation policy (`12216-38907`), reschedule limit (`12216-39114`), payment policy (`12216-39291`); base screen `12216-38584`.
**Changes:**
- `src/app/app/services/[id]/settings/page.tsx` — restructure to the Figma sections; each editable rule opens a `Sheet` picker; persist to `offer.settings?: {...}` via `updateOffer` (currently local state only).
**Risk:** medium — 7 sheets + persistence, but each picker is simple and repetitive.

---

## Suggested order & rationale

`1 (naming) → 2 (dashboard editable) → 3 (map) → 4 (variants) → 5 (products) → 6 (upsells) → 7 (resources) → 8 (forms+notifs) → 9 (settings)`

Phase 2 first (after the trivial rename) because making the dashboard summary editable is the backbone of "service management" and several later phases (locations/staff/variants/settings) hang their sheets off it. Phases 4–9 are independent module rebuilds and can be reordered by priority.

Every phase ends green on `npx tsc --noEmit && npx next lint && npm run smoke`, and each module change carries a smoke needle for its new empty/setup state. Persistence stays session-local Zustand via `updateOffer`, consistent with the rest of the app.

---

## Cross-cutting data-model changes (summary)

`DemoOffer` (and the wizard draft where relevant) will gain:
- `cancellation?` (Phase 2)
- richer `OfferVariant` (staff/days/time/per-entity pricing) (Phase 4)
- `productPrefs?` replacing `productIds` (Phase 5)
- `upsellGroups?` replacing `relatedIds` (Phase 6)
- `resources?` replacing `resourceIds`, + room↔equipment catalogue data (Phase 7)
- `forms?` replacing `formIds` (+required), `notificationPresetId?` (Phase 8)
- `settings?` (Phase 9)

All optional/back-compatible; the 23 seed offers keep rendering.

*Implementation begins once the four open questions are answered.*
