# Resources (Rooms & Equipment) — Finalisation Plan

> **Status:** Plan only — no implementation until the open questions below are resolved.
> **Scope:** The business-wide **Resources HUB catalogue** — a single screen under the business hub where the owner defines rooms and equipment (and the links between them) *once*, plus the add/edit sheet, location binding, and the room↔equipment relationship UI. The per-service Resources *module* (`/app/services/[id]/resources`) is already built (service plan Phase 7) and is **in scope only as the consumer** of this catalogue — this plan finalises the source it draws from.
> **Out of scope this pass:** scheduling/timing logic itself (reservation window, buffers, partial allocation) — that lives in the per-service sheet and is already approved; the catalogue only supplies *defaults*. Also out: utilisation dashboards, per-resource working hours, permission matrices (all V2), and any B2C/consumer touchpoint (resources are never client-facing).
> **Source of truth for feedback:** Granola sessions with Shabbir & Vishal — **"that time sign off" (15 Jun)**, **"That Time Product alignment" (2 Jun)**, **(26 May)** — plus the locked service-plan Phase 7. Resources/rooms/multi-location were flagged as a previously-identified gap, *especially for aesthetics/clinical clients*.
> **Design source → design in-app from feedback + research.** No finalised Resources-hub Figma; build from the meeting feedback, the Mobbin patterns mapped below, and the existing `@/components/ui` library, reviewed in the running app. (The per-service module already has Figma nodes `12216-39788 / -39894 / -39993 / -43961`; the hub is new.)

---

## What this section is

The **Resources catalogue** is the business-wide library of physical things a booking can consume — **rooms/spaces** (treatment room A, VIP suite, tanning studio) and **equipment** (laser machine, UV lamp, wash basin) — defined once and reused across every service. It sits in the **business hub** (`/app/hub`) alongside Offerings, Products, Forms, Team and Locations: the owner's back-office library shelf. The hub already lists a **"Resources — Rooms & equipment library"** tile (`src/app/app/hub/page.tsx`), but it routes nowhere — this plan gives it a home. The catalogue is the *single source of truth*; the per-service Resources module reads from it so that editing a room's name, location or links propagates everywhere it's used. Resources are owner/staff-only — they never appear to clients.

---

## Feedback → source map

