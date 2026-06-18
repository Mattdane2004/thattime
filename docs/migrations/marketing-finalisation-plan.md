# Marketing — Finalisation Plan

> **Status:** Plan only — no implementation until the open questions below are resolved.
> **Scope:** The **Marketing** section — the `/app/marketing` hub and every surface hanging off it (Campaigns / Blast campaigns / Automations / Reviews / Rewards / Discount codes / Sales), plus the **notification-preset library** that the Services notifications module consumes, plus the **"filler chair"** (fill-empty-slots) flow. Marketing is the **paid** business surface for talking to clients at scale; group chats stay class-only.
> **Out of scope this pass:** the full **Analytics** section (its own plan — Marketing only links into it via a shared KPI strip and period toggle); a real messaging/SMS backend (sends are simulated, session-local); B2C-side promo *redemption* UX beyond what already exists in `/c`; an actual AI copy-generation backend (the "draft for me" assist is a stubbed starting point).
> **Source of truth for feedback:** Granola sessions with Shabbir & Vishal — **"that time sign off" (15 Jun 2026)**, **"That Time Product alignment" (2 Jun / 26 May 2026)**, **"That time Services catchup" (27 May 2026)** — and the **internal "TT planning" (16 Jun 2026)** remaining-section review. ⚠️ Marketing was explicitly flagged on **15 Jun** as a large **missing** area to be designed **together with Analytics** ("design them together"), and on **16 Jun** as one of the big-three priorities (Services / Team / Analytics) with Marketing paired to Analytics.
> **Design source → design in-app from feedback + research.** No finalised Marketing Figma exists; build from the meeting feedback and the best-in-class patterns researched below (Fresha / Mailchimp / Shopify / Deel / Turo / GlossGenius / Squarespace / WhatsApp), reviewed in the running app — same convention as `team-finalisation-plan.md`.

---

## What this section is

Marketing is where a salon owner **talks to clients at scale to drive bookings** — one-off blasts, always-on automations, deals, loyalty and reviews — and where they **fill empty chairs**. It is the paid counterpart to the free 1:1 Messages section: bulk one-to-many is a Marketing broadcast, never a group chat. It sits in the business hub alongside Services, Team, Clients, Schedule and (soon) Analytics, and is deliberately **designed together with Analytics** — every campaign reports *bookings and revenue generated*, not vanity opens. Two pieces of plumbing also live here by design: the **notification-preset library** (built once in Marketing, selected per-service in Services) and **birthday outreach** (moved out of the Clients list because "that is a marketing thing vs a managing-your-client thing", 15 Jun).

---

## Feedback → source map

