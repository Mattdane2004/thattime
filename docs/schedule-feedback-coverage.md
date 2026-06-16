# Schedule — feedback coverage summary
> Compares the implemented Schedule section against the client feedback recorded in Granola
> (That Time **sign-off**, 15 Jun 2026 — Shabbir & Vishal) plus the **demo-review refinements** (16 Jun).
> Files: `src/app/app/schedule/page.tsx`, `src/components/app/AppointmentSheet.tsx`, `src/components/app/UpNextCard.tsx`, `src/lib/data/product.ts`, `src/lib/store/appStore.ts`.

---

## 1. What was built (two passes)

**Pass 1 — feature build** addressed the bulk of the sign-off list: dispute banner, edit price/duration, processing-time gaps, running-late / I'm-ready, removal of the status bar, pinch-to-zoom, filter toggles, client search, team working-hours headers, off-staff columns, team week view, and a month view.

**Pass 2 — demo-review refinement** reshaped the presentation: actions consolidated behind an **Actions sheet / ⋮ menu**, a **3-column Date/Time/Location** detail, **multi-select filters** applied across all views, a **full 24h grid** with condensed out-of-hours, **top-left** card text + **initials/icon** week cards, the **team Day/Week toggle moved into Settings**, a **per-staff swimlane** team-week, **vertically-scrolling** month view, and a **view-aware date selector**.

---

## 2. Feedback coverage (Granola sign-off, 15 Jun)

