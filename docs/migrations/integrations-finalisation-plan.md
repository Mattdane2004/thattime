# Integrations — Finalisation Plan

> **Status:** Plan only — no implementation until the open questions below are resolved.
> **Scope:** A single **Integrations hub** in the B2B business app — a categorised directory of the tools an owner connects to run their salon (Accounting, Payments & BNPL, Calendar, Social, Comms, plus the Marketplace listing as a channel), reachable from the Hub "Setup" list. Per-integration connect / detail / manage / disconnect screens. **Out of scope this pass:** real OAuth back-ends (this is a session-local prototype — "connect" simulates the handshake and stores a fake account identity); the *settlement* side of payments (Stripe Connect / wallet / payslips → the dedicated payments session); building the Marketing notification engine that Social cross-post would feed; any B2C-side integration UI.
> **Source of truth for feedback:** Granola sessions with Shabbir & Vishal — **"that time sign off" (15 Jun)**, **"That Time Product alignment" (2 Jun / 9 Jun)**, **(19 May)**, and the internal **"TT planning" (16 Jun)** remaining-section list. Integrations is named on the 16 Jun list; the concrete providers were named earlier across the alignment calls.
> **Design source → design in-app from research patterns.** No Integrations Figma exists yet; build from the meeting feedback + the Mobbin integration-directory patterns cited below + the existing `@/components/ui` library, reviewed in the running app. (Same approach the team plan took.)

---

## What this section is

The Integrations hub is the one place an owner connects the external tools they already use — their accountant's software, a calendar, their social accounts, BNPL at checkout — to That Time. It is a **low-frequency Setup destination, not a primary nav tab**: it lives as the existing "Integrations" row in the **Hub → Setup** list (`/app/hub`, Setup group, puzzle-piece `Plug` icon), alongside Business profile, Setup guide, Data import and Business settings. The job is to reduce owner cognitive load: lead every row with the *outcome* ("Send payouts and payslips to your accountant"), name the actual provider as a subtitle, and offer one action per row. It is deliberately a short categorised directory of ~5 real integrations, **not** an app-store with search, ratings and hundreds of plugins.

---

## Feedback → source map (reference index)

