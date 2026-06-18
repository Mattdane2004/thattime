# Help, FAQs & Legal — Finalisation Plan

> **Status:** Plan only — no implementation until the open questions below are resolved.
> **Scope:** The owner-facing **support & content surfaces** of the B2B business app — a **Help & support hub** (searchable FAQ/help articles, contact support, report a problem, "what's new" changelog) and a **Legal** section (Terms, Privacy Policy, platform & fees, data export / account deletion for GDPR). Both hang off the **Profile tab of the Menu hub** (`/app/hub`), not the bottom nav.
> **Explicitly out of scope this pass:** a real support backend / ticket centre (queues, statuses, SLAs, threaded replies), live chat, hosted legal-doc authoring, real geocoded data export, and any B2C (`/c`) help changes — the consumer surface already has its own coral help/legal sheets in `src/app/c/settings/page.tsx` and is not touched here.
> **Source of truth for feedback:** the 16 Jun "TT planning" internal note listed **"FAQs"** and **"Legal"** as remaining sections with little bespoke client feedback; the client sign-off sessions (15 Jun, 2 Jun, 19 May) give the *adjacent* substance (platform fees, GDPR touchpoints in Clients/Messages) that this section must cross-link to. These are standard content/support surfaces, so most calls here are **designer calls** grounded in the researched Mobbin patterns.
> **Design source → design in-app from patterns.** There is no finalised Help/Legal Figma. Build from the meeting feedback + the best-in-class patterns cited below + the existing `@/components/ui` library, and review in the running app — same approach the team plan locked.

---

## What this section is

The **Help, FAQs & Legal** section is the owner's "where do I get answers / where's the legal stuff" surface. It answers the two questions an SMB owner actually asks — *"how do I get paid / why was I charged"* and *"where are the terms and how do I get my data out"* — in a couple of taps, without a support agent. It is a **lightweight content & self-serve hub**, not a feature area: a searchable FAQ, an async contact form, a benefit-led changelog, the legal index, and the owner's own GDPR data controls. It lives under the **Profile tab of `/app/hub`** (the existing "Account" list already has dead `Help & FAQ` and `Legal` rows), keeping daily-job tabs (Home, Schedule, Clients, Sales) uncluttered.

---

## Feedback → source map

