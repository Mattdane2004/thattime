# Team Management — Finalisation Plan

> **Status:** Decisions locked (2026-06-17) — ready to build, starting with Phase 0a.
> **Scope:** The **team / staff** section — the `/app/team` management surface, the `/onboarding/staff` join flow, and the team-owned slices of the data model (`src/lib/types/staff.ts`, `src/lib/store/teamStore.ts`, `src/lib/data/team.ts`). Pay *settlement* (Stripe Connect / wallet / payslips), the team **calendar** views, and HR records are explicitly out of scope — see "Out of scope" below.
> **Source of truth for feedback:** three Granola sessions with Shabbir & Vishal — **"that time sign off" (15 Jun)**, **"That Time Product alignment" (9 Jun)** and **(2 Jun)**. ⚠️ The Granola natural-language query misses almost all of the team feedback; read the raw meeting notes.
> **Context:** Team management was assessed **~80–85% complete** on 15 Jun and called out as **"the most complex section of the application."** A **dedicated team sign-off was scheduled for Wednesday 18 June** — this plan is the brief for that session.
> **Figma:** team frame node IDs **TBD** — fill the right-hand column of the map below from the ThatTime — Internal file before building each phase (same convention as `service-finalisation-plan.md`).

---

## Feedback → source map (reference index)

