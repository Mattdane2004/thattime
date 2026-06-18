# Payments, Fees & Payouts — Finalisation Plan

> **Status:** Plan only — no implementation until the open questions below are resolved.
> **Scope:** The **Payments** business-hub section — a new `/app/settings/payments` home tying together **fee structure**, **payment activation (Stripe Connect onboarding)**, the **Balances/payouts dashboard**, **per-staff payouts & commission**, the **fee-education flow**, **disputes**, and the **log-payment / outstanding-balance** view. Plus the B2B-owned checkout fee/deposit polish and two B2C touchpoints explicitly noted (Klarna/Clearpay at checkout; the onboarding BNPL slide). The existing checkout till is **kept and extended, not rebuilt.**
> **Out of scope this pass:** real Stripe API integration (this is a session-local Zustand prototype — Connect/onboarding/payout screens are *mock* hosted-style flows, not live), VAT/tax reporting, refunds accounting beyond what checkout already shows, the full B2C wallet rebuild, and the Analytics revenue dashboards (those live in the Analytics section). Pay *settlement* was routed here from the team plan and **is** in scope; HR/Xero detail is V2.
> **Source of truth for feedback:** Granola sessions with Shabbir & Vishal — **"that time sign off" (15 Jun)**, **"That Time Product alignment" (2 Jun, 9 Jun, 26 May)** and **(19 May)**, plus the **16 Jun TT planning** internal note that routed payments to this dedicated session. ⚠️ Payments/Stripe was flagged **MISSING** on 15 Jun and pulled out of the team plan as out-of-scope — this doc is that dedicated session.
> **Design source:** design in-app from feedback + best-in-class patterns (Mobbin refs cited per row). There is no finalised Payments Figma; build from the `@/components/ui` library and review in the running app, same convention as `team-finalisation-plan.md`.

---

## What this section is

Payments is the money spine of the business hub: how the salon gets paid, what it keeps, and how it pays its team. It sits behind the **Payments** card on the hub (`src/app/app/hub/page.tsx`) — today a dead button with no destination — and behind the per-member **Pay** tab in Team. It owns three jobs a non-technical owner must understand at a glance: **what fee model their clients see** (passed on / split / absorbed), **what's coming into their account and when** (the Balances dashboard), and **who on the team gets paid what** (per-staff payouts + commission). The checkout till already collects money correctly; this section gives the money somewhere to land, a clear story about the platform fee, and a way to handle the two things that scare owners most — disputes and chasing unpaid balances.

---

## Feedback → source map

