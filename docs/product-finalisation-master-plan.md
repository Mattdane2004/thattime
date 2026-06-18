# That Time product finalisation master plan

Last updated: 2026-06-17  
Owner / decision maker: Mathew Dane  
Primary deadline: 1.5 week sign-off window, with daily product sign-off meetings from 2026-06-18, 09:00-10:30 BST.

This document is the working source of truth for finishing the That Time prototype. It combines the current Next.js prototype, the migration/finalisation docs, the latest Granola feedback, and a fallback review of the older local app structure. It should help agents understand what exists, what is missing, how the product areas relate, and what should be prioritised before UI rollout and client sign-off.

## Source map

- Current prototype: local repo at `/Users/mathewdane/Documents/GitHub/thattime`.
- Latest Granola meeting reviewed: `that time product sign off`, 2026-06-17 13:30 BST, meeting ID `2d0356e7-7fe7-48c5-ae92-e148cf06baca`, participants Mathew, Shabbir, Vishal.
- Supporting Granola context: `that time sign off` on 2026-06-15, `TT planning` on 2026-06-16, internal B2C alignment workshop on 2026-06-16.
- Key local docs: `docs/sign-off-changes.md`, `docs/schedule-feedback-coverage.md`, `docs/product-screens.md`, and all `docs/migrations/*-finalisation-plan.md` files.
- Live That Time Pro audit: exact vendor URL now supplied as `https://vendor.that-time.co.uk/enter-phone`, but the in-app browser blocked navigation under its URL security policy before the page loaded. Credentials were supplied in chat and must not be copied into docs or committed. The remaining audit needs user-provided screenshots/screen recording, or another policy-approved access path.
- Legacy app fallback: `/Users/mathewdane/Desktop/That-time/Apps/that-time-app` was reviewed only as a structural reference. It is not a substitute for the live authenticated app audit.

## Executive read

The current app is a broad, high-fidelity B2B/B2C prototype with many screens already ported into Next.js. The core B2B shell, Home, Schedule, Clients, Messages, Checkout, Services, Team, Hub, onboarding, offer creation, and several B2C surfaces exist and render. The main risk is not lack of screens; it is that several areas are still static, isolated, or demo-data driven rather than governed by shared domain settings and cross-flow state.

The Jun 17 feedback changes the priority. The client is not only asking for polish on main pages; they are now probing operational flows: appointment evidence/activity, cancellation/refund handling, deposits and payment links, blocked time, pending package sessions, recurring appointments, waitlist, notification channel settings, client-level fee preference, and message permissions. These cut across Schedule, Checkout, Clients, Messages, Marketing, Payments, and Settings, so a screen-by-screen rollout alone will create inconsistencies.

The recommended delivery model is to stabilise the signed-off main screens first, then build the missing cross-flow primitives in priority order. For the 1.5 week deadline, treat Home, Schedule, Clients, Messages, Checkout, Services, Team, Settings, Payments, and Notifications as P0/P1. Treat Analytics and Marketing as P1 scaffold/sign-off surfaces. Treat Integrations, Referrals, Help/Legal, full B2C social marketplace, and deep inventory as P2 unless the daily sign-off meetings explicitly promote them.

## Current app structure

### Framework and conventions

- Stack: Next.js 14 App Router, TypeScript, Tailwind, Zustand, lucide icons.
- App sections:
  - `/app` - B2B business app.
  - `/c` - consumer marketplace/client app.
  - `/client` - client-facing onboarding/check-in style flows.
  - `/new` - offer creation wizard.
  - `/onboarding` - business onboarding.
- Design system:
  - UI primitives live in `src/components/ui`.
  - App-owned composed components live in `src/components/app`.
  - B2B uses ink/navy visual language; B2C uses coral.
  - Do not add inline hex colours; use tokens and existing components.
- Data:
  - Screen fixtures mostly live in `src/lib/data/product.ts`.
  - Offer catalogue lives in `src/lib/data/offers.ts`.
  - Runtime prototype state lives in Zustand stores under `src/lib/store`.
  - Several important domains still need a single store/source of truth.
- Quality gate:
  - `npx tsc --noEmit && npx next lint && npm run smoke`.
  - `smoke.tsx` already covers a wide surface and should receive smoke needles for every new route/state.

### Route coverage snapshot

The repo currently has 126 `page.tsx` routes. The route count was regenerated from `src/app/**/page.tsx` on 2026-06-17 while updating this plan. The spreadsheet includes a full generated `Route Detail` sheet with every route and source file.

