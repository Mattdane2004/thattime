# Out-of-hours & special pricing — Finalisation Plan

> **Status:** Plan only — no implementation until the open questions below are resolved.
> **Scope:** The **special-pricing** capabilities that hang off a *service*: out-of-hours premium pricing (flat + tiered + per-staff/per-day), the B2C priced-slot display and out-of-hours *request* flow, the calendar manual-booking surcharge prompt, and the **tanning by-the-minute** consumption/balance model. This is **B2B** (`/app`, `/new`) unless a B2C touchpoint (`/c`) is explicitly flagged.
> **Out of scope this pass:** general dynamic/surge pricing and any algorithmic "market rate" (the client explicitly wants owner-set prices, never a black box — 26 May); the full **waitlist** product as its own surface (we hang an out-of-hours request *onto* the existing waitlist affordance, not rebuild it); the running-late **cascade engine** itself (we add the service-type *flag* that the cascade will read — the calendar cascade is a separate section); real bed-timer / T-Max hardware integration for tanning (back-of-house; the app owns balance + scan-to-start/stop + deduction only — 27 May).
> **Builds on:** `service-finalisation-plan.md` — out-of-hours is modelled as a **service variation**, reusing the variants architecture (`OfferVariant`, `VariantPrice`, `VariantWhen`) that already exists, **not** a team-member setting (2 Jun). Read that plan's Phase 4 (variants) first; this plan extends the same `variants/page.tsx` surface.
> **Source of truth for feedback:** five Granola sessions with Shabbir & Vishal — *"That Time Product alignment"* (26 May, 2 Jun, 9 Jun), *"That time Services catchup"* (27 May), and *"that time sign off"* (15 Jun). Design patterns are cited to Mobbin.

---

## What this section is

Out-of-hours & special pricing lets a salon sell the **same service at a different price** depending on *when* it runs and *who* delivers it — an early-morning PT slot at a premium, a Friday-only late cut for one barber — and to take **negotiated** out-of-hours bookings when nothing is published. It is not a new offer type: it lives on the existing service inside the **Variants** surface of `/app/services/[id]`, so the catalogue and reporting stay clean. It also covers a distinct **consumption** model — tanning sold *by the minute* against a balance — which is a third pricing shape a service can adopt. The owner configures it in one place; the customer sees the resulting price on the slot, before checkout.

---

## Feedback → source map

