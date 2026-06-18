# Classes (Educational Courses) — Finalisation Plan

> **Status:** Plan only — no implementation until the open questions below are resolved.
> **Scope:** The **class** offer type — its creation wizard (`/new/class-*`), its management dashboard + advanced modules (`/app/services/[id]/*`), and the vendor-side **class detail on the calendar** (`/app/schedule`). Classes here mean **educational courses** (workshops, academies, masterclasses) — single-day or multi-day — *not* recurring fitness drop-ins (client, 19 May). Also covers how classes surface across **Home, Calendar and Analytics**, plus the auto group-chat in **Messages**.
> **Explicitly out of scope this pass:** the **B2C consumer booking** of a course (the `/c` coral surface) beyond noting the one guardrail that the consumer must never see a per-day "add to cart"; real backend persistence (stays session-local Zustand); the parked **Models & practice-clients** application flow (designed as hooks only — see V2). Payments settlement / Stripe is a separate session, as in the team and service plans.
> **Source of truth for feedback:** Granola sessions with Shabbir & Vishal — **19 May**, **26 May** (the deep classes session, id `8030fb2b-3ee4-4b4e-97eb-18f15a407bf1`) and the **15 Jun** sign-off (id `d72564d7-4daa-4feb-80c3-a6db17785b42`). The client called classes **"potentially a big game changer in the industry"** for fitness & barbering academies and said **"nobody is looking into classes as deep."**
> **Design source → design in-app from feedback + best-in-class patterns.** No finalised class Figma; build from the meeting feedback, the patterns researched below (Mobbin urls cited inline), and the existing `@/components/ui` library, reviewing in the running app — same convention the team plan locked on 17 Jun.

---

## What this section is

A **class** is one of the four offer types created from `/new` (alongside service, bundle, subscription) and managed at `/app/services/[id]`. It models a **taught course** a salon, academy or trainer runs for paying attendees: a colour masterclass, a barbering academy week, a bridal-hair workshop. The owner sets a **format** (single-day class vs multi-day course), **delivery** (in-person or virtual), **capacity + per-person price**, an **agenda/syllabus**, **digital assets**, and optional **certificates**. Once published, each scheduled occurrence surfaces as a block on the team **calendar** with its own attendee roster, check-in, revenue line and an auto-created **group chat**. The section sits inside the business hub's offer catalogue — it is the most content-rich offer type and the one the client is most excited to differentiate on.

---

## Feedback → source map