- B2B core: `/app`, `/app/schedule`, `/app/clients`, `/app/clients/[id]`, `/app/messages`, `/app/messages/[id]`, `/app/checkout`, `/app/services`, `/app/services/[id]`, `/app/team`, `/app/hub`, `/app/marketing`, `/app/setup`, `/app/notifications`, `/app/alerts`.
- Offer management: service, class, bundle, and subscription creation/management routes under `/new` and `/app/services/*`.
- B2C: `/c/home`, `/c/explore`, `/c/salon/[id]`, bookings, inbox, profile, settings.
- Onboarding: `/onboarding/*` business onboarding and `/client/*` client-side flows.

Route group counts:

| Group | Page routes | What it covers | Current read |
| --- | ---: | --- | --- |
| `/app` | 46 | Main B2B vendor app, including services, team, clients, schedule, checkout, hub, marketing and setup | Strongest coverage, but several routes are static or partial and many Hub destinations are missing |
| `/onboarding` | 31 | Business onboarding, owner setup, login/password, trial, staff onboarding handoff | Broadly built; social phone capture and staff self-edit gaps remain |
| `/c` | 22 | Consumer marketplace, salon profiles, booking, inbox, profile and settings | Sizeable prototype; B2C strategy is post-B2B and should de-emphasise vanity/social mechanics |
| `/new` | 15 | Offer creation wizard for service, class, bundle and subscription | Package entry is still missing |
| `/client` | 9 | Client-facing setup/check-in style flow | Needs parity decisions against B2C and live app evidence |
| `/login` | 1 | Top-level login entry | Confirm relationship to onboarding login and live phone-entry flow |
| `/staff` | 1 | Standalone staff home | Staff self-service still belongs in Team finalisation |
| `/` | 1 | Entry route | Keep aligned with onboarding and vendor app shell |

Known Hub destinations without dedicated routes yet:

- `/app/analytics`
- `/app/settings` or `/app/business-settings`
- `/app/payments`
- `/app/products`
- `/app/resources`
- `/app/locations`
- `/app/integrations`
- `/app/billing` or `/app/plans-billing`
- `/app/referrals`
- `/app/help`
- `/app/legal`
- `/app/account` / personal preferences

### Implementation anchor map

Use this table before assigning agents to a section. It links each product area to the current implementation files and the main state/data sources that already exist.

