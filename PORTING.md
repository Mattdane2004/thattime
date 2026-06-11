# Consolidation — port tracker

Repurposing this repo into **one Next.js + TypeScript product app** (now at the
**repo root**). Legacy source `that-time-app/` is kept **on disk, gitignored**
as the porting reference (135 route files). See
`memory/thattime-consolidation.md` for the why.

**Workflow per screen:** port JS→TS + react-router→App Router (`useNavigate`→
`useRouter`, `<Link>`, `useOutletContext`→ Zustand store), type its mock data
into `src/lib/data/*`, defer cross-screen mutations, add a `smoke.tsx` render
check. Gate every push on **`next lint` + `tsc --noEmit` + `npm run smoke`** all
green. One commit per screen.

## Status

- **Done so far:** ~19 routes / ~26 surfaces. App deploys from root; runs via
  `npm run dev` (Turbopack). Foundation: tokens, `src/lib/types`, wizard + (todo)
  app Zustand stores.
- **Verified flows:** Clients (list→profile), Messages (list→thread), Services
  (list→dashboard→products), service wizard (type→basics→locations→staff→price→
  create), Setup guide, full Hub navigation, onboarding→app handoff.

## Backlog checklist (priority order)

### 1 — Wizard branches (complete offer creation for every type)
- [x] `wizard/SubscriptionType.jsx` → `/new/subscription-type`
- [x] `wizard/SubscriptionBenefits.jsx` → `/new/subscription-benefits`
- [x] `wizard/SubscriptionBilling.jsx` → `/new/subscription-billing`
- [ ] `wizard/FrequencySessions.jsx` → `/new/frequency-sessions`
- [ ] `wizard/FrequencyBilling.jsx` → `/new/frequency-billing`
- [x] `wizard/BundleServices.jsx` → `/new/bundle-services`
- [~] `wizard/BundleOrderGaps.jsx` → deferred (drag-to-reorder refinement)
- [x] `wizard/BundlePricing.jsx` → `/new/bundle-pricing`
- [ ] `wizard/ClassParticipants.jsx` → `/new/class-participants`
- [ ] `wizard/ClassDetails.jsx` → `/new/class-details`
- [ ] `wizard/ClassSchedule.jsx` + `ClassScheduleTimes.jsx` → `/new/class-schedule`
- [ ] `wizard/ClassLocation.jsx` + `ClassRemoteSetup.jsx` → `/new/class-location`
- [ ] `wizard/ClassStaff.jsx` → `/new/class-staff`
- [ ] `wizard/ScheduleLocation.jsx` → `/new/schedule-location`

### 2 — Offer dashboards (view/manage any offer type)
- [ ] `ClassDashboard.jsx`, `BundleDashboard.jsx`, `SubscriptionDashboard.jsx`
- [ ] `ServicePreview.jsx`, `PhotoGallery.jsx`

### 3 — Module editors (`routes/modules/*`, 56 files)
- [ ] Variants (+ editors), Forms, Resources, RelatedServices (+ forms)
- [ ] Classes (bookings/agenda/materials/certificates/equipment/models)
- [ ] Offers (pricing/rules/visibility/link), settings (+ sheets), Notifications

### 4 — Client & team sub-screens
- [ ] `main/client/*` (appointments, record, wallet, reviews, settings, details)
- [ ] `team/*` (QuickAdd, GuidedSetup, StaffView, UpgradePlan, PaySetupFlow)

### 5 — Misc + sheets
- [ ] `ImportData`, `Alerts`, `RateClient`, `Checkout`, `Notifications/*`
- [ ] `components/sheets/*` (12 modals) — port as shared components

## Notes
- Shared app state (teamMembers, client mutations, toasts, savedOffers) still
  needs a Zustand `useAppStore` slice — build it when a screen first needs
  cross-screen persistence (the wizard branches mostly extend `useWizardStore`).
- `ClassDetails` type in `src/lib/types/offer.ts` is left open; type it while
  porting the class wizard/dashboard.