| Area | Feedback | Source | Pattern ref (Mobbin) |
|---|---|---|---|
| Section status | Marketing is a large **missing** area; design it **together with Analytics**; pairs with the "filler chair" feature | 15 Jun, 16 Jun | [Mailchimp home — dashboard + time-range toggle](https://mobbin.com/screens/9c38a8b4-80d9-4032-869b-cc5bbc0989c6) |
| Hub structure | Stubs to build into real flows: Campaigns, Blast campaigns, Automations, Reviews, Rewards, Discount codes, Sales | 15 Jun | [Shopify — Marketing dashboard (Campaigns/Automations rows + KPI cards + Create sheet)](https://mobbin.com/screens/121f96c6-60b7-4bae-84fd-4e5082f0300f) |
| Blast vs automation | Two-tier split: one-off blast vs always-on triggered flows; report bookings, not opens | 15 Jun (research-validated) | [Mailchimp — Campaigns list (status pills + inline opens/clicks, automation co-listed)](https://mobbin.com/screens/212baf3d-e8f3-4f2e-9c33-9e745a394b73) |
| Birthday outreach | Birthday belongs **here**, not as a Clients-list filter — "a marketing thing vs a managing-your-client thing"; vendors come to Marketing to run a birthday campaign | 15 Jun | [Deel — workflow library incl. ready-made Birthday recipe](https://mobbin.com/flows/c3c9fe8f-6be2-41d2-a9c0-54182d072199) |
| Notification presets | Presets are **built in Marketing** and **assigned to services** (the Services notifications module picks a preset) | service plan Phase 8 | [Turo — scheduled-message template (event/time/before-after + variable tokens)](https://mobbin.com/flows/10369fb1-bb7d-401c-b0c3-b57f4446a8b3) |
| Certificate → reward | Certificate issuance triggers a marketing automation: "congrats, £10 off your next booking" | 26 May | [Deel — vertical trigger→action node canvas](https://mobbin.com/flows/c3c9fe8f-6be2-41d2-a9c0-54182d072199) |
| Reviews | Request a review, **reply inline**; the same review surfaces here **and** on the client profile | 15 Jun | [Turo — review reply "Your public response" inline](https://mobbin.com/screens/d82eff31-5d88-4932-b494-bc81b5b2e929) |
| Bulk-messaging guardrail | Vendors must **not** create arbitrary group chats to send free bulk messages — bulk is a **paid Marketing** capability; group chats are **class-only** | 15 Jun | [WhatsApp — broadcast (private one-to-many, not a group)](https://mobbin.com/flows/84f04596-b83c-4fdf-bcd9-497562efc770) |
| Filler chair | Surface empty-slot / last-minute discounting to fill gaps; **pair with analytics** | 15 Jun | [Shopify — discount/deal form](https://mobbin.com/screens/7fad4853-1907-47db-ab80-0568170fbf36) + waitlist auto-fill (GlossGenius) |
| Discount codes | Build a real promo-code flow | 15 Jun (stub) | [Shopify — discount code form](https://mobbin.com/screens/7fad4853-1907-47db-ab80-0568170fbf36) · [Summary recap card](https://mobbin.com/screens/8425a536-30ab-469f-86fc-00f90df43bfc) |
| Sales | Build limited-time service pricing | 15 Jun (stub) | [Shopify — create discount (method/value/dates)](https://mobbin.com/screens/8068caa8-a0ed-4e6e-b01c-3749cb07b200) |
| Rewards / loyalty | Build loyalty — keep it simple for a non-technical SMB | 15 Jun (stub) | [Honest Greens — stamp/visit loyalty](https://mobbin.com/screens/854c0df7-a606-44cd-9458-1211300989f6) · [Dunkin' — points-per-£](https://mobbin.com/screens/81d64364-460e-4211-bc8d-da63b45d76b2) |
| Audience segments | Built-in segments (recent / loyal / lapsed / birthday / by last-visit); no SQL-style builder | 15 Jun (research-validated) | [Shopify — Segments list (purchased once / lapsed)](https://mobbin.com/screens/23496c1d-6646-48af-a37d-dc9b4ad63e54) · [Mailchimp — Audience](https://mobbin.com/screens/fe11b307-5dc2-43d8-9f8e-a87c137f65d4) |
| Channel + cost | Pick channel up front; SMS costs money — show it before send | research | [Shopify — channel picker (Email/SMS with cost hints)](https://mobbin.com/screens/e3ea27d3-4a2a-4ea9-8e08-650bc311a916) |
| First-run / paywall | Net-new paid section — don't dump owner into an empty dashboard | research | [Squarespace — Email Campaigns first-run (plan + checklist + progress ring)](https://mobbin.com/screens/1e4bf3bc-1227-4d09-8efe-e0f5aa59e18c) |
| AI assist | Optional "draft my campaign" starting point — never required | research | [GlossGenius AI marketing assistant] (no Mobbin ref) |
| Waitlist auto-fill | Auto-notify the waitlist when a slot frees (automated half of filler chair) | research | UpNextCard already hints "Send to waitlist · 12 clients" (`src/components/app/UpNextCard.tsx`) |

---

## Current state

**Status legend:** ✅ done · 🟡 partial · ❌ missing.

- 🟡 **Marketing hub** — `src/app/app/marketing/page.tsx` is a stub: a `GROUPS` array of **7 inert buttons** under **Engage** (Campaigns, Blast campaigns, Automations, Reviews) and **Offers** (Rewards, Discount codes, Sales). Each row is a `<button>` with no `onClick` — no destinations exist. Hand-rolled list rows (not `@/components/ui` molecules) and the header is a bespoke back-bar. No KPI strip, no period toggle, no first-run checklist.
- ❌ **Campaigns** — no route. (Distinct from Blast — see UX calls.)
- ❌ **Blast campaigns** — no route, no compose flow, no audience segments, no send/report.
- ❌ **Automations** — no route, no recipe library, no node view.
- ❌ **Notification presets** — **do not exist as a Marketing-owned library.** `src/app/app/services/[id]/notifications/page.tsx` currently authors copy *per service*: it edits `offer.notifications` (`NotifStage[]` in `src/lib/data/offers.ts:30`) with a hardcoded `DEFAULT_STAGES` list and per-stage channel toggles. There is **no source of truth** for presets and **no link to Marketing** — the service plan's Phase 8 ("assign a notification preset built in Marketing") has no library to point at yet.
- 🟡 **Reviews** — review *data* exists as `clientReviews` in `src/lib/data/product.ts:101` (`{ id, stars, date, text, service }`); a **client-profile** reviews page already does inline reply + "Ask for a review" sheet at `src/app/app/clients/[id]/reviews/page.tsx` (local `useState`, not persisted). There is **no Marketing-level aggregate** Reviews surface, **no shared store**, no "needs reply" filter, and the reply/ask state is not shared between the two surfaces the client wants (Marketing + client profile).
- ❌ **Discount codes / Sales / Rewards** — no routes, no data models.
- ❌ **Filler chair / last-minute offers** — no flow. Crumbs only: `UpNextCard.tsx` shows a "Send to waitlist · 12 clients" affordance; alerts mention "Waitlists are now available". No empty-slot surfacing, no offer attach, no slots-filled reporting.
- ✅ **Group-chat guardrail (already correct)** — `src/app/app/messages/page.tsx:206` already states "Group chats are created automatically for each class — they can't be started here", and class chats are class-only (`src/app/app/messages/[id]/page.tsx`). The compose flow is 1:1 only. **This plan must not regress that**: bulk one-to-many lives only in Marketing.
- ❌ **Analytics** — no `/app/analytics` (or insights/reports) route exists. Marketing's KPI strip will link to it; until it exists, the strip links resolve to a placeholder.
- ❌ **Data/store** — there is **no** `src/lib/data/marketing.ts` or `src/lib/store/marketingStore.ts`. All Marketing entities are net-new (grep confirms no campaign/automation/preset/loyalty modules).

**Reusable UI already in the barrel** (`src/components/ui/index.ts`): `Sheet` / `BottomSheet`, `SegmentedControl` (channel + %/£ pickers), `StatTile` (KPI strip), `EmptyState` (first-run rows), `ToggleRow` (automation on/off), `StarRating` + `StatusPill` (reviews + campaign status pills), `Chip` (variable tokens / filter pills), `ProgressDashes` (first-run progress), `MiniCalendar` / `TimeChips` (filler-chair gap picker), and the `WizardChrome` set (`WizardTitle` / `WizardFooter` / `FieldLabel` / `Toggle`) for the blast wizard. No new primitives needed.

---

## Recommended UX calls

Opinionated decisions where the feedback left a gap. Tagged `[ASSUMPTION]` (proceeding unless told otherwise) or `[OPEN — needs user decision]` (listed again at the end).

1. **Campaigns vs Blast campaigns — collapse the ambiguity.** The stub lists both, but Fresha (the closest structural model) splits messaging into *Blast* (one-off) and *Auto* (triggered) only. **[ASSUMPTION]** Treat **"Campaigns"** as the umbrella **list/landing** that shows *everything you've created* (blasts + automations co-listed with a status pill, Mailchimp-style), and **"Blast campaigns"** as the *create-a-one-off* action. So the hub's "Campaigns" row opens the unified list; "Blast campaigns" and "Automations" are the two create entry points + their own filtered views. No third concept.

2. **Two-tier model, recipe-first automations.** Adopt Fresha's split: one-off **Blast** vs always-on **Automation**, plus a **Deals** family (discount codes, sales, last-minute offers). Automations open a **recipe library**, never a blank canvas — toggle-on cards (Birthday, Welcome, Win-back, Reward-after-Nth-visit, Certificate→£10-off, Rebook reminder, Auto-request-review). The Deel vertical trigger→action node view is for *viewing/editing* a recipe, optional `+` step — never a forced build. (Anti-pattern: blank-canvas horizontal flowchart with branching.)

3. **Bookings, not opens, lead every report.** Per-campaign report shows Delivered → Opened → Clicked → **Bookings + revenue attributed**, with bookings/revenue as the hero figures. This is the seam where the client wants Marketing and Analytics designed together (15 Jun) — the same numbers roll up into the Analytics section.

4. **Notification presets are the same object family as automations.** **[ASSUMPTION]** Build presets as a dedicated **"Presets" sub-tab inside Automations** (not a separate top-level section): a preset is just a *transactional* message template (event + timing + before/after + channel + body with tokens), where an automation is a *marketing* one. They share the editor and token picker. The Services notifications module then reads `marketingStore.presets` and selects one — replacing the per-service copy authoring that exists today. This directly closes service-plan Phase 8 and the service plan's locked decision #2 ("placeholder presets now … wire to real Marketing presets later").

5. **Filler chair = a Deal type + a waitlist automation, paired with data.** Model "Fill empty slots" as a **Last-minute offer** deal (Fresha), *not* a standalone module, and pair it with an **auto-notify-waitlist** automation (GlossGenius). Entry from the Marketing "Fill empty slots" row **and** contextually from a low-utilisation gap in Schedule/Analytics. Report *slots offered → booked*, never opens. **[ASSUMPTION]** v1 surfaces *this week's* empty slots from the existing schedule demo data; auto-detection of genuine gaps is a v1.5 nicety.

6. **Loyalty stays a single toggle.** One choice between **points-per-£** and **visit-stamps**, **one** reward threshold, **one** birthday auto-perk. No multi-tier XP ladders (the #1 over-engineering trap). **[ASSUMPTION]** Default to **visit-stamps** ("every 6th blow-dry free") as the most salon-intuitive.

7. **Reviews = one shared object, two surfaces.** Promote `clientReviews` into a `marketingStore` slice (id, stars, date, text, service, **clientId**, **reply?**, **replyAt?**, **requestedAt?**). The Marketing Reviews surface (aggregate + "needs reply" filter + inline reply) and the existing client-profile reviews page read/write the *same* store — satisfying "same review surfaces here and on the client profile" (15 Jun). Inline reply on the card, with a "Need tips?" helper and a "can't edit after publishing" warning (Turo).

8. **Transparent SMS cost.** Every send path shows a plain-English credit/cost line *before* send ("SMS uses credits — ~120 clients ≈ X credits"). **[ASSUMPTION]** Credits are a display-only mock figure this pass (no billing backend).

9. **First-run checklist over empty dashboard.** Because Marketing is net-new and paid, the hub shows a Squarespace-style **"Get started" checklist** with a progress ring (Add logo & sender name · Send your first blast · Turn on Birthday automation) and **lock icons** on paid actions — non-blocking to exploration. Dismisses once complete. **[OPEN]** whether Marketing is gated behind a real paywall/upgrade or always-on in the prototype.

10. **Birthday lives only in Marketing.** No birthday *filter* is added to the Clients list (explicit instruction). Birthday surfaces as (a) the **Birthday-this-month segment** in the blast audience picker and (b) the **Birthday offer recipe** in Automations. `ClientDetails.birthday` already exists (`src/lib/types/client.ts:37`) — the segment derives from it; no Clients-list change.

11. **AI "draft for me" is an optional assist.** A single "Draft this for me ✨" button in the blast/automation body step pre-fills the textarea with a sensible template; never a required step, no real model call this pass.

---

## Phase 1 — Marketing hub + KPI strip + first-run (the backbone)

**Goal:** Turn the inert stub into the real hub: a dashboard-first landing with at-a-glance performance, the Engage/Offers groups wired to real (or "coming next") destinations, a shared period toggle and KPI strip that links into Analytics, a Create action sheet, and the first-run checklist. This is the backbone every later phase hangs its rows off.

**Flow:**
1. **Header** "Marketing" with a **period toggle** (Last 30 days / This month) — the *same* control Analytics will use (shared component, designed together per 15 Jun).
2. **KPI strip** (`StatTile` row): **Bookings from marketing · Revenue from marketing · Messages sent · Gaps filled** — each tappable through to the matching Analytics view (placeholder until Analytics ships).
3. **First-run only:** a "Get started" card — `ProgressDashes`/ring + steps (Add logo & sender name · Send your first blast · Turn on Birthday automation), lock icons on paid actions. Dismisses when complete.
4. **Engage group** list rows with a **live stat** each: Campaigns ("5 total · 2 active"), Blast campaigns ("Last sent 3 days ago"), Automations ("3 on"), Reviews ("4.8★ · 3 to reply").
5. **Offers group** rows: Discount codes ("2 active"), Sales ("1 running"), Rewards ("Stamps · on"), plus a highlighted **"Fill empty slots"** row (filler chair).
6. **Center "Create" action sheet** (`Sheet`): Create blast · Create automation · Create discount · Create last-minute offer.

**Changes:**
- Rewrite `src/app/app/marketing/page.tsx` to compose from `@/components/ui` (`StatTile`, `SegmentedControl` for the period toggle, the list rows, `Sheet` for Create). Remove the hand-rolled rows and inert buttons.
- New `src/lib/store/marketingStore.ts` (Zustand, session-local) — the single source of truth for the whole section; Phase 1 seeds KPIs + first-run flags.
- New `src/lib/data/marketing.ts` — seed campaigns/automations/reviews/codes/loyalty so the hub reads as "new but alive", not broken.
- `smoke.tsx` — add a needle rendering the hub (with seed) and the first-run empty variant.

**Data:** `marketingStore` with `kpis`, `period`, `firstRun: { logoSet; firstBlastSent; birthdayOn }`. (Detailed types in Cross-cutting section.)

**Risk:** low–medium. New store + data module, but no cross-section coupling yet. Keep the period toggle a shared component so Analytics can import it.

---

## Phase 2 — Blast campaigns (one-off) + audience segments + reports

**Goal:** A 4-step compose-and-send flow for a one-off email/SMS to a chosen segment, ending in a per-campaign report led by bookings/revenue. This is the section's core value and the first checklist item ("Send your first blast").

**Flow:**
1. From hub Create → **Blast campaign**, or the Campaigns/Blast list "New".
2. **Step 1 — Channel:** `SegmentedControl` Email / SMS / Both, with a plain-English **cost line** for SMS ("SMS uses credits — ~120 clients ≈ X credits"). (Shopify channel picker.)
3. **Step 2 — Audience:** pick a **built-in segment** — All clients · Recent · Regulars/loyal · Lapsed · **Birthday this month** · By last-visit date — each showing a **live recipient count**. Optional **"Draft this for me ✨"** assist. No query builder.
4. **Step 3 — Content:** subject (email only, with a 0/200 counter) + body textarea with an **"Insert"** `Chip` for `{first name}` variables (highlighted tokens, Turo-style), optional image, and an **always-included "Book now" button**.
5. **Step 4 — Review & send:** preview as the client sees it, recipient count, estimated cost, **Send now or Schedule**; consent/opt-out footer auto-appended.
6. **Sent state →** campaign **detail/report**: Delivered / Opened / Clicked / **Bookings + revenue attributed** (bookings as hero). Status pill (Sent / Sending / Scheduled / Draft).
7. **Campaigns list** (the umbrella view, UX call #1): blasts **and** automations co-listed, each row a `StatusPill` + inline stats + recipient count (Mailchimp).

**Changes:**
- New `src/app/app/marketing/campaigns/page.tsx` (unified list, filter pills All / Blasts / Automations) and `.../campaigns/[id]/page.tsx` (report/detail).
- New `src/app/new/blast/page.tsx` (or `src/app/app/marketing/blast/new/`) — the wizard, reusing `WizardChrome` (`WizardTitle`/`WizardFooter`/`FieldLabel`/`Toggle`) and `SegmentedControl`. **[OPEN]** which route family — `/new/*` (consistent with offer wizards) vs in-section.
- `marketingStore` actions: `createCampaign`, `sendCampaign`, `scheduleCampaign`; `segments` selector deriving counts from client demo data.
- `smoke.tsx` — needle for the blast wizard + the campaign report.

**Data:** `Campaign { id; kind:"blast"; channel; segmentId; subject?; body; image?; status; scheduledFor?; sentAt?; stats:{ delivered; opened; clicked; booked; revenue } }`; `Segment { id; label; rule; count }` (rule is a named enum, not a query).

**Risk:** medium — the largest new flow; segment counts must derive from existing client/offer demo data so figures look plausible.

---

## Phase 3 — Automations (recipe library) + Notification presets

**Goal:** Always-on triggered flows, recipe-first; and the **notification-preset library** that Services consumes. Both share the message editor and token picker (UX call #4).

**Flow — Automations:**
1. Automations opens a **Recipe library** (cards, not a blank canvas): **Birthday offer · Welcome new client · Win back lapsed · Reward after Nth visit · "Congrats — £10 off your next booking" (certificate-issued trigger, 26 May) · Rebook reminder · Auto-request a review.**
2. Tap a recipe → **summary screen**: plain-English vertical **trigger→action node list** (Deel) — "WHEN [a client's birthday] → SEND [SMS] with [10% off] code".
3. **Edit** message (variable tokens, attach a discount), **timing** ("7 days before birthday"), channel.
4. **Toggle On** → appears in an **Active automations** list with an English subtitle and a running "X sent · Y booked" stat (`ToggleRow`).
5. Advanced: `+` node to add a reminder step — optional, never required.

**Flow — Presets (sub-tab inside Automations):**
1. **Presets** sub-tab: list of message presets, each name + English trigger subtitle ("Reminder · 24h before appointment") — Turo self-documenting pattern.
2. **Create preset:** name → **event** (Booking confirmed / Reminder / After appointment / No-show follow-up) → **timing + before/after** → **channel** → body with variable tokens. Save with an on/off default.
3. The **Services notifications module reads this library**: `src/app/app/services/[id]/notifications/page.tsx` becomes a **preset picker** instead of authoring copy per stage (replaces the current hardcoded `DEFAULT_STAGES` + per-channel toggles).

**Changes:**
- New `src/app/app/marketing/automations/page.tsx` (recipe library + Active list + Presets sub-tab) and `.../automations/[id]/page.tsx` (node view editor).
- **Edit** `src/app/app/services/[id]/notifications/page.tsx` → read `marketingStore.presets`, select a preset; map the existing `NotifStage` to `{ presetId }`. Keep back-compat with `offer.notifications` (existing seed offers keep rendering).
- `marketingStore`: `automations`, `presets`, `toggleAutomation`, `createPreset`. The certificate→£10-off recipe ties to the existing certificate concept (verify against bundles/services certificate issuance before wiring).
- `smoke.tsx` — needle for the recipe library, the node editor, and the Services preset-picker.

**Data:** `Automation { id; recipe; trigger; actions:[{ channel; body; discountId? }]; timing; on; stats }`; `Preset { id; name; event; timing; beforeAfter; channel; body; onByDefault }`. `offer` gains `notificationPresetId?` (the service plan's Phase 8 field).

**Risk:** medium–high — touches the Services section (its notifications module), so sequence/coordinate with the service finalisation pass. The shared editor keeps duplication down.

---

## Phase 4 — Deals: Discount codes + Sales

**Goal:** Build the two non-loyalty offer types. Discount codes get the gold-standard Shopify form with a plain-English Summary recap; Sales are time-boxed price changes.

**Flow — Discount code:**
1. Create → **Discount code**. Single scrollable form (Shopify field order):
2. **Code** field + **"Generate code"** (removes blank-field anxiety) · **Type** `SegmentedControl` Percentage / Fixed amount · **Value** · **Applies to** (all services / specific) · **Minimum requirement** · **Customer eligibility** (everyone / segment / specific) · **Usage limits** (total + one-per-client) · **Active dates** (+ "never expires" toggle).
3. **Plain-English Summary card** recapping every choice ("20% off all services, no minimum, one use per client, active from today") before Save (Shopify recap).
4. Save → **Discount codes list** with redemptions count + status pill (Active / Scheduled / Expired).

**Flow — Sales:**
1. Create → **Sale**: pick services (and/or staff), set a discount (%/£), set **start + end dates**.
2. Save → **Sales list** with status (Scheduled / Running / Ended). A running sale shows the temporary price on the relevant service surfaces (display-only this pass).

**Changes:**
- New `src/app/app/marketing/discounts/page.tsx` (list) + `.../discounts/new/page.tsx` (form + Summary).
- New `src/app/app/marketing/sales/page.tsx` (list) + `.../sales/new/page.tsx`.
- `marketingStore`: `discounts`, `sales`, CRUD actions; a `generateCode()` **SSR-safe** helper (no `Math.random()` at module/render top level — generate inside an event handler only).
- `smoke.tsx` — discount form + Summary card, sales list.

**Data:** `Discount { id; code; type:"percent"|"fixed"; value; appliesTo; minimum?; eligibility; usageLimit?; oncePerClient; startsOn?; expiresOn?; neverExpires; redemptions }`; `Sale { id; serviceIds; staffIds?; type; value; startsOn; endsOn; status }`.

**Risk:** medium — the discount form is long but each field is simple; the Summary card is the trust pattern. Watch the SSR rule on code generation.

---

## Phase 5 — Reviews (aggregate feed + request + reply, shared object)

**Goal:** A Marketing-level Reviews surface that shares one review object with the client profile (15 Jun). Promote the existing client-profile review UX into a shared store.

**Flow:**
1. Marketing → **Reviews**: summary (avg ★, count) + **filter** (Needs reply / All) + a feed of review cards across all clients.
2. Tap a review → **inline "Your public response"** textarea (no separate compose screen) with character counter and a **"Need tips?"** helper; publish with a **"can't edit after publishing"** warning (Turo).
3. **Request a review:** pick recently-completed appointments → send a request (one-tap, or as the Auto-request-review automation recipe from Phase 3).
4. The **same review object** surfaces on `src/app/app/clients/[id]/reviews/page.tsx` — owner has context when replying.

**Changes:**
- New `src/app/app/marketing/reviews/page.tsx` (aggregate feed + filter + inline reply + request).
- **Edit** `src/app/app/clients/[id]/reviews/page.tsx` → read/write `marketingStore.reviews` (currently local `useState`); move `clientReviews` seed from `src/lib/data/product.ts:101` into `src/lib/data/marketing.ts`, adding `clientId` + optional `reply`/`replyAt`/`requestedAt`.
- `marketingStore`: `reviews`, `replyToReview`, `requestReview`.
- `smoke.tsx` — Marketing reviews feed + the "needs reply" filter.

**Data:** `Review { id; clientId; stars; date; text; service; reply?; replyAt?; requestedAt? }`.

**Risk:** low–medium — mostly a refactor of an existing pattern into a shared store; the risk is the dual-surface sync (both pages must use the store, not local state).

---

## Phase 6 — Fill empty slots (filler chair) + waitlist automation

**Goal:** The named "filler chair" feature (15 Jun) — surface empty slots, attach an incentive, reach the right clients, and report **slots filled** (not opens). Paired with the waitlist automation (the automated half) and with Analytics (the data half).

**Flow:**
1. Entry from the Marketing **"Fill empty slots"** row **and** contextually from a low-utilisation gap in Schedule/Analytics (paired with analytics).
2. **Pick the gap(s):** this week's empty slots surfaced (from schedule demo data) with a utilisation hint; multi-select (`MiniCalendar`/`TimeChips`).
3. **Set the incentive:** %/fixed discount **or** "no discount, just notify"; which services/staff it applies to.
4. **Choose reach:** auto-notify the **waitlist** for matching slots (GlossGenius) **and/or** blast a **lapsed / recent** segment.
5. **Review & send** the last-minute offer.
6. **Report:** "slots offered → booked" so the owner sees chairs filled.
7. **Waitlist automation** (Phase 3 recipe): "When a slot frees → notify the matching waitlist" — toggle-on.

**Changes:**
- New `src/app/app/marketing/fill-slots/page.tsx` (gap picker → incentive → reach → review).
- Reuse the Phase 4 discount mechanics for the incentive; reuse Phase 2 segments for reach.
- Tie into the existing waitlist hint in `src/components/app/UpNextCard.tsx` ("Send to waitlist · 12 clients") so the two affordances feel like one feature.
- `marketingStore`: `lastMinuteOffers`, `sendLastMinuteOffer`, slots-filled stat feeding the hub KPI ("Gaps filled").
- `smoke.tsx` — the gap picker + the slots-filled report.

**Data:** `LastMinuteOffer { id; slotIds; incentive:{ type; value }|null; serviceIds?; staffIds?; reach:{ waitlist:boolean; segmentId? }; stats:{ offered; booked } }`.

**Risk:** medium — depends on schedule demo data being shaped enough to surface "empty slots". If not, **[ASSUMPTION]** seed a small `emptySlots` list in `marketing.ts` for v1 and wire to real schedule data later.

---

## Phase 7 — Rewards / loyalty (deliberately minimal)

**Goal:** A single, simple loyalty programme — resisting the multi-tier trap.

**Flow:**
1. Marketing → **Rewards**: if off, an explainer + "Turn on loyalty"; if on, a status card.
2. **Set up:** one `SegmentedControl` toggle — **Visit stamps** ("every Nth visit free/discounted") **or** **Points per £** — a **single reward threshold**, and **one birthday auto-perk** toggle.
3. **On** → status card with the rule in plain English; clients accrue (display-only mock); the B2C `/c` side already has a `loyaltyPoints` crumb (`src/lib/data/b2c.ts:672`) to mirror later.

**Changes:**
- New `src/app/app/marketing/rewards/page.tsx` (off / setup / on states).
- `marketingStore`: `loyalty { mode:"stamps"|"points"; threshold; birthdayPerk }`, `setLoyalty`.
- `smoke.tsx` — rewards off + on states.

**Data:** `Loyalty { enabled; mode; threshold; rewardLabel; birthdayPerk }`.

**Risk:** low — small surface; the only risk is scope creep into tiers (explicitly resisted).

---

## V2 / deferred

Everything below is intentionally parked — captured now per the brief, clearly marked as later.

- **Real Analytics section.** Marketing's KPI strip + period toggle are designed *as the seam*; the full Analytics dashboards (utilisation, retention cohorts, revenue breakdowns) are a separate plan. *Direction:* ship Marketing's shared period component now so Analytics imports it; the "filler chair" low-utilisation view is the first Analytics→Marketing handoff.
- **Genuine SMS/email backend + credits billing.** Sends are simulated session-local; cost lines are mock. *Direction:* keep all send paths funnelled through one `marketingStore.send*` action so swapping in a real provider (and a compliance/consent gate, per GlossGenius's 24h review) is a single integration point.
- **AI copy generation (real).** The "Draft this for me ✨" assist is a stubbed template this pass. *Direction:* later call a model with the segment + service context; keep it optional, never required.
- **Multi-step / branching automations.** Only linear recipe + optional `+` reminder step in v1. *Direction:* the Deel node list can grow conditional branches later, but only behind an "advanced" affordance — never the default.
- **Multi-tier loyalty.** Explicitly out. *Direction:* if ever asked, add tiers as an opt-in on top of the single threshold — do not make it the default.
- **Custom segment builder.** v1 ships fixed named segments only. *Direction:* a guided (not SQL) segment builder — pick attribute + operator from dropdowns (Mailchimp/Shopify) — once owners outgrow the presets.
- **B2C-side promo redemption polish.** Discount/last-minute offers display in `/c`; full redemption + loyalty-balance UX on the consumer side is a B2C pass.
- **Automated empty-slot detection.** v1 surfaces seeded/this-week slots; real-time gap detection from live schedule + utilisation thresholds is later.
- **Marketing paywall/upgrade flow.** First-run shows lock icons; the actual gate/upgrade is `[OPEN]` and deferred to the monetisation pass.

---

## Suggested order & rationale

`1 (hub + KPI strip + first-run) → 2 (blast + segments + reports) → 3 (automations + presets) → 4 (discounts + sales) → 5 (reviews) → 6 (filler chair) → 7 (rewards)`

- **Phase 1 first** because the hub is the backbone — every other phase hangs a row and a stat off it, and the shared period toggle/KPI strip is the Analytics seam the client asked to design together (15 Jun, 16 Jun).
- **Phase 2 (blast)** is the section's core value and the "send your first blast" first-run item; segments built here are reused by Phases 3 and 6.
- **Phase 3 (automations + presets)** unblocks the **Services** section (its notifications module has been waiting on a preset library — service plan Phase 8), so it should land before/with the next service pass; the recipe library also houses the certificate→£10-off (26 May) and auto-request-review recipes used by Phases 5–6.
- **Phases 4–5** are independent and can be reordered by priority; **Reviews** is partly built already (lowest lift).
- **Phase 6 (filler chair)** reuses discount mechanics (4) and segments (2), so it sequences after them; it is the headline "fill empty chairs" feature and the second Analytics handoff.
- **Phase 7 (rewards)** is last — smallest, most self-contained, and the easiest to over-build, so it benefits from the established patterns.

Every phase ends green on `npx tsc --noEmit && npx next lint && npm run smoke`, with a smoke needle for each new empty/setup/report state. Persistence stays session-local Zustand via `marketingStore`; the group-chat guardrail in Messages must remain intact (no bulk-send path leaks out of Marketing).

---

## Cross-cutting data-model changes

New module **`src/lib/data/marketing.ts`** (seed) + **`src/lib/store/marketingStore.ts`** (Zustand, session-local). All additive/back-compatible; the 23 seed offers, 11 team members and existing clients keep rendering.

New types (all in `marketing.ts`):
- `Campaign { id; kind:"blast"; channel:"email"|"sms"|"both"; segmentId; subject?; body; image?; status:"draft"|"scheduled"|"sending"|"sent"; scheduledFor?; sentAt?; stats:{ delivered; opened; clicked; booked; revenue } }` (Phase 2)
- `Segment { id; label; rule:"all"|"recent"|"loyal"|"lapsed"|"birthday"|"lastVisit"; count }` (Phase 2)
- `Automation { id; recipe; trigger; actions:{ channel; body; discountId? }[]; timing; on; stats:{ sent; booked } }` (Phase 3)
- `Preset { id; name; event:"confirmation"|"reminder"|"afterAppt"|"noShow"; timing; beforeAfter:"before"|"after"; channel; body; onByDefault }` (Phase 3)
- `Discount { id; code; type:"percent"|"fixed"; value; appliesTo; minimum?; eligibility; usageLimit?; oncePerClient; startsOn?; expiresOn?; neverExpires; redemptions }` (Phase 4)
- `Sale { id; serviceIds; staffIds?; type; value; startsOn; endsOn; status }` (Phase 4)
- `Review { id; clientId; stars; date; text; service; reply?; replyAt?; requestedAt? }` (Phase 5 — migrated/expanded from `clientReviews` in `product.ts:101`)
- `LastMinuteOffer { id; slotIds; incentive:{type;value}|null; serviceIds?; staffIds?; reach:{ waitlist; segmentId? }; stats:{ offered; booked } }` (Phase 6)
- `Loyalty { enabled; mode:"stamps"|"points"; threshold; rewardLabel; birthdayPerk }` (Phase 7)
- `marketingStore` top-level: `kpis`, `period`, `firstRun:{ logoSet; firstBlastSent; birthdayOn }`.

Edits to existing modules:
- `src/lib/data/offers.ts` — `DemoOffer` gains `notificationPresetId?` (Phase 3; closes service-plan Phase 8). Keep `notifications?: NotifStage[]` for back-compat.
- `src/app/app/services/[id]/notifications/page.tsx` — becomes a preset picker reading `marketingStore.presets` (Phase 3).
- `src/app/app/clients/[id]/reviews/page.tsx` — read/write `marketingStore.reviews` instead of local `useState` (Phase 5).
- `src/lib/data/product.ts` — `clientReviews` migrates to `marketing.ts` (Phase 5).

SSR-safe: no clock/random at module or render top level — generate discount codes and ids inside event handlers only (use the existing `nextId` from `@/lib/ids`).

---

## Open questions for the user

1. **Campaigns vs Blast campaigns** — confirm UX call #1: "Campaigns" = the unified list, "Blast campaigns" = the one-off create action (no third concept). Or did you intend "Campaigns" as a distinct *multi-channel/scheduled* type separate from a simple blast?
2. **Is Marketing behind a real paywall in the prototype**, or always-on with lock icons as flavour only? Affects the first-run gating and whether any rows are blocked vs explorable.
3. **Blast wizard route family** — build under `/new/*` (consistent with the offer wizards) or in-section under `/app/marketing/blast/new`?
4. **Presets placement** — confirm presets live as a sub-tab inside Automations (UX call #4), vs a separate top-level "Presets" surface. The Services side reads the same library either way.
5. **Loyalty default** — confirm **visit-stamps** as the default mode (vs points-per-£), and confirm a single threshold + birthday perk is enough for v1.
6. **Filler-chair data source** — is there schedule/utilisation demo data we should read for "empty slots", or do we seed a `marketing.ts` list for v1 and wire to real schedule data later?
7. **Certificate→£10-off trigger** — where does "certificate issued" fire today (bundles? services? a separate certificate concept)? Need the trigger source to wire the 26 May recipe.
8. **Analytics handoff** — what are the canonical KPI definitions (Bookings/Revenue *from marketing*, Gaps filled) so the strip numbers match what Analytics will show? Confirms the "designed together" seam.
9. **SMS credits** — show a mock credit figure only this pass, or do you want a placeholder credit *balance* + top-up affordance in the UI?

*Implementation begins once these are answered. Confirmed backbone-first build: **Phase 1 (Marketing hub + KPI strip + first-run).***
