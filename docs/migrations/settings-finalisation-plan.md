# Business Settings & Rules — Finalisation Plan

> **Status:** Plan only — no implementation until the open questions below are resolved.
> **Scope:** A new **Business settings** hub in the B2B business app (`/app`) and the rules it houses — the global **booking-rule defaults** (lead time, max advance, buffers, who-can-book, reschedule limit), the **cancellation & deposit** deep-dive, the **block/unblock-day** fix, the **running-late** cascade rule (the *settings* that govern the existing day-of action), the **"I'm ready"** notification, and the **single config point** for out-of-hours. It also defines the **global-default → per-service-override** contract that the existing `services/[id]/settings` sheet already half-implements.
> **Out of scope this pass:** out-of-hours *pricing* (the premium/surcharge model is owned by `out-of-hours-finalisation-plan.md` as a service variation — Settings only owns the toggle + per-service opt-in and cross-links to it); **per-location opening hours** (owned by `locations-finalisation-plan.md` Phase 5 — hours are a property of a *place*, Settings cross-links and does not re-own them); the day-of running-late **UI** itself (already shipped in `UpNextCard`/`AppointmentSheet` — Settings adds the *rule* it reads); Stripe/payments settlement; integrations; legal/written policies text.
> **Source of truth for feedback:** Granola sessions with Shabbir & Vishal — *"that time sign off"* (15 Jun, id `d72564d7…`), *"That Time Product alignment"* (26 May `8030fb2b…`, 2 Jun `8a71b7ce…`, 9 Jun), and internal *"TT planning"* (16 Jun `63cc3d9e…`). Design patterns are cited to Mobbin.
> **Builds on:** `service-finalisation-plan.md` Phase 9 (the per-service settings sheet + 7 pickers), `out-of-hours-finalisation-plan.md` (premium pricing + the fixed-duration service flag the cascade reads), `locations-finalisation-plan.md` Phase 5 (opening hours), and the existing day-of `lateBy`/`readySent` model in `appStore.ts`.

---

## What this section is

Business settings is the **top-level hub that answers "what are the rules of this business?"** — the global defaults that every service inherits unless it overrides them. Today the only settings surface is buried *inside a service* (`/app/services/[id]/settings`); there is no business-level home, which is the gap Shabbir & Vishal flagged as "only basic work done, needs a dedicated session" (15 Jun). It sits in the **Hub → Setup** menu under the existing **"Business settings"** row (a dead button today, `hub/page.tsx` line 48) and holds four kinds of rule: **opening hours & availability** (mostly cross-links to Locations/Out-of-hours), **booking rules** (the global defaults), **cancellations & deposits** (a proper policy deep-dive), and **day-of-service rules** (running-late + "I'm ready"). It is deliberately a thin orchestration layer: it owns the *defaults* and the *block/unblock* model, and cross-links to the sections that own the heavier machinery (pricing, hours, the day-of action).

---

## Feedback → source map

