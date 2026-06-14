# Goal prompt — full UI componentisation rollout (self-directed)

**This is the north star for the UI rollout. Iterate against it, wave by wave,
until the Definition of Done is met. Work on `rollout`. Never merge to `main`.**

## Mission

Get *almost the entire* thattime app composed from the canonical design system
at `@/components/ui` (atoms → molecules → organisms), so that every screen is
**layout + data + component instances** with no bespoke inline Tailwind for any
*recurring* UI pattern. A screen may keep one-off layout/spacing wrappers; it
must not hand-roll a button, card, list row, sheet, toggle, tab, chip, badge,
avatar, rating, stat tile, section header, empty state, or settings group.

### Why this matters (the chain it unblocks)
1. Export screens to Figma as a real **component design system** (instances, not
   bespoke frames).
2. Design/refine the system **in Figma**.
3. **MCP round-trip** — read Figma styles and update tokens/components in code.
4. Finish a full **UI rollout** off that system.
5. **Matt is unblocked in parallel**: with the library complete he builds new
   screens from `@/components/ui` independently — his work never waits on the
   rollout. Tight deadline → this must wrap on time.

## Design principle (decided by Austin)

**One design system, but do NOT homogenise distinct designs.** The two surfaces
intentionally differ:
- **Business app (`/app`, `/new`, onboarding)** — ink/navy language.
- **Consumer app (`/c`)** — coral-accented language.

When a use case genuinely differs, **make separate components or a tone/variant
prop** (`tone="ink" | "coral"`, `variant=…`). Prefer a **variant over a fork**
when only the accent differs; make a **separate component** when structure or
behaviour differs (e.g. business 5-star `StarRating` vs consumer compact
`RatingLabel` — these are different components, keep both). Unify only true
duplicates. When a merge-vs-separate call is non-obvious and high-impact,
surface it rather than guess.

## Definition of Done (measurable)

- [ ] Every recurring pattern exists as a library component; screens use
      instances. No screen-local re-definitions of a shared pattern remain
      (grep for duplicated `function Card/Row/Toggle/Stars/...` across screens).
- [ ] Parallel component layers folded into `@/components/ui`:
      `components/client/shared.tsx`, `components/app/*` chrome, any inline
      per-screen components → promoted or clearly owned by the barrel.
- [ ] Arbitrary inline hex (`bg-[#…]`, `text-[#…]`, SVG fills, shadows) removed
      except a tracked short-list of deliberately-pending tokens (status tints,
      brand accent). Run/extend `scripts/migrate-*.mjs`; everything else uses
      semantic token classes or component variants.
- [ ] Each migrated screen's inline Tailwind is reduced to
      layout/spacing + component instances.
- [ ] `@/components/ui/index.ts` is the single source; `smoke.tsx` covers every
      new/changed component.
- [ ] Gate green at **every** commit: `npx tsc --noEmit` && `npx next lint`
      (unused = fatal) && `npm run smoke`. Small commits, no squash, push
      `rollout` regularly.
- [ ] `context/atomic-design.md` reflects reality (Phase-2 done) and the
      checklist below is fully ticked.

## Per-wave workflow

1. Pick the next unticked cluster below.
2. Identify its recurring patterns; for each, add/extend a **token-driven,
   variant-based, a11y** component in `@/components/ui` (cva + `cn` where it
   fits; forwardRef + focus-visible; `tone` for surface accent).
3. Migrate every screen in the cluster to instances. Preserve appearance unless
   unifying a clear duplicate (note any intentional visual change in the commit).
4. De-hex (semantic classes / variants).
5. Add smoke coverage. Run the gate. Commit small. Push `rollout`.
6. Tick the cluster; jot notes/decisions here.
7. Repeat. Stop only when DoD is met or a design decision blocks you (surface it).

## Guardrails

- Behaviour, routes, data, and store APIs unchanged — this is a styling/structure
  migration only.
- Keep `AppFrame`, the frame-scoped overlays, and the token pipeline intact.
- Don't rewrite a teammate's in-flight file unnecessarily; coordinate if needed.
- `rollout` only; keep `main` green; never auto-merge to `main`.

## Cluster checklist (status: [ ] todo · [~] partial · [x] done)

**Foundations / shared**
- [~] Canonical barrel established; primitives consolidated (Stages A–C done)
- [ ] Fold `components/client/shared.tsx` (Avatar/Stars=RatingLabel/GridTile) into ui
- [~] App chrome organisms: AppHeader✅/SectionLabel✅/BackHeader✅/ScreenHeader✅/WizardChrome✅ now in the barrel (ScreenHeader+WizardChrome relocated to ui/organisms, ~38 importers codemodded). Still: AppTabBar, ClientTabBar, AppFrame, AppointmentSheet, QuickActions, UpNextCard (these import the barrel → relocate carefully to avoid cycles, or leave owned in components/app). NOTE: ScreenHeader (compact nav bar) and BackHeader (hero header) kept SEPARATE per Austin's "separate when use cases differ".
- [~] Library gaps: StarRating✅, ToggleRow(tone)✅, SettingsGroup✅, Tag✅, BackHeader✅ added. Still: RatingLabel, ChipGroup/SelectablePills, SheetRow/OptionRow, stat/info cards as needed

**Business app `/app`**
- [ ] Home (`app/page.tsx`)
- [ ] Schedule (`schedule`)
- [~] Clients — done: `clients/page` (Tag), `[id]/reviews` (StarRating+BackHeader), `[id]/settings` (ToggleRow+SettingsGroup+BackHeader), `[id]/wallet` (BackHeader; reward cards/sheets still inline). Todo: `clients/[id]` (1158 lines), wallet reward internals
- [ ] Messages (`messages`, `messages/[id]`)
- [ ] Checkout (`checkout`)
- [ ] Hub + Marketing + Alerts + Setup (`hub`, `marketing`, `alerts`, `setup`, `setup/import`)
- [ ] Services (`services`, `services/[id]` + modules: forms/photos/preview/products/related/resources/variants/settings)
- [ ] Team (`team`, `team/[id]`, `[id]/pay`, `[id]/permissions`, `[id]/schedule`, `team/invite`, `team/pay/[runId]`)
- [ ] Notifications (`notifications`)

**Wizard** — [ ] `/new/*` (basics, type, price, locations, staff, class-*, bundle-*, subscription-*)

**Onboarding (ink)** — [ ] `/onboarding/*` (B2B + staff) · [ ] `/client/*` (B2C onboarding)

**Consumer app `/c` (coral)**
- [ ] home, explore, story/[id], post/[id]
- [ ] salon/[id], salon/[id]/book, salon/[id]/reviews
- [ ] create, checkout, confirmed, bookings, bookings/[id]
- [ ] inbox, inbox/[id], notifications, profile
- [ ] settings (+ account, notifications, payments, wallet)

## Decisions / notes log
- (Stage A–C) Canonical `@/components/ui`; legacy `app/ui.tsx` + `onboarding2/controls.tsx` retired; Radix Sheet replaced by frame-scoped Sheet.
- (Tokens) PR #7's cool-navy `#14181F` purged via migrate-navy (→ `fg-primary`).
- StarRating (5-star, business) and RatingLabel (compact "4.8 ★ (n)", consumer) are SEPARATE components — keep both.