| Area | Feedback | Source | Pattern ref |
|---|---|---|---|
| Gap identified | Resources / rooms / multiple-locations a known gap, *especially aesthetics & clinical* | 15 Jun, 2 Jun | [Mindbody Room & Resource Management](https://mobbin.com/screens/79356888-d3c6-425e-9b27-97433117cf72) |
| Both, not either/or | Add **rooms AND equipment** together — never make the owner pick one model | service plan Phase 7 (15 Jun sign-off) | [Fresha Resources (room + equipment reserved together)](https://mobbin.com/screens/d656849a-d41c-4e50-89c2-99bba047459b) |
| Room↔equipment links | Selecting a **room** shows its attached equipment, each toggleable on/off (you need the room, not necessarily its kit); selecting **equipment** that lives in a room auto-assigns that room | service plan Phase 7 | [Peerspace amenities — locked "required" vs toggleable list](https://mobbin.com/screens/47c8b383-71a7-4050-8c68-ec5741ec3492) |
| Time-bound allocation | A resource may only be needed for **part** of a service — partial-session allocation (already shown & approved) | 26 May | [Squarespace progressive-disclosure toggle reveals fields](https://mobbin.com/screens/80ee60ea-2034-4ef9-b1f7-7124f81d1c55) |
| Per-resource scheduling | Reservation window (how long it's needed), **buffer before/after** (heat-up / cool-down), staff notes | service plan Phase 7 | [Universe inventory sheet with inline rows](https://mobbin.com/screens/795e0c1b-ea3f-4df6-aaeb-8b447f048763) |
| Multi-location, first-class | Multi-site is critical for the clinical clients; a portable laser may travel between sites | 19 May (multi-location), 15 Jun | [Blank Street select-location picker](https://mobbin.com/screens/32c04cb4-f7d0-4f62-9d40-fb05f8e67408) |
| Capacity vs individual | "3 identical rooms" (pool) vs "Room A has the laser, Room B is VIP" (named, each capacity 1) — the single biggest catalogue decision | research (Mangomint) | [Squarespace item — Track quantity + Available stepper](https://mobbin.com/screens/5f598677-569b-468a-8af2-9f92f9579187) |
| Catalogue list shape | Scannable icon rows, per-row edit, reorder | research (Waterllama, Fresha) | [Waterllama add/edit list with per-row toggles + reorder](https://mobbin.com/screens/42a2aaf3-ba23-4ec0-8f3f-5c6833518a23) |
| "Needs, like a team member" | Frame a resource as "something a service also needs" — most intuitive SMB mental model | research (Booksy, Square Go) | [Square Go salon profile — per-service rows](https://mobbin.com/screens/b302dc27-ed66-4442-a59e-1e4dc73799b1) |
| Add altitude | "Name + location + done" — a non-technical owner adds "UV lamp" in 5 seconds, photo never required | research (Square, Squarespace) | [eBay add-item with recommended fields + helper copy](https://mobbin.com/screens/8c9d6f13-f1e6-4228-93bb-53760765e644) |
| Optional priced add-ons (V2) | Equipment as a priced extra (projector / chairs) | research (Peerspace) | [Peerspace add-ons list — priced equipment items](https://mobbin.com/screens/35a88c8d-2bf1-4958-95b3-68fd0dffb299) |

---

## Current state

**Status legend:** ✅ done · 🟡 partial · ❌ missing.

- 🟡 **Catalogue data model** — `Resource` exists in `src/lib/data/modules.ts` (`{ id; type: "space" | "equipment"; name; capacity?; location?; roomId? }`) with 10 seed rows (4 rooms, 6 equipment) and the `equipmentInRoom(roomId)` helper. The room↔equipment links the feedback asks for **already exist** (`eq4`/`eq6` → `sp4` tanning studio, `eq5` laser → `sp1`). **Gaps:** `location` is a **free-text string** ("Salon Soho", "Salon Soho, Salon Brixton", "All locations") — not bound to the real `businessLocations` list (`src/lib/data/locations.ts`: loc1 Soho / loc2 Brixton / loc3 Chelsea), so it drifts; there is **no icon/emoji, no catalogue-level default buffers, no default staff note** field; and the data is a static `export const`, not store-backed (so the owner can't add/edit a resource — only consume the seeds).

- ✅ **Per-service module** — `src/app/app/services/[id]/resources/page.tsx` is fully built (service plan Phase 7). It reads `resourcesCatalog`, lets the owner pick rooms (equipment auto-included, untickable via `attachRoom`/`detachRoom`) or equipment (parent room auto-attached via `toggleEquip`), and opens a **CustomiseSheet** per attached resource for reservation window (`"whole" | "partial"`), buffer before/after, and a staff note. Bundles even inherit resources (`inheritedResources`). This is the *consumer*; it works against today's read-only catalogue.

- ✅ **Per-service data model** — `OfferResource` in `src/lib/data/offers.ts` (`{ id; auto; reservation: "whole" | "partial"; bufferBefore; bufferAfter; note }`), persisted on `offer.resources?` via `useOffersStore.updateOffer`. **Gap:** `reservation: "partial"` has **no time bounds** (no from/to minutes) — the 26 May "part of a service" approval isn't fully modelled yet.

- ❌ **The HUB catalogue screen** — there is **no** `/app/hub/resources` route, no resources store, and no add/edit/delete UI. The hub tile (`src/app/app/hub/page.tsx`, `key: "resources"`, `icon: Box`, "Rooms & equipment library") has **no `href`** — it renders as a dead `<button>`. The 19 May setup guide lists a locked "Resources — Stop double-booking rooms, chairs, stations, and specialist kit" step (`src/lib/data/setupGuide.ts`) but nothing is wired behind it. **This is the entire job of this plan.**

---

## Recommended UX calls

Opinionated decisions, made to *reduce owner cognitive load* — the simplest flow that satisfies the feedback.

1. **Placement → the existing hub tile, route `/app/hub/resources`.** [ASSUMPTION] Best-in-class apps bury this in Settings → Scheduling (Fresha/Square), but That Time already surfaces "Resources" as a first-class hub tile next to Offerings and Products — keep it there (it's findable) and *also* deep-link to it from the per-service module's "manage catalogue" link. Wire the dead tile's `href`.

2. **Capacity vs individual = a one-line choice at room creation, in plain English.** The Mangomint decision is the single most important catalogue call, so make it explicit, not hidden: a capacity stepper defaulting to **1** with helper copy *"Set 1 for a unique room. Set 2+ if you have identical, interchangeable rooms any client can use."* The `Resource.capacity` field already exists. Default to individual (1); push capacity-N only for genuinely interchangeable rooms so the calendar stays clean.

3. **Location binding is bound to real locations, three modes.** Replace the free-text `location` string with a structured field: **This location only** (single, default to the owner's primary) · **Available at multiple locations** (multi-select chips) · **All locations**. Bind to `businessLocations` ids, never typed text — this kills the "Salon Soho" vs "Soho" drift and makes multi-location first-class for the clinical clients (the Square "one resource = one location" rule is explicitly rejected for the portable laser case).

4. **Type-first creation fork.** Tap **+ Add resource** → two big cards, **Room / space** vs **Equipment**. The fork drives which fields show next so each path stays minimal (a room gets capacity; equipment gets "lives in a room?"). Mirrors the existing per-service `TypeChoice` component.

5. **Links are edited in the catalogue, bidirectionally; timing is not.** A room's sheet has an *"Equipment in this room"* list (toggle rows + inline "+ add"); an equipment item's sheet has a single *"Lives in"* room selector. Setting it from either side keeps `roomId` in sync — exactly as `equipmentInRoom()` already resolves it. The catalogue defines *what links to what*; the per-service sheet decides *which links are on* and *the timing*. [ASSUMPTION] No scheduling fields on the link itself.

6. **Catalogue-level default buffers + note that pre-fill the per-service sheet.** Add optional `defaultBufferBefore` / `defaultBufferAfter` / `defaultNote` to `Resource`, shown in a collapsed "Defaults" section. Rationale: turnover/heat-up time is a property of the *kit* ("the laser always needs 10 min cool-down"), so the owner sets it once and every service that uses the laser inherits it — overridable per service. This is the catalogue's only timing role.

7. **Progressive disclosure throughout.** Name + type + location by default; capacity, links, buffers, icon all hidden until relevant. A basic room must be addable in seconds (Square altitude). Photo is **never** required (anti-pattern).

8. **Make the catalogue store-backed (new `resourcesStore`).** The seeds become editable state so the owner can add/rename/delete, matching `offersStore`/`teamStore`. [ASSUMPTION] Session-local Zustand, additive seed shape — consistent with the rest of the mid-fi prototype.

9. **In-use guard on delete.** Deleting a resource that's attached to services warns *"Used by 4 services — they'll stop requiring it"* rather than silently breaking offers. [ASSUMPTION]

---

## Phase 1 — Stand up the hub catalogue (landing + store)

**Goal:** Turn the dead hub tile into a live, store-backed Resources catalogue landing screen — two always-present sections (Rooms **and** Equipment), scannable icon rows, an empty state, and the "+ Add resource" entry. No either/or.

**Flow:**
1. From `/app/hub`, tap the **Resources** tile → routes to `/app/hub/resources`.
2. **Empty state** (first run): a `Box` icon, one-sentence explanation *"Define the rooms and equipment your bookings use, once — then attach them to any service."*, two example chips (*"e.g. Treatment room"*, *"e.g. Laser machine"*), and a primary **+ Add resource**.
3. **Populated:** segmented control at top — **All · Rooms · Equipment** (All groups Rooms then Equipment). Each row is an icon row: `DoorOpen` for rooms / `Wrench` for equipment, name, and a one-line subtitle — *"Capacity 2 · Salon Soho"* or *"Lives in: Treatment room A"* (reuse the exact meta strings from the per-service module).
4. Sticky **+ Add resource** button (Phase 2 sheet).
5. Tapping a row opens its detail/edit sheet (Phase 2).
6. A search box appears once the list passes ~8 items (the seed list is 10, so it ships on).

**Changes:**
- `src/app/app/hub/page.tsx` — add `href: "/app/hub/resources"` to the `resources` tile (line ~32) so it routes instead of being a dead button.
- **New** `src/app/app/hub/resources/page.tsx` — the landing screen, composed from `@/components/ui` (Header/Row/Card/Segmented/Search + the empty-state pattern). Reuse the `DoorOpen`/`Wrench` row treatment already in the per-service module.
- **New** `src/lib/store/resourcesStore.ts` — `useResourcesStore` seeded from `resourcesCatalog`, with `addResource`/`updateResource`/`removeResource`. Mirror `offersStore`.
- `src/lib/data/setupGuide.ts` — unlock/link the "Resources" step to `/app/hub/resources`.

**Data:** no field changes yet; just moves `resourcesCatalog` seeds behind a store.

**Risk:** low–medium. Net-new screen + store, but the row/empty-state patterns and the `Resource` model already exist. Add a smoke needle for the empty state and the populated list.

---

## Phase 2 — Add / edit a resource (the core sheet)

**Goal:** The type-first creation/edit sheet, minimal by default, that an owner can complete in seconds — and that produces the location binding + capacity + (optional) defaults.

**Flow:**
1. **+ Add resource** → **type fork**: two cards, *"Room / space"* vs *"Equipment"* (reuse the per-service `TypeChoice`).
2. **Name** (required, autofocus) + optional **icon/emoji** picker for scannability (collapsed).
3. **Room path:** capacity stepper, default 1, helper *"Set 1 for a unique room. Set 2+ if you have identical, interchangeable rooms any client can use."*
4. **Equipment path:** optional **"Lives in a room?"** selector — picking a room writes `roomId` so this equipment auto-assigns that room (and the room shows this equipment).
5. **Location binding (both paths):** segmented **This location only** (single picker, default primary) · **Available at multiple locations** (multi-select chips) · **All locations**. Bound to `businessLocations`.
6. **Defaults (collapsed, optional):** default buffer **before** / **after** (heat-up / cool-down) + a default **staff note** — copy explains *"These pre-fill the timing whenever a service uses this resource. Set turnover time once."*
7. **Save** → returns to the hub with the new/updated row; toast *"Added. Assign it to services from any service's Resources tab."*
8. **Edit** = same sheet pre-filled; **Delete** = confirm with the in-use guard (*"Used by N services — they'll stop requiring it"*).

**Changes:**
- **New** `src/app/app/hub/resources/[id]/page.tsx` *or* an in-screen `ResourceSheet` component (prefer a `Sheet` opened from the landing screen, matching the per-service `CustomiseSheet` pattern).
- `resourcesStore` — wire add/update/remove + the in-use lookup (count offers whose `offer.resources` reference this id, via `offersStore`).

**Data:** see Cross-cutting — `Resource` gains structured `locationIds`/`locationScope`, `icon?`, `defaultBufferBefore?`/`defaultBufferAfter?`/`defaultNote?`; `location` (free-text) becomes derived/back-compat.

**Risk:** medium. The location-binding migration (string → structured) is the load-bearing change; keep `location` as a computed display string so the per-service module's existing `{r.location}` reads keep working untouched.

---

## Phase 3 — Room ↔ equipment linking in the catalogue

**Goal:** Make the room↔equipment relationship visible and editable *in the catalogue* (the feedback's central ask), bidirectionally, with explainer copy about the downstream behaviour — so owners understand auto-include before they meet it on the calendar.

**Flow:**
1. In a **Room** sheet, an **"Equipment in this room"** section lists linked equipment as toggle/checkbox rows + an inline **"+ Add equipment to this room"** (creates a new equipment item pre-linked, or links an existing one). Borrow Peerspace's locked-"required" vs toggleable visual: the *room* is the mandatory anchor, its equipment the toggleable list.
2. In an **Equipment** sheet, a single **"Lives in"** room selector (one parent). Setting it from either side keeps `roomId` in sync.
3. **Explainer copy** under the section: *"When a service needs this room, its equipment is auto-included and each piece can be switched off. When a service needs this equipment, this room is reserved automatically."*
4. **No scheduling here** — the catalogue defines what links to what; timing stays per-service.

**Changes:**
- Extend the Phase 2 `ResourceSheet` with the link sections (room side: list + inline add; equipment side: single selector).
- `resourcesStore` — `linkEquipmentToRoom(eqId, roomId | null)` keeping `roomId` consistent; reuse `equipmentInRoom()`.

**Data:** none beyond the existing `roomId` (links already model correctly); only the editing UI is new.

**Risk:** low–medium. The relationship resolution already works (`equipmentInRoom`, `toggleEquip`); this is the create/edit surface for it.

---

## Phase 4 — Time-bound partial allocation (catalogue defaults → per-service)

**Goal:** Finish the 26 May "needed for *part* of a service" approval by giving `partial` real time bounds, and let the catalogue's default buffers pre-fill the per-service sheet so the timing is set once.

**Flow (per-service, fed by the catalogue):**
1. Owner attaches a resource (existing flow). The per-service **CustomiseSheet** opens pre-filled from the catalogue defaults (`defaultBufferBefore`/`After`/`Note`).
2. **Reservation window:** **Whole session** vs **Part — from X to Y minutes** (e.g. the laser is only needed minutes 20–40 of a 60-min treatment). The `partial` segment reveals two minute inputs (progressive disclosure).
3. Buffer before/after + staff note — overridable on top of the catalogue defaults.
4. Catalogue stays the single source of truth: renaming/relocating/relinking in the hub propagates to every service that uses the resource.

**Changes:**
- `src/lib/data/offers.ts` — extend `OfferResource` with `partFromMin?` / `partToMin?` (used only when `reservation === "partial"`).
- `src/app/app/services/[id]/resources/page.tsx` — in `CustomiseSheet`, reveal from/to minute inputs when `partial`; pre-fill buffers/note from the catalogue resource's defaults on first attach (in `mk(...)`).

**Risk:** medium. Touches the already-shipped per-service module — keep changes additive (`partial` already exists; from/to are new optional fields) so the seed offers keep rendering.

---

## V2 / deferred

Parked but covered — clearly later, not now.

- **Utilisation reporting** — Mindbody-style "this room is 80% booked" dashboards. *Direction:* a read-only utilisation card per resource once analytics lands; reuse the Analytics section's chart components. Overkill for an SMB owner in v1.
- **Per-resource working hours / availability** — a room only open Tue–Sat, equipment out for service. *Direction:* an optional availability sheet on the resource (reuse the team schedule editor), feeding the booking engine. Defer; most kit is "always available".
- **Priced equipment add-ons (B2C-adjacent)** — Peerspace's projector/chairs-as-paid-extras. *Direction:* an optional `price?` on equipment that surfaces as a bookable add-on; intersects the per-service products/preferences work — sequence after that.
- **Permissions matrix** — who can edit the catalogue. *Direction:* gate behind a `manageResources` flag on `StaffPermissions` once the team-section roles depth (team plan Phase 2a) ships.
- **Reorder / grouping ("Resource Types")** — Fresha-style type folders ("Massage couches" holding couch 1/2). *Direction:* a drag-reorder + optional group label on `Resource` (Waterllama "Change order" pattern). Capacity-N already covers the interchangeable case, so groups are a nicety, not a need.
- **Resource photos** — optional thumbnail per resource. *Direction:* an optional `image?`, never required to create.
- **Maintenance / out-of-order state** — mark a resource unavailable for a date range. *Direction:* a simple status + date window; ties into coverage. Later.

---

## Suggested order & rationale

`1 (hub landing + store) → 2 (add/edit sheet) → 3 (linking UI) → 4 (time-bound partial + default pre-fill)`

Phase 1 first because nothing else has a home until the dead tile routes somewhere and the seeds are store-backed — it's the backbone. Phase 2 makes it real (the owner can finally create resources, with location binding + capacity — the two highest-value calls). Phase 3 layers the relationship editing onto the same sheet. Phase 4 last because it touches the already-shipped per-service module and is the only phase that depends on a meeting-approved behaviour rather than net-new scaffolding — doing it last keeps the working module stable longest.

Every phase ends green on `npx tsc --noEmit && npx next lint && npm run smoke`, with a smoke needle for each new empty/setup state (the hub empty state, the add sheet). Persistence stays session-local Zustand; all new fields are additive so the 10 seed resources and the seeded offers keep rendering.

---

## Cross-cutting data-model changes

`Resource` (in `src/lib/data/modules.ts`) gains:
- `locationScope?: "single" | "multi" | "all"` and `locationIds?: string[]` (bound to `businessLocations`) — **replacing reliance on** the free-text `location` string, which becomes a derived display value for back-compat (Phase 2).
- `icon?: string` — optional emoji/icon for scannable rows (Phase 2).
- `defaultBufferBefore?: number` / `defaultBufferAfter?: number` / `defaultNote?: string` — catalogue-level turnover defaults that pre-fill the per-service sheet (Phase 2 / consumed Phase 4).
- (`roomId?`, `capacity?`, `type`, `name` already exist and are unchanged.)

`OfferResource` (in `src/lib/data/offers.ts`) gains:
- `partFromMin?: number` / `partToMin?: number` — time bounds for the existing `reservation: "partial"` (Phase 4).

**New store** `src/lib/store/resourcesStore.ts` (`useResourcesStore`) — `addResource` / `updateResource` / `removeResource` / `linkEquipmentToRoom`, seeded from `resourcesCatalog`.

All optional / back-compatible. The 10 seed resources, the per-service module, and the seeded offers' `resources` keep rendering. Persistence stays session-local Zustand.

---

## Open questions for the user

1. **Hub vs Settings placement.** Keep Resources as a top-level hub tile (`/app/hub/resources`, my recommendation — it's already there), or follow Fresha/Square and tuck it under a Settings → Scheduling area? (I assumed hub tile.)
2. **Primary location.** Location binding defaults to "the owner's primary location" — but `businessLocations` has no `isPrimary` flag today. Should we add one, or default to "All locations", or to the first location (loc1 Soho)?
3. **Capacity-N on the calendar.** For an interchangeable pool (capacity 2 tanning studio), do you want the system to auto-assign the first free unit (Vagaro/Mangomint behaviour), and is that within the prototype's scope or a note-for-later? (Affects how literally Phase 1 must model capacity vs just display it.)
4. **In-use delete behaviour.** When deleting a resource used by services, warn-and-proceed (services silently stop requiring it) or block the delete until it's detached everywhere? (I assumed warn-and-proceed.)
5. **Default buffer ownership.** If a service overrides a catalogue default buffer and the owner later changes the catalogue default, should the override stick (my assumption) or re-sync to the new default?
6. **Equipment add-ons / pricing.** Is priced equipment (Peerspace add-ons) ever in scope, or are resources purely operational (never a line item on the client's bill)? Confirms whether the V2 `price?` is real or dead.
