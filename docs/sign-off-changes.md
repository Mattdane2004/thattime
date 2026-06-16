# That Time — Sign-off Change Plan
> Source: "that time sign off" meeting, 15 Jun 2026 (Mathew, Shabbir, Vishal)
> Status: READY FOR IMPLEMENTATION — all open questions resolved 15 Jun 2026

---

## How to use this document

Each section below maps to a screen or area of the app. Every item has:
- **What**: the specific change requested
- **Where**: the exact file(s) to edit
- **Status**: `✅ Confirmed` | `⚠️ Needs clarification` | `🔜 Later / UI phase`

Work through sections in order. Update status as each item is completed.

---

## 1. Home Screen — ✅ IMPLEMENTED (15 Jun 2026)

**Files:** `src/app/app/page.tsx`, `src/components/app/UpNextCard.tsx`, `src/lib/data/dashboard.ts`, `src/lib/store/appStore.ts`
**Verified:** `tsc` + `next lint` + `npm run smoke` all green; checked live in browser preview (running-late + I'm-ready flows, reordered layout).

> A pre-implementation verification pass (5-lens transcript re-read + adversarial cross-check) corrected two items below (1.1 empty-state framing, and the running-late fixed/flexible note) and surfaced the missed 1.5 actions. Decisions confirmed with Mathew.

### 1.1 Move "Needs Attention" above the analytics section — ✅ DONE
- **What:** Moved "Needs Attention" to sit immediately after the Up Next card, before the Overview/analytics section. Was previously below Overview → Activity → Benchmark → Insights.
- **Why:** *"If things need attention, what if they don't scroll down there?"*
- **Up Next state (corrected):** The Up Next card already sits first in the page flow and already has rich states — an end-of-day empty state (*"That's everyone for today"* + "View tomorrow's schedule") and a cancelled/gap state ("X freed up" + "New booking" + share-link + "Next: … Show"). The earlier plan's "fixed/sticky at all times + add a New-booking CTA to the empty state" **over-read the transcript** (the 65%-real-estate point argued for moving Needs Attention up, not for pinning Up Next). No change needed there beyond removing the stray "Gap" label (below).
- **Status:** ✅ DONE

### 1.1b Remove the orphaned "Gap" label — ✅ DONE
- **What:** Removed the hardcoded `Gap` subtitle that sat under the "Up Next" heading in `UpNextCard.tsx`.
- **Status:** ✅ DONE

### 1.2 Remove "Busier than X% of nearby salons" benchmark card — ✅ DONE
- **What:** Removed the benchmark card (`BenchmarkCard`, owner-view only) and its render. The `BenchmarkCurve` chart + `benchmark` data remain available but unused.
- **Why:** Insufficient data to produce reliable benchmarks; bad UX for vendors who are not busy.
- **Status:** ✅ DONE

### 1.3 Make the "Grow an Agile Team" upsell card dismissable — ✅ DONE
- **What:** Added an × dismiss button to the solo-view upsell card (`GrowAddTeamCard`); when dismissed it renders nothing (slot freed for future rotating upsells — staff/features/education/products).
- **Status:** ✅ DONE

### 1.4 Replace revenue line graph with a dual-track progress bar — ✅ DONE
- **What:** Replaced the owner/solo revenue sparkline hero with `RevenueProgressCard`: a progress bar showing **collected** (dark fill, e.g. £2,100) against **estimated** (full track, e.g. £4,280), with a legend labelling both. Period selector retained. New `revenueProgress` data in `dashboard.ts` (replaced `revenueHero`). Staff earnings hero is unchanged.
- **Status:** ✅ DONE

### 1.5 "Running late" / "I'm ready" actions on the Up Next card — ✅ DONE
> Missed in the first Home outline; surfaced by the verification pass. Shabbir called these the two actions he was "waiting for."
- **Running late:** A secondary action on the Up Next card opens a "Running late?" sheet with +5 / +10 / +15 min options, each labelled with the cascade ("affects next 1/2/3 clients"). Selecting one sets the late state: the status pill and the action flip to an orange "N min late" treatment, with a "Diary shifted · next N clients notified" note. A "Clear — I'm back on time" action resets it. Mock behaviour (no real diary shift/notifications). No fixed-vs-flexible split in this UX — **corrected:** the meeting did conclude a fixed-duration rule (e.g. PT 60-min) is needed, but it belongs in **Settings**, not here (tracked under Schedule/Settings).
- **I'm ready:** One-tap toggle → "Client notified" with a check, telling the next waiting client to come in. Mock.
- **Where:** Secondary row below the main action buttons (message/reschedule/cancel/check-in), lower visual weight than Check In. State lives in the appt store (`lateBy`, `readySent`), resets when the card advances to the next appointment. Shown for `upcoming`/`arrived` only.
- **Also needed on the full appointment sheet** — tracked under 2.4.
- **Status:** ✅ DONE (Home Up Next card)

### 1.6 Lock-screen widget — countdown timer
- **What:** Native phone/iPad lock-screen widget showing a countdown for the in-progress service.
- **Status:** 🔜 Deferred — design + dev task, future sprint.

### 1.7 Behaviours raised in the meeting — 🔜 DEFERRED (tracked, not built)
Backend/logic behaviours tied to Home actions, out of scope for this MidFi visual pass:
- **Start-service duration timer** — capture how long services actually take to learn averages and flag "running short".
- **Check-in ping** — checking a client in notifies the staff member assigned to that booking.
- **Vendor-running-late notification** — the inverse of the existing customer-late automation (Mathew flagged he still needs to build it).
- **KPI tiles fade-right affordance** — the cut-off scroll row. Deferred to the dedicated UI/polish phase (per the meeting, card/animation polish is "UI phase").
- **Solo working-times/time-off reminder** — Shabbir's open question; Your Shifts kept as-is for now.
- **Status:** 🔜 Deferred

---

## 2. Schedule Screen — ✅ IMPLEMENTED (15 Jun 2026)

**Files:** `src/app/app/schedule/page.tsx`, `src/components/app/AppointmentSheet.tsx`, `src/lib/data/product.ts`, `src/lib/store/appStore.ts`
**Verified:** `tsc` + `next lint` + `npm run smoke` green; browser-verified every item (dispute banner, edit price/duration, running-late/ready, processing gap, pinch/⌘-wheel zoom, filter toggles, search, team hours, off-staff "Day off" columns, team week matrix, month view).
**Built this pass:** 2.1, 2.2, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.14. **2.3** was already satisfied (the appointment sheet already supports multiple `extras`); the real multiple-services gap is the quick-add flow (§6.1). **Deferred:** 2.13 (block/unblock — separate QuickActions task), 2.15 (drag), 2.16 (out-of-hours).

**Adversarial review (post-build) — 5 findings, all fixed:** month-day tap clamped to a 5-day window (extended `dayLabels` to the full month so jump-to-date + month tap navigate correctly); trackpad ⌘/ctrl-wheel zoom now uses a native non-passive listener so it no longer fights browser page-zoom; the Team Day/Week toggle now reuses the shared `Segmented` component; and `threeDayGrid` gained a no-show + outstanding-balance booking so the Calendar filter toggles visibly act.
**Known prototype limitation (pre-existing, not introduced):** the Calendar/My Day grids render static fixtures and don't vary by the selected day — the ‹ › arrows and month tap update the date label but not the grid content. Out of scope for this pass; flag if real per-day data is wanted.

### 2.x Schedule refinement pass (16 Jun 2026) — ✅ IMPLEMENTED
> Demo-review feedback on the pass-1 Schedule. Files: `schedule/page.tsx`, `AppointmentSheet.tsx`, `UpNextCard.tsx`. Verified green (`tsc`/`lint`/`smoke`) + browser-checked every item.

- **Actions consolidation** — Up Next card's inline buttons + running-late/ready pills collapse into one **Actions** button → a "Booking actions" bottom sheet (Message · Reschedule · Cancel · Running late · I'm ready); Check In stays primary. The appointment sheet gets a **⋮ header menu** with the same actions; its status pill + inline late/ready buttons + reschedule/cancel grid were removed.
- **Appointment detail → 3 columns** — Date / Time / Location row at the top of the sheet, under the title.
- **Multi-select filters** — category filter is now multi-select (empty = all), applied to My Day, Calendar **and** Team.
- **Full 24h grid + out-of-hours** — working hours (08–18) full height, out-of-hours condensed + tinted/labelled, the grid auto-scrolls to the working day on open; sticky page header. Applies to Calendar + Team (My Day shows a condensed out-of-hours block).
- **Calendar cards** — text anchored top-left; week density shows a service icon + client initials (no trailing text).
- **Team Day/Week toggle → Settings** — moved out of the Team view into Calendar Settings → Team layout.
- **Team Week redesign** — per-staff swimlane with per-day mini-timelines (a tick per booking); uses the vertical space.
- **Month view → vertical scroll** — all 12 months of 2026 stacked; header shows "Month 2026" and syncs on scroll; arrows step months.
- **View-aware date selector** — header shows the period for the active view (single day / 3-day range / week range / month); arrows step by that unit.
- **Deferred behaviour** (raised, not built): per-vendor-type running-late rule belongs in Settings; true per-day grid data (the static-fixture limitation above).