| Area | Feedback | Source | Figma node |
|---|---|---|---|
| Join flow schedule | Read-only week → editable "when are you free to work?" when owner hasn't set it / has granted self-edit | 15 Jun, 9 Jun, 2 Jun | TBD |
| Join flow copy | Kill the "let {manager} tweak it" placeholder → real flag-to-manager action | 15 Jun | TBD |
| Schedule permission | Owner can grant a member the right to edit their own schedule (gates the editable screen) | 15 Jun | TBD |
| User types | Employee vs **Freelancer / chair-renter** — freelancers off the owner rota, manage own bookings/services | 9 Jun, 2 Jun | TBD |
| Pay models | Commission, salary, **chair rental**, and **hybrid** (low rent + %); per-member payouts | 9 Jun, 2 Jun | TBD |
| Add-member gate | Single-staff shop must upgrade subscription when adding a member | 9 Jun | TBD |
| Self-service | Staff request holiday / sick / shift-swap from their own view; owner approves | 9 Jun, 2 Jun, 15 Jun | TBD |
| Staff home | Staff see own earnings, appointments, shifts, time off | 15 Jun | TBD |
| Rotating rotas | Fixed vs flexible; bi-weekly & 4-week rotas; alternating weeks ("every other Monday"); skip/delegate setup | 9 Jun, 2 Jun | TBD |
| Coverage | Month/day coverage red/amber/green; min staff per day; understaffing alerts; "team on today" | 9 Jun | TBD |
| Roles | Receptionist (no services), admin/marketing hidden from public; granular permissions | 2 Jun | TBD |
| Invite / login | Invite via WhatsApp **or** email; PIN login for shared salon devices | 2 Jun | TBD |
| Public holidays | Bank-holiday banners; auto-off on bank holidays; build-up reminders | 9 Jun | TBD |
| Profile depth | Birthday, start date, social links, public/private toggles, reviews/ratings, reorder for display | 2 Jun | TBD |
| Mobile staff | Mobile/out-call designation; day-specific mobile; location pricing | 2 Jun | TBD (overlaps services/variants) |
| Calendar headers | Team column header shows working hours, not job title | 15 Jun | TBD (calendar section) |
| Team views | Team week view + month view (all members' appointments + filter) | 15 Jun, 9 Jun | TBD (calendar section) |

---

## ✅ Decisions (locked 2026-06-17)

1. **Design source → design in-app from feedback.** No finalised team Figma to match; build from the meeting feedback + the existing `@/components/ui` library and review in the running app. (The Figma column above is therefore informational, not a build gate.)
2. **Freelancer scope → full own-workspace.** Freelancers/chair-renters create & manage their own services and switch workspaces, on top of the rota-exclusion, "manages own bookings" framing, and chair-rent/hybrid pay. The own-services + workspace-switching part is larger (touches the services section + the existing `roleStore`) so it's staged into **Phase 1d**; the Phase 0 blocker keeps only the flow-framing + pay.
3. **Rota patterns → fixed + bi-weekly + 4-week.** No arbitrary cycle length. The editable staff-week defaults to a single week unless rotation is chosen.
4. **Coverage → per business, per weekday.** One set of minimums (e.g. 5 Mon, 12 Sat); not per-location this pass.

**Defaulted (not asked, no objection assumed):**
- **Requests model** → one `TimeOff` model with `status` + `source` covering both owner-added and staff-requested; shift-swap is the one separate concept (Phase 1a).
- **PIN login / WhatsApp invite** → out of the prototype this pass (dev-side, per the 15 Jun pinch-zoom precedent); Phase 2a covers role concepts only.
- **Staff home** → already exists (`src/app/staff/home/page.tsx`, the main dashboard locked to a `"staff"` role via `roleStore`); the self-service request entry point lands there.

---

## Current state (what's built — the foundation to keep)

- **Roster + 3 tabs** (Members / Shifts / Pay) — `src/app/app/team/page.tsx`.
- **Invite** — `src/app/app/team/invite/page.tsx` (captures `memberType`, access level, bookable).
- **Member detail** — `src/app/app/team/[id]/page.tsx` + sub-flows `schedule/`, `permissions/`, `pay/`.
- **Pay runs** — `src/app/app/team/pay/[runId]/page.tsx` (draft → completed).
- **Staff join flow** — `src/app/onboarding/staff/{invite,password,profile,week,done}/page.tsx`.
- **Domain** — `Staff` type (`staff.ts`), `useTeamStore` (`teamStore.ts`), `teamMembers`/`demoPayRuns`/`ACCESS_PRESETS` (`team.ts`). 5 access presets × 8 permission flags.

**Status legend below:** ✅ done · 🟡 partial · ❌ missing.

---

## Phase 0 — Sign-off blockers ✅ BUILT & VERIFIED (2026-06-17)

> Implemented and verified in the browser; `tsc` + `next lint` + `smoke` green.
> **Calcified decisions (from the verbatim 2/9/15-Jun transcripts):**
> - 0a editable week: editable when the owner skipped setup **OR** granted self-edit; read-only confirmation otherwise. **No flag-to-manager workflow this pass** (Mathew: "I don't think this will be included") — the misleading "Let Emma tweak it" placeholder was simply removed.
> - One shared `WeekEditor` (`src/components/team/WeekEditor.tsx`) drives both the member schedule editor and the join-flow week (owner's "exactly how it looked like if they were to edit their schedule themselves").
> - 0c freelancer: member *type* drives whether a schedule is collected; freelancers are off the owner rota/coverage but kept in a "self-scheduled" overview (rent/commission due + hours-booked busy signal). Owner-invoices-freelancer, no payslip.
> - 0c pay: components model `{ memberType, components: { salary?, hourly?, commission?{rate,direction}, chairRent?{amount,frequency} } }` — hybrid = multiple components, unset = "set up later", commission `direction` flips with member type. Bank details/payouts deferred to the Stripe block (note shown on the page). Existing `StaffPayment.type` removed in favour of `Staff.memberType` + components.
> - "chair rent" (pay) is kept distinct from the 15-Jun "filler chair" (an analytics/marketing feature).
>
> **What shipped:** `staff.ts` (perms +`scheduleSelfEdit`/`viewTeamSchedule`, `MemberType`, components `StaffPayment`, `Staff.memberType`) · `team.ts` (presets, seed incl. 2 demo freelancers, `payIsConfigured`/`paySummary`) · `teamStore.ts` · `onboarding2.ts` (`staffAvailability`/`staffScheduleSet`/`staffCanSelfEdit`) · `WeekEditor.tsx` (new) · schedule, join-week (rewritten), permissions, pay (rewritten), team list (Shifts split + Pay summary), member detail (freelancer framing) · smoke (+`TeamPayFreelancer`, +`WeekEditor`).

> The three changes Shabbir & Vishal will look for tomorrow. **Editable staff-week leads** (confirmed starting point).

### 0a. Editable staff-week in the join flow ❌
**Goal:** `src/app/onboarding/staff/week/page.tsx` is currently a **hardcoded, read-only** week. Make it an editable "when are you free to work?" screen shown when the owner hasn't pre-set a schedule **or** has granted the member self-edit; otherwise keep the read-only confirmation. Replace the *"Not quite right? Let {manager} tweak it"* line (15 Jun's explicitly-flagged placeholder) with a real **"Flag a problem to {manager}"** action.
**Changes:**
- Convert the hardcoded `week` array to editable day toggles + start/end inputs (reuse the pattern from `team/[id]/schedule/page.tsx`).
- Persist the chosen availability to the onboarding2 store (new `staffAvailability: WeeklyScheduleDay[]`) and/or back onto the member.
- Add the flag-to-manager action (prototype: confirmation toast / pending flag).
- **Cleanup:** this file uses inline hex (`bg-[#F0E6DC]`, `bg-[#E5DDD4]`, `rgba(...)`) — breaks the CLAUDE.md "no inline hex" rule; swap to token classes while here.
**Data:** `onboarding2` gains `staffAvailability`; gated by the permission in 0b.
**Risk:** low–medium.

### 0b. Schedule-self-edit permission ❌
**Goal:** Add an explicit flag so the owner can grant "edit own schedule" — this is what gates 0a.
**Changes:** add `scheduleSelfEdit: boolean` to `StaffPermissions` (`staff.ts`), seed it in `ACCESS_PRESETS` (`team.ts`), and surface it on `team/[id]/permissions/page.tsx`.
**Data:** `StaffPermissions` +1 flag (back-compatible default `false` except high/owner).
**Risk:** low.

### 0c. Employee vs Freelancer differentiation (flow + pay) 🟡
**Goal:** `memberType` is captured at invite but does nothing downstream. Make it real at flow level: freelancers are framed as "manages own bookings", excluded from the owner **Shifts** rota and coverage, and get a **chair-rent / hybrid** pay model. (The own-services + workspace-switching half of the "full own-workspace" decision is staged into **Phase 1d** to keep the Phase 0 blocker tight.)
**Changes:**
- `team/[id]/page.tsx` — freelancer framing + "manages own bookings" treatment.
- `team/page.tsx` (Shifts tab) — exclude freelancers from the owner rota (or split into a "Freelancers" group).
- `team/[id]/pay/page.tsx` — add chair-rent and hybrid models (see data below).
**Data:** `StaffPayment` gains `payModel: "salary" | "hourly" | "commission" | "chair_rent" | "hybrid"` and optional `chairRent?: string`; keep `type` for the employee/contractor split.
**Risk:** medium.

---

## Phase 1 — Depth the sign-off will probe

### 1a. Staff self-service requests ❌
**Goal:** Staff request **holiday / sick leave / shift-swap** from their own view; the owner gets an **approval inbox** in the team section. Distinguish owner-added time off (auto-approved) from staff-requested (pending).
**Changes:** new request types + store actions (`requestTimeOff`, `requestShiftSwap`, `approveRequest`, `declineRequest`); a staff-home request entry point (Q5) and an owner approval list in `team/`.
**Data:** new `StaffRequest { id; staffId; kind: "holiday"|"sick"|"swap"; status: "pending"|"approved"|"declined"; … }`; existing `TimeOff` gains a `status`/`source` to reconcile owner-added vs requested.
**Risk:** medium.

### 1b. Rotating rotas ❌
**Goal:** Move beyond a single static week. Offer **fixed vs flexible** at setup; support **bi-weekly and 4-week** alternating patterns; add a **skip / delegate-to-staff** option.
**Changes:** `team/[id]/schedule/page.tsx` + the join flow gain a pattern selector and per-week editing; `setWeeklyDay` generalised to address `(week, day)`.
**Data:** `StaffSchedule` gains `pattern: "fixed" | "rotating"` and `rotation?: { cycleWeeks: 2 | 4; weeks: WeeklyScheduleDay[][] }` (locked: fixed + bi-weekly + 4-week only).
**Risk:** medium–high — the core schedule model change; ripples into coverage and calendar.

### 1c. Coverage / "team on today" ❌
**Goal:** Min staff per day + red/amber/green coverage and an understaffing flag; a "team on today" summary (who's in, who's not covered, cover sickness from here).
**Changes:** business-level minimums setting; a coverage computation; surface on the Shifts tab + (later) home "needs attention".
**Data:** new `staffingMinimums: Record<Weekday, number>` (locked: per business, per weekday); coverage derived, not stored.
**Risk:** medium.

### 1d. Freelancer own-workspace ❌
**Goal:** Deliver the larger half of decision #2 — freelancers/chair-renters **create & manage their own services** and **switch workspaces**, rather than consuming the owner's catalogue.
**Changes:**
- Workspace switching off the existing `roleStore` (`useRoleStore`) — a freelancer context distinct from owner/staff.
- Freelancer-owned services: the services section reads ownership so a freelancer sees/edits only their own offers within the shared premises.
- Member detail reflects "runs own services" instead of owner-assigned services for this type.
**Data:** services gain an `ownerStaffId?`; `roleStore` gains a freelancer workspace context.
**Risk:** high — crosses into the services section; sequence after the services finalisation pass lands.

---

## Phase 2 — Enrichment (post-sign-off)

- **2a. Roles depth** — receptionist (no services) / admin / marketing concepts + a `hiddenFromPublic` flag; WhatsApp invite channel; PIN login (Q6). *Data:* extend `SystemRole` or add role attributes; `InviteInput.channel`.
- **2b. Public-holiday management** — bank-holiday banner data, `autoOffOnBankHolidays` business setting, build-up reminders.
- **2c. Profile depth** — `birthday`, `startDate`, `socials`, public/private field toggles (`phoneVisible`), `reviews/rating`, `order` for display reordering.

---

## Out of scope (defer — parked for dedicated sessions)

- **Pay settlement** — Stripe Connect (platform + sub-accounts + per-staff connect), business wallet, payouts, payslips, Xero. The meetings repeatedly route this to a dedicated **payments/Stripe** session. Team-section pay stays at *configuration* (rates, models, "not set up" status), not settlement.
- **Team calendar** — working-hours-in-headers, team week/month views with all-member appointments + filter → **calendar section** (note the dependency: month-view coverage reuses 1c).
- **HR records** — disciplinary log, performance reviews, 1:1 docs → **V2**.
- **"Grow an agile team" card** dismiss + upgrade upsell → **home section** (small, tracked separately).

---

## Cross-cutting data-model changes (summary)

`StaffPermissions` → `+ scheduleSelfEdit` (Phase 0b)
`StaffPayment` → `+ payModel`, `+ chairRent?` (Phase 0c)
`onboarding2` → `+ staffAvailability` (Phase 0a)
`StaffRequest` (new) + `TimeOff` `+ status/source` (Phase 1a)
`StaffSchedule` → `+ pattern`, `+ rotation?` (Phase 1b)
business settings → `+ staffingMinimums` (Phase 1c)
`Staff`/`StaffProfile` → `+ birthday/startDate/socials/phoneVisible/rating/order` (Phase 2c)
`SystemRole`/`InviteInput` → role attributes + `channel` (Phase 2a)

All additive / back-compatible — the 11 seed members in `team.ts` keep rendering. Persistence stays session-local Zustand. Every phase ends green on `npx tsc --noEmit && npx next lint && npm run smoke`, with a smoke needle for each new empty/setup state.

---

## Open questions — all resolved (see Decisions, locked 2026-06-17)

All seven are answered: freelancer depth → full own-workspace (Phase 1d); rota → fixed + bi-weekly + 4-week; requests → unified `TimeOff` + status/source; coverage → per business/weekday; staff home → already exists; PIN/WhatsApp → deferred dev-side; Figma → design in-app.

*Ready to build. Confirmed first build: **Phase 0a (editable staff-week).***
