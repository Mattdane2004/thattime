# Business Profile — Finalisation Plan

> **Status:** Plan only — no implementation until the open questions below are resolved.
> **Scope:** The **Business profile** section — the vendor's *public-presence* configuration (what clients see on the B2C marketplace listing): shop details, gallery, public booking link + QR, plus read-only cross-links into the opening times (Locations), address privacy (Locations) and cancellation policy (Settings). It is the B2B authoring surface for the `/c/salon/[id]` consumer listing.
> **Explicitly out of scope this pass:** internal business *rules* and *settings* (the editable cancellation/payment/lead-time rules live in Business settings / the service settings flow — we only surface read-only summaries here); the marketplace search/ranking and SEO; live geocoding / a real map provider; the **social-feed gallery layout** (V2 — see "V2 / deferred"). Opening-times *editing* and address fields are owned by Locations — this section reads, never forks, that data.
> **Design source:** no finalised Figma for this section. Shabbir flagged it as **"relatively straightforward" (15 Jun)** and undesigned. Build from the meeting feedback + the design-research patterns (Mobbin refs in the map) using the existing `@/components/ui` library, reviewed in the running app — same approach as `team-finalisation-plan.md`.

---

## What this section is

Business profile is the owner's **public face** — the single place to author everything a client sees when they land on the salon's marketplace listing. It sits in the Hub **Setup** group (`src/app/app/hub/page.tsx`, the "Business profile" row) and is deliberately distinct from **Business settings** (internal rules) and **Locations** (the source of truth for addresses & hours). The model is a *hub of plain-language rows* — Shop details, Gallery, Booking link, Opening times, Address privacy, Cancellation policy, Shop safety — each drilling into a focused editor, with a persistent "Preview as client" action and a master "Listed on marketplace" toggle. Everything edited here renders into the `/c/salon/[id]` listing (today hardcoded), making this the B2B→B2C bridge.

---

## Feedback → source map

| Area | Feedback | Source | Pattern ref (Mobbin) |
|---|---|---|---|
| Section exists at all | Business & profile section is **not yet designed**; "relatively straightforward". Contents: profile, shop details, opening times, booking links, gallery, cancellation policy, shop safety | 15 Jun | Squarespace Business Information hub — https://mobbin.com/screens/355b981f-4b8e-43ae-adab-c29a33331593 |
| IA / landing | One landing screen of grouped disclosure rows, business identity at the top, separating "what clients see" from cross-links into rules | 15 Jun | Revolut Business profile landing — https://mobbin.com/screens/7bd409a7-1bd6-4fc3-969c-fae0f68d057a |
| Shop details | Name, description, contact | 19 May, 15 Jun | Square Go vendor profile — https://mobbin.com/screens/e1e68966-8785-4703-9d99-958da86de00f |
| Opening times | Cross-link to Settings/Locations — do not duplicate | 15 Jun, 19 May | Calendly Working hours — https://mobbin.com/screens/ec322407-695e-4ce9-8504-401c73e87e9d · Swarm bulk shortcuts — https://mobbin.com/screens/cc52684e-8a19-4232-8e1f-2e21ddca13a0 |
| Public booking link | Shareable URL + QR code (printable acquisition channel) | 15 Jun | WhatsApp Group link — https://mobbin.com/screens/a7128900-2398-417d-a08a-c42dfed8d805 · Wise "Get a QR code" — https://mobbin.com/screens/c808e531-9dad-4a06-9eee-e45f03fc9388 |
| Gallery | Photos of work / premises; first-class objects (caption/tag optional) | 15 Jun | Tinder photo grid — https://mobbin.com/screens/c9161f8c-19db-4083-a3b6-fb0dc1ce1dbe · Bumble Main badge — https://mobbin.com/screens/975092f2-fdee-428b-bb75-0f2396e5a594 |
| Gallery → social (V2) | Gallery could become a more social layout — V2, hook to the social-marketplace vision | 15 Jun, 2 Jun | Fresha gallery-first hero — https://mobbin.com/screens/eddf7b74-cc51-4701-8d9e-282f68eb6697 |
| Cancellation policy | Cross-link to Settings; named presets, plain-English, not free-text legalese | 15 Jun | Airbnb preset picker — https://mobbin.com/screens/51e8bef2-60b2-4872-9884-ab07c155ce14 · public tiers — https://mobbin.com/screens/52f35d98-0c1c-4f6f-b971-19c3f15396a5 |
| Shop safety | Shop safety info — amenity/safety checklist | 15 Jun | Fresha "Additional information" block — https://mobbin.com/screens/6faffd0f-290c-4bcd-987e-0bd0ec0f47cc |
| Address privacy | Hide-address ties to Locations — home-based businesses show **area only**; full address still goes to confirmed clients | 19 May | Vinted "Show city in profile" — https://mobbin.com/screens/5396c8c5-313c-4a93-a31b-4a8dd825db79 |
| Map + directions | Public listing shows a map pin + Get directions, derived from the location | 15 Jun (listing output) | Fresha map + Get directions — https://mobbin.com/screens/52888f8d-8daf-4be0-bc12-5acbf1c6d147 |
| Public listing = the output | This is the vendor public presence config — must feed the B2C marketplace listing; recommend how it relates | 15 Jun | Fresha About / Services tabs — https://mobbin.com/screens/a18708f2-965e-4ec1-94c9-6e59f9ff6ded |
| Preview + publish | Owner must always know whether/what is public | 15 Jun (bridge) | Snapchat Preview Profile — https://mobbin.com/screens/6f3a8957-7389-41b2-be71-c5ee9c8b0334 · Glass master toggle — https://mobbin.com/screens/6eff3496-3a37-4f16-b2db-7a32d8b96e4f |