### 2.y Schedule refinement pass (16 Jun 2026, demo review #2) — ✅ IMPLEMENTED
> Files: `schedule/page.tsx`, `AppointmentSheet.tsx`, `product.ts`. Verified green (`tsc`/`lint`/`smoke`) + browser-checked.

- **Month view** — a darker "today" box on the current day; a floating **Today** button when you scroll off the current month (jumps back); tapping a day **zooms into a 3-day view centred on it**.
- **Booking card** — removed the repeated date/time from the body (already in the header); the top 3-column row now shows **With (staff) / Duration / Location**; the **⋮ actions menu moved to a circular button** at the left of the bottom Check In / Pay bar.
- **Sticky day-of-week headers** — "Thu 12" etc. stay pinned below the page header while the grid scrolls (Calendar + Team day mode).
- **Team week — major rework** — a **horizontally-scrollable** swimlane (all 7 days incl **Sunday**); one **taller row per staff** with a sticky-left identity cell (avatar + name + shift count); each day shows **condensed booking cards** or **"Off"**, making who's on and what they're booked clear; an **"Add team member & assign shift"** row adds a staff row with a chosen shift pattern. New `weekBookings` data per staff (Mon→Sun) replaces the old tick counts.

**Adversarial review of this pass — 5 findings, all fixed & re-verified:**
- *(med)* Sticky day-of-week headers were pinned at a hardcoded `156px` but the page header is ~166px (and grows with search), so labels were clipped → headers now pin to the **measured header height** (ResizeObserver), verified not clipped open or closed.
- *(med)* The team-week swimlane is a fixed Mon–Sun week but the date label read "Tue 3 – Mon 9" and the arrows were dead → label now reads **"Mon 2 – Sun 8"** and the arrows are disabled in team-week.
- *(med)* The team-week hid staff flagged off *today* (Priya, Jordan) even though they work most of the week → the week now shows the **whole roster** (each day self-reports "off").
- *(low)* Mini-card colour stripe fell back to near-black for most services (names not in the catalogue) → switched to a consistent token accent.