| Area | Start with these files | State / data anchors | Read alongside | Implementation note |
| --- | --- | --- | --- | --- |
| B2B shell and navigation | `src/app/app/layout.tsx`, `src/components/app/AppFrame.tsx`, `src/components/app/AppTabBar.tsx`, `src/components/ui/organisms/AppHeader.tsx` | `src/lib/store/appStore.ts`, `src/lib/store/roleStore.ts` | This plan, route detail sheet | Tab bar owns quick-action entry and appointment sheet host; new P0 flows should fit the shell before adding a separate navigation pattern. |
| Home | `src/app/app/page.tsx`, `src/components/app/UpNextCard.tsx`, `src/components/app/charts.tsx` | `src/lib/data/home.ts`, `src/lib/data/dashboard.ts`, `src/lib/store/roleStore.ts` | `docs/sign-off-changes.md` | Home is role-aware and mostly signed off; add revenue markers without turning Home into full Analytics. |
| Schedule and calendar | `src/app/app/schedule/page.tsx`, `src/components/app/QuickActions.tsx`, `src/components/app/AppointmentSheet.tsx` | `src/lib/data/product.ts`, `src/lib/store/appStore.ts` | `docs/schedule-feedback-coverage.md`, Jun 17 Granola | Calendar UI is rich but still fixture-driven. Activity, refunds, waits, packages, requests and notification prompts need shared state rather than page-only state. |
| Appointment detail | `src/components/app/AppointmentSheet.tsx`, `src/components/app/UpNextCard.tsx` | `src/lib/store/appStore.ts`, `src/lib/data/product.ts` | Schedule section in this plan | Appointment sheet is the natural home for Activity, payment summary, forms share, cancellation/refund, staff/location edits and event history. |
| Checkout / quick payment | `src/app/app/checkout/page.tsx`, `src/components/app/QuickActions.tsx` | `src/lib/store/appStore.ts`, `checkoutTotals()` in `appStore.ts`, `src/lib/data/product.ts` | Jun 17 Granola, Payments plan | Checkout already has a strong hub-and-spoke till. Add subscription payment display, discount codes, outstanding-list cut-off, and book-next-session prompts here. |
| Clients | `src/app/app/clients/page.tsx`, `src/app/app/clients/[id]/page.tsx`, `src/app/app/clients/[id]/wallet/page.tsx`, `src/app/app/clients/[id]/settings/page.tsx` | `src/lib/data/product.ts`, `src/lib/types/client.ts`, `src/lib/store/appStore.ts` | Client P0 section, settings hierarchy | Client detail is mostly local state seeded from fixtures. Package sessions, client fee preference and policy inheritance need shared models. |
| Messages | `src/app/app/messages/page.tsx`, `src/app/app/messages/[id]/page.tsx` | `src/lib/data/product.ts` conversations, `src/lib/store/appStore.ts` for appointment/payment hooks | Messaging/notifications finalisation plan | Thread UI is strong, but permissions, app-download restriction, paid channel settings and messaging-only block are not represented as settings/state yet. |
| Services and offers | `src/app/app/services/page.tsx`, `src/app/app/services/[id]/page.tsx`, `src/app/app/services/[id]/*`, `src/app/new/*` | `src/lib/store/offersStore.ts`, `src/lib/store/wizardStore.ts`, `src/lib/data/offers.ts`, `src/lib/data/bundles.ts`, `src/lib/data/subscriptions.ts`, `src/lib/data/products.ts` | Service, bundle, class, subscription, package plans | Service modules have the broadest route depth. Package needs first-class entry and session/redemption behaviour without duplicating bundle mechanics unnecessarily. |
| Team | `src/app/app/team/page.tsx`, `src/app/app/team/[id]/*`, `src/app/app/team/invite/page.tsx`, `src/app/app/team/pay/[runId]/page.tsx` | `src/lib/store/teamStore.ts`, `src/lib/data/team.ts`, `src/lib/types/staff.ts` | Team finalisation plan | Team has a session-persistent roster/pay/schedule foundation. Requests, approvals, rota depth and coverage still need product modelling. |
| Hub and setup | `src/app/app/hub/page.tsx`, `src/app/app/setup/page.tsx`, `src/app/app/setup/import/page.tsx` | `src/lib/data/setupGuide.ts`, `src/lib/data/dashboard.ts`, `src/lib/store/roleStore.ts` | All migration plans | Hub exposes many destination labels as dead buttons. Promote P0/P1 domains into real routes or mark as scaffold/deferred for sign-off. |
| Notifications and alerts | `src/app/app/notifications/page.tsx`, `src/app/app/alerts/page.tsx`, `src/app/app/services/[id]/notifications/page.tsx` | `src/lib/data/alerts.ts`, `src/lib/data/offers.ts` notification stages | Messaging/notifications plan, Plans/Billing plan | Decide whether Alerts folds into Notifications. Paid channel locks need Plans/Billing and global notification preferences. |
| Onboarding | `src/app/onboarding/*`, `src/components/onboarding2/*` | `src/lib/store/onboarding2.ts`, `src/lib/types/business.ts` | `docs/onboarding-flow.md` | Broad business onboarding exists; social phone capture, staff self-edit and live phone-entry parity remain open. |
| B2C and client-facing flows | `src/app/c/*`, `src/app/client/*`, `src/components/ui/consumer.tsx` | `src/lib/data/b2c.ts`, `src/lib/data/clientApp.ts` | B2C alignment notes, social marketplace plan | Sizeable prototype exists but should stay behind B2B sign-off. Review/search/availability should outrank vanity/social mechanics. |
| Missing domain hubs | No dedicated routes yet for settings, payments, analytics, locations, resources, products, integrations, billing/plans, referrals, help/legal, account/preferences | Some seed data exists in `src/lib/data/locations.ts`, `src/lib/data/products.ts`, service modules and business types | Matching `docs/migrations/*-finalisation-plan.md` | Build lightweight scaffold routes where daily sign-off requires IA clarity; avoid pretending service-level modules are business-wide catalogues. |
| Validation and handoff | `smoke.tsx`, `package.json`, `scripts/build-finalisation-tracker.mjs` | `npm run smoke`, generated tracker workbook | Agent handoff checklist | Every new route/state should get smoke needles and keep this document plus the tracker aligned. |

## Local prototype state

### Home

Status: mostly built and close to sign-off.

Built:

- Main B2B home dashboard at `/app`.
- Header, role/location controls, notifications entry, business hub avatar.
- Needs Attention card above Overview.
- Up Next with running-late and ready flows.
- Revenue progress card.
- KPI cards, activity chart, top services, client split, team today, shifts and time off.
- Solo upsell now dismissible.

Missing / update from Jun 17:

- Revenue progress needs time/day markers. Day view should show time markers along the bar, such as 9am, midday, end of shift. Week view should show Monday-Sunday/day markers.
- Confirm whether the Home Activity chart remains, moves into Analytics, or becomes a smaller trend card.
- Lockscreen/widget idea is future, not part of the sign-off deadline.

### Schedule

Status: major visual surface built, but the deepest missing operational flows are here.

Built:

- `/app/schedule` with My Day, Calendar, and Team views.
- Agenda rows, grid views, week/month/team concepts, filters/search, out-of-hours visual treatment.
- Running late / ready status concepts.
- Action consolidation and appointment/booking card patterns.
- Dispute banner and some payment/status treatment from earlier sign-off work.

Known limitation:

- Calendar/My Day grids use static fixtures and do not fully vary by selected day.

Jun 17 changes and missing flows:

