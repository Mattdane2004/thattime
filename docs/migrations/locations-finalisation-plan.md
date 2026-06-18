# Locations — Finalisation Plan

> **Status:** Plan only — no implementation until the open questions below are resolved.
> **Scope:** The **Locations** management section of the B2B business app — a new Locations hub (list + add/edit a location), per-location opening hours, the area-only **privacy** model for home-based businesses, **Mobile/outcall** as a first-class location type, per-location staff & service allocation, the per-location **pricing/duration variant**, and the Home **location switcher** (already stubbed). It also notes the matching **B2C** touchpoints (the customer "Where" booking step and the area-privacy reveal) but builds those only where flagged.
> **Out of scope this pass:** real geocoding / a live map provider (we use a stylised mock map, consistent with the services mobile-radius decision); a rigid HQ→branch hierarchy (the client explicitly wants flat + permission-gated — see anti-patterns); plan/subscription gating of the location count (referenced as a count line only, not billing logic); the consumer marketplace/discovery surface.
> **Source of truth for feedback:** the Granola sessions with Shabbir & Vishal — **"That Time Product alignment" (19 May, id `fa5d01f4`)** and **(2 Jun, id `8a71b7ce`)** for the substance, plus **"that time sign off" (15 Jun, id `d72564d7`)** for the walkthrough confirmation and **"TT planning" (16 Jun, id `63cc3d9e`)** for prioritisation. The 19 May session is where multi-location, the home-based privacy requirement and location variants were raised; 2 Jun added Mobile/outcall and day-specific mobile.
> **Design source → design in-app from research patterns.** There is no finalised Locations Figma; this plan builds from the meeting feedback and the best-in-class patterns (Mobbin) cited in every flow below, against the existing `@/components/ui` library, reviewed in the running app — same convention as `team-finalisation-plan.md`.

---

## What this section is

Locations is the business-hub section that answers **"where does this business operate, and what does each place offer?"** It is the flat, permission-gated list of every place the business works from — a fixed salon, the owner's home studio, a mobile/outcall service, or a remote/video offering — each owning its own address (or display area), opening hours, assigned staff and allocated services. It sits in the Hub menu under "Operations" (the menu item already exists, see Current state), feeds the Home **location switcher** that re-scopes the dashboard, and is the source the booking flow reads to ask the customer **where**. It deliberately reuses the offer model's existing `locationModes` / `locationIds` / `staffByLocation` rather than inventing a parallel model.

---

## Feedback → source map

