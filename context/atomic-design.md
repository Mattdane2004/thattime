# Atomic design — progress log

Living log for the component library / design-system effort. **Status: BUILDING**
— components are being built *ahead of* the tokens (waiting on Austin's Figma
shadcn-variables JSON). Components use current token classes via cva; when the
JSON lands the token classes remap centrally (one pass) and variant APIs stay stable.

## Approach (production-grade, shadcn-aligned)
- **cva + `cn`** (`class-variance-authority` + `clsx` + `tailwind-merge`,
  `src/lib/utils.ts`) — the shadcn pattern; stable variant APIs.
- **Radix** for interactive primitives (Switch, Checkbox, Dialog/Sheet, Tabs,
  Select) — real a11y; added per component as built.
- forwardRef + focus-visible rings + aria on every component.

## Progress (all on `rollout`, gate-green; barrel `@/components/ui`)
- **Wave 1 — atoms ✅** Button, Input, Textarea, Label, Badge, Avatar, Chip,
  Spinner, Separator, Switch, Checkbox.
- **Wave 2 — molecules ✅** Card, Field, ListRow, SegmentedControl, EmptyState, StatTile.
- **Wave 3 — Radix primitives ✅** RadioGroup, Tabs, Dialog, Sheet (bottom),
  Toast (`<Toaster/>` + `toast()`).