- Remove separate "unblock" feature. Final model is block-only. To open a closed day, the user edits the shift/rota. Add a "block whole day" toggle to Add Block. Blocks must be visible and editable/deletable.
- Appointment card needs an Activity tab/log acting as an evidence tracker. Log price changes, reminders sent/read, payment links sent, forms sent, disputes, cancellations and policy outcome.
- Appointment card needs cancellation/no-show/refund flow: full refund, deposit only, custom amount, waive/enforce/custom policy, and log everything.
- Payment visibility must show paid in full, deposit paid plus balance, or unpaid outside checkout.
- Staff and location must be editable from the appointment.
- Dragging/moving an appointment must ask whether to notify the client.
- Service line discount must support original price plus discounted price and pre-made discount codes.
- Add multiple services in one pass with multi-select and confirm.
- Forms on appointment card need download/share/native share.
- Add appointment card total/summary pricing section.
- Online, mobile, and in-salon appointment states need clear visual indicators.
- Add booking flow needs custom time, deposit/payment-link request, payment-link time limit, package pending-session prompt, recurring appointment option, pending appointment requests, waitlist access, and possibly multi-date booking.

### Clients

Status: useful and mostly built, but needs package/session/account settings depth.

Built:

- `/app/clients` list with search, sort, filters, tags, outstanding balances, blocked/inactive states.
- `/app/clients/[id]` detail with header, tags, stats, tabs, allergies, notes, forms, wallet, reviews, settings, contact details and bottom actions.
- Contact sheet with Call, WhatsApp, Send and Copy.
- Bulk tags and merge duplicate flows from earlier sign-off work.

Missing / Jun 17:

- Forms need share/native share beside view/download.
- Upcoming appointments should be a horizontal carousel with "View all"; the full list needs filter/sort/search.
- Client record needs packages/pending sessions: sessions bought, used, remaining, and manual adjustment for migrated clients.
- Client settings need platform fee preference at client level.
- Cancellation policy display may change once the business settings hierarchy is signed off.

### Messages

Status: strong prototype surface, but needs store-backed conversation controls and settings.

Built:

- `/app/messages` with client/team/class/business threads, filters and compose.
- `/app/messages/[id]` conversation screen with pinned appointment card, Cancel/Reschedule, plus sheet, media/file actions, payment link card and class/archived states.
- Guardrail already exists: arbitrary group chats cannot be created; class chats are automatic.

Missing / Jun 17:

- Message permission settings: allow messages before booking, after booking only, or disable entirely.
- Do not allow clients to message from web browser; force app download for conversion.
- Block a specific client from messaging separately from booking block.
- Conversation options: mute, pin, mark unread, view shared media, archive, block, delete with confirmations.
- Payment link card should become a real status card: requested, viewed, paid.
- Class thread needs group conversation vs broadcast mode, with broadcast read-only for clients.
- B2B notification preferences are missing and should be tied to messaging/payment events.

### Checkout and quick actions

Status: strong hub-and-spoke checkout built, but missing subscription, code and outstanding-balance refinements.

Built:

- `/app/checkout` with client card, items, discounts, tips, platform fee, totals, deposits, saved cards, multiple payment methods and log-payment style patterns.
- Add service/product catalogue patterns and quantity steppers.
- Platform fee chooser exists at checkout level.
- Payment methods and outstanding balance concepts are partially represented.

Missing / Jun 17:

- Add example screen for outstanding balances cut-off behaviour: show 3-4 rows and "Show all"; reuse this pattern across dense pages.
- Subscription appointment checkout must show if a visit is paid through subscription and how much is deducted from wallet/remaining balance.
- Discount codes need to exist as pre-made selectable codes, not only ad hoc discount amounts.
- Waitlist management needs a home and tie-in to cancelled appointments.
- Add a "book next session" prompt after checkout where the client has remaining package/subscription sessions or a logical recurring next appointment.
- Deposit/payment-link flow must be consistent with Schedule and Messages.

### Services

Status: broad first-pass service dashboard and modules exist; finalisation plan is still mostly unbuilt.

Built:

- `/app/services` catalogue with tabs for Services, Classes, Bundles, Subscriptions.
- `/app/services/[id]` dashboard with edit service, summary cards, photos, variants, products, upsells, resources, forms, notifications, settings, preview and publish/unpublish.
- Canonical offer catalogue now lives in `src/lib/data/offers.ts`.

Missing / finalisation plan:

- Naming/entry polish.
- Editable dashboard summary rows via bottom sheets.
- Mobile map/radius view for mobile services.
- Full variants by duration/staff/location/time/day with search/filter.
- Product preferences need catalogue validation and similar-service suggestions.
- Related services/upsells need group builder.
- Resources need rooms/equipment relationships and timing edits.
- Forms need required toggles and preset wiring.
- Settings need expanded pickers and inheritance from business defaults.