---

## Current state

**Legend:** ✅ done · 🟡 partial · ❌ missing.

- **Hub entry — ❌ inert.** `src/app/app/hub/page.tsx` lists `{ key: "business-profile", label: "Business profile", icon: Building2 }` in `setupItems` with **no `href`** — it renders as a dead `<button>` (the `ListCard` helper only links rows that carry an `href`). There is no `/app/business-profile` route.
- **Profile tab in the hub — 🟡 unrelated.** The hub's "Profile" tab (`tab === "profile"`) shows a *personal account* card ("Mathew Dane · Admin · Pro plan"), Wallet, an Account list and Switch-to-B2C. This is the **user's** account, not the **business's** public presence — they must not be conflated.
- **No business-profile domain — ❌.** There is no `src/lib/data/businessProfile.ts` and no `businessProfileStore`. `src/lib/types/business.ts` holds onboarding enums + booking-rule types (`CancellationPolicy`, `BusinessDefaults`, `DepositRule`) but **no profile/identity/gallery/booking-link** types.
- **Locations — 🟡 thin.** `src/lib/data/locations.ts` seeds three `BusinessLocation { id, name, address }`. The `BusinessLocation` type (`business.ts`) has **no opening hours and no address-visibility flag** — there is nowhere for "opening times" or "show area only" to live yet. The wizard/dashboard location editor is `src/components/offer/LocationEditor.tsx` (per-offer location modes, not business hours).
- **Onboarding captures identity, unsurfaced — 🟡.** `src/lib/store/onboarding2.ts` already holds `businessName`, `businessTypes` (primary first), `baseAddress`, `hideAddressUntilBooking`, `workModes`, `travelRadius`. None of this flows into an editable business-profile surface; it's collected once and dropped.
- **The B2C listing is fully hardcoded — 🟡, this is the target output.** `src/app/c/salon/[id]/page.tsx` renders the gallery-first Instagram+Fresha listing entirely from the **static** `salons` array in `src/lib/data/b2c.ts` (`Salon` type: `name, handle, category, rating, address, bio, followers, postsCount, openNow, hours, posts[], highlights[], offers[], staff[], reviews[]`). Opening hours and amenities are **module-level constants inside the page** (`OPENING_HOURS`, `AMENITIES`) — not driven by any config. There is no owner-editable path to any of it, and no link from the owner's app into "preview my listing".
- **UI library — ✅ everything needed exists.** `SettingsGroup`, `SummaryRow`, `ListRow`, `ToggleRow`, `Sheet`/`BottomSheet`, `Field`, `Textarea`, `RadioGroup`, `SegmentedControl`, `StatusPill`, `EmptyState`, `Toaster`/`toast`, plus the `WeeklyScheduleDay` type (`src/lib/types/staff.ts`). No new primitives are required — only a couple of composed module components (gallery grid, QR screen).