| Area | Feedback | Source | Pattern ref |
|---|---|---|---|
| Dedicated session | Settings had only basic work; needs a dedicated pass with a proper IA | 15 Jun | [Peerspace — 'Rules and policies' value-row list](https://mobbin.com/screens/32f1ba47-4211-4cd1-9145-ed2d794579d5) |
| Settings hub IA | One scannable hub of grouped rule-rows, each showing its live value as a subtitle, drilling into an editor | 15 Jun, 16 Jun | [Peerspace — value-rows](https://mobbin.com/screens/32f1ba47-4211-4cd1-9145-ed2d794579d5) · [Shopify — 'Policies' hub + status badges](https://mobbin.com/screens/0952ecf9-035f-4a64-9268-f3a9d9d876ed) |
| Plain-language rules | Phrase each rule as the owner's question + a recommendation, not jargon | 15 Jun | [Airbnb — 'Availability' plain-language rows](https://mobbin.com/screens/e8afb368-d852-41e6-8add-2dd5723aec10) · [Airbnb — 'Booking settings' with rationale](https://mobbin.com/screens/eb16eb0c-464a-42ac-b6de-023577cf51f8) |
| Out-of-hours single config | One config point for out-of-hours availability + pricing; cross-link the out-of-hours plan | 26 May | [Calendly — Weekly hours / Date overrides tabs](https://mobbin.com/screens/247a602a-5644-4af5-bc40-99ded95406ca) |
| Running-late cascade | "Running late" picks 5/10/15 min → cascades next 1/2/3 clients, shifts diary, notifies them | 15 Jun | [Flighty — live 'X min late' shifting downstream times](https://mobbin.com/screens/86c75588-3c6a-416f-8be3-19bc7e62805f) |
| Fixed-duration exception | A 60-min PT can't absorb 5 min → settings rule / per-service-type override; exclude fixed-duration by default | 15 Jun | [Acuity — soft-warn the owner, hard-block the public](https://mobbin.com/screens/86c75588-3c6a-416f-8be3-19bc7e62805f) |
| "I'm ready" action | An "I am ready" action notifying the waiting client they can come in | 15 Jun | [Flighty — status communication](https://mobbin.com/screens/86c75588-3c6a-416f-8be3-19bc7e62805f) |
| Block/unblock-day fix | Accidentally unblocking part of an off-day leaves it publicly bookable; "add a block on top" is rejected — design the correct UX | 15 Jun | [Turo — 'Block availability' as a managed object + state badges](https://mobbin.com/screens/63d15f93-78ac-4229-891f-f96f7a7e9dfe) · [Turo — block date/time picker](https://mobbin.com/screens/80e4e416-9c05-40f0-adff-f768c31102c0) · [Peerspace — 'Block time'](https://mobbin.com/screens/f4eab4c1-1b5b-4c01-8b11-0284048c4367) |
| Cancellation deep-dive | Proper windows + fees + deposit-forfeit at business level + per-service override | 26 May, 15 Jun | [Careem — tiered cancel/reschedule fee table + grace period](https://mobbin.com/screens/dc20199c-90fd-4af3-8806-b19cfc868e1c) · [Fresha-style deposit field list](https://mobbin.com/screens/0952ecf9-035f-4a64-9268-f3a9d9d876ed) |
| Policy preview | Make the policy legible — a colour-graded refund timeline, not legal text | 26 May | [Vrbo — colour-graded refund timeline](https://mobbin.com/screens/f65c7c5a-e5be-4a9d-9978-c0b9011dc7c6) · [Airbnb — two-row read-back](https://mobbin.com/screens/52f35d98-0c1c-4f6f-b971-19c3f15396a5) · [Airbnb — cutoff/check-in nodes](https://mobbin.com/screens/155d1353-a9e7-41be-af05-9450a6208d57) |
| Reschedule limit | Reschedule limit lives *with* cancellation (same mental model), not as an orphan | 15 Jun | [Careem — reschedule cap footnote](https://mobbin.com/screens/dc20199c-90fd-4af3-8806-b19cfc868e1c) |
| Deposit fields | Deposit % or fixed; refundable-until vs non-refundable; auto-cancel unpaid in 1–72h | 26 May, 15 Jun | [Shopify — return-rule radio engine + restocking fee](https://mobbin.com/screens/07c7e589-675d-4cc1-b742-75f5b897688e) |
| General booking rules | Lead time, max advance, buffers, who-can-book, reschedule limit — decide business default vs per-service override | 15 Jun | [Linktree — buffer/min-notice/allow-up-to field set](https://mobbin.com/screens/34e1efc7-cebf-4deb-8b44-e6218737aae5) |
| Buffer is per-service | Buffer & availability are legitimately per-service → an override layer is correct | 15 Jun | [Acuity — per-service buffer/padding](https://mobbin.com/screens/34e1efc7-cebf-4deb-8b44-e6218737aae5) |
| Hours model | Recurring weekly pattern + one-off date overrides; per-day toggle + split shifts | (Locations 19 May, 2 Jun) | [Calendly — Weekly/Date-overrides + split-shift '+'](https://mobbin.com/screens/247a602a-5644-4af5-bc40-99ded95406ca) · [OpenPhone — enable toggle + 'Closed all day'](https://mobbin.com/screens/72182039-391a-4fd8-9f5f-6f987e6bd15b) |

---

## Current state

**Status legend:** done · partial · missing. *(Verified by reading the repo — file paths cited.)*

- **No business-level Settings hub** missing — the Hub menu has a **"Business settings"** row (`src/app/app/hub/page.tsx` line 48, `key: "business-settings"`, `Settings2` icon) but it carries **no `href`** so it renders as a dead `<button>` (the `ListCard` falls back to a non-navigating button when `href` is absent). There is **no `/app/settings` route** (`find` shows only `c/settings`, `clients/[id]/settings`, `services/[id]/settings`).
- **Per-service settings sheet exists** done — `src/app/app/services/[id]/settings/page.tsx` renders four sections (Access & visibility, Booking rules, Rescheduling, Payment) with 7 bottom-sheet pickers (`whoCanBook`, `leadTime`, `maxAdvance`, `buffer`, `cancellation`, `rescheduleLimit`, `payment`). Each picker already has a hardcoded `businessDefault` string and a **"Reset to default"** button, and rows read **"Default"** until overridden. **But the default is a literal string, not read from a real business model** — there is nothing to inherit *from*.
- **`BusinessDefaults` type exists but is dead code** partial — `src/lib/types/business.ts` defines `BusinessDefaults { leadTime, maxAdvance, buffer, cancellation, rescheduleLimit, paymentMethods, deposit }` and a sibling `ServiceSettings` with the `null = inherit` convention. A grep shows **zero consumers** outside the type file. The intended inheritance contract was sketched but never wired to a store or screen.
- **Offer-level settings persist** done — `OfferSettings` (`src/lib/data/offers.ts` lines 38–51) is saved on the offer via `updateOffer`; the dashboard `cancellation`/`deposit` fields also live on `DemoOffer` (lines 132–135).
- **Day-of running-late + "I'm ready" already shipped** done (the *action*, not the *rule*) — `src/lib/store/appStore.ts` carries `lateBy` / `setLateBy` and `readySent` / `setReadySent`. `UpNextCard.tsx` and `AppointmentSheet.tsx` render the picker and the cascade mapping is **already encoded**: `lateClients = lateBy / 5` (+5 → next 1, +10 → next 2, +15 → next 3) with auto-notify copy ("next N clients notified", "{name} notified — can come in"). **What's missing is the settings rule that governs it**: the cascade-count default, and the fixed-duration exclusion (no PT-can't-absorb logic — it cascades blindly today).
- **Block/blocked-time is a calendar side-effect** partial / *this is the bug* — `appStore.ts` `BlockEdit { title, blockType, time, duration }` + `blockTypes` seed (`product.ts` line 569) + the `BlockTimeSheet` in `QuickActions.tsx`. A block is **painted onto the calendar as a `GridBlock` of `kind: "blocked"`** (`schedule/page.tsx` `useBlockTap`); there is **no managed list of block objects**, no all-day/partial distinction, no public/private state, and no re-block affordance. This is exactly the "accidentally half-open day" failure mode.
- **Out-of-hours has its own plan, not a settings home** partial — `out-of-hours-finalisation-plan.md` owns the *premium pricing* (as a service variation) and the `outOfHours` appointment flag exists in `appStore.customAppts`. There is **no single settings config point** (master toggle + windows + per-service opt-in) — the stakeholder's "one place" ask is unmet.
- **Opening hours** missing here, owned elsewhere — per-location hours are scoped to `locations-finalisation-plan.md` Phase 5 (`LocationDay` on `BusinessLocation.hours`). Settings will **cross-link**, not re-own.

---

## Recommended UX calls

As an experienced designer reducing owner cognitive load — the simplest IA that satisfies the feedback.

1. **The hub is grouped value-rows, Peerspace-style.** One scrollable `/app/settings` screen, four groups, each row showing its **live value as a subtitle** so the owner audits every rule at a glance. Unconfigured rows show a **"Set up"** badge so the hub doubles as a setup checklist (Shopify). `[ASSUMPTION]`

2. **Phrase every rule as the owner's question, not jargon.** "Lead time" → *"How much notice do you need before an appointment?"* with a one-line recommendation underneath (Airbnb). The existing per-service sheet's terse labels stay, but the *business-level* editor leads with the question. `[ASSUMPTION]`

3. **Wire the dead `BusinessDefaults` type into a real store and make it the inheritance root.** Add a `settingsStore` (session-local Zustand, matching every other domain) seeded with sensible salon defaults. The existing `services/[id]/settings` pickers stop hardcoding `businessDefault` and read the live business value instead — so changing a business default cascades to every non-overridden service. This is the global-default → per-service-override contract the feedback asked us to "decide". `[ASSUMPTION]`

4. **Which rules are business-default-with-override vs business-only:** `[ASSUMPTION]`
   - **Default + per-service override** (the existing 7 sheet pickers inherit): *lead time, max advance, buffer, who-can-book, reschedule limit, cancellation policy, deposit, payment methods.*
   - **Business-only** (no per-service version): *block/unblock-day, out-of-hours master toggle + windows, running-late cascade count, "I'm ready".* These are about the *business's day*, not a single service.
   - **Per-service-only flag the cascade reads:** the **fixed-duration exclusion** lives as a service-type attribute (the out-of-hours plan already adds the flag) plus a business-level fallback rule.

5. **Block/unblock is a managed object, never a paint action (the fix).** A "Time off & blocked days" list of block entities (Turo). Opening a slot for a friend creates a **private sub-slot that stays closed to the public**; if the private booking is freed, the slot **auto-reverts to blocked** with a one-tap re-block. No counter-block-on-top (the explicitly rejected workaround). `[ASSUMPTION]` — confirm whether this list lives in Settings, the Schedule calendar, or both (see Open questions).

6. **Cancellation editor = buckets in, timeline out.** Edit as a Careem-style tiered table (time-windows × cancel-fee / no-show-fee columns + a grace-period row); preview as a Vrbo colour-graded refund timeline so the owner sees what the client sees before saving. `[ASSUMPTION]`

7. **Running-late settings govern the already-built action.** Settings owns: the default cascade count, the fixed-duration fallback ("notify only" / "offer to rebook"), and the owner soft-override principle (warn, don't block — Acuity). The day-of `UpNextCard`/`AppointmentSheet` action reads these instead of its hardcoded `lateBy / 5`. `[ASSUMPTION]`

8. **Out-of-hours is one row that cross-links.** A single "Out-of-hours availability" row: master toggle + window definition + per-service opt-in, with a prominent cross-link card *"Out-of-hours pricing is set on each service →"* to the out-of-hours plan's variant surface. Settings owns *whether and when*; the service variant owns *how much*. `[ASSUMPTION]`

9. **Targeting stays simple.** Where a policy can target risky clients, cap it at *"new clients / clients with prior no-shows"* (Fresha) — no client-segment matrices. `[ASSUMPTION]`

---

## Phase 1 — Settings hub shell + the inheritance backbone

**Goal:** Stand up the hub and make `BusinessDefaults` a real, inheritable store — the backbone every later phase hangs off.

**Flow:**
1. Hub → Setup → **"Business settings"** now navigates to `/app/settings` (wire the existing dead row).
2. `/app/settings` renders four grouped sections of value-rows (Peerspace): **Opening hours & availability**, **Booking rules**, **Cancellations & deposits**, **Day-of-service rules**. Each row shows its live value as a subtitle; unconfigured rows show a **"Set up"** badge.
3. A persistent helper line under each group: *"These apply to every service unless a service overrides them."*
4. Tapping a **Booking rules** row (lead time / max advance / buffer / who-can-book) opens a sheet phrased as the owner's question + recommendation, persisting to the store.
5. The existing `services/[id]/settings` pickers stop showing a hardcoded `businessDefault` and read the live value from the store; "Reset to default" now genuinely reverts to the business value.

**Changes:**
- `src/app/app/settings/page.tsx` (**new**) — the hub, composed from `@/components/ui` (`SettingsGroup`, `ListRow`, `Sheet`, `Toggle`, `Badge`). Booking-rule sheets reuse the picker pattern factored from `services/[id]/settings/page.tsx`.
- `src/app/app/hub/page.tsx` — add `href: "/app/settings"` to the `business-settings` item.
- `src/lib/store/settingsStore.ts` (**new**) — `useSettingsStore` over `BusinessDefaults`, seeded with salon defaults; `updateDefaults(patch)`.
- `src/app/app/services/[id]/settings/page.tsx` — `PICKERS[*].businessDefault` reads from `useSettingsStore` instead of literals.

**Data:** new `settingsStore` wrapping the existing `BusinessDefaults` type (no new type — it's defined, just unused). Add a `whoCanBook` field to `BusinessDefaults` (the type omits it; the service sheet has it).

**Risk:** medium — touches the inheritance contract; must keep the 23 seed offers rendering (their `OfferSettings` stays optional/`undefined = inherit`).

---

## Phase 2 — Cancellation & no-show deep-dive (global, then override)

**Goal:** A proper policy editor: protection model → grace period → tiered windows → deposit → reschedule limit, previewed as a timeline. This becomes the GLOBAL DEFAULT the per-service `cancellation` row inherits.

**Flow:**
1. From the hub → **"Cancellation & no-show policy"**.
2. **Protection model** (Fresha): *How do you protect bookings?* — Free cancellation only / Deposit required / Card on file.
3. **Grace period row** (Careem): *Free to cancel within [15 min] of booking* — the no-penalty default window.
4. **Tiered windows table**: rows for time-buckets before start (e.g. 48h / 24h / <24h / after start) × two columns — **Cancellation fee** and **No-show fee**, each Free / % / fixed £.
5. **Deposit sub-section** (if Deposit chosen): amount as % or fixed £; refundable-until window vs non-refundable; auto-cancel if unpaid within 1–72h.
6. **Reschedule limit** lives here: *Bookings can be rescheduled [unlimited / once / twice]* — moved out of the standalone Rescheduling section conceptually.
7. **Preview**: render the result as the Vrbo/Airbnb colour-graded refund timeline (Full refund → Partial → None) — the client-facing read-back.
8. **Save** → this is the business default; the service sheet's "Cancellation policy" row shows "Default" and can override + "Reset to default".

**Changes:**
- `src/app/app/settings/cancellation/page.tsx` (**new**) — the editor + timeline preview (SVG/CSS colour-graded, token classes only, no inline hex).
- `src/components/settings/RefundTimeline.tsx` (**new, shared**) — the colour-graded timeline, reused for the client-facing B2C preview later.
- `src/app/app/services/[id]/settings/page.tsx` — the `cancellation` picker becomes "inherit business policy / override" rather than a 4-option string.

**Data:** extend `BusinessDefaults.cancellation` from the thin `CancellationPolicy { type, customText }` to a richer `CancellationRule { gracePeriodMins; tiers: { window; cancelFee; noShowFee }[]; protection: "free"|"deposit"|"card" }`; `BusinessDefaults.deposit` already exists (`DepositRule`) — extend with `refundableUntil` + `autoCancelUnpaidHours`. Keep `OfferSettings.cancellation?: string` back-compatible (a service either inherits or stores its own rule).

**Risk:** medium — richest editor in the section, but each control is a simple sheet; the timeline preview is the only novel component.

---

## Phase 3 — Block/unblock-day fix (managed block objects)

**Goal:** Replace the calendar paint-and-unpaint block with a first-class managed object that can never leave a day half-open to the public.

**Flow:**
1. From the hub → **"Time off & blocked days"** → a **list of block objects** (Turo), each a card: date/range + reason + an explicit **"Closed to public"** state badge, with *all-day* vs *partial* clearly labelled.
2. **Add block**: Start date/time + End date/time range picker, or an **"All day"** toggle; pick a reason from `blockTypes`. Saved as a named entity in the list.
3. **THE FIX** — to open a slot for a friend: tap the block → **"Open part of this day for a private booking"** → creates a **private sub-slot** with a `keepBlockedToPublic` state, so the rest of the day stays closed to the public. The block object's badge updates to *"Closed to public · 1 private slot"*.
4. **Auto-revert**: if a privately-opened slot is freed (no-show/cancel), it **reverts to blocked** — surface a one-tap **"Re-block this slot"** on the now-empty slot. Never silently expose it to public booking.
5. **Confirmation read-back**: *"Saturday is closed to the public. 1 private slot at 2pm."* No ambiguous half-open state can exist.

**Changes:**
- `src/app/app/settings/blocks/page.tsx` (**new**) — the block list + add/edit. `[OPEN]` whether this also surfaces from the Schedule calendar (see Open questions); recommendation: the calendar reads the same store and shows blocks, but creation/management lives here so there is one source of truth.
- `src/lib/store/appStore.ts` — generalise the transient `BlockEdit` into persisted block objects + actions (`addBlock`, `removeBlock`, `openPrivateSlot`, `reblockSlot`).
- `src/components/app/QuickActions.tsx` `BlockTimeSheet` + `schedule/page.tsx` `useBlockTap` — read/write the new block store instead of painting a one-off `GridBlock`.

**Data:** new `DayBlock { id; start; end; allDay: boolean; reason: string; closedToPublic: true; privateSlots?: { id; time; clientId?; freed?: boolean }[] }` in the store (or a new `availabilityStore` — see Open questions). Existing transient `BlockEdit` stays for the inline edit affordance.

**Risk:** medium–high — this is the explicitly-rejected-workaround fix and touches the live Schedule calendar; the public/private state machine must be airtight (an invariant test in smoke: a freed private slot is never `closedToPublic: false`).

---

## Phase 4 — Running-late rule + "I'm ready" (governing the shipped action)

**Goal:** Add the *settings* that the already-built day-of running-late action reads, including the fixed-duration exclusion the stakeholder called the core constraint.

**Flow (settings side):**
1. From the hub → **"Running-late handling"**.
2. Default cascade rule: *"When I mark myself running late, shift the next [1 / 2 / 3] clients by the delay and notify them."* (maps to the existing 5/10/15-min → next-N mapping).
3. **Fixed-duration exception**: a rule *"Services that can't absorb delay"* — a per-service-type flag (the out-of-hours plan already adds it) marking fixed-duration services (e.g. 60-min PT) as **"cannot cascade"**; default: fixed-duration services are excluded automatically.
4. **Fallback for excluded services**: *"For fixed-duration services, instead [notify client of the delay only / offer to rebook]."*
5. **"I'm ready"**: confirm the action exists and its copy ("{name} can come in now").

**Flow (day-of side — already built, now reads the rule):**
6. From an appointment, the **"Running late"** action → pick 5 / 10 / 15 min.
7. Show the Flighty-style before/after: a red running-late banner and each downstream slot's old → new time as one connected chain; **flag any fixed-duration service in the chain that CANNOT shift** (warn, don't silently break).
8. **Confirm** → diary slots shift + affected clients auto-notified. The owner soft-override (Acuity): force a shift on a fixed-duration service only behind an *"are you sure? this service is fixed-duration"* confirm.

**Changes:**
- `src/app/app/settings/running-late/page.tsx` (**new**) — the cascade-count picker + fixed-duration fallback + "I'm ready" toggle, persisting to `settingsStore`.
- `src/components/app/UpNextCard.tsx` + `src/components/app/AppointmentSheet.tsx` — replace the hardcoded `lateBy / 5` with the store's `cascadeCount`; add the fixed-duration warn-don't-block check + before/after chain preview before notifications fire.
- `src/lib/store/appStore.ts` — the late action reads the cascade rule and the service's fixed-duration flag.

**Data:** `BusinessDefaults` gains `runningLate: { cascadeCount: 1|2|3; fixedDurationFallback: "notify"|"rebook"; imReadyEnabled: boolean }`. The per-service fixed-duration flag is owned by the out-of-hours plan (cross-reference, not re-declared).

**Risk:** medium — the action UI exists; the new work is the rule + the fixed-duration guard. Coordinate with the out-of-hours plan on the flag's exact field name.

---

## Phase 5 — Out-of-hours single config point + opening-hours cross-links

**Goal:** Satisfy the "one place for out-of-hours" ask — the master toggle, windows, and per-service opt-in — while cross-linking the pricing (out-of-hours plan) and the hours (locations plan) rather than re-owning them.

**Flow:**
1. **Opening hours & availability** group rows: **Weekly hours** and **Time off & blocked days** (Phase 3) and **Out-of-hours availability**.
2. **Weekly hours** row: `[OPEN]` if the business is single-location, show the Calendly-style weekly editor here; if multi-location, this row cross-links to **Locations** (which owns per-location hours, locations plan Phase 5). Recommendation: a single-business weekly pattern lives here and is the *default* a location can override — confirm with the locations plan's Open question 9.
3. **Out-of-hours availability** row → master toggle *"Accept bookings outside opening hours"*.
4. Define out-of-hours **windows** (e.g. before 9am / after 6pm / Sundays) reusing the weekly-hours range UI flagged as "out-of-hours" (Calendly).
5. **Per-service opt-in**: *"Which services can be booked out-of-hours?"* (All / selected).
6. **Cross-link card** (the single config point the stakeholder asked for): *"Out-of-hours pricing is set on each service →"* linking to the out-of-hours variant surface; and a plain-language summary *"Clients can book 6–9pm weekdays. Pricing set per service."*

**Changes:**
- `src/app/app/settings/out-of-hours/page.tsx` (**new**) — master toggle + windows + per-service opt-in + cross-link card.
- `src/components/settings/WeeklyHoursEditor.tsx` (**new, shared**) — per-day toggle + time-range pill + "+" split shift + explicit "Closed" (Calendly/OpenPhone); reused by the weekly-hours row and the out-of-hours window definition. (Coordinate with the locations plan's `OpeningHoursEditor` — ideally one component.)
- Cross-link to `services/[id]/variants` (out-of-hours pricing) and `/app/locations` (per-location hours).

**Data:** `BusinessDefaults` gains `openingHours?: WeeklyDay[]` (single-business default) and `outOfHours: { enabled: boolean; windows: WeeklyWindow[]; serviceOptIn: "all" | string[] }`. The *pricing* stays on the service variant (out-of-hours plan) — not duplicated here.

**Risk:** medium — the main risk is IA collision with Locations (hours) and Out-of-hours (pricing); the cross-link contract must be agreed so nothing is owned twice (anti-pattern: scattering out-of-hours config).

---

## V2 / deferred

- **Client-facing policy display (B2C).** Render the cancellation `RefundTimeline` (Phase 2) inside the `/c` booking confirmation so the consumer sees the colour-graded windows before paying. *Direction:* reuse the shared `RefundTimeline` component with the coral B2C tone; surface at the checkout/confirm step.
- **Risky-client targeting.** Apply deposit/no-show fees only to *new clients / clients with prior no-shows* (Fresha). *Direction:* a single "Who does this apply to?" toggle on the deposit sub-section reading the existing client no-show history — cap at these two segments, never a matrix.
- **Written policies (free text).** A Shopify-style "Written policies" group (terms, privacy, late policy) separate from the rule engine, each row with a "No policy set" badge. *Direction:* simple text rows with status badges; legal copy is out of scope this pass.
- **Public-holiday auto-off.** A business setting to auto-block on bank holidays with build-up reminders (overlaps the team plan's 2b). *Direction:* a block-object generator that seeds `DayBlock`s for UK bank holidays; coordinate with team coverage.
- **Per-location rule overrides.** A branch overriding the business default cancellation/lead-time. *Direction:* the same default→override pattern one level down (location overrides business; service overrides location) — only if multi-location demand appears; risks over-nesting, so defer.
- **Notification timing/templates for the cascade.** Editable copy for the auto-notify messages ("running late", "you can come in"). *Direction:* hang off the Marketing notification presets (service plan Phase 8), not a bespoke settings screen.

---

## Suggested order & rationale

`1 (hub + inheritance backbone) → 2 (cancellation/deposits) → 3 (block/unblock fix) → 4 (running-late rule) → 5 (out-of-hours config + hours cross-links)`

Phase 1 first because it is the **backbone**: the hub shell and the live `BusinessDefaults` store are what every other rule reads from, and wiring the existing per-service "Reset to default" to a *real* default is the single highest-leverage change (it makes the inheritance contract true rather than cosmetic). Phase 2 next because cancellation/deposits is the deepest content and the most-requested deep-dive (26 May + 15 Jun), and it exercises the override contract end-to-end. Phase 3 (the block/unblock fix) is the most-pointed *bug* fix and is self-contained, so it can slot earlier if the stakeholder prioritises it — but it touches the live calendar, so it benefits from the store discipline Phase 1 establishes. Phase 4 is light (the action ships; we add the rule) and Phase 5 is mostly cross-linking, so both come last.

Every phase ends green on `npx tsc --noEmit && npx next lint && npm run smoke`, with a **smoke needle** for each new empty/setup state (the hub, the cancellation editor, the block list empty state, the running-late settings, the out-of-hours screen) — following the pattern at `smoke.tsx` line 171 (`OfferSettings`). Persistence stays session-local Zustand. New `BusinessDefaults` fields are additive so the 23 seed offers and the existing per-service sheet keep rendering.

---

## Cross-cutting data-model changes

The previously-dead `BusinessDefaults` (`src/lib/types/business.ts`) becomes the live inheritance root via a new `settingsStore`. Additive / back-compatible changes:

- `BusinessDefaults` → `+ whoCanBook` (Phase 1).
- `BusinessDefaults.cancellation` → richer `CancellationRule { gracePeriodMins; protection; tiers: { window; cancelFee; noShowFee }[] }`; `BusinessDefaults.deposit` (`DepositRule`) → `+ refundableUntil`, `+ autoCancelUnpaidHours` (Phase 2).
- new `DayBlock { id; start; end; allDay; reason; closedToPublic; privateSlots? }` in the availability store (Phase 3).
- `BusinessDefaults` → `+ runningLate { cascadeCount; fixedDurationFallback; imReadyEnabled }` (Phase 4); reads the per-service **fixed-duration flag owned by the out-of-hours plan**.
- `BusinessDefaults` → `+ openingHours?` and `+ outOfHours { enabled; windows; serviceOptIn }` (Phase 5); pricing stays on the service variant.
- new `settingsStore` (`src/lib/store/settingsStore.ts`); `OfferSettings` (`offers.ts`) is unchanged except its values now mean "override of the live business default" rather than "override of a hardcoded string".

All optional / back-compatible — seed offers keep rendering, and `undefined` on a service still means "inherit".

---

## Open questions for the user

1. **Hub location & naming.** Confirm the new hub lives at `/app/settings` behind the existing Hub → Setup → "Business settings" row, and is titled "Business settings" (vs "Rules & policies", the Peerspace term). `[OPEN]`
2. **Block/unblock list home.** Should "Time off & blocked days" live in **Settings**, the **Schedule** calendar, or surface in both off one store? Recommendation: manage in Settings, display (read-only) on the calendar. `[OPEN]`
3. **Opening hours ownership.** Hours are claimed by the Locations plan (per-location). For a single-location business, do we show a weekly-hours editor *in Settings* as the default, or always defer to Locations? This blocks Phase 5 step 2 and overlaps the locations plan's Open question 9. `[OPEN]`
4. **Cancellation windows — which buckets?** The Careem model uses fixed buckets (48h / 24h / <24h / after start). Are these the right defaults for a salon, or does the client want owner-defined window thresholds? `[OPEN]`
5. **Default cascade count.** The shipped action maps 5/10/15 → next 1/2/3. Should the *default* cascade rule cap at a different count, and what is the default fixed-duration fallback ("notify only" vs "offer to rebook")? `[OPEN]`
6. **Fixed-duration flag name & ownership.** This plan reads the per-service fixed-duration flag the out-of-hours plan adds. Confirm the exact field and that Settings is the right home for the *fallback* rule (vs the service settings sheet). `[OPEN]`
7. **Per-service vs business — deposits & payment methods.** The feedback names cancellation explicitly; should *deposits* and *payment methods* also be per-service-overridable, or business-only? Recommendation: both follow the default+override pattern (deposit yes, payment methods business-only). `[OPEN]`
8. **Risky-client targeting now or V2.** Is "apply fees to new / prior-no-show clients only" wanted in this pass, or deferred? Defaulted to V2. `[OPEN]`

*Implementation begins once these are answered, starting with Phase 1 (hub + inheritance backbone).*