### Bundles

Status: strongest offer type; local plan says bundle phases are shipped/verified.

Built:

- Bundle creation and dashboard patterns including order/gaps, pricing/deposit, tabs and inherited forms/resources.

Remaining:

- Keep aligned with package and subscription terminology.
- Verify checkout/redemption behaviours after package/session work lands.

### Subscriptions and memberships

Status: substantial prototype exists; finalisation still required.

Built:

- Subscription/membership offer type exists in creation and service catalogue.
- Phase A copy/readback helpers were noted as implemented in the subscription plan.

Missing:

- Re-model allowance/shared pool logic.
- Simplify creation wizard.
- Dashboard needs Plan, Members and Advanced tabs.
- Member lifecycle and redemption at checkout need clearer representation.
- Consumer member view and cancellation/offboarding are later.
- Jun 17 explicitly requires subscription appointment checkout visibility.

### Packages

Status: missing as a first-class entry.

Plan:

- Package should be a presentation/entry choice over bundle-like mechanics, not necessarily a fifth independent offer type.
- Add Package card/routing at creation entry.
- Add package shape screen: flexible "choose any X" and multiple-of-same builders.
- Add validity/redemption rules and package dashboard reusing bundle layout.
- Client records and appointment booking must show pending sessions.

### Classes

Status: class offer type exists, but educational course depth remains planned.

Missing:

- Course-vs-class guardrail.
- Recurrence editor and occurrence overrides.
- Agenda/resources depth.
- Duplicate class flow.
- Calendar vendor class detail with revenue/completion.
- Auto-created class messaging with broadcast lane.
- Certificates as marketing trigger.
- Class visibility across Home, Calendar and Analytics.

### Team

Status: Phase 0 sign-off blockers are documented as built and verified on 2026-06-17; deeper workforce flows remain.

Built:

- `/app/team` with Members, Shifts and Pay tabs.
- Invite/member detail/staff schedule/permissions/pay concepts.
- Freelancer and chair-rent logic has a Phase 0 foundation in the docs.

Missing:

- Staff self-service requests: holiday, sick, shift swap and approval.
- Rotating rotas.
- Coverage/team-on-today depth.
- Freelancer own workspace/services.
- Profile/role depth and public holidays later.

### Settings and business rules

Status: missing central surface; this is now a critical dependency.

Built:

- Some settings exist per service.
- `BusinessDefaults` type exists but is not a complete live source of truth.
- Several day-of actions exist without governing settings.

Missing:

- `/app/settings` or business settings hub.
- Inheritance model: business default -> service override -> appointment/client exception.
- Cancellation/no-show/deposit policy deep dive.
- Block-only model must replace older block/unblock plan.
- Running-late and "I'm ready" rules.
- Out-of-hours config and opening-hours cross-links.
- Notification channel package settings.

### Payments, fees and payouts

Status: checkout payment surface exists; payments administration is missing.

Built:

- Checkout fee/deposit/payment-method patterns.
- Some dispute/outstanding balance and team pay concepts.

Missing:

- Payments home.
- Fee education and global/platform fee choices.
- Mock Stripe Connect activation and locked states.
- Balances and payout history.
- Per-staff payouts/commission.
- Outstanding balances dashboard.
- Disputes evidence submission, linked to appointment activity log.
- BNPL Klarna/Clearpay config.

### Analytics

Status: no dedicated `/app/analytics`; Home has partial analytics cards.

Missing:

- Hub-linked analytics overview.
- Day-progress revenue view using collected vs projected.
- Revenue drill-down.
- Sales by category.
- Team performance.
- Occupancy/utilisation and filler-chair opportunities.
- Decision needed: what stays on Home versus moves into Analytics.

### Marketing

Status: `/app/marketing` is currently a hub/stub with inert destination cards.

Missing:

- Marketing hub KPIs and first-run state.
- Blast campaigns.
- Audience segments and campaign reports.
- Automations and notification presets.
- Discount codes and sales.
- Reviews aggregate/request/reply.
- Fill empty slots/waitlist automation.
- Rewards/loyalty.

Jun 17 overlap:

- Discount codes are needed in Schedule/Checkout.
- Notification presets must feed Services.
- Waitlist must connect to cancelled appointments and Marketing/filler-chair logic.

### Locations

Status: static/location concepts exist; no proper location domain.

Built:

- Home location switcher is cosmetic/local.
- Offer-side location model and editor exist.
- B2C location display partially exists.

Missing:

- Location store and `/app/locations` hub.
- Add/edit location with salon/mobile/home/online branching.
- Area privacy for home-based services.
- Per-location hours.
- Real Home switcher backed by data.
- Per-location price/duration variants.
- Customer "Where" booking step.

### Resources

Status: per-service module exists; business-wide catalogue missing.

Built:

- Room/equipment seed data and per-service resource module.