### 2.z Schedule tidy-up (16 Jun 2026) — ✅ IMPLEMENTED
- **Team-week clipping fixed** — the scroll container's left padding left an 8px sliver where booking cards showed beside the sticky staff column; removed it and made the identity column opaque (`z-30` + right edge) so cards cut cleanly at its border.
- **Calendar grid lines** — hour rules bumped from faint (`/60`) to solid `border-border` (working hours) so the grid reads clearly.
- **Team-week add / assign** — "Add team member" is its **own left column** (circular ＋ with label, matching the design ref).

### 2.z2 Team-week polish (16 Jun 2026) — ✅ IMPLEMENTED
- **Header clipping fixed** — the sticky staff column was `z-30` (== the page header) so it painted *over* the header when scrolling; dropped to `z-20` so it tucks **under** the header (still above the booking cards).
- **Identity cells centre-aligned** — avatar / name / shift-count now centred in the column.
- **Per-staff "Assign shift" buttons removed** — the single entry point is the bottom **"Add team member"** column.
- **Richer shift editor** — "Add team member" now opens an **"Assign shift"** sheet with: a **team-member dropdown** (any existing member *or* "New team member" + name field), and a **per-day Mon–Sun** list where each day has an **on/off toggle** and **start–end time selectors** (06:00–22:00, half-hourly). Saving applies the off-days to the swimlane (override for existing staff; new `weekBookings` for a new member).

### 2.1 Appointment card — active dispute banner
- **What:** If a client has an active payment dispute, show a prominent urgency banner at the top of the appointment card (inside the sheet). Not subtle — big heading-level alert.
- **Where:** `AppointmentSheet.tsx` — add a conditional dispute banner at the top of the sheet content.
- **Status:** ✅ Confirmed

### 2.2 Appointment card — edit service price and duration
- **What:** Allow vendors to edit the price and duration of a service directly from the appointment card (e.g. a colour that always runs 2h but was booked for 90 min).
- **Where:** `AppointmentSheet.tsx` — add inline edit affordances to the service/price detail rows.
- **Status:** ✅ Confirmed

### 2.3 Appointment card — add multiple services
- **What:** The "add service" action from inside an appointment currently only adds one service. Must support multiple services in a single appointment.
- **Status:** ✅ Confirmed

### 2.4 Appointment card — "Running late" / "I'm ready" buttons
- **What:** Same buttons as on the Home Up Next card (see 1.5) — also needed on the appointment sheet.
- **Status:** ✅ Confirmed (same clarifications apply)

### 2.5 Gap / processing time in the calendar
- **What:** When a bundle appointment includes a processing gap (e.g. 30 min colour sitting), this gap must be visually represented in the calendar. Label it "Processing time" or similar — not "free time" or an open slot. The gap should not trigger "book someone in" from inside the appointment card; the calendar handles that separately.
- **Status:** ✅ Confirmed

### 2.6 Replace zoom slider with pinch-to-zoom
- **What:** Remove the density/zoom slider from the calendar settings. Implement pinch-to-zoom gesture to change calendar block size (as in Google Calendar / Apple Calendar).
- **Status:** ✅ Confirmed

### 2.7 Calendar filter — add toggles for cancelled / no-shows / outstanding balances
- **What:** Add filter toggles to the Calendar settings sheet: show/hide cancelled appointments, no-shows, and clients with outstanding balances.
- **Status:** ✅ Confirmed

### 2.8 Calendar — add search bar
- **What:** Add a search bar to find a client within the calendar view (so a vendor can quickly locate an appointment when a client calls).
- **Status:** ✅ Confirmed

### 2.9 Team view — replace job title with working hours in column headers
- **What:** Staff column headers in the Team calendar view currently show name + job title (e.g. "Senior Stylist"). Change the sub-label to show that staff member's working hours for that day instead.
- **Status:** ✅ Confirmed

### 2.10 Team view — show staff who are off
- **What:** Team view currently only shows staff who are working that day. Add the ability to see staff who are off (so you can contact/call them in if needed). Off-day columns should be visually distinct.
- **Status:** ✅ Confirmed

### 2.11 Week view — team calendar
- **What:** Add a week view to the Team calendar (currently only Day and 3-Day). Vishal referenced the existing (ugly) Fresher week view as the baseline — this needs to be at least as capable.
- **Status:** ✅ Confirmed — high priority

