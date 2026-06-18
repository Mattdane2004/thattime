# Analytics — Finalisation Plan

> **Status:** Plan only — no implementation until the open questions below are resolved.
> **Scope:** A **dedicated Analytics section** for the B2B business app — a new `/app/analytics` route (overview + a small set of drill-downs and a deferred "Reports" list). This pass covers the *information architecture and the read-only owner surface*: revenue presentation, headline KPIs, sales-by-category, team performance, and occupancy/utilisation. The existing **Home dashboard** analytics tiles stay (they're a glanceable subset); this plan defines where "see more" lands.
> **Out of scope this pass:** the conversion funnel / booking-source attribution (real whitespace but conflicts with the "keep it simple" mandate — V2); any peer/benchmark "busier than X% of nearby salons" stat (explicitly removed, do not resurrect); deep Fresha-style 44-report depth (V2 Reports layer only); wiring Analytics to a real backend (persistence stays session-local demo data); the B2C `/c` surface.
> **Source of truth for feedback:** Granola sessions with Shabbir & Vishal — **"that time sign off" (15 Jun)**, **"TT planning" (16 Jun, internal)**, **"That Time Product alignment" (26 May)**. Analytics was named one of the **three biggest missing sections** (with Services & Team) and is to be **designed *with* Marketing**.
> **Design source:** design in-app from the feedback + the researched best-in-class patterns (Mobbin refs cited in the map). No finalised Analytics Figma to match — the pattern table is the build reference, same convention as `team-finalisation-plan.md`.

---

## What this section is

Analytics is the owner's "how is the business doing?" surface. Today it is a **dead menu item** — listed in the hub Operations grid and again under "Marketing and performance" with no destination. This plan gives it a real home: a single glanceable **overview** that answers *what have I taken today, how is the period tracking, what's selling, who's performing, and how full am I* — plus shallow drill-downs and a clearly-separated deeper "Reports" list for the rare deep dive. It sits under the **business hub** (`/app/hub` → Operations + Marketing/performance), reachable from the hub's "View analytics" button and the Home dashboard cards, not as a bottom-tab destination. The governing principle (Vishal: *"do not involve me in that conversation, or do it really early in the morning"*) is that it must be **effortless to read** — numbers and plain English, **never a chart as the primary read**.

---

## Feedback → source map

| Area | Feedback | Source | Pattern ref (Mobbin) |
|---|---|---|---|
| Section priority | Analytics is one of the three biggest missing sections (with Services & Team); design it **with Marketing** | 15 Jun, 16 Jun | — (scoping) |
| Revenue presentation | **Replace the graphy line chart** with a simpler representation: current-day revenue + a **progress indicator for how far through the day you are**; make it obvious what the figure represents and that it grows as the day progresses | 15 Jun | [adidas — goal ring](https://mobbin.com/screens/4ce95300-4018-46ff-80ca-a9074d75e9ba), [adidas — daily goal ring](https://mobbin.com/screens/9d27ac65-a9fa-4bad-98e6-3b48462e1337) |
| Audience | Target vendors **"are not VI people"** — a line graph may not communicate; keep it simple / not overwhelming | 15 Jun | [Jobber — business health rows](https://mobbin.com/screens/5097dfd2-931a-4947-9e84-1e629562b152), [Monzo — plain-English target](https://mobbin.com/screens/4bd9acd7-e24e-4aee-97e1-d6f6baff5d23) |
| Day pace, plain English | The day's figure should read as a sentence / single derived pace line, not a viz | 15 Jun (implied by "not VI people") | [Revolut — budget gauge + $/day](https://mobbin.com/screens/b578103d-3eca-4520-b50f-1698113428d7), [Rocket Money — savings ring + $/day](https://mobbin.com/screens/9a60bde2-81d6-478a-a6fd-4e71aebaedc6) |
| Removed peer stat | The **"busier than 78% of nearby salons"** stat was pulled (unreliable data, discouraging for quiet vendors) — do **not** resurrect it here | 15 Jun | — (anti-pattern) |
| Class revenue clarity | Every class should read **"X booked = £Y"** explicitly | 26 May | [OKX — qty ×N + value rows](https://mobbin.com/screens/09931fc9-9c0e-47fd-b53f-fa7bc4e4e723), [Shopify — top products by units](https://mobbin.com/screens/5c6a99bd-3281-4e97-a302-e3e873aa8948) |
| Bundle revenue | Surface **bundle revenue** as its own line (it's otherwise hidden inside later redemptions) | 26 May | [OKX — qty + value rows](https://mobbin.com/screens/09931fc9-9c0e-47fd-b53f-fa7bc4e4e723) |
| Collected vs projected | The figure's meaning must be unambiguous — money **banked** vs what's still **on the books** | 15 Jun (revenue clarity ask) | [Stripe — Today card + prior-period delta](https://mobbin.com/screens/680e6293-b64e-4fed-8537-94a667a4420f) |
| Headline KPIs | A minimal overview — a few headline numbers, no wall of tiles | 15 Jun ("not overwhelming") | [Squarespace — 3-up KPI strip](https://mobbin.com/screens/c0a1c009-9db8-45ef-85ea-51c8ccdb5a4c) |
| Period filters | Period filters across the section | 15 Jun (IA ask) | [Stripe — global period segmented control](https://mobbin.com/screens/680e6293-b64e-4fed-8537-94a667a4420f) |
| Vs-last-period | Comparison standard: this value, greyed prior value, small % delta chip | research-led (matches existing Home `Delta`) | [Stripe — reports value vs greyed prior + %](https://mobbin.com/screens/e345975a-5113-4ffd-8b71-1abc1481379e), [Jobber — delta chips](https://mobbin.com/screens/aaaa68ff-32f2-46f0-ba47-fe3ff66a4108) |
| Sales by dimension | Sales by service / class / bundle / product (and team) | 15 Jun (IA ask) + 26 May (class/bundle) | [Toggl — donut + group-by ranked legend](https://mobbin.com/screens/175108c3-6155-4b9a-9f2a-c4c7c41f5af9) |
| Team performance | Per-staff revenue / bookings / rebooking | 15 Jun (IA ask) | [Fresha team performance (docs)] · [Shopify — returning rate single number](https://mobbin.com/screens/e325bfc7-fbb4-435c-a35b-953e72d7cb2c) |
| Retention | New-vs-returning / returning-client rate as a single number, not a cohort chart | 15 Jun (IA ask) | [Shopify — returning customer rate](https://mobbin.com/screens/e325bfc7-fbb4-435c-a35b-953e72d7cb2c) |
| Occupancy / "filler chair" | Surface utilisation simply (a % + open gaps to fill); **turn the stat into an action** (tap a gap → fill it) | 15 Jun (IA ask) + the cross-section "filler chair" theme | [Booksy gap-optimisation (market scan)] |
| Deeper reports | A rare deep drill-down lives behind a searchable Reports list, kept off the simple front door | research-led tiering | [Shopify — Reports list](https://mobbin.com/screens/4b057834-50bb-4232-840f-2da031584513) |
| Empty states | Never shame a quiet vendor — neutral "no bookings yet", no comparisons | 15 Jun (why the peer stat was pulled) | — (anti-pattern) |

---

## Current state

**Status legend:** ✅ done · 🟡 partial · ❌ missing.

- **Dedicated `/app/analytics` route — ❌ missing.** No file under `src/app/app/` for analytics. The hub lists it twice as a dead item: `src/app/app/hub/page.tsx` lines 36 (Operations grid) and 41 ("Marketing and performance" list), both `{ key: "analytics", label: "Analytics", desc: "Performance & opportunities", icon: BarChart3 }` with **no `href`**. The hub's `ThisWeekCard` (same file, lines 105–133) has a **"View analytics"** button that goes nowhere. `src/lib/data/setupGuide.ts` line 55 references Analytics as a "locked" growth step.
- **Home dashboard analytics tiles — 🟡 partial (and where the "graphy" chart lives).** `src/app/app/page.tsx` already renders an owner "Overview" block fed by `src/lib/data/dashboard.ts`:
  - `RevenueProgressCard` (lines 189–217) — collected vs estimated as a **progress bar** (already closer to the brief than a line graph, but it's a bar, not a *day-progress* indicator, and there's no "how far through the day" framing).
  - `ActivityCard` (lines 162–186) → `MiniBarLine` (`src/components/app/charts.tsx`) — **this is the graphy bar+line chart the client wants gone** from the revenue read.
  - `HeroMetricCard` → `Sparkline` — used for the staff earnings hero.
  - `KpiScroller` with `businessKpis` (Revenue / Bookings / New clients / Utilisation) — a horizontal-scroll KPI row.
  - `InsightGrid` — top services (bar list) + client new/returning split + rebook rate.
  - All numbers are **deterministic demo constants** in `dashboard.ts` (SSR-safe by design — comment at top of file).
- **The retired peer-benchmark stat — 🟡 still in data.** `dashboard.ts` lines 106–117 still export `benchmark = { headline: "Busier than 78% of nearby salons", … }`. It is **not rendered** anywhere I can find, but the constant lingers and **must not be surfaced** in Analytics (15 Jun).
- **Period selector — 🟡 partial.** Home has a `PeriodPill` (lines 69–103) driven by `periods = ["Today", "This week", "Last 30 days"]` (`dashboard.ts` line 23). It scopes the **label only** — the underlying figures stay constant (documented). No "This month"/"This year"; uses "Last 30 days" rather than "This month".
- **Sales / class / bundle revenue — ❌ missing as analytics.** `topServices` exists (3 hand-set rows). There is **no** class-revenue ("X booked = £Y") or bundle-revenue surfacing anywhere. Offer data that *would* feed it lives in `src/lib/data/offers.ts` (`DemoOffer` has `type: "service"|"class"|"bundle"|"subscription"`, `price`, `durationMin`, `classDetails?`, `bundle?`) via `useOffersStore` (`src/lib/store/offersStore.ts`, with `updateOffer`).
- **Team performance — ❌ missing as analytics.** No per-staff revenue/bookings/rebooking view. Team roster + pay live in the team section (`src/app/app/team/`), out of scope to rebuild here.
- **Occupancy / utilisation — 🟡 partial.** Only a single "Utilisation 78%" KPI tile on Home (`businessKpis`, `dashboard.ts` line 79). No open-gap count, no per-day/per-staff breakdown, **no tap-through to fill a gap** (the differentiator).
- **Reusable primitives available — ✅.** The `@/components/ui` barrel already exports everything this section needs: `StatTile` (label-over-value), `SegmentedControl` (period/dimension toggle), `ListRow`/`SummaryRow`, `Card`, `Badge`/`Chip`, `Avatar`, `EmptyState`, `Tabs`, `AppHeader`/`SectionLabel`, `Sheet`. Home's local `Delta` chip (`page.tsx` lines 35–42) is the existing vs-last-period treatment to promote into a shared atom. The `charts.tsx` SVG primitives are token-driven and SSR-safe — reusable for the **progress ring** and an optional decorative donut.

**Net:** the *data shapes and primitives exist*; what's missing is (1) a destination, (2) the day-progress revenue treatment, and (3) the category / team / occupancy breakdowns. Most of Phase 1 is composition, not new infrastructure.

---

## Recommended UX calls

Opinionated decisions where the feedback left gaps. Tagged `[ASSUMPTION]` (proceeding unless told otherwise) or `[OPEN — needs user decision]` (genuinely blocked — see Open questions).

1. **Two-tier IA, Shopify-style. [ASSUMPTION]** A dead-simple **Analytics overview** (the default front door) + shallow drill-downs (Revenue, Sales by category, Team, Occupancy), with a deeper **"Reports" list deferred to V2**. The overview stays minimal; depth never crowds the front door. This is the single most important call — it protects the "effortless to read" mandate.

2. **Analytics lives under the hub, not as a 5th bottom tab. [ASSUMPTION]** The bottom `AppTabBar` is full (Home / Schedule / Clients / Message / + actions). Analytics is reached from the hub Operations grid, the hub "Marketing and performance" list, the hub `ThisWeekCard` "View analytics" button, and the Home Overview cards (each card deep-links to its matching drill-down). Wiring those four existing dead links is most of the entry work.

3. **Period chips: `Today / This week / This month / This year`, Today default. [ASSUMPTION]** Drop "Last 30 days" jargon and the finance jargon (MTD/QTD/YTD, "gross/net volume"). **One global selector drives the whole screen** (Stripe pattern), never per-card pickers. This supersedes Home's current `periods` array — see data model.

4. **Today's revenue = big number inside a day-progress ring + a plain-English sentence. [ASSUMPTION]** This is the literal client ask (15 Jun) and the adidas/Revolut/Monzo pattern. The ring **fill = % of the *opening day* elapsed** (not % of a target — we have no reliable target, and a target ring risks the same "shaming a quiet vendor" problem as the peer stat). Centre = collected revenue; side label = "X hrs left today"; one sentence below ("You've taken £640 today, about a third of the way through the day"). For non-Today periods the ring is replaced by the collected-vs-projected pair (a ring only makes sense for "today").

5. **Collected vs projected, both as numbers. [ASSUMPTION]** "£640 collected · £1,180 still on the books" — disambiguates what the figure means (the client's clarity ask). Re-frames Home's existing `collected`/`estimated` as `collected`/`projected`.

6. **KPI strip capped at 4, one row, big-number-over-label + `Delta` chip. [ASSUMPTION]** Bookings · New clients · Returning rate · Occupancy %. **No sparklines** on the overview. (Revenue is the hero above, so it leaves the strip — replaced by "Returning rate" which the feedback asked for.) More than 4 becomes the "wall" Squarespace/Stripe avoid.

7. **Ranked rows lead; any chart is decoration. [ASSUMPTION]** Sales-by-category is a ranked list (`name · count · £ · % of total`) with a dimension toggle (Services / Classes / Bundles / Products / Team). A donut may sit *above* the list as optional decoration only. Class rows read "X booked = £Y" explicitly; bundle rows get their own line.

8. **Occupancy is actionable, not a dead number. [ASSUMPTION]** "Occupancy 72% this week · 8 open slots", and tapping an open gap **jumps to that slot in `/app/schedule`** to fill it. A stat that just sits there is "discouraging noise" — turning it into the "filler chair" action is the differentiator.

9. **Empty/quiet states are neutral, never punitive. [ASSUMPTION]** "No bookings yet today" rather than a red zero; no red/alarm styling on low numbers; no peer comparisons, ever. This is *why* the peer stat was pulled — carry the principle into every empty state.

10. **Reuse, don't re-derive, the demo numbers. [ASSUMPTION]** Analytics reads the same `dashboard.ts` source the Home cards read, so figures never drift between Home and Analytics (the file already documents this single-source intent for `weekPerformance`). New breakdowns (category/team/occupancy) get added to a `dashboard.ts` sibling, kept deterministic/SSR-safe.

11. **"Designed with Marketing" — keep the seam. [ASSUMPTION]** The 15/16 Jun pairing of Analytics with Marketing means campaign/win-back attribution will eventually land here. Leave a quiet hook (the deferred Reports list is the natural home) but **don't build attribution now** — it's V2 and conflicts with "keep it simple".

12. **What happens to the Home line chart? [OPEN — needs user decision]** The client said replace the graphy line chart in the *revenue* read. Recommended: on **Home**, swap `RevenueProgressCard` for the new day-progress treatment and **retire `ActivityCard`/`MiniBarLine` from the revenue context** (keep `MiniBarLine` only if it's wanted as a neutral "activity" glance, not revenue). Needs confirmation of how aggressively to change Home vs only the new Analytics surface.

---

## Phase 1 — Analytics overview (the front door) + wire the dead links

**Goal:** Stand up `/app/analytics` as a glanceable overview, and make every existing dead "Analytics" entry point land on it. Deliver the day-progress revenue treatment the client explicitly asked for.

**Flow:**
1. Owner taps **"View analytics"** in the hub `ThisWeekCard`, or the **Analytics** item in the hub Operations grid / Marketing-and-performance list, or a card on the Home Overview → arrives at `/app/analytics`.
2. **Period selector** pinned at the top (`SegmentedControl`): Today / This week / This month / This year. **Today** is the default and governs everything below.
3. **Hero revenue card** (Today view): collected revenue as the **big centre number inside a progress ring**; ring fill = % of the opening day elapsed; side label "X hrs left today". One **plain-English sentence** under it ("You've taken £640 today, about a third of the way through the day"). *Non-Today periods:* the ring is replaced by the collected-vs-projected number pair (step 4).
4. **Collected vs projected** line: "£640 collected · £1,180 still on the books" — so the figure's meaning is unambiguous.
5. **KPI strip** (max 4 `StatTile`s + `Delta` chip, one row): Bookings · New clients · Returning rate · Occupancy %. No sparklines.
6. **"Top sellers" ranked rows**: each service/class/bundle/product as `name · count · £` (e.g. "Spin class · 12 booked · £480"; "Cut & finish · 9 · £405"). Tapping a row → the Sales-by-category drill-down (Phase 3) pre-filtered to that item.
7. Quiet footer link **"See all reports"** → the deferred Reports list (V2 — renders a placeholder/empty state for now).
8. **Empty state** for a brand-new/quiet business: neutral "No bookings yet today" with no red styling and no comparisons.

**Changes:**
- **New** `src/app/app/analytics/page.tsx` — the overview, composed from `SegmentedControl`, the new `RevenueRing`, `StatTile`, `ListRow`, `EmptyState`, `AppHeader`.
- **New** `src/components/app/RevenueRing.tsx` — SVG progress-ring (sibling to `charts.tsx`, same token-driven/SSR-safe pattern; fill driven by a passed `pct`, not a clock read).
- **New** shared `Delta` atom: promote Home's local `Delta` (`src/app/app/page.tsx` lines 35–42) into `src/components/ui/atoms/Delta.tsx`, export from the barrel, and have both Home and Analytics use it.
- **Edit** `src/app/app/hub/page.tsx` — add `href: "/app/analytics"` to both `analytics` menu items (lines 36, 41) and point the `ThisWeekCard` "View analytics" button at it.
- **Edit** `src/app/app/page.tsx` — the Overview cards (`RevenueProgressCard`, `KpiScroller`, `InsightGrid`) deep-link into the matching Analytics drill-down; apply the day-progress treatment to the Home revenue card (per the [OPEN] decision #12).
- **Edit** `src/lib/data/dashboard.ts` — change `periods` to `["Today", "This week", "This month", "This year"]`; add `dayProgress` (collected today, projected today, hoursLeftLabel, sentence, ringPct) and `returningRate` to the KPI source.

**Data:** see Cross-cutting changes — `periods` change + a `todayRevenue`/`dayProgress` block + a `returningRate` figure, all deterministic constants.

**Risk:** low–medium. Mostly composition + wiring four existing dead links. The only genuinely new primitive is the SVG ring (small, pure). Touching Home's revenue card needs the #12 decision.

---

## Phase 2 — Revenue detail (drill-down from the hero)

**Goal:** A revenue drill-down that states collected vs projected unambiguously and shows the by-day breakdown the client wanted *off* the overview — **as a list/table, never a line graph**.

**Flow:**
1. From the overview hero card → **Revenue detail**. Same period selector at the top; switching period reframes everything below.
2. **Collected vs Projected** as two big numbers side by side with the gap called out ("£640 collected · £1,180 still to come").
3. **Revenue by day** (week/month only): a simple **rows breakdown** — `day label · £ · tiny Delta`. Table-like for non-visual owners; bars optional decoration, never a line.
4. **Breakdown by source** rows: Services / Classes / Bundles / Products / Add-ons, each `name · count · £`, sorted high-to-low.
5. **Deposits & outstanding** line — money banked vs owed (relevant for bundles/deposits, which `DemoOffer.deposit` already models).

**Changes:**
- **New** `src/app/app/analytics/revenue/page.tsx`.
- **Edit** `src/lib/data/dashboard.ts` (or a new `analytics.ts` sibling) — `revenueByDay`, `revenueBySource`, `depositsOutstanding` constants.

**Data:** `revenueByDay: { day; amount; deltaPct }[]`, `revenueBySource: { source; count; amount }[]`, `depositsOutstanding: { banked; owed }`. Deterministic.

**Risk:** low. New screen reading new constants; no model changes to live offers.

---

## Phase 3 — Sales by category (Service / Class / Bundle / Product / Team)

**Goal:** Make class revenue read "X booked = £Y" and surface bundle revenue as its own line — the explicit 26 May asks — via a ranked list with a dimension toggle.

**Flow:**
1. **Dimension toggle** at top (`SegmentedControl`): Services | Classes | Bundles | Products | Team.
2. **Ranked list**: `name · units · £ · % of total`, sorted high-to-low. Units read "booked" for services/classes, "sold" for products. **Class rows: "Beginner yoga · 12 booked · £480".** **Bundle rows** get their own line so bundle revenue isn't lost inside later redemptions.
3. Optional small **donut above the list** as decoration only — the ranked list is the primary read.
4. Tap an item → its own mini history (units & £ over the selected period).

**Changes:**
- **New** `src/app/app/analytics/sales/page.tsx` (accepts a `?dimension=` and `?item=` so the overview "Top sellers" rows can deep-link in).
- **Edit** the analytics data module — derive `salesByCategory` keyed by dimension from `useOffersStore` offers where possible (offer `type` + `price` + a seeded `unitsSold`/`booked` count), falling back to constants for classes/bundles.

**Data:** add a lightweight per-offer demo metric `analyticsUnits?: number` (additive, optional, back-compatible) on `DemoOffer`, or a separate `salesByCategory` constant keyed by offer id. **[ASSUMPTION]** prefer the separate constant so seed offers stay untouched.

**Risk:** medium. The "derive from offers vs hand-set constants" choice; bundle revenue attribution is genuinely ambiguous in a prototype (see Open questions).

---

## Phase 4 — Team performance

**Goal:** Per-staff revenue / bookings / rebooking, the three Fresha-validated owner metrics — no commission/wage depth (that's the team section's pay surface).

**Flow:**
1. Period selector; **list of staff** (`ListRow` + `Avatar`): `name · revenue · bookings · (optional) rebooking rate`.
2. Sorted by **revenue** by default.
3. Tap a staff member → their **service mix + occupancy** mini view (reuses the Phase 3 ranked-list and Phase 5 occupancy components scoped to one person).

**Changes:**
- **New** `src/app/app/analytics/team/page.tsx`.
- Read staff from the existing team data (`src/lib/data/team.ts` seed members) for names/avatars; attach demo revenue/bookings/rebooking from a new `teamPerformance` constant in the analytics data module (keep analytics' numbers in analytics' source, don't bloat the team model).

**Data:** `teamPerformance: { staffId; revenue; bookings; rebookRate }[]`. Deterministic; staffId references existing seed members.

**Risk:** low–medium. Cross-reads the team seed (read-only); the per-staff drill-down reuses Phase 3/5 components.

---

## Phase 5 — Occupancy / utilisation (the "filler chair")

**Goal:** Surface utilisation simply **and make it actionable** — the differentiator. A stat that links straight to filling the gap.

**Flow:**
1. Single headline: **"Occupancy 72% this week"** with the open-gap count beside it ("8 open slots").
2. Per-day (or per-staff) utilisation as simple **% rows**, worst-filled highlighted neutrally (amber, never red-alarm).
3. **Action affordance:** tap an open gap → deep-link to that slot in `/app/schedule` to promote/fill it. (Turn the stat into an action.)

**Changes:**
- **New** `src/app/app/analytics/occupancy/page.tsx`.
- **Edit** the analytics data module — `occupancy: { pct; openSlots; byDay: { day; pct; openSlots }[] }`.
- **Link target:** `/app/schedule` already exists; deep-link with a query param to highlight a slot (best-effort in the prototype — may just land on the schedule).

**Data:** `occupancy` constant as above. Deterministic.

**Risk:** medium. The schedule deep-link/highlight is the only fiddly part; if the schedule can't accept a target slot param yet, degrade gracefully to landing on the schedule (note it as a follow-up).

---

## V2 / deferred

Parked but covered (the client asked to include everything now — clearly marked as later).

- **Reports list (Shopify-style searchable deep-drill).** The "See all reports" footer link from Phase 1 currently lands on a placeholder. V2: a searchable list of saved/standard reports for the rare deep dive — kept off the simple front door. **Direction:** one `/app/analytics/reports` route, a search box + grouped list, each opening a tightly-scoped read. Resist Fresha's 44-report depth; ship the handful owners actually use.
- **Conversion funnel + booking-source attribution.** Real category whitespace (Vagaro/Booksy) but directly conflicts with "keep it simple, don't overwhelm" (15 Jun). **Direction:** a clearly-separated layer inside Reports, opt-in, once a real backend exists to make the attribution trustworthy — never on the overview.
- **Marketing attribution (campaign / win-back ROI).** The 15/16 Jun "design Analytics with Marketing" pairing points here. **Direction:** when Marketing campaigns become real, add a "from campaigns" line to revenue and a per-campaign ROI report in the Reports layer — not before, to avoid fabricated numbers.
- **Peer benchmark — permanently parked, not deferred.** The "busier than X% of nearby salons" stat stays gone unless/until there is **reliable** data; even then, frame it neutrally and make it opt-in. The `benchmark` constant in `dashboard.ts` should be deleted to remove the temptation.
- **Goal/target ring (revenue vs a target).** Tempting evolution of the day-progress ring, but a target risks the same "shaming a quiet vendor" problem as the peer stat. **Direction:** only if the owner *sets their own* target opt-in; default ring stays day-progress.
- **Per-staff commission/earnings depth in Analytics.** Belongs to the team/pay surface, not Analytics. **Direction:** link from Team performance to the team pay screens rather than duplicating earnings here.
- **Export / scheduled email digests** ("the early-morning summary" Vishal joked about). **Direction:** a daily plain-English summary push/email is a strong fit for the "effortless" mandate — V2 once notifications/Marketing are wired.

---

## Suggested order & rationale

`1 (overview + wire dead links) → 2 (revenue detail) → 5 (occupancy) → 3 (sales by category) → 4 (team) → V2 (reports)`

Phase 1 first because it (a) delivers the **headline client ask** — the day-progress revenue treatment replacing the graph — and (b) turns four existing dead links into a real destination, which is the highest-visibility win for the 18 Jun-class sign-off cadence. Phase 2 (revenue detail) is the natural next tap from the hero and is cheap (pure constants). **Phase 5 (occupancy) is sequenced early despite being a drill-down** because the "filler chair" action is the section's clearest differentiator and the most likely to impress in a walkthrough. Phases 3 (sales-by-category) and 4 (team) are independent module builds and can be reordered by priority; 3 carries the 26 May class/bundle clarity asks, so lift it if those are the sign-off focus. The Reports layer (V2) is last by design — it must never precede or crowd the simple front door.

Every phase ends green on `npx tsc --noEmit && npx next lint && npm run smoke`, and each new screen carries a **smoke needle for its empty/setup state** (a quiet vendor with no bookings — the neutral, never-punitive state). Persistence stays session-local; analytics figures stay deterministic demo constants (SSR-safe — no clock/random at module or render top level, so the ring's `pct` is a passed prop, not a live time read).

---

## Cross-cutting data-model changes

All additive / back-compatible — the 23 seed offers and existing Home cards keep rendering.

**`src/lib/data/dashboard.ts` (or a new `src/lib/data/analytics.ts` sibling — [ASSUMPTION] new file to keep Home's module lean):**
- `periods` → `["Today", "This week", "This month", "This year"]` (replaces `"Last 30 days"`) — **Phase 1**. *Note:* Home's `PeriodPill` reads this, so the change is shared.
- `dayProgress: { collectedToday: string; projectedToday: string; hoursLeftLabel: string; ringPct: number; sentence: string }` — **Phase 1**.
- `returningRate: string` (single-number retention) — **Phase 1**.
- `revenueByDay: { day; amount; deltaPct }[]`, `revenueBySource: { source; count; amount }[]`, `depositsOutstanding: { banked; owed }` — **Phase 2**.
- `salesByCategory: Record<Dimension, { id; name; units; amount; pctOfTotal }[]>` keyed by Services/Classes/Bundles/Products/Team — **Phase 3**.
- `teamPerformance: { staffId; revenue; bookings; rebookRate }[]` (staffId → existing team seed) — **Phase 4**.
- `occupancy: { pct; openSlots; byDay: { day; pct; openSlots }[] }` — **Phase 5**.

**`src/components/ui/atoms/Delta.tsx` (new) + barrel export** — promote Home's local vs-last-period chip into a shared atom (Phase 1).

**`src/components/app/RevenueRing.tsx` (new)** — SVG day-progress ring, token-driven, `pct` as a prop (Phase 1).

**`DemoOffer` (`src/lib/data/offers.ts`)** — *only if* Phase 3 derives from offers rather than constants: optional `analyticsUnits?: number` (additive, defaults absent). **[ASSUMPTION]** prefer a standalone `salesByCategory` constant so the offer model and seed data stay untouched.

**Removal:** delete the unused `benchmark` constant from `dashboard.ts` (the retired peer stat) so it can't be resurrected — **Phase 1 cleanup**.

---

## Open questions for the user

1. **Home vs Analytics — how aggressively to change Home?** Replace Home's `RevenueProgressCard` with the day-progress ring *and* retire the `ActivityCard`/`MiniBarLine` graph from the revenue context, or leave Home as-is and only build the new treatment inside `/app/analytics`? (Decision #12 — affects scope of the Home edit.)
2. **Day-progress ring fill — what defines "the day"?** Recommended: % of the **opening hours** elapsed (we have `homeHeader.hours`). Confirm we use opening hours rather than a fixed 24h or a (deliberately avoided) revenue *target*.
3. **Bundle revenue attribution.** Bundles are sold once and redeemed later. Do we attribute bundle revenue **at sale** (simplest, what the "surface bundle revenue" ask implies) or **spread across redemptions**? Prototype can do either; affects how the bundle row reads.
4. **Period figures — static label or real recompute?** Today the demo numbers are constant and only the *label* changes with the period (documented in `dashboard.ts`). Acceptable for Analytics too, or do you want each period to show distinct demo figures (more convincing, more constants to maintain)?
5. **Occupancy tap-through.** Can `/app/schedule` accept a target slot to highlight, or should the occupancy gap link just land on the schedule for now? (Affects whether the "filler chair" action is end-to-end or best-effort this pass.)
6. **Team performance source.** Reuse the existing 11 team seed members and attach demo revenue/bookings, or use a smaller curated set for the analytics demo? (Affects how busy the team list looks.)
7. **"Designed with Marketing" timing.** Should the deferred Reports list ship even as an empty placeholder this pass (so the "See all reports" footer link isn't dead), or omit the footer link until Reports is real?