| Area | Feedback | Source | Pattern ref (Mobbin) |
|---|---|---|---|
| Hub exists | "Integrations" listed as a remaining section to build | 16 Jun (TT planning) | Revolut Business — Integrations entry sits in the settings/account menu, not a nav tab · https://mobbin.com/screens/c0aa616c-79db-4b5d-82bc-b80f8f1e5f3c |
| Categorisation | Keep it simple — group by Accounting / Payments-BNPL / Calendar / Social / Comms | 16 Jun + SDS recommendation | Revolut Business — categorised directory (Accounting, HR, Automations, E-commerce) · https://mobbin.com/screens/9c836177-e15f-4b57-ad6d-243fc1b0ccdc |
| Accounting | Xero / accounting export of payouts and payslips | 2 Jun (team plan) | Revolut Business — Accounting capability detail (Connect + sub-settings) · https://mobbin.com/screens/e12b95e3-4cef-4d52-907f-c303740abdf9 ; Todoist connection detail (account + toggles + remove) · https://mobbin.com/screens/e5c2d413-81be-4af8-abab-a750d6501fb4 |
| Social | Cross-post work via social API; social links in profiles | 2 Jun | Linktree — Social connected handle + check vs Connect · https://mobbin.com/screens/7a377b2f-12b7-4fe8-bc9e-4bc8fd2dd80b ; GOAT — "We will never post anything without your permission" · https://mobbin.com/screens/647517f6-e47e-4160-a5b4-bd15e294ff0e ; Instagram — optional connect with clear Skip · https://mobbin.com/screens/a54fb89b-b437-49b5-9431-4dc448ac437f |
| Payments / BNPL | Klarna / Clearpay — a payment method (BNPL) | 19 May | Linktree — Audience › Integrations marketing-tool connect cards · https://mobbin.com/screens/49afa5e7-43b8-4956-9cbb-962534a07ca8 (deep-link pattern, not duplicate config) |
| Comms / chat | Sendbird chat infrastructure | 15 Jun | (anti-pattern) Amie — disabled rows with a reason for what you don't surface · https://mobbin.com/screens/2581b514-1d11-4e9f-92d0-435667216733 — Sendbird is plumbing, *not* a user-facing integration |
| Calendar | Google / Apple calendar sync (implied expectation for a booking app) | implied (booking-app norm) | Otter.ai — Connect calendars (This Device / Google / Microsoft) with live sync subtitles · https://mobbin.com/screens/cc1dca72-426b-4d3e-a1e3-609ed450704e ; Todoist calendar detail · https://mobbin.com/screens/e5c2d413-81be-4af8-abab-a750d6501fb4 |
| Marketplace | Being listed / discoverable in the B2C marketplace is itself a channel | 2 Jun (marketplace social vision) | Linktree — connected-account status display · https://mobbin.com/screens/7a377b2f-12b7-4fe8-bc9e-4bc8fd2dd80b |
| Row pattern | Lead with the job, name the provider as subtitle, one action per row | SDS recommendation | Superlist — per-row benefit line + inline "1 account connected" status · https://mobbin.com/screens/8aa2edd9-f7be-4ac7-8822-dbf79e328736 ; Craft — Connect vs Configure two-state button · https://mobbin.com/screens/205b6293-3b81-479e-b82f-6744ce8b4e78 |
| Trust block | Show what data it can access + provider website + privacy policy before authorising | SDS recommendation | Manus — connector metadata table (Author, Website, Privacy Policy) · https://mobbin.com/screens/15ea2c44-7aa4-4345-afce-e0dc0d1cb242 ; Starling — Status / View Permissions / Remove · https://mobbin.com/screens/1f4493a9-4c60-4bb2-92ff-06befe5869cf |
| Disconnect | Plain sync-direction sentence + red Disconnect with confirm | SDS recommendation | Flighty — sync direction stated, red Disconnect · https://mobbin.com/screens/24261435-f942-4cb5-bb93-fd50d120af6f |
| Token expiry | Show connection date + renew prompt so sync never fails silently | SDS recommendation | Minna Bank — connection date, expiry, renew/disconnect · https://mobbin.com/screens/5f1b293b-216b-48b6-a4cd-c059f1da481a |
| Coming soon | Show unsupported V2 integrations honestly as disabled rows with a reason | SDS recommendation | Amie — disabled (unavailable) integration row · https://mobbin.com/screens/2581b514-1d11-4e9f-92d0-435667216733 |

---

## Current state

**Status legend:** ✅ done · 🟡 partial · ❌ missing.