| Area | Feedback | Source | Pattern ref (Mobbin) |
|---|---|---|---|
| Multi-location | Support several locations for larger businesses; **flexibility via permissions, not a rigid hierarchy** | 19 May, 2 Jun | [Square Appointments — assign per location](https://mobbin.com/screens/79c5529f-725e-4785-b2e0-33daa2cfc697) · [Shopify hub](https://mobbin.com/screens/6e2fd9b4-f654-48d1-bb8f-de10bc06bbc4) |
| Privacy (home-based) | **Hide the exact address until a booking is confirmed**; show a display **AREA** ("Greenwich") publicly. Critical for home-based businesses | 19 May | [Peerspace — "Address shown after booking" + blurred radius](https://mobbin.com/screens/34071c43-61b8-4215-9fbc-f8cbb4592886) · [Airbnb "Getting there"](https://mobbin.com/screens/c3ee8cb2-ea68-4528-9ee2-484673b7b93b) |
| Privacy — released address | Exact address released into the **confirmed booking / confirmation**, not the public profile | 19 May (progressive-disclosure) | [Shopify — address "Used on customer order confirmations"](https://mobbin.com/screens/3fded580-9c68-42fe-a738-57da33e757bd) |
| Privacy — toggle clarity | Owner must instantly understand what clients see when privacy is on | 19 May | [Uber Eats — "What delivery people see about you"](https://mobbin.com/screens/59532944-1029-4422-84b2-4eb394b1ca13) · [Bumble — area-only display](https://mobbin.com/screens/550c6372-188b-43a6-8a26-a9e2f989cddd) |
| Location variants | **Different pricing / duration per location**, tying to service variants; per-location staff assignment | 19 May | [Peerspace — pricing tiers editor](https://mobbin.com/screens/5e8b31ef-3cae-4a37-a343-097e3f063580) · [Superpower — priced location modes](https://mobbin.com/screens/320482c3-f6d1-40d7-adf9-192f03796853) |
| Mobile / outcall | **Mobile as a location TYPE** (sibling, not a hidden sub-toggle); clear customer communication, mobile vs in-salon | 2 Jun | [Tesla — Mobile Service vs Service Centers](https://mobbin.com/screens/aa3aa895-ef1f-45b9-8f48-508437185aeb) · [Superpower](https://mobbin.com/screens/320482c3-f6d1-40d7-adf9-192f03796853) |
| Day-specific mobile | A working day can be **mobile-only** ("Wednesday is a working day but mobile-only") | 2 Jun | [Swarm — per-day hours editor](https://mobbin.com/screens/cdb2d9dc-ca8b-46e9-86e8-ce263a6a6872) · [Tripadvisor — per-day list](https://mobbin.com/screens/0182f7b2-d7fa-46da-a78f-21569ce105c5) |
| Per-location opening hours | Hours are **per location**, not global; split shifts / closed-for-lunch | 19 May, 2 Jun | [Tripadvisor — per-day + "Add hours"](https://mobbin.com/screens/0182f7b2-d7fa-46da-a78f-21569ce105c5) · [Facebook — Hours: No hours / Always open / Standard](https://mobbin.com/screens/2b1d6870-144e-4756-a777-177bb97bb367) |
| Per-location staff | Per-location staff assignment (already `staffByLocation` in the offer model) | 19 May | [Square Appointments](https://mobbin.com/screens/79c5529f-725e-4785-b2e0-33daa2cfc697) |
| Per-location availability (customer) | Selecting a branch re-filters the time slots by that branch's hours + staff | 19 May (multi-site) | [Zocdoc — office selector + per-location next availability](https://mobbin.com/screens/0828eae8-fd55-4169-b5fa-120aa62c9e09) |
| Home switcher | Switch active location on Home (already present) | 15 Jun walkthrough | [Linktree — "Switch Linktrees" bottom sheet](https://mobbin.com/screens/c947ba17-60a7-4beb-9d74-cf46bac0e231) |
| Active / inactive | Deactivate a location seasonally without deleting it | 19 May (flexibility) | [Shopify — Active / Inactive tabs](https://mobbin.com/screens/6e2fd9b4-f654-48d1-bb8f-de10bc06bbc4) |

---

## Current state

**Status legend:** ✅ done · 🟡 partial · ❌ missing.

- **No Locations management section** ❌ — the Hub menu (`src/app/app/hub/page.tsx`, line 34) already lists `{ key: "locations", label: "Locations", desc: "Multi-site management", icon: MapPin }` **with no `href`** — it renders as a dead `<button>` (the `href ? <Link/> : <button/>` branch). This is the natural anchor: give it `href: "/app/locations"` and build the route.
- **Location data is a flat seed list** 🟡 — `src/lib/data/locations.ts` exports `businessLocations: BusinessLocation[]` = three salons (`loc1` Salon Soho / `loc2` Salon Brixton / `loc3` Salon Chelsea), each `{ id, name, address }` only. The type is `BusinessLocation` in `src/lib/types/business.ts` (line 59) — **no area, privacy, type, hours, staff, or active flag yet**. There is **no `locationsStore`** — locations are static seed data, not editable.
- **Offer-side location model exists** ✅ — `src/lib/data/offers.ts` already carries `locationModes?: { inSalon; mobile; remote }`, `locationIds?: string[]`, `mobile?: MobileSettings`, `remote?: RemoteSettings`, and `staffByLocation?: Record<string,string[]>` (lines 137–147). `MobileSettings`/`RemoteSettings` live in `src/lib/store/wizardStore.ts` (lines 40–65: travelFee, feeType, feeAmount, radiusMiles, notice; platform + link). So **per-service "where" + per-location staff already persist** via `offerFromDraft` / `updateOffer` (`offersStore.ts` lines 61–66).
- **Shared LocationEditor** ✅ — `src/components/offer/LocationEditor.tsx` is the reusable "where is it offered?" editor (three multi-select mode cards: in-salon / mobile / remote, each opening a settings sheet). Used by **both** the wizard step (`src/app/new/locations/page.tsx`) and the dashboard module (`src/app/app/services/[id]/location/page.tsx`). This is per-*offer* delivery, **not** a location-management surface.
- **Home location switcher** 🟡 — `src/app/app/page.tsx` has a working `Sheet` "Your locations" (lines 697–739): a list of locations with the active one checked (`Check` icon) + a MapPin avatar + a one-line subtitle, plus an "Add a location" row that pulls from a hardcoded `extraLocations` array. But it is **local `useState` only** (`["Salon Soho", "Salon Shoreditch"]`, line 632) — it does **not** read `businessLocations`, has no "All locations" combined option, and switching does **not** re-scope the dashboard data (cosmetic only).
- **B2C** 🟡 — a consumer location page exists (`src/app/client/location/page.tsx`) and `src/lib/data/clientApp.ts` derives a single business address from `businessLocations[0]`. There is **no customer "Where" booking step** and **no area-privacy reveal** in the confirmation.
- **Per-location pricing variant** ❌ — the variant infrastructure exists (`offer.variants?: OfferVariant[]`, a "location" variant type referenced in the service plan) but per-location price/duration is **not** surfaced from the Locations section, and the LocationEditor's in-salon sheet does not collect per-location price deltas.

---

## Recommended UX calls

Opinionated decisions where the feedback left gaps — tagged `[ASSUMPTION]` (proceed unless told otherwise) or `[OPEN — needs user decision]` (in the questions list too).

1. **Locations is a flat, taggable list — never a hierarchy.** `[ASSUMPTION]` Adopt the Shopify hub skeleton (list + "Add location" top-right + a count line) but **drop "Location priority" / order-routing** — it is e-commerce inventory logic with no meaning for appointments. One location carries a single **Primary** badge (used as the switcher default and the profile default), set via the row trailing menu. Visibility/edit is gated by role, not structure (the client's "flexibility via permissions" line, 19 May / 2 Jun).
2. **Location TYPE is chosen up front and branches the form.** `[ASSUMPTION]` Fixed (in-salon) / Mobile (outcall) / Remote (video) — mapping 1:1 onto the existing `locationModes`. Mobile is a **sibling** location, not a sub-toggle of a fixed one (the explicit 2 Jun anti-pattern), so it owns its own hours, travel area and pricing.
3. **Area-only privacy is per-location, not a global business setting.** `[ASSUMPTION]` A chain's storefront wants the full address; the owner's home studio does not. The toggle lives inside the Fixed-address block with a **live "What clients see: Greenwich"** preview (Uber-Eats framing) and a **blurred-radius map, never a pin** (Peerspace/Airbnb). When on, the exact address is stamped only onto **confirmed bookings + the confirmation message**.
4. **Opening hours = inline per-day rows, with a bulk "Apply Mon–Fri".** `[ASSUMPTION]` Not a per-day wheel-picker modal (tap-heavy Swarm anti-pattern). Each day row: open/close pair, a "+" for split shifts (lunch close), an "Open 24h"/"Closed" toggle, and — crucially — a **per-day mode override** so a working day can be marked **"Mobile only"** (the 2 Jun requirement). Seed sensible salon defaults (Tue–Sat 9–18, Sun/Mon closed) so the common case is one tap.
5. **Per-location price/duration is opt-in via "Varies by location" on the service.** `[ASSUMPTION]` Default every service to the base price at every location; only reveal per-location fields when the owner turns the toggle on (otherwise multi-location setup is a data-entry chore — anti-pattern). The Locations section **reads/writes the existing `offer.variants` "location" type**, it does not introduce a second price model. The mobile/outcall row shows its travel-fee surcharge inline (Superpower/Tesla).
6. **The customer "Where" step only appears when it earns its place.** `[ASSUMPTION]` Show it only when the business has **>1 active location OR offers mobile**. Single fixed location = no dead tap (anti-pattern). Two clear sections, Tesla-style: "Visit us" (fixed list, area + next availability) and "We come to you" (mobile, travel area + surcharge).
7. **The switcher stays a lightweight bottom sheet** (not a full screen — frequent action) and gains an **"All locations"** combined view at the top (Linktree pattern). `[ASSUMPTION]`
8. **Promote the three seed salons to the new shape.** `[ASSUMPTION]` Migrate `businessLocations` to the richer model with back-compatible defaults (type `fixed`, privacy off, sensible hours, `active: true`, `loc1` = primary) so every existing reader keeps rendering.
9. **`[OPEN — needs user decision]`** Should a location store hold **opening hours**, or do hours belong to the team/schedule section (which already owns weekly schedules)? Recommendation: hours live on the **location** (they are a property of the place; staff schedules then sit *within* a location's hours) — but confirm, as it touches the team plan's coverage work.
10. **`[OPEN — needs user decision]`** Does "deactivate" hide a location from **customers only** (still visible to staff/admin) or fully? Recommendation: deactivate = not bookable + hidden from the public profile, still visible in the owner's hub greyed-out (matches "seasonal close without delete").

---

## Phase 1 — Locations data model + store (foundation)

**Goal:** Promote locations from a static seed list to an editable, richer domain with one source of truth, without breaking any existing reader.

**Flow:** (no UI — this is the backbone the rest hangs off.)
1. Extend `BusinessLocation` with the additive fields (see Data).
2. Add a `useLocationsStore` (Zustand, session-local) seeded from the migrated `businessLocations`, exposing `locations`, `addLocation`, `updateLocation`, `setPrimary`, `setActive(id, bool)`.
3. Migrate the three seed salons to the new shape with safe defaults so `LocationEditor`, `clientApp.ts`, and the Home switcher keep rendering.

**Changes:**
- `src/lib/types/business.ts` — extend `BusinessLocation`.
- `src/lib/data/locations.ts` — enrich the three seed rows (area, type `fixed`, hours, `active`, `loc1` primary).
- `src/lib/store/locationsStore.ts` (**new**) — the store + actions. Grep first: there is no existing locations store, so this is the canonical one.

**Data:** `BusinessLocation` gains (all optional / defaulted, back-compatible):
`type: "fixed" | "mobile" | "remote"` (default `"fixed"`) · `area?: string` (e.g. "Greenwich") · `privacy?: { hideExactAddress: boolean }` (default off) · `hours?: LocationDay[]` · `staffIds?: string[]` · `serviceIds?: string[]` (allocation; empty = all) · `active: boolean` (default `true`) · `primary?: boolean` · `mobile?: MobileSettings` · `remote?: RemoteSettings`.

**Risk:** low–medium — touch the shared seed list, so smoke every reader (`clientApp.ts` derives the consumer address from `businessLocations[0]`; keep `id`/`name`/`address` intact).

---

## Phase 2 — Locations hub (list + activate)

**Goal:** A real Locations section reachable from the Hub menu, listing every location with its type, area/address (privacy-respecting) and primary badge.

**Flow:**
1. Hub menu → **Locations** (wire the existing dead item, `hub/page.tsx` line 34).
2. **`/app/locations`** — `ScreenHeader` "Locations" with an **"Add location"** action top-right.
3. A **count line** when relevant ("3 locations"), Shopify-style — no plan/billing logic this pass.
4. **All / Active / Inactive** segmented tabs, shown **only once 2+ locations exist** (a solo owner never sees tabs).
5. **List rows:** name · area-or-address (respecting `privacy.hideExactAddress`) · a **type chip** (In-salon / Mobile / Remote) · a single **Primary** badge.
6. Tap a row → Location detail (Phase 3). Row **trailing menu** → "Set as primary" / "Deactivate" (or "Reactivate").

**Changes:**
- `src/app/app/hub/page.tsx` — add `href: "/app/locations"` to the locations menu item.
- `src/app/app/locations/page.tsx` (**new**) — the hub list. Compose from `@/components/ui` (`ScreenHeader`, list rows, `Chip`/`Badge`, segmented `Tabs`, `Sheet` for the trailing menu). **Empty state** for a brand-new business ("Add your first location") — gets a smoke needle.
- `smoke.tsx` — add a needle for the hub list + empty state.

**Data:** reads `useLocationsStore`; writes `setActive` / `setPrimary`.

**Risk:** low — read-mostly screen over the Phase 1 store.

---

## Phase 3 — Add / edit a location (type-branched form)

**Goal:** The core add/edit journey. Type is chosen first and branches the rest, following the Fresha order (address → hours → staff → services).

**Flow:**
1. **Name** the location ("Greenwich studio", "Mobile service").
2. **Choose TYPE** — Fixed (in-salon) / Mobile (outcall) / Remote (video). Three cards (reuse the `LocationEditor` mode-card visual language so the section feels consistent).
3. **If Fixed:** enter **address** with a mock map confirm → then the **privacy block** (Phase 4).
   **If Mobile:** set **travel area / radius** + optional **travel fee** instead of a fixed address (reuse the existing `MobileSettings` shape and the services mobile sheet's radius UI).
   **If Remote:** pick platform + link (reuse `RemoteSettings`).
4. **Opening hours** (Phase 5) — per-day rows with bulk apply and the per-day mode override.
5. **Assign staff** — multi-select from the team roster → writes `location.staffIds`.
6. **Allocate services** — "Offered here: All services / Specific" chip pattern (Square) → writes `location.serviceIds`; per-location price/duration is set later via the variant (Phase 7), surfaced here as a "Set per-location pricing" link only when "Varies by location" is on for that service.
7. **Save** → returns to the hub with the new location **active** (Shopify/Fresha).

**Changes:**
- `src/app/app/locations/new/page.tsx` and `src/app/app/locations/[id]/page.tsx` (**new**) — or a single editor component used by both. Compose from `@/components/ui`; reuse `MobileSettings`/`RemoteSettings` sheets from `LocationEditor` where the type matches.
- Reuse `src/components/offer/StaffEditor.tsx` for the staff multi-select if its shape fits; otherwise factor a small shared `StaffMultiSelect`.

**Data:** writes the Phase 1 fields via `updateLocation` / `addLocation`. No new fields beyond Phase 1.

**Risk:** medium — the biggest screen; the type branch keeps it from collapsing into one over-long form.

---

## Phase 4 — Area-only privacy (home-based)

**Goal:** The headline 19 May requirement — let a home-based owner publish an **area** and withhold the exact address until a booking is confirmed, with a preview that removes all doubt about what clients see.

**Flow (inside the Fixed-address block):**
1. Toggle **"Hide exact address until booking confirmed"** ON.
2. Enter the public **Display area** (free text, or default-suggested from the postcode district — e.g. "Greenwich").
3. A **preview card** shows the customer-facing view: a **blurred-radius map (no pin)** + the area name + the line **"Address shared after you book"** (Peerspace label, verbatim). A tiny caption **"What clients see before booking: Greenwich"** (Uber-Eats framing) sits under the toggle.
4. Confirm → the full address is stored, but flagged so it is injected only into the **confirmed booking + confirmation message** (Airbnb/Shopify), never the public profile.

**Changes:**
- The Fixed-address block within the Phase 3 editor — privacy toggle + area field + preview card.
- New `MapRadius`-style mock component (or reuse the services mobile radius mock per the service-plan decision — SVG/CSS ring, **no map dependency / API key**).
- **B2C touchpoint (flagged):** the consumer location/listing view (`src/app/client/location/page.tsx`) reads `privacy.hideExactAddress` → shows area + blurred radius pre-booking; the booking confirmation reveals the exact address.

**Data:** `BusinessLocation.privacy.hideExactAddress` + `area` (from Phase 1). The "released to confirmed booking" behaviour is presentational in the prototype (no real booking record), so the confirmation screen simply reads the full address when a booking is confirmed — `[ASSUMPTION]`.

**Risk:** medium — the preview must be unambiguous; the blurred-radius must never leak a pin (anti-pattern).

---

## Phase 5 — Per-location opening hours (+ day-specific mobile)

**Goal:** Hours owned by the location, edited as inline per-day rows, with the per-day **mode override** that makes "Wednesday is a working day but mobile-only" (2 Jun) a first-class state.

**Flow:**
1. A **per-day list** (Mon…Sun rows), each: an open/close time pair, a **"+"** to add a split shift (close for lunch), and an **"Open 24h" / "Closed"** toggle (Tripadvisor/Facebook).
2. A bulk **"Apply Mon–Fri"** action to copy one day across the working week (cut taps — Swarm bulk-edit, but as rows not a wheel modal).
3. A per-day **mode override** chip — default "In-salon", switchable to **"Mobile only"** for that day (the 2 Jun line). Only offered when the business has a mobile capability.
4. Seed salon defaults so the typical case (Tue–Sat 9–18) needs minimal editing.

**Changes:**
- A `OpeningHoursEditor` component inside the Phase 3 editor (or a `/app/locations/[id]/hours` sub-route if the form gets long). Compose from `@/components/ui` (time inputs, `Toggle`, `Chip`). **SSR-safe:** no `new Date()`/`Date.now()` at module/render top level — seed defaults are static literals.
- **Customer-side (Phase 8 dependency):** the booking "Where"/slot step reads location hours to re-filter slots.

**Data:** `LocationDay { day: Weekday; closed: boolean; open24?: boolean; shifts: { start: string; end: string }[]; modeOverride?: "in_salon" | "mobile_only" }` on `BusinessLocation.hours`.

**Risk:** medium — the day-row + split-shift control is fiddly; the mode override is a small but high-value addition. Note the **dependency with the team plan's coverage work** — staff schedules sit *within* these hours (Open question 9).

---

## Phase 6 — Home location switcher (real, store-backed)

**Goal:** Turn the cosmetic Home switcher into the real one — reading the locations store, offering an "All locations" combined view, and re-scoping the dashboard.

**Flow:**
1. Tap the location chip in the Home greeting (`GreetingCard`, already wired to open the sheet).
2. Bottom **"Switch location"** sheet (Linktree): **"All locations"** combined option pinned at the top, then each **active** location with name + area + type chip, the current one **checked**.
3. **"Add location"** link pinned at the bottom → routes to `/app/locations/new`.
4. Select → Home, the Overview KPIs / Needs-Attention / Team-today re-scope to that location (or aggregate for "All").

**Changes:**
- `src/app/app/page.tsx` — replace the local `useState(["Salon Soho", …])` + `extraLocations` (lines 632–634) with `useLocationsStore`; add the "All locations" row; route "Add a location" to `/app/locations/new`; persist the active location to the store so other screens can read it.
- `useLocationsStore` gains `activeLocationId: string | "all"` + `setActiveLocation`.

**Data:** `activeLocationId` on the store (session-local). Re-scoping of dashboard numbers is **presentational** in the prototype — `[ASSUMPTION]`.

**Risk:** low–medium — the switcher swap is small; "re-scope the dashboard" is the open-ended part (keep it presentational this pass).

---

## Phase 7 — Per-location pricing / duration variant

**Goal:** Surface the 19 May "different pricing/duration per location" requirement through the **existing** service variant model — opt-in, defaulting to base price.

**Flow:**
1. On a service: **Pricing & availability → "Varies by location"** toggle.
2. One **row per location** the service is offered at, each with its own **price (and optional duration)** field, defaulting to the base.
3. The **mobile/outcall** row can carry a **"+ travel fee"** surcharge inline (Peerspace tiers / Superpower).
4. Save → on the customer booking step, selecting a location shows **that location's price on the option card** (Superpower/Tesla).

**Changes:**
- `src/app/app/services/[id]/variants/page.tsx` (+ the "location" variant type already planned in `service-finalisation-plan.md` Phase 4) — the per-location price rows read the locations list from `useLocationsStore`.
- `LocationEditor` in-salon sheet — optional "Set per-location price" affordance when "Varies by location" is on.

**Data:** uses the existing `offer.variants` "location" variant type; ensure the per-location price map keys on `BusinessLocation.id`. **No new top-level field** — this ties into, not duplicates, the variant work (anti-pattern: don't duplicate location data across services and locations).

**Risk:** medium — coordinate with the service plan's variant phase so there is one location-variant implementation, not two.

---

## Phase 8 — Customer "Where" booking step (B2C)

**Goal:** The consumer side of mobile-vs-fixed and per-location availability — only when it earns its place.

**Flow:**
1. After picking a service, show a **"Where"** step **only if** the business has **>1 active location OR offers mobile** (single fixed = skip, no dead tap).
2. Two sections (Tesla): **"Visit us"** (fixed locations, each with area + next availability) and **"We come to you"** (mobile, travel area + any surcharge shown on the card).
3. For **mobile**, capture the **client's** address here (privacy in reverse — the business gets the client address on confirm).
4. Selected option **re-filters time slots** by that location's hours + assigned staff (Zocdoc).
5. **Confirmation reveals the exact business address** for fixed locations per the area-privacy rule (Phase 4).

**Changes:**
- B2C booking flow under `src/app/c/**` (coral surface, `@/components/ui/consumer`) — a new "Where" step; the confirmation reads the released address.
- Reads `useLocationsStore` (active + bookable locations) and per-location hours/staff.

**Data:** none new — consumes Phases 1, 4, 5, 7. **B2C surface — keep it coral, do not homogenise with B2B.**

**Risk:** medium — crosses into the consumer booking flow; sequence after the B2B locations land.

---

## V2 / deferred

- **Real map + geocoding** — swap the stylised mock for a live provider (radius drawn from real lat/long, postcode → area auto-fill). Direction: gate behind a single `MapRadius` component so the mock→real swap is one component, plus an API key + cost decision (same posture as the services mobile-map decision).
- **Plan/subscription gating of the location count** — the Shopify "2 of 2 active locations" count line becomes a real plan limit + an upgrade prompt when adding beyond the tier (mirrors the team plan's "single-staff shop must upgrade" gate). Direction: a `planLimits.maxLocations` business setting + an upgrade sheet; surface the count line now as informational only.
- **Per-location reporting / cross-site view** — Fresha/Square's per-location reports and a unified cross-site booking view. Direction: the analytics section consumes `activeLocationId` and aggregates "All locations".
- **Resource/room allocation per location** — rooms & equipment (already a services Resources concept) scoped per location. Direction: extend `location.serviceIds` thinking to a `location.resourceIds`, reusing the resources catalogue rather than a parallel model.
- **Per-location notification / branding overrides** — different confirmation copy or branding per branch. Direction: optional per-location overrides on the existing notifications model.
- **Travel-time-aware mobile scheduling** — auto travel buffers between mobile bookings by distance (the `travelBufferMin` field already exists on `MobileProfile`). Direction: a later scheduling-engine concern.

---

## Suggested order & rationale

`1 (model + store) → 2 (hub list) → 3 (add/edit) → 4 (privacy) → 5 (hours) → 6 (switcher) → 7 (variant) → 8 (customer Where)`

Phase 1 is the non-negotiable foundation — every other phase reads the store, and the seed migration must stay back-compatible before anything renders. Phases 2–3 stand up the section and its core journey; 4–5 are the two highest-value pieces of feedback (home-based privacy and per-location hours / day-specific mobile) and slot into the Phase 3 editor. Phase 6 (switcher) is small and can be pulled forward once the store exists if a demo needs it. Phase 7 deliberately follows the service plan's variant phase so there is **one** location-variant implementation. Phase 8 is the only B2C phase and depends on the B2B model being settled, so it lands last.

Every phase ends green on `npx tsc --noEmit && npx next lint && npm run smoke`, with a smoke needle for each new empty/setup state (hub empty list, add-location empty, privacy preview). Persistence stays session-local Zustand; all new fields are additive so the three seed salons keep rendering.

---

## Cross-cutting data-model changes

`BusinessLocation` (in `src/lib/types/business.ts`) gains — all optional / defaulted, back-compatible:
- `type: "fixed" | "mobile" | "remote"` (default `"fixed"`) — Phase 1/3
- `area?: string` — Phase 1/4 (public display area, e.g. "Greenwich")
- `privacy?: { hideExactAddress: boolean }` (default off) — Phase 4
- `hours?: LocationDay[]` where `LocationDay = { day: Weekday; closed: boolean; open24?: boolean; shifts: { start: string; end: string }[]; modeOverride?: "in_salon" | "mobile_only" }` — Phase 5
- `staffIds?: string[]` — Phase 3 (per-location staff; complements the offer's `staffByLocation`)
- `serviceIds?: string[]` (empty = all) — Phase 3 (service allocation)
- `active: boolean` (default `true`), `primary?: boolean` — Phase 1/2
- `mobile?: MobileSettings`, `remote?: RemoteSettings` (reuse the existing `wizardStore` shapes) — Phase 3

New store: `src/lib/store/locationsStore.ts` — `locations`, `activeLocationId: string | "all"`, `addLocation`, `updateLocation`, `setPrimary`, `setActive`, `setActiveLocation`.

**No new field on `DemoOffer`** — per-location pricing reuses the existing `offer.variants` "location" type and `staffByLocation`/`locationIds`/`locationModes` (one source of truth; anti-pattern to duplicate). All additive / back-compatible — the three seed locations and the 23 seed offers keep rendering.

---

## Open questions for the user

1. **Hours ownership.** Do opening hours live on the **location** (recommended — a property of the place) or in the **team/schedule** section that already owns weekly schedules? This determines whether Phase 5 sits here or coordinates with the team plan's coverage work.
2. **Deactivate semantics.** Does "deactivate" hide a location from **customers only** (still visible to staff/admin) or fully? (Recommendation: not-bookable + hidden from public, greyed-out in the owner's hub.)
3. **Privacy default.** Should "Hide exact address" default **off** for all locations (recommended — a chain wants its storefront public), or **on** for a location the owner tags as a home studio?
4. **Address release in the prototype.** The "released into the confirmed booking" behaviour is presentational here (no real booking backend). Is a presentational reveal on the confirmation screen sufficient for sign-off, or do you want a mock "booking record" object?
5. **Plan limits.** Is the count line purely informational this pass, or do you want a hard "X of Y locations" cap tied to the (not-yet-built) subscription tier? (Recommendation: informational now; gate in V2.)
6. **"All locations" aggregation.** When the switcher is on "All locations", should the dashboard **aggregate** numbers across sites, or just remove the location filter? (Recommendation: presentational aggregation now.)
7. **Customer "Where" threshold.** Confirm the rule to show the customer "Where" step: **>1 active location OR mobile offered** (recommended), and that a single fixed-location business never sees it.