### 2.12 Month view
- **What:** Add a month view. This is a **snapshot / busyness overview** — not a detailed agenda. Modelled visually on the existing mini-calendar in the Calendar settings sheet (colour dots per day), but full-screen and interactive.
  - Shows the **currently selected location only** (respects the location picker on Home — does not aggregate across locations)
  - Every day of the month is shown as a cell with a visual busyness indicator
  - Day states needed (match the mini-calendar dot colour language already established):
    - **Day off** — greyed out / no dot
    - **Fully booked** — solid filled indicator (e.g. green dot or full bar)
    - **Partially open** — partial indicator (e.g. amber dot or half bar)
    - **Normal / light** — minimal or no indicator
  - Tapping a day navigates to that day's My Day or Calendar view
- **Status:** ✅ Confirmed

### 2.13 Block/unblock fail-safe UX fix
- **What:** Current UX: if you accidentally unblock a section of an off-day, you can't re-block it without adding a new block on top — backwards and confusing. Design a cleaner approach: "unblocking" within a blocked period should either remove/trim the block rather than creating an open slot, or immediately present a re-block confirmation.
- **Status:** ✅ Confirmed — this is a known UX bug

### 2.14 Remove the status bar — repurpose the space
- **What:** Remove the Upcoming → Arrived → In Progress → Done lifecycle bar from the appointment sheet entirely. Vendors won't use it manually in practice. The space freed up should be repurposed — consider using it for:
  - The "Running late" / "I'm ready" actions (currently orphaned as floating buttons)
  - A compact appointment timeline (start time, duration remaining, end time) as a passive display
  - Quick contextual actions relevant to where the appointment is in its lifecycle
- **Note:** The Check In action remains — it stays on the Up Next card and on the appointment sheet header. Only the step-progress bar itself is removed.
- **Status:** ✅ Confirmed — remove the bar, propose use of reclaimed space

### 2.15 Click-and-drag appointments (UI phase)
- **What:** Implement drag-to-reschedule on calendar blocks. Show a confirmation pop-up when an appointment is moved.
- **Status:** 🔜 UI phase

### 2.16 Out-of-hours bookings (design later)
- **What:** Allow vendors to book outside their set working hours (e.g. a favour for a friend at 10pm), with an optional out-of-hours surcharge.
- **Status:** 🔜 Flag for design — impacts calendar and pricing

---

## 3. Classes (within Schedule)

**Files:** `src/app/app/schedule/page.tsx` (class sheet section)

