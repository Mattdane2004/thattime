# Packages (choose-any-X) — Finalisation Plan

> **Status:** Plan only — no implementation until the open questions below are resolved.
> **Scope:** The **Package** offer concept — a client picks **any X services from a set of Y** (e.g. "choose 3 of these 6 for £200"), *or* buys **multiples of one service** (e.g. "6 haircuts"). This covers the `/new` creation entry, a new package-shape decision screen, the two builder branches, validity/redemption fields, and the package dashboard. The bundle (fixed-set) flow is **done** and out of scope except where this plan reuses its components.
> **What is explicitly out of scope this pass:** the **client-facing** B2C `/c` redemption surface ("2 of 3 left", credit deduction at checkout) — noted for downstream but not built here; multi-group nested constraints (Uber Eats "choose entrée AND 2 sides"); a tiered discount matrix (Vinted "2/3/5 items %"); real wallet/balance settlement (session-local prototype only).
> **Data-model recommendation (the 26-May reconcile question):** **Package is a presentation/entry choice, not a new offer type.** It writes into the existing `BundleDraft` / `DemoOffer.bundle`, extending `kind: "fixed" | "flexible"` → `"fixed" | "flexible" | "multiple"`. This honours CLAUDE.md rule 4 (one source of truth per domain) and reuses the existing `chooseCount`, `priceMode`, `links`, and the whole bundle dashboard. See "Recommended UX calls" Q1 and "Cross-cutting data-model changes".
> **Source of truth for feedback:** Granola sessions with Shabbir & Vishal (that-time.co.uk) — **26 May** (bundles vs packages, the headline ask), **19 May** (the "multiples of the same service" framing), **15 Jun** sign-off, **16 Jun** internal priorities. Cited inline below.

---

## What this section is

A **Package** lets a client choose their own basket from the salon's menu under a single price, rather than buying a pre-decided set. Two shapes the client named:
- **Choose any from a list** ("flexible") — pick a set number from a wider menu: "any 3 of these 6 for £200" (26 May).
- **Multiples of one service** ("multiple") — a prepaid run of the same service: "6 haircuts" (19 May framing: *"Packages: bundled services or multiples of same service"*).

It sits in the **business hub → offer catalogue** (`/app/services`) alongside Services, Classes, **Bundles** and Subscriptions. The 26-May ask is that **Package becomes its own choice at the point of creation, sitting next to Bundle** — exactly as Subscriptions get their own entry — because the distinction is real to owners: a **Bundle** is a *fixed set sold together* ("Cut + Colour"), a **Package** is one the *client assembles* (any 3 of 6) or *stocks up on* (6 cuts). The model **exists in the old That Time app but was never deployed** (26 May); this plan maps that logic into the new flow with improvements.

---

## Feedback → source map

