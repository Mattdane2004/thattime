# Plans & Billing — Finalisation Plan

> **Status:** Plan only — no implementation until the open questions below are resolved (the IAP-vs-web billing decision in particular gates Phase 2).
> **Scope:** The vendor's **own** That Time subscription — the onboarding trial/pricing step, a new in-app **Plans & billing** hub (current plan, change plan, billing history, payment method, cancel/downgrade), and the **upgrade gate** fired when a single-staff shop adds a team member. This is the B2B (ink/navy) surface.
> **Explicitly out of scope this pass:** the customer-facing **Memberships / Subscriptions** product the salon sells to *its* clients (B2C `/c` + the `src/app/new/subscription-*` wizards) — that is a different domain and must stay visually and structurally distinct (see anti-patterns). Also out: a real payment backend / Stripe integration (persistence stays session-local Zustand), VAT-invoice PDF generation, and dunning/email automation. Past-due is modelled as a *state*, not a real failed charge.
> **Source of truth for feedback:** Granola sessions with Shabbir & Vishal — primarily **"That Time Product alignment" (19 May 2026)** for the pricing/onboarding drop-off and tiers, **"That Time Product alignment" (9 Jun 2026)** for the add-member upgrade gate, the **"that time sign off" (15 Jun 2026)** walkthrough, and the **"TT planning" (16 Jun 2026)** internal section list which scopes Plans & Billing as the vendor's own subscription.
> **Design source → design in-app from feedback + best-in-class patterns.** No finalised Figma frames for this section; build from the meeting feedback and the Mobbin patterns cited per phase, composed from `@/components/ui` and reviewed in the running app (same convention as `team-finalisation-plan.md`).

---

## What this section is

**Plans & billing is the salon owner's relationship with That Time itself** — what plan they're on, what they pay, when they're billed, and how they change it. It is NOT the membership/subscription product a salon sells to *its own* clients. It sits in the business hub under **Menu → Account → "Plans & billing"** (`src/app/app/hub/page.tsx` already lists this item — today it is a dead button with no destination) and is first encountered as the **trial/pricing step** at the end of onboarding. Pricing is organised around **team-size tiers** (Single / 2–5 / 6–9 / 10+ staff), so the section is tightly coupled to the Team section: growing past a tier ceiling triggers an **upgrade gate**.

---

## Feedback → source map