### 3.1 Group chat for class attendees — scoped to class only
- **What:** "Message All" from the class card creates a group chat with all attendees. This should be scoped exclusively to class bookings — no freeform group creation by vendors. After the class ends, the group chat should be archived/blocked to prevent it being used as a free marketing channel.
- **Why:** Prevent vendors bypassing the paid marketing feature via group chats.
- **Status:** ✅ Done — implemented under [§5.3](#53-class-group-chats--auto-create-and-auto-archive--done) (active `cls-colour` wired from Schedule "Message all"; archived `cls-bridal` read-only; freeform group creation blocked in Compose).

---

## 4. Clients Screen — ✅ IMPLEMENTED (16 Jun 2026)

**Files:** `src/app/app/clients/page.tsx`, `src/app/app/clients/[id]/page.tsx`
**Verified:** `tsc` + `next lint` + `npm run smoke` green; browser-verified every item.
**Built this pass** (decisions from the demo review): the **"Message" button became "Contact"** opening a bottom sheet with **Call · WhatsApp · Send a message · Copy number**. **Overview reordered** so allergies stay at the top for visibility and **Needs Attention moved up** beneath them (tabs kept). **Allergy editor** gained an optional **Notes** field for every type (was Note-only), shown on the expanded record card. **Completed forms** gained a **Download** button. The clients-list **bulk-tag sheet** gained **search-or-create** ("Create '…'") so new tags can be made on the fly.

**Profile header → built to the Figma** ([node 12273-24328](https://www.figma.com/design/6HHqcoM9m33N8Kz4R5E4tO/ThatTime---Internal?node-id=12273-24328)): centred avatar with the status badge on its lower edge; centred name; tags row with an **"Add +"** chip (opens the Tags sheet to pick/create); a **bordered three-column stats card** — Total Bookings / Total Sales / Rating; and **Contact · Book now** moved into a **pinned bottom action bar**. The **bottom tab nav is now hidden on the client detail pages** (and sub-pages) — a focused, back-arrow flow with its own action bar — while the clients list keeps it (`AppTabBar` hides on `/app/clients/`).

**Merge duplicates → pick the primary:** the merge sheet now lets the user **select which variant to keep as the primary profile** (variants can have slightly different names, e.g. "Sarah Johnson" vs "S. Johnson"); the chosen one shows a **Primary** badge and the others merge into it ("Merge into …" + "Merged into …" reflect the selection).

### 4.1 Client list — ability to create new tags
- **What:** The bulk-tag sheet currently shows fixed tags (VIP, Regular, New, Inactive). Add the ability to create a new custom tag from this sheet.
- **Status:** ✅ Confirmed

### 4.2 Client profile — reorder the page layout
- **What:** Rearrange the client detail page in this order:
  1. Profile header (name, avatar, contact action buttons — call, WhatsApp, message — at the top)
  2. Key stats (total visits, lifetime spend, rebook rate)
  3. Needs Attention (if present — must be above the fold)
  4. Wallet / Loyalty
  5. Upcoming appointments
  6. Records (notes, forms, allergies, patch tests)
- **Why:** *"If I spent two grand with me already… I need to make sure I look after her."* High-value info should be immediately visible.
- **Status:** ✅ Confirmed

### 4.3 Client profile — contact buttons at the top
- **What:** Move call, WhatsApp, and message quick-action buttons to the top of the profile page, near the header — not buried at the bottom.
- **Status:** ✅ Confirmed (part of 4.2 reorder)

### 4.4 Records — forms: add download option
- **What:** On the forms list within a client's records, add an option to download each form.
- **Status:** ✅ Confirmed

### 4.5 Records — allergies: add notes field
- **What:** Each allergy record should have an optional free-text notes/details field.
- **Status:** ✅ Confirmed

---

## 5. Messages Screen — ✅ IMPLEMENTED (16 Jun 2026)

**Files:** `src/app/app/messages/page.tsx`, `src/app/app/messages/[id]/page.tsx`, `src/lib/data/product.ts` (`conversations` + `Conversation` type), `src/components/ui/organisms/AppHeader.tsx` (new optional `action` slot), `src/app/app/schedule/page.tsx` (ClassSheet "Message all" route).
**Verified:** `tsc` + `next lint` + `npm run smoke` green; browser-verified every flow (list, active class thread, "+" sheet contextual to kind, media attach, payment-link bubble, archived read-only, fresh compose) with no console errors.

**Adversarial review (16 Jun 2026) — 3 confirmed, 2 fixed + 1 deferred nit.** (1, high) the thread resolver silently fell back to the *first* conversation (Emily Davis) for any unmatched id — and `AppointmentSheet` routes by first-name slug, so most appointment clients (Olivia, Mia, Grace…) opened Emily's thread. **Fixed:** an unknown non-empty id now opens a **fresh thread for that person** (name decoded from the slug), never another client's conversation. (2, medium) "Reschedule" was offered on fresh client threads that surface no appointment. **Fixed:** the Reschedule action is now gated on `!fresh` (same condition as the pinned card). (3, nit) "Log payment" jumps to the generic `/app/checkout` without client/amount context — **left as-is** (intentional in-person-checkout handoff; wiring checkout context belongs to §6).

**Built this pass.** The conversation thread now renders four shapes from one screen — **client** (1:1 booking chat), **group** (internal salon team), **class** (broadcast), **business** (supplier) — keyed off the conversation kind. The composer **"+"** opens **one sheet, two groups**: **Send** (Photo / Video / File) is always present; **Actions** (New appointment · Reschedule · Send payment link · Log payment) shows for **client** conversations only — other kinds get a contextual note instead of dead booking controls. Media picks **stage as a removable pending chip** above the input and send as an attachment bubble. **Send payment link** opens a sheet that **requires an amount** (± quick-amount chips) and a "For" note before it posts a **payment-request bubble** (amount · note · Pay now · "Awaiting payment"). **Compose** is a header pencil → a **New message** sheet listing **clients + team members** (searchable, 1:1 only) — **no freeform group creation** (a footnote states groups come from classes). **Class chats** are auto-managed: an **active** class group (broadcast banner, read-write) and an **archived** one ("Ended" badge in the list, "class has ended — read-only" banner, composer replaced by an archived note). The Schedule class card **"Message all"** now lands in the class group thread (`/app/messages/cls-colour`). Data enriched to 6 client threads + team / class / supplier / archived-class threads with varied unread badges.

### 5.1 Add media attachments in chat — ✅ DONE
- **What:** The "+" button in the chat input currently opens appointment management actions. Add the ability to send pictures, videos, and files from this menu.
- **Built:** "+" sheet now has a **Send** group (Photo / Video / File); a pick stages a removable pending attachment which sends as an image/video/file bubble. Available in every conversation kind.
- **Status:** ✅ Done

### 5.2 Payment link from chat — ✅ DONE
- **What:** Add a "Send payment link" action to the chat (accessible via the "+" menu or a dedicated button).
- **Built:** "Send payment link" (client Actions group) → a sheet that **requires an amount** (quick chips £20/£35/£55/£85) + a "For" note, then posts a payment-request bubble with a Pay-now CTA and "Awaiting payment" status.
- **Status:** ✅ Done

### 5.3 Class group chats — auto-create and auto-archive — ✅ DONE
- **What:** The messaging feature requirement from the meeting is specifically about class group chats:
  - When a vendor taps "Message All" from the class card, a group chat is automatically created with all class attendees
  - This group chat is **scoped to the class** — vendors cannot create freeform group chats (protects the paid marketing feature)
  - Once the class ends, the group chat is automatically **archived** (accessible in history but no longer active)
  - Show archived class chats in the messages list with a distinct "Ended" or archived visual state
- **Built:** Active class group `cls-colour` (broadcast banner "sent to everyone booked on this class", sender-labelled bubbles, read-write) wired from Schedule "Message all". Archived class group `cls-bridal` shows an **"Ended"** badge + dimmed row in the list, an archived banner in the thread, and a **read-only** composer. Compose blocks freeform groups (clients + team 1:1 only).
- **Note:** General block/archive/delete GDPR controls are noted but deferred to a later session pending due diligence.
- **Status:** ✅ Done for class chats; general GDPR controls deferred. (Same item as §3.1.)

### 5.4 No compose / new message button — ✅ DONE
- **What:** There is no way to initiate a new conversation from the messages list. Add a compose button (pencil/FAB or header button).
- **Built:** A **pencil action** in the Messages header (via a new optional `action` slot on `AppHeader`) opens a **New message** sheet — searchable **Clients** + **Team members** lists, 1:1 only. Picking a recipient opens/creates that thread (the thread resolver falls back to `clientRows`/`teamColumns` and shows an empty "start of your conversation" state for first contact).
- **Status:** ✅ Done

### 5.5 Sparse mock data — add more conversations — ✅ DONE
- **What:** Currently only one client thread is visible. Populate with at least 4–5 client conversations and 2–3 team/business threads including at least one unread message (to demonstrate the unread badge pattern).
- **Built:** 6 client threads (Emily 2 · Sarah · Robert 1 · Lisa · Amanda · Jessica) + Salon team (3 unread) + active + archived class groups + Bloom Hair Supplies. Unread dots and count badges demonstrated across both sections.
- **Status:** ✅ Done

---

## 6. Quick Actions & Checkout — ✅ IMPLEMENTED (16 Jun 2026)

**Files:** `src/components/app/QuickActions.tsx` (New Appointment + Log Payment), `src/app/app/checkout/page.tsx`, `src/lib/store/appStore.ts` (checkout math), `src/lib/data/product.ts` (outstanding balances, deposit, saved cards).
**Verified:** `tsc` + `next lint` + `npm run smoke` green; browser-verified every flow with no console errors.
**Source:** re-checked against the *"that time sign off"* Granola session (15 Jun, Shabbir & Vishal) — every point captured; tipping and post-checkout rating confirmed no-change; tax/VAT and receipts were not discussed, so untouched.

**Adversarial review (16 Jun 2026) — 4 confirmed, all fixed.** (high) a multi-service booking collapsed to one string + lead staff when written to the calendar, and (medium) the custom-appointment detail sheet showed the *date* in the duration slot → **fixed:** the store now carries the summed `duration`, a staff summary, and an `outOfHours` flag; the schedule card shows the real duration + an "OOH" tag and the detail sheet shows the true duration. (low) an out-of-hours slot stayed selected with no visible chip once the panel was collapsed → **fixed:** the slots stay visible while a slot is selected. (nit) the add-card copy promised persistence the prototype doesn't show → **fixed:** copy softened to the charge action.

**Built this pass.** **Add Appointment** is now **multi-service** (toggle several services; price + duration sum) with **per-service staff** assignment, and an **out-of-hours** section: the picker exposes early/late slots (working day 09:00–16:00) and booking one surfaces an **out-of-hours surcharge** (toggle + £ amount) that flows into the review total. **Log Payment** opens a **client picker** for *any* client — those who **owe a balance float to the top, highlighted** — and picking one opens checkout seeded with their outstanding balance. **Checkout discount** became a single sheet with a **percentage ⇄ amount toggle**, presets, a custom input, and a **live pound value** ("20% = −£28"). **Payment methods** were re-grouped into the primary trio **Cash · Card on file · Payment link** plus an **Other** row (Card machine, Gift card, Other); **Card on file** opens a sheet of saved cards (brand + last 4) with **Add a new card** (and goes straight to add-card when none are saved); **Payment link** captures an amount and sends a request. **Deposits** taken at booking show as a credit and reduce the remaining balance (and appear on the paid screen). **Platform fee** is a **3-card chooser — Client pays · Split 50/50 · You absorb** — that recalculates the bill and a **"You receive" payout** line (fee = 5% of the post-discount bill). The pre-existing inline-hex in the gift-card warning was also converted to tokens.

### 6.1 Add Appointment — multiple services — ✅ DONE
- **What:** allow adding multiple services to one appointment (was single-select). *"That's going to piss people off."*
- **Built:** multi-select service step with running total; **per-service staff** (decision: each service → its own stylist); summed price + duration; review lists every service with its staff. Plus out-of-hours booking + surcharge (see below).
- **Status:** ✅ Done

### 6.2 Add Client — pronouns as free-text field — ✅ DONE
- **What:** keep pronouns as free text, not a dropdown.
- **Built:** already a free-text input in the "More details" section — verified.
- **Status:** ✅ Done

### 6.3 Log Payment — any client, highlight outstanding — ✅ DONE
- **What:** any client selectable (not just upcoming); outstanding balances highlighted.
- **Built:** a searchable client picker; owed clients sorted to the top with a warning tint + "Owes £X"; selecting seeds checkout with the outstanding balance.
- **Status:** ✅ Done

### 6.4 Checkout — custom discount (% and amount) — ✅ DONE
- **What:** custom percentage + custom amount, a mode toggle, and a live £ value.
- **Built:** percentage ⇄ amount toggle, presets, custom numeric input, live "20% = −£28" readout; applies to the whole bill before tip.
- **Status:** ✅ Done

### 6.5 Checkout — payment methods + card on file — ✅ DONE
- **What:** primary trio Cash / Card on file / Payment link, rest under Other; card-on-file sheet with saved cards + Add new (no card → straight to add-card).
- **Built:** exactly that. Old single "Card" method became "Card machine" under Other; saved cards from `savedCards`; add-card form; payment-link request sheet.
- **Status:** ✅ Done

### 6.6 Checkout — deposit / prepayment clarity — ✅ DONE
- **What:** show prepaid deposit + remaining balance clearly.
- **Built:** deposit (e.g. £40 on the first booking) shows as "Deposit paid at booking −£40", reduces Remaining, and appears on the paid screen.
- **Status:** ✅ Done

### 6.7 Platform fee — who pays (new, from the session) — ✅ DONE
- **What:** *"show the platform fee as a line item in the subtotal section."* Decision: the owner chooses per sale — **client pays / split / absorb**.
- **Built:** a 3-card chooser that recalculates the client total and a **"You receive"** payout line (5% of the post-discount bill).
- **Status:** ✅ Done

### 6.8 Out-of-hours booking + surcharge (new, from the session) — ✅ DONE
- **What:** *"allow users to book an appointment out of hours and set a surcharge … in the appointment flow when selecting times … intentional and well thought out."*
- **Built:** the time step exposes early/late slots; selecting one reveals a surcharge panel (toggle + editable £) that flows into the review total with an "Out of hours" tag. (Settings-level surcharge config remains for the future Stripe/settings phase.)
- **Status:** ✅ Done

### 6.9 Checkout rework — stepped POS flow (demo feedback, 16 Jun 2026) — ✅ DONE
- **Feedback:** the single checkout page felt *dense and busy*; the Log Payment picker rows collided when a client had an overdue balance and lacked New-client/Walk-in options; payment methods were visually inconsistent (cards vs pills) and should hide secondary options under a collapsible title; deposit visibility was unclear; and selecting a client with no balance dumped the user on a blank checkout — "not every payment is a service: it could be a product, membership, gift card…". Break it into clear steps and cover every edge case (product-only, walk-in, gift card with the can't-pay-a-gift-card-with-a-gift-card rule).
- **Designed via** a 3-architecture design workflow (POS-classic / fewest-taps / edge-complete) → synthesis → completeness critic.
- **Built:** a **stepped state machine** — **Who** (reworked Log Payment picker: search + New client + Walk-in + spaced owed cards) → **What** (type fork: Service · Product · Membership · Gift card · Class · Other) → **Build** (type-specific catalogue) → **Review** (calm summary; Discount/Tip as quiet rows; platform-fee 3-card chooser collapsed into an expandable row; **explicit deposit badge + "Deposit paid at booking" line**) → **Pay** (one **uniform method list** + a collapsible **"More ways to pay"**) → **Done**. An appointment checkout (bill pre-built) lands straight on Review; a Log Payment of an owed client jumps to Review; a settled/walk-in/new client goes to What (never a blank bill).
- **Edge cases:** gift-card SKU removed from products so a sold gift card is `kind:"giftcard"` only → the **can't-pay-a-gift-card-with-a-gift-card** rule is enforced on the bill (tender disabled while one is in the cart); **walk-in/new client** disables Card-on-file + Payment link with a reason; **change-due** shown on cash; **deposit > bill** surfaces a refund/credit note; **£0 bill** completes straight to Done; mixed carts via Review's "+ Add item"; an explicit `entryContext` flag set at every entry point so appointment-vs-logpay is never ambiguous on refresh.
- **Decisions:** mixed cart (yes) · platform fee as a quiet expandable row · refunds/voids + no-show-fee charging scoped as a **follow-up** (an ad-hoc fee can be recorded via "Other" today).
- **Adversarial review (16 Jun 2026) — 7 confirmed, all fixed.** (high) removing a deposit-held item left a dead-end → the Review CTA now becomes **"Refund deposit · £X"** routing to the paid/refund screen; (medium) no way to close a partial collection → a **"Leave £X owing · finish later"** action on Pay + a "left to collect" note on the paid screen; (medium) sparse membership/class catalogues had no empty state → added; (low) flat discount over-displayed after item removal → clamped in `checkoutTotals`; (low) the messages "Log payment" dropped the client's outstanding → now seeds it; (low) the platform-fee row advertised the gross fee while absorbing → made bearer-aware ("You absorb · −£X payout"); (nit) dead conditional in the What-step prompt → removed.
- **Status:** ✅ Done

### 6.10 Checkout → hub-and-spoke (demo feedback, 16 Jun 2026) — ✅ DONE
- **Feedback:** the stepped flow was inconsistent (client = bottom sheet, services = full screen) and over-linear. Wanted a **hub** that opens with **empty states** for client + items, with everything edited via spokes: open the checkout page → click into the client/items to add or assign; add service/product via a **bottom sheet with search + group filtering**; **change the client** by clicking the client card; **edit product quantity** on the checkout screen; keep the discount/tip/fee section but put the **"Platform fee" title on one line** with the bearer + amount on two; and have payment methods on the screen that **open an amount sheet and record the payment**, finalising only when the operator taps **Complete** — not auto-checkout the moment it's paid off.
- **Designed via** a 3-architecture design workflow (the synthesis recommended the stepped rail; the user course-corrected to hub-and-spoke, which we then built).
- **Built:** the checkout is now a single **hub** — editable **Client card** (empty "Add a client" state → picker spoke that also surfaces owed clients + New client + Walk-in; assigning seeds any outstanding balance without wiping the cart); **Items** with an empty state, each with a remove **X** and **tap-to-edit** (an Edit-item sheet with a quantity stepper + a price override; **services have no quantity**, price-override only); a searchable, category-filtered **Add-item bottom sheet** (type chips Services/Products/Memberships/Gift cards/Classes/Other; services added as a single select, products/etc. with quantity); the **Discount/Tip/Platform-fee** section (fee row title on one line, "You absorb" + amount stacked); totals; a removable **Payments-taken** list; **Take-payment** method rows that open amount sheets and **record** the payment; and a sticky **Complete sale** button — **payments no longer auto-checkout**, the operator finalises when ready. New store actions `startBlankCheckout` (empty hub for Log Payment) and `setCheckoutClient` (reassign without wiping); the old upfront Log-Payment picker sheet was removed (it's now a hub spoke).
- **Item editing + Add-sheet (follow-up feedback):** the inline qty counter on hub items was replaced with a plain **X** plus **tap-to-edit** (Edit-item sheet: quantity stepper + price override, this sale only). **Services carry no quantity** — price-override only, and a single-select (checkbox) in the Add sheet; products/memberships/classes keep quantities (`−n+` rows). Add-item **group filtering** now covers **Products** too (Hair care / Styling chips); memberships/classes stay search-only (1–3 published, chips redundant). New store action `updateItem(id, {qty, price})`.
- **Known minor:** changing the payer after money's been taken carries the recorded payments over — left as a rare, recoverable edge (each payment stays removable in "Payments taken").
- **Status:** ✅ Done

---

## 7. Onboarding

**Files:** `src/app/onboarding/` (or equivalent route)

> Note: Onboarding was largely signed off in this session. Items below are the outstanding additions only.

### 7.1 Phone number capture after social login
- **What:** After Apple/Google/Facebook sign-in, add a step to capture phone number (and show email for verification/correction), since social providers don't supply a phone number.
- **Status:** ✅ Confirmed

### 7.2 Loading screen — add a loader
- **What:** Buffer time between screens needs either an animation or a "did you know"-style fact/tip display (the "Let's talk bookings" screen already does this — use as reference).
- **Status:** ✅ Confirmed

### 7.3 Staff schedule screen — editable if owner permits
- **What:** If the business owner has allowed staff to manage their own schedule, the schedule setup screen in onboarding should be editable rather than read-only.
- **Status:** ✅ Confirmed

---

## 8. Cross-cutting / Global

### 8.1 Horizontal scroll rows — add fade-right affordance
- **What:** The KPI tiles row on Home and the filter chips row on Clients both truncate without indicating they scroll. Add a fade-to-transparent right edge on any horizontally scrolling container.
- **Files:** `src/app/app/page.tsx` (KPI row), `src/app/app/clients/page.tsx` (filter chips)
- **Status:** ✅ Confirmed (identified in pre-meeting audit, consistent with feedback)

---

## Resolved Decisions (15 Jun 2026)

All open questions resolved in follow-up with Mathew. Recorded here for reference.

| # | Question | Decision |
|---|---|---|
| Q1 | Revenue stats format | Replace line graph with dual-track progress bar: captured (dark) vs. estimated (light). Label both values explicitly. Period selector retained. |
| Q2 | Running late cascade | The Home/appointment-card UX cascades all services the same way — delay pushes subsequent clients back; vendor may claw time back mid-appointment; affected clients get an automated notification with the overrun amount. **Correction:** the meeting did conclude a fixed-duration rule is needed (e.g. a PT's 60-min session can't make up time) — but it lives in **Settings**, not on the card. Tracked under Schedule/Settings, not built in the Home pass. |
| Q3 | Appointment status bar | Remove entirely. Repurpose space for "Running late" / "I'm ready" actions and a passive time display. |
| Q4 | Month view — multi-location | Currently selected location only. Respects the location picker. No cross-location aggregation. |
| Q5 | Messages GDPR scope | Scoped to class group chats only for this sprint: auto-create on "Message All", auto-archive when class ends. General block/delete/archive deferred. |
| Q6 | Up Next empty state | Fixed at top always. Empty state shows "New booking" CTA. Needs Attention always follows it. |
| Q7 | Card on file in checkout | Show saved cards as a selectable list in a bottom sheet, with "Add new card" at the bottom. |

---

## Sections Not Yet Designed (out of scope for this sprint)

For reference — these were called out in the meeting as next up after sign-off:

| Section | Notes |
|---|---|
| Consultation Forms | Flagged as one of the biggest missing pieces |
| Marketing (incl. Filler Chair) | Links to Analytics |
| Analytics | Vishal: "Don't involve me in that conversation. Or do it really early in the morning." |
| Payments / Payouts / Stripe | Interface with Stripe payout dashboard |
| Settings | Not yet started |
| Services setup | ~70–75% done — one more focused session needed |
| Team Management | ~80–85% done |
| Business & Profile | Opening times, booking links, gallery, cancellation policy |

---

## Delivery target

> Updates to current screens sent back on demo stand by **Tuesday/Wednesday 17–18 Jun**.
> Wednesday session to green-light all remaining screens.
> Then: Services + Team Management → new sections.