Missing:

- `/app/resources` catalogue and store.
- Add/edit room/equipment.
- Room-equipment linking.
- Partial time allocation and catalogue defaults feeding per-service requirements.

### Products

Status: service product preferences and checkout product plumbing are partial; product catalogue is missing.

Built:

- Service product-preference module with fixed catalogue.
- Checkout product line-item category and quantity stepper.

Missing:

- Unified product model/store.
- `/app/products` catalogue from Hub.
- Add/edit product sheet.
- Search/validation/canonical product names such as Lemon Bottle.
- "Used on similar services" suggestions.
- Retail stock/inventory is V2 and should stay simple.

### Forms

Status: forms appear in service/client/appointment contexts but there is no complete forms product.

Built:

- Client record forms and service-level forms modules.

Missing:

- Required toggles and preset wiring.
- Native share from client/appointment forms.
- Full forms catalogue/builder if required by client sign-off.

### Notifications

Status: activity feeds exist; preferences/settings and paid channel model are missing.

Built:

- `/app/notifications` and `/app/alerts` activity feed style screens.
- Service-level notification stage toggles.

Missing / Jun 17:

- Decide and rationalise one canonical feed; `/app/alerts` likely folds into `/app/notifications`.
- Global B2B notification preferences: events by domain and channel selection.
- In-app notifications are free.
- SMS/WhatsApp/email are paid add-on package channels.
- Paid channels should be greyed/locked unless subscribed.
- Marketing-authored presets need to feed service defaults.

### Business profile

Status: plan only.

Missing:

- Business profile landing.
- Shop details editor.
- Booking link and QR.
- Opening-times summary and address privacy.
- Gallery manager.
- Cancellation policy summary and shop safety.
- Wire B2C listing to real config.

### Integrations

Status: Hub entry exists as a dead row; route/store missing.

Missing:

- `/app/integrations` categorised hub.
- Simulated connect/manage/disconnect screens.
- Accounting, calendar, social, comms and marketplace channel rows.
- BNPL should deep-link to Payments, not duplicate config.
- Sendbird should remain invisible infrastructure, not a user-facing integration.

### Plans and billing

Status: plan only.

Missing:

- Trial/onboarding pricing step rebuild.
- Plans and billing hub.
- Upgrade gate for adding second staff member.
- Past-due recovery and plan comparison.
- Paid notification-channel package needs alignment here.

### Referrals

Status: plan only.

Missing:

- Decide vendor-only, client-only or both.
- Invite/referrals home.
- Track tab and status list.
- How-it-works/terms/FAQ.
- Reward credit and redemption fallback.

### Help, FAQ and legal

Status: plan only.

Missing:

- Help hub shell.
- Search and article flows.
- Contact support/report a problem.
- Legal index.
- Data/privacy self-serve.
- What's new changelog.

### Account and personal preferences

Status: plan only, with some consumer preferences screens available as reference.

Missing:

- Account home/profile hub.
- Edit personal profile and staff bio.
- Sign-in/security.
- B2B notification preferences.
- Appearance/language/accessibility.
- Switch role/client view.

### B2C marketplace

Status: sizeable prototype exists, but strategy is post-B2B.

Built:

- `/c/home` feed, `/c/explore`, salon profile, bookings/inbox/profile/settings style surfaces.
- Current B2C has social-like signals such as followers, likes and comments.

Plan / risk:

- B2C workshop needs baseline benchmark against Fresha, Treatwell and Airbnb-style search.
- B2B remains priority until red line/sign-off.
- Future marketplace should de-emphasise vanity metrics and focus on booking credibility, reviews, availability, results, and local discovery.
- Clarify B2C checkout versus B2B payment flow before expanding.

## Latest Granola feedback mapped to work

### Approved with targeted additions

- Home: approved; add revenue progress time/day markers.
- Schedule layout/views: approved visually; operational flows still missing.
- Clients/Messages/Quick Actions: direction approved; additions listed below.

### Schedule and booking P0

- Appointment Activity tab/evidence log.
- Cancellation, no-show, refund and policy outcome flow.
- Payment state visible on appointment card.
- Staff/location edit.
- Drag-to-move notify-client prompt.
- Discount field and pre-made discount codes.
- Multi-service add.
- Forms download/share.
- Appointment total/summary.
- Online/mobile/in-salon state.
- Block-only model with whole-day toggle; no separate unblock.
- Add booking: custom time, deposit/payment-link, pending sessions, recurring, pending requests, waitlist, possibly multi-date.

### Client P0/P1

- Forms native share.
- Upcoming appointment carousel plus full view.
- Packages/pending sessions on client record.
- Client-level platform fee preference.
- Cancellation policy display after settings hierarchy is resolved.

### Messages and notifications P0/P1

