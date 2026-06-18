# Referrals — Finalisation Plan

> **Status:** Plan only — no implementation until the open questions below are resolved (chiefly Q1: vendor-only, client-only, or both).
> **Scope:** A **vendor refer-a-business** programme for the B2B business app — the owner invites another business onto That Time, both sides earn a fee/subscription **credit**. Covers the share link/code, "how it works" explainer, reward terms, per-referral status tracking, and an earned/pending summary. The reward redemption surface is included as a thin, mostly-automatic step (Phase 4).
> **Explicitly out of scope this pass:** the **client-facing** referral code (consumer "refer a friend" already lives in `src/app/c/settings/wallet/page.tsx` — see Q1); tiered/cumulative rewards; a full credits ledger / payments-wallet build (the `payments` hub item is still an inert stub); any real payout, Stripe, or invoice settlement (prototype credit is session-local).
> **Source of truth for feedback:** "Referrals" was named on the **16 Jun** remaining-sections list (internal TT planning). No verbatim client feedback on referrals was captured — every UX call below is a **designer recommendation** grounded in the design research, and flagged `[ASSUMPTION]` / `[OPEN]`.
> **Design source → design in-app from the research patterns.** No Referrals Figma frames exist; build from the Mobbin patterns cited below + the existing `@/components/ui` library, reviewed in the running app (same approach as `team-finalisation-plan.md`).

---

## What this section is

The vendor referral programme is a **growth/finance** feature, not a marketing one: a salon owner invites a peer business onto That Time and both get a credit against their subscription/processing fees. It sits in the **Profile → Account** list of the business hub (`src/app/app/hub/page.tsx` already has a `referrals` row, today a dead stub) and is surfaced a second time near the money/credits area, because the reward is a fee credit and owners think of it as a business-finance action (Fresha/GlossGenius co-locate it with the wallet). It is deliberately distinct from the **client** referral code (a marketing perk that belongs under Marketing → Rewards / the consumer wallet) — see the anti-pattern note and Q1.

---

## Feedback → source map