| # | Feedback | Status | How it's addressed |
|---|----------|--------|--------------------|
| **Appointment card** |
| Edit price & duration | ✅ Done | Pencil on the service row → "Edit service" sheet (price £ + duration). |
| Gap / processing time | ✅ Done | `processing` block kind — a dashed, non-interactive "Processing time" block in the grid; not a bookable slot. |
| Dispute banner | ✅ Done | Red "Active payment dispute" banner pinned at the top of the sheet (demo: David Wilson). |
| "Running late" action | ✅ Done | In the Actions sheet / ⋮ menu → +5/+10/+15 picker; cascades to next 1/2/3 clients + notify. |
| "I'm ready" action | ✅ Done | In the Actions sheet / ⋮ menu → "Client notified" confirmation. |
| Status bar automation | ⚠️ Diverged | **Removed** the manual step bar (your confirmed decision Q3) rather than auto-advancing it; lifecycle now advances via the bottom Check In → Start → Done / Pay CTA. *(Granola wording was "automate"; we removed per your later call — flag if you'd rather auto-advance a visible bar.)* |
| Layout too Fresha-like (differentiate) | ⚠️ Partial | Structure changed materially (⋮ menu, 3-col detail, status bar gone) — but full visual differentiation is a **UI-phase** task. |
| **Team view** |
| Column header → working hours | ✅ Done | Headers show that day's hours (e.g. "09:00 – 17:00") instead of job title. |
| **Month view** |
| Add a month view | ✅ Done | 4th Calendar layout; all 12 months of 2026, vertically scrollable. |
| Days off + open/filling/full states | ✅ Done | Per-day busyness dots (green/amber/red) + Sundays shown "Off". |
| Team-mode month = all members' appts + filter | ❌ Not done | Month is a single **location** busyness snapshot; there is no team-scoped month view. **Gap.** |
| **Week view** |
| Add week view to individual calendar | ✅ Done | Calendar Week layout (existed) + the team-week swimlane redesign. |
| **Filters & search** |
| Filter toggles: cancelled / no-shows / outstanding | ✅ Done | "Show on calendar" toggles in Settings; act on real demo data; apply to Calendar + Team. |
| Multi-select filters across views | ✅ Done | Category filter is multi-select (empty = all), applied to My Day, Calendar, Team. |
| Search bar | ✅ Done | Toolbar search → matches client bookings → opens the appointment. |
| **Calendar (general)** |
| Pinch-to-zoom | ✅ Done | Two-finger pinch + ⌘/ctrl-wheel (native non-passive listener); scales the day grid. |
| Out-of-hours visible (scroll past shift) | ✅ Done | Full 24h grid; working hours full height, out-of-hours condensed + "OUT OF HOURS" band; auto-centres on the working day. |
| Tile iconography (paid / form / note / attention) | ⚠️ Partial | Attention dot (unconfirmed/no-show) + processing/break/bundle icons + week service icon exist; dedicated paid / form / note badges are **UI-phase**, not built. |
| Block/unblock day logic fix | ❌ Deferred | Lives in the QuickActions block flow; explicitly deferred to a focused follow-up (item 2.13). **Not addressed.** |
| **Booking actions (mostly outside Schedule)** |
| New booking: multiple services | ❌ Not in Schedule | The appointment **sheet** already supports multiple services; the **quick-add "New booking" flow** still allows one — that's §6 (Quick Actions), not yet built. |
| New booking: out-of-hours + surcharge | ⚠️ Partial | The calendar now **shows & lets you tap** out-of-hours slots; the **surcharge** option in the booking flow is not built (§6 / deferred 2.16). |
| Checkout: custom discounts, payment methods, card-on-file, platform fee, prepaid deposit | ➖ Out of scope | Belongs to **§6 Quick Actions / Checkout**, not the Schedule section. |
| Log Payment: highlight outstanding balances | ➖ Out of scope | Belongs to **§6 Quick Actions / Log Payment**. |
| **Approved — no change needed** |
| Card quick actions (reschedule/cancel/add service/forms/notes) | ✅ Kept | Reorganised into the Actions sheet / ⋮ menu; all still present. |
| Class view (attendees, mark arrived, message all, agenda) | ✅ Kept | Unchanged. |

---

## 3. Refinements delivered beyond the original list (16 Jun demo review)
These came from the follow-up demo review and refine *how* the above is presented:
- **Actions consolidation** — one Actions button (Up Next) / ⋮ menu (appointment sheet) holding Message, Reschedule, Cancel, Running late, I'm ready.
- **3-column Date / Time / Location** detail row at the top of the appointment sheet.
- **Full 24h grid** with condensed, labelled out-of-hours, auto-centred on the working day; sticky header.
- **Top-left card text**; **week cards** show a service icon + client initials.
- **Team Day/Week toggle → Settings**; **team-week swimlane** with per-day mini-timelines.
- **Vertically-scrolling month** (Jan–Dec); **view-aware date selector** (single day / 3-day range / week range / "March 2026").

---

## 4. Not yet addressed — the gaps to close before final sign-off (Wed 18 Jun)

1. **Block / unblock day logic fix** (2.13) — the backwards re-block behaviour. Deferred to a focused QuickActions task; still open.
2. **Team-mode month view** — month showing all team members' appointments with filtering. Current month is a location-level busyness snapshot only.
3. **Calendar tile iconography** — at-a-glance paid / consultation-form / note badges on calendar tiles. UI-phase; only the attention dot exists today.
4. **Appointment-card visual differentiation** from Fresha — structure changed, full visual treatment is UI-phase.
5. **New-booking "multiple services"** and **out-of-hours surcharge** — live in the quick-add booking flow (§6), not the Schedule views.
6. **Status-bar decision check** — we *removed* it; Granola's note said *automate*. Worth a one-line confirm that removal is the agreed direction.

> Items 5 (and the entire Checkout / Log-Payment list) sit in **§6 Quick Actions**, not the Schedule section, so they're tracked there rather than as Schedule gaps.

---

## 5. Status
Schedule is functionally complete against the Granola sign-off list except the gaps in §4. Quality gate (`tsc` + `next lint` + `npm run smoke`) is green and every change has been browser-verified.

**Adversarial code review of the pass-2 diff — complete, 6 findings, all fixed & re-verified:**
- *(high)* Month free-scroll snapped each newly-detected month to the top (the scroll effect wasn't gated to arrow intent) → now scrolls only on arrow/mount via a `scrollNonce`; free-scroll holds position and the header tracks.
- *(med)* Month `IntersectionObserver` measured its band against the window, not the phone frame → now uses the scroll container as `root`; header stays in sync on desktop.
- *(med)* The multi-select category filter wasn't wired into the **Team** view (B1 claimed all three) → threaded `filterCats` into Team day mode; verified 10→2 appointments when filtered to "Hair".
- *(low)* Week/3-day stepping could clamp to a degenerate single-day range at month end → clamp keeps a full window in range.
- *(low)* Month tap on a non-March day showed a stale March label → non-March picks stay in the overview (per-day data is March-only in this prototype).
