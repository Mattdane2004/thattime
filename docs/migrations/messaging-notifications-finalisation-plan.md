# Messaging & Notifications — Finalisation Plan

> **Status:** Plan only — no implementation until the open questions below are resolved.
> **Scope:** The B2B **Messages** surface (`/app/messages` list + `/app/messages/[id]` thread), the **notification PREFERENCES** screen (which events notify, on which channel), and the **seam** between the three notification systems — the activity FEED (built), Marketing-authored PRESETS (consumed by Services), and MESSAGES. This is the business app (ink/navy).
> **Explicitly out of scope this pass:** the consumer (`/c`) side of broadcast/announcements beyond the read-only render note; the Marketing campaigns/automations product itself (presets are *consumed* here, *authored* there); real payment rails (the payment link stays a session-local status card, not Stripe); in-chat AI and in-chat card-present payments (stakeholder flagged Sendbird AI / in-chat payments as **future** on 15 Jun); a real chat backend (persistence stays session-local Zustand). Read-receipts/typing indicators are V2.
> **Source of truth for feedback:** Granola sessions with Shabbir & Vishal — **"that time sign off" (15 Jun)** is the spine; **(2 Jun)** for the Fresha-urgency framing; **(16 Jun internal)** for prioritisation. ⚠️ As with the team plan, the Granola natural-language query under-returns the messaging feedback — read the raw 15 Jun notes.
> **Design source:** design in-app from the feedback + the researched patterns below (Mobbin URLs cited per row); there is no finalised messaging Figma to match this pass.

---

## What this section is