| Area | Feedback | Source | Pattern ref (Mobbin) |
|---|---|---|---|
| Section exists | "Referrals" named on the remaining-sections list; flagged as "likely a refer-a-business growth feature" | 16 Jun 2026 (TT planning, internal) | — |
| Audience split | No client steer on vendor vs client referral — **recommend vendor-acquisition**, flag as the lead open question | 16 Jun 2026 (designer call) | [Satispay — Invite friends / Invite shops toggle](https://mobbin.com/flows/68fccdc9-3729-4d6c-b7a3-4971f7c5a9f8) |
| Two-tab skeleton | Invite / Track as the legible B2B structure | designer call (research) | [Brex — Invite people / Track referrals](https://mobbin.com/flows/d8ca9c51-405c-4437-b259-0ab225b408f7) |
| Entry from account | Settings-row entry showing the incentive inline | designer call (research) | [Brex — Referrals row in Account & settings](https://mobbin.com/screens/07d91603-0036-45fb-afe2-cb9654e2271c) |
| Entry from money | Co-locate with credits/wallet — it's a finance action | designer call (research) | [Fresha — Track Fresha referrals (business wallet)](https://www.fresha.com/help-center/knowledge-base/wallets/121-track-fresha-referrals) · [GlossGenius — Referral Program](https://glossgenius.elevio.help/en/articles/60-the-glossgenius-referral-program) |
| Reward shape | Symmetric give/get, reward = subscription/fee credit (not cash), one number each way | designer call (research) | [GlossGenius — Give $30 / Get $30](https://glossgenius.elevio.help/en/articles/60-the-glossgenius-referral-program) |
| Share affordances | Read-only link + Copy, native Share, email-a-peer field, optional QR for in-person | designer call (research) | [Fetch — code, Text/Email/Share, QR](https://mobbin.com/flows/b7175c24-f4d1-484c-8151-38616e8c9916) · [Plata — link + Show QR](https://mobbin.com/screens/adeddd37-669b-4dac-bb38-306a7138c86b) |
| How it works | 3-step icon rows: share → they sign up & set up → you both get credit within X days | designer call (research) | [Airbnb — 3 icon-rows + 14-day payout](https://mobbin.com/screens/b55424f9-e5db-428b-a65e-e0573dc0da4a) |
| Qualifying clarity | Spell out the exact qualifying event + payout timing in plain numbered steps | designer call (research) | [Chime — $200/45-day, 10-day payout](https://mobbin.com/screens/105de1df-5b73-49d7-8413-b0ea6c916baa) · [Acorns — what makes a successful referral](https://mobbin.com/screens/6e74733e-9e63-4628-9574-30c1bec111bb) |
| Earnings on the share screen | "Earned" + "Pending" stat cards beside the link | designer call (research) | [Speak — Total earned / Pending review cards](https://mobbin.com/screens/a93f0606-7d1b-422c-b767-b2edd75d51be) · [Finimize — inline "earned so far"](https://mobbin.com/screens/c905b26b-8721-49af-9ee7-2b2abca1a360) |
| Status tracking | One row per business; chips Invited → Signed up → Reward pending → Reward earned; what's-still-needed + who to nudge | designer call (research) | [Brex — Track referrals status-chip list](https://mobbin.com/screens/03501f89-030f-4ee9-923d-14925ee16101) · [Fresha pending→available](https://www.fresha.com/help-center/knowledge-base/wallets/121-track-fresha-referrals) |
| Track totals + empty state | Running earned/pending totals; friendly empty state before any referrals | designer call (research) | [Satispay — Pending/Completed tabs](https://mobbin.com/flows/68fccdc9-3729-4d6c-b7a3-4971f7c5a9f8) · [Fetch — "no referrals yet" empty state](https://mobbin.com/flows/b7175c24-f4d1-484c-8151-38616e8c9916) |
| Terms behind a disclosure | Collapse full terms behind "See full terms"; never a wall of legalese | designer call (research) | [Brex — collapsed terms](https://mobbin.com/flows/d8ca9c51-405c-4437-b259-0ab225b408f7) · [Airbnb — Terms apply](https://mobbin.com/screens/b55424f9-e5db-428b-a65e-e0573dc0da4a) |
| FAQ | 2–3 item FAQ accordion for "when do I get my reward?" | designer call (research) | [Dave — Referral FAQ accordion](https://mobbin.com/screens/d839ab17-7838-4d01-934b-7777567ea56e) |
| Reward redemption | Auto-apply credit to the next invoice where possible; else a thin redeem screen | designer call (research) | [GlossGenius — Track My Earnings / redeem](https://glossgenius.elevio.help/en/articles/60-the-glossgenius-referral-program) · [Oportun — earned/pending + invites](https://mobbin.com/screens/60f186c4-8439-4779-b459-56f802d9d164) |

---

## Current state

**Status legend:** ✅ done · 🟡 partial / stubbed · ❌ missing.

- 🟡 **Account entry row** — `src/app/app/hub/page.tsx` (`accountItems`, line 55) already lists `{ key: "referrals", label: "Referrals", icon: Share2 }` with **no `href`** — it renders as an inert `<button>`. The wiring point exists; the destination does not.
- ❌ **Referrals screen** — there is no `/app/referrals` route. `find src/app/app -type d` shows no `referrals` (or `payments`/`wallet`) folder.
- 🟡 **Second entry (money/credits)** — the hub `operations` grid has a `payments` item (`{ key: "payments", label: "Payments", desc: "Transactions, refunds, tax", icon: Wallet }`) **with no `href`** — also an inert stub, and no `/app/payments` route exists. So the Fresha-style "co-locate with the wallet" entry has no home yet; this plan adds the row but the wallet surface itself is out of scope.
- 🟡 **Client referral (the thing to NOT conflate)** — `src/app/c/settings/wallet/page.tsx` already ships a consumer **"Refer a friend +£10"** sheet (code `EMMA-10`, "You both get £10 when they complete a booking", "Share invite link"). This is the B2C marketing perk; the vendor programme in this plan is a separate audience/reward/surface (see anti-patterns + Q1). Marketing's `rewards`/`discount-codes` items (`src/app/app/marketing/page.tsx`) are the B2B home for any *client*-referral codes, not this section.
- ❌ **Data / store** — no referrals domain. `ls src/lib/data` and `ls src/lib/store` show no `referrals.ts` / `referralsStore.ts`. No referral fields on the business/offer models.
- ✅ **Component coverage** — everything needed is already in the barrel (`src/components/ui/index.ts`): `Segmented` / `SegmentedControl`, `Tabs`, `Sheet`, `EmptyState`, `StatTile`, `ListRow`, `SettingsGroup`, `StatusPill`, `Card`, `Field`, `Input`, `DarkButton` / `PrimaryButton`. No new primitive is required.

**Net:** the section is named and has two stub entry rows, but is otherwise greenfield. This is a clean build, not a migration.

---

## Recommended UX calls

As the designer, with no client steer recorded I am making opinionated calls and flagging each:

1. **Audience = vendor refer-a-business.** `[OPEN — needs user decision, Q1]` The brief recommends, and I agree, that this section is the vendor-acquisition programme. The client referral perk already exists on the consumer side. If the client later wants both in this one B2B section, the **only** acceptable merge is a Satispay-style top segmented toggle — **"Refer a business" | "Refer a client"** — never a blended single view. I design Phase 1–4 vendor-only and keep the toggle as a one-line Phase-5/V2 affordance so adding the client side later is additive.

2. **Reward = a flat, symmetric fee/subscription credit, expressed in £.** `[ASSUMPTION]` Recommend **"you both get one free month"** as the headline (clearest value to a salon owner) with the underlying credit modelled as a £ amount so it can also read as "£X off your next bill". No tiers at launch (anti-pattern). Exact amount/terms is Q2.

3. **Two-tab Invite / Track, Invite default.** `[ASSUMPTION]` Brex skeleton wholesale — the most legible B2B pattern. Use the existing `Segmented` / `Tabs` primitive.

4. **Two entry points, but only build the row, not the wallet.** `[ASSUMPTION]` Add the `href` to the existing `referrals` account row (real, this pass) and add a small "Refer a business" card/row to the (currently inert) `payments` grid item *if/when* a payments surface exists — for now, surface the same card on the hub Profile tab near the wallet/billing rows so the finance-adjacency is honoured without building a wallet. Q3 confirms.

5. **Auto-apply the credit; no heavy redemption flow.** `[ASSUMPTION]` Since the reward is a fee credit, an earned reward shows as "applied to your next bill" with a line-item confirmation, not a manual redeem step (anti-pattern). A thin "Apply credit" screen is included only as a fallback (Phase 4) gated on Q4 (does redemption need to be manual?).

6. **Calm, businesslike, ink/navy.** `[ASSUMPTION]` No points/coins/confetti/leaderboards, no countdown timers in the default state, no social-broadcast row as the primary path. Lead with Copy link + native Share + email-a-peer. QR is a collapsible secondary affordance for in-person trade-event sharing.

7. **British English + £ throughout** (UK client) — "colour", "salon", "£X credit".

---

## Phase 1 — Referrals home: Invite tab + entry wiring

**Goal:** Stand up `/app/referrals` with the default **Invite** tab, and make the dead `referrals` account row open it. This is the minimum that satisfies "there is a Referrals section".

**Flow (Invite tab, top → bottom):**
1. **Header / value prop** — one line: "Invite another business to That Time. You both get a free month." (Airbnb-style concrete value up top; reward copy from Q2.)
2. **Tab switcher** — `Segmented` "Invite | Track", Invite selected. (Brex pattern.)
3. **Your link** — read-only `Field`/`Input` showing the unique referral link, prominent **Copy** button; short human-readable **code** shown below for verbal/in-person sharing (e.g. `THATTIME-VB-04`). (Fetch/Plata.)
4. **Primary actions** — `DarkButton` **"Share link"** (opens the native share sheet — prototype: copies + toast) and, beside/under it, an **email-a-peer** `Field` + **Send** so an owner can invite one specific business directly. (Brex dual pattern.)
5. **Show QR** — a collapsible row revealing a QR for the link, for showing a peer owner in person. (Fetch/Plata; prototype: a static placeholder QR.)
6. **Earnings summary** — two `StatTile`s, **Earned** and **Pending**, co-located here so the payoff is visible at the moment of sharing. (Speak/Finimize.)
7. **How it works** — 3 numbered icon `ListRow`s: 1) Share your link · 2) They sign up & set up their business · 3) You both get a free month, credited within [X days]. State the exact qualifying event AND the timeframe. (Airbnb/Chime.)
8. **See full terms** — a quiet disclosure link opening a `Sheet` with eligibility/qualifying steps/completion window/exclusions; never inline legalese. (Brex/Airbnb.)

**Changes:**
- Add `src/app/app/referrals/page.tsx` (the home, Invite tab default; Track tab is Phase 2).
- `src/app/app/hub/page.tsx` — give the existing `referrals` account row `href: "/app/referrals"`.
- New `src/lib/data/referrals.ts` — seed link, code, reward copy, "how it works" steps, terms, FAQ.
- Add a smoke needle: import the page in `smoke.tsx` and assert the value-prop headline + "Invite" + "How it works".

**Data:** new `ReferralProgram` config (reward copy, link, code, terms, faq) in `referrals.ts`. No business-model field change yet.

**Risk:** low — single composed screen from existing primitives + one href.

---

## Phase 2 — Track tab + status list + empty state

**Goal:** The second tab — a dead-simple per-business status list so the owner sees who to nudge, with running totals and a friendly empty state.

**Flow (Track tab):**
1. **Tab switch** to "Track".
2. **Running totals** at the top — total **earned** / total **pending** (mirrors the Invite-tab stat cards; Satispay Pending·Completed).
3. **Status list** — one `ListRow` per referred business: business name (or invited email), date invited, and a `StatusPill` chip. Chips in plain language: **Invited → Signed up → Reward pending → Reward earned** (Fresha pending→available; Brex chip list).
4. **Pending detail** — each pending row shows the remaining qualifying step ("Waiting on them to finish setup") and any deadline, so the owner knows what to nudge. (GlossGenius "who to follow up with".)
5. **Empty state** — before any referrals: `EmptyState` "No referrals yet. Anyone who joins with your link shows up here." with a button back to the Invite tab. (Fetch.)

**Changes:**
- Extend `src/app/app/referrals/page.tsx` with the Track tab (view machine `invite | track`).
- `src/lib/data/referrals.ts` — seed a few demo `Referral` rows across the four statuses + an empty-state path.
- `src/lib/store/referralsStore.ts` (new) — session-local Zustand: list of referrals, derived earned/pending totals, `inviteByEmail`, `copyLink` no-ops for the prototype. (One source of truth per domain — there is no existing referrals store to extend.)
- Smoke needle: assert a status chip ("Reward pending") and the empty-state copy (rendered via a prop/seed override per the store-driven-components memo, since Zustand setState doesn't reflect in `renderToString`).

**Data:** `Referral { id; business; email?; invitedOn; status; nextStep?; deadline?; rewardAmount? }`; `ReferralStatus = "invited" | "signed_up" | "reward_pending" | "reward_earned"`.

**Risk:** low–medium — needs the store seeded so the list and empty state both render under SSR.

---

## Phase 3 — How-it-works depth, terms sheet & FAQ

**Goal:** Remove the #1 trust killer — ambiguity about "when do I actually get paid" — by making the explainer concrete and adding a short FAQ.

**Flow:**
1. The 3-step "How it works" from Phase 1 gains the **exact qualifying conditions** (sign up via link → finish setup → enable payments / process a required amount, within ~3 months) phrased as numbered plain steps. (Chime/Acorns/Fresha qualifying steps.)
2. **Terms sheet** is fully written: eligibility, qualifying steps, completion window, exclusions — opened from "See full terms", collapsed by default. (Brex.)
3. **FAQ accordion** — 2–3 items: "When do I get my reward?", "What counts as a successful referral?", "Where does the credit go?" (Dave.)

**Changes:**
- `src/lib/data/referrals.ts` — flesh out `terms`, `qualifyingSteps`, `faq` arrays.
- `src/app/app/referrals/page.tsx` — add the FAQ accordion (reuse the wallet "How it works" `AnimatePresence` collapse pattern already used in `src/app/c/settings/wallet/page.tsx`) and finalise the terms `Sheet`.

**Data:** `ReferralProgram` gains `qualifyingSteps: string[]`, `faq: { q; a }[]`, `terms: string[]` (additive to Phase 1 config).

**Risk:** low — content + one accordion.

---

## Phase 4 — Reward credit (auto-applied) + thin redemption fallback

**Goal:** Close the loop: an earned reward becomes a visible credit, auto-applied where possible.

**Flow:**
1. When a referral hits **Reward earned**, the Earned stat card increments and the row shows "£X credit applied to your next bill" — **no manual step** (preferred path). (Avoids the manual-redeem anti-pattern.)
2. **Fallback (gated on Q4):** if redemption must be manual, an earned reward opens a thin **"Apply credit"** `Sheet` — shows available credit balance, "Apply to next subscription/processing charge", confirm the deduction. (GlossGenius redeem; Oportun.)
3. A single "Credit balance" line is shown on the Track tab totals, so the running value is always visible. (No full ledger — anti-pattern for low volume.)

**Changes:**
- `src/lib/store/referralsStore.ts` — `creditBalance` derived from earned referrals; `applyCredit` action for the fallback.
- `src/app/app/referrals/page.tsx` — earned-row "applied" line item; optional `ApplyCreditSheet`.
- If a payments/billing surface exists by then, also show the credit as a line item there (else defer — payments is still a stub).

**Data:** `Referral.rewardAmount`, `ReferralProgram.creditBalance` (or derived); `appliedToInvoice?: boolean` on earned referrals.

**Risk:** low — mostly derived state; the real settlement is out of scope (prototype credit only).

---

## V2 / deferred

- **Client-referral side / segmented toggle** — if Q1 says "both", add a top `Segmented` "Refer a business | Refer a client" (Satispay) and reuse the consumer perk model from `src/app/c/settings/wallet/page.tsx`. **Direction:** keep two distinct reward configs under one route; never blend the views.
- **Tiered / cumulative rewards** ("£500 for 3 businesses…") — Plata/Whatnot. **Direction:** only if referral volume data justifies it; start flat.
- **Limited-time bonus campaigns with countdown urgency** — Plata. **Direction:** a reversible, campaign-scoped banner state, never the default.
- **Real wallet/credits surface** (`/app/payments`) — the second entry point's true home. **Direction:** build the Payments section, then move the credit line-item there and link Referrals from it (Fresha mental model).
- **Real settlement** — Stripe/invoice application of the credit. **Direction:** belongs in the deferred payments/Stripe session (same parking lot as team pay settlement).
- **Suggested invitees** ("not sure who to invite? see suggestions") — Satispay. **Direction:** nice-to-have once a peer/CRM graph exists.
- **Social-broadcast share rows** — **Direction:** intentionally omitted; revisit only if owners ask for it.

---

## Suggested order & rationale

`1 (Invite tab + entry) → 2 (Track + status) → 3 (how-it-works/terms/FAQ) → 4 (credit + redemption)`

Phase 1 first because it converts the dead account-row stub into a real section and delivers the share moment (the only thing the owner *does*). Phase 2 makes it trustworthy by showing progress and who to nudge. Phase 3 removes the "when do I get paid" ambiguity (the top trust killer). Phase 4 closes the reward loop but is deliberately last and thin, since real settlement is out of scope. The V2 client-referral toggle is parked behind Q1 and is purely additive, so the vendor build never has to be undone.

Every phase ends green on `npx tsc --noEmit && npx next lint && npm run smoke`, with a smoke needle for each new empty/setup state. Persistence stays session-local Zustand; no clock/random/`window` at module or render top level (seed dates as static strings in `referrals.ts`).

---

## Cross-cutting data-model changes

New domain, all session-local and additive — nothing existing changes shape:

- `src/lib/data/referrals.ts` (new) — `ReferralProgram { rewardCopy; rewardAmount; link; code; howItWorks: { step; title; body }[]; qualifyingSteps: string[]; terms: string[]; faq: { q; a }[] }` + seed `referrals: Referral[]`.
- `Referral { id; business: string; email?: string; invitedOn: string; status: ReferralStatus; nextStep?: string; deadline?: string; rewardAmount?: string; appliedToInvoice?: boolean }`.
- `ReferralStatus = "invited" | "signed_up" | "reward_pending" | "reward_earned"`.
- `src/lib/store/referralsStore.ts` (new) — `referrals`, derived `earned` / `pending` / `creditBalance`, actions `inviteByEmail`, `copyLink`, `applyCredit` (prototype no-ops/state).
- `src/app/app/hub/page.tsx` — `referrals` account row gains `href: "/app/referrals"` (and, gated on Q3, a "Refer a business" affordance near the wallet/billing rows). No type change.

No change to `DemoOffer`, `Staff`, or any seed data — Referrals is a standalone domain.

---

## Open questions for the user

1. **Vendor, client, or both?** `[OPEN]` This plan builds **vendor refer-a-business**. The consumer "refer a friend" perk already exists in `src/app/c/settings/wallet/page.tsx`. Do you want this B2B section to be vendor-only (recommended), or also host the client-referral code via a top "Refer a business | Refer a client" toggle?
2. **Reward terms.** What is the actual give/get? Recommend a flat **"both get one free month"** (modelled as a £ credit). Confirm the amount, the exact qualifying event (sign up + finish setup? + enable payments? + process £X?), the completion window (~3 months?), and the payout timeframe (within X days).
3. **Second entry point.** The `payments` hub item is still an inert stub with no route. For now, do we surface "Refer a business" only from the Profile → Account row (recommended), or also pin a card near the hub's wallet/billing area ahead of building a real Payments section?
4. **Redemption — automatic or manual?** Recommend auto-applying the credit to the next bill with a line-item confirmation (no manual step). Confirm, or do you need an explicit "Apply credit" action?
5. **QR + email-invite — keep both?** Recommend including the email-a-peer field and a collapsible QR (genuinely useful for in-person peer/trade-event sharing). Confirm both are wanted, or trim to link + Share only.
