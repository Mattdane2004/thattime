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

## Remaining before "done"
1. **Tokens** — ✅ *pipeline landed* (`scripts/build-tokens.mjs` → `src/styles/tokens.css`
   + `tokens.tailwind.ts`, wired into globals + tailwind). Resolver mirrors the Figma
   collections 1:1 (Primitives / Style / Responsiveness) as kebab CSS vars and
   **preserves alias chains** so swapping placeholder primitive hexes propagates.
   Added *additively* — existing `navy`/`coral`/`surface` unchanged. **Still pending:**
   (a) real brand hexes from Austin → drop into `Tokens/Mode 1`, re-run `npm run tokens`;
   (b) the `navy`→`brand` component remap pass once hexes land;
   (c) Mobile/Tablet type scale (HELD — undecided; only layout vars vary per breakpoint).
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