Messaging & notifications is how the salon stays in contact with clients and with itself, and how the app tells the owner something happened. It sits in the business hub between **Schedule** (what's booked) and **Marketing** (bulk outreach). Three distinct systems live here and must stay distinct: the **notification FEED** (a read-only activity log — already built at `/app/notifications` and `/app/alerts`), **notification PRESETS** (the templated booking-stage messages, *authored* in Marketing and *consumed* per-service in Services), and **MESSAGES** (two-way 1:1 client/business threads + one-way class broadcast threads). The headline of this pass — straight from Fresha-Connect envy — is that a client thread is never a free-floating DM: it is anchored to a client + booking, and the composer is where business actions (new appointment, reschedule, **payment link**, files) happen.

---

## Feedback → source map

| Area | Feedback | Source | Pattern ref |
|---|---|---|---|
| Composer — media | Send images, videos and files in chat | 15 Jun | [Telegram +sheet](https://mobbin.com/screens/56cff18a-985d-4572-8b83-df9fa5e318ec) · [Signal tray](https://mobbin.com/screens/a4459f62-2908-45c8-ab6b-2a4202c44bc6) |
| Composer — reworked "+" | One "+" surfaces: new appointment, reschedule, **payment link**, send files/images | 15 Jun | [Signal tray](https://mobbin.com/screens/a4459f62-2908-45c8-ab6b-2a4202c44bc6) · [Telegram +sheet](https://mobbin.com/screens/56cff18a-985d-4572-8b83-df9fa5e318ec) · [BFF popover](https://mobbin.com/screens/db352f6d-4d7d-41f1-a678-e66ee043da83) |
| Payment link | Generate a payment link in chat | 15 Jun | [GlossGenius→card] · [Thumbtack inline card](https://mobbin.com/screens/70de4e27-263e-4339-96d5-9c6fc7d35f01) · [Google Pay card](https://mobbin.com/screens/acb1301f-d514-4eca-be19-4a27c716398c) · [Revolut request](https://mobbin.com/screens/61bcf714-aee0-4d67-941f-8a027c14a9a2) |
| Booking context | Every thread anchored to a client + booking (don't build a generic messenger) | 15 Jun (Fresha north-star) | [Airtasker context card](https://mobbin.com/screens/4adf7c8c-8b04-46a1-9c1e-ef38692340d9) |
| GDPR / privacy | Block, delete, archive a chat | 15 Jun | [Gmail conv. options](https://mobbin.com/screens/3547c833-2f56-4d67-8b56-473801cb908c) · [Messenger split](https://mobbin.com/screens/a9bf7683-7df9-4a0a-9a05-014954e5bd6f) |
| Group chats — restriction | Restrict group-chat creation to **classes only** — no arbitrary vendor groups (would bypass paid Marketing bulk-send) | 15 Jun | [WhatsApp channel primer](https://mobbin.com/screens/9e309b6a-eb1d-4668-993b-313a385449a2) |
| Class auto-thread | A class auto-creates a group chat; auto-archive once the class finishes | 15 Jun | [Airtasker closed state](https://mobbin.com/screens/0f28ccab-baaa-46af-984f-942afa438c6e) |
| Compose mode | Class thread = Group conversation **vs** one-way Broadcast/announcement | 15 Jun | [Remind chooser](https://mobbin.com/screens/d1a7eed8-1f69-4c1a-8c81-440668ae3b9e) · [Remind compose](https://mobbin.com/screens/0d1688cb-9507-4ec9-ae7f-14b7dee05178) |
| Broadcast render (client) | One-way channel: clients see history + can react, cannot reply | 15 Jun | [IRL read-only composer](https://mobbin.com/screens/e3968b7a-fafa-4712-a423-94cccad58b1f) · [Remind announcement thread](https://mobbin.com/screens/1d6b78e3-ffd7-4fa6-abc3-34b6915584dc) |
| Broadcast badging | A broadcast channel is categorically different from a 1:1 chat | 15 Jun | [WhatsApp channel badge](https://mobbin.com/screens/f987e825-5d13-41a3-943a-d89361ad57f5) |
| Chat infra | Look at Sendbird for chat infra (in-chat payments + AI = **future**) | 15 Jun | — (future) |
| Notification PREFERENCES | Which events notify, and per channel (push / email / SMS) | 15 Jun, 2 Jun | [Lightyear grouped prefs](https://mobbin.com/screens/71f636de-878c-4997-864e-605424de7d18) · [Starling triple-toggle](https://mobbin.com/screens/52935e4d-59c1-491d-a955-e2d92c21377e) |
| Preset/feed/messages seam | Presets authored in Marketing, consumed by Services; feed already built | 15 Jun, 2 Jun | [monday.com feed filters](https://mobbin.com/screens/b4195096-be59-4c5f-9dca-2d32d4bf7812) · [Todoist grouped feed](https://mobbin.com/screens/2df786f8-8d7a-408c-98f0-02ac3e4eb546) |
| Urgency | Fresha shipping live-chat created urgency to ship messaging | 2 Jun | — |

---

## Current state

**Status legend:** ✅ done · 🟡 partial · ❌ missing. All paths absolute-from-repo-root.

- ✅ **Messages list** — `src/app/app/messages/page.tsx`. Search, filters (All / Unread / Clients / Team & business), Client vs Team-&-business sectioning, group/class avatar stacks, unread dot + count, archived rows dimmed with an **"Ended"** badge. Compose (`PenSquare`) opens a 1:1-only picker (clients + team) with the explicit guard copy *"Group chats are created automatically for each class — they can't be started here."* — the **anti-arbitrary-group rule is already enforced in the UI.**
- 🟡 **Conversation thread** — `src/app/app/messages/[id]/page.tsx`. Renders four shapes (client / group / class / business) from one screen. Already built: pinned **Upcoming Appointment** card with in-thread Cancel/Reschedule; the reworked single **"+"** sheet split into **Send** (Photo / Video / File tiles) and **Actions** (New appointment / Reschedule / **Send payment link** / Log payment, client-only); a **payment card** bubble; staged pending-attachment chips; a class context banner (`Megaphone` active / `Archive` ended); read-only composer for archived class chats ("This conversation is archived"). **Gaps:** the payment card is static (`disabled` "Pay now", always "Awaiting payment" — no Requested→Viewed→Paid progression); there is **no conversation-options / overflow menu**, so no **Mute / Pin / Mark unread / View shared media / Archive / Block / Delete** (the entire GDPR ask, 15 Jun); there is no **compose-mode chooser** for class threads (Group vs Broadcast) — class threads currently behave as group threads only; the broadcast read-only-with-reactions render does not exist; all thread state is local React (no store), and conversation data is **static** in `src/lib/data/product.ts`.
- 🟡 **Messaging data** — `src/lib/data/product.ts` exports `type Conversation` (`kind: "client"|"group"|"business"|"class"`, `members`, `archived`, `unread`, `sub`), the `conversations[]` seed, `clientRows`, `teamColumns`, `contactFor`. **No `useMessagesStore`** — there is no store for conversations, no block/archive/delete/mute actions, no payment-status model, no broadcast flag, no class link (a class thread is not connected to a real class/offer record).
- ✅ **Notification FEED** — `src/app/app/notifications/page.tsx` (grouped feed, message-request accept/decline, swipe-to-delete, filters All/Appointments/Messages/Reviews/Favourites) and `src/app/app/alerts/page.tsx` (a second, simpler activity feed from `src/lib/data/alerts.ts`). **Two overlapping feeds exist** — a seam to rationalise. Hub "Notifications" bell → `/app/notifications`; hub profile "Notifications" row → `/app/alerts`.
- ✅ **Service-level notification PRESETS (consumption)** — `src/app/app/services/[id]/notifications/page.tsx`. Per booking-stage (Booking confirmation / Reminder / Second reminder / Follow-up) channel toggles (Email / SMS / Push) with an **Inherited (business default) vs Custom** badge and reset-to-default. Persists to `offer.notifications: NotifStage[]` (`src/lib/data/offers.ts`). **Gap:** there is no actual **Marketing-authored preset** to inherit *from* — `inherited` points at a hardcoded `DEFAULT_STAGES`, and the Marketing hub (`src/app/app/marketing/page.tsx`) destinations are all inert. The "presets authored in Marketing, consumed in Services" seam is asserted but not wired.
- ❌ **Notification PREFERENCES (B2B)** — there is **no** owner-facing preferences screen. The hub profile has an inert **"Preferences"** row (`src/app/app/hub/page.tsx`). The only preferences screen in the app is **consumer-side** at `src/app/c/settings/notifications/page.tsx` (single toggles per event + 3 channel masters + quiet hours — a useful pattern reference, but coral and not per-event-per-channel).
- ✅ **Smoke needles** — `smoke.tsx` covers Messages list, Conversation thread, Alerts feed, and the service Notifications module. New empty/setup states added below each need a needle.

---

## Recommended UX calls

As the designer, reducing owner cognitive load, my opinionated calls:

1. **Promote the existing static thread to a store, don't rebuild it.** [ASSUMPTION] The thread screen is already ~70% of the headline ask. The right move is a new `useMessagesStore` that owns conversations + bubbles + payment status + management flags, and re-pointing the screen at it — not a from-scratch rebuild. This unlocks block/archive/delete and live payment status with minimal UI churn.
2. **One "Conversation options" sheet, Gmail/Messenger-split.** [ASSUMPTION] Everyday actions (Mute, Pin, Mark unread, View shared media, Search) up top; a visually separated **destructive zone** in `text-danger` (Archive, Block, Delete) each behind a confirm dialog. Never put Block adjacent to Mute. This is the whole GDPR ask in one screen.
3. **Payment link = status card, never a bare URL.** [ASSUMPTION] Keep the existing card; add a `status` (`requested → viewed → paid`) and let the owner pick a **reason** (Deposit / Balance / Full) pre-filled from the linked booking. A demo "mark as paid" affordance drives the state for the prototype (no rails).
4. **Class threads get a compose-mode chooser, Remind-style.** [ASSUMPTION] On a class thread, sending first asks **Group conversation** ("everyone sees replies") vs **Broadcast** ("one-way — clients can't reply"), with the plain-English subtitles that are the UX win. Broadcast is the default for class *updates*; Group for *discussion*.
5. **Broadcast is a property of the thread, enforced server-of-record-side.** [ASSUMPTION] A thread carries `broadcast: boolean`. When true, the client render is read-only-with-reactions; **replies are blocked** so a class broadcast can never become the banned free bulk-messaging back-channel.
6. **Notification PREFERENCES live in the hub, not buried in Marketing.** [ASSUMPTION] Wire the inert hub "Preferences" → a new `/app/settings/notifications`. Events **grouped by domain** (Bookings / Payments / Messages / Marketing), Lightyear-style; reserve the Starling **3-channel toggle (Push/Email/SMS)** for events where channel genuinely matters (booking reminder), and a single switch elsewhere. A persistent **"service messages are always sent"** footnote.
7. **Keep ONE feed; fold `/app/alerts` into `/app/notifications`.** [OPEN — needs user decision] Two activity feeds is a porting artefact. Recommend `/app/notifications` is the canonical feed and `/app/alerts` redirects (or is retired). The feed is *built* per the brief, so this is a tidy-up, not a rebuild.
8. **Defer Sendbird AI + in-chat card-present payments.** Locked by the stakeholder as future. Ship link + attachments + management first.

---

## Phase 1 — Messages store + conversation options (GDPR controls)

**Goal:** Move conversations off static data into a store, and add the **Block / Delete / Archive / Mute / Pin** controls the client asked for (15 Jun) behind a single Gmail/Messenger-style options sheet.

**Flow:**
1. Owner opens a thread (`/app/messages/[id]`) and taps a new **overflow (⋯)** in the header.
2. **Conversation options** sheet opens — everyday cluster first: *Mute notifications*, *Pin to top*, *Mark as unread*, *View shared media & files*, *Search in conversation*.
3. A visually separated **Privacy & data** section (red, `text-danger`): *Archive chat*, *Block client*, *Delete chat*.
4. Tapping **Block** or **Delete** shows a confirm dialog explaining the consequence ("Deleting removes this conversation and its attachments for you").
5. On Archive, the thread moves behind an **Archived** filter on the inbox; on Block, the composer is replaced with a closed state ("You can no longer message this client"); on Delete, the thread is removed and the inbox returns.
6. Inbox gains an **Archived** filter alongside All / Unread / Clients / Team & business / **Classes**.

**Changes:**
- Add `src/lib/store/messagesStore.ts` — owns `conversations`, derived helpers, and actions `muteConversation`, `pinConversation`, `markUnread`, `archiveConversation`, `blockConversation`, `deleteConversation`. Seed from the existing `conversations[]` (move the seed, keep the export for back-compat).
- `src/app/app/messages/[id]/page.tsx` — add the header `⋯` + a `Sheet` "Conversation options" (Messenger split: "More actions" / "Privacy & support"), confirm dialogs, and a Blocked composer state mirroring the existing Archived state.
- `src/app/app/messages/page.tsx` — read the store; add the **Archived** and **Classes** filter chips; render muted/pinned/blocked treatments.
- Smoke: needle for the options sheet ("Conversation options", "Block client", "Archive chat") and the Archived filter.

**Data:** `Conversation` gains `muted?: boolean`, `pinned?: boolean`, `blocked?: boolean` (all optional, default falsey so the 9 seed convos keep rendering). `archived` already exists.

**Risk:** medium — first store for messaging; the destructive actions need confirm dialogs and careful copy (GDPR-sensitive). Anti-pattern guard: Block/Delete must never sit next to Mute without separation + confirm.

---

## Phase 2 — Payment link as a live status card

**Goal:** Upgrade the existing static payment bubble to a first-class **status card** (Requested → Viewed → Paid) with an explicit **reason** (Deposit / Balance / Full), pre-filled from the linked booking — the GlossGenius / Thumbtack pattern.

**Flow:**
1. In a client thread, **"+" → Send payment link** (already exists).
2. Sheet: pick **what's owed** — *Deposit* / *Balance* / *Full amount* (pre-filled from the linked booking where one exists), edit the amount, add an optional note. (Today the sheet captures amount + free-text "For" only.)
3. **Send** — a payment card posts showing amount, reason, status **Requested**.
4. The card live-updates: **Viewed** (client opened the link), then **Paid · <time>**; owner gets a **Payment** notification in the feed.
5. For the prototype, a discreet **"Mark as paid"** affordance on the card (owner-side demo control) drives the state — no real rails.

**Changes:**
- `src/app/app/messages/[id]/page.tsx` — extend the `payment` bubble to render `status`; replace the always-disabled "Pay now"/"Awaiting payment" with the state machine + demo "Mark as paid". Add the Deposit/Balance/Full segmented control to the send-payment sheet, pre-filled from the booking on the pinned card.
- `src/lib/store/messagesStore.ts` — `sendPaymentLink({ amount, reason })` and `markPaymentPaid(bubbleId)` actions; payment bubbles live in the store so status persists across the session.
- Feed: emit a Payment notification on paid (ties into Phase 5 categories).
- Smoke: needle for a payment card showing "Requested" and the Deposit/Balance/Full chooser.

**Data:** new `PaymentRequest { id; amount; reason: "deposit"|"balance"|"full"; note?; status: "requested"|"viewed"|"paid"; sentAt; paidAt? }` on the message bubble model. Reason pre-fill reads the linked booking's deposit/balance where present.

**Risk:** low–medium — contained to the thread + store; the state machine is simple. Anti-pattern guard: never a bare URL; always a structured, status-trackable card.

---

## Phase 3 — Class threads: compose-mode chooser + broadcast

**Goal:** Make class threads first-class: a **Group vs Broadcast** compose chooser (Remind), the one-way **broadcast** render, and the auto-create / auto-archive lifecycle tied to a real class. The hard constraint — **classes are the ONLY way a group thread exists** — is already enforced in compose; this phase makes the *inside* of a class thread correct.

**Flow:**
1. Owner publishes a class with a roster → the app **auto-creates** a class thread (no manual "create group" entry point exists anywhere — confirmed in the inbox compose copy).
2. Thread header is **badged as a Class group** (distinct from a 1:1) and shows participant count + class date/time (Airtasker-style context).
3. On compose, the owner picks the mode — **Group conversation** ("clients see all replies") or **Broadcast / announcement** ("one-way — clients can't reply") — Remind's plain-English subtitles.
4. **Group** → sender-labelled bubbles, everyone replies. **Broadcast** → fans out to every roster member's chosen channels; on the **client side** the thread renders read-only: full history + emoji reactions, composer replaced with *"Announcements only — you'll get updates here"* (IRL).
5. When the class end time passes, the thread **auto-archives** — moves to the Archived filter, composer reads *"This class has ended"*, history stays readable (already partially built via `archived`).
6. The owner can manually reopen/extend only while the class is live.

**Changes:**
- `src/app/app/messages/[id]/page.tsx` — add the compose-mode chooser (`Sheet`, two large tiles with subtitles) gating the class composer; render the broadcast badge in the header; add the broadcast read-only-with-reactions state (the client-side render — surfaced here for design review even though clients live in `/c`).
- `src/lib/store/messagesStore.ts` — class threads carry `classId` + `broadcast` + `composeMode`; an action to create a class thread from a roster (called when a class publishes) and to auto-archive past end time (computed against an injected `now`, **not** a render-time `new Date()` — SSR rule).
- `src/lib/data/product.ts` / class data — link the two seeded class convos (`cls-colour`, `cls-bridal`) to their offer/class records.
- Smoke: needle for the Group-vs-Broadcast chooser ("Group conversation", "Broadcast", "clients can't reply") and the broadcast read-only state ("Announcements only").

**Data:** `Conversation` gains `classId?: string`, `broadcast?: boolean`, `composeMode?: "group" | "broadcast"`. Auto-archive derives from the class end time (not stored).

**Risk:** medium — the broadcast/reply-block invariant is load-bearing (anti-pattern: a broadcast that accepts replies silently becomes the banned bulk back-channel). The lifecycle (auto-create/auto-archive) must be SSR-safe.

---

## Phase 4 — Notification PREFERENCES (events × channels)

**Goal:** Build the missing B2B owner-facing **preferences** screen — which events notify the owner, and on which channel — grouped by domain (Lightyear) with per-event 3-channel toggles where it matters (Starling) and an always-on service-messages footnote.

**Flow:**
1. Hub → profile → **Preferences** (today inert) → **Notifications** (or hub bell → settings cog → Notifications).
2. Events **grouped by domain**, each row with a one-line description:
   - **Bookings** — new / changed / cancelled, reminders.
   - **Payments** — paid, link viewed, failed / refund.
   - **Messages** — new client message, class broadcast sent.
   - **Marketing** — surfaced **read-only** with a deep-link to where they're authored (Marketing) and consumed (Services), reinforcing the seam.
3. Events where channel genuinely matters expose a **Starling-style 3-toggle card — Push / Email / SMS** (e.g. booking reminder = Push + SMS); everything else gets a single on/off switch to avoid a wall of toggles.
4. A persistent footnote: *"You'll still receive service messages — payment receipts and booking confirmations are always sent."* These are **not** silenceable here.

**Changes:**
- Add `src/app/app/settings/notifications/page.tsx` — built from `@/components/ui` (`Sheet`/`Toggle` exist; reuse the consumer prefs structure but in ink). Grouped sections, per-event rows, 3-channel cards on the events flagged `perChannel`.
- `src/app/app/hub/page.tsx` — wire the inert **Preferences** row → `/app/settings/notifications` (or add a dedicated Notifications entry).
- Add `src/lib/data/notificationPrefs.ts` — the event catalogue (id, domain, label, description, `perChannel: boolean`, `alwaysOn: boolean` for service messages) + default channel selections; and `src/lib/store/` slice (or extend `appStore`) to persist owner choices.
- Smoke: needle for the prefs screen ("Bookings", "Payments", "Reminders", the 3-channel toggle, and the "service messages" footnote).

**Data:** new `NotificationPref { eventId; channels: { push: boolean; email: boolean; sms: boolean } }[]`; an `NOTIFICATION_EVENTS` catalogue with `domain`, `perChannel`, `alwaysOn`. Service messages are `alwaysOn` and render disabled.

**Risk:** medium — new screen + new data; the key discipline is **not** over-toggling (reserve 3-channel for events where it matters) and **never** silencing transactional messages.

---

## Phase 5 — The three-system seam (feed / presets / messages)

**Goal:** Make the relationship between the **FEED** (activity log), **PRESETS** (authored in Marketing, consumed in Services), and **MESSAGES** unmistakable — three distinct surfaces, never merged, with explicit cross-links. Also rationalise the two overlapping feeds.

**Flow:**
1. **Feed** (`/app/notifications`) stays the read-only activity log — gains a **Payments** category (so the Phase 2 paid events land somewhere) and aligns its filters with the preference domains (Bookings / Payments / Messages / Marketing) so "what I see" matches "what I tuned".
2. **Presets** — the service notifications screen's `inherited` (business default) is re-pointed at a real **Marketing-authored preset**: seed a few presets in Marketing, add a "Manage in Marketing" deep-link from the service notifications screen, and a "Used by N services" reflection (mirrors the locked decision in `service-finalisation-plan.md` Phase 8 — placeholder presets now, real Marketing wiring later).
3. **Messages** — unchanged surface; the prefs screen's "new client message / class broadcast" rows are the bridge into it.
4. **Tidy the two feeds** — `/app/alerts` folds into `/app/notifications` (redirect or retire) so there is one canonical feed [OPEN — needs user decision].

**Changes:**
- `src/app/app/notifications/page.tsx` — add the Payments category; align filter labels with preference domains.
- `src/app/app/services/[id]/notifications/page.tsx` — "Manage in Marketing" link + "Used by N services"; `inherited` reads a seeded Marketing preset rather than the local `DEFAULT_STAGES`.
- Add seed presets in `src/lib/data/` (e.g. `notificationPresets.ts`) + a Marketing-hub entry (`src/app/app/marketing/page.tsx`) for "Message templates / presets".
- `src/app/app/alerts/page.tsx` — redirect to `/app/notifications` (pending the open question) and drop its smoke needle, or keep both and document the split.

**Data:** new `NotificationPreset { id; name; stages: NotifStage[] }`; `offer.notificationPresetId?` to record which preset a service inherits (additive, back-compatible — see `service-finalisation-plan.md`).

**Risk:** low–medium — mostly wiring + copy; the risk is conceptual (don't conflate the three). Anti-pattern guard: never merge feed + presets + messages into one screen.

---

## V2 / deferred

Parked for later, with a recommended direction so nothing is lost:

- **Sendbird-class chat infra + in-chat AI** (15 Jun, explicitly future) — *Direction:* when a real backend lands, adopt Sendbird (or equivalent) for channels/broadcast/read-state; layer AI reply-suggestions on top. Until then, the session-local store models the behaviour.
- **In-chat card-present payment** (vs the link) (15 Jun, future) — *Direction:* keep the payment **link** card as the primitive; an in-chat "take payment now" tile can later reuse the same card with a different status path.
- **Read receipts + typing indicators** (table-stakes, cheap on Sendbird) — *Direction:* add `readAt`/typing to the bubble model when the backend exists; render delivered/read ticks on 1:1 threads. Not in this prototype pass.
- **Disappearing-history / auto-delete-after-24h privacy toggle** (Gmail) — *Direction:* a bonus privacy primitive on the conversation-options sheet; defer until the basic Block/Delete/Archive set is signed off.
- **Inbox unread badges driven by real counts + per-thread last-read** — *Direction:* once the store owns read-state, derive inbox badges and the global hub bell count from it rather than the static `unread` seed.
- **Broadcast emoji reactions aggregation** (IRL) — *Direction:* show reaction counts under broadcast posts on the owner side once the client `/c` reaction model exists.
- **Public-discoverability of broadcast channels** (WhatsApp Channels) — *Direction:* explicitly **rejected** per the brief — keep broadcast **private to the class roster**, never discoverable. Noted here so it isn't accidentally added later.

---

## Suggested order & rationale

`1 (store + GDPR controls) → 2 (payment status card) → 3 (class compose/broadcast) → 4 (notification preferences) → 5 (three-system seam)`

Phase 1 first because the store is the backbone every later messaging phase hangs off (payment status, broadcast flag, class link all need it), and the Block/Delete/Archive controls are the single most-cited 15 Jun gap. Phase 2 is a small, high-visibility win on top of the store. Phase 3 (classes/broadcast) is the conceptually heaviest and benefits from the store being settled. Phases 4–5 are largely independent of the thread work and can run in parallel or be reprioritised — note the 16 Jun internal call put Services/Team/Analytics as the "big three", so messaging Phases 4–5 can slot behind those if capacity is tight.

Every phase ends green on `npx tsc --noEmit && npx next lint && npm run smoke`, with a smoke needle for each new empty/setup state. Persistence stays session-local Zustand; all new fields are additive so the 9 seed conversations and 23 seed offers keep rendering. SSR rule observed: the class auto-archive computes against an injected `now`, never a render-time clock call.

---

## Cross-cutting data-model changes

Additive / back-compatible — existing seeds keep rendering.

- `Conversation` (`src/lib/data/product.ts`) → `+ muted?`, `+ pinned?`, `+ blocked?` (Phase 1); `+ classId?`, `+ broadcast?`, `+ composeMode?` (Phase 3).
- New `src/lib/store/messagesStore.ts` — owns conversations + bubbles + payment status + management actions (Phases 1–3).
- New message-bubble `PaymentRequest { amount; reason: "deposit"|"balance"|"full"; note?; status: "requested"|"viewed"|"paid"; sentAt; paidAt? }` (Phase 2).
- New `src/lib/data/notificationPrefs.ts` — `NOTIFICATION_EVENTS` catalogue (`domain`, `perChannel`, `alwaysOn`) + `NotificationPref { eventId; channels }` (Phase 4).
- New `src/lib/data/notificationPresets.ts` — `NotificationPreset { id; name; stages: NotifStage[] }`; `offer.notificationPresetId?` on `DemoOffer` (Phase 5; aligns with `service-finalisation-plan.md`).

`NotifStage` (`src/lib/data/offers.ts`) is reused as-is — the preset model wraps it rather than replacing it.

---

## Open questions for the user

1. **Two feeds — fold or keep?** `/app/notifications` and `/app/alerts` are overlapping activity feeds. Recommend folding `/app/alerts` into `/app/notifications` (one canonical feed). Confirm, or is the split intentional?
2. **Where do preferences live?** Hub profile **Preferences** row → `/app/settings/notifications`, or a cog in the feed header, or both? (Recommend the Preferences row.)
3. **Default class compose mode** — should a new class thread default to **Broadcast** (announcements) or **Group** (discussion)? Recommend Broadcast for class *updates*, Group only when the owner opts in.
4. **Block scope** — does Block prevent the client from booking (a relationship action), or only from messaging? Recommend messaging-only for this pass; booking-block is a clients-section concern.
5. **Marketing presets timing** — seed placeholder presets now and wire real Marketing authoring later (matching the locked Services decision), or wait for the Marketing section? Recommend placeholders now.
6. **Payment-link reasons** — are Deposit / Balance / Full the right three, and should "Full" pull the linked service price automatically, or always be manually entered?
7. **Disappearing history** — is the Gmail-style 24h auto-delete privacy toggle wanted now, or V2? (Recommend V2.)
8. **Service messages list** — confirm which events are "always-on" transactional (recommend: payment receipts, booking confirmations, cancellation confirmations) so the prefs footnote names them correctly.

*Implementation begins once these are answered. Recommended first build: **Phase 1 (messages store + conversation options).***