| Area | Feedback | Source | Pattern ref (Mobbin) |
|---|---|---|---|
| Section exists | "FAQs" and "Legal" listed as remaining sections; standard content/support surfaces, little bespoke feedback — "make sensible designer calls" | 16 Jun 2026 "TT planning" | — (scope brief) |
| Help IA — lightweight, search-first | A salon owner wants two-tap answers, not a ticket queue; search + a short list of human-labelled categories with article-level feedback | Designer call (16 Jun brief) | [Linktree "Get help" sheet](https://mobbin.com/screens/575ed796-6a15-45f1-88df-4921c80d9f2e) · [WhatsApp Help Center](https://mobbin.com/screens/e9c16649-b873-4acf-a471-b26dd98adcc7) |
| Article feedback + escalation | "Was this helpful?" at the foot of each article; a "No" escalates into the contact form | Designer call | [Linktree FAQ feedback](https://mobbin.com/screens/f84b3753-0571-41f4-a4d9-83287e6458f0) · [HBX "Was this article helpful?"](https://mobbin.com/screens/e9167c62-349c-4330-b3a9-98e50b4ff8ab) |
| Support hours / reply-time up front | Set expectations before showing contact options — unmet expectations are the #1 support complaint | Designer call | [Wealthsimple Support with stated hours](https://mobbin.com/screens/c7bd20b6-875d-4443-b363-604acc255b3f) |
| Contact = single async form | One form (category + subject + description + screenshot) serves both "Contact support" and "Report a problem" | Designer call | [ClassPass Contact Us form](https://mobbin.com/screens/4ef8ae20-09e9-49ed-9e1e-ffdfa79647bd) · [Headspace Submit a request](https://mobbin.com/screens/75ab115c-8d5f-4cb8-81dd-2ba57996f597) |
| Silent diagnostic capture | Auto-attach app version / account id / current screen with a transparency note; don't make the owner type it | Designer call | [Mercedes-Benz "Additional data will be sent"](https://mobbin.com/screens/689058c6-4a6d-48fe-87b0-607fc206247c) |
| "What's new" folded into Help | Changelog lives inside the help hub, not its own nav slot; dated, benefit-led entries, not version-number release notes | Designer call | [Waymo Support + "Check out what's new"](https://mobbin.com/screens/98913455-6f44-4644-97b0-6217abaa5e87) · [Linktree "What's new" feed](https://mobbin.com/screens/dd7bd771-e246-4795-a840-7508068c8b6a) |
| Legal = flat link list | Terms / Privacy / Platform & fees / Acceptable use / Cookie policy as link rows opening hosted web docs; version pinned at the bottom | Designer call | [Squarespace minimal Help](https://mobbin.com/screens/5aa2e9c9-92d5-488e-b34b-6bfe45f2b2d9) · [Messenger Legal & Policies](https://mobbin.com/screens/6db4737a-379c-4ae0-a8db-602b7f9456fd) · [AllTrails Legal+Support+version](https://mobbin.com/screens/c2a192ee-b779-4b52-96bd-195eda53c9b1) |
| GDPR — owner data export | One-button async export, "delivered by email", expectation copy; this is the **owner's** business data | Designer call (GDPR brief); 19 May platform/data context | [Zalando Request/Delete data](https://mobbin.com/screens/b44aa19b-0c87-44f3-b90a-a3ca27e9a927) · [MacroFactor export + delete warning](https://mobbin.com/screens/cbf9218c-64c3-4222-91f3-1c56411c904f) |
| GDPR — account deletion warning | Destructive styling + "deleting does NOT cancel App Store / Play billing" warning + confirm dialog | Designer call | [MacroFactor Data & Privacy](https://mobbin.com/screens/cbf9218c-64c3-4222-91f3-1c56411c904f) · [Instacart "Your Privacy Choices"](https://mobbin.com/screens/7fc193b0-8869-4a7c-92e7-26f6ec5bbfb0) |
| Platform-fee education ties to Payments | The "why was I charged / how platform fees work" answer lives in a Payments help article and cross-links to the Payments section | 19 May "platform fees"; 15 Jun sign-off | [Squarespace Help Center](https://mobbin.com/screens/5aa2e9c9-92d5-488e-b34b-6bfe45f2b2d9) (fee article pattern) |
| No duplication of GDPR controls | Client-data export stays in **Clients**; per-conversation block/delete/archive stays in **Messages** — Help/Legal links out, never re-implements | Designer call (GDPR brief) | [Instacart single privacy-controls row](https://mobbin.com/screens/7fc193b0-8869-4a7c-92e7-26f6ec5bbfb0) |
| Direct-competitor expectation | Fresha (the salon/wellness leader) surfaces "Help and support" under More/Settings, searchable, with attach-screenshot contact; chat is gated to paid tiers → start async | Vertical research | [Fresha pattern](https://mobbin.com/screens/575ed796-6a15-45f1-88df-4921c80d9f2e) (analogous) |

---

## Current state

**Status legend:** ✅ done · 🟡 partial · ❌ missing.

- 🟡 **Entry points exist but are dead.** `src/app/app/hub/page.tsx` — the Profile tab's `accountItems` array already lists `{ key: "help", label: "Help & FAQ", icon: HelpCircle }` and `{ key: "legal", label: "Legal", icon: FileCheck }` (lines 58–59). Both render as `<button>` with **no `href`** — they go nowhere. The hooks for this section are in place; the destinations are not.
- ❌ **No Help/Support route.** `find src/app` shows no `/app/help`, `/app/support`, `/app/faq`, `/app/about`, or `/app/whats-new` directory. The only `settings` routes are `clients/[id]/settings`, `services/[id]/settings`, and the consumer `c/settings` — none is a business help/legal surface.
- ❌ **No Legal route.** Same — nothing under `/app` renders Terms/Privacy/legal links for the business owner.
- ❌ **No help/changelog/version data module.** `src/lib/data` has no `help.ts` / `support.ts` / `legal.ts` / `changelog.ts`. The only "What's new" reference is a single B2C notification string in `product.ts:564` ("ThatTime update … version 3.2", CTA "What's new") — unwired. No app version/build constant exists.
- 🟡 **Consumer (B2C) sibling already shipped — reference, do not reuse styling.** `src/app/c/settings/page.tsx` has a coral help-centre sheet (4 popular topics + chevrons), a "Contact us — we usually reply within a day" textarea sheet, "Terms of service" / "Privacy policy" footer buttons, and a typed-confirmation **delete-account** sheet. This is the *shape* to mirror on the ink B2B surface — but it is coral/consumer and must not be imported or homogenised (CLAUDE.md rule 2).
- ✅ **GDPR cross-link targets already exist.** `src/app/app/clients/[id]/settings/page.tsx` owns **block client** (required reason) and **delete client** ("removes bookings, notes and documents after 30 days"). `src/app/app/messages/[id]/page.tsx` owns conversation **archive**. So the client-data and per-conversation controls the brief says *not* to duplicate are genuinely live — Help/Legal need only link to them.
- ✅ **Component library is sufficient.** `SettingsGroup`, `ListRow`, `Card`, `Field`, `Textarea`, `Input`, `BackHeader`, `EmptyState`, `Sheet`/`BottomSheet`, `PermissionDialog`, `Toaster`/`toast`, `SegmentedControl`, `StarRating` are all exported from `src/components/ui/index.ts`. No new primitive is needed — this section is pure composition.

**Net:** the section is **entry-points-only**. Two dead rows in the hub, zero screens, zero data. A clean greenfield build behind existing hooks.

---

## Recommended UX calls

As the designer, the brief is "lightweight, sensible defaults". Opinionated calls:

1. **One Help destination, no new nav tab.** `[ASSUMPTION]` Wire both hub rows into a single route tree: `Help & FAQ` → `/app/help`, `Legal` → `/app/legal`. No bottom-nav slot — daily-job tabs stay for calendar/clients/sales (anti-pattern: don't give Help/Legal/What's-new their own tabs).
2. **Async form only for v1; no live chat.** `[ASSUMPTION]` Even Fresha gates chat to paid tiers. Ship a single async contact form + an honest "we reply within {X} working hours" line. An idle "Live chat" button is worse than no chat. Chat is a V2 item below. *(The in-app channel — chat vs email vs form — is the one real open question; see Open questions.)*
3. **Reuse one form for "Contact support" and "Report a problem".** `[ASSUMPTION]` Same screen; "Report a problem" arrives with the **Bug** category pre-selected, and is also reachable from error/empty states across the app. Article escalation pre-fills the article's category. One form, three entry points.
4. **Hosted legal docs, never a bespoke reader.** `[ASSUMPTION]` Legal rows open hosted web URLs (in the prototype: an in-frame "doc viewer" stub showing placeholder policy text, since there's no real browser sandbox). Legal text changes independently of app releases — never compile it into the bundle.
5. **"What's new" lives in the Help footer, dated and benefit-led.** `[ASSUMPTION]` Folded into the hub footer with an optional unread dot. Entries read "Faster checkout & client-merge tools" — never "v3.2 — refactored booking service".
6. **GDPR self-serve = owner's data only.** `[ASSUMPTION]` "Your data & privacy" exports the **owner's business data** and deletes the **owner's account**. Client-list export is cross-linked to Clients; message block/delete/archive is cross-linked to Messages. No duplication.
7. **Account-deletion-vs-billing warning is mandatory copy.** A salon owner who deletes the account while still being charged via the App Store is a trust disaster — the consequence copy and confirm dialog are non-negotiable (MacroFactor lesson).
8. **Show app version + build as muted read-only text** at the foot of both Help and Legal — the near-universal support-diagnostic convention (AllTrails / Patreon). `[ASSUMPTION]` Source it from a single SSR-safe constant (no runtime clock/build lookup at module top level).
9. **Tie platform-fee education to Payments.** `[ASSUMPTION]` A "Payments & payouts" help category contains a "How platform fees work" article whose footer deep-links to the Payments section — the brief's explicit fee-education hook.
10. **Ink/navy only.** Compose entirely from `@/components/ui` semantic tokens; the consumer coral sheets are a structural reference, not an import (CLAUDE.md rules 1 & 2).

---

## Phase 1 — Wire the entry points + Help hub shell

**Goal:** Turn the two dead hub rows into real destinations and stand up the searchable Help hub shell with seeded categories — the backbone everything else hangs off.

**Flow:**
1. **Menu → Profile tab → Account** (`/app/hub`): `Help & FAQ` and `Legal` rows now navigate (give them `href: "/app/help"` and `href: "/app/legal"`).
2. **Help hub** (`/app/help`, `BackHeader` "Help & support"): pinned search `Input` "Search help articles…" at the top.
3. Below search: **4–6 category `ListRow`s** with title + one-line helper text + chevron — *Getting started · Bookings & calendar · Payments & payouts · Clients & messages · Your account & plan* (mirrors the Linktree category list).
4. **"Still need help?" `SettingsGroup`** below categories: a one-line support-hours / expected-reply note *above* (Wealthsimple), then `Contact support` and `Report a problem` rows.
5. **Footer:** `What's new` row (opens changelog) + muted app version/build line (AllTrails/Patreon).

**Changes:**
- `src/app/app/hub/page.tsx` — add `href` to the `help` and `legal` `accountItems` entries (lines 58–59).
- `src/app/app/help/page.tsx` — **new** hub screen (search `Input` + category `ListRow`s + "Still need help?" `SettingsGroup` + footer).
- `src/lib/data/help.ts` — **new** single source of truth: `helpCategories`, `helpArticles`, `SUPPORT_HOURS`/`SUPPORT_REPLY_SLA` copy, `APP_VERSION`/`APP_BUILD` constants (static, SSR-safe).
- `smoke.tsx` — add a `HelpHub` needle (renders the hub with seeded categories).

**Data:** new `help.ts` types — `HelpCategory { id; label; helper; articleIds }`, `HelpArticle { id; categoryId; title; body; steps?; relatedId?; payments?: boolean }`. No store yet (read-only seed).

**Risk:** low — composition + routing only.

---

## Phase 2 — Search → article → "was this helpful?" → escalate

**Goal:** Make the categories and search lead to real articles with article-level feedback and a clean escalation path into support.

**Flow:**
1. From the hub, **tap search**, type a query → simple results list of article titles (`ListRow`s); or tap a **category** → that category's article list.
2. Tap a result → **Article detail** (`/app/help/[articleId]`, `BackHeader`): title, body copy, optional inline numbered steps.
3. For a **Payments** article, render a "How platform fees work" explainer `Card` whose CTA deep-links to the Payments section (ties fee education to Help, per brief).
4. **Bottom of article: "Was this helpful?"** Yes/No (or 3-emoji) feedback control (Linktree/HBX). An "Up next" related-article link sits above it.
5. If **No** (or below feedback): a **"Contact support"** CTA that opens the support form with this article's category pre-filled.

**Changes:**
- `src/app/app/help/[articleId]/page.tsx` — **new** article reader (body + steps + optional fee `Card` + "Was this helpful?" + escalate CTA).
- `src/app/app/help/page.tsx` — wire search input to filter `helpArticles`; category rows link into the article list.
- `src/lib/store/helpStore.ts` — **new** session-local Zustand: `articleFeedback: Record<articleId, "yes"|"no">`, `markHelpful(id, val)`. (Mirrors the offers/team store pattern; no backend.)
- `smoke.tsx` — add a `HelpArticle` needle.

**Data:** `helpStore` adds `articleFeedback`. `HelpArticle.payments?: boolean` (set in Phase 1's seed) drives the fee block.

**Risk:** low–medium — a feedback store + a search filter; both small.

---

## Phase 3 — Contact support / Report a problem (async form)

**Goal:** A single async form serving Contact support, Report a problem, and article escalation, with silent diagnostic capture.

**Flow:**
1. **Entry:** hub "Contact support", any article's escalation CTA, or an app-wide error/empty state "Report a problem".
2. **Form** (`/app/help/contact`, `BackHeader`): category dropdown "What do you need help with?" (`Field` + select). **Pre-selected** when arriving from an article (article's category) or from "Report a problem" (= Bug).
3. **Subject** (`Input`) + **Description** (`Textarea`) with helper text inviting detail and screenshots (ClassPass copy: *"The more detail you provide, the more helpful we can be — feel free to include screenshots."*).
4. **Attachment picker** ("Add screenshot") — explicitly offered.
5. **Silent diagnostic context** auto-attached, shown as a muted transparency note: *"We'll include your app version, business ID and the screen you were on."* (Mercedes pattern) — never a field the owner types.
6. **Submit** → success `toast` + confirmation screen: *"We'll reply to {email} within {X} working hours."* No ticket list in v1 (no backend) — "My requests" deferred.

**Changes:**
- `src/app/app/help/contact/page.tsx` — **new** form screen (`Field`/`Input`/`Textarea` + category select + attach stub + transparency note + submit `toast`).
- `src/app/app/help/contact/done/page.tsx` — **new** confirmation screen (or an in-page success state).
- `src/lib/data/help.ts` — add `SUPPORT_CATEGORIES` (Getting started / Bookings / Payments / Clients & messages / Account & plan / **Bug**) and the reply-SLA / support-email constants.
- Wire the article escalation CTA (Phase 2) and "Report a problem" entries to `?category=` query param.
- `smoke.tsx` — add a `SupportForm` needle (default + Bug-preselected via prop override, per the store-smoke memory).

**Data:** no persisted model in v1 (form is fire-and-forget + toast). The query param drives the pre-selected category. *(If Q1 resolves to a backend, add `SupportRequest` + a `helpStore` request list — see V2.)*

**Risk:** low — one form, reused; the only nuance is the pre-fill query param and the attach stub.

---

## Phase 4 — Legal index + hosted-doc rows

**Goal:** A flat, restrained Legal index — link rows that open hosted web docs — with the version pinned at the bottom and a single privacy/data-controls entry.

**Flow:**
1. **Entry:** the now-live `Legal` row in the hub Account list → `/app/legal`.
2. **Legal index** (`BackHeader` "Legal", `SettingsGroup`s): flat `ListRow` links — *Terms of Service · Privacy Policy · Platform & fees · Acceptable use · Cookie policy* (only those that exist).
3. Each row opens the **hosted web doc** (prototype: an in-frame doc-viewer stub with placeholder policy text + a "View online" note; production swaps in the real hosted URL).
4. A separate row: **"Privacy choices / Manage your data"** → deep-links to the data-controls screen (Phase 5).
5. **Pin app version/build** in muted text at the bottom (matches the Help footer).

**Changes:**
- `src/app/app/legal/page.tsx` — **new** Legal index (`SettingsGroup` + `ListRow`s + version footer).
- `src/app/app/legal/[docId]/page.tsx` — **new** hosted-doc viewer stub (`BackHeader` + placeholder body + "View online" affordance).
- `src/lib/data/help.ts` (or a sibling `legal` export) — `legalDocs: { id; label; url }[]`.
- `smoke.tsx` — add a `LegalIndex` needle.

**Data:** `legalDocs` seed list. No store. Version constants reused from Phase 1.

**Risk:** low — flat list + a stub viewer.

---

## Phase 5 — Your data & privacy (GDPR self-serve)

**Goal:** The owner's own GDPR controls — export your data, delete your account — with expectation-setting and the billing warning. Cross-links out for everything that lives elsewhere.

**Flow:**
1. **Entry** from Legal ("Privacy choices / Manage your data") and/or Account settings → `/app/legal/data`.
2. **Data & privacy** (`BackHeader`): short prose intro linking to Privacy Policy.
3. **"Export your data" `Card`:** explains what the export contains and sets expectation — *"Delivered by email, usually within minutes, up to 30 days."* Single **"Request data export"** button → success `toast` + emailed-receipt note (Zalando/MacroFactor). Muted note: *this is your business data — to export a client list, go to Clients; to manage a conversation, go to Messages* (cross-link, don't duplicate).
4. **"Delete account" `Card`:** destructive styling, clear consequence copy, and the warning *"Deleting your account does NOT cancel your App Store / Google Play subscription — cancel that separately to stop being charged."* (MacroFactor lesson). A `PermissionDialog` (or typed-confirmation, mirroring the B2C delete sheet) gates the irreversible action.
5. Both actions confirm via `toast` + an emailed-receipt note.

**Changes:**
- `src/app/app/legal/data/page.tsx` — **new** data & privacy screen (`Card` export + `Card` delete + `PermissionDialog` + cross-link rows to `/app/clients` and `/app/messages`).
- `src/lib/data/help.ts` — export-contents / SLA copy constants.
- `smoke.tsx` — add a `DataPrivacy` needle.

**Data:** no persisted model — both actions are prototype-level (`toast` + receipt copy). No new store.

**Risk:** low–medium — the destructive confirm + the precise billing-warning copy carry the trust weight; logic is trivial.

---

## Phase 6 — "What's new" changelog

**Goal:** A dated, benefit-led changelog folded into the Help hub footer — read-only, lightweight, with deep links into features.

**Flow:**
1. **Entry:** "What's new" row in the Help hub footer; optional unread dot when an entry has shipped since last open.
2. **Changelog** (`/app/help/whats-new`, `BackHeader`): reverse-chronological feed of dated entries.
3. **Each entry:** date + benefit-led plain-language headline + 1–2 lines of body, optional emoji/`Tag`, and a deep-link **"Try it"** into the relevant feature (Linktree). No version-number-led tone.
4. No per-entry gating; read-only and lightweight.

**Changes:**
- `src/app/app/help/whats-new/page.tsx` — **new** changelog feed.
- `src/lib/data/help.ts` — `changelog: { id; date; emoji?; headline; body; deepLink? }[]` (static dates as strings — **never** an argless `new Date()` at module top, per CLAUDE.md SSR rule).
- `src/lib/store/helpStore.ts` — add `lastSeenChangelog?: string` + `markChangelogSeen()` to drive the unread dot.
- Retire/repoint the orphan `product.ts:564` "What's new" B2C notification CTA if it should deep-link here (note only — B2C is out of scope this pass).
- `smoke.tsx` — add a `WhatsNew` needle.

**Data:** `changelog` seed (string dates). `helpStore.lastSeenChangelog`.

**Risk:** low.

---

## V2 / deferred

Everything below is parked but covered, with a recommended direction:

- **Live chat (staffed).** Add a "Live chat" channel *only when it can be staffed* — recommended direction: gate it to paid plans behind the stated hours, exactly as Fresha does, so the button is never idle. Until then the async form stands. (Anti-pattern: don't ship an idle chat button.)
- **"My requests" ticket list.** A lightweight read-only list of submitted requests with status — recommended direction: build only once a real support backend exists; v1's form is fire-and-forget. Reuses `helpStore` with a `SupportRequest[]`.
- **Real hosted legal docs + in-app browser.** Swap the Phase 4 stub viewer for actual hosted URLs opened in an SFSafariViewController-style in-app browser; keep the legal text out of the bundle so it can change independently.
- **Real data-export pipeline.** Replace the Phase 5 `toast` with a genuine async export + emailed file; recommended direction: align with the platform/Stripe data work the meetings route to a dedicated session.
- **Contextual help / deep links from screens.** A "?" affordance on complex screens (variants, pay models) that deep-links straight to the relevant article — recommended direction: add after the article corpus is seeded, reusing the `?category=` / `articleId` routing from Phases 2–3.
- **Unread-dot service for changelog.** Promote `lastSeenChangelog` into a small badge on the hub's `Help & FAQ` row so owners notice new releases without opening Help.
- **B2C parity pass.** Reconcile the existing coral `/c/settings` help/legal/contact/delete sheets with this B2B model (shared copy/SLA constants, distinct styling) — explicitly out of scope this pass, flagged so the two surfaces stay structurally aligned without homogenising.

---

## Suggested order & rationale

`1 (entry points + hub shell) → 2 (search/article/feedback) → 3 (contact form) → 4 (legal index) → 5 (data & privacy) → 6 (what's new)`

Phase 1 first because the two dead hub rows are the only existing hooks — wiring them and standing up the hub shell unblocks every later screen, and it's the smallest credible slice (the Squarespace "three rows is enough" proof). Phases 2–3 complete the **support** half (articles → feedback → escalate → form) as one coherent journey. Phases 4–5 are the **legal/GDPR** half and are independent of support, so they can run in parallel if needed; 5 follows 4 because the data-controls screen is reached *from* the Legal index. Phase 6 (changelog) is last and fully self-contained — pure content. Each phase ends green on `npx tsc --noEmit && npx next lint && npm run smoke`, and every new screen ships a smoke needle for its empty/setup state. Persistence stays session-local Zustand (`helpStore`), consistent with the rest of the app.

---

## Cross-cutting data-model changes

New, additive, all in a single new source of truth `src/lib/data/help.ts` (+ a new `src/lib/store/helpStore.ts`) — nothing existing is mutated, so all 23 seed offers / 11 seed members keep rendering:

- `HelpCategory { id; label; helper; articleIds }` (Phase 1)
- `HelpArticle { id; categoryId; title; body; steps?; relatedId?; payments?: boolean }` (Phase 1–2)
- `SUPPORT_CATEGORIES`, `SUPPORT_HOURS`, `SUPPORT_REPLY_SLA`, `SUPPORT_EMAIL` copy constants (Phase 1–3)
- `APP_VERSION`, `APP_BUILD` static constants — SSR-safe, no runtime clock/build lookup at module top level (Phase 1)
- `legalDocs: { id; label; url }[]` (Phase 4)
- `DATA_EXPORT_COPY` / `ACCOUNT_DELETE_WARNING` constants (Phase 5)
- `changelog: { id; date: string; emoji?; headline; body; deepLink? }[]` — **string** dates only (Phase 6)
- **`helpStore`** (new Zustand): `articleFeedback: Record<string, "yes"|"no">`, `markHelpful(id, val)`, `lastSeenChangelog?: string`, `markChangelogSeen()` (Phases 2 & 6)

All optional / read-only / back-compatible. No change to `DemoOffer`, `Staff`, or any existing store.

---

## Open questions for the user

1. **In-app support channel — chat vs email vs form?** The one real decision the brief flags. Recommended: **async form now, live chat (paid-tier-gated) as V2** — but confirm whether there's any human support to staff a chat, or whether support is purely email/form. This gates whether Phase 3's confirmation promises a reply at all.
2. **Support reply-time SLA + hours to publish.** What numbers do we commit to? ("Mon–Fri 9–5, reply within 1 working day"?) The exact `SUPPORT_HOURS` / `SUPPORT_REPLY_SLA` copy must be theirs, not invented.
3. **Which legal docs actually exist?** Terms + Privacy are certain; confirm whether "Platform & fees", "Acceptable use", and "Cookie policy" exist as separate hosted docs or should be combined (Squarespace combines Terms + Privacy into one row). And the hosted URLs.
4. **Data-export contents + delivery promise.** What exactly does the owner's export contain, and is "by email, up to 30 days" the right expectation, or is there a faster real pipeline planned?
5. **Account deletion in the prototype.** Should the prototype's "Delete account" actually clear session state / route to login (like the B2C typed-confirmation sheet), or stay a no-op with a confirmation toast? Confirms how far Phase 5 goes.
6. **Help-article corpus ownership.** Who writes the seed FAQ articles, and roughly how many categories/articles for v1? The 5 categories proposed are a designer default — confirm the labels match how the client thinks about their product (esp. "Payments & payouts" vs "Getting paid").
