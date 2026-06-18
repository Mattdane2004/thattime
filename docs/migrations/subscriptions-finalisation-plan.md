# Subscriptions & Memberships — Finalisation Plan

> **Status:** Refined from live audit on 17 Jun 2026. Phase A implementation is now in progress:
> copy/readback helpers have been added and wired through the subscription wizard/dashboard.
> **Scope:** The **subscription** offer type as part of the Services / Classes / Bundles /
> Subscriptions offering area — the creation wizard (`/new/subscription-*`) and the
> `/app/services/[id]` management/dashboard surface for a subscription offer. The earlier
> consumer membership work (`/c` wallet, redemption at checkout, cancellation/offboarding save
> flow) remains valuable, but is **deferred** until the service-offerings section itself is
> signed off.
> **Explicitly out of scope this pass:** real recurring-billing/Stripe settlement & dunning
> (prototype is session-local Zustand — we *display* states, we don't charge); multi-tier
> plans (Silver/Gold ladders); real cross-vendor perk settlement / affiliate payouts. These
> are covered as recommended directions under **V2 / deferred**.
> **Source of truth for feedback:** Granola sessions with Shabbir & Vishal (that-time.co.uk) —
> the model was defined **19 May** and the three key changes were locked **26 May**, with the
> full walkthrough sign-off on **15 Jun**. The membership-benefits/store-credit model is
> *parked* — the client owes a vendor-side definition, so every benefit-model decision below
> is tagged **[ASSUMPTION]**.
> **Design source → design in-app from research.** There is no finalised subscriptions Figma
> to match; this plan builds from the meeting feedback + best-in-class patterns (Mobbin refs
> cited per row) on top of the existing `@/components/ui` library, reviewed in the running app.

---

## What this section is

A **subscription / membership** is the fourth offer type in the business hub (alongside
services, classes and bundles — `SERVICE_TYPES` in `offers.ts`). It is a **recurring payment**
that buys the member one of three things: a **fixed credit pot** (e.g. £50/month to spend), a
**service allowance** (e.g. 5 bookings/month, or unlimited, *shared* across a chosen set of
services), or **member benefits** (a discount on extras + perks). It sits in the same
catalogue, wizard and `/app/services/[id]` dashboard as every other offer, and surfaces to the
client on the `/c` consumer app as "your passes" plus an auto-applied discount/coverage at
checkout. The whole point is recurring revenue and retention — so the **offboarding save flow**
is a first-class part of this section, not an afterthought.

---

## 17 Jun live audit update — B2B offering focus

**Tested paths:** Subscriptions tab in `/app/services`, existing subscription dashboards
(`sub_monthly_cuts`, `sub_colour_credit`, `sub_vip`), dashboard edit routes
(`sub-benefits`, `sub-services`, `sub-billing`, `sub-rules`, notifications, preview), and the
subscription creation wizard structure (`/new/type → basics → subscription-type →
subscription-benefits → subscription-billing`).

**What is already in a good place:**
- The catalogue already treats subscriptions as one of the four offer types.
- Subscriptions already have a type-specific Overview / Advanced dashboard, unlike the older
  plan's read-only-dashboard assumption.
- The data model already contains included services, shared sessions, credit spend mode, member
  discount, billing period, joining fee, minimum term, cancellation rule, cooldown, rollover and
  pause fields.
- The existing copy now says sessions are a **shared pool** in several places, so the original
  26 May copy bug has been partially addressed.

**What still feels weak in real use:**
- The subscription wizard asks for **Subscription type** and then asks for **Benefit type** again.
  A real owner is being asked to classify the plan twice before seeing the plan in plain English.
- The owner never gets a strong **live readback** such as "Members pay £45/month for 1 booking
  shared across Classic haircut, Haircut and Cut & Style." The dashboard rows are factual, but
  not confidence-building.
- "All services" is encoded as an empty `includedServiceIds` array. That is technically tidy, but
  visually risky: the selected seed plan can look like both "3 selected" in one place and "All
  services" after toggling in another.
- The dashboard has **Overview / Advanced**, but no **Members** view. For a membership product,
  the owner naturally expects to see who is on it, usage this cycle, status, and next billing.
- Preview is generic service preview copy ("Book now £45"). It does not explain the membership
  benefit, renewal, included services, or shared allowance.
- Notifications are still per-stage channel overrides. The Services plan and Marketing plan both
  point toward **preset assignment from Marketing**, so subscriptions should follow that model
  instead of creating a separate notification editing concept.
- The plan currently overreaches into B2C redemption/offboarding before the owner-side
  subscription offering is signed off.

**Refined immediate goal:** make subscriptions feel as solid as services and bundles in the
business-facing offering area. That means a clearer wizard, a stronger dashboard/readback,
member-lifecycle management, subscription-specific preview, and consistency with Marketing
notification presets. Consumer redemption and offboarding can follow once the plan model is
approved.

---

## Refined v1 plan — service-offerings scope

### Phase A — Copy/readback and helper consolidation ✅ implemented

**Goal:** keep the current model, but make the plan unambiguous everywhere before changing the
flow structure.

**Changes:**
- Extend `src/lib/data/subscriptions.ts` with:
  - `subscriptionPlanSentence(sub, offer, offers)` — plain-English owner readback.
  - `subscriptionAllowanceLabel(sub)` — "1 booking / month", "Unlimited", "£100 credit / month".
  - `subscriptionCoverageLabel(sub, offers)` — "shared across Classic haircut, Haircut +1 more"
    or "all published services".
  - `subscriptionReadinessIssues(offer)` — concrete missing items, not just true/false.
- Use those helpers in:
  - `src/app/new/subscription-benefits/page.tsx`
  - `src/app/new/subscription-billing/page.tsx`
  - `src/app/app/services/[id]/page.tsx`
  - `src/app/app/services/[id]/sub-benefits/page.tsx`
  - `src/app/app/services/[id]/sub-services/page.tsx`
- Replace any ambiguous "period" wording with the actual billing period where known.
- Add a visible summary panel in the wizard and dashboard: "How clients will understand this."

**Acceptance criteria:**
- A session membership with selected services always says the allowance is shared.
- An empty `includedServiceIds` state is always labelled as "All published services", not silently
  treated as a hidden selection.
- The dashboard ready card names exactly what is missing when incomplete.

**Implementation notes (17 Jun 2026):**
- Added shared subscription copy/readiness helpers in `src/lib/data/subscriptions.ts`.
- Wired plan readback panels into the creation benefits/billing steps and subscription dashboard
  editors.
- Updated service coverage language from "All services" to "All published services" where an
  empty selection means broad coverage.
- Verified with `npx tsc --noEmit` and `npm run smoke`.

### Phase B — Wizard simplification

**Goal:** reduce classification friction and put the owner into plan construction faster.

**Recommended structure:** keep 4 steps for now to preserve wizard chrome:
1. Basics — unchanged.
2. Plan model — choose **Service allowance**, **Store credit**, or **Member discount/perks**.
   Drop the duplicate current distinction between `subscription-type` and benefit type, or make
   `subscription-type` the single model step.
3. What members get — configure the selected model:
   - Service allowance: unlimited toggle or count, included services, shared-pool readback.
   - Store credit: credit amount, bonus credit, applies to all or selected services.
   - Discount/perks: percent discount and included/eligible services.
4. Billing & rules — price, billing period, joining fee, minimum term, cancellation, rollover,
   cooldown and pause.

**Changes:**
- Rework `/new/subscription-type` so it does not repeat the same choice as
  `/new/subscription-benefits`.
- Add the live summary panel from Phase A on benefits and billing.
- Move cooldown/pause/rollover into a collapsed "Usage rules" section on billing, while keeping
  the deeper `/sub-rules` dashboard route for post-creation editing.

**Acceptance criteria:**
- The owner can describe the plan before creating it without opening another screen.
- The wizard never asks the owner to choose a subscription "type" twice.
- `Create subscription` is disabled with a concrete missing-requirement message, not only a
  disabled button.

### Phase C — Dashboard Plan / Members / Advanced

**Goal:** turn the subscription dashboard from plan configuration into membership management.

**Changes:**
- Change tabs from `Overview / Advanced` to **Plan / Members / Advanced**.
- Plan tab:
  - Readiness card with missing items.
  - Plan sentence/readback.
  - Billing, benefit, included services, terms, usage rules rows.
  - Subscription-specific preview link.
- Members tab:
  - Seeded member rows for demo: client name, Active / Paused / Cancelling / Past-due, usage this
    cycle, next billing.
  - Empty state for a newly created subscription: "No members yet."
  - Optional row action to pause/reactivate/cancel in local state, if the members store exists in
    this pass.
- Advanced tab:
  - Keep Billing & terms, Membership benefits, Included services, Booking rules, Notifications,
    Settings.
  - Swap Notifications toward preset assignment when Marketing presets are available.

**Acceptance criteria:**
- A subscription can be understood from the Plan tab in one scan.
- The owner can see whether anyone is on the membership.
- Draft subscriptions no longer say "Ready to publish" when important plan details are missing.

### Phase D — Subscription-specific preview

**Goal:** preview the actual membership product, not a generic service card.

**Changes:**
- Update `/app/services/[id]/preview` for `offer.type === "subscription"`:
  - Hero/title/category.
  - Price and renewal period.
  - "What's included" card using the same plan sentence.
  - Included/all-services list summary.
  - Terms: joining fee, minimum term, cancellation.
  - CTA: "Join membership", not "Book now".

**Acceptance criteria:**
- The owner can use preview to verify exactly what the client will understand.
- Preview uses subscription language and never service-booking copy.

### Phase E — Defer consumer redemption/offboarding

Move the earlier B2C phases to follow-up once the B2B offering is signed off:
- `/c/membership/[id]` detail.
- Auto-apply allowance/member pricing in consumer checkout.
- Stan-style cancellation/offboarding save flow.

These remain the right direction, but they should not block the current service-offerings pass.

---

## Feedback → source map

| Area | Feedback | Source (date) | Pattern ref (Mobbin) |
|---|---|---|---|
| Core model | Subscriptions = recurring payments for **credits** OR **service allowances**; fixed monthly credit pots; service-specific allowances (unlimited or weekly limits); **member discounts on additional services** | 19 May | [Fresha-style recurring + allowance-per-cycle](https://mobbin.com/screens/058c5472-7d02-4c6a-956d-4fb780f436a3) |
| **Shared-allowance copy bug** | Current copy implies the member gets *5 of EACH listed service* — must be unambiguous that the allowance (e.g. 5/month) is **shared across all listed services**, not per service | 26 May | [ClassPass — one big balance, never a per-service breakdown](https://mobbin.com/screens/633f7d37-9a4e-45c2-99f6-07e1bbc12367) |
| Live plan summary | The anti-ambiguity guardrail: generate a plain-English summary sentence as the owner builds | 26 May (implied by the copy bug) | — (derived) |
| Plan type at creation | Recurring (auto-renew) vs one-off prepaid package | 19 May + research | [Fresha one-time vs recurring toggle](https://mobbin.com/screens/058c5472-7d02-4c6a-956d-4fb780f436a3) |
| Billing frequency | Monthly / Quarterly / Annual, each showing the **absolute price per period** and a "never charged twice" reassurance | research | [N26 — "Choose how you pay"](https://mobbin.com/flows/b1a64353-4a09-4c07-8a1e-0ec5b69a53d5) |
| First-payment-only discount | Surface explicitly in the builder + on the receipt (matches Fresha) so the owner is never surprised | research | [Fresha](https://mobbin.com/screens/058c5472-7d02-4c6a-956d-4fb780f436a3) |
| **Guardrails / exemptions** (advanced) | Restricted days (block peak days), restricted hours, **minimum interval between bookings** (e.g. once/week). Client has a prior discovery doc + a UAT build to forward | 26 May | [Linktree availability rules](https://mobbin.com/screens/34e1efc7-cebf-4deb-8b44-e6218737aae5) · [Peerspace time-cutoff](https://mobbin.com/screens/9da5696a-6777-4ed6-b282-9c5866f4af8d) |
| Current vs next cycle | Show current cycle and upcoming cycle together so any price/allowance change is unambiguous | research | [ClassPass — current vs upcoming cycle](https://mobbin.com/screens/d1f95c64-1a6d-4f06-b553-2a07aafe0ba3) |
| Pause / reactivate | Lifecycle states; benefits retained while paused; owner- and member-initiated | research | [Bloom — pause with benefits retained](https://mobbin.com/screens/90eeb849-9594-42da-97f9-3a984ef9717b) · [Hims — pause 30/60/90/180](https://mobbin.com/screens/a780e645-7f9a-4c9a-9bb2-4b683147e9ea) |
| **Offboarding** | Build a strong offboarding mirroring onboarding quality — Stan-style "was it price? here's a discount" save flow | 26 May | [Bloom — reason → one-time discount → confirm](https://mobbin.com/flows/9aaef804-e524-465e-9d22-fe0e73d8f850) · [Headspace reason survey](https://mobbin.com/flows/a2f8004c-5004-40b6-9f58-ed0953a391b7) · [Hers — take a break vs discontinue](https://mobbin.com/screens/4a4b0861-708e-428a-a97a-9e942766157e) |
| **Membership benefits/perks** [parked] | Not fleshed out — affiliate discounts with partner brands, cross-vendor perks, referral codes raised but unconfirmed. "No one is doing this… now we have to see it through." Owe a vendor-perspective definition | 26 May (parked) | [Eight Sleep perks grid](https://mobbin.com/screens/75f48001-6829-4e1a-aee1-12200eacbf3f) · [Runna reveal-code](https://mobbin.com/screens/8cf64b79-f757-4e1e-a504-bcc2eac46ad7) · [N26 Partner Rewards](https://mobbin.com/screens/031f12aa-8bb8-43b8-a2f6-29d402831ad1) |
| Store credit [parked] | Recurring credit to spend on services/products — raised but not fleshed out | 19 May + 26 May (parked) | [Suno — monthly credits that reset + top-up](https://mobbin.com/screens/058c5472-7d02-4c6a-956d-4fb780f436a3) |
| Member redemption | Auto-apply coverage / member price at checkout; eligibility badges on services | research | [ClassPass credit balance + manage/add-credits](https://mobbin.com/screens/5e2f1bff-6670-496e-b090-0e0f1944fbec) |
| Multi-tier (defer) | Tiered Silver/Gold benefit ladder — keep to one plan in v1 | research | [Booking.com Genius ladder](https://mobbin.com/screens/35a7f3f4-1367-4785-9eed-1a7d10576123) |

---

## Current state

The subscription type already exists end-to-end but at first-pass fidelity, and its model
**pre-dates** the 26 May feedback — so it has the named copy bug baked in and none of the
guardrails or offboarding.

**Status legend:** ✅ done · 🟡 partial · ❌ missing.

- 🟡 **Wizard flow** — `type → basics(1) → subscription-type(2) → subscription-benefits(3) →
  subscription-billing(4)`, `TOTAL_STEPS.subscription = 4`
  ([`src/app/new/subscription-type/page.tsx`](../../src/app/new/subscription-type/page.tsx),
  [`subscription-benefits`](../../src/app/new/subscription-benefits/page.tsx),
  [`subscription-billing`](../../src/app/new/subscription-billing/page.tsx); entry at
  [`basics/page.tsx:43`](../../src/app/new/basics/page.tsx)).
- 🟡 **Draft + persisted model** — `SubscriptionDraft` in
  [`wizardStore.ts:151`](../../src/lib/store/wizardStore.ts) =
  `{ benefitType: "sessions"|"credit"|"discount"|"access"; billingPeriod: "week"|"month"|"quarter"|"year";
  includedSessions; unlimitedUsage; storeCreditAmount; memberDiscountPercent; joiningFee;
  minimumTermMonths }`. Persisted as `DemoOffer.subscription` ([`offers.ts:153`](../../src/lib/data/offers.ts));
  copied verbatim by `offerFromDraft` ([`offersStore.ts:86`](../../src/lib/store/offersStore.ts)).
- ❌ **The named copy bug** — the "sessions" model has **no concept of *which* services the
  allowance covers** and **no shared-pool wording**. `subscription-benefits` only asks
  "Sessions per billing period" with zero linkage to services — exactly the ambiguity the
  client flagged on 26 May. There is no per-cycle/per-period distinction either.
- ❌ **Plan type (recurring vs one-off)** — not modelled. `benefitType` is the only driver;
  there is no recurring/prepaid choice.
- ❌ **Guardrails** — no restricted days, restricted hours or minimum-interval fields anywhere.
- ❌ **First-payment-only discount rule** — not modelled or surfaced.
- 🟡 **Dashboard** — the shared `/app/services/[id]` page renders `SubscriptionSummary`
  ([`page.tsx:485`](../../src/app/app/services/[id]/page.tsx)): three read-only rows (benefit,
  billing, joining-fee/term). **No member-list, no lifecycle, no cycle view, no tabs** (bundles
  got a tabbed dashboard; subscriptions did not). The shared **Advanced** module list
  (forms / resources / notifications / settings) is available to wire in.
- ✅ **Catalogue + checkout plumbing** — `SERVICE_TYPES` includes "Subscriptions"
  ([`offers.ts:220`](../../src/lib/data/offers.ts)); a seed offer `sub_monthly_cuts` exists;
  `product.ts` derives a `memberships` list for checkout.
- 🟡 **Member-facing (B2C)** — `clientUser.memberships` is a thin display list
  ([`b2c.ts:679`](../../src/lib/data/b2c.ts)) rendered as "your passes" on the wallet
  ([`/c/settings/wallet/page.tsx:131`](../../src/app/c/settings/wallet/page.tsx)) and profile;
  the salon page lists memberships and shows benefit bullets
  ([`/c/salon/[id]/page.tsx:282`](../../src/app/c/salon/[id]/page.tsx)). **No member-detail
  screen, no allowance meter, no perks grid, no redemption-at-checkout, no cancellation flow.**
- ❌ **Offboarding save flow** — does not exist on either surface.

So the work is: **re-model the allowance around a shared pool + recurring/one-off**, **rebuild
the 3-step wizard into a clearer guided builder with collapsed advanced guardrails**, **give
subscriptions a tabbed dashboard with a member-lifecycle surface**, and **build the member
view + redemption + offboarding on `/c`**.

---

## Recommended UX calls

1. **Reframe the wizard around the *allowance model*, not `benefitType`.** The current four-way
   `benefitType` (sessions/credit/discount/access) is the source of the copy bug — it conflates
   "what's the unit?" with "what services does it cover?". Replace it with a two-axis model:
   **plan type** (recurring vs one-off) × **allowance model** (credit pot OR service allowance),
   with member-discount and perks as *additive* layers on top, not mutually-exclusive types.
   `access` collapses into "perks-only" (no allowance). **[ASSUMPTION]** — extends the 19 May
   model rather than contradicting it.
2. **One big number, never a table.** The member balance is always a single figure — "3 of 5
   bookings left this cycle" or "Unlimited" or "£32 credit" — with a plain-English
   *"Shared across Cut, Colour, Blow-dry"* line beneath. This is the literal fix for the 26 May
   copy bug (ClassPass pattern). **No per-service breakdown anywhere.**
3. **Live plan-summary sentence in the builder.** As the owner builds, render a generated
   sentence: *"Members pay £45/month for up to 5 bookings shared across 3 services, plus 10% off
   anything else."* This kills the ambiguity at the source — the owner literally reads back what
   the member will see. **[ASSUMPTION]** (derived from the 26 May copy ask).
4. **Advanced guardrails collapsed by default.** Name + price + frequency + allowance is the
   happy path. Restricted days / hours / min-interval live under an "Advanced options"
   disclosure (Linktree/Peerspace pattern) — toggles that reveal their picker. **Enforce them in
   the consumer booking flow**, not just store them (anti-pattern: calendar-blind guardrails).
5. **First-payment-only discount is explicit.** If the owner sets an introductory discount, the
   builder states *"Applies to the first payment only, then reverts to £45/month"* and it
   appears on the receipt (Fresha rule). [OPEN — needs user decision] whether v1 even offers an
   intro discount, or whether the *only* discount lever is the offboarding save offer.
6. **Membership benefits = a static perks grid.** [ASSUMPTION] Until the client defines the
   vendor model, ship perks as **display cards** — % off services, free add-on, priority
   booking, store-credit top-up, partner offer — each optionally carrying a **reveal-code** or
   **external link** (Eight Sleep grid + Runna redemption). **No cross-vendor settlement, no
   affiliate payouts** this pass. This delivers ~90% of the value with zero integration risk.
7. **Store credit is a recurring pot, surfaced with its rollover rule.** [ASSUMPTION] Model it
   as a balance that tops up each cycle; state clearly whether it **rolls over** or **resets**
   (Suno/ClassPass both surface this inline). Default recommendation: **resets each cycle** for
   allowances, **rolls over** for paid credit pots — flag for confirmation.
8. **Offboarding leads with pause, not cancel.** Reframe the entry as "Manage your membership";
   reason survey first → one triaged save offer → loss-aversion confirm → honest cancel with an
   access-until date (Bloom/Hims/Headspace). **One** offer, matched to the reason — never a menu.
   Always leave a clear cancel path (no dark patterns).
9. **One plan per offer in v1.** No Silver/Gold tiers — they overcomplicate setup for a
   non-technical salon owner. Tiers deferred to V2 (Booking.com ladder pattern when needed).
10. **Reuse, don't rebuild.** The advanced modules (forms/resources/notifications/settings) and
    the dashboard sheet pattern already exist and are shared across offer types — subscriptions
    plug into them exactly as bundles did.

---

## Phase 1 — Re-model the allowance (the data seam)

**Goal:** Fix the model so the shared-pool semantics, recurring/one-off, guardrails and
first-payment discount are *representable* before any screen is rebuilt. Everything additive and
back-compatible so the seed `sub_monthly_cuts` and the legacy `benefitType` drafts keep rendering.

**Flow:** No UI — this is the seam every later phase reads from.

**Changes:**
- [`src/lib/store/wizardStore.ts`](../../src/lib/store/wizardStore.ts) — extend `SubscriptionDraft`
  (see Data); keep the old fields present and derive them so existing pages don't break mid-migration.
- [`src/lib/data/offers.ts`](../../src/lib/data/offers.ts) — `DemoOffer.subscription` already points
  at `SubscriptionDraft`, so it inherits the new fields automatically.
- [`src/lib/store/offersStore.ts`](../../src/lib/store/offersStore.ts) — `offerFromDraft` already
  spreads `draft.subscription`; add defaults for the new fields so a fresh offer is valid.
- New pure helper **`src/lib/data/subscriptions.ts`** — `planSummarySentence(sub, offers)` (the
  live plain-English sentence), `allowanceLabel(sub)` ("3 of 5 left" / "Unlimited" / "£32 credit"),
  `coveredServiceNames(sub, offers)`, and guardrail predicates `bookingAllowedAt(sub, when)` /
  `minIntervalOk(sub, lastBookingISO, when)`. **Pure + SSR-safe** (caller passes the clock/time —
  no `Date.now()`/argless `new Date()` at module top level), mirroring `bundles.ts`.

**Data:** `SubscriptionDraft` gains:
```ts
planType: "recurring" | "oneoff";              // recurring auto-renew vs prepaid package
allowanceModel: "credit" | "service" | "none"; // credit pot | service allowance | perks-only
// service-allowance fields:
coveredServiceIds: string[];                   // the SHARED pool of services
allowanceUnlimited: boolean;
allowanceCount: number;                        // shared bookings per period
allowancePeriod: "week" | "month";             // per-cycle cadence of the allowance
// credit-pot fields (reuse storeCreditAmount):
creditRollsOver: boolean;                      // [ASSUMPTION] rolls over vs resets
// extras (reuse memberDiscountPercent for "% off uncovered services"):
introDiscountPercent?: string;                 // first-payment-only discount
guardrails?: {
  restrictedDays?: string[];                   // "Mon".."Sun" blocked
  restrictedFrom?: string; restrictedTo?: string; // blocked hours window
  minIntervalDays?: number;                    // e.g. 7 = once/week
};
perks?: { id: string; kind: "discount"|"freeAddon"|"priority"|"creditTopup"|"partner"; label: string; detail?: string; code?: string; url?: string }[];
```
`benefitType` is retained and *derived* from `allowanceModel` for the transition (old "sessions"
→ `service`, "credit" → `credit`, "discount"/"access" → `none` + perks).

**Risk:** medium — it is the model everything hangs off, but it is purely additive; the migration
discipline is "keep `benefitType` readable until every screen is moved."

---

## Phase 2 — Rebuild the creation wizard (the shared-pool fix at source)

**Goal:** Replace the type/benefits/billing trio with a clear guided builder that makes the
shared-allowance unambiguous and keeps the simple path simple. `TOTAL_STEPS.subscription` stays
4 (we re-purpose the three subscription steps + basics), with advanced options as a disclosure,
not a step.

**Flow** (numbered, in order):
1. **Plan type** (rebuild `subscription-type`) — two cards: **"Recurring payment — renews
   automatically"** vs **"One-off package — prepaid, redeem later"**, each with a one-line
   explanation (Fresha). Sets `planType`.
2. **Basics** (existing `basics`) — name + category (unchanged; already step 1 of the chrome).
3. **What's included** (rebuild `subscription-benefits` → "What's included") — the allowance step:
   - Choose model: **Credit pot** ("£X to spend each cycle") **or** **Service allowance**.
   - Service allowance → **pick the covered services** (multi-select from the catalogue), then set
     the shared limit: **"Unlimited"** toggle, or **"Up to [5] bookings per [week/month]"** with the
     explicit suffix **"shared across all selected services"**.
   - A **live summary sentence** renders under the controls (`planSummarySentence`) — the
     anti-ambiguity guardrail.
   - Optional row: **Member discount on extras** — "[10]% off any service not covered by this plan".
4. **Billing** (extend `subscription-billing`) — price with currency + **frequency pills
   (Monthly / Quarterly / Annual)** adjacent to the amount (Beside pattern), each showing the
   **absolute price per period** and a saving badge where relevant (N26). Keep joining fee +
   minimum term. Add the optional **first-payment-only intro discount** with the explicit
   "reverts to £X after the first payment" line. "Never charged twice" reassurance copy.
5. **Advanced options** (collapsed disclosure on the billing step, *not* a new step) —
   **Restricted days** (day chips), **Restricted hours** (from/to time pickers), **Minimum
   interval between bookings** ("once per [week]"). Each is a toggle that reveals its picker
   (Linktree/Peerspace). Collapsed by default.
6. **Membership benefits/perks** (optional, also on billing or a light extra panel) — add perk
   cards (% off / free add-on / priority booking / store-credit top-up / partner offer); partner
   perks optionally carry a reveal-code or link. **[ASSUMPTION]**
7. **Review & create** — the full plan stated in plain English (reusing the summary sentence) incl.
   the first-payment-only rule and renewal behaviour; "Create subscription" persists via
   `offerFromDraft` + `addOffer` and opens the dashboard (unchanged create path).

**Changes:**
- `src/app/new/subscription-type/page.tsx` — replace the three benefit cards with the
  recurring/one-off choice.
- `src/app/new/subscription-benefits/page.tsx` → **"What's included"** — credit-pot vs
  service-allowance, covered-service multi-select, shared-limit controls, live summary, extras %.
- `src/app/new/subscription-billing/page.tsx` — frequency pills + per-period amounts, intro
  discount, "never charged twice" copy, the **Advanced options** disclosure, and the perks panel.
- **Compose from `@/components/ui`** (Sheet, toggle, chips, FieldLabel, WizardFooter) — no inline
  hex, no hand-rolled toggles. ⚠️ the current `subscription-benefits`/`-billing` pages hand-roll a
  toggle (the `bg-navy`/`bg-border` pill) and use raw inputs — swap to library primitives while here.
- Smoke needle for the new "What's included" empty state and the advanced disclosure.

**Data:** writes the Phase-1 `SubscriptionDraft` fields. No new fields beyond Phase 1.

**Risk:** medium-high — the largest screen rebuild, and it carries the headline copy fix; but it
reuses the wizard chrome and library primitives.

---

## Phase 3 — Subscription dashboard (tabbed) + member lifecycle

**Goal:** Give the subscription offer a proper management surface, mirroring how bundles got a
tabbed dashboard. The owner manages **the plan** *and* **the members on it**.

**Flow** (on `/app/services/[id]` when `offer.type === "subscription"`):
1. **Tabs: Plan / Members** (between the offer header and the Preview/Publish footer; other types
   keep their single scroll — same conditional as `BundleBody`).
2. **Plan tab** —
   - **Ready-to-publish card** (plan complete vs "finish setup").
   - **Price & frequency** row → edit sheet (price + Monthly/Quarterly/Annual).
   - **What's included** row → "5 bookings/month shared across Cut, Colour, Blow-dry" (or
     "£50 credit/month", or "Perks only"); taps back into the allowance editor.
   - **Member discount on extras**, **Advanced guardrails** (restricted days/hours/min-interval),
     **Perks** — each an editable row/sheet.
   - **Advanced** rows reuse the shared modules: Forms, Resources, Notifications, Settings
     (`/app/services/[id]/{forms,resources,notifications,settings}`) exactly as today.
3. **Members tab** — list of members on this plan, each row: name, **status badge**
   (Active / Paused / Cancelling / Past-due), allowance used vs remaining this cycle, next billing
   date. Empty state: "No members yet" + a smoke needle.
4. **Member detail** (`/app/services/[id]/member/[memberId]`) —
   - Status badge + **current cycle vs next cycle shown together** (ClassPass) so any
     price/allowance change is unambiguous; next billing date + amount.
   - Allowance usage meter (one number) + rollover rule inline.
   - **Actions:** Pause / reactivate (benefits retained), Change plan or frequency (applies on
     next billing date, "never charged twice"), Edit payment method (display-only state in the
     prototype), **Add one-off credits**, Cancel (routes to offboarding).
   - **Activity / redemption history** — bookings drawn against the allowance + payment history
     (seeded display data).

**Changes:**
- `src/app/app/services/[id]/page.tsx` — add a `SubscriptionBody` (tabbed) parallel to
  `BundleBody`; keep `SubscriptionSummary` as the Plan-tab content, extended with the new rows.
- New route `src/app/app/services/[id]/member/[memberId]/page.tsx` — member detail + actions.
- New seed members + lifecycle in data (see Data); store actions on a new slice.

**Data:**
- New **`src/lib/data/members.ts`** seed: `Membership { id; offerId; clientName; status:
  "active"|"paused"|"cancelling"|"past_due"; cycleStartISO; cycleEndISO; allowanceUsed;
  nextBillingISO; nextAmount; history: {…}[] }` — display data; no real billing.
- New **`src/lib/store/membersStore.ts`** (grep first — no existing members store): actions
  `pauseMembership`, `reactivateMembership`, `changePlan`, `addCredits`, `cancelMembership`,
  `setStatus`. Session-local Zustand.

**Risk:** medium — new route + store slice, but the tab pattern and module rows are established.

---

## Phase 4 — Member view + redemption at checkout (B2C `/c`)

**Goal:** The member sees their pass the way ClassPass does (one big number), and the
allowance/discount is auto-applied at booking. This is the consumer half of the shared-pool fix.

**Flow:**
1. **Membership detail** (`/c/membership/[id]`, reached from the wallet "your passes" rows) —
   - **Hero:** one big balance number — "3 of 5 bookings left this cycle" / "Unlimited" /
     "£32 credit" — with a **resets-in** countdown. *Never* a per-service breakdown.
   - Plain-English line: **"Shared across Cut, Colour, Blow-dry"**; renewal date + amount.
   - **Benefits / Perks tab** — visual grid of perk cards (Eight Sleep); partner offers reveal a
     code or open a link (Runna). **[ASSUMPTION]**
   - **Manage:** Book using membership · Change/pause · Help · Cancel (→ offboarding, Phase 5).
2. **Redemption at checkout** (extend `/c/salon/[id]/book`) —
   - At service selection, eligible services show an **eligibility badge**: "Covered by your
     membership" / "Member price".
   - Booking summary auto-applies the allowance: line item **"Membership (1 of 5 this month)"** =
     covered, or the member discount with a strike-through original price.
   - If the allowance is exhausted: clear message + member price on the overflow — "Allowance used
     — member price applied".
   - **Guardrails enforced here** (not just stored): restricted days/hours grey out slots; the
     min-interval rule blocks a too-soon slot with an explanatory line. Uses `bookingAllowedAt` /
     `minIntervalOk` from `subscriptions.ts`.

**Changes:**
- New route `src/app/c/membership/[id]/page.tsx` — hero balance + shared-across line + perks grid
  + manage actions. **Compose from `@/components/ui/consumer`** (coral surface).
- `src/app/c/salon/[id]/book/page.tsx` — eligibility badges + auto-applied coverage/discount +
  guardrail slot enforcement.
- `src/lib/data/b2c.ts` — flesh out `clientUser.memberships` items to carry `offerId`, allowance
  state and perks so the detail screen and checkout can read real shape (back-compatible —
  existing two rows keep rendering on the wallet/profile).

**Risk:** medium — new consumer screen + the booking-flow integration; coral surface must stay
distinct (no homogenising with the B2B ink screens, per CLAUDE.md rule 2).

---

## Phase 5 — Offboarding / cancellation save flow (B2C `/c`)

**Goal:** The client's headline 26 May ask — a Stan-style "was it price? here's a discount" save
flow that mirrors onboarding quality. Pause-first, one triaged offer, honest cancel.

**Flow** (`/c/membership/[id]/cancel`, multi-step, reached from "Cancel" in Phase 4):
1. **Entry reframed as "Manage your membership"** — retention-positive options up top; "Continue
   to cancel" is the quieter path (Hers).
2. **Reason survey** (single-select, captured **first**): *Too expensive · Not using it enough ·
   Not the right time · Service issue · Something else* (Headspace).
3. **Triaged save offer — ONE offer, matched to the reason** (never a menu):
   - **Price** → a time-boxed discount: "Keep your membership at 50% off for 3 months" with the
     quiet "No, I want to cancel" escape (Bloom).
   - **Not using / not the right time** → **Pause** with concrete durations (30 / 60 / 90 days),
     each showing the **resulting next-charge date** and "benefits retained" (Hims). Pause is the
     highest-converting save — make it prominent, never buried.
   - **Service issue** → contact the salon / message the owner.
   - **Value** → remind them of unused benefits + remaining allowance.
4. **Loss-aversion confirm** — what they give up (remaining allowance, member pricing, perks);
   **"Keep my membership"** as the bold primary, "Continue to cancel" quiet (Bloom/Deepstash).
5. **Cancellation confirmation** — access-until date stated ("You keep your benefits until [date]"),
   with an easy **resubscribe** entry point left in place. No dark patterns — cancel always reachable.

**Changes:**
- New route `src/app/c/membership/[id]/cancel/page.tsx` — a small step machine
  (`reason → offer → confirm → done`), composed from `@/components/ui/consumer`.
- `membersStore` actions reused (`pauseMembership`, `cancelMembership`, plus a `applySaveOffer`
  that records the accepted discount for display).
- Smoke needles for the reason-survey, pause-offer and confirmation states.

**Risk:** medium — multi-step flow with branching, but each screen is simple and the branching is
a single switch on the reason.

---

## V2 / deferred

- **Real recurring billing & dunning** — Stripe subscriptions, failed-payment (`past_due`)
  recovery, proration on plan/frequency change, receipts with the first-payment-only line.
  *Direction:* this rides the same dedicated payments/Stripe session that team-pay settlement is
  routed to; the prototype models the **states** (`past_due`, "applies on next billing date") so
  the UI is ready when billing lands.
- **Multi-tier plans (Silver / Gold)** — a locked/unlocked benefit ladder (Booking.com Genius).
  *Direction:* a `tiers: PlanTier[]` extension of the offer when the client asks; deliberately out
  of v1 to keep the SMB owner's setup simple.
- **Real cross-vendor / affiliate perks** — partner settlement, referral codes with payout
  tracking, cross-salon member perks (the "marketplace social vision", 2 Jun). *Direction:* keep
  v1 perks as static cards with reveal-code/link; build settlement only once the client delivers
  the owed vendor-perspective definition. **[ASSUMPTION] until then.**
- **Store-credit ledger & top-ups** — a true credit balance spendable on services *and* products,
  with top-up purchases and an expiry/rollover policy (Suno). *Direction:* extend the wallet
  (`clientUser.wallet`) into a real ledger; v1 displays the recurring pot + its rollover rule only.
- **Owner-initiated win-back** — re-engage paused/cancelled members with a targeted offer from the
  Members tab (pairs with the Marketing + Analytics work, 16 Jun). *Direction:* a "win back" action
  on cancelled rows feeding a Marketing campaign.
- **Allowance rollover policy controls** — let the owner choose roll-over vs reset per plan and cap
  the carryover. *Direction:* a single setting on the allowance step once the default is confirmed.

---

## Suggested order & rationale

`1 (model) → 2 (wizard rebuild) → 3 (dashboard + members) → 4 (member view + redemption) → 5 (offboarding)`

Phase 1 first because every later screen reads the new shared-pool model — and the model *is* the
fix for the named copy bug, so it must land before the screens that express it. Phase 2 next
because the wizard is where the owner is actively misled today, and the live summary sentence is
the cheapest, highest-leverage fix. Phase 3 makes the owner side manageable (members + lifecycle).
Phases 4–5 are the consumer surface: redemption (the other half of the shared-pool fix) before
offboarding, since offboarding's "remind them of remaining allowance/benefits" screen depends on
the member-view allowance data being real. Phase 5 is the client's headline ask and a natural
finale — high-visibility, self-contained, and the strongest retention lever.

Every phase ends green on `npx tsc --noEmit && npx next lint && npm run smoke`, with a smoke
needle for each new empty/setup state. Persistence stays session-local Zustand
(`offersStore` / new `membersStore`), consistent with the rest of the app.

---

## Cross-cutting data-model changes

`SubscriptionDraft` (`wizardStore.ts`) — and therefore `DemoOffer.subscription` (`offers.ts`),
copied by `offerFromDraft` (`offersStore.ts`) — gains:
- `planType: "recurring" | "oneoff"` (Phase 1)
- `allowanceModel: "credit" | "service" | "none"` (Phase 1)
- `coveredServiceIds`, `allowanceUnlimited`, `allowanceCount`, `allowancePeriod` — the **shared
  pool** (Phase 1)
- `creditRollsOver` (Phase 1) **[ASSUMPTION]**
- `introDiscountPercent?` — first-payment-only (Phase 2) **[OPEN]**
- `guardrails?: { restrictedDays?; restrictedFrom?; restrictedTo?; minIntervalDays? }` (Phase 2)
- `perks?: { id; kind; label; detail?; code?; url? }[]` (Phase 2) **[ASSUMPTION]**
- `benefitType` **retained and derived** for back-compat during the migration.

New modules:
- `src/lib/data/subscriptions.ts` — `planSummarySentence`, `allowanceLabel`,
  `coveredServiceNames`, `bookingAllowedAt`, `minIntervalOk` (pure, SSR-safe) (Phase 1).
- `src/lib/data/members.ts` — `Membership` seed (Phase 3).
- `src/lib/store/membersStore.ts` — lifecycle actions (Phase 3).
- `src/lib/data/b2c.ts` — `clientUser.memberships` enriched with allowance state + perks (Phase 4).

All optional / additive / back-compatible — the seed `sub_monthly_cuts`, the two `clientUser`
memberships, and the legacy `benefitType` drafts keep rendering. No clock/randomness at module or
render top level (guardrail predicates take the time as an argument).

---

## Open questions for the user

1. **Intro discount in v1?** Does the owner get a first-payment-only intro discount in the
   builder, or is the *only* discount lever the offboarding save offer? (Affects
   `introDiscountPercent`.)
2. **Store-credit rollover default** — should a paid credit pot **roll over** or **reset** each
   cycle, and do service allowances ever roll over? (We recommend: credit rolls over, service
   allowance resets — confirm.)
3. **Membership-benefits model** — the parked one. Can the client share the owed vendor-perspective
   definition (and the 26 May discovery doc + UAT build covering guardrails)? Until then perks ship
   as static cards with reveal-code/link **[ASSUMPTION]**.
4. **One-off prepaid packages vs bundles** — a "one-off package, redeem later" subscription overlaps
   conceptually with a flexible **bundle**. Should one-off prepaid live here, or stay a bundle and
   make subscriptions recurring-only? (Affects whether `planType: "oneoff"` exists at all.)
5. **Guardrail enforcement scope** — the 26 May UAT build covers restricted days/hours/min-interval;
   do we enforce all three in the consumer booking flow this pass, or store-and-display some?
6. **Members surface ownership** — should the per-plan Members list live on the subscription
   dashboard (as planned), in the Clients section, or both? (We default to the dashboard; Clients
   could deep-link in.)