- 🟡 **Hub entry point already drawn** — `src/app/app/hub/page.tsx` already renders an **"Integrations"** row in the **Setup** `ListCard` (`setupItems`, key `integrations`, `Plug` icon, line ~49). It has **no `href`**, so it is currently a dead `<button>`. Same for the `business-settings` row. So the *entry point exists in the menu but goes nowhere* — exactly the gap to fill. This is the correct placement per the Revolut Business pattern (Integrations as one Setup row, not a nav tab).
- ✅ **Integrations is correctly NOT a nav tab** — `src/components/app/AppTabBar.tsx` has only Home / Schedule / Clients / Message. No change needed; do not add a tab.
- 🟡 **BNPL already has a data home** — `src/lib/types/business.ts` defines `PaymentMethods { card; cash; transfer; bnpl }` and `BusinessDefaults { …paymentMethods; deposit }`. The onboarding promo interstitial `src/app/onboarding/preparing/page.tsx` already markets "Apple Pay, Clearpay and Klarna". So BNPL config belongs in Payments/business defaults; the Integrations hub must **deep-link there, not fork the config** (anti-pattern: don't duplicate Payments/BNPL setup).
- ❌ **No Integrations route, store, or data module** — there is no `/app/integrations` (or `/app/settings`) route; no `integrations` entry in `src/lib/data/*` or `src/lib/store/*`. `src/lib/data/` holds offers/products/team/etc.; `src/lib/store/` holds offers/team/wizard/role/etc. Nothing models connections.
- ❌ **No social-link / accounting / calendar fields anywhere** — grep of `src/lib/types/staff.ts` and the data modules finds no `socials`, `instagram`, `accounting` or calendar fields. The team plan (`team-finalisation-plan.md`, Phase 2c) *proposes* `socials` on `StaffProfile` for profile display, but that is per-staff display links, distinct from the business-level social *connection* this section needs.
- 🟡 **Marketplace listing concept exists conceptually but not as a channel surface** — the B2C app (`src/app/c/**`) is the consumer marketplace; there is no B2B-side "you are listed / visible" status row. New here.
- ✅ **Smoke harness ready for new needles** — `smoke.tsx` imports pages and asserts with `check(name, cond)` on `renderToString` output (e.g. `EmptyState shows title + desc`). Each new empty/connected state gets a needle.

---

## Recommended UX calls

As the designer, reducing owner cognitive load, here are the opinionated calls. Anything the client left undefined is tagged.

1. **One hub, categorised, fixed order.** Single screen at `/app/integrations`, sections in the Revolut order: **Accounting · Payments & BNPL · Calendar · Social · Comms · Channels**. Adopt the category grouping verbatim (recommendation, 16 Jun). Each section is a labelled group of rows.
2. **Row anatomy = job-first.** `icon + name + one-line plain-English benefit + right-aligned state button`. The button is **two-state**: grey **"Connect"** (unconnected) or **"Manage"** (connected) — Craft pattern. **No far-right status badge**; connected status reads inline under the name (Superlist pattern): "Connected as studio@…", "Last synced 2h ago", "Syncing 1 calendar". Never a bare logo + brand with no benefit line (a salon owner doesn't know what "Xero" is).
3. **Sendbird is invisible plumbing — do NOT list it.** [ASSUMPTION] The 15 Jun Sendbird mention is chat infrastructure the owner should never "connect"; messaging just works. The Comms category instead surfaces *owner-facing* comms (WhatsApp / email notification channel) and links to Marketing. (Anti-pattern: don't expose infra vendors.)
4. **Klarna / Clearpay row deep-links to Payments, it does not fork config.** The Payments & BNPL row reads "Buy now, pay later" / "Klarna, Clearpay" and its action opens the Payments / business-defaults BNPL setting (`PaymentMethods.bnpl`), not a separate OAuth flow. [ASSUMPTION] Since `business-settings` has no route yet, V1 wires this to a lightweight BNPL toggle screen owned by this hub but writing to the shared `paymentMethods` field, with a "managed in Payments" note — when Business settings lands it relocates there.
5. **Calendar is one job, multiple sources — not three cards.** A single "Sync your calendar" entry; the detail lists Google / Apple / Outlook as choices (Otter.ai pattern). Subtitle reports live state ("Syncing 1 calendar"). Per-staff calendar mapping is **V2** — V1 syncs the owner's calendar only.
6. **Social connect must pre-empt the fear.** The connect screen states **"We never post without your approval"** and is explicitly optional/skippable (GOAT / Instagram). Connected status echoes the **handle** so the owner confirms the right account (Linktree).
7. **Show V2 honestly as disabled "Coming soon" rows, don't hide them** (Amie). Sets expectations and signals the roadmap without faking a Connect button that does nothing.
8. **Detail-page trust scaffolding is mandatory for data-sensitive connections** (Accounting, Calendar, Social): a sync-direction sentence, a permissions summary, provider Website + Privacy Policy links (Manus / Starling), and for token-expiry providers a connection date + renew prompt (Minna Bank) so sync never fails silently.
9. **Prototype "connect" is simulated.** [ASSUMPTION] No real OAuth this pass — tapping "Connect [vendor]" stores a seeded fake account identity (e.g. `studio@example.com`, `@yoursalon`) in session-local Zustand and flips the row to connected, with a success toast. The detail screen still shows the full real-world trust block so the design is reviewable.
10. **Marketplace = a Channel, not a third-party OAuth** (recommendation, 2 Jun). A "Channels" section row "Listed on That Time marketplace" with a Visible/Hidden status and a link to the public B2C profile (`/c/salon/[id]`) — treated as an always-on owned channel, not something you authorise.
11. **One "Learn about integrations" link at the bottom of the hub** (Craft) — parks help without per-row clutter.

---

## Phase 1 — Integrations hub (the directory) + entry point

**Goal:** Make the existing dead "Integrations" Hub row open a real categorised directory, with connect/manage state per row, "Coming soon" rows for V2, and the inline connected-status pattern. This is the backbone every later phase hangs detail screens off.

**Flow (user journey):**
1. Owner opens **Hub → Setup → Integrations** (`/app/hub`, Setup list). The row now has an `href`.
2. **Hub screen** (`/app/integrations`): header `AppHeader` + one-line purpose "Connect the tools you already use to run your business." Sections in fixed order: **Accounting · Payments & BNPL · Calendar · Social · Comms · Channels**.
3. Each section = a labelled group (reuse the Hub `ListCard` row idiom / `@/components/ui` Row + Card). Row = capability/vendor icon + name + benefit line + right-aligned **Connect** (grey) / **Manage** state button. Connected rows also show inline status under the name.
4. **Coming soon** items (e.g. Social cross-post if parked, extra accounting providers) render as **disabled** rows with a muted "Coming soon" tag + a one-line reason.
5. Tapping **Connect** → integration detail screen (Phase 2). Tapping **Manage** → detail in connected state (Phase 3).
6. Bottom: a single **"Learn about integrations"** link.

**Changes:**
- `src/app/app/hub/page.tsx` — give the `integrations` `setupItems` entry an `href: "/app/integrations"` (one-line change; the row already exists).
- New `src/app/app/integrations/page.tsx` — the hub directory, composed from `@/components/ui` (Card, Row, Button variants, Badge for "Coming soon"). No hand-rolled primitives, no inline hex.
- New `src/lib/data/integrations.ts` — the seed catalogue (categories + providers + benefit copy + which are V1 vs "Coming soon").
- New `src/lib/store/integrationsStore.ts` — Zustand: connection state keyed by integration id (`connect`, `disconnect`, `setConfig`).
- `smoke.tsx` — import `IntegrationsPage`; needles: "Integrations hub renders the six categories", "Coming soon row is disabled", "Connect button shows for an unconnected provider".

**Data:** see Cross-cutting changes — `IntegrationDef` (catalogue, static) + `IntegrationConnection` (store state). Both new; nothing on `DemoOffer`/`Staff` touched.

**Risk:** low. New isolated route + store; the only edit to existing code is one `href`.

---

## Phase 2 — Connect flow (simulated OAuth) + detail screen

**Goal:** Tapping Connect opens a per-integration detail screen carrying the full trust block, then a simulated provider hand-off that flips the row to connected with an echoed account identity.

**Flow:**
1. From a row tap **Connect** → `/app/integrations/[id]` (unconnected state): centred logo, name, 2–3 line description stating exactly what it does **and the sync direction** (e.g. "Payouts and payslips export to Xero. Nothing is pulled back.").
2. **Trust block:** "Provided by [vendor]", a permissions summary ("Can: create draft invoices. Cannot: see client data"), and provider **Website** + **Privacy Policy** links (Manus metadata pattern).
3. **Social only:** a reassurance line "We never post without your approval" + an explicit "this is optional" note with a clear way to back out (GOAT / Instagram).
4. Primary button **"Connect [vendor]"** → simulated provider consent (a `Sheet` standing in for the OAuth web sheet, with a single "Allow" CTA) → returns to the app.
5. **Success:** the connection is written to `integrationsStore` with a seeded account identity; a success toast confirms; the screen re-renders in **connected** state (→ Phase 3); the hub row now reads "Manage" + inline "Connected as …".

**Changes:**
- New `src/app/app/integrations/[id]/page.tsx` — detail screen, two states (unconnected / connected) driven by the store; compose `Sheet`, `Button`, `Card` from `@/components/ui`.
- `src/lib/store/integrationsStore.ts` — `connect(id, account)` seeds the fake identity (no `Math.random`/`Date.now` at module/render top level — pass timestamps in from an effect/handler, per CLAUDE.md SSR rules).
- `src/lib/data/integrations.ts` — per-integration copy: description, sync-direction sentence, permissions summary, website + privacy URLs, seeded demo account identity.
- `smoke.tsx` — needle: "Integration detail renders trust block (Website + Privacy links)"; "Social detail shows the no-post-without-approval line".

**Data:** `IntegrationConnection` gains `account` (echoed identity), `connectedAt`, `status`. Additive.

**Risk:** low–medium. The trust copy must be accurate and reusable across providers; the simulated consent sheet is the only slightly novel interaction.

---

## Phase 3 — Manage / configure a connected integration

**Goal:** A connected integration's detail screen becomes the management surface: account identity, status, capability toggles for *what* syncs, a renew prompt where tokens lapse, and a red Disconnect with confirm.

**Flow:**
1. From a connected row tap **Manage** → `/app/integrations/[id]` in connected state.
2. **Top:** account identity (email / handle / business name) + connection date. For token-expiry integrations, show **expiry + "Renew connection"** (Minna Bank) so sync can't fail silently.
3. **Status field:** "Connected" (success token colour) and, where relevant, "Last synced [time]" / "Syncing N calendars" (Otter / Flighty).
4. **Capability toggles** for what syncs, granular + plain-language (Todoist):
   - Accounting → "Export payouts", "Export payslips".
   - Calendar → which calendars show + a "Block out booked time" two-way toggle.
   - Social → "Auto-suggest a post when I add a new service".
5. **One sentence** on sync direction + data handling ("Payouts and payslips push to Xero; nothing comes back"; "Flighty retains zero data" idiom).
6. **Disconnect** at the bottom in the **danger** token colour, with a confirm dialog (Starling).

**Changes:**
- `src/app/app/integrations/[id]/page.tsx` — connected-state layout: identity header, status, capability `Toggle` list, renew action, destructive Disconnect + confirm `Sheet`/dialog.
- `src/lib/store/integrationsStore.ts` — `setConfig(id, partialConfig)`, `disconnect(id)`, `renew(id)`.
- `smoke.tsx` — needle: "Connected integration shows account identity + Disconnect"; "Capability toggles render for a connected accounting integration".

**Data:** `IntegrationConnection.config: Record<string, boolean>` (capability toggles) + `expiresAt?` for token-expiry providers. Additive.

**Risk:** low–medium. Repetitive toggle UI; the renew/expiry affordance only applies to a subset (Accounting, Social) — keep it conditional.

---

## Phase 4 — Calendar sync (capability-grouped) + Channels (marketplace listing)

**Goal:** Two structurally different rows that don't fit the single-vendor template: Calendar (one job, multiple sources) and the Marketplace listing (an owned channel, not an OAuth).

**Flow — Calendar:**
1. Calendar section → single **"Sync your calendar"** entry.
2. Detail lists sources to add: **Google · Apple · Outlook**, each a Connect affordance (Otter.ai). Subtitle reports live state once added ("Syncing 1 calendar").
3. Toggles: **"Show my bookings in this calendar"** and **"Block out my personal busy time from booking"** (two-way), each with a one-line explanation.
4. Per-staff calendar mapping note: **V2** (defer — flagged on the page).

**Flow — Channels / Marketplace:**
1. **Channels** section → row "Listed on That Time marketplace" with status **Visible** (default on) / **Hidden** and inline "View your public profile".
2. Tapping opens a small detail: a Visible toggle + a link to the public B2C profile (`/c/salon/[id]`). No OAuth, no permissions block — it is an owned channel, framed as discoverability ("Clients can find and book you in the That Time app").

**Changes:**
- `src/app/app/integrations/[id]/page.tsx` — a `kind: "calendar"` branch (multi-source list) and a `kind: "channel"` branch (visibility toggle + public-profile link), distinct from the single-vendor branch.
- `src/lib/data/integrations.ts` — Calendar as a capability with `sources` (Google/Apple/Outlook); Channels/Marketplace as a `channel` kind.
- `src/lib/store/integrationsStore.ts` — calendar source list state + a `marketplaceVisible` boolean.
- `smoke.tsx` — needle: "Calendar detail lists Google/Apple/Outlook sources"; "Marketplace channel row shows Visible status".

**Data:** `IntegrationConnection.sources?: { key; label; connected; calendarCount? }[]` (calendar); `marketplaceVisible: boolean` (channel). Additive.

**Risk:** medium. Two bespoke detail layouts; keep the marketplace one tiny to avoid scope creep into a full listing editor.

---

## Phase 5 — Payments & BNPL deep-link (no duplicate config)

**Goal:** The Payments & BNPL row connects Klarna/Clearpay *as a payment method*, reusing the existing `PaymentMethods.bnpl` field — it must not fork a second BNPL config.

**Flow:**
1. Payments & BNPL section → row "Buy now, pay later" / subtitle "Klarna, Clearpay — let clients split payments".
2. Action opens a focused BNPL setting screen (or, once Business settings exists, deep-links straight there) with a single toggle writing to `BusinessDefaults.paymentMethods.bnpl`, plus a short explainer and a "Managed in Payments" note.
3. The hub row's inline status reflects the toggle: "On at checkout" / "Connect".

**Changes:**
- `src/app/app/integrations/[id]/page.tsx` — a `kind: "deeplink"` branch that reads/writes the shared payment-methods field rather than the integrations store.
- Reuse / extend the store that owns `BusinessDefaults` (currently `business.ts` types are consumed in B2C `c/settings/payments`; on the B2B side this is the onboarding/business-settings slice — confirm the owner store in implementation and write through it, do not duplicate).
- `smoke.tsx` — needle: "BNPL row reflects the shared paymentMethods.bnpl flag".

**Data:** none new — reuses `PaymentMethods.bnpl`. (If no B2B business-settings store exists yet, V1 may persist the flag in `integrationsStore` and reconcile when Business settings lands — flagged as an open question.)

**Risk:** medium — the only phase that crosses into shared payment state; the risk is accidentally creating a second source of truth. Grep `paymentMethods` before writing.

---

## V2 / deferred

Everything below is shown in the hub now as **honest "Coming soon" disabled rows** (Amie pattern) rather than hidden, so the roadmap is visible without dead Connect buttons.

- **Real OAuth back-ends** — replace the simulated consent with genuine provider OAuth for Xero, Google/Apple/Outlook, Instagram. *Direction:* swap the `connect()` stub for a real redirect + token store; the UI built in Phases 2–3 (trust block, identity echo, renew/expiry) is already shaped for it.
- **Social cross-post engine** — the "auto-suggest a post when I add a new service" toggle is wired in the UI; the actual posting/compose pipeline pairs with **Marketing** (16 Jun: Marketing pairs with Analytics). *Direction:* connection + toggle now, compose-and-post later.
- **Social links in profiles** — per-staff and per-business display links (distinct from the *connection*). *Direction:* land via the team plan's `StaffProfile.socials` (team-finalisation-plan Phase 2c) and a business-profile equivalent; the Social *connection* here can pre-fill them.
- **Per-staff calendar sync** — V1 syncs the owner's calendar only; team-plan calendars (each member's Google/Apple) are V2 and reuse the source-list pattern from Phase 4.
- **More accounting providers** — FreeAgent / QuickBooks alongside Xero, shown "Coming soon" until built (Revolut names multiple providers under one Accounting card).
- **Comms channel depth** — owner-facing WhatsApp / email notification channels surfaced here and linked to Marketing; Sendbird stays invisible plumbing and is never listed.
- **Connection health surfacing** — a "needs attention" prompt on the Hub when a token has lapsed (extends the Minna-Bank renew affordance into a home/Hub alert).

---

## Suggested order & rationale

`1 (hub + entry) → 2 (connect/detail) → 3 (manage/disconnect) → 4 (calendar + marketplace) → 5 (BNPL deep-link)`

Phase 1 first: it turns the existing dead Hub row into a real screen and establishes the store every later phase reads. Phase 2 then makes a single category (Accounting/Xero is the cleanest exemplar) fully connectable end-to-end, proving the trust-block + simulated-OAuth pattern before it's replicated. Phase 3 completes the lifecycle (manage/disconnect) on the same screen. Phases 4 and 5 are the two structural exceptions (capability-grouped calendar; deep-linked BNPL) and can be reordered by client priority — BNPL (19 May) is arguably higher business value, Calendar is the implied table-stakes for a booking app. Social can ship as a "Coming soon" row from Phase 1 and be promoted to a live connect flow whenever the cross-post engine is ready.

Every phase ends green on `npx tsc --noEmit && npx next lint && npm run smoke`, with a smoke needle for each new empty/connected state. Persistence stays session-local Zustand (`integrationsStore`), and all new fields are additive/back-compatible so seed data keeps rendering — consistent with the rest of the app.

---

## Cross-cutting data-model changes

New `src/lib/data/integrations.ts` (static catalogue):

```ts
type IntegrationCategory =
  | "accounting" | "payments" | "calendar" | "social" | "comms" | "channels";

type IntegrationKind =
  | "oauth"      // single-vendor simulated OAuth (Xero, Instagram)
  | "calendar"   // capability-grouped, multiple sources
  | "deeplink"   // reuses an existing setting (BNPL → paymentMethods)
  | "channel";   // owned, always-on (marketplace listing)

interface IntegrationDef {
  id: string;
  category: IntegrationCategory;
  kind: IntegrationKind;
  name: string;
  benefit: string;              // job-first one-liner
  vendor?: string;
  syncDirection?: string;       // plain sentence
  permissions?: { can: string[]; cannot: string[] };
  websiteUrl?: string;
  privacyUrl?: string;
  demoAccount?: string;         // seeded identity echoed on connect
  capabilities?: { key: string; label: string; default: boolean }[];
  sources?: { key: string; label: string }[];   // calendar
  expires?: boolean;            // token can lapse → show renew
  comingSoon?: boolean;         // disabled row + reason
  comingSoonReason?: string;
}
```

New `src/lib/store/integrationsStore.ts` (session-local Zustand):

```ts
interface IntegrationConnection {
  id: string;
  status: "connected" | "disconnected";
  account?: string;             // echoed identity (email / handle / business)
  connectedAt?: string;         // set in a handler, never at module top level
  expiresAt?: string;           // for expires === true providers
  config: Record<string, boolean>;            // capability toggles
  sources?: { key: string; label: string; connected: boolean; calendarCount?: number }[];
}
// actions: connect(id, account) · disconnect(id) · renew(id) · setConfig(id, patch)
//          addCalendarSource(id, key) · setMarketplaceVisible(bool)
```

Reused, **not** duplicated: `PaymentMethods.bnpl` / `BusinessDefaults` in `src/lib/types/business.ts` (Phase 5 BNPL deep-link). Touched-but-trivial: `src/app/app/hub/page.tsx` (`integrations` row gains `href`).

All optional / back-compatible. No `DemoOffer` or `Staff` field changes. Persistence is session-local; `connect`/`renew` timestamps are passed in from event handlers to stay SSR-safe (no clock/random at module or render top level, per CLAUDE.md).

---

## Open questions for the user

1. **BNPL home (Phase 5).** There is no B2B Business-settings route yet (`business-settings` Hub row is also dead). Should the Integrations BNPL row open a small toggle screen owned by this hub now (writing through to `paymentMethods.bnpl`), or wait and deep-link into Business settings once that section is built? (Recommendation: build the small screen now, relocate later.)
2. **Social cross-post — live or "Coming soon" in V1?** The connect/handle/toggle UI is cheap to ship, but the actual posting pipeline depends on Marketing. Ship Social as a live *connect* (handle echoed, toggles stored, no real posting) or as a "Coming soon" row until Marketing lands? (Recommendation: live connect, posting deferred.)
3. **Comms category contents.** Confirm Sendbird stays invisible plumbing (recommended). What *should* the Comms category surface to the owner — a WhatsApp/email notification channel that links to Marketing, or should Comms be omitted from V1 entirely?
4. **Calendar scope.** V1 = owner's calendar only, per-staff sync deferred to V2 — acceptable? And which sources for V1: Google + Apple only, or include Outlook?
5. **Marketplace channel depth.** Is a Visible/Hidden toggle + link to the public profile enough for V1, or does the owner expect to edit listing content (photos, blurb) from here? (Recommendation: status + link only; listing content lives in Business profile.)
6. **Accounting providers.** Xero is named (2 Jun). Show only Xero in V1 with FreeAgent/QuickBooks as "Coming soon", or no other providers at all yet?
7. **Connection-health alerting.** Should a lapsed token surface on the Hub / home as a "needs attention" prompt (V2 direction), or is the renew affordance on the detail screen sufficient for the prototype?

*Implementation begins once these are answered. Recommended first build: **Phase 1 (hub + entry point)** — it converts the existing dead Hub row into a real categorised directory and stands up the store everything else reads.*