| Area | Feedback | Source (date) | Pattern ref (Mobbin) |
|---|---|---|---|
| Tiers | Team-size pricing tiers: Single / 2–5 / 6–9 / 10+ staff are the spine of pricing | 19 May 2026 | [Duolingo — Family 2–6 / Individual tiers](https://mobbin.com/screens/398a23f4-2df5-40a6-bcba-54aa59dc6cd1) |
| Onboarding drop-off | 30% drop off at the subscription page — needs prominent "no card required" messaging for the free trial | 19 May 2026 | [Peloton — "No equipment or credit card required"](https://mobbin.com/screens/18255be5-a1c2-4a3a-bfb1-a6d02f7430fa), [Blinkist — How your free trial works](https://mobbin.com/screens/81f2a9e0-9db4-4a85-bf0b-e9084f7ed343), [Tripsy — "No payment now"](https://mobbin.com/screens/b830e599-d8f7-4f5f-b166-0f06a4aec46a) |
| In-page tier adjust | Team-size adjustment **on** the pricing page to avoid lengthy back-navigation | 19 May 2026 | [BlaBlaCar — −/+ seats stepper](https://mobbin.com/screens/2c5f10b6-da65-4ef6-9c22-92f09e8820ed) |
| Upgrade gate | A single-staff shop must upgrade its subscription when adding a team member | 9 Jun 2026 (team plan) | [Todoist — contextual upgrade gate](https://mobbin.com/screens/06378d27-5f3d-483b-8e06-9f9e9cdc0ea3), [Beside — "You won't pay twice, refunded pro-rata"](https://mobbin.com/screens/e18b1d2e-6463-4d4c-9a03-edbf729429ee), [Beside — Review Upgrade "Total due today"](https://mobbin.com/screens/8cd09dab-359c-4514-bf7e-7cb2cbebb171) |
| Proration clarity | Show the exact money event before confirm; show future charges so the owner doesn't do maths | 9 Jun / 19 May 2026 | [Panera — Upcoming Charges table](https://mobbin.com/screens/e34385a6-d8da-42bb-8f50-5e48f03c1a5f) |
| Klarna/Clearpay | BNPL value prop surfaced near pricing | 19 May 2026 | (pattern — annual-only gating; see anti-patterns) |
| Manage plan | In-app: current plan + change plan | 16 Jun 2026 | [GoodRx — Manage your Gold plan](https://mobbin.com/screens/54efcc84-9f60-4bcf-baec-62fa91d0d236), [Revolut — Manage plan](https://mobbin.com/screens/d1099b0d-2cf3-4ce9-b3e3-fa3c7d948971), [Tumblr — active status + Change plan](https://mobbin.com/screens/8c3a7fb2-d6de-44d3-8b08-66277d4abb03) |
| Billing history | Billing history / invoices for the TT subscription | 16 Jun 2026 | [Clay — invoice history + payment method](https://mobbin.com/screens/79d4dfc8-844a-4a89-8aad-314f490df236) |
| Payment method | Manage the card that pays for the TT subscription | 16 Jun 2026 | [GoodRx — payment method (Visa ••2970)](https://mobbin.com/screens/54efcc84-9f60-4bcf-baec-62fa91d0d236) |
| Cancel / downgrade | Cancel or downgrade the TT subscription | 16 Jun 2026 | [Acorns — Cancel / "Need another option?"](https://mobbin.com/screens/498f3a81-6a39-43d2-b2a8-8d75f601bfe5), [Clay — Canceled state](https://mobbin.com/screens/79d4dfc8-844a-4a89-8aad-314f490df236) |
| Annual upsell | Monthly↔annual with a quantified savings nudge | 19 May 2026 (yearly −16% already in build) | [Revolut — "Save with annual" nudge](https://mobbin.com/screens/d1099b0d-2cf3-4ce9-b3e3-fa3c7d948971), [Notion — monthly/annual cards](https://mobbin.com/screens/ee10f799-1d4a-499b-83dc-fcdca31cb6ae) |
| Web-vs-IAP billing | Decide how the seat-based plan is sold/billed on mobile (App Store 30% on per-seat) | [OPEN — needs user decision] | [Upwork — "managed by Apple" disclosure](https://mobbin.com/screens/2b2ddf73-d234-44de-a278-2a872ae267f7), [Canva — IAP dead-end anti-pattern](https://mobbin.com/screens/9b4270d2-a7a6-447f-b8e9-dc9674d9156d) |
| Separation | Keep this distinct from the customer Memberships/Subscriptions product | 16 Jun 2026 | — (IA / labelling rule) |

---

## Current state

**Status legend:** done · partial · missing.

- **Onboarding trial/pricing step** — `src/app/onboarding/trial/page.tsx`. **partial.** Already does a lot: a benefits list, a **Team Size** dropdown with the four bands (`["Just me", "2 – 5", "6 – 9", "10 or more"]`), monthly/yearly plan cards (yearly badged `-16%`), a savings line, and — critically — a **"No card needed today. We'll remind you before your trial ends."** note above the CTA "Start 30 days free trial". Gaps vs the feedback: the band picker is a **dropdown** (hidden behind a tap), not the in-page segmented control / stepper the stakeholder asked for; there is **no 3-point trial timeline**; price does **not recompute** when the band changes (the two price cards are static `£510/yr` / `£49.99/mo`); **no Klarna/Clearpay** line; and the file uses **inline hex** (`bg-[#F0E6DC]`) which breaks the CLAUDE.md no-inline-hex rule.
- **Onboarding store** — `src/lib/store/onboarding2.ts`. **partial.** Holds `plan: "yearly" | "monthly"` and `trialTeamBand: string` (default `"6 – 9"`). There is no canonical **tier** type, no per-tier prices, no trial dates, no "active subscription" record — the store only captures the onboarding selection, nothing steady-state.
- **In-app Plans & billing hub** — **missing.** `src/app/app/hub/page.tsx` line 54 lists `{ key: "billing", label: "Plans & billing", icon: CreditCard }` in `accountItems`, but it has **no `href`** — it renders as a dead `<button>`. There is no `/app/billing` (or similar) route, no status card, no change-plan flow, no invoices list, no payment-method screen.
- **Upgrade gate (single → team)** — **missing.** The team section (`src/app/app/team/`, invite at `src/app/app/team/invite/page.tsx`, pay at `src/app/app/team/[id]/pay/page.tsx`) has **no** subscription-tier awareness; adding a member does not check or change any plan. (The 9 Jun feedback and `team-finalisation-plan.md` Phase 0c both flag this gate as belonging here, not in Team.)
- **Billing domain (data/store)** — **missing.** `grep` of `src/lib/data` and `src/lib/store` finds no billing/subscription module. No tiers, no prices, no invoices, no payment method.
- **Customer-facing subscription product (the thing to NOT confuse this with)** — **done, separate.** The B2C wizards live at `src/app/new/subscription-{type,benefits,billing}` and the consumer wallet at `src/app/c/settings/wallet/page.tsx`. These are the salon's *product*, not the salon's *bill from us* — different surface, keep distinct.
- **Component library** — **done.** Everything needed exists in `@/components/ui`: `SegmentedControl`, `Sheet`/`BottomSheet`, `SummaryRow`, `StatTile`, `Badge`/`StatusPill`, `PrimaryButton`/`DarkButton`/`GhostButton`, `ToggleRow`, `EmptyState`. No new primitive is required.

---

## Recommended UX calls

Opinionated decisions where the client left things open, tagged so you can see what is mine vs theirs.

1. **One canonical tier model, shared everywhere.** `[ASSUMPTION]` Introduce a single `src/lib/data/billing.ts` with a `BillingTier` spine (`single` | `team_2_5` | `team_6_9` | `team_10_plus`) carrying display name, staff ceiling, and monthly/annual price. The onboarding band picker, the in-app status card, and the upgrade gate all read from this one source. This kills the current string-band drift (`"Just me"` vs a tier the gate would need to compute against staff count).

2. **Replace the onboarding band dropdown with an in-page segmented control + live price.** `[ASSUMPTION]` The 19 May feedback explicitly blames "lengthy back-navigation" for drop-off. A `SegmentedControl` (Single | 2–5 | 6–9 | 10+) that recomputes the two price cards in place is the direct fix — change size, watch price update, no extra screen (BlaBlaCar stepper / Duolingo tier pattern). Keep the existing yearly/monthly cards.

3. **Lead the trial step with "no card required" + a 3-point timeline.** `[ASSUMPTION]` The "No card needed today" line already exists but is buried below the fold as a footnote. Promote it to a headline treatment and add the near-universal timeline (Today → Day 28 "we'll remind you" → Day 30 "we'll ask you to pick a plan"). This is the single highest-leverage drop-off fix (Peloton / Blinkist / Tripsy).

4. **In-app hub = one scrollable screen, GoodRx-style.** `[ASSUMPTION]` Do not tab or nest. A status card on top, a primary "Change plan" button, then stacked sections (Billing history, Payment method) and a quiet footer with "Cancel or downgrade" and "Billing help". Cancel is a **low-emphasis text link**, never a primary button — but present, not buried (app-store / regulatory requirement).

5. **The upgrade gate fires at the add-member action and completes the original task.** `[ASSUMPTION]` It is a contextual bottom sheet at the moment of adding the teammate (Todoist), not a nag. On success it both upgrades the plan **and** completes the invite ("You're on Team 2–5. {Name} has been invited."). "Not now" cancels the add cleanly — never half-add a member without upgrading.

6. **Money clarity is a headline, never fine print.** `[ASSUMPTION]` Every plan change shows a current→new diff (Upwork), a bold **"Total due today £X (pro-rata)"**, **"then £Y/mo from {date}"**, and the Beside reassurance "You won't pay twice — we'll credit your current plan." Proration shown as a small dated future-charges block (Panera), so the owner never does the maths.

7. **Downgrade is offered softly, never forced.** `[ASSUMPTION]` When staff count drops below a tier ceiling, surface "You could move to Single and save £X" (Acorns "Need another option?") rather than auto-downgrading or forcing it. Owners may keep headroom for seasonal staff.

8. **Klarna/Clearpay only on annual.** `[ASSUMPTION]` BNPL terms are typically invalid below ~2 months, so a Klarna line on a £49.99 monthly plan erodes trust at checkout. Gate the "Spread the cost in 3 with Klarna" affordance to the **annual** price only.

9. **Billing dates are seeded, not computed at runtime.** `[ASSUMPTION]` Per the SSR rules (no `new Date()`/`Date.now()` at module/render top level), trial-end and next-bill dates are stored as fixed display strings on the seeded subscription record (e.g. `"3 April"`), consistent with the rest of the prototype's static dates.

10. **Web-vs-IAP billing is the one decision I can't make for you.** `[OPEN — needs user decision]` Selling a seat-based plan through App Store IAP means a 30% cut on every per-seat upgrade. The honest options are (a) sell via web/Stripe and make mobile a manager with a "Manage on web" deep-link + Upwork-style "managed by Apple" disclosure, or (b) eat IAP. For the prototype I default to **(a) styling**: show the disclosure line and a "Manage on web" affordance on the change/upgrade confirmations, but keep the flow fully interactive in-app (no real dead-end). This is reversible once you decide. The one firm rule: **never** dead-end like Canva's bare "you can't do this on mobile" wall.

---

## Phase 1 — Onboarding trial step rebuild (the 30% drop-off fix)

**Goal:** Turn `trial/page.tsx` into the conversion-optimised trial start: prominent "no card required", a 3-point trial timeline, an in-page tier segmented control with live price, and the Klarna-on-annual line — removing the back-navigation and card-anxiety that the 19 May session blamed for the 30% drop-off.

**Flow:**
1. **Headline** — "Start your free trial" with a bold, promoted **"No card required"** badge directly under it (currently a footnote — promote it).
2. **Trial timeline** — a 3-point vertical timeline: **Today** (full access) → **Day 28** ("we'll remind you") → **Day 30** ("your trial ends — pick a plan, cancel anytime before"). (Blinkist/Tripsy pattern.)
3. **Team-size selector** — replace the dropdown with a `SegmentedControl`: **Single | 2–5 | 6–9 | 10+**. (Stakeholder's "adjust on the page" ask; BlaBlaCar/Duolingo.)
4. **Live price preview** — the existing yearly/monthly cards recompute from the selected tier's price in `billing.ts`. Yearly keeps the `-16%` badge.
5. **Klarna/Clearpay line** — shown **only** when the annual card is selected: "Or spread the cost in 3 with Klarna." (Gated per recommended call #8.)
6. **Primary CTA** — "Start free trial" (no payment fields). Secondary muted "See full plan comparison" link for the minority who want the matrix (Phase 4 / V2).
7. **Confirmation** — keep the existing forward route to `/onboarding/first-step`; on the way set the seeded subscription into trial state.

**Changes:**
- `src/app/onboarding/trial/page.tsx` — swap the band dropdown for `SegmentedControl`; add the timeline block; wire price cards to `billing.ts`; promote "no card" to a headline badge; add the annual-only Klarna line; **fix the inline hex** (`bg-[#F0E6DC]` → token class) while here.
- `src/lib/data/billing.ts` (new) — `BillingTier` spine + per-tier monthly/annual prices + Klarna eligibility flag.
- `src/lib/store/onboarding2.ts` — change `trialTeamBand: string` → `tier: BillingTier`; on "Start free trial", seed the subscription (Phase 2 store).

**Data:** new `BillingTier` union + `TIERS` table (name, staffCeiling, priceMonthly, priceAnnual). `onboarding2` swaps the loose band string for the typed tier.

**Risk:** low–medium. Self-contained screen; main care is migrating the loose band string to the typed tier without breaking the existing forward flow. Add a smoke needle for the rebuilt trial screen.

---

## Phase 2 — In-app Plans & billing hub (steady-state management)

**Goal:** Wire the dead "Plans & billing" hub item to a real one-screen management hub answering "what am I on, when am I billed, how do I change/cancel, who pays" — GoodRx-style, no tabs, no nesting.

**Flow (single scrollable screen at `/app/billing`):**
1. **Status card** — plan name + tier ("Team 2–5"), a **Trial / Active / Past-due** `Badge`, "Next bill £X on {date}", and **current staff count vs tier ceiling** ("3 of 5 staff"). (Revolut/Tumblr status-led card.)
2. **Change plan** — primary `PrimaryButton`, plus a contextual "Save 16% with annual" nudge if on monthly. (Revolut nudge.)
3. **Billing history / Invoices** — reverse-chronological `SummaryRow` list; each row tappable to a (mock) VAT receipt view. (Clay.)
4. **Payment method** — card brand + last 4 + expiry, with an "Update" affordance — or the "Managed by Apple / on web" disclosure depending on the open IAP decision. (GoodRx / Upwork.)
5. **Footer (low-emphasis)** — text links "Cancel or downgrade" and "Need help with billing?".
6. **Change-plan flow** (reached from #2) — a current→new diff sheet with the money-clarity block (recommended call #6): "Total due today £X (pro-rata)" + "then £Y/mo from {date}" + the dated future-charges mini-table (Panera) + Beside pro-rata reassurance. Confirm applies the new tier to the subscription store.
7. **Cancel/downgrade** (reached from #5) — Acorns-style: offer the softer "Need another option?" (e.g. switch to annual or step down a tier) before the bare cancel; on cancel, set the subscription to a `canceled` state showing access-until date (Clay canceled state).

**Changes:**
- `src/app/app/billing/page.tsx` (new) — the hub screen.
- `src/app/app/billing/change/page.tsx` (or a `Sheet`) — change-plan diff + money-clarity + confirm.
- `src/app/app/billing/invoices/[id]/page.tsx` (or a `Sheet`) — mock VAT receipt.
- `src/app/app/hub/page.tsx` — give the `billing` account item `href: "/app/billing"`.
- `src/lib/store/billingStore.ts` (new) — the steady-state subscription record + actions (`changeTier`, `setBillingCycle`, `cancel`, `updatePaymentMethod`).
- `src/lib/data/billing.ts` — seed an active subscription, invoice list, and a payment method.

**Data:** `Subscription { tier; cycle: "monthly"|"annual"; status: "trial"|"active"|"past_due"|"canceled"; nextBillDate: string; nextBillAmount: string; accessUntil?: string }`; `Invoice { id; date; amount; status; receiptUrl? }`; `PaymentMethod { brand; last4; expiry } | { managedBy: "apple"|"web" }`.

**Risk:** medium — new route + new store, but each screen composes existing UI and follows the GoodRx single-screen IA closely. Smoke needles for the hub, the change-plan diff, and the empty-invoices state.

---

## Phase 3 — Upgrade gate (single-staff shop adds a 2nd member)

**Goal:** When a `single`-tier shop adds a team member, gate the action behind an explicit, money-clear upgrade to `team_2_5` — and on success complete the original invite so the owner finishes the task they came to do.

**Flow:**
1. **Trigger** — inline at the add-member action in the Team section (`src/app/app/team/invite/page.tsx` confirm, or the roster "Add" entry). Fires only when adding the member would exceed the current tier ceiling. (Todoist contextual gate.)
2. **Gate sheet** — `BottomSheet`: "Adding a team member moves you to the Team plan (2–5 staff)" with a current→new diff (Single £X → Team 2–5 £Y). (Upwork diff.)
3. **Money clarity** — "Total due today £Z (pro-rata)" + "then £Y/mo from {date}" + Beside "You won't pay twice — we'll credit your current plan." (Recommended call #6.)
4. **Klarna line** — annual only (recommended call #8).
5. **IAP disclosure** — per the open decision: the "managed by Apple / Manage on web" line if web-billed (Upwork honesty), never a dead-end.
6. **Actions** — primary **"Upgrade & add {Name}"**; secondary **"Not now"** which cancels the add (don't half-add the member).
7. **Success** — "You're on Team (2–5). {Name} has been invited." — completing the invite. The Team roster now shows the member; the billing status card reflects the new tier.
8. **Downgrade mirror** — when staff count later drops under a tier ceiling, the billing hub (Phase 2) surfaces "You could move to Single and save £X" rather than forcing it. (Acorns.)

**Changes:**
- `src/components/billing/UpgradeGateSheet.tsx` (new, shared) — the gate sheet, reused anywhere a tier ceiling can be exceeded.
- `src/app/app/team/invite/page.tsx` (+ the roster add entry) — call the gate before completing the invite when the ceiling would be exceeded.
- `src/lib/store/billingStore.ts` — `tierForStaffCount(n)` helper + `changeTier` reused; a selector that compares live staff count (from `teamStore`) to the current tier ceiling.

**Data:** no new model — derives from `Subscription.tier` (Phase 2) + the team store's staff count. Adds a `tierForStaffCount` helper to `billing.ts`.

**Risk:** medium — crosses the Team↔Billing boundary; the care is that "Not now" fully unwinds the add and that the gate only fires on a genuine ceiling breach (not on every add). Smoke needle for the gate sheet.

---

## Phase 4 — Past-due recovery + full plan comparison

**Goal:** The trust-and-recovery edges: a failed-payment recovery state, and the "See full plans" matrix tucked behind a link (never the primary view).

**Flow:**
1. **Past-due banner** — when `status: "past_due"`, the billing hub leads with a recovery prompt: "Update your payment to keep your account" → opens the payment-method update. (Clay.)
2. **Full plan comparison** — reached from the onboarding "See full plan comparison" link and the hub's "Change plan"; a comparison view that **leads with the recommended tier for the owner's team size** and tucks the full feature matrix below. (Anti-pattern: never lead a non-technical owner with a raw matrix.)
3. **Annual savings nudge** — quantified "Save £X with annual" surfaced contextually on monthly. (Revolut/Notion.)

**Changes:**
- `src/app/app/billing/page.tsx` — past-due branch + recovery prompt.
- `src/app/app/billing/plans/page.tsx` (new) — recommended-tier-first comparison.
- `src/lib/data/billing.ts` — per-tier feature lists for the matrix.

**Data:** `BillingTier` gains an optional `features: string[]`; `Subscription.status` already includes `past_due` from Phase 2.

**Risk:** low–medium. Mostly presentational once the model exists. Smoke needles for the past-due state and the plans screen.

---

## V2 / deferred

- **Real Stripe / payment backend** — the prototype mocks the subscription record; a real integration (Stripe Billing, proration via their API, webhooks for past-due) is a dedicated payments session. **Direction:** keep the `billingStore` action surface (`changeTier`, `cancel`, `updatePaymentMethod`) so it can be backed by Stripe later without UI churn.
- **VAT-compliant invoice PDFs** — Phase 2 shows a mock receipt screen; real downloadable VAT PDFs need a generator + business VAT details. **Direction:** model `Invoice.receiptUrl` now; generate later.
- **IAP integration proper** — if the open decision lands on App Store IAP, that's StoreKit/receipt-validation work beyond a Next.js prototype. **Direction:** the "managed by Apple / Manage on web" disclosure styling lands now (Phase 2/3); the real purchase plumbing is V2.
- **Reminder / dunning emails** — the "we'll remind you before your trial ends" promise implies a reminder system. **Direction:** out of prototype (dev-side), but the copy promise ships now so the trust signal is real to a reviewer.
- **Referral credit applied to the bill** — the hub already neighbours a "Referrals" item; applying referral credit against the next bill is a nice future tie-in. **Direction:** model a `credits` line on `Subscription` when referrals are built.
- **Multi-location / franchise billing** — 19 May touched multi-location; per-location or consolidated franchise billing is a larger pricing model. **Direction:** parked until the multi-location pricing model is decided.

---

## Suggested order & rationale

`1 (onboarding trial) → 2 (in-app hub) → 3 (upgrade gate) → 4 (past-due + comparison)`

Phase 1 first because the 30% drop-off is the single most expensive problem in the feedback and the trial screen already half-exists — fastest, highest-leverage win, and it establishes the `billing.ts` tier spine everything else reads. Phase 2 next because the in-app hub is the home for change/cancel/invoices/payment and is the destination the upgrade gate's "you're now on Team 2–5" state needs to reflect. Phase 3 (the gate) depends on both the tier model (Phase 1) and the subscription store (Phase 2), and crosses into Team. Phase 4 is the polish/edge layer that only matters once the happy path exists.

Every phase ends green on `npx tsc --noEmit && npx next lint && npm run smoke`, composes only from `@/components/ui` (no hand-rolled primitives, no inline hex — and Phase 1 *removes* existing inline hex), keeps persistence session-local Zustand, seeds dates as fixed strings (SSR-safe), and carries a smoke needle for each new empty/setup/edge state.

---

## Cross-cutting data-model changes

New domain module **`src/lib/data/billing.ts`** + store **`src/lib/store/billingStore.ts`**:

- `BillingTier = "single" | "team_2_5" | "team_6_9" | "team_10_plus"` (Phase 1) — the pricing spine.
- `TIERS: Record<BillingTier, { name; staffCeiling; priceMonthly; priceAnnual; klarnaEligible; features? }>` (Phase 1, `features` added Phase 4).
- `Subscription { tier; cycle: "monthly" | "annual"; status: "trial" | "active" | "past_due" | "canceled"; nextBillDate: string; nextBillAmount: string; accessUntil?: string; credits?: string }` (Phase 2; `credits` is a V2 hook).
- `Invoice { id; date; amount; status: "paid" | "due"; receiptUrl? }` (Phase 2).
- `PaymentMethod = { brand; last4; expiry } | { managedBy: "apple" | "web" }` (Phase 2).
- `tierForStaffCount(n: number): BillingTier` helper (Phase 3) — maps the live team-store staff count to the required tier; the upgrade gate's trigger.
- `onboarding2` store: `trialTeamBand: string` → `tier: BillingTier` (Phase 1).
- `src/app/app/hub/page.tsx`: the `billing` account item gains `href: "/app/billing"` (Phase 2).

All additive / back-compatible — existing onboarding and team seed data keep rendering. No new UI primitive is introduced (everything composes from `@/components/ui`).

---

## Open questions for the user

1. **IAP vs web billing (the big one).** Do we sell/bill the seat-based plan through App Store IAP (30% cut on per-seat upgrades) or via web/Stripe with the mobile app as a manager + "Manage on web" deep-link? This changes the payment-method screen and both confirmation flows. My prototype default is the web/Stripe disclosure styling with no dead-end — confirm or override.
2. **Exact tier prices.** The build has `£49.99/mo` and `£510/yr` as flat numbers. What is the actual per-tier price ladder for Single / 2–5 / 6–9 / 10+ (monthly and annual)? Needed to make the live price preview truthful.
3. **Trial length.** The button says "30 days"; the timeline assumes a Day-28 reminder. Confirm 30 days and the reminder offset.
4. **Proration policy.** On the single→team upgrade, do we charge a pro-rata amount today (Beside "credit your current plan") or simply start the new rate next cycle? This decides whether "Total due today" is £0 or a pro-rata figure.
5. **Downgrade behaviour.** When staff drop below a tier ceiling, do we (a) only *offer* a downgrade (my recommendation), (b) auto-downgrade at renewal, or (c) never prompt? Affects the Acorns-style mirror in Phase 3.
6. **Cancel granularity.** Should cancel end access immediately or at the period end (access-until date)? Most SMB tools do period-end; confirm for the Clay-style canceled state.
7. **Klarna/Clearpay reality.** Is BNPL actually available for the annual plan in the UK at launch, or is this aspirational? Determines whether the Phase 1/3 Klarna line ships live or behind a flag.