Net: the section is **0% built** beyond a dead hub row, but the data destination (the B2C listing) and the component library are both in place, so this is genuinely "straightforward" — mostly authoring screens + one new store that the listing reads from.

---

## Recommended UX calls

Opinionated decisions where the feedback left gaps. Tagged `[ASSUMPTION]` (proceeding unless told otherwise) or `[OPEN — needs user decision]` (raised in Open questions).

1. **Hub of rows, never one mega-form** `[ASSUMPTION]`. Adopt the Squarespace/Revolut model exactly: one landing screen of grouped `SummaryRow`s inside `SettingsGroup` cards, each showing the current value (or an empty-state hint like "Add photos") and chevroning into a focused editor. This is the single biggest cognitive-load win for a non-technical owner.

2. **Three groups, in this order** `[ASSUMPTION]`:
   - *Your public page* — Shop details · Gallery · Booking link (the things only edited here).
   - *Practical info* — Opening times (read-only summary → Locations) · Location & address privacy (read-only → Locations).
   - *Trust & rules* — Cancellation policy (read-only summary → Settings) · Shop safety (edited here).
   This visually separates "what clients see and I author here" from "rules that live elsewhere", per the Revolut grouping.

3. **Cross-link, never duplicate** `[ASSUMPTION]`. Opening times and cancellation policy are shown as read-only summary cards with an "Edit in Locations" / "Edit in Settings" deep-link. Two editable copies will drift (anti-pattern the client explicitly called out). Because *Locations currently stores no hours*, the per-day hours editor itself is built **in the Locations data model** (Phase 4), and the profile only renders it.

4. **Address privacy lives with the location record** `[ASSUMPTION]`. Add `addressVisibility: "full" | "area"` to `BusinessLocation`. Profile shows a read-only summary; the toggle is edited in Locations (Vinted model). Default home-based businesses to `"area"`. **Confirmed clients always get the full address in booking confirmations** regardless of this flag — never let "hide" leak into post-booking comms.

5. **Booking link: one URL, an action list, QR as a first-class screen** `[ASSUMPTION]`. URL in a copyable card (`thattime.app/{handle}`), then a tidy action list (Copy / Share via… / Show QR / optionally Reset). QR gets its **own** screen with a large code + Save to Photos / Print — salons print it on the desk, mirror and window, so don't bury it in the OS share sheet (Wise/WhatsApp model). The slug derives from the onboarding `businessName`; **whether the handle is editable** is `[OPEN]`.

6. **Gallery is a simple, useful-at-one-photo grid now** `[ASSUMPTION]`. 3-across grid, first tile = cover ("Cover" badge), "+" tile for multi-select upload, tap-X to remove, hold-to-reorder (Tinder/Bumble). Captions/service-tags are **optional**, never a gate — no "minimum 4 photos" pressure. Store photos as first-class objects (id, url, caption?, serviceTag?) so the V2 social layout is purely additive.

7. **Presets and checklists over free text** `[ASSUMPTION]`. Cancellation policy reuses the existing `CancellationPolicy` presets (`flexible | moderate | strict`) shown as a plain-English summary card (Airbnb). Shop safety is a checklist of toggle-able amenity/safety items + one optional note (Fresha "Additional information") — SMB owners won't write good legal/safety copy.

8. **Persistent "Preview as client" + one master "Listed" toggle** `[ASSUMPTION]`. The hub header carries a business avatar + name, a "Preview as client" action that opens the live `/c/salon/{id}` listing (the only place the editor crosses into coral), and a `StatusPill` (Listed / Not listed) driven by a single master `listed` flag. No per-field hide switches (Snapchat/Glass model).