| Area | Feedback | Source | Pattern ref (Mobbin) |
|---|---|---|---|
| Definition | Classes = **educational courses**, not recurring fitness; single/multi-day, virtual/in-person, participant limits, digital assets | 19 May | — |
| Format toggle | **Single-day class vs multi-day course** as a toggle at the **top of date selection** so calendar logic + labels change together; user picks format **first** | 26 May | [Tripadvisor Dates/Trip-length](https://mobbin.com/screens/b5ecf229-53d9-4ea1-b0c7-d4a3a21b5996) · [Airbnb Choose-dates/Flexible](https://mobbin.com/screens/c634cca2-01c1-4b08-9b81-11ddf1b20bfc) |
| Course = one unit | A course block is **one bookable unit** (single total price, N child sessions); attendees must **not** think they can book individual days. "Minimise, if not eradicate, workarounds." | 26 May | [Acuity series-lock — see brief] · [Open booking line-items](https://mobbin.com/screens/4b96d378-99f5-4559-b285-ddb4162593b0) |
| Per-occurrence overrides | When a class repeats (e.g. bi-weekly), allow per-occurrence **time overrides inside the creation flow** — back/forward week arrows or a month-calendar click-through; untouched occurrences inherit the setup. Do **not** punt to the calendar's "edit this occurrence" | 26 May | [Timepage recurrence card](https://mobbin.com/flows/42f525ae-4219-462a-aa81-206ca38ca2ec) · [Outlook recurrence](https://mobbin.com/flows/572f3698-1b71-452f-aadf-37997667ff67) · [Saturn "Every 2 weeks"](https://mobbin.com/flows/6b90319d-b5f8-48d3-811f-2408f3a0c8c5) |
| Recurrence echo | Echo the rule in **plain English** ("Repeats every 2 weeks on Tuesday until 11 Sep") for non-technical owners | 26 May (design call) | [Timepage](https://mobbin.com/flows/42f525ae-4219-462a-aa81-206ca38ca2ec) |
| Pricing | **Keep per-person price** (correct for public classes). **Add a revenue summary** downstream ("2 booked = £30") on the calendar/detail and analytics | 26 May | [Open line-items](https://mobbin.com/screens/4b96d378-99f5-4559-b285-ddb4162593b0) |
| Agenda / syllabus | Builder is loved ("nice and simple"); add **duplication** / "lift & shift" an agenda into a new class | 26 May | [Coursera syllabus modules](https://mobbin.com/flows/39d54a01-9648-44c5-9577-aa054259d596) |
| Digital assets | PDFs, pre-reads, nutrition guides — attach at course level and per agenda item | 19 May, 26 May | [Coursera Resources tab](https://mobbin.com/screens/2ecd5bab-da28-4bbb-90c8-cfcf3ae89173) · [Udemy Downloads tab](https://mobbin.com/screens/fba5b020-7355-4ce3-b109-1d083e3e9417) · [MasterClass per-lesson download](https://mobbin.com/screens/f1b31598-0476-4a60-bedf-d789e96fabab) |
| Certificates | Completion certificates approved; use issuance as a **marketing trigger** ("congrats, £10 off your next booking") | 26 May | [Skillshare certificate](https://mobbin.com/screens/81762058-a358-4516-af84-c5cd091ee1dc) · [Allset "You've got $10"](https://mobbin.com/screens/f89241e1-fa0f-439a-9de3-a6c964801713) · [Commons reward voucher](https://mobbin.com/screens/c7b43a40-e40a-4215-8b82-dce5b5a5393b) |
| Vendor class detail | The **calendar class-detail view is not yet designed**: must show attendees, mark-arrived, message-all, agenda, revenue; factor how classes surface across calendar + home + analytics | 26 May, 15 Jun | [Luma event hub](https://mobbin.com/flows/26b0f3ea-2156-43d2-b580-f4774fbb7fc7) · [Open roster](https://mobbin.com/screens/a68435c5-a5a8-43a7-a171-e65a2477af66) · [Partiful manage-guests](https://mobbin.com/flows/aab8ef96-56f4-4af3-96a5-b2792a0a1810) |
| Messaging | Creating a class **auto-creates a group chat**; auto-archive when the class finishes; support a **one-way broadcast** channel | 15 Jun | [Luma create-event-chat](https://mobbin.com/flows/9aa90e90-df47-4cc0-b27c-66ba362598d0) · [Luma Blast](https://mobbin.com/flows/7d21e145-ebe8-4577-b8ef-aa55e4113b05) · [NAVER official-participant lane](https://mobbin.com/flows/ef6d2544-b1eb-47f1-8865-e33fce19ad96) |
| Reminders | Automatic reminders (e.g. day-before each session) requiring no owner action | 15 Jun (Luma/Partiful pattern) | [Partiful Text Blasts + auto-reminders](https://mobbin.com/flows/289aa169-18bd-41c2-8681-576782bc4af2) |
| Models (parked) | Models & practice-clients application flow (~85% captured); discount/offering field for the candidate; "bring your own model" invite link + waiver; blast the application link to the contact list; tag applicants "previous model" for a reusable pool. **"May not be a V1 priority."** | 26 May | — |

---

## Current state

**Status legend:** ✅ done · 🟡 partial · ❌ missing. Grounded in the actual code read this session.

**Creation wizard** (6 steps; `TOTAL_STEPS.class = 6` in `src/components/ui/organisms/WizardChrome.tsx`). Route order: `basics → class-participants → class-schedule → locations → staff → class-pricing`.
- ✅ **Format toggle already exists** at the top of date selection — `src/app/new/class-schedule/page.tsx` has a "Single day / Multi day" segmented control that drives the date inputs and the labelling. This is most of the 26 May ask already in place. 🟡 but the *guardrail copy* ("attendees book the whole course"), the auto-agenda scaffold and the one-unit framing are not yet there.
- 🟡 **Attendees** (`class-participants/page.tsx`) — public-group vs private-booking, min/max size, auto-cancel toggle. Solid; "public group" is the per-person path.
- 🟡 **Schedule** (`class-schedule/page.tsx`) — single/multi date list + start/end + a basic weekly **repeat** (just `repeat: "none"|"weekly"` + `repeatWeeks` number). ❌ No frequency/interval/day-chips, ❌ no plain-English echo, ❌ no per-occurrence overrides.
- 🟡 **Pricing** (`class-pricing/page.tsx`) — per-person price kept ✅, and it already shows an "£X × capacity = £Y potential revenue per session" helper ✅ (the setup-time half of the revenue ask). Deposit toggle present.
- 🟡 Delivery (in-person/virtual) is handled by the **shared** `/new/locations` step (`locationModes.remote`), not a class-specific delivery step.

**Management dashboard** (`src/app/app/services/[id]/page.tsx`, `isClass` branch). Advanced module list for classes: Requirements, Forms & waivers, Agenda & syllabus, Materials, Completion & certificates, Resources, Products & kits, Notifications, Settings.
- 🟡 **Agenda** (`agenda/page.tsx`) — an ordered list of `{ title }` rows; add/remove persists via `updateOffer`. Loved-but-thin: ❌ no time/note per row, ❌ not grouped by day for multi-day, ❌ no per-item asset attach.
- 🟡 **Materials** (`materials/page.tsx`) — a named-file list `{ name }`. ❌ No release-timing, ❌ no per-agenda-item attach, ❌ not split from agenda conceptually beyond being a second list.
- 🟡 **Certificates** (`certificates/page.tsx`) — enable toggle + pass-criteria. ❌ No marketing-reward field, ❌ no issuance/celebration moment.
- ✅ Requirements, Forms, Resources, Products, Notifications, Settings reuse the service modules.
- ❌ **No "Duplicate class"** action anywhere (`offersStore.ts` has `addOffer/updateOffer/removeOffer` only).

**Vendor class detail on the calendar** — `src/app/app/schedule/page.tsx` `ClassSheet`, fed by the single `masterclass` seed in `src/lib/data/product.ts`.
- ✅ A real sheet exists: progress bar `booked/capacity`, attendee avatars expanding to a roster, **per-attendee mark-arrived**, "Add attendee", "Message all", "Cancel class · notify N", an agenda peek, and a "Manage class" hand-off to the dashboard. This is further along than the 26 May "not yet designed" note implies — but it is **hardcoded to one `masterclass` object**, not driven by the published offer, and:
- ❌ **No revenue line** ("8 booked × £15 = £120"). ❌ No multi-day day-switcher. ❌ No two-lane messaging (broadcast vs chat). ❌ No "issue certificates" completion action. ❌ Not generalised across offers.

**Messaging** — `src/lib/data/product.ts` already models class group chats: `ConversationKind` includes `"class"`, with seeded `cls-colour` (active) and `cls-bridal` (`archived: true`) conversations and member avatar stacks. ✅ The auto-archive *data shape* exists. ❌ No auto-create-on-publish wiring, ❌ no broadcast/announcement lane.

**Home / Analytics** — ❌ No B2B home or analytics route exists yet (`find` shows only `staff/home`, `c/home`); classes do not surface there. This is a known gap (16 Jun internal: Analytics is one of the "big three").

---

## Recommended UX calls

As the designer, reducing owner cognitive load, the simplest flow that satisfies the feedback:

1. **Keep the existing single/multi toggle where it is** — it already lives at the top of date selection, which is exactly the Airbnb/Tripadvisor mechanism the client asked for. Do **not** rebuild it; **upgrade** it: add the guardrail copy, switch the multi-day branch to a **start-date + number-of-days** range (not a free list of dates), and auto-scaffold the agenda by day. [ASSUMPTION] multi-day defaults to **consecutive days** from the start date, with an "edit individual days" affordance for non-consecutive academies — most courses run on consecutive or weekly-repeating days.

2. **Add a dedicated Delivery step** (in-person vs virtual) rather than overloading the shared `/new/locations` step. A non-technical owner setting up a *virtual* masterclass should see one "meeting link" field, not the full in-salon/mobile/remote location matrix. [ASSUMPTION] — the client described virtual/in-person as a first-class class property (19 May), so it earns its own simple step; in-person still reuses the location picker beneath the toggle.

3. **Model a course as one bookable unit** — `scheduleMode: "multi"` already implies this; make it true in the data by storing **child sessions** under one offer with **one total price**, and make the consumer-facing CTA copy "Book the course" (the B2C wiring itself is out of scope, but the data must support it). This is the anti-workaround guardrail (Acuity series-lock).

4. **Compact recurrence editor, Timepage-style, on one card** — frequency pills + every-N stepper + day-of-week chips + Ends (Never / After N / On date) + a live plain-English echo line. Reuse the existing `repeat`/`repeatWeeks` fields and widen them; do **not** build Outlook's multi-screen drill-down on a phone.

5. **Per-occurrence overrides live inside the wizard** as an optional "Adjust individual sessions" entry after the repeat rule — a horizontal week cycler with ‹ › arrows (default) is simpler to build and explain than a month grid; offer the month grid as the [OPEN — needs user decision] alternative. Untouched occurrences stay linked to the setup default.

6. **Revenue line everywhere a class is shown** — setup already has the "potential revenue" helper; add the **actual** "N booked × £P = £T" line to the calendar `ClassSheet` header (directly under capacity) and to analytics once that section exists.

7. **Duplicate the whole class** as the agenda-reuse mechanism (client-endorsed) — one overflow action, lands in the wizard pre-filled with everything **except dates**. Do **not** build a separate "save agenda as template" system for V1.

8. **Certificates couple to the marketing reward in one celebratory moment** — the certificate toggle gains an optional "£X off next booking" field; issuance (from the calendar completion action) fires the Skillshare/Allset-style celebration to attendees. Don't make certificates a standalone admin chore.

9. **Messaging scope = auto group chat + one-way broadcast + auto-reminders. Nothing more.** Two lanes (NAVER pattern): host-only **Announcements/Blast** and everyone **Class chat**. The data already supports `kind: "class"` + `archived`; add the broadcast lane and the auto-create-on-publish hook. Do **not** build a two-way inbox/CRM.

10. **Generalise `ClassSheet` off the published offer** instead of the single hardcoded `masterclass`, so any class on the calendar opens its real roster, capacity, price and agenda. [ASSUMPTION] a per-occurrence "booking" seed (attendees + arrived state) is acceptable as session-local demo data.

11. **Models & practice-clients = hooks only this pass** — the client flagged it maybe-not-V1. Design the entry point and data field so it doesn't bloat the core flow; full build deferred (V2).

---

## Phase 1 — Course-vs-class guardrail + delivery (creation wizard)

**Goal:** Make the format choice unmistakable and make a multi-day course behave as one bookable unit, then give virtual classes their own simple delivery step.

**Flow:**
1. `basics` (name, photo, category, description) — unchanged entry.
2. `class-participants` — unchanged (public-group / private; min/max; auto-cancel).
3. `class-schedule` — the single/multi toggle stays at the top. **Single-day:** one date + start/end (as today). **Multi-day:** switch the free date list to **start date + "number of days" stepper** (or end-date range); render the block as **one unit** with helper copy *"Attendees book the whole course — they cannot book individual days."* and an auto-generated agenda scaffold ("Day 1, Day 2…").
4. **New Delivery step** (between schedule and the existing location step, or folded into it): segmented **In-person | Virtual**. Virtual → one "Meeting link" field. In-person → the existing location picker.
5. `staff` → `class-pricing` (unchanged order).

**Changes:**
- `src/app/new/class-schedule/page.tsx` — multi-day branch becomes start-date + day-count; add guardrail copy; generate the agenda scaffold into the draft.
- New `src/app/new/class-delivery/page.tsx` **[OPEN — needs user decision: separate step vs. a toggle on the existing `/new/locations`]**; re-point `class-schedule`'s `onNext` and `locations`'s `back`.
- `src/components/ui/organisms/WizardChrome.tsx` — `TOTAL_STEPS.class` 6 → 7 if Delivery becomes its own step.

**Data:** `ClassDraft` (in `wizardStore.ts`) gains `dayCount?: number` and the multi-day path produces `sessions` (see Cross-cutting). Delivery reuses existing `locationModes.remote` + `remote` settings, or a new `delivery: "in_person" | "virtual"` flag if separated.

**Risk:** low–medium. The toggle exists; this is upgrade + one new step.

---

## Phase 2 — Recurrence editor + per-occurrence overrides (creation wizard)

**Goal:** Replace the thin weekly repeat with a compact, plain-English recurrence editor, and let owners override individual occurrence times **without leaving the wizard**.

**Flow:**
1. In `class-schedule`, the "Repeats" row opens a **compact recurrence sheet** (Timepage): frequency pills (Does not repeat / Daily / Weekly / Monthly), an "every [- N +]" stepper, S-M-T-W-T-F-S day chips, and **Ends** (Never / After N times / On a date with a mini-calendar).
2. A **live echo line** renders the rule in words: *"Repeats every 2 weeks on Tuesday until 11 Sep."*
3. If it repeats (or is multi-day), an optional **"Adjust individual sessions"** entry opens an in-flow override view: a horizontal **week/occurrence cycler** with ‹ › arrows showing each generated occurrence at its inherited time; tap → inline time/date editor; saved overrides show an "edited" marker; untouched occurrences inherit the default. **"Done"** returns to the wizard — never the live calendar.

**Changes:**
- `src/app/new/class-schedule/page.tsx` — recurrence sheet + echo line + the occurrence cycler.
- New shared `RecurrenceSheet` in `src/components/ui/**` (export from the barrel; add a smoke needle) so the calendar can reuse it later.

**Data:** `ClassDraft.repeat` widens to `{ freq: "none"|"daily"|"weekly"|"monthly"; interval: number; days: number[]; ends: { kind: "never"|"after"|"on"; count?: number; date?: string } }`; add `occurrenceOverrides?: Record<string, { date?: string; startTime?: string; endTime?: string }>` keyed by occurrence id. Keep `repeatWeeks` readable via a migration default.

**Risk:** medium. The override cycler is the novel UI; the recurrence model change ripples into how occurrences materialise on the calendar.

---

## Phase 3 — Agenda + resources depth (dashboard modules)

**Goal:** Grow the loved-but-thin agenda into a real syllabus, keep agenda and resources **conceptually distinct** (Coursera), and let assets attach at course **and** per-item level with release timing.

**Flow:**
1. **Agenda & syllabus** (`agenda/page.tsx`): each row gains optional **time, title, note**; for multi-day, rows are **grouped under each day** (Day 1 / Day 2 headers). Each row has an "attach file" affordance.
2. **Materials → Resources** (`materials/page.tsx`): a typed file list (PDF / pre-read / guide) with a **release toggle** (Now / On booking / On a set date) and the option to attach **course-wide** ("Class Guide") or **to an agenda item**.

**Changes:**
- `src/app/app/services/[id]/agenda/page.tsx` — richer row model + day grouping + per-row attach.
- `src/app/app/services/[id]/materials/page.tsx` — typed resources + release timing.

**Data:** `agenda?: { day?: number; time?: string; title: string; note?: string; assetIds?: string[] }[]`; `materials?: { name: string; kind?: "pdf"|"preread"|"guide"; release?: "now"|"on_booking"|{ on: string }; agendaItemId?: string }[]`. Additive — the existing `{ title }` / `{ name }` seeds still parse.

**Risk:** low–medium. Self-contained module edits; the day-grouping must read `scheduleMode`/`dayCount`.

---

## Phase 4 — Duplicate class ("lift & shift" an agenda)

**Goal:** One action that reuses a whole class's agenda, assets, capacity and price into a new dated class — the client's endorsed agenda-reuse solution.

**Flow:**
1. From the dashboard overflow (`MoreVertical`) or a list row, **"Duplicate class."**
2. Lands in the creation wizard **pre-filled** with everything **except the dates**, which are cleared.
3. Owner sets new dates → publish.

**Changes:**
- `src/lib/store/offersStore.ts` — add `duplicateOffer(id)` that deep-copies the offer (new id, status `draft`, dates cleared) and seeds the wizard draft, OR a `seedDraftFrom(offer)` on `wizardStore`.
- `src/app/app/services/[id]/page.tsx` — wire the overflow menu (currently a no-op `MoreVertical` button) to "Duplicate class."
- `src/lib/store/wizardStore.ts` — accept a pre-fill payload.

**Data:** none new — reuses the existing offer shape; dates/`sessions`/`occurrenceOverrides` cleared on copy.

**Risk:** low. Reuses `offerFromDraft` in reverse; main care is clearing date fields cleanly.

---

## Phase 5 — Vendor class detail on the calendar (generalise + revenue + completion)

**Goal:** Turn the hardcoded `masterclass` `ClassSheet` into a real, offer-driven class-detail screen with the revenue line, multi-day support, and a completion action — the explicitly "not yet designed" screen.

**Flow (Luma action-row blueprint):**
1. **At-a-glance header:** class name, format badge (Single-day / Multi-day / Virtual), date & time, capacity **"8 / 12 booked"**, with the **revenue line directly beneath: "8 booked × £15 = £120"** (26 May ask). Multi-day → a **day switcher** under the header.
2. **Action row:** Attendees · Check-in · Message · Agenda.
3. **Attendees:** avatar grid → roster list; per-person mark-arrived (exists ✅), message, remove/refund; bulk "check in all", bulk message, **CSV export** (Partiful).
4. **Message:** opens the auto-created group chat (Phase 6).
5. **Agenda tab:** read view of the syllabus + attached resources (pull a PDF up mid-class).
6. **On completion:** an **"Issue certificates"** action → fires the certificate + marketing-reward moment (Phase 7) and triggers chat auto-archive (Phase 6).

**Changes:**
- `src/app/app/schedule/page.tsx` — `ClassSheet` reads the tapped occurrence's offer + booking rather than the single `masterclass`; add the revenue line, day switcher, bulk actions, completion action.
- `src/lib/data/product.ts` — replace the single `masterclass` with a small set of **class occurrences** (offerId + date + attendees + arrived/paid status) so different calendar blocks open different rosters.

**Data:** new `ClassOccurrence { id; offerId; date; startTime; endTime; attendees: Attendee[] }` seed; `revenue` derived (booked × price), not stored.

**Risk:** medium. Touches the large `schedule/page.tsx`; the win is deleting the hardcoded coupling.

---

## Phase 6 — Class messaging: auto group chat + broadcast lane (Messages)

**Goal:** Auto-create a class group chat on publish, auto-add new bookers, auto-archive on finish, and add a host-only one-way broadcast lane — the 15 Jun asks, at the scoped size.

**Flow:**
1. Publishing a class **auto-creates** a `kind: "class"` conversation (data shape already exists) with the attendee avatar stack.
2. The class thread has **two lanes** (NAVER): **Announcements** (host-only broadcast — "bring your own tools") and **Class chat** (everyone). A "New Blast" composer pushes a one-way notice to all attendees.
3. New bookers are auto-added; when the class finishes, the conversation **auto-archives** (read-only, dimmed — `archived: true` already supported).

**Changes:**
- `src/app/app/messages/*` + `src/lib/data/product.ts` — add the broadcast lane to the class thread; a "New Blast" composer.
- Hook from class publish (`offerFromDraft` / `addOffer`) to create the conversation; from the Phase 5 completion action to set `archived`.

**Data:** `Conversation` gains `lanes?: { announcements: Message[]; chat: Message[] }` or a simpler `broadcast?: boolean` per message; `linkedOfferId?` to tie a chat to its class.

**Risk:** low–medium. Mostly demo wiring; keep it broadcast + chat, no two-way CRM.

---

## Phase 7 — Certificates as a marketing trigger (module + issuance moment)

**Goal:** Couple certificate issuance to a next-booking reward in one celebratory moment.

**Flow:**
1. **Certificates module** (`certificates/page.tsx`): keep the enable toggle + pass criteria; add an optional **"Reward on completion — £X off next booking"** field.
2. **Issuance** (fired from the Phase 5 completion action): a Skillshare/Allset-style **celebratory screen/notification** to attendees — certificate badge + *"Congrats, here's £10 off your next booking"* + a single CTA, emailed.

**Changes:**
- `src/app/app/services/[id]/certificates/page.tsx` — add the reward field.
- A celebratory issuance component (shared `@/components/ui`; smoke needle). The B2C-facing version is noted but out of scope this pass.

**Data:** `certificate` gains `reward?: { enabled: boolean; amountOff: string }`.

**Risk:** low. Additive module field + one celebratory surface.

---

## Phase 8 — Surface classes across Home, Calendar & Analytics

**Goal:** Honour the 26 May / 15 Jun ask that classes surface beyond the creation flow — not just the calendar block, but the home summary and the analytics revenue view.

**Flow:**
1. **Calendar** — class blocks already render (`status: "Class"`); ensure the revenue + capacity line shows on the block tooltip/peek.
2. **Home** (when the B2B home/dashboard lands) — an "Upcoming classes" / "needs attention" (under-min, auto-cancel risk) summary.
3. **Analytics** (when the Analytics section lands — one of the 16 Jun "big three") — class **revenue** broken out ("N booked × £P"), fill-rate per class, certificates issued.

**Changes:** depends on Home/Analytics sections existing — **sequence after** those land. Reuse the derived revenue from Phase 5.

**Data:** none new — derived from offers + occurrences + bookings.

**Risk:** medium — cross-section dependency; cannot fully land until Home/Analytics exist (note for those plans).

---

## V2 / deferred

- **Models & practice-clients application flow** (client: "may not be a V1 priority", 26 May). ~85% captured. *Recommended direction:* design the **hooks** now — a "Needs models?" toggle on the class with a slot for a discount/offering field for the candidate, and a `modelApplication` data stub — but defer the full build. V2 scope: the application form, **"bring your own model"** (invite a friend via link + T&Cs/waiver), **blast the application link to the existing contact list** (reuse the Phase 6 broadcast + marketing), and tagging submitted applicants **"previous model"** for a reusable pool (a client tag — overlaps the clients section).
- **Month-calendar override view** as an alternative to the week cycler (Phase 2) — build only if the cycler tests poorly with owners.
- **Per-agenda-item quizzes / typed lesson items** (Coursera Video/Reading/Quiz) — over-scope for a salon academy V1; revisit if demand appears.
- **B2C course booking polish** on `/c` — the "Book the course" CTA, agenda preview, resource gating after booking. Tracked with the consumer section.
- **Certificate templates / branding** — a designed certificate artefact (logo, signature). V1 issues a plain certificate + the reward.
- **Two-way class inbox** — explicitly *not* V1 (anti-pattern); only if owners outgrow broadcast + chat.

---

## Suggested order & rationale

`1 (course guardrail + delivery) → 2 (recurrence + overrides) → 3 (agenda/resources depth) → 4 (duplicate) → 5 (calendar class detail) → 6 (messaging) → 7 (certificates) → 8 (home/analytics surfacing)`

Phase 1 first because the single/multi guardrail is the client's flagship "game-changer" ask and the toggle already exists — small, high-visibility win. Phase 2 next as it completes the date-setup story (recurrence + the explicit anti-workaround override). Phases 3–4 deepen and reuse the content the client loves. Phase 5 is the biggest single design deliverable (the un-designed screen) and depends on the offer/occurrence data being real, so it follows the model work. Phase 6–7 hang off Phase 5's completion action. Phase 8 is gated on the Home/Analytics sections and so is sequenced last / cross-flagged.

Every phase ends green on `npx tsc --noEmit && npx next lint && npm run smoke`, with a smoke needle for each new empty/setup state. Persistence stays session-local Zustand via `addOffer`/`updateOffer`/`duplicateOffer`; all new offer fields are additive so the seed catalogue keeps rendering.

---

## Cross-cutting data-model changes

Additive / back-compatible. `ClassDraft` (`src/lib/store/wizardStore.ts`) and `DemoOffer.classDetails` / the class module fields (`src/lib/data/offers.ts`):

- `ClassDraft` → `+ dayCount?` (Phase 1); `+ delivery?: "in_person" | "virtual"` (Phase 1, if a separate step); `repeat` widened to `{ freq; interval; days; ends }` + `+ occurrenceOverrides?` (Phase 2); `+ sessions?: { day: number; date?: string; startTime; endTime }[]` for multi-day (Phase 1/2).
- `DemoOffer.agenda` → richer rows `{ day?; time?; title; note?; assetIds? }` (Phase 3).
- `DemoOffer.materials` → typed + release timing `{ name; kind?; release?; agendaItemId? }` (Phase 3).
- `DemoOffer.certificate` → `+ reward?: { enabled; amountOff }` (Phase 7).
- New seed `ClassOccurrence` + an `Attendee`/booking shape in `src/lib/data/product.ts`, replacing the single `masterclass` (Phase 5); `revenue` derived.
- `Conversation` (`product.ts`) → `+ lanes?`/`broadcast?` + `linkedOfferId?` (Phase 6).
- `offersStore` → `+ duplicateOffer(id)` (Phase 4).
- Parked: a `modelApplication`/"needs models" stub on the class (V2 hooks only).

All 25 seed offers and the existing class conversations keep rendering — every field is optional with a sensible default, matching the additive convention used in the service and team finalisation plans.

---

## Open questions for the user

1. **Delivery step** — should In-person vs Virtual be its own wizard step (cleaner for virtual masterclasses), or a toggle folded into the existing `/new/locations` step (fewer steps)? This sets whether `TOTAL_STEPS.class` becomes 7.
2. **Per-occurrence override UI** — week cycler with ‹ › arrows (recommended, simpler) **or** the month-calendar click-through (more visual)? The client offered both on 26 May.
3. **Multi-day day pattern** — are course days assumed **consecutive** from the start date by default, with an "edit individual days" escape for weekly academies — or should the owner always pick each day? (Affects how the agenda scaffold and `sessions` generate.)
4. **Certificate reward mechanics** — is the "£X off next booking" a real voucher tied to the marketing/discount engine, or a prototype celebratory message only this pass? (Determines whether Phase 7 touches the marketing section.)
5. **Home & Analytics dependency** — neither a B2B Home nor an Analytics route exists yet. Confirm Phase 8 should wait for those sections (16 Jun: Analytics is a "big three"), and whether the class revenue breakout should be owned here or by the Analytics plan.
6. **Models & practice-clients** — confirm V1 ships **hooks only** (a "needs models" toggle + data stub), with the full application + "bring your own model" + contact-list blast + reusable-pool tagging deferred to V2, as the client implied on 26 May.
7. **Private-booking pricing** — for `private_group` classes the wizard already prices the whole group, not per-person. Confirm the revenue line should adapt (group total, not "N × £P") for that path.

*Implementation begins once the open questions are answered.*