- Message permissions: before booking, after booking only, disable.
- Force app download for client web messaging.
- Block client from messaging separately from booking.
- Paid channel settings: in-app free; SMS/WhatsApp/email paid add-on.
- Channel selection by notification type.

### Checkout and payments P0/P1

- Outstanding balances cut-off example and "Show all" pattern.
- Subscription-funded appointment payment display.
- Book next session prompt after checkout.
- Discount codes.
- Deposit/payment link consistency.
- Waitlist and cancelled appointment handling.

### Product areas to cover in daily sign-off

- Next client focus after main pages: Services and Team.
- Then Hub/Settings, Payments, Analytics, Marketing and remaining Setup areas.

## Recommended rollout plan

### Principle

The deadline is too tight to finish every planned domain at full depth. The goal should be to finalise sign-off flows and UI contracts for every section, while building the P0 cross-flow primitives that affect the main screens. A section can be signed off as "scaffold plus documented V2" if the client agrees that it is not required for launch.

### Daily cadence

- Each morning meeting should sign off the previous day's prototype delta and lock the next day's scope.
- End every day with one written delta note: what was added, what was deferred, what decision is needed from Mathew/client.
- Do not let daily feedback create a new hidden branch of state. Feed changes into this doc and the spreadsheet.

### P0 delivery order

1. Main-screen deltas and sign-off polish:
   - Home revenue markers.
   - Clients forms share and appointment carousel.
   - Checkout outstanding balance cut-off example.
   - Schedule block-only whole-day toggle.
2. Schedule appointment card backbone:
   - Activity tab.
   - Payment status.
   - Cancellation/no-show/refund/policy flow.
   - Staff/location edit.
   - Notify-client prompt after move.
   - Forms share and total summary.
3. Add appointment / booking flow:
   - Multi-service add.
   - Custom time.
   - Deposit/payment link.
   - Pending package/session prompt.
   - Recurring appointments and pending request state.
   - Waitlist entry from cancelled appointment.
4. Settings and notification backbone:
   - Business settings hub/inheritance model.
   - Cancellation/deposit defaults.
   - Message permission settings.
   - Notification channel locks for paid channels.
5. Services and Team sign-off:
   - Service dashboard summary edits and modules.
   - Product/resource/form/notification/settings gaps.
   - Team requests, rota depth and coverage.

### P1 sign-off/scaffold order

6. Payments:
   - Payments home, fee education, balances, payouts, disputes.
   - Align platform fee choice across checkout, client setting and business setting.
7. Marketing and Analytics:
   - Analytics overview and occupancy/filler-chair.
   - Marketing hub, discount codes, waitlist automation, notification presets.
8. Locations, Resources, Products:
   - Stand up business-wide catalogues and link dead Hub rows.
   - Keep advanced stock/resource allocation as later unless explicitly promoted.
9. Packages and Subscriptions:
   - Package entry and client/session redemption.
   - Subscription member/dashboard/checkout clarity.

### P2 / post-sign-off

- Integrations, referrals, Help/FAQ/legal, account preference depth, full B2C marketplace social layer, inventory depth, real OAuth, real payment rails, Sendbird AI and in-chat payments.

## Cross-flow dependencies

- Appointment card Activity log depends on Payments, Messages, Forms, Notifications and Settings events. Build it as a shared appointment-event model, even if demo-seeded.
- Cancellation/refund flow depends on Settings cancellation policy and Payments refund state.
- Pending sessions/packages depend on Packages, Clients and Add Appointment.
- Book-next-session prompt depends on Packages, Subscriptions, Checkout and Schedule availability.
- Discount codes depend on Marketing, Checkout and Schedule.
- Paid notification channels depend on Plans/Billing, Notifications and Marketing.
- Waitlist depends on Schedule cancellations, Marketing filler-chair, and Notifications.
- Platform fee preference must be resolved across Business Settings, Client Settings and Checkout.
- Online/mobile/in-salon appointment state depends on Locations and Services.

## Open decisions for Mathew

1. Provide live-app evidence for `https://vendor.that-time.co.uk/enter-phone`: screenshots, a short screen recording, or another policy-approved way to inspect the authenticated app. The URL is known, but browser-controlled navigation is blocked by policy.
2. Confirm Home Activity chart: keep on Home, shrink it, or move primary analytics to `/app/analytics`.
3. Confirm deposit default behaviour: always-on business/service default, per-appointment override, or both.
4. Confirm multi-date booking for things like patch test plus main appointment: keep, simplify, or defer.
5. Confirm package terminology: should "Package" be visible as a separate creation entry even if built on bundle mechanics?
6. Confirm settings hierarchy: business default -> service override -> appointment/client exception is recommended; approve or revise.
7. Confirm platform fee preference precedence: business default, client-level override, checkout one-off override.
8. Confirm notification paid channel package: which channels are paid at launch - SMS only, SMS plus WhatsApp, or SMS/WhatsApp/email?
9. Confirm whether `/app/alerts` should be retired into `/app/notifications`.
10. Confirm how much of Analytics/Marketing must be functional within the 1.5 week window versus scaffolded for sign-off.
11. Confirm whether B2C social/vanity elements should be toned down now or left for the B2C workshop.