- **Organisms — NOT duplicated.** ScreenHeader/AppTabBar/AppFrame already live in
  `src/components/app/`, and OnboardingChrome in `onboarding2/`. Folding those
  (+ Matt's `app/ui.tsx` primitives that overlap ours: Sheet/Segmented/StatusPill)
  into `ui/` is the **Phase-2 consolidation** — coordinate with Matt.

## Componentisation (Phase-2) — IN PROGRESS

Reality: canonical `ui/` (mine) was imported by **1 file**; the app actually runs on
Matt's `onboarding2/controls.tsx` (**41 imports**) + `app/ui.tsx` (**10**). Consolidation
strategy (staged, low-conflict):

- **Stage 1 ✅ (additive, no Matt conflict):** ported the 8 onboarding **gap** components
  into canonical `ui/` with **identical prop APIs** (so Stage 2 is a pure import-path
  swap, not a JSX rewrite): `CheckCircle` (atom) + `PhoneInput`, `OtpInput`, `SelectCard`,
  `CheckRow`, `SocialButtons`, `OrDivider`, `ProgressDashes` (molecules). Smoke-gated.
  Overlaps already in `ui/`: PrimaryButton→Button, Field→Field, BottomSheet→Sheet,
  StatusPill→Badge, Segmented→SegmentedControl, PermissionDialog→Dialog.
- **Stage 2 (PENDING — touches Matt's files):** codemod screen imports
  `onboarding2/controls` + `app/ui` → `@/components/ui`; map PrimaryButton→`Button
  variant="primary"` etc.; then retire the duplicate files. Coordinate/brief Matt.
- **Still a gap in `ui/`:** `MiniCalendar`, `TimeChips` (app/booking) not yet ported.

## Remaining before "done"
1. **Tokens** — ✅ *pipeline + warm-palette + app-wide repoint landed.*
   - `scripts/build-tokens.mjs` → `src/styles/tokens.css` (channel pattern: `--x: r g b`,
     shadcn-style, so opacity modifiers work) + `tokens.tailwind.ts`. Mirrors the Figma
     collections 1:1; **preserves alias chains** so primitive swaps propagate.
   - **Warm Neutrals/Black ramp** dropped into the `grey` primitives (real brand neutral,
     not placeholder): grey-950 `#080706` … 50 `#FFFFFF`. Drives text/surface/border/CTAs.
   - **App-wide swap done centrally:** legacy Tailwind keys (`navy`/`canvas`/`surface`/
     `border`/`muted`/`secondary`/`success`/`warning`/`danger`) **repointed at the warm
     tokens** via the channel wrapper `v()`. ~2,003 named-class usages now token-driven +
     dark-mode-ready, zero per-file edits, `/opacity` modifiers intact.
   - **Figma semantic values were wrong for use → corrected** in `scripts/correct-tokens.mjs`
     (re-runnable, chained into `npm run tokens`, survives re-export): text hierarchy now
     separates (Light primary `#080706` → secondary `#3A3632` → muted `#807B75` → disable
     `#E5DDD4`; Dark mirrored) and **shadows white→black**. Legacy `muted`/`secondary` now
     point at the corrected semantic tokens. Delete entries when Figma is fixed at source.
   - **Cool blacks & greys purged** (`scripts/migrate-cool.mjs`, 2nd pass): `#111`/pure
     `black` → `fg-primary`/`#0F0E0C`; cool `fog` `#F4F4F6`, old border `#E5E5E8`, slider
     `#D6D6DA`, slate `#4A5468` → warm ramp; Tailwind `slate/gray/zinc/neutral` classes →
     warm `grey`. Audit proves **0 cool greys remain** (only a green success tint, kept).
     Product shell (`bg-canvas`) confirmed warm `#FDF6EE`; the cool one was onboarding `fog`.
   - **Arbitrary-hex navy purged** (`scripts/migrate-navy.mjs`, 173 edits / 27 files):
     `#14181F`/`#0F1A2E` cool "ink" → `fg-primary` token (classes) or `#080706` (inline/
     SVG); `rgba(15,26,46,…)` navy shadows → warm `rgba(8,7,6,…)` (incl. tailwind.config
     phone/card); cool chrome greys → warm ramp. Category palette left intact. Gate green.
   - **Still pending:** (a) **brand ACCENT hex** — `brand`/`coral` still cyan/coral
     placeholder; (b) status tints (`#FEF3C7`/`#B45309`…) still literal — tokenise later;
     (c) **componentisation NOT started** — screens are still bespoke inline Tailwind, do
     NOT compose from `ui/`; 3 component folders not consolidated (Phase-2); (d) Mobile/
     Tablet type HELD. Figma round-trip deferred until after steps 1–4 (Austin's call).
2. **Phase-2 consolidation** — de-dupe the 3 component folders into `ui/` (with Matt).
3. **Phase-2 migration** — swap screens' inline Tailwind onto `ui/` components.

## Direction (decided)

- **Foundation = shadcn-based.** Austin will export his **Figma variables (built
  on top of shadcn)** as JSON and feed them in; that JSON is the source of truth
  for tokens (colour, type scale, spacing, radii, elevation). Wire it into
  CSS variables + `tailwind.config.ts` when it lands.
- **Steps 1–3 (canonical inventory, component API, foundations) are owned by
  Austin** (driven from Figma), not built ad-hoc in code.
- Because the foundation is shadcn, the **provisional custom atoms below will be
  reconciled with / replaced by shadcn-style components** once the tokens land —
  treat them as a reference, not the final API.
- **Scope caveat:** a lot of the current UX wireframes are feature-bloat that
  will be trimmed in the UI phase. **Don't over-build components for screens that
  may be cut** — build the library against what survives.

## Built so far (provisional — on the `rollout` branch)

- `src/components/ui/atoms/Button.tsx` — variants primary/secondary/ghost/danger, sizes md/sm, `fullWidth`
- `src/components/ui/atoms/Input.tsx` — optional label → field group
- `src/components/ui/atoms/Chip.tsx` — `selected` toggle pill
- `src/components/ui/index.ts` — barrel (`@/components/ui`)
- All token-driven, smoke-gated. **Not merged to `main`** (WIP, pending shadcn rework).

## Key finding — components are scattered & duplicated (must consolidate)

Primitives already exist in **three** places and overlap:

| Where | Components |
|---|---|
| `src/components/ui/` (Austin) | Button, Input, Chip |
| `src/components/app/ui.tsx` (Matt) | AppHeader, SectionLabel, Segmented, Sheet, DarkButton, GhostButton, StatusPill, MiniCalendar, TimeChips |
| `src/components/onboarding2/controls.tsx` (Matt) | PrimaryButton, Field, PhoneInput, OtpInput, SelectCard, CheckCircle, CheckRow, SocialButtons, OrDivider |

Overlaps: Button = DarkButton/GhostButton/PrimaryButton · Input = Field · Chip ≈ TimeChips · StatusPill = Badge · Segmented = SegmentedControl · Sheet = BottomSheet.
→ The real job is **consolidate all three into one canonical `src/components/ui/`**,
de-duped. This touches Matt's code/screens, so it must be **coordinated with Matt**.

## Target inventory (a comprehensive system, not 3 atoms)

**Foundations (Figma variables/styles):** colour tokens + category palette · a
*named* type scale (replacing ad-hoc `text-[Npx]`) · spacing & radii · elevation/
shadows · iconography (lucide).

**Atoms:** Button, Input, Textarea, Toggle, Checkbox/Radio, Chip, Badge/StatusPill,
Avatar, Icon, Divider, Spinner, OTP, PhoneInput.
**Molecules:** Field, Card, ListRow, SegmentedControl, BottomSheet, SelectCard,
EmptyState, StatTile, TimeChips, MiniCalendar, SocialButtons, Toast, ProgressBar, Stepper.
**Organisms:** ScreenHeader, AppTabBar, AppFrame/PhoneShell, OnboardingChrome.

## When we resume — order of play

1. Land the **shadcn foundation** from Austin's Figma JSON (tokens → CSS vars + tailwind).
2. **Reconcile** the 3 component sources into canonical `ui/`, de-duped (with Matt).
3. Rework the provisional atoms to shadcn conventions.
4. Build out the inventory against the *trimmed* screen set.
5. Push to Figma via the `/figma-generate-library` round-trip; sync changes back.