| Area | Feedback | Source | Pattern ref (Mobbin) |
|---|---|---|---|
| Fee structure (3 options) | Vendor chooses: (1) fees passed to customer (current); (2) **split** — 3% fixed customer fee, vendor covers finance fees; (3) vendor **absorbs** all fees. Position as flexibility, not burden. | 19 May | [Urban Company — Platform Fee line](https://mobbin.com/screens/8ff9faab-7513-4746-ba25-01719b111533) |
| Fee education | Three-layered **INFORM → INFLUENCE → SOLUTION**: explain a payment platform is normal, build the case, then present the options. Animated explainer video for web/socials/in-app. | 16 Jun (Chris) | [Wise — honest fee microcopy / Total fees sheet](https://mobbin.com/screens/73d57f3a-c186-4b17-a0c2-9a845752f22e), [Truebill 3-step value cards](https://mobbin.com/screens/0f79bf34-f6bb-4d02-8c29-80d15550aea8) |
| Payment lock | Gate money-moving actions behind setup with an education/activation flow, not a hard wall. | 16 Jun (Chris) | [Turo — "Add direct deposit" empty-state nudge](https://mobbin.com/screens/148e88fb-f29e-43a3-b322-bca792fd0a90) |
| Payouts dashboard | A Balances view the owner can read instantly. | 15 Jun (routed) | [Stripe Dashboard — Balances three-bucket + payout history](https://mobbin.com/screens/4faf8630-06a3-4a56-8271-b6cd5bec3a25) |
| Payout schedule | Standard vs instant ("fastest") choice. | 15 Jun (routed) | [DoorDash Dasher — Payout Methods](https://mobbin.com/screens/6ab51873-294c-4f09-992c-69d33184d407) |
| Per-staff payouts | Each team member uploads their **own** card/bank and has their own payouts; commission tracking & display. Stripe Connect platform + sub-accounts. Business wallet, payslips, Xero export parked here from team. | 2 Jun, 9 Jun | [DoorDash Dasher — Earnings](https://mobbin.com/screens/63f22cfd-d488-4c4a-9e89-8299ca8ec389), [BlaBlaCar — payout method choice](https://mobbin.com/flows/8d795a73-5ee1-4ba9-a0d9-b8902fdf9883) |
| Deposits & partial payment | Checkout subtotal must show platform fee as a **line item**, plus any prepaid deposit/partial already paid, with the remaining balance clearly displayed. | 15 Jun | [Moda Operandi — Pay Today / Remaining Balance](https://mobbin.com/screens/72332413-66bd-4eab-bece-fad16019587d) |
| Outstanding balances | Log-payment highlights clients with **outstanding** balances. | 15 Jun | [Jobber — Awaiting Payment pill + Collect](https://mobbin.com/screens/c39a54b0-a632-4ca4-bc80-2a45136757a7), [Shopify — Paid by customer row](https://mobbin.com/screens/ede97d67-1a39-4dc5-99c8-c5cf62300d28), [Wise — Unpaid/Paid tabs](https://mobbin.com/screens/da0c60b4-8280-4cff-8c8a-40accb15fe2b) |
| Disputes | Prominent **urgency banner** on the appointment card when a payment is disputed + an **evidence-submission** flow. | 15 Jun | [Turo — dispute deadline countdown](https://mobbin.com/screens/54e9caaa-6a27-410a-95f8-ac2cbb2a2761), [Brex — reason picker](https://mobbin.com/screens/634154d1-4c9d-4ade-b3c0-c6da8c93c5cc), [PayPal — add documents](https://mobbin.com/screens/5a13ed7f-8200-4027-ba07-4f13ad6407f2) |
| Checkout methods (keep) | Cash / card-on-file / payment link primary; card machine / bank transfer / gift card / other secondary. Card-on-file must show if a card exists (and will be charged) or is needed, and always allow adding a new card. | 15 Jun | [Stripe — Create a payment (saved card / Add card / Hosted Invoice)](https://mobbin.com/screens/5ce5eb63-9011-409c-b31a-903c3018653c) |
| BNPL (Klarna/Clearpay) | Value prop "~33% sales increase / ~£3,300 extra annual revenue", surfaced in onboarding loading screens + as a checkout payment option. | 19 May | [Klarna — installment timeline + no-credit-impact](https://mobbin.com/screens/6f8fa5df-0505-464f-9784-e3b3c6560ef8), [Instacart — inline Pay in 4 line](https://mobbin.com/screens/8c5d79c5-c91e-40c5-a436-cfece16bf657), [Liven — onboarding stat card](https://mobbin.com/screens/29461a02-f081-44c2-ac3d-27cb25e22d30) |
| Per-fee explainer | Each fee line gets a one-tap (i) → short plain-language sheet (customer-facing INFORM). | 16 Jun (Chris) | [Shipt — "What is a service fee?" sheet](https://mobbin.com/screens/d8050dff-a080-4468-bfe3-844f1a55c8fc) |

---

## Current state

**Status legend:** ✅ done · 🟡 partial · ❌ missing.

- **Checkout till** ✅ — `src/app/app/checkout/page.tsx` + `checkoutTotals()` in `src/lib/store/appStore.ts`. Cart, discount, tip, **platform-fee line item**, deposit credit, payment recording, primary/secondary method grouping (cash / card machine / card on file / payment link; gift card / other under "More ways to pay"), card-on-file using `savedCards` (`src/lib/data/product.ts`) with the add-card fallback when the list is empty. This already satisfies most of the 15 Jun checkout asks.
- **Fee bearer** 🟡 — `FeeBearer = "client" | "split" | "absorb"` and `PLATFORM_FEE_RATE = 0.05` exist in `appStore.ts`. **But:** it's a per-sale toggle defaulting to `"absorb"`, not a business-level **setting** the owner picks once; and `"split"` is **50/50 of the 5% fee**, *not* the client's spec of **"3% fixed customer fee, vendor covers finance fees"** (19 May). No worked £-example, no customer preview, no education layer.
- **Deposit / partial payment** ✅ — `prepaid` (from `appointment.deposit`), "Deposit paid at booking", "Paid so far", bold "Remaining", and overpay/refund handling are all in checkout. Offer model has `deposit?: { enabled; amount; type }` (`src/lib/data/offers.ts`).
- **Outstanding balances** 🟡 — checkout carries an "Outstanding balance" line and the client picker groups "Owes a balance" (warning-toned) vs "All clients" (`appStore.assignClient` + `clientRows`). There is **no dedicated log-payment / Unpaid–Paid list view** with status pills and a Collect/Send-link action; the entry exists (`entryContext: "logpay"`) but lands on the same hub.
- **Dispute banner** 🟡 — `AppointmentSheet.tsx` already renders an "Active payment dispute" danger banner keyed by `disputedClients = ["David Wilson"]` (`product.ts`). **But** there is **no deadline/countdown**, and "Review dispute" just routes to `/app/messages` — there is **no case overview, reason picker, or evidence-submission flow.**
- **Team pay** 🟡 — configuration only. `PayComponents` (salary/hourly/commission/`chairRent`), `commission.direction`, `payIsConfigured`, pay runs draft→completed (`src/lib/types/staff.ts`, `src/lib/data/team.ts`, `src/app/app/team/[id]/pay/`, `src/app/app/team/pay/[runId]/`). **No settlement:** no per-staff bank/card onboarding, no Stripe Connect sub-accounts, no payout, no payslip, no Xero export, no staff-facing earnings view.
- **Payments hub entry** ❌ — `src/app/app/hub/page.tsx` has a `{ key: "payments", label: "Payments" }` item **with no `href`** (dead button) and a "Wallet" account card with no destination, plus a dead `business-settings`. **There is no `/app/payments` or `/app/settings/payments` route at all.**
- **Stripe Connect onboarding** ❌ — nothing. No business identity/bank/payout-schedule flow.
- **Balances dashboard** ❌ — nothing. No available/in-transit/available-soon model, no payout history.
- **BNPL** 🟡 — `src/app/onboarding/preparing/page.tsx` already shows a "We accept Clearpay / Apple Pay, Clearpay and Klarna" interstitial with Klarna/Clearpay badges, **but no ~33% / ~£3,300 stat** and no Settings opt-in. The B2C checkout (`src/app/c/checkout/page.tsx`) has wallet credit + saved cards but **no Klarna/Clearpay option** and no installment timeline.
- **B2C payments** 🟡 — `src/app/c/settings/payments` (card list + add) and `src/app/c/settings/wallet` exist; B2C checkout shows an order summary but **no "Platform Fee" line and no BNPL**.

---

## Recommended UX calls

1. **One Payments home, not scattered settings.** Add a single `/app/settings/payments` hub that the dead "Payments" hub button links to. It holds four cards: **Fee structure**, **Payment methods & BNPL**, **Payouts & balances**, **Disputes**. The per-staff payout setup is reached from Team → member → Payouts (so it sits next to the rest of that member's config) but its roll-up summary also surfaces here. *Rationale: the client asked for "a single Settings → Payments home tying fees, methods, payouts and BNPL together."*

2. **Fix the "split" model to match the spec.** Re-spec `FeeBearer = "passOn" | "split" | "absorb"` and make `split` mean **3% fixed customer fee, vendor covers the finance/processing fee** (19 May), not 50/50 of 5%. Keep the existing per-sale override in checkout (operators sometimes need it), but the **default** comes from the business-level chosen model. **[ASSUMPTION]** the 5% `PLATFORM_FEE_RATE` stays the platform fee; the "3%" in the split model is the *fixed customer-facing* slice — confirm the exact numbers (Open Q1).

3. **Make the platform-fee setting matter-of-fact, never apologetic.** The SOLUTION step is **three cards each with a worked £-example on a £50 booking** and a **live mock-checkout preview** of what the client sees — not a basis-points spec sheet (Wise / Urban Company honesty, not crypto-app fee tables).

4. **Lock money-moving actions, not exploration.** An owner can browse the Balances dashboard, fee settings and the education flow before setup; only "pay out", "collect a card payment", and per-staff payout setup show the amber Turo nudge until Connect onboarding is done. **[ASSUMPTION]** confirmed direction per the 16 Jun lock-but-don't-wall steer.

5. **Treat Stripe Connect as a *mock* hosted flow.** The prototype can't run real Connect. Build our chrome around a few mock "hosted" steps (identity, bank, schedule) that write to session state and land on the Balances zero-state. Never expose "Express account / connected account / platform balance" jargon — use "Get paid" / "Your team's payouts". *Rationale: prototype constraint + anti-pattern in the brief.*

6. **Each staff member self-onboards their own payout details.** The owner never sees or enters a team member's bank/card — the owner sends an invite that opens that member's own mock Connect flow. *Rationale: privacy/liability anti-pattern called out explicitly.*

7. **Upgrade the existing dispute banner rather than replace it.** It already exists in `AppointmentSheet.tsx` — add the **deadline/countdown** framing and route "Review dispute" into a real **case → reason → evidence** flow under `/app/payments/disputes/[id]` instead of `/app/messages`. **[ASSUMPTION]** disputes stay keyed by the existing `disputedClients` prototype mechanism, extended to a small `disputes` data module.

8. **Reuse, don't rebuild, checkout.** The 15 Jun checkout asks are largely met. Phase 5 is *polish*: rename "split" semantics, add the per-fee (i) explainer, and make the deposit/remaining rows match the chosen fee model. The big new screens are the Payments home, Balances, Connect onboarding, per-staff payouts, disputes, and BNPL.

9. **BNPL is one option, not a competing primary path.** Surface Klarna/Clearpay as a single additional method (B2C checkout) using an installment-timeline component, and as a no-decision onboarding slide + a Settings opt-in card. Don't overload the method picker.

---

## Phase 1 — Payments home + fee structure & education

**Goal:** Wire the dead "Payments" hub button to a real `/app/settings/payments` home, and ship the 3-option fee chooser wrapped in the INFORM → INFLUENCE → SOLUTION education flow.

**Flow:**
1. Hub → tap **Payments** → `/app/settings/payments` home (four cards: Fee structure / Payment methods & BNPL / Payouts & balances / Disputes). Each card shows a one-line status (e.g. "Customer pays the fee", "Not set up").
2. Tap **Fee structure** → if never seen, the education flow runs first; otherwise it opens straight to the three-card chooser with a "How payments work" replay link.
3. **INFORM splash** — "How payments work on That Time": plain copy that a payment platform is normal (Stripe/Square/every booking app), embedded animated explainer video placeholder, single "Got it" CTA. Tone: matter-of-fact.
4. **INFLUENCE** — "What you get for it": short value-card list (secure card storage, instant payouts, no-shows protected by deposits, automated payslips). Build the case before numbers (Truebill 3-step).
5. **SOLUTION** — "Choose how fees are handled": three selectable cards — **Customer pays the fee** (shown as a Platform Fee line at checkout), **Split — 3% fixed customer fee, you cover the finance fees**, **You absorb all fees (cleanest pricing for clients)**. Each card shows a **worked £-example on a £50 booking** (what the client pays / what you keep).
6. **Live preview** — render the chosen option as a mock customer checkout summary (fee line present/absent) so the owner sees what clients experience.
7. **Confirm** → "You can change this anytime in Settings → Payments" + a deep-link back to the explainer video.

**Changes:**
- `src/app/app/hub/page.tsx` — give the `payments` item `href: "/app/settings/payments"`; point the "Wallet" account card at the Balances dashboard (Phase 3).
- New `src/app/app/settings/payments/page.tsx` — the four-card home.
- New `src/app/app/settings/payments/fees/page.tsx` — view machine: education (inform → influence → solution) → chooser → preview → confirm. Compose from `Sheet`, `Card`, `SegmentedControl`, `DarkButton`, `EmptyState`.
- New `src/lib/store/paymentsStore.ts` (one source of truth for this section — grep confirmed none exists) holding `feeModel`, `educationSeen`, and the Phase 2–3 fields.
- Smoke needles: Payments home, fee chooser (never-seen education state).

**Data:** `paymentsStore` gains `feeModel: "passOn" | "split" | "absorb"` (default `"passOn"` to mirror the current customer-facing model) and `feeEducationSeen: boolean`. Re-spec checkout's `FeeBearer` to read its default from `feeModel`, and redefine `split` as the 3% fixed-customer slice (see Cross-cutting). Worked-example numbers are derived, not stored.

**Risk:** medium — touches the shared `FeeBearer` semantics that checkout already depends on; keep the per-sale override back-compatible.

---

## Phase 2 — Payment activation (mock Stripe Connect onboarding) + the lock

**Goal:** A friendly, non-blocking activation flow that gates only money-moving actions, modelled as a mock hosted Connect (Express) onboarding.

**Flow:**
1. **Locked state** — before setup, the Balances card and "pay out" / per-staff-payout actions show an **amber empty-state card** (Turo): "Set up payments to get paid", one-line why, single "Set up payments" CTA. Exploration stays open.
2. **Identity & business details** — mock hosted step: business type, legal name, address. Our chrome wraps Stripe-style hosted fields so it doesn't feel like leaving the app.
3. **Bank account for payouts** — country selector → account holder / sort code / account number (BlaBlaCar pattern). Inline validation; "Funds deposited 2 business days after a booking" expectation copy.
4. **Payout schedule choice** — a **Current** card (standard, no fee, e.g. "every weekday") vs an **Available** instant-payout card with its fee and a "Fastest" badge (DoorDash Payout Methods). Self-contained cards with fee / speed / destination rows.
5. **Done** → land on the Balances dashboard zero-state (Phase 3) with "£0.00 available" and "Your first payout will appear here after a booking is paid".

**Changes:**
- New `src/app/app/settings/payments/activate/page.tsx` — multi-step mock onboarding (`Sheet`/`Field`/`SegmentedControl`/`DarkButton`).
- New shared `PayoutMethodCard` component in `src/components/ui/**` (fee / speed / destination rows) — reused for the standard-vs-instant choice here and for per-staff payouts (Phase 4); export from the barrel + add a smoke check. Avoid hand-rolling — compose from `Card`/`ListRow`.
- New `PaymentsLock` nudge component (amber `EmptyState` variant) gating money-moving actions on Balances + per-staff payouts.
- Smoke needle: locked Balances zero-state, activate first step.

**Data:** `paymentsStore` gains `connect: { status: "none" | "active"; businessName?; bankLast4?; payoutSchedule: "standard" | "instant" }`. No real PII — prototype mock values only.

**Risk:** medium — multi-step flow; keep it mock and SSR-safe (no clock/random at module/render top level — derive any "next payout Monday" copy from a passed prop or a stable seed).

---

## Phase 3 — Balances dashboard + payout history

**Goal:** The gold-standard Stripe three-bucket money model so a non-technical owner instantly reads "what's coming, what's on the way, what's in my account".

**Flow:**
1. From Payments home → **Payouts & balances** (or the hub Wallet card) → Balances dashboard.
2. **Three-bucket header** — **Available to pay out** / **In transit** / **Available soon**, then a **Total** line (Stripe verbatim). Each amount paired with timing copy.
3. **Pay out now** button (gated by activation; instant variant shows its fee if the instant schedule is chosen).
4. **Payout history** — chronological list; each row = amount + "Deposited on [date]" + a bank icon with masked last-4 (Stripe payout-history primitive).
5. Zero-state (pre-first-payout): "£0.00 available" + helper copy.

**Changes:**
- New `src/app/app/settings/payments/balances/page.tsx` — three-bucket header (compose from `StatTile`/`Card`) + payout-history list (`ListRow` with bank icon + last-4).
- New `src/lib/data/payments.ts` — seed `demoBalance` (the three buckets) + `demoPayouts` history rows (back-compatible static seed; dates as fixed strings, never `new Date()` at module top level).
- Smoke needles: Balances zero-state and populated state.

**Data:** in `src/lib/data/payments.ts`: `PaymentBalance { available; inTransit; availableSoon; total }`, `Payout { id; amount; date; bankLast4; status: "paid" | "in_transit" }`. Read-only seed.

**Risk:** low — read-only display; the only trap is SSR-safe seeding.

---

## Phase 4 — Per-staff payouts & commission (mock Connect sub-accounts)

**Goal:** Each team member self-onboards their own payout details and has their own payouts; commission tracking & display; the owner sees a roll-up. Settlement of the parked team-plan items (payslip, Xero) lands here.

**Flow:**
1. **Team → member → "Payouts & commission"** tab. If not set up: "Invite [name] to add their payout details" → sends the member their own mock Express onboarding link (owner never sees full details).
2. **Commission rule per member** — reuse the existing `PayComponents.commission` (`rate` + `direction`); add a plain-English take-home preview ("On a £50 cut, Sam keeps £35, the salon keeps £15"). For freelancers/chair-renters the direction is `to_owner` (already modelled).
3. **Staff-facing earnings view** (DoorDash Dasher model) — on the staff home (`src/app/staff/home/page.tsx`): this period earned, Pending / Next payout / Payout schedule rows, and an Activity list of their commissioned bookings.
4. **Owner roll-up** — per-staff commission owed this period, surfaced on the Payments home and the Team Pay tab, with **payslip generation** and **Xero export** as actions (mock — generates a placeholder file/toast).

**Flow ordering note:** this builds on the existing pay *configuration* (Team Pay tab) and converts the `payoutStatus` string into a real per-member payout state.

**Changes:**
- New `src/app/app/team/[id]/payouts/page.tsx` — the per-member payout/commission tab (reusing `PayoutMethodCard` from Phase 2 + the existing commission control from `team/[id]/pay/`).
- `src/app/staff/home/page.tsx` — add the staff earnings view block.
- `src/app/app/team/page.tsx` (Pay tab) + Payments home — owner roll-up + payslip/Xero actions.
- New mock `src/app/onboarding/staff/payout/page.tsx` (or a reuse of the activate flow) for the member's self-onboarding.
- Smoke needles: not-set-up payout tab, staff earnings view.

**Data:** extend `StaffPayment` (`src/lib/types/staff.ts`): `connect?: { status: "none" | "invited" | "active"; bankLast4? }` and derive earnings from existing pay-run lines. Keep `PayComponents` as the source of truth for commission — do **not** create a parallel commission model.

**Risk:** medium-high — crosses into Team; sequence after Team finalisation's pay phases. Privacy rule (owner never sees member bank details) is load-bearing.

---

## Phase 5 — Checkout polish: fee model, deposits & per-fee explainer

**Goal:** Bring the already-built checkout in line with the chosen fee model and the 15 Jun legibility asks. This is polish, not a rebuild.

**Flow:**
1. Checkout reads the business `feeModel` for its **default** fee bearer (still overridable per sale).
2. **Platform Fee line** present/absent per model; when `passOn` or `split`, it's a named "Platform Fee" line (never euphemised). When `absorb`, it disappears from the client-facing total.
3. **Deposit / partial** — the existing "Deposit paid at booking" / "Paid so far" / bold "Remaining" rows stay, confirmed against the Moda Operandi pattern (bold typographic separation, not a footnote).
4. **Per-fee (i) explainer** — a one-tap info icon on the Platform Fee line opens a short plain-language sheet ("What is the platform fee?") — the customer-facing INFORM mechanism (Shipt).
5. **Confirm line** — the existing "You receive £X" copy plus a persistent "You will charge [client] £Y to [method]" line above the charge action (Stripe footer).

**Changes:**
- `src/app/app/checkout/page.tsx` — default `feeBearer` from `paymentsStore.feeModel`; add the (i) explainer `Sheet`; add the per-method "will charge" confirmation line.
- `src/lib/store/appStore.ts` — `checkoutTotals` split logic updated to the 3%-fixed-customer-fee definition (see Cross-cutting).
- Smoke needle: checkout with a Platform Fee line + (i) sheet.

**Data:** none new — reads `feeModel` from `paymentsStore`.

**Risk:** medium — the split-fee maths change touches a unit-tested-by-smoke calc; keep `clientFee`/`vendorFee`/`youReceive` outputs back-compatible in shape.

---

## Phase 6 — Outstanding balances / log-payment view

**Goal:** A dedicated list so the owner can find and chase clients with unpaid balances — the 15 Jun "log-payment highlights clients with outstanding balances" ask.

**Flow:**
1. From the hub Log Payment entry (or Payments home) → an **Unpaid / Paid** tabbed list (Wise tabs).
2. **Unpaid tab** — each client/booking row shows a status pill (**Overdue** / **Awaiting payment**) (Jobber) and a two-action row: **Collect payment** (opens checkout for that client, charge now) + **Send link** (payment-link, ask them to pay) (Shopify).
3. Tapping Collect routes into the existing checkout via `openCheckoutForClient` with their outstanding balance seeded (already supported).
4. **Paid tab** — recent settled rows for reassurance/audit.

**Changes:**
- New `src/app/app/settings/payments/balances/outstanding/page.tsx` (or a tab on the Payments home) — `Tabs` + `ListRow` + `StatusPill`; derive rows from `clientRows` where `outstanding > 0` and from `product.ts` `outstanding` flags.
- Reuse `appStore.openCheckoutForClient`.
- Smoke needle: outstanding list (empty + populated).

**Data:** none new — derive from existing `clientRows.outstanding` and the booking `outstanding` flag.

**Risk:** low — read + route into existing checkout.

---

## Phase 7 — Disputes: deadline banner → evidence submission

**Goal:** Upgrade the existing dispute banner with a deadline and a real evidence flow.

**Flow:**
1. **Appointment card banner** (exists in `AppointmentSheet.tsx`) gains a **deadline/countdown** framing: "Payment disputed — respond by [date]" (Turo). "Review dispute" now routes to the case, not `/app/messages`.
2. **Case overview** — disputed amount, client, reason given, what happens if you don't respond, single "Submit evidence" CTA.
3. **Reason categorisation** (Brex reason picker) if the merchant must classify — radio list (overcharged / didn't receive / not as described / don't recognise / fraudulent), selecting one reveals Continue. Otherwise pre-filled from a network reason code.
4. **Evidence upload** — file/photo picker with accepted types + size limits and a checklist of what helps (receipt, service notes, signed consent, messages) (PayPal).
5. **Submit** → confirmation with "We'll update you here"; the banner flips to "Evidence submitted — awaiting outcome".

**Changes:**
- New `src/app/app/settings/payments/disputes/[id]/page.tsx` — case → reason → evidence → submitted view machine.
- `src/components/app/AppointmentSheet.tsx` — add the deadline copy; point "Review dispute" at the new route.
- New `src/lib/data/payments.ts` (or extend) — a small `disputes` seed `{ id; clientName; amount; reason?; deadline; status }`, replacing the bare `disputedClients` string array (keep a back-compatible derived list so the banner still fires).
- Smoke needles: dispute case overview, reason picker, evidence upload.

**Data:** `Dispute { id; clientName; amount; reasonCode?; deadline: string; status: "needs_response" | "submitted" | "won" | "lost" }`. Deadline is a fixed seed string (SSR-safe), the countdown is derived at render from a passed "today".

**Risk:** medium — new flow; the file-upload is a mock (no real storage).

---

## Phase 8 — BNPL (Klarna/Clearpay)

**Goal:** Surface BNPL as value (onboarding) and as a checkout option, per 19 May.

**Flow:**
1. **Onboarding slide** — `src/app/onboarding/preparing/page.tsx` already shows a Klarna/Clearpay interstitial; add the stat-card line: "Businesses offering Klarna see ~33% more sales — about £3,300 extra a year" (Liven stat card), with a source footnote. No decision required.
2. **Settings opt-in** — Payments home → "Payment methods & BNPL" → an opt-in card with the same stat + a "Learn more" link to the explainer. Toggling on enables the checkout option.
3. **B2C checkout option** — `src/app/c/checkout/page.tsx` gains "Pay in 3 with Clearpay / Klarna" using an **installment-timeline** component (vertical timeline of equal installments + "won't affect your credit score / no interest if paid on time" reassurance) (Klarna). One option among the existing methods — not a competing primary path.
4. **Inline at the fee/total area** — an "Pay in 3 of £X with Clearpay" line near the total with its own (i) (Instacart).

**Changes:**
- `src/app/onboarding/preparing/page.tsx` — add the stat line.
- New `src/app/app/settings/payments/methods/page.tsx` — BNPL opt-in card + the rest of the method config.
- New `InstallmentTimeline` component in `src/components/ui/consumer/**` (coral B2C) — export from the consumer barrel + smoke check.
- `src/app/c/checkout/page.tsx` — add the BNPL method + inline line.
- Smoke needles: BNPL opt-in card, B2C installment timeline.

**Data:** `paymentsStore` gains `bnplEnabled: boolean`. B2C reads it (or a mirrored flag) to show the option.

**Risk:** low-medium — the only cross-surface phase (B2C coral); keep the two surfaces distinct (B2C uses `@/components/ui/consumer`).

---

## V2 / deferred

- **Real Stripe Connect integration** — live Express accounts, real KYC, real payouts. *Direction:* the mock flows in Phases 2 & 4 are structured to swap their write-to-store for real Connect API calls later; the UI doesn't change.
- **Business wallet** — a held-balance the owner can spend on supplies/marketing (parked from team). *Direction:* a fourth bucket on the Balances dashboard once settlement is real.
- **Payslips & Xero export, full** — the Phase 4 versions are mock (placeholder file/toast). *Direction:* generate real PDF payslips + a Xero-format CSV/API export once pay runs settle.
- **VAT / tax handling** — the hub "Payments" desc mentions "tax"; deposits and fees have VAT implications. *Direction:* a Tax sub-card on the Payments home; pairs with Analytics.
- **Refunds accounting** — checkout shows overpay/refund-due but doesn't record a refund ledger. *Direction:* a refund action on the Paid tab (Phase 6) writing to payout history.
- **Wise-style fee Comparison tab** — "what you'd keep with us vs elsewhere". *Direction:* an optional second tab on the fee chooser for owners who want the deeper justification.
- **Per-fee Comparison/transparency for the customer** — a fuller breakdown sheet beyond the (i) one-liner. *Direction:* expand the Shipt-style sheet into a Wise Breakdown list if support tickets ask "why".
- **B2C BNPL beyond Klarna/Clearpay** (Apple Pay split, others) — kept out per the "don't overload checkout" anti-pattern; revisit only on demand.

---

## Suggested order & rationale

`1 (Payments home + fees) → 2 (activation) → 3 (Balances) → 5 (checkout polish) → 6 (outstanding) → 7 (disputes) → 4 (per-staff payouts) → 8 (BNPL)`

Phase 1 first because it creates the section's home (the dead hub button is the most visible gap) and the fee model the rest reads. Phases 2–3 establish "the money lands somewhere" — the core of what was flagged MISSING on 15 Jun. Phase 5 is quick polish on already-built checkout once the fee model exists. Phases 6–7 are the owner's two anxiety jobs (chasing balances, fighting disputes) and reuse existing surfaces. **Phase 4 (per-staff payouts) is sequenced late** because it crosses into Team and should follow the Team finalisation pay phases. Phase 8 (BNPL) is independent and the only B2C-touching work, so it can slot wherever convenient. Every phase ends green on `npx tsc --noEmit && npx next lint && npm run smoke`, with a smoke needle for each new empty/setup state. Persistence stays session-local Zustand.

---

## Cross-cutting data-model changes

New module `src/lib/store/paymentsStore.ts` (one source of truth for the section):
- `feeModel: "passOn" | "split" | "absorb"` (default `"passOn"`) (Phase 1)
- `feeEducationSeen: boolean` (Phase 1)
- `connect: { status: "none" | "active"; businessName?; bankLast4?; payoutSchedule: "standard" | "instant" }` (Phase 2)
- `bnplEnabled: boolean` (Phase 8)

New seed module `src/lib/data/payments.ts`:
- `PaymentBalance { available; inTransit; availableSoon; total }` + `demoBalance` (Phase 3)
- `Payout { id; amount; date; bankLast4; status }` + `demoPayouts` (Phase 3)
- `Dispute { id; clientName; amount; reasonCode?; deadline; status }` + `demoDisputes` (Phase 7) — replaces the bare `disputedClients` array with a back-compatible derived list.

Existing types extended:
- `appStore.FeeBearer` — re-spec `split` to **3% fixed customer fee, vendor covers finance fee** (not 50/50); `checkoutTotals` reads its default from `feeModel` (Phases 1 & 5).
- `StaffPayment` (`src/lib/types/staff.ts`) — `+ connect?: { status: "none" | "invited" | "active"; bankLast4? }` (Phase 4); reuse existing `PayComponents.commission`.

New shared components: `PayoutMethodCard` (`src/components/ui`), `PaymentsLock` nudge (`src/components/ui`), `InstallmentTimeline` (`src/components/ui/consumer`) — each exported from its barrel with a smoke check.

All fields additive / back-compatible — the seed checkout, 11 team members, and disputed-client banner keep rendering. Persistence stays session-local Zustand.

---

## Open questions for the user

1. **Split-fee numbers.** The 19 May spec says split = "3% fixed customer fee, vendor pays finance fees" while code has a 5% `PLATFORM_FEE_RATE`. Is the platform fee still 5%, with the 3% being the *customer-visible* slice and the vendor absorbing the remaining ~2% finance portion? Or is "3%" the whole fee in the split model? Need the exact maths before Phase 5.
2. **Default fee model for new businesses.** Assumed `passOn` (current customer-facing behaviour). Should new salons default to `absorb` (cleanest for clients) or be forced to choose during onboarding?
3. **Instant-payout fee.** What fee/cadence should the "instant" payout card show (DoorDash uses a flat per-payout fee)? Need a number for the mock.
4. **Commission direction display.** For chair-renters the commission flows `to_owner` — should the staff earnings view show "rent owed" rather than "earnings", or both?
5. **Dispute deadline length & evidence types.** What response window (e.g. 7 days) and which evidence types/size limits should the mock present?
6. **Animated explainer video.** Is there an asset (or placeholder) for the INFORM step, and is the same video reused on the website/socials, or do we just leave a video placeholder?
7. **BNPL provider priority.** Lead with Clearpay or Klarna in the B2C checkout, and is Apple Pay split in or out of this pass?
8. **Payslip / Xero export depth.** Mock-only this pass (placeholder file/toast), or is a real CSV export expected for the demo?

*Implementation begins once Q1–Q3 (the fee/payout numbers) are answered — the rest can be defaulted as marked and confirmed in review.*