9. **Keep the editor ink/navy; only the preview is coral** `[ASSUMPTION]`. The whole Business-profile surface is B2B (ink/navy). The B2C listing it produces is coral. Don't homogenise.

10. **Wire the B2C listing to the config in this pass, for the owner's own salon only** `[ASSUMPTION]`. So "Preview as client" shows real edits, point `/c/salon/[id]` at the new `businessProfileStore` when the id is the owner's salon, falling back to the static `salons` seed for every other salon. This proves the bridge without re-seeding all five demo salons. (Full marketplace data migration is V2.)

---

## Phase 1 — Hub entry + Business-profile landing (the backbone)

**Goal:** Make the dead hub row live and stand up the grouped-rows landing screen with identity header, preview action and master "Listed" toggle. Everything later hangs off this.

**Flow:**
1. Hub → Setup → **Business profile** (now an `href` to `/app/business-profile`).
2. **Landing header:** business logo/avatar + name (from the new store, seeded from onboarding `businessName`), a `StatusPill` (Listed / Not listed), and a "Preview as client" text action.
3. **Group 1 — Your public page:** Shop details · Gallery · Booking link (rows; values wired in Phases 2–3, placeholders for now).
4. **Group 2 — Practical info:** Opening times · Location & address privacy (read-only summary rows; wired in Phase 4).
5. **Group 3 — Trust & rules:** Cancellation policy · Shop safety (wired in Phases 5–6).
6. **Master toggle** at the foot: "Listed on marketplace" — when off, the listing is hidden and the pill reads "Not listed".
7. Each row shows a 1-line current value or an empty-state hint ("Add photos", "Add a description").

**Changes:**
- `src/app/app/hub/page.tsx` — add `href: "/app/business-profile"` to the `business-profile` setup item.
- New `src/app/app/business-profile/page.tsx` — landing screen composed from `SettingsGroup` + `SummaryRow` + `StatusPill` + `ToggleRow`; "Preview as client" → `router.push("/c/salon/{id}")`.
- New `src/lib/store/businessProfileStore.ts` — Zustand store seeding identity from `onboarding2` defaults; `listed` flag; setters.
- New `src/lib/data/businessProfile.ts` — seed profile + the `BusinessProfile` type (see Data).

**Data:** New `BusinessProfile { id; name; tagline; description; logo?; cover?; handle; contact; gallery; safety; listed }` (fields filled out by later phases). Seed one profile mapping to the owner's salon.

**Risk:** low — pure composition over existing primitives; no destructive edits.

---

## Phase 2 — Shop details editor

**Goal:** The "name, description, contact" editor — the identity that anchors the listing header.