## Live app evidence intake

The live That Time Pro audit is still required, but browser-controlled access to `https://vendor.that-time.co.uk/enter-phone` is blocked by policy. To finish the parity comparison safely, capture either one continuous walkthrough recording or the screenshot set below. Do not paste credentials into files.

### Preferred recording

- Record from the phone-entry page through successful login.
- Narrate or pause on every main navigation item.
- Open each main section once and capture the first screen without scrolling.
- For dense sections, scroll once to the bottom so hidden cards/actions are visible.
- Open one representative detail flow in each core area: appointment detail, add appointment, client detail, message thread, checkout/take payment, service/detail, staff/detail, settings/rules.
- End on any account/settings/menu page so the full IA is visible.

### Screenshot checklist

| Capture | Screens / action | What it proves | Compare against prototype |
| --- | --- | --- | --- |
| Login | Phone entry, password, any OTP/error/loading states | Actual authentication flow and copy | `/onboarding/login`, `/onboarding/login/password` |
| Landing | First screen after login | Default live-app home/dashboard and primary CTA | `/app` |
| Global navigation | Bottom tabs, side menu, hub/menu/account areas | Actual IA and section names | `/app` layout and `/app/hub` |
| Schedule | Main calendar/list views, filters, team/staff view | Calendar model, statuses, staff/location concepts | `/app/schedule` |
| Appointment detail | Existing booking card/detail, actions, payment/refund/cancel states | What the live app already supports on appointments | Schedule appointment-card plan |
| Add appointment | Client select, service select, time select, deposit/payment options | Booking creation flow and missing prototype behaviours | Add-booking P0 plan |
| Clients | Client list, search/filter, detail page, appointments/forms/settings | CRM structure, client record depth | `/app/clients`, `/app/clients/[id]` |
| Messages | Inbox, thread, attachments/actions/settings if present | Messaging permissions, chat depth, class/business threads | `/app/messages` |
| Checkout / payment | Take payment, outstanding balance, methods, discounts, fees | Live till behaviour and fee/payment copy | `/app/checkout` |
| Services / offers | Services list, service detail/edit, packages/subscriptions/classes if present | Existing offer model and terminology | `/app/services`, `/new/*` |
| Team | Members, shifts/rota, pay, staff permissions/detail | Live workforce structure | `/app/team` |
| Settings / rules | Business profile, hours, cancellation, deposits, notifications, payments | Where global rules live today | Settings finalisation plan |
| Marketing / analytics | Any live reporting, campaigns, codes, reviews or fill-empty-slot tools | Whether planned P1 areas already exist live | Marketing and Analytics plans |
| Products / resources / locations | Any inventory, rooms/equipment, locations, mobile/online setup | Existing operational setup depth | Products, Resources, Locations plans |
| Account / billing / support | Profile, plans/billing, help/legal, integrations, referrals | Remaining setup/account structure | Account, Plans, Help, Integrations plans |

### Notes template for each captured screen

- Live screen name:
- Live URL/path if visible:
- Main actions:
- Data shown:
- Settings/rules exposed:
- Prototype equivalent:
- Already covered in prototype:
- Missing from prototype:
- Live-only feature to preserve:
- Sign-off priority: P0 / P1 / P2

## Agent handoff checklist

Before changing a section:

1. Read this file and the matching `docs/migrations/*-finalisation-plan.md`.
2. Check `docs/sign-off-changes.md` and the Jun 17 Granola notes above for superseding feedback.
3. Inspect existing routes/components before adding new primitives.
4. Reuse `src/components/ui`, app frame patterns and existing Zustand/data conventions.
5. Add smoke coverage for new routes, empty states and state variants.
6. Update this document and the tracker spreadsheet when a status changes.
7. Keep live-app audit items marked pending until screenshots/screen recording or another policy-approved access path lets the authenticated app be reviewed.

## Immediate next actions

- Complete live That Time Pro audit from screenshots/screen recording or policy-approved access to `https://vendor.that-time.co.uk/enter-phone`.
- Build P0 main-screen deltas: Home revenue markers, Schedule block-only whole-day toggle, Clients forms share/carousel, Checkout cut-off example.
- Start Schedule appointment-card backbone, because the Jun 17 feedback clusters there and it drives many downstream screens.
- Lock Settings hierarchy early; without it, cancellation policy, deposits, notifications, platform fees and client overrides will keep drifting.
- Use the daily meetings to classify every new ask as P0 sign-off, P1 scaffold, or P2 post-sign-off.