| Area | Feedback | Source | Pattern ref |
|---|---|---|---|
| Premium principle | Sell services *outside* normal hours at a premium | 26 May, 2 Jun, 15 Jun | — |
| Flat model | A flat surcharge on the standard price (+£ or +%) | 26 May | [Fresha smart pricing](https://mobbin.com/screens/f40214c4-e79e-4b55-9440-551fb622620c) · [Turo Adjust/Set](https://mobbin.com/screens/e32e8c92-5a30-432a-8822-63bf9d5c3045) |
| Tiered model | Tiered by time slot — "5am £100, 6am £90… scaling down"; "6-7 +£10, 7-8 +£20" | 26 May | [Peerspace attendee tiers](https://mobbin.com/screens/5e8b31ef-3cae-4a37-a343-097e3f063580) · [Tesla colour-band timeline](https://mobbin.com/screens/f40214c4-e79e-4b55-9440-551fb622620c) |
| Lives as a variation | Implement as **service variations**, not team-member settings | 2 Jun | [Fresha variant sheet](https://mobbin.com/screens/162c07cb-61fc-48aa-962d-bf25e8df7a45) |
| Per-staff / per-day | "Shabbir 6-7 +£10, 7-8 +£20; Mathew 6-7 only +£5"; "Simon out-of-hours Fridays only" | 2 Jun | [Fresha per-staff pricing](https://mobbin.com/screens/0bb10804-5a32-4526-866a-5a548fb3e9ae) |
| Single config point | One configuration surface, not scattered across screens (old-app complaint) | 26 May | [Fresha advanced pricing](https://mobbin.com/screens/162c07cb-61fc-48aa-962d-bf25e8df7a45) |
| Scope WHEN | Define which days + which hours count as out-of-hours | 26 May | [Peerspace day-pills + time window](https://mobbin.com/screens/cfc7da85-81bb-4e26-a4b4-0d60cb445e6b) |
| B2C priced slots | Show time slots **with prices**, *before* checkout (Fresha carousel/time-list) | 26 May | [Walmart right-aligned prices](https://mobbin.com/screens/ee30397c-0ad5-4363-a82f-c7d29832113c) · [Airbnb struck-through slot](https://mobbin.com/screens/5c774bce-f033-450d-86e0-ed6f3ba320d8) · [Grab two-column slots](https://mobbin.com/screens/9d326c10-b89a-43f9-a7d1-31119dbd4639) |
| B2C request | Customer **requests** out-of-hours when no slot exists; suggests a premium **or** salon quotes | 26 May | [Fresha "Join the waitlist"](https://mobbin.com/screens/9ed7eb7a-41ca-4528-a891-9ffb44f60dcf) · [Airbnb "Request availability"](https://mobbin.com/screens/68993152-1897-48d1-a6c3-55f0d9e7f9c7) |
| Link to waitlist | "Join the waitlist, out-of-hours premium" — unify request + waitlist | 26 May | [Fresha waitlist link](https://mobbin.com/screens/9ed7eb7a-41ca-4528-a891-9ffb44f60dcf) |
| Owner request inbox | Triage incoming requests by premium offered; accept or counter-quote | 26 May | [Vagaro "Money Maker" waitlist](https://mobbin.com/screens/9ed7eb7a-41ca-4528-a891-9ffb44f60dcf) |
| Calendar dependency | Manually create an out-of-hours appointment → select it and apply a surcharge | 15 Jun | [Turo Adjust/Set sheet](https://mobbin.com/screens/e32e8c92-5a30-432a-8822-63bf9d5c3045) |
| Running-late caveat | Fixed-duration services (PT) can't absorb delay → a service-type override (cross-link Settings) | 15 Jun | — |
| Tanning by-the-minute | Buy minutes (buy 60, use 10/session, return for top-ups), barcode scan to start/stop & auto-deduct | 27 May | [Lime scan-to-ride rate](https://mobbin.com/screens/a93c3a09-1203-4b42-a6ac-86b9b369d05d) · [Bird scan rate](https://mobbin.com/screens/105efc71-390f-4ace-aced-5f5ff5206208) · [ClassPass credit bundles](https://mobbin.com/screens/4645305e-efbc-4589-ac3e-03e9448e0e89) |

---

## Current state

**Status legend:** done · partial · missing. *(Verified by reading the repo — file paths cited.)*

- **Variants architecture — `partial` (strong foundation).** `src/lib/data/offers.ts` already defines `OfferVariant` with `type: "duration" | "time" | "staff" | "location" | "role"`, a shared `VariantPrice { mode: "add"|"discount"; unit: "fixed"|"percent"; amount }`, and `VariantWhen` (staff/days/time/location restrictions). This is *exactly* the substrate for out-of-hours as a variation — there is **no** `"out_of_hours"` framing or by-the-minute model yet.
- **Variants module — `partial`.** `src/app/app/services/[id]/variants/page.tsx` is a complete module: type-picker empty state, a multi-tier `DurationSetup` with an *"Add another tier"* button, a `TimeSetup` (day pills + time window + price adjust), an `EntityList` for per-staff/location/role pricing with edit sheets, plus a search box + filter pills. Shared parts in `variantParts.tsx`: `PriceAdjust` (Add/Discount + £/% with a *"Client pays"* live preview), `DayPills`, `WhenBlock`. **Missing:** the out-of-hours model picker, the tiered time-**band** rows (the existing "time" variant is a single rule, not a band ladder), the colour-banded 24h preview, the per-staff × tier matrix, and per-staff availability.
- **Calendar surcharge — `partial` (notably ahead).** `src/components/app/QuickActions.tsx` ("Add Appointment") **already** detects an out-of-hours slot and shows an *"Out-of-hours surcharge"* toggle with a manual £ field, line-itemed into the review and total. `src/lib/store/appStore.ts` `customAppts` carries `outOfHours?: boolean`. **Missing:** it does not read any *rule* from the service — the surcharge is always typed by hand, and the amount is not persisted on the appointment.
- **Schedule rendering — `done` (enough for now).** `src/app/app/schedule/page.tsx` already renders condensed "Out of hours" bands top/bottom of the day grid and tags after-hours appointments "OOH". No pricing surfaced here, which is correct — pricing lives on the appointment sheet.
- **Service settings — `partial`.** `src/app/app/services/[id]/settings/page.tsx` is a clean picker-sheet pattern persisting `OfferSettings`. **Missing:** any "service type" / fixed-duration concept for the running-late caveat.
- **B2C time picker — `missing` (prices).** `src/app/c/salon/[id]/book/page.tsx` step 3 picks a date (`MiniCalendar`) then a time (`TimeChips`/`timeSlots` from `src/components/ui/molecules/MiniCalendar.tsx`) with daypart filter chips. Slots show **no price**, no struck-through premium, no "Out of hours" tag, and there is **no** "Request out-of-hours" link. The class path shows a static "Waitlist" pill on full sessions but no request flow behind it.
- **B2C wallet / passes — `partial`.** `src/app/c/settings/wallet/page.tsx` has a balance hero + a "Your passes" list — the natural host for a tanning **minute balance**, but no minute concept exists.
- **No data, no store, no surface** for: out-of-hours requests (the inbox), the request→quote negotiation, or the minute-balance ledger.

---

## Recommended UX calls

Opinionated decisions where the feedback left gaps — tagged `[ASSUMPTION]` (designer's call, build it) or `[OPEN — needs user decision]` (carried to Open questions).

1. **One model picker, three shapes.** When the owner toggles *"Offer out of hours"* on, ask **one** question — *"How do you want to price it?"* → **Flat** / **Tiered**. The third shape, **By the minute (balance)**, sits at the *top* of the variants type list as a service-wide pricing mode (it changes how the whole service is sold, not a time window), not inside the out-of-hours toggle. `[ASSUMPTION]` This keeps the simple path (flat surcharge) one tap, and stops tanning being confused with out-of-hours.

2. **Reuse, don't reinvent, the existing variant primitives.** Out-of-hours is a new `OfferVariant` shape (`type: "out_of_hours"`), priced with the existing `VariantPrice`, scoped with `DayPills` + the existing time-window inputs, and restricted with the existing `WhenBlock`. The tiered ladder reuses the `DurationSetup` *"Add another tier"* repeatable-row pattern. `[ASSUMPTION]`

3. **Surge jargon is banned everywhere.** The owner sees *"out of hours"*, *"early/late"*, *"premium"* — never "surge", "peak", "dynamic". The customer sees a price and a small "Out of hours" tag, with the base price struck through. `[ASSUMPTION]` (Anti-pattern from the brief; matches Fresha's "customer never sees surge".)

4. **Per-staff overrides are progressive disclosure, collapsed by default.** Most owners want one flat surcharge. *"Different per team member?"* opens a compact **staff × tier matrix** with a per-staff *"out-of-hours availability"* toggle (e.g. Simon: Fridays only). `[ASSUMPTION]` Never the default screen (anti-pattern: don't expose the matrix to everyone).

5. **The colour-banded 24h bar is the tiered-pricing hero.** Borrow the Tesla time-of-use bar as a read-only preview under the tier rows so a non-technical owner *sees* the shape of their pricing. `[ASSUMPTION]` Build it as a token-coloured SVG/CSS bar (no inline hex), reusable as a B2C legend later.

6. **Requests and waitlist are one thing.** A single request: pick time(s), then *either* "Suggest what you'd pay" *or* "Ask the salon to quote", with a tickbox *"Join the waitlist if a regular slot frees first"*. One owner inbox, sortable by premium offered. `[ASSUMPTION]` (Unify per the anti-pattern; "Money Maker" default sort.)

7. **No payment at request stage.** Out-of-hours is a negotiation; capture payment only when the salon accepts/quotes and the customer confirms. `[ASSUMPTION]`

8. **Tanning minute balance lives in the consumer wallet; scan-to-start is a staff/kiosk action.** The customer's minute balance shows in `/c` wallet alongside passes; starting/stopping the bed timer is an owner-side action keyed off a barcode. Live bed control is out of scope — the app does balance + scan + deduction. `[ASSUMPTION]`

9. **Out-of-hours request acceptance creates a calendar appointment.** When the owner accepts/quotes and the customer confirms, the booking lands as an out-of-hours appointment with its surcharge as a line item — reusing the calendar surcharge work, so online and manual bookings render identically. `[ASSUMPTION]`

10. **Where does the out-of-hours *window* live — service or business?** `[OPEN]` The brief defines the window per service (the variant scopes its own days/hours). But "outside opening hours" in the calendar prompt implies a *business* opening-hours record. Recommended: the variant carries its own window for *pricing*, and the calendar prompt reads business opening hours for *detection* — but business opening hours may not be a first-class record yet. Carried to Open questions.

---

## Phase 1 — Out-of-hours as a service variation (flat + tiered)

**Goal:** A single configuration point on the service that turns on out-of-hours pricing, asks one model question, and supports both flat and tiered pricing — the core of 26 May / 2 Jun. No per-staff matrix yet (Phase 2).

**Flow:**
1. **Entry.** From `/app/services/[id]` → Variants (existing module). Add an **"Out of hours"** row at the top of the type picker (above Duration), with a clock-moon icon and copy *"Charge a premium for early or late bookings."* (Existing `TYPES` array in `variants/page.tsx`.)
2. **Toggle + model picker.** The out-of-hours setup screen opens with a single toggle *"Offer this service out of hours"*. On → reveal one question, *"How do you want to price it?"*, as two cards: **Flat surcharge** / **Tiered by time slot**.
3. **Scope WHEN.** A `DayPills` row (Mon–Sun) + start/end time inputs define the out-of-hours window (e.g. Mon–Fri 06:00–08:00, Sat all day). Reuse the `TimeSetup` day-pills + time-window block.
4. **Flat path.** A single `PriceAdjust` (the existing Add + £/% control) on top of the base price, with the live *"Base £40 → Out of hours £50"* preview (extend the existing "Client pays" line into a before→after row).
5. **Tiered path.** Repeatable tier rows reusing the `DurationSetup` *"Add another tier"* pattern — each row = a time band + a surcharge (`06:00–07:00 +£10`, `07:00–08:00 +£20`). Bands must be non-overlapping (validate on save). Below the rows, render the **colour-banded 24h preview bar** (new component) so the owner sees the price shape.
6. **Save → summary.** A confirmation card shows the resulting price table (band → price), and the out-of-hours variant now exists and is bookable. The variants list row reads *"Out of hours · Mon–Fri 6–8am · from +£10"*.

**Changes:**
- `src/app/app/services/[id]/variants/page.tsx` — add `"out_of_hours"` to `TYPES` and the view machine; new `OutOfHoursSetup` screen (toggle → model cards → WHEN scope → flat/tiered body → summary).
- `src/app/app/services/[id]/variantParts.tsx` — add a `BeforeAfterPrice` helper (base → premium) and a `PriceBandBar` colour-banded 24h preview (token colours only). Extend `variantDetail`/`priceDisplay` to label out-of-hours rows.
- `src/components/ui/**` — if `PriceBandBar` is reusable on B2C (Phase 4 legend), promote it to the barrel + add a `smoke.tsx` needle. Otherwise keep it screen-local.
- `smoke.tsx` — add a needle rendering the out-of-hours empty/setup state.

**Data:** extend `VariantType` with `"out_of_hours"`; add an `OutOfHours` shape to `OfferVariant` — `tiers?: { from: string; to: string; price: VariantPrice }[]` (tiered) reusing `VariantPrice` for the flat single value, and reuse `days`/`timeFrom`/`timeTo` for the window. All additive; the 23 seed offers keep rendering untouched.

**Risk:** medium — the model picker + tiered bands + the colour bar are new, but every input primitive already exists.

---

## Phase 2 — Per-staff & per-day overrides (progressive disclosure)

**Goal:** Satisfy "Shabbir 6-7 +£10, 7-8 +£20; Mathew 6-7 only +£5" and "Simon out-of-hours Fridays only" (2 Jun) — without cluttering the simple path.

**Flow:**
1. On the out-of-hours setup screen, a **collapsed** row: *"Different per team member? (optional)"*. Most owners never open it.
2. Open → a compact **staff × tier matrix**: rows are bookable team members (from `useTeamStore`, as `EntityList` already does), columns are the tiers defined in Phase 1, each cell an editable surcharge (defaulting to the base tier value, struck if overridden).
3. Each staff row has a small **availability** control — *"Out of hours: all days / specific days"* — reusing `DayPills`, so "Simon: Fridays only" is one tap-set.
4. Save → the matrix collapses back to a summary (*"3 staff customised"*); per-staff variants persist as overrides on the out-of-hours variant.

**Changes:**
- `variants/page.tsx` — a `StaffTierMatrix` sub-component inside `OutOfHoursSetup` (reuse `EntityList`'s member-loading + `initialsOf`).
- `variantParts.tsx` — a compact matrix cell input (smaller `PriceAdjustCompact` already exists for duration tiers — generalise it).

**Data:** the out-of-hours variant gains `staffOverrides?: Record<staffId, { tiers?: {...}[]; price?: VariantPrice; days?: string[]; available: boolean }>`. Additive; absent = follows the base out-of-hours rule.

**Risk:** medium — the matrix is the densest UI in the section; keep it collapsed by default and constrained (no free-form bands per staff — they inherit the Phase 1 band boundaries).

---

## Phase 3 — Calendar manual booking: rule-driven surcharge

**Goal:** Close the 15 Jun calendar dependency — when an owner manually books an out-of-hours slot, the **matching rule** auto-fills the surcharge (today it is typed by hand).

**Flow:**
1. Owner opens "Add Appointment" (existing `QuickActions.tsx`) and picks a time outside hours → the existing *"Out-of-hours surcharge"* card appears.
2. **New:** if the chosen service has an out-of-hours rule covering that day/time (flat or the matching tier, including the selected staff's override), the surcharge **auto-fills** and is editable, with a caption *"Matched your Mon–Fri 6–7am rule (+£10)"*.
3. If no rule exists, fall back to today's behaviour — a one-off manual surcharge field.
4. Save → the appointment carries base + surcharge as line items (already rendered in review), and the surcharge amount persists.

**Changes:**
- `src/components/app/QuickActions.tsx` — read the selected offer's out-of-hours variant; compute the matching surcharge for `(day, time, staff)`; pre-fill `surcharge`; add the "matched rule" caption.
- `src/lib/store/appStore.ts` — `customAppts` / `addCustomAppt` gain `surcharge?: string` so the applied premium persists (today only the `outOfHours` boolean is stored).
- A small shared `matchOutOfHoursSurcharge(offer, day, time, staffId)` selector (co-locate with offers data, e.g. `src/lib/data/offers.ts` or a new `src/lib/data/pricing.ts` — grep first).

**Data:** `customAppts` `+ surcharge?: string`. Detection of "outside hours" reuses the existing logic in `QuickActions` (and see Open question on business opening hours).

**Risk:** low–medium — the UI is built; this is wiring rule-matching into it.

---

## Phase 4 — B2C: priced slots before checkout

**Goal:** The 26 May requirement — show the price **on each slot**, before checkout, with the premium self-explanatory. B2C (`/c`, coral).

**Flow:**
1. Customer picks service (+ optional staff, whose out-of-hours override follows them) → date.
2. **Time step (rebuilt).** Each slot in an out-of-hours window shows a **right-aligned price** (Grab/Walmart) with the base struck through → premium price (Airbnb) and a small "Out of hours" tag. In-hours slots show the plain base price (or nothing if all-base, to keep it scannable).
3. A one-line legend / colour cue (the Phase 1 `PriceBandBar` reused as a B2C legend) so the premium reads as intentional, not an error. Price updates live when the customer changes staff or time.
4. Tapping a premium slot carries a confirm line — *"6:30am · out of hours +£10"* — into the review step.
5. **Checkout** shows the itemised premium (base + out-of-hours surcharge) before payment — extend the existing review `PriceLine` rows.

**Changes:**
- `src/components/ui/molecules/MiniCalendar.tsx` — `TimeChips`/`timeSlots` gain an optional per-slot `price` / `basePrice` so a slot can render struck-through → premium + tag (coral variant). Keep the B2B/ink default unchanged; add a `tone` prop per the design-system rule.
- `src/app/c/salon/[id]/book/page.tsx` — step 3 reads the offer's out-of-hours variant and computes per-slot prices; pass them to the slot list; carry the chosen slot's premium into the review (step 4) and the checkout payload (`/c/checkout`).
- `smoke.tsx` — a needle for the priced-slot time step.

**Data:** none persisted — derived from the offer's out-of-hours variant at render. (B2C reads the same `DemoOffer` via `src/lib/data/b2c.ts`; confirm the variant is surfaced through that adapter — see Open questions.)

**Risk:** medium — touches a shared UI molecule (`MiniCalendar`) used on both surfaces, so the `tone`/optional-price props must be strictly additive.

---

## Phase 5 — B2C out-of-hours request + owner inbox (unified with waitlist)

**Goal:** The two-way request (26 May) — customer suggests a premium **or** salon quotes — entered where the customer hits a wall, triaged in one owner inbox, with no payment until acceptance.

**Flow (B2C request):**
1. On the time step, when **no** out-of-hours availability is published, show *"Can't find a time? Request out of hours"* directly under the slot list (Fresha "Join the waitlist" position).
2. **Request sheet:** desired date/time(s) + service + optional preferred staff. Then a two-way price step — *"Suggest what you'd pay"* (enter a premium) **or** *"Ask the salon to quote"* — plus a tickbox *"Join the waitlist if a regular slot frees up first"*.
3. **Confirmation:** *"Request sent — [salon] will respond with availability and an out-of-hours price."* No payment taken.
4. Customer notification: accept the quote → an out-of-hours appointment is created and payment captured (reuses Phase 3 line-items). Decline → request closes.

**Flow (B2B owner inbox):**
5. Incoming requests land in a **queue** in the team/schedule area, sortable by **premium offered** (Vagaro "Money Maker" default). Each shows the customer, requested slot, and their suggested premium (or "awaiting your quote").
6. Owner **accepts** at the customer's price, or **counter-quotes** an amount → the customer is notified.

**Changes:**
- `src/app/c/salon/[id]/book/page.tsx` — the "Request out of hours" link + request sheet (compose from `Sheet`, `DayPills`/`MiniCalendar`, `DarkButton`). Reuse the existing class-path "Waitlist" affordance so requests and waitlist share one entry.
- A new B2B inbox surface — recommend a tab/section under `/app/schedule` or `/app/inbox` (grep `src/app/app` for an existing requests/inbox surface before creating). Sortable list + accept/counter sheet.
- `src/lib/store/**` — a new `requestsStore` (session-local Zustand) or a slice on `appStore` (grep first — one source of truth per domain).
- `smoke.tsx` — needles for the request sheet empty state and the owner inbox empty state.

**Data:** new `OutOfHoursRequest { id; salonId; offerId; staffId?; slots: { day; time }[]; mode: "suggest" | "quote"; suggestedPremium?: string; quotedPremium?: string; joinWaitlist: boolean; status: "pending" | "quoted" | "accepted" | "declined"; createdAtLabel: string }`. **SSR-safe:** no clock/random at module/render top level — use a seeded label and `nextId` (the codebase's existing id helper).

**Risk:** medium–high — the largest new surface; two flows (B2C request + B2B inbox) and a negotiation state machine.

---

## Phase 6 — Tanning by-the-minute (consumption / balance redemption)

**Goal:** The 27 May special model — buy minutes, redeem per session, scan to start/stop, auto-deduct. A third pricing shape on a service. Few platforms offer this; treat it as a distinct **pricing model option**, not out-of-hours.

**Flow:**
1. **Setup (B2B).** In the Variants type picker, a **"By the minute (balance)"** option at the top (it changes how the whole service sells). Owner sets **price per minute** and sells **minute bundles** (ClassPass top-up pattern — *"60 min £30, 120 min £55"*) with optional expiry / rollover. Validation: a by-the-minute service can't also carry duration/time variants (mutually exclusive — guard in the type picker).
2. **Purchase (B2C).** Customer buys a minute bundle; a persistent **"Minutes remaining"** balance shows in `/c` wallet next to passes.
3. **Session start.** At the bed, **scan the equipment barcode** to start the timer (Lime/Bird scan-to-start) with the per-minute rate shown; a live timer runs. (Owner/kiosk action.)
4. **Session end.** Stop/scan to end → minutes used auto-deduct from the balance; a receipt shows minutes used + balance left. Supports partial use and return top-ups (buy 60, use 10, come back).
5. **Low-balance nudge** prompts a re-purchase.

**Changes:**
- `variants/page.tsx` — a `ByTheMinuteSetup` screen (price/min + bundle rows reusing the *"Add another tier"* repeatable pattern, with optional expiry/rollover toggles).
- `src/app/c/settings/wallet/page.tsx` — a "Minutes" balance card + bundle top-up sheet (reuse the existing "Add funds" `Sheet` pattern).
- A **scan-to-start** screen (owner/kiosk) — a barcode-scan affordance (mock scanner — no camera dependency in the prototype, per the mock-map precedent in `service-finalisation-plan.md`), upfront rate disclosure, prominent start/stop, live timer (SSR-safe: timer starts on a user action, never at render).
- `smoke.tsx` — needles for the by-the-minute setup, the minutes balance card, and the scan/timer empty state.

**Data:** `DemoOffer` gains `pricingModel?: "standard" | "by_minute"` and `byMinute?: { pricePerMinute: string; bundles: { minutes: number; price: string }[]; expiryDays?: number; rolloverMins?: number }`. A consumer `minuteBalance?: { offerId; minutesRemaining: number }[]` on the client user / wallet. Sessions are ephemeral (started by action) — no persisted live timer.

**Risk:** medium — conceptually distinct and self-contained; the riskiest part is keeping it cleanly separate from out-of-hours so the model picker stays legible.

---

## V2 / deferred

- **Business opening-hours record.** If there is no first-class opening-hours model (see Open questions), the calendar "outside hours" detection stays heuristic (`WORK_START`/`WORK_END` constants in `schedule/page.tsx`). *Direction:* a proper `businessHours` setting in the (to-build) business Settings section, read by both the calendar prompt and the B2C slot generator. Defer until Settings lands.
- **Running-late cascade engine.** This plan adds only the **service-type flag** (a fixed-duration / "can't absorb delay" marker) and an inline note linking to Settings (15 Jun). *Direction:* add `serviceType?: "flexible" | "fixed_duration"` to `OfferSettings`, surfaced as a settings row with copy *"This service can't absorb running-late delays."* The cascade computation that *reads* the flag belongs to the calendar/running-late section — defer the engine, ship the flag in Phase 1 or as a fast follow.
- **Counter-quote negotiation thread.** Phase 5 supports one accept/counter round. *Direction:* a lightweight message thread per request (back-and-forth haggling) — defer; one round covers the demo.
- **Per-location out-of-hours.** The variant `WhenBlock` can already scope locations, but a full per-location × per-staff × per-tier cube is over-build. *Direction:* keep per-staff + per-day in v1; add per-location only if a multi-site client asks.
- **Real barcode / T-Max bed-timer integration.** *Direction:* back-of-house hardware; the prototype mocks the scan. Defer all hardware.
- **Off-peak *discounts*.** The same variant shape supports a *discount* (cheaper quiet-hour slots) via `VariantPrice.mode = "discount"`. *Direction:* expose an "Off-peak (cheaper)" sibling to out-of-hours once the premium path is signed off — the data already supports it.

---

## Suggested order & rationale

`1 (out-of-hours flat+tiered) → 2 (per-staff matrix) → 3 (calendar rule-fill) → 4 (B2C priced slots) → 5 (request + inbox) → 6 (tanning by-the-minute)`

Phase 1 first because it is the spine — every other phase reads the out-of-hours variant it defines (the calendar prompt, the B2C slots, the request acceptance all need a rule to exist). Phase 2 deepens the same screen while it's fresh. Phase 3 is a low-risk win that makes the already-built calendar surcharge *smart*. Phase 4 is the customer-visible payoff and the client's headline ask ("show the price on the slot"). Phase 5 is the largest new surface, sequenced once slots exist so the request link has a natural "nothing fits" home. Phase 6 (tanning) is last because it is orthogonal — a distinct pricing model that touches the wallet, not the out-of-hours machinery — and can slip without blocking the out-of-hours sign-off.

Every phase ends green on `npx tsc --noEmit && npx next lint && npm run smoke`, with a smoke needle for each new empty/setup state. Persistence stays session-local Zustand; all new offer/entity fields are additive so the seed catalogue keeps rendering. No clock/random/`window`/`document` at module or render top level.

---

## Cross-cutting data-model changes

Additive / back-compatible — the 23 seed offers and existing variants keep rendering.

- `VariantType` → `+ "out_of_hours"` (Phase 1).
- `OfferVariant` → `+ tiers?: { from; to; price: VariantPrice }[]`, `+ staffOverrides?: Record<staffId, { tiers?; price?; days?; available: boolean }>` (Phases 1–2). Flat out-of-hours reuses the existing `price`/`days`/`timeFrom`/`timeTo`.
- `appStore.customAppts` / `addCustomAppt` → `+ surcharge?: string` (Phase 3).
- `MiniCalendar` `TimeChips`/`timeSlots` → optional per-slot `price`/`basePrice` + `tone` (Phase 4 — strictly additive, ink default unchanged).
- New `OutOfHoursRequest` type + a `requestsStore` slice (Phase 5).
- `DemoOffer` → `+ pricingModel?: "standard" | "by_minute"`, `+ byMinute?: { pricePerMinute; bundles[]; expiryDays?; rolloverMins? }`; consumer `+ minuteBalance?` on the wallet (Phase 6).
- `OfferSettings` → `+ serviceType?: "flexible" | "fixed_duration"` (running-late flag; Phase 1 fast-follow / V2).

---

## Open questions for the user

1. **Out-of-hours window — per service or per business?** The variant scopes its own days/hours for *pricing*, but the calendar "outside opening hours" prompt implies a **business opening-hours** record. Is there one (or should the calendar keep using the heuristic `WORK_START`/`WORK_END` in `schedule/page.tsx`) until the business Settings section lands? *(Recommended decision call 10.)*
2. **Owner request inbox — where does it live?** A tab under `/app/schedule`, the existing `/app/inbox`, or a new section? (Need to confirm whether a requests/inbox surface already exists before creating one — one source of truth per domain.)
3. **Default request sort.** Confirm "Money Maker" (highest premium first) as the default owner triage order, vs first-come-first-served.
4. **Tiered band granularity.** Fresha's smart pricing uses 5-minute granularity. Is whole-hour (or 30-min) bands enough for the salon use-case ("6-7 +£10, 7-8 +£20"), keeping the colour bar and rows simple?
5. **Tanning balance ownership.** Does the minute balance belong to the **customer** (cross-salon, like the wallet) or is it **per salon**? The brief implies per-salon (scan that bed); confirm before modelling `minuteBalance`.
6. **Running-late flag — ship in Phase 1 or defer with the cascade?** The flag is tiny and the 15 Jun caveat is explicit; recommend shipping the `serviceType` flag + Settings note now and leaving the cascade engine to the calendar section. Confirm.
7. **B2C variant surfacing.** B2C reads offers via `src/lib/data/b2c.ts` — do out-of-hours variants flow through that adapter today, or does the adapter need extending so the consumer time step can compute premiums? *(Verify before Phase 4.)*

*Implementation begins once these are answered. Recommended first build: **Phase 1 (out-of-hours flat + tiered).***