**Flow:**
1. From the hub, tap **Shop details**.
2. Logo/cover thumbnail with "Change photo".
3. **Business name** (required) and **Tagline** (the one-liner shown under the name — maps to the listing's category/strapline line).
4. **Description** — multiline `Textarea` with a soft character guide.
5. **Contact** as add-rows: public phone, email, website, and social handles (Instagram primary), each a `ListRow` with add/edit.
6. Save → returns to the hub; the Shop-details row now shows the name + a "complete" tick; the listing header updates.

**Changes:**
- New `src/app/app/business-profile/details/page.tsx` — `Field`/`Textarea`/`ListRow` composition + a save handler writing to `businessProfileStore`.
- `businessProfileStore` — `setIdentity`, `setContact` actions.

**Data:** `BusinessProfile.contact: { phone?; email?; website?; socials: { platform; handle }[] }`; `name`, `tagline`, `description`, `logo?`, `cover?`.

**Risk:** low.

---

## Phase 3 — Booking link + QR

**Goal:** The shareable URL and a printable QR — a real acquisition channel for a physical shop.

**Flow:**
1. From the hub, tap **Booking link**.
2. The shareable URL in a copyable card: `thattime.app/{handle}` (handle from the store; inline "Edit handle" only if `[OPEN Q3]` says editable).
3. Action list (plain `ListRow`s with trailing icons): **Copy link** · **Share via…** (native share sheet) · **Show QR code** · *(optional)* **Reset link**.
4. **Show QR** → dedicated `/app/business-profile/link/qr` screen: large scannable code + business name + **Save to Photos** / **Print** (prototype: a generated SVG/`<canvas>` placeholder QR, no live encoder dependency unless `[OPEN Q4]`).
5. Helper text: "Add this to your bio, window and reception desk."

**Changes:**
- New `src/app/app/business-profile/link/page.tsx` — URL card + action list; Copy → clipboard + `toast`; Share → `navigator.share` guarded for SSR.
- New `src/app/app/business-profile/link/qr/page.tsx` — large QR + Save/Print.
- New `src/components/business/QrCode.tsx` — mock/placeholder QR component (no clock/random at module top level — SSR-safe).

**Data:** `BusinessProfile.handle: string` (seeded from a slugified `businessName`).

**Risk:** low–medium — `navigator.share`/clipboard must be guarded so they never run at render top level (CLAUDE.md SSR rule).

---

## Phase 4 — Opening times (built in Locations, summarised here) + address privacy

**Goal:** Give Locations a real per-location opening-hours model and an address-visibility flag, then surface both **read-only** on the profile. This is the cross-link, not a fork.

**Flow (editing — in Locations):**
1. Locations → a location → **Opening hours**: one row per weekday with a leading toggle (off = greyed "Closed"), an inline time-range field, and a "+" to add a second range (split shifts) — Calendly model.
2. **Bulk shortcuts** pinned at top: "Apply Mon–Fri", "Copy to all days" — Swarm model.
3. A separate **Special hours / closures** list for one-off bank-holiday/closure dates (date overrides).
4. **Address visibility** control on the location: "Show full address" · "Show area only" (Vinted). When "area only", the public preview shows a coarse pin/area; **booking confirmations still carry the full address**.

**Flow (profile — read-only):**
5. The hub **Opening times** row shows a per-day summary (coloured dot, time range, Closed greyed) → "Edit in Locations".
6. The **Location & address privacy** row shows the area/full state → "Edit in Locations".

**Changes:**
- `src/lib/types/business.ts` — extend `BusinessLocation` with `hours?: WeeklyScheduleDay[]`, `specialHours?: { id; date; label; closed }[]`, `addressVisibility?: "full" | "area"`.
- `src/lib/data/locations.ts` — seed default 9–18 weekday hours for the three salons.
- New `src/app/app/locations/[id]/hours/page.tsx` (or extend the existing Locations surface — grep before adding) — the toggle+range editor with bulk shortcuts.
- New read-only summary components on the profile hub rows (reuse the per-day dot row pattern already rendered in `/c/salon/[id]` About tab — factor it into `src/components/business/HoursSummary.tsx`).

**Data:** `BusinessLocation` gains `hours`, `specialHours`, `addressVisibility` (all optional / back-compatible). Reuses the existing `WeeklyScheduleDay` type — no new shape.

**Risk:** medium — touches the Locations domain (which had no hours model); the editor itself is the most code, but it's a well-trodden pattern.

---

## Phase 5 — Gallery manager

**Goal:** The photo grid the client asked for — useful at one photo, seeded with the V2 social hook.

**Flow:**
1. From the hub, tap **Gallery**.
2. **Empty state:** friendly prompt + "Add photos of your work and space".
3. 3-across thumbnail grid; first tile carries a "Cover" badge.
4. "+" tile → multi-select from camera roll; uploads show progress then a success `toast`.
5. Hold-and-drag to reorder (first slot = cover); X on each tile to remove; tap a tile → options sheet (Set as cover / Remove / Add caption).
6. Optional per-photo caption / service tag — never required.

**Changes:**
- New `src/app/app/business-profile/gallery/page.tsx`.
- New `src/components/business/GalleryGrid.tsx` — the reorderable grid (reuse `framer-motion` reorder, already a dependency per `/c/salon`).
- `businessProfileStore` — `addPhotos`, `removePhoto`, `reorderPhotos`, `setCover`, `setCaption`.

**Data:** `BusinessProfile.gallery: { id; url; caption?; serviceTag?; isCover? }[]` — photos as first-class objects so V2 is additive.

**Risk:** medium — drag-to-reorder + multi-select are the fiddly bits; image upload is a prototype stub (cycle the placeholder set from `b2c.ts`).

---

## Phase 6 — Cancellation policy (summary) + Shop safety

**Goal:** The "trust & rules" group — a read-only policy summary that deep-links to Settings, and an editable safety checklist.

**Flow:**
1. **Cancellation policy** row → a summary card showing the chosen preset in plain English (Flexible / 24h notice / 48h + deposit) + "Edit in Settings" deep-link. Reuses the existing `CancellationPolicy` type — no new editor here.
2. **Shop safety** → its own editor: a checklist of toggle-able items (e.g. Accessible entrance, Sanitised equipment, Patch-test required, Card payments, Wi-Fi, Parking) + one optional free-text note.
3. Both render into the listing's "Good to know / Amenities" section (today the hardcoded `AMENITIES` array in `/c/salon/[id]`).

**Changes:**
- New `src/app/app/business-profile/safety/page.tsx` — `ToggleRow` checklist + `Textarea` note.
- Cancellation summary is a card on the hub row (no new route) → deep-links to the Business settings / service-settings cancellation picker.
- `businessProfileStore` — `setSafety`.

**Data:** `BusinessProfile.safety: { items: { id; label; on }[]; note?: string }`. Cancellation is *read* from the existing business defaults (`CancellationPolicy`), not stored here.

**Risk:** low.

---

## Phase 7 — Wire the B2C listing to the config (the bridge)

**Goal:** Prove the B2B→B2C link: the owner's own listing renders from the config, not hardcoded constants, so "Preview as client" shows real edits.

**Flow:**
1. `/c/salon/[id]` for the owner's salon id reads name, tagline, description, contact, gallery → posts, hours, address+visibility, amenities/safety from `businessProfileStore`; every other salon falls back to the static `salons` seed.
2. The About tab's hardcoded `OPENING_HOURS`/`AMENITIES` become props derived from the profile/location for the owner's salon.
3. The master "Listed" toggle gates whether the owner's salon appears (when off: a "Not listed" state in preview).

**Changes:**
- `src/app/c/salon/[id]/page.tsx` — replace the in-file `OPENING_HOURS`/`AMENITIES` constants with a resolver that prefers `businessProfileStore` for the owner salon, else the `Salon` seed.
- `src/lib/data/b2c.ts` — add a small adapter `profileToSalon(profile, location)` mapping the config into the `Salon` shape the listing already consumes.

**Data:** none new — an adapter over Phases 1–6 fields.

**Risk:** medium — touches the consumer surface; keep the seed fallback so all five demo salons keep rendering (smoke-critical).

---

## V2 / deferred

- **Social-feed gallery layout** — the client explicitly scoped the gallery's social layout as V2 and tied it to the social-marketplace vision (15 Jun, 2 Jun). *Direction:* because Phase 5 stores photos as first-class captionable objects, V2 is additive — promote the grid into a posts feed (likes/comments, story highlights, "book this look" offer tags), reusing the existing `/c/salon/[id]` Grid tab + `SalonPost` model. No data migration needed.
- **Editable booking-link handle / vanity slugs** — if `[OPEN Q3]` lands as editable, add slug validation + uniqueness; defer until the marketplace has a real namespace.
- **Live QR encoding + branded QR** — swap the placeholder for a real encoder and a branded frame ("Book {salon} on That Time") once the URL scheme is final (`[OPEN Q4]`).
- **Real map + geocoding** — the listing's map is a static image today; a real provider (pin from geocoded address, "area only" = blurred radius) is a cross-cutting dependency shared with the services *mobile-location* map — defer to a single map decision.
- **Per-section completeness meter** — a subtle Fresha-style "profile 70% complete" nudge across the hub rows; nice-to-have, not load-bearing.
- **Reviews/ratings authoring & response** — the listing shows reviews (seeded); owner-side review management belongs with a future reputation/marketing pass, not profile config.
- **Multi-location profiles** — if a business runs several sites with distinct public pages, the profile would fan out per location. This pass assumes one public profile with multi-location *hours*; per-location *public pages* is V2.

---

## Suggested order & rationale

`1 (hub + landing) → 2 (shop details) → 3 (booking link + QR) → 4 (opening times in Locations + privacy) → 5 (gallery) → 6 (cancellation summary + safety) → 7 (wire B2C listing)`

Phase 1 first because the grouped-rows hub is the backbone every other editor hangs off, and it turns a dead hub row into a real destination. Phases 2–3 are the pure-author screens with no external dependency, so they're quick wins that immediately populate the listing header. Phase 4 is sequenced mid-way because it reaches into the Locations domain (a data-model change) and is the one cross-link with real new editing; doing it after the easy author screens de-risks the schema change. Gallery (5) and safety (6) are independent and can be reordered by demo priority. Phase 7 last — it consumes everything above, so it's only meaningful once the fields exist, and it's the riskiest (touches the consumer surface) so it lands when the config is stable.

Every phase ends green on `npx tsc --noEmit && npx next lint && npm run smoke`, and each new empty/setup state (empty gallery, no booking link, unset hours, "Not listed") carries a smoke needle. Persistence stays session-local Zustand; all new fields are additive so the seed salons and three locations keep rendering.

---

## Cross-cutting data-model changes

New `BusinessProfile` type + `businessProfileStore` (Phase 1), filled across phases:

```
BusinessProfile {
  id; listed: boolean;                                   // Phase 1
  name; tagline; description; logo?; cover?;             // Phase 2
  contact: { phone?; email?; website?; socials: { platform; handle }[] };  // Phase 2
  handle: string;                                        // Phase 3
  gallery: { id; url; caption?; serviceTag?; isCover? }[];  // Phase 5
  safety: { items: { id; label; on }[]; note? };         // Phase 6
}
```

`BusinessLocation` (in `src/lib/types/business.ts`) gains — Phase 4:
- `hours?: WeeklyScheduleDay[]` (reuses the existing schedule type)
- `specialHours?: { id; date; label; closed }[]`
- `addressVisibility?: "full" | "area"`

Read-only consumers (no new storage): cancellation policy reads the existing `CancellationPolicy` / `BusinessDefaults`; the B2C adapter `profileToSalon()` maps the above into the existing `Salon` shape (Phase 7).

All optional / back-compatible — the three seed locations and five seed salons keep rendering. Persistence stays session-local Zustand, seeded from `onboarding2` where identity already exists (`businessName`, `baseAddress`, `hideAddressUntilBooking`).

---

## Open questions for the user

1. **Master "Listed" default** — should a new business default to **Listed** (visible on the marketplace immediately) or **Not listed** until they actively publish? Affects whether onboarding auto-lists.
2. **Profile ↔ Locations ownership of address privacy** — confirm the `addressVisibility` toggle should live in **Locations** (profile read-only), consistent with the 19 May "ties to Locations" note — versus letting it be set inline on the profile for solo/home-based owners who never open Locations.
3. **Editable booking-link handle?** — is the slug (`thattime.app/{handle}`) fixed at signup, or owner-editable (with uniqueness/validation)? Drives Phase 3 scope.
4. **QR in the prototype** — placeholder QR graphic now, or wire a real encoder so the printed code actually resolves? (Affects whether we add a dependency.)
5. **Shop-safety taxonomy** — is there a preferred fixed list of safety/amenity items (accessibility, sanitisation, patch-test, payment types, parking, Wi-Fi…), or should it be a free checklist the owner extends? The 15 Jun note says "shop safety info" without enumerating.
6. **Cancellation cross-link target** — the policy is owned by *Business settings* per the client, but the only cancellation editor in code today is the **per-service** settings picker. Confirm there will be a single **business-level** cancellation setting to deep-link to, or whether profile should summarise the business default that services inherit.
7. **Scope of the B2C wire-up (Phase 7)** — wire only the **owner's own** salon to the config (recommended, keeps the five demo salons intact), or migrate all demo salons to the profile model this pass?
