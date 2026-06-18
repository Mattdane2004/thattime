# Personal Profile & Preferences — Finalisation Plan

> **Status:** Plan only — most calls here are designer assumptions; no implementation until the open questions are resolved.
> **Scope:** The **individual user's** account surface inside the B2B business hub — the *Personal profile* (name, photo, contact, sign-in & security, the conditional staff public bio), app-level *Preferences* (notification preferences, appearance, language, accessibility), and the *role / "Switch to B2C"* affordances that sit beside them.
> **Out of scope this pass:** the **Business profile** (a separate object — name, brand, addresses, VAT — lives under the Business/Setup group, never here), **Plans & billing**, **Referrals**, **Integrations**, real auth/2FA back-end, and the **`/c` consumer settings** (already built — used here only as a reuse source). The 12/24h **time format** is *deliberately excluded* — it lives in calendar settings (one source of truth).
> **Source of truth for feedback:** the brief lists this section under "remaining sections" on **16 Jun (TT planning)** with little specific direction — most decisions below are designer calls tagged `[ASSUMPTION]` and surfaced as open questions. Cited Granola sessions: **15 Jun "that time sign off"**, **9 Jun / 2 Jun "Product alignment"**, **16 Jun "TT planning"**.
> **Design source:** design in-app from the research patterns + the existing `@/components/ui` library (no finalised Figma for this section). The Mobbin column is the build reference, same convention as `service-finalisation-plan.md` / `team-finalisation-plan.md`.

---

## What this section is

The **personal account** layer — everything about *you as a signed-in user*, not your business. It answers "who am I, how do I sign in, how do I want the app to behave, and how do I hop between surfaces/roles". It lives behind the **Profile** tab of the business hub (`/app/hub`), distinct from the **Business** tab (operations, marketing, setup). The critical disambiguation: a salon owner editing *their own* name, photo or password must never touch the **Business profile** — and the **public staff bio** (the only client-facing slice) is a conditional sub-section, shown only when the user is a bookable staff member. The B2C (`/c`) surface already has this whole layer; this plan brings the ink B2B surface to parity.

---

## Feedback → source map