| Area | Feedback | Source | Pattern ref |
|---|---|---|---|
| Creation entry | Add a **Package** option **alongside Bundle** at the point of creation — like how Subscriptions offer their own type entry | 26 May | [Square Appointments — Packages](https://mobbin.com/screens/82c07843-67f4-4e94-9946-cc9649251344) |
| Concept split | Package = client picks **any X of Y**; **distinct from** a Bundle (a fixed set sold together) | 26 May | [Vinted — Build a bundle (buyer) vs Bundle discounts (merchant)](https://mobbin.com/flows/37dc6a6e-6167-4a96-8372-51ee2e8a953c) · [merchant config](https://mobbin.com/flows/e30cb991-5b7b-432f-8679-8589d725f7fa) |
| Second shape | "Packages: **bundled services or multiples of same service**" — also support N-of-the-same (e.g. 6 haircuts) | 19 May | [Canva — quantity-tier picker](https://mobbin.com/screens/def7f3c4-7353-46f5-b497-ac03b52b3659) · [Blue Apron — meals selector](https://mobbin.com/screens/b7397176-3661-4a1c-88eb-2d656db627c9) · [ClassPass credit tiers](https://mobbin.com/screens/1ed2785c-b9d4-4271-9184-3f2af9e01bfe) |
| Choose-any-X render | A "choose N of M" group with a live ✓N/M counter and the package price shown next to the saved/list value | 26 May (mechanic) | [Uber Eats — Build Your Own Munchie Meal](https://mobbin.com/screens/8c45ae21-5b94-4593-847b-f81399e0a081) · [single-pick groups](https://mobbin.com/screens/df9e20e9-2391-4de2-a795-25bbbad0f089) |
| Single-group only | A salon package is **one group** — don't ship multi-group nesting | design research (anti-pattern) | [Wonder — '1 Required, Choose up to 2'](https://mobbin.com/screens/3dce36aa-c539-49a1-8771-f06f206d7207) |
| Fixed vs flexible | A Bundle pre-fills the slots (swap); a Package leaves them open ("choose any 3") | design research | [Grill'd — Family Frenzy fixed bundle](https://mobbin.com/flows/d260cc44-6789-4817-8a13-60524cd39932) |
| Map old → new | Map the existing old-app package logic into the new flow with improvements (client to share old-app logic) | 26 May | — |
| Validity / expiry | Every package needs a price/discount **and** validity + redemption rules — the cross-vertical convention `BundleDraft` lacks today | design research | [Square — packages (expiry ≤ 1 yr)](https://mobbin.com/screens/82c07843-67f4-4e94-9946-cc9649251344) · Fresha / GlossGenius |
| Editability | Allow edits after publish ("changes apply to future purchases") — explicitly **not** Square's immutable model | design research (anti-pattern) | [Square — Packages (immutable)](https://mobbin.com/screens/82c07843-67f4-4e94-9946-cc9649251344) |
| N-of-same render | Quantity stepper with live per-unit / total / savings, **not** a service checklist | 19 May + research | [eBay — quantity stepper](https://mobbin.com/screens/4d496fe4-1184-44a9-bf00-91ed0cce301d) · [Open — Credit Store packs](https://mobbin.com/screens/82c07843-67f4-4e94-9946-cc9649251344) |
| Standalone-price context | Show each service's standalone price while building so the owner sees the discount they're giving | design research | [Shopify — Options editor](https://mobbin.com/screens/79d9fb0b-84b9-458d-b937-a5a3061a7013) · [Universe — Product Variations](https://mobbin.com/screens/d315a154-b461-41c9-bcc3-cf9c817751e9) |
| Section priority | Packages rides with Services (one of the "big three"); land it as part of the offer-catalogue finalisation | 16 Jun (internal) | — |

---

## Current state

Grounded in the code read this session. **Legend: done / partial / missing.**

- **partial — the flexible model already exists, but buried.** `BundleDraft.kind` is `"fixed" | "flexible"` and `chooseCount` already drives a "choose N" rule (`src/lib/store/wizardStore.ts:127`). The bundle-services step (`src/app/new/bundle-services/page.tsx:14`) surfaces this as a two-tab segmented control inside the *services* step — **"Fixed bundle" / "Flexible package"** — with the `chooseCount` number input revealed only when `flexible` is picked (lines 57–77). This is exactly the anti-pattern the client flagged: Package is a sub-toggle, not its own creation choice.
- **missing — no Package entry on the type selector.** `/new/type` (`src/app/new/type/page.tsx:12`) lists four cards: Service, Class, **Bundle** ("Multiple services sold together"), Subscription. There is no Package card. Subscriptions, by contrast, get a dedicated post-basics type screen (`src/app/new/subscription-type/page.tsx`) — the model the 26-May ask points to.
- **missing — the N-of-same ("6 haircuts") shape does not exist.** `kind` has no `"multiple"`; there is no single-service select + quantity stepper anywhere. `BundleDraft` always multi-selects ≥2 *distinct* services (`bundle-services` requires `serviceIds.length >= 2`, line 32).
- **missing — no validity / expiry / redemption fields.** `BundleDraft` = `{ kind, serviceIds, links, chooseCount, priceMode, discountPercent }` and `DemoOffer.bundle` mirrors it (`src/lib/data/offers.ts:151`). There is **no** `validityMonths`, no redemption rule, no remaining-balance concept. This is the single biggest functional gap for packages.
- **done — pricing + savings maths reusable as-is.** `bundle-pricing` (`src/app/new/bundle-pricing/page.tsx`) does fixed-£-vs-%-discount, a "Total value" subline, a live "Clients save £X / Clients pay £Y" readout and a deposit toggle. `bundlePriceSummary` / `bundleListValue` in `src/lib/data/bundles.ts` compute the list-value-vs-package readout for the dashboard.
- **done — the dashboard pattern to reuse.** The shared `/app/services/[id]/page.tsx` already renders a **bundle-only tabbed dashboard** (`BundleBody`, line 349): Overview (ready-to-publish card, price row, included-services row, Order & gaps timeline) + Advanced (inherited forms/resources, settings). `BundleSummary` (line 310) already prints `choose {chooseCount} of {N}` for the flexible kind. The package dashboard reuses this wholesale.
- **done — wizard chrome + components.** `TOTAL_STEPS` (`src/components/ui/organisms/WizardChrome.tsx:10`) holds per-type step counts; `WizardTitle` / `WizardFooter` / `FieldLabel` / `Toggle` / `Sheet` exist in `@/components/ui`. `offerFromDraft` (`src/lib/store/offersStore.ts:32`) is the single seam that turns a draft into a catalogue entry, already branching per type and copying the bundle snapshot + deposit.
- **done — smoke harness convention.** `smoke.tsx` already has bundle needles (the type-selector card check at line 311, `bundle-services` at 331, `offerFromDraft` bundle at 505). New package states slot in the same way.

**Net:** the *flexible* package is ~70% built but mislabelled and mis-placed; the *multiple* package and *validity/redemption* are missing; the dashboard and pricing are ready to reuse. The work is mostly **re-routing + two new fields + one new builder branch**, not new infrastructure.

---

## Recommended UX calls

Opinionated decisions where the feedback left gaps. Tags: `[ASSUMPTION]` (I've chosen a default, no objection expected) / `[OPEN — needs user decision]` (genuinely needs the client).

1. **Q1 — Package is an entry, not a new offer type.** `[ASSUMPTION, recommended]` Keep one domain: extend `kind` to `"fixed" | "flexible" | "multiple"` and add a **Package** card on `/new/type` that pre-sets the offer to the package shapes. The persisted `offer.type` stays `"bundle"`; the type selector is purely a presentation/entry split. This avoids a parallel `offersStore`, reuses the bundle dashboard, and matches the existing `chooseCount`/`priceMode` fields. *(The catalogue tabs question — whether the `/app/services` list grows a "Packages" tab — is Q6.)*
2. **Q2 — Default the package shape to "Choose any from a list."** `[ASSUMPTION]` It's the headline 26-May feature; "Multiples of one service" is the secondary 19-May case. The shape screen pre-selects flexible.
3. **Q3 — Validity is required; default 12 months.** `[ASSUMPTION]` Every package carries `validityMonths` (cross-vertical convention; Square caps at 1 year). Default 12, owner-editable. An "**No expiry**" option is offered but discouraged with a one-line note (a prepaid package with no expiry is an accounting liability).
4. **Q4 — Packages are editable after publish.** `[ASSUMPTION, recommended]` Explicitly reject Square's immutability. Edits use the existing dashboard sheets + `updateOffer`; show a "**Changes apply to future purchases**" note. (Already-sold credits are a downstream/B2C concern, out of scope here.)
5. **Q5 — Booking rule for flexible packages.** `[ASSUMPTION]` Offer a simple toggle "**one service per visit**" vs "**all in one visit**" (the redemption hint the research surfaced). Default "one service per visit" — the natural salon read of "choose any 3". Stored as `redeemRule`. `[OPEN]` if the client wants finer control.
6. **Q6 — Catalogue surfacing.** `[OPEN — needs user decision]` Does the `/app/services` list get a **separate "Packages" tab** (vs lumping packages under the existing "Bundles" tab)? Given the client wants the *creation* choice distinct, I lean toward a **Packages tab** for parity, but the persisted `type` is `"bundle"` so this is a filter/label decision, not a data one. Recommend a `Packages` tab that filters `bundle` offers where `kind !== "fixed"`.
7. **Q7 — Old-app logic.** `[OPEN — needs user decision]` The client offered to share the **old-app package logic** (26 May). Before Phase 2 (validity/redemption), confirm the old app's exact redemption rules (per-visit vs per-package expiry, whether choose-any-X locks the chosen services at purchase or at each booking) so the new fields match what owners already understand.
8. **Q8 — Copy discipline.** `[ASSUMPTION]` Keep Bundle vs Package wording crisp and never homogenised: **Bundle** = "a fixed set sold together"; **Package** = "clients choose from a set, or buy multiples of one." The client-facing rule string ("choose any 3 of these 6") is generated from the same `chooseCount` / `serviceIds` the owner configures — single source, no drift.

---

## Phase 1 — Surface Package on the creation entry (the 26-May ask)

**Goal:** Make Package a first-class creation choice sitting next to Bundle, and route it to a dedicated **package-shape** screen instead of the buried services-step toggle. No data-shape change yet — flexible already works; this phase is entry + routing + copy.

**Flow:**
1. `/new` intro → **`/new/type`** ("What are you adding?"). Add a **5th card: "Package"** (`Boxes`/`Layers` icon — distinct from Bundle's `Package` icon), copy: *"Clients choose from a set of services, or buy multiples of one."* It sits directly under "Bundle — Multiple services sold together."
2. Picking **Package** sets the draft type to `bundle` **and** flags it as a package (so basics/footer behave) → **`/new/basics`** (name + category + icon, unchanged; hint copy: *"Give this package a name and a category."*).
3. Basics "Next" for a package routes to a **new `/new/package-shape`** screen (Phase-2 content); picking **Bundle** keeps the existing `/new/bundle-services` fixed flow untouched.
4. The `bundle-services` step **loses its Fixed/Flexible segmented toggle** — fixed-bundle reaches it only via the Bundle card, so the page is now unambiguously "the fixed bundle's services." The flexible path comes through `package-shape`.

**Changes:**
- `src/app/new/type/page.tsx` — add the Package card. Since `OfferType` stays four values, model the entry as a local `EntryKind = OfferType | "package"`; `"package"` sets `updateDraft({ type: "bundle" })` + `updateBundle({ kind: "flexible" })`.
- `src/app/new/basics/page.tsx` — `onContinue`: when the draft is a package (a `bundle` with `kind !== "fixed"`, or a small `isPackage` draft flag — see Data), route to `/new/package-shape`; otherwise keep the existing branch. Add a `bundle`-package hint to `HINTS` if the copy needs to differ from the fixed bundle.
- `src/app/new/bundle-services/page.tsx` — remove the `KINDS` segmented control + the `chooseCount` block (those move to `package-shape` / the flexible builder); this page becomes fixed-only. Force `kind: "fixed"` on entry.
- `smoke.tsx` — extend the type-selector needle (currently checks "Service/Class/Bundle/Subscription") to also assert **"Package"** renders.

**Data:** a presentation flag only. Recommend `ServiceDraft.isPackage?: boolean` set by the Package card so basics can branch without overloading `kind` prematurely. (Alternatively branch purely on `type === "bundle" && bundle.kind !== "fixed"`; the explicit flag is clearer for the basics router.)

**Risk:** low. Pure routing + copy; the flexible logic already exists. Watch the `bundle-services` step number — it stays `step={2}` for fixed bundles.

---

## Phase 2 — Package-shape decision screen + the two builders

**Goal:** A single decision screen that splits the two models the client named, then the relevant builder. This is the heart of the feature.

**Flow:**

1. **`/new/package-shape`** — *"How does this package work?"* Two cards (selecting one sets `bundle.kind` and routes):
   - **(A) Choose any from a list** (`flexible`) — *"Clients pick a set number from the services you offer, e.g. any 3 of 6."* **Default-selected** (Q2). → `/new/package-services`.
   - **(B) Multiples of one service** (`multiple`) — *"A prepaid run of the same service, e.g. 6 haircuts."* → `/new/package-multiple`.
   Dedicated screen, not a segmented control above a list, so the two jobs read as genuinely different (research anti-pattern: don't bury the toggle).

2. **Flexible builder — `/new/package-services` → `/new/package-pricing`:**
   - **Step A · Services clients can choose from.** A flat checklist of published services (reuse the `bundle-services` row + checkmark). Each row shows the service's **standalone price** so the owner sees what they're discounting (research: Shopify/Universe price-context). Header: *"Services (N selected)."*
   - **Step B · How many can they choose?** A prominent **stepper** — *"Clients choose [3] of [6] selected services"* — with inline validation (*"Choose at most 6"*, the existing `chooseCount` guard). One-line live preview of the client-facing rule: *"Clients will see: choose any 3."* (This is the existing `chooseCount`, promoted out of the services step.)
   - **Step C · Price & terms** (`/new/package-pricing`, a thin variant of `bundle-pricing`): fixed package price **or** % discount off the chosen items (existing `priceMode`); live *"List value from £X · package £Y · clients save £Z."* **Then the new bit:** *"Valid for [12 months]"* (+ a "No expiry" escape with the discouraging note) and the Q5 booking rule toggle (*one service per visit / all in one visit*). Deposit toggle reused as in `bundle-pricing`.
   - **Step D · Review & publish** = the package dashboard (Phase 3).

3. **Multiple builder — `/new/package-multiple` → `/new/package-pricing`:**
   - **Step A · Which service?** Single-select one published service (radio list, *not* multi-check) — reuse the bundle row with a radio affordance.
   - **Step B · How many sessions?** A stepper — *"[6] sessions of Classic haircut"* — with a live summary card: *"Per visit £X · total £Y · save £Z vs booking singly"* (Canva/Blue-Apron quantity-tier pattern, simplified to one stepper; **not** a price ladder — research anti-pattern).
   - **Step C · Price & validity** (`/new/package-pricing`): fixed total **or** per-session price; *"Valid for [N months]"* (Square prepaid-series model — prepaid, auto-redeem one session per booking).
   - **Step D · Review & publish** = the package dashboard.

**Changes:**
- New route `src/app/new/package-shape/page.tsx` — two-card decision (compose from existing card pattern, e.g. the `subscription-type` cards). Sets `kind` + routes.
- New route `src/app/new/package-services/page.tsx` — the flexible builder (service checklist + standalone prices + the `chooseCount` stepper + rule preview). Reuses the `bundle-services` row/checkmark markup, minus the kind toggle.
- New route `src/app/new/package-multiple/page.tsx` — single-service radio + sessions stepper + live per-unit/total/savings card.
- New (or shared) `src/app/new/package-pricing/page.tsx` — fork of `bundle-pricing` adding the **validity** and **booking-rule** controls; or extend `bundle-pricing` to render those when `kind !== "fixed"`. **Recommend a shared page** that branches on `kind` to avoid divergence (CLAUDE.md rule 4).
- `src/components/ui/organisms/WizardChrome.tsx` — `TOTAL_STEPS` gains a `package` count. Flexible = 4 (basics → shape → services+count → pricing). The shape screen counts as step 2; the `multiple` branch is also 4. *(Footer can read `TOTAL_STEPS.package` via the `isPackage` flag.)*
- `src/app/new/bundle-pricing/page.tsx` — if sharing, extend; otherwise leave fixed-bundle pricing untouched.
- `smoke.tsx` — needles for `package-shape` ("How does this package work?", both card titles), `package-services` (checklist + "Clients choose" + rule preview), `package-multiple` ("sessions of", per-visit/total), and `package-pricing` ("Valid for", booking-rule copy). One needle per new empty/setup state.

**Data:** see "Cross-cutting" — `kind` gains `"multiple"`; `BundleDraft`/`offer.bundle` gain `validityMonths?`, `noExpiry?`, `redeemRule?`, and (for `multiple`) `quantity?` + `serviceIds` carries the single chosen service. `offerFromDraft` copies the new fields.

**Risk:** medium. The flexible branch is mostly relocation of existing logic; the `multiple` branch is genuinely new (single-select + stepper + per-unit maths). The shared-vs-forked pricing page is the main design call — recommend shared. SSR-safe: all maths is pure (extend `src/lib/data/bundles.ts` with a `packageMultipleSummary` helper, no clock/random).

---

## Phase 3 — Package dashboard (reuse the bundle tabbed layout)

**Goal:** The created package opens a dashboard that reads as a package, reusing the existing `BundleBody` tabbed layout (Overview / Advanced) rather than building anew.

**Flow:**
1. After create, route to `/app/services/[id]?created=1` (as bundle does). `BundleBody` renders.
2. **Overview tab:**
   - **Ready-to-publish card** — package-aware copy: *"Package setup is complete."* / *"Add services and a price to publish."* (`bundleReadyToPublish` extended for the `multiple` case: ≥1 service + quantity + price.)
   - **Rule row** — for `flexible`: *"Choose any 3 of 6 · valid 12 months."* For `multiple`: *"6 sessions of Classic haircut · valid 12 months."* (Generated from `chooseCount`/`quantity` + `validityMonths`.)
   - **Price row** — reuse `bundlePriceSummary` ("10% off · list value £105" / "£200 fixed · list value £270").
   - **Included / chosen-from row** — `includedServicesSummary` for flexible; the single service + quantity for multiple. Taps back into selection.
   - **Order & gaps** — **hidden for packages** (a client-assembled choose-any-X or a single-service run has no fixed running order). Show it only when `kind === "fixed"`.
3. **Advanced tab:** reuse inherited forms/resources + settings rows exactly as bundle does (the chosen services still carry their own forms/resources).
4. **Edit after publish:** every row opens its sheet via `updateOffer`; show the *"Changes apply to future purchases"* note (Q4).

**Changes:**
- `src/app/app/services/[id]/page.tsx` — `BundleBody` / `BundleSummary`: branch copy on `kind`; add the **rule row** (choose-N / N-sessions + validity); gate the **Order & gaps** timeline to `kind === "fixed"`; package-aware ready/headline copy. `BundleSummary` (line 310) already prints `choose {chooseCount} of {N}` — extend for the `multiple` and validity strings.
- `src/lib/data/bundles.ts` — `bundleReadyToPublish` handles `multiple`; add `packageRuleSummary(offer)` returning the rule string; `inheritedFromServices` already works.
- `smoke.tsx` — needles: a seeded **flexible** package dashboard renders "Choose any …" + "valid"; a seeded **multiple** package dashboard renders "sessions of"; both omit the Order & gaps timeline.

**Data:** none beyond Phase 2's fields; the dashboard reads them. Add **one seed package of each kind** to `demoOffers` (`src/lib/data/offers.ts`) so the dashboard + catalogue render without creating one (mirrors `bun_cut_colour`). E.g. a `flexible` "Choose any 3 facials" and a `multiple` "6-haircut package."

**Risk:** low–medium. Reuses a proven layout; the risk is copy/branching sprawl in `BundleBody`. Keep the kind-branching in helper functions, not inline JSX.

---

## V2 / deferred

Parked but recommended directions (the client asked to capture everything now):

- **Client-facing redemption (B2C `/c`).** *Recommended direction:* at booking, a purchased package shows as a credit — *"Cut & Colour Package — 2 of 3 left"*; selecting a covered service deducts a credit and shows £0 due (Square auto-redeem). Choose-any-X spends credits on whichever services the client picks; multiple-of-same spends one session per booking until balance/validity runs out. **Out this pass** (this plan is B2B); the B2B fields built here (`chooseCount`, `quantity`, `validityMonths`, `redeemRule`) are precisely what the B2C surface will consume — design them with that downstream in mind.
- **Remaining-balance / wallet view.** *Recommended:* a client wallet showing "X of N left" + expiry countdown. Needs a real purchase/booking record — beyond session-local prototype. Defer to the payments/checkout pass.
- **Tiered quantity pricing** (Vinted "2 items 5% / 3 items 10% / 5 items 20%"). *Recommended:* a later nice-to-have for the `multiple` branch only; one fixed price or one % discount is enough for v1 (research anti-pattern: don't ship the matrix now).
- **Multi-group constraints** (Uber Eats "choose entrée AND 2 sides AND a drink"). *Recommended:* **do not build** for salon packages — one group ("choose N of M") is the right scope. Captured only to explicitly rule out.
- **Per-service price overrides inside a package** (Shopify-style "+£20 for this option"). *Recommended:* later — start with one flat package price/discount; revisit if owners ask to up-charge premium services within the set.
- **Barcode / by-the-minute redemption** (27 May tanning catch-up). *Recommended:* a separate redemption-mechanic concern; note the overlap with package balance tracking but keep it in its own section.

---

## Suggested order & rationale

`Phase 1 (entry + routing) → Phase 2 (shape screen + both builders + validity) → Phase 3 (dashboard reuse)`

Phase 1 first because it is the literal 26-May ask (surface Package alongside Bundle) and is low-risk pure routing — it makes the feature *discoverable* immediately, even before the `multiple` branch lands. Phase 2 is the substance: the decision screen plus the new `multiple` builder and the validity/redemption fields (the biggest functional gap). Phase 3 is mostly reuse — gated last because it consumes Phase 2's fields and benefits from a seed package of each kind to verify against.

Confirm **Q1 (entry vs new type)**, **Q6 (catalogue tab)** and **Q7 (old-app logic)** before Phase 2; Phase 1 can start on the Q1 recommendation alone. Every phase ends green on `npx tsc --noEmit && npx next lint && npm run smoke`, with a smoke needle for each new empty/setup state. Persistence stays session-local Zustand via `updateOffer` / `addOffer`; all new fields are additive so the 23 seed offers keep rendering.

---

## Cross-cutting data-model changes

All additive / back-compatible. Applied to **`BundleDraft`** (`src/lib/store/wizardStore.ts`) and mirrored on **`DemoOffer.bundle`** (`src/lib/data/offers.ts`); copied through by `offerFromDraft` (`src/lib/store/offersStore.ts`).

- `kind: "fixed" | "flexible"` → **`"fixed" | "flexible" | "multiple"`** (Phase 2). `emptyBundle` default stays `"fixed"`; the Package card sets `"flexible"`.
- **`quantity?: number`** — sessions count for `kind === "multiple"` (e.g. 6). For `multiple`, `serviceIds` holds the single chosen service (length 1). (Phase 2)
- **`validityMonths?: number`** — package expiry window; default 12 (Phase 2). The cross-vertical gap.
- **`noExpiry?: boolean`** — opt-out of validity, discouraged in copy (Phase 2).
- **`redeemRule?: "per_visit" | "all_in_one"`** — flexible booking rule (Q5); default `"per_visit"` (Phase 2).
- `ServiceDraft.isPackage?: boolean` (draft-only presentation flag set by the Package card, drives basics routing + footer step count) — **not** persisted onto the offer (Phase 1).
- `TOTAL_STEPS` gains **`package`** (= 4) (Phase 2).
- **No new store, no new offer type** — `offer.type` stays `"bundle"`; Package is the `flexible`/`multiple` kinds surfaced as their own creation entry (Q1).
- Seed: add one `flexible` + one `multiple` package to `demoOffers` for dashboard/catalogue rendering (Phase 3).

Helpers in `src/lib/data/bundles.ts` extend (pure, SSR-safe): `bundleReadyToPublish` (handle `multiple`), new `packageRuleSummary` and `packageMultipleSummary` (per-visit / total / savings). Existing `bundleListValue` / `bundlePriceSummary` / `includedServicesSummary` reused unchanged.

---

## Open questions for the user

1. **Q1 — entry vs new offer type.** Confirm Package writes into `BundleDraft` (`kind: fixed|flexible|multiple`) rather than a new offer type. *(Recommended: yes — honours one-domain rule, reuses the dashboard.)*
2. **Q6 — catalogue surfacing.** Does `/app/services` get a separate **"Packages" tab**, or do packages live under the existing "Bundles" tab? *(Recommend a Packages tab filtering `bundle` offers with `kind !== "fixed"`.)*
3. **Q7 — old-app logic.** Please share the **old-app package logic** (offered 26 May) so the new validity/redemption fields match what owners already know — specifically: does choose-any-X lock the chosen services at purchase or pick them at each booking, and is expiry per-package or per-session?
4. **Validity default & cap.** Confirm 12-month default; do we cap at 12 months (Square) or allow longer? Allow "No expiry" at all?
5. **Booking rule (Q5).** Is the simple "one service per visit / all in one visit" toggle enough, or does the client want finer redemption control for flexible packages?
6. **Pricing per branch.** For `multiple`, price as a **fixed total** or a **per-session price** (or offer both)? For `flexible`, fixed package price **or** % discount (we propose both, as bundle does).
7. **Editability scope.** Confirm packages are editable after publish with a "applies to future purchases" note, and that already-sold credits are a downstream (B2C) concern, not handled here.

*Implementation begins once Q1, Q6 and Q7 are answered; Phase 1 can start on the Q1 recommendation.*