| Area | Feedback | Source | Pattern ref (Mobbin) |
|---|---|---|---|
| Section exists | "Personal Profile", "Preferences" and "Notifications" (preferences) listed as remaining sections to finalise | 16 Jun (TT planning) | — |
| Big-three priority | Services / Team / Analytics are the priority; account/preferences is lower-priority polish — keep it lean | 16 Jun (TT planning) | — |
| Switch to B2C | The owner/staff app and the consumer app are one product; users move between them — the affordance already exists in the hub | 15 Jun (sign off) | [Remote — Switch profile](https://mobbin.com/screens/cca1f651-7076-424e-8727-c8b4162369ef) |
| Multi-role users | Owner / solo / staff personas drive the whole app; freelancers will switch workspaces (team plan, Phase 1d) | 2 Jun, 9 Jun (alignment) | [Deel — Roles assigned to you](https://mobbin.com/screens/c85753f0-730d-42ea-b763-fc102b512141) · [Remote — Owner role sheet](https://mobbin.com/screens/f473e6d8-03ee-494d-8297-89af8e99f209) |
| Staff public bio | Bookable staff have a client-facing bio (`StaffProfile`: publicName, bio, visibleOnProfile, featured) — distinct from private contact | 2 Jun (alignment — profile depth: socials, public/private toggles, reviews) | [Square Go — Stylist profile](https://mobbin.com/screens/b302dc27-ed66-4442-a59e-1e4dc73799b1) · [Alan — Therapist profile](https://mobbin.com/screens/ed903d4c-3065-4f73-a2f4-f7c6852d3736) |
| Account home layout | Greeting header + single "Edit profile" + iOS inset-grouped rows; keep the home shallow | research | [CVS — Account home](https://mobbin.com/screens/7bfd68bd-058d-4b39-b097-b448b3ac6ab4) · [ChatGPT — Settings](https://mobbin.com/screens/cb1e2e78-a7f7-4e76-a1e2-67d509361235) |
| Edit profile form | Avatar-first, minimal fields, country-code phone, photo via action sheet, sticky Save, public/private helper text | research | [Gojek — Edit profile](https://mobbin.com/screens/c3916dd3-5d6b-4eb7-9556-2f8caf48c0e6) · [Slack — Edit profile](https://mobbin.com/screens/ad0d8dc8-0a7d-435d-b3e7-888e94edf4b6) |
| Sign in & security | Minimal & non-technical: change password, biometric toggle, optional 2FA, trust footer | research | [Marcus — Security & login](https://mobbin.com/screens/ced45019-25ac-4464-a01a-633013f71c91) · [Stake — Passcode & biometrics](https://mobbin.com/screens/86d4ed8c-30c7-4b9a-9a4e-0b215b6c0dbd) |
| Notification prefs | Event-grouped cards, Push/Email/SMS per group, transactional events locked + helper text, optional quiet hours | research | [Klook — per-category matrix](https://mobbin.com/screens/22e01647-0007-4336-9693-1981c0525ac1) · [TaskRabbit — always-on helper](https://mobbin.com/screens/15fc17f7-dd41-4bc1-8366-6dfe2fbdfa4b) · [Marriott — transactional vs marketing](https://mobbin.com/screens/e1fc4306-e8c9-459c-8762-36e0990d1d2c) |
| Appearance & language | One screen, two rows; Appearance = radio sheet (Match device/Light/Dark); Language = single-select list | research | [Wise — Language & appearance](https://mobbin.com/screens/f49eb4fb-358a-4c11-a574-800a8017a32a) · [Coursera — Appearance + Language](https://mobbin.com/screens/0594a1a8-1409-4898-bff4-b177b265851c) |
| Accessibility | If shipped: high contrast + reduce motion + respect system; plain-language descriptions; otherwise lean on OS | research | [Canva — Accessibility](https://mobbin.com/screens/0e0b8aed-7212-44d1-a85c-be08f628e2b6) · [Discord — Accessibility](https://mobbin.com/screens/0d7b071d-199b-41fa-9a3c-fe6c0edbff65) |
| Macro IA | Account/identity first → Appearance → Accessibility; Switch Accounts next to Log out | research | [Trello — Account](https://mobbin.com/screens/ba50d01b-7d0d-4508-aafa-3966a51c2cdf) · [PayPal — Profile](https://mobbin.com/screens/93a61530-36ca-444c-92d3-60a46796cb55) · [Afterpay — Account & Settings](https://mobbin.com/screens/7e49aa34-d9c9-434a-bd34-895e6928bc94) |

---

## Current state

**Status legend:** ✅ done · 🟡 partial / stubbed · ❌ missing.

- 🟡 **Hub Profile tab** — `src/app/app/hub/page.tsx`. The Profile tab renders: a profile card (avatar "MD", "Mathew Dane", "Admin · Pro plan"), a Wallet card, an **Account** `ListCard`, a **Log out** button, and a **Switch to B2C** pill linking to `/c/home`. All of these are **dead buttons** — the profile card, Wallet, Log out and every `accountItems` row (`My profile`, `Plans & billing`, `Referrals`, `Notifications`, `Preferences`, `Help & FAQ`, `Legal`) are `<button>`s with no `href` except `notifications → /app/alerts`.
- ❌ **Personal-profile editor** — there is no edit-profile screen on the B2B surface. The "MD / Mathew Dane" identity is a hardcoded literal in the hub, not data.
- ❌ **Sign in & security** — no change-password / biometric / 2FA screen on B2B.
- ❌ **Notification preferences (B2B)** — the hub's "Notifications" row points at `src/app/app/alerts/page.tsx`, which is an **activity feed** (grouped alerts + category filter), *not* a preferences screen. There is no B2B notification-preferences screen.
- ❌ **Appearance / language / accessibility (B2B)** — none exist; `appStore.ts` holds only appointment/checkout/quick-action state, no theme/language/a11y prefs.
- 🟡 **Staff public bio** — the **type** exists (`StaffProfile { publicName; bio; visibleOnProfile; featured }` in `src/lib/types/staff.ts`) and is seeded per member, but there is **no editor** — `team/[id]/` only has `pay/`, `permissions/`, `schedule/` sub-flows. A staff member cannot edit their own bio anywhere.
- ✅ **Role switching** — `src/lib/store/roleStore.ts` (`owner | solo | staff`) + `src/components/app/RoleSwitcher.tsx` (a header dropdown with check-marked active role + subtitle). This is a *prototype persona switcher*, not anchored near the profile.
- ✅ **B2C parity reference (reuse source)** — the `/c` consumer surface already has the full pattern: a settings hub (`src/app/c/settings/page.tsx` — Account / Preferences / Support / Danger zone grouped rows), `account/page.tsx` (editable fields + change-password Sheet + connected accounts), `notifications/page.tsx` (channel masters + grouped event toggles + quiet-hours Sheet), and an **appearance radio sheet** (Light/Dark/System). These are coral and use `Toggle` from `@/components/ui/consumer`; the ink versions reuse the structure with ink primitives.
- ✅ **Primitives available** — `SettingsGroup` (Apple-style inset card), `ToggleRow` (with `tone: "ink" | "coral"`), `ListRow`, `Sheet` / `BottomSheet`, `RadioGroup`, `Field`, `PhoneInput`, `PasswordField`, `Avatar`, `Badge`, `Toaster`/`toast` — all in the `@/components/ui` barrel. Everything below composes from these.

---

## Recommended UX calls

As designer, the brief is "make sensible calls, keep it lean, flag assumptions". The spine:

1. **Separate the user from the business, hard.** `[ASSUMPTION]` Personal profile lives only under the hub **Profile** tab; the **Business profile** stays under the Business/Setup group. They never share an editor. The edit-profile form carries a visibility helper ("Only visible to you and your team — not shown to clients") so an owner is never confused about what they're changing. *(CVS/Gojek; anti-pattern #1.)*

2. **Shallow home, deep leaves.** `[ASSUMPTION]` The Profile tab stays a shallow list of chevron rows — **no toggles on the home**. Each domain (profile, security, notifications, appearance) owns its own screen. *(ChatGPT/CVS; anti-pattern #3.)*

3. **Event-first notifications, channels inside.** `[ASSUMPTION]` Group by *event* (New bookings, Cancellations & no-shows, Payments & payouts, Reviews, Marketing) — an SMB owner thinks "new booking", not "SMS" — with Push/Email/SMS toggles per card, mirroring the existing per-stage notifications mental model. Transactional events (payment failed, booking cancelled) are **locked** with "You'll always be notified about this". *(Klook event-first + TaskRabbit helper; anti-patterns #4, #5.)*

4. **Auto-save toggles, explicit Save for forms.** `[ASSUMPTION]` Notification/appearance/accessibility screens auto-save with a subtle "Saved" confirmation; only the multi-field **Edit profile** form gets a sticky Save. *(Deel "Preferences saved" toast; anti-pattern #10.)*

5. **Staff bio is conditional and client-facing only.** `[ASSUMPTION]` The "Public bio" sub-section appears **only when `bookable === true`** (gate off the team record). It is labelled "Shown to clients when they book you" with a "See how clients see you" preview, and is the *only* part of the personal profile that is public. A front-desk admin never sees it. *(Fresha three-object split; anti-pattern #2.)*

6. **Appearance radio sheet, "Match device" default; language single-select; NO time format.** `[ASSUMPTION]` Reuse the exact `/c` appearance sheet shape (ink). Time format is cross-linked to calendar settings at most, never duplicated. *(Wise/Coursera; anti-patterns #6.)*

7. **Security stays tiny and plain.** `[ASSUMPTION]` Change password + biometric toggle + a trust footer; 2FA is a phase-2 chevron. No TOTP/session jargon. *(Marcus/Stake; anti-pattern #8.)*

8. **Role / Switch-to-B2C as an explicit sheet, moved next to the profile.** `[OPEN]` Promote role switching out of the header `RoleSwitcher` into a labelled "Switch view" bottom sheet anchored in the Profile tab (active role check-marked, descriptive subtitles), keeping "Switch to client view (B2C)" as its own clear row. *(Remote/Trello switch-account sheet; anti-pattern #9.)* — needs the user to confirm whether the header switcher stays too.

9. **Accessibility = phase-2, minimal.** `[ASSUMPTION]` For an SMB MVP, ship at most high-contrast + reduce-motion (respecting system); skip captions/autoplay/message-timing. *(Canva scope vs anti-pattern #7.)*

---

## Phase 1 — Account home (the Profile-tab hub, wired)

**Goal:** Turn the dead Profile tab into a real, navigable account home following the CVS/ChatGPT layout, with every row routing somewhere. This is the backbone every later phase hangs off.

**Flow:**
1. Enter the hub (`/app/hub`) → **Profile** tab (existing tab toggle), or tap the avatar in app chrome.
2. **Header card** — avatar + name + a **role/business line** ("Owner · Glow Studio", driven by `roleStore` + business name) + an **Edit profile** affordance (the card itself drills into Phase 2).
3. **Group "Account"** — `Personal profile`, `Sign in & security` → (Phases 2, 3).
4. **Group "Preferences"** — `Notifications`, `Appearance & language`, `Accessibility` (Phase 5 — hidden until shipped) → (Phases 4, 5).
5. **Group "Switch"** — `Switch to client view (B2C)` (existing link, relabelled), `Switch view / role` (sheet, Phase 6 — only when multi-role).
6. **Footer** — `Help & FAQ`, `Legal` (keep as stubs/links), then **Log out** (destructive, visually separated).

**Changes:**
- `src/app/app/hub/page.tsx` — restructure the Profile tab into `SettingsGroup` blocks; give every `accountItems` row a real `href` into the new `/app/account/*` routes; relabel "Switch to B2C" → "Switch to client view"; keep "Notifications" pointing at the new **preferences** route (Phase 4), and add a separate "Activity" entry if the `/app/alerts` feed should stay reachable (Q below).
- New route group `src/app/app/account/page.tsx` *(optional)* — `[ASSUMPTION]` keep the hub Profile tab AS the home (no separate route) to avoid a duplicate surface; the new screens live under `/app/account/{profile,security,notifications,appearance}`.
- Read identity from a new `accountStore` instead of the hardcoded "Mathew Dane / Admin · Pro plan" literal.

**Data:** new `src/lib/store/accountStore.ts` + `src/lib/data/account.ts` seed (see cross-cutting). Role/business line derived from `roleStore` + business name.
**Risk:** low — mostly wiring + composition from existing primitives.

---

## Phase 2 — Edit personal profile (+ conditional staff bio)

**Goal:** A model edit-profile form (Gojek pattern) that owns the user's private identity, plus the conditional client-facing staff bio — clearly separated.

**Flow:**
1. From the Profile header card → **Edit personal profile** (`/app/account/profile`).
2. **Avatar** at top with "Change photo" → bottom action sheet (Take photo / Choose from library / Remove). Circular preview.
3. **Fields:** First name, Last name, Email (with a **Verified** badge when confirmed), Phone (`PhoneInput`, country code).
4. **Helper under contact:** "Only visible to you and your team — not shown to clients."
5. **Sticky Save** → `toast("Profile saved")`.
6. **Conditional "Public bio" row** (only if the user is a bookable staff member) → `/app/account/profile/bio`:
   - Fields: Display name, Job title/role, About (multiline `Textarea`), Specialties (`Chip`s), Languages, optional social links.
   - Label "Shown to clients when they book you"; a "See how clients see you" preview linking to the client-facing card.
   - Sticky Save; visibility note reinforcing this is the only client-facing part.

**Changes:**
- `src/app/app/account/profile/page.tsx` — the form (compose `Field`/`Input`/`PhoneInput`/`Avatar` + `BottomSheet` for photo). Reuse the `/c/settings/account` structure in ink.
- `src/app/app/account/profile/bio/page.tsx` — the staff-bio editor, gated on `bookable`. Writes back to the member's `StaffProfile` (`teamStore`) so the bio is a single source of truth shared with the team section (no duplicate model).
- `accountStore` — first/last name, email + `emailVerified`, phone, avatar.

**Data:** `accountStore` user fields (below). Staff bio reuses **existing** `StaffProfile` (`publicName → display name`, `bio`, `visibleOnProfile`, `featured`) — extend additively only if social links/specialties/languages aren't already covered (they map to the 2 Jun "profile depth" team additions — coordinate with `team-finalisation-plan.md` Phase 2c rather than forking).
**Risk:** medium — the bio crosses into the team domain; keep `StaffProfile` the one owner of bio data.

---

## Phase 3 — Sign in & security

**Goal:** A minimal, non-technical security screen (Marcus/Stake).

**Flow:**
1. From Profile home → **Sign in & security** (`/app/account/security`).
2. **Email** row with a **Verified** badge.
3. **Change password** chevron → a `Sheet` with Current / New / Confirm (reuse the `/c/settings/account` change-password sheet pattern + `PasswordField`).
4. **Face ID / biometric unlock** toggle (`ToggleRow`) with a one-line explanation.
5. **Two-factor authentication** chevron — `[ASSUMPTION]` phase-2 placeholder ("Set up" → not-yet-built sheet).
6. **Trust footer** — a reassuring line about data safety.
7. *(optional)* "Connected accounts" (Apple / Google) — reuse the `/c` connected-accounts block if SSO is in scope (Q below).

**Changes:**
- `src/app/app/account/security/page.tsx` — compose `SettingsGroup` + `ToggleRow` + change-password `Sheet`.
- `accountStore` — `biometricUnlock: boolean`, `twoFactorEnabled: boolean` (prototype flags only — no real auth back-end).

**Data:** `accountStore` security flags (below).
**Risk:** low — all prototype-local; keep jargon out (anti-pattern #8).

---

## Phase 4 — Notification preferences (B2B, event-first)

**Goal:** The user's *own* notification preferences for business activity — distinct from the `/app/alerts` activity feed. Event-grouped cards, per-channel toggles, locked transactional events, auto-save.

**Flow:**
1. From Profile home → **Notifications** (`/app/account/notifications`).
2. **Intro line:** "Choose how you hear about activity in your business."
3. **Channel masters** (optional, like `/c`): Push / Email / SMS top group (Push "on this device", Email/SMS showing the address/number).
4. **Event-grouped cards** — each a `SettingsGroup` exposing Push / Email / SMS `ToggleRow`s:
   - **New bookings & changes**
   - **Reminders** ("24h and 1h before")
   - **Cancellations & no-shows** — *locked* (transactional)
   - **Payments & payouts** — payout success on; *payment-failed locked*
   - **Reviews**
   - **Marketing & tips from That Time**
5. **Locked rows** rendered dimmed with helper "You'll always be notified about this."
6. **Quiet hours** row at the bottom → a `Sheet` with From/Until (reuse the `/c/settings/notifications` quiet-hours sheet).
7. **Auto-save** with a subtle "Saved" confirmation — no Save button.

**Changes:**
- `src/app/app/account/notifications/page.tsx` — ink build mirroring `/c/settings/notifications` but **event-first** (Klook) rather than the `/c` channel-master-only model; reuse `ToggleRow` (`tone="ink"`) + `Sheet`.
- `accountStore` — `notificationPrefs` (per-event × per-channel matrix) + `quietHours`.

**Data:** `notificationPrefs` matrix + `quietHours` (below). Transactional events flagged `locked` in the seed config so they render dimmed and can't be toggled off.
**Risk:** medium — the matrix is the densest screen; group strictly by event to keep the owner from drowning (anti-pattern #4).

---

## Phase 5 — Appearance & language (+ accessibility, phase-2)

**Goal:** One tidy display-preferences screen; accessibility stubbed behind a flag.

**Flow:**
1. From Profile home → **Appearance & language** (`/app/account/appearance`).
2. **Appearance** row (current value as subtitle) → radio `Sheet`: **Match device** (default, with subtitle), **Light**, **Dark** — single-select filled radio (reuse the `/c/settings` appearance sheet, ink).
3. **Language** row → searchable single-select list of supported languages.
4. *(cross-link only)* a passive note: "Time format (12/24h) is set in Calendar settings" — **no control here** (one source of truth).
5. **Accessibility** — `[ASSUMPTION]` phase-2: a separate `/app/account/accessibility` with **High contrast** + **Reduce motion** toggles (+ "respect system" default) and one-line descriptions; hidden from the home until shipped.

**Changes:**
- `src/app/app/account/appearance/page.tsx` — `SettingsGroup` + two rows + the appearance radio `Sheet` + a language single-select `Sheet`/list.
- `src/app/app/account/accessibility/page.tsx` *(phase-2)* — `ToggleRow`s with descriptions.
- `accountStore` — `appearance: "system" | "light" | "dark"`, `language: string`, `highContrast`, `reduceMotion`.
- **Wiring note:** persisting `appearance` is fine; *applying* a real dark theme is a token-layer change beyond this section — `[ASSUMPTION]` store the preference now, leave actual theming to a later global pass (flag this so the toggle isn't mistaken for a working dark mode).

**Data:** `accountStore` display fields (below).
**Risk:** low for appearance/language; the dark-theme *application* is out of scope (store-only) — be explicit in copy/Q.

---

## Phase 6 — Switch view / role (sheet) + Switch to client view

**Goal:** Make surface/role switching an explicit, labelled affordance beside the profile (Remote/Trello), not a hidden header toggle.

**Flow:**
1. **Switch to client view (B2C)** — a clear row on the Profile home → confirm/seamless hop into the coral `/c` surface (the existing `/c/home` link, relabelled).
2. **Switch view / role** (only when the user has more than one role/business) → a bottom `Sheet` listing roles/contexts with descriptive subtitles (reusing `roleLabels` from `roleStore`), a checkmark on the active one, and — once the team **freelancer own-workspace** lands (`team-finalisation-plan.md` Phase 1d) — alternate workspaces with status badges, plus "Add account" and a clearly separated path back.

**Changes:**
- `src/app/app/hub/page.tsx` — the two rows in the **Switch** group; the role sheet reuses `roleStore` + `roleLabels`.
- `[OPEN]` decide whether the header `RoleSwitcher` (`src/components/app/RoleSwitcher.tsx`) stays as a power-user shortcut or is replaced by this profile-anchored sheet.

**Data:** none new — reuses `roleStore`. Workspace list ties into the team plan's freelancer workspace context (don't duplicate).
**Risk:** low–medium — mostly composition; the multi-workspace half depends on the team plan landing first.

---

## V2 / deferred

- **Real dark theme application** — Phase 5 stores the `appearance` preference; wiring it to actual token swaps (`light`/`dark` token sets across both surfaces) is a global theming pass. *Direction:* a `data-theme` attribute on the frame root + a dark token map; ship after the design-system token JSON lands.
- **Full accessibility panel** — beyond contrast/reduce-motion: respect system text size, captions, autoplay control (Canva scope). *Direction:* only if a client/user explicitly asks; otherwise lean on OS settings (anti-pattern #7). Keep the phase-5 panel minimal.
- **Real 2FA** — TOTP/authenticator-app enrolment + recovery codes. *Direction:* phase-2 chevron now (placeholder), real flow when auth back-end exists; keep the UI plain (anti-pattern #8).
- **SSO / connected accounts on B2B** — Apple/Google connect (the `/c` block already exists). *Direction:* reuse the `/c` connected-accounts component in ink if social login is in scope (Q below).
- **Multi-business / multi-workspace switcher** — the Remote-style "Other accounts" group with status badges. *Direction:* lands with the team freelancer own-workspace (`team-finalisation-plan.md` Phase 1d); model the workspace list there, render it here.
- **Per-workspace notification scoping** — Fresha scopes notification prefs per workspace ("my activity only" vs "all team members"). *Direction:* relevant only once multi-workspace exists; single-workspace owners get one flat prefs screen now.
- **Profile depth (birthday, start date, social links, reviews, display order)** — overlaps the team section's 2 Jun "profile depth" feedback. *Direction:* owned by `team-finalisation-plan.md` Phase 2c on the staff side; the personal profile only links to the bio, doesn't fork the model.

---

## Suggested order & rationale

`1 (account home) → 2 (edit profile + bio) → 3 (security) → 4 (notifications) → 5 (appearance/language) → 6 (switch view/role)`

Phase 1 first because the hub Profile tab is currently all dead buttons — until the rows route somewhere, none of the leaf screens are reachable, and the home is the cheapest, highest-visibility win. Phase 2 next because "Edit profile" is the single most-expected action and proves the personal-vs-business separation. Phases 3–5 are independent leaf screens and can be reordered by priority — notifications (4) is the densest and the one most likely to need a client steer, so it can slip if the big-three (Services/Team/Analytics, per 16 Jun) need the runway. Phase 6 last because the cleaner multi-workspace version depends on the team plan's freelancer work; the basic "Switch to client view" row already works today and just needs relabelling.

Every phase ends green on `npx tsc --noEmit && npx next lint && npm run smoke`, with a smoke needle for each new empty/setup screen. Persistence stays session-local Zustand via the new `accountStore` (no real back-end — additive, back-compatible).

---

## Cross-cutting data-model changes

A new **`src/lib/store/accountStore.ts`** + **`src/lib/data/account.ts`** seed (grepped — no existing account/preferences store; `appStore.ts` is appointment/checkout state only). All fields prototype-local and additive:

```
UserAccount {
  firstName, lastName: string
  email: string; emailVerified: boolean
  phone: string                     // country-code via PhoneInput
  avatarUrl?: string | null
  // security (prototype flags, no real auth back-end)
  biometricUnlock: boolean
  twoFactorEnabled: boolean
  // display preferences
  appearance: "system" | "light" | "dark"   // stored; theme application deferred (V2)
  language: string                            // e.g. "en-GB"
  highContrast: boolean                       // phase-2 a11y
  reduceMotion: boolean                       // phase-2 a11y
  // notifications: event × channel matrix + locked transactional events
  notificationPrefs: Record<NotificationEvent, { push: boolean; email: boolean; sms: boolean }>
  quietHours?: { from: string; to: string }   // "HH:MM"
}

NotificationEvent =
  "bookings" | "reminders" | "cancellations" | "payments" | "reviews" | "marketing"
// "cancellations" & "payments" carry a `locked` flag in the seed config → rendered dimmed, can't disable
```

- **Staff public bio** reuses the **existing** `StaffProfile` (`staff.ts`) — `publicName`, `bio`, `visibleOnProfile`, `featured`. Any social-links / specialties / languages additions are made there (additive), coordinated with `team-finalisation-plan.md` Phase 2c — **not** duplicated into `accountStore`.
- **Role/business line + role sheet** reuse the existing `roleStore` (`owner | solo | staff`) + `roleLabels`; multi-workspace ties into the team freelancer workspace context (V2 / team plan).
- **No new time-format field** — that stays in calendar settings (one source of truth).

All optional/back-compatible; the hub's hardcoded "Mathew Dane / Admin · Pro plan" becomes the seed default in `account.ts` so the existing screen keeps rendering.

---

## Open questions for the user

1. **Account home shape** — keep the hub **Profile tab** as the account home (recommended, avoids a duplicate surface), or split out a dedicated `/app/account` route reached from the chrome avatar? `[ASSUMPTION: tab stays the home.]`
2. **`/app/alerts` vs notification preferences** — the hub "Notifications" row currently opens the **activity feed** (`/app/alerts`). Confirm: "Notifications" under *Preferences* = the new prefs screen, and the activity feed gets its own clearly-named entry (e.g. "Activity")?
3. **Staff-bio ownership** — is the public staff bio editable from the *personal profile* (this plan) AND the *team member detail* (team plan), sharing one `StaffProfile`? Or only one of them? `[ASSUMPTION: shared model, editable from personal profile when it's your own record; team detail for owners editing others.]`
4. **Notification axis** — event-first (Klook — "New booking", "Cancellation"; recommended for SMB owners) vs channel-first (TaskRabbit)? `[ASSUMPTION: event-first.]`
5. **Which notification events are locked (transactional)?** Proposed: cancellations/no-shows and payment-failed are always-on. Confirm the always-on set.
6. **Appearance scope** — store the preference now but defer real dark-theme application to a global token pass (recommended), or is a working dark mode expected this pass? `[ASSUMPTION: store-only now.]`
7. **Accessibility** — ship the minimal contrast + reduce-motion panel now, or defer entirely and lean on OS settings for the MVP? `[ASSUMPTION: defer to phase-2, minimal when it ships.]`
8. **Role switcher placement** — does the header `RoleSwitcher` stay (power-user shortcut) alongside a profile-anchored "Switch view" sheet, or move entirely into the Profile tab? `[ASSUMPTION: profile-anchored sheet is the primary; header switcher kept as prototype shortcut.]`
9. **SSO / connected accounts** — should the B2B surface offer Apple/Google connect (the `/c` block exists to reuse), or is email+password the only B2B sign-in this pass? `[ASSUMPTION: email+password only; SSO V2.]`
10. **Security depth** — is biometric unlock + a 2FA placeholder enough for the prototype, or is a real 2FA enrolment flow expected? `[ASSUMPTION: biometric + 2FA placeholder.]`

*Implementation begins once these are answered — most are low-stakes designer defaults that just need a nod.*
