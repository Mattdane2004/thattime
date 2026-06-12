# Brief for Matt's session — RESUME, now building with the shared component library

Your previous PR is merged; your branch is freshly based on `main`. **Big change:
there is now ONE canonical, token-driven component library at `@/components/ui`.
From now on, compose every screen from it.** Stop hand-writing primitives with
inline Tailwind, and stop adding to `onboarding2/controls.tsx` or `app/ui.tsx` —
those are being retired in favour of `@/components/ui`.

**First, orient yourself:** read `context/atomic-design.md` and open
`src/components/ui/index.ts` (the barrel — your full inventory).

## What's in the library (all warm-palette / dark-mode-ready)

- **Atoms:** Button, Input, Textarea, Label, Badge, Avatar, Chip, Spinner,
  Separator, Switch, Checkbox, CheckCircle
- **Molecules:** Card, Field, ListRow, SegmentedControl, EmptyState, StatTile,
  RadioGroup, Tabs, Dialog, Sheet, Toaster/`toast`, PhoneInput, OtpInput,
  SelectCard, CheckRow, SocialButtons, OrDivider, ProgressDashes

## Mapping from the old components

**Drop-in — identical (or superset) API, just import from `@/components/ui`:**
`Field`, `PhoneInput`, `OtpInput`, `SelectCard`, `CheckRow`, `CheckCircle`,
`SocialButtons`, `OrDivider`, `ProgressDashes`, `inputClass`.

**Maps with a small change:**
- `PrimaryButton` → `<Button variant="primary" fullWidth>`
  ⚠️ `Button` does **not** yet have `loading` or the coral (`tone="orange"`)
  variant. If you need either, **add it to `src/components/ui/atoms/Button.tsx`**
  (don't recreate PrimaryButton) and ping Austin.
- `GhostButton` → `<Button variant="ghost">` · `DarkButton` → `<Button variant="primary">`
- `BottomSheet` → `<Sheet>` + `<SheetContent>` (Radix-based; check the props)
- `StatusPill` → `<Badge tone="neutral|success|warning|danger">`
- `Segmented` → `<SegmentedControl>` · `PermissionDialog` → `<Dialog>`

## Colour / token rules (the palette is already wired)

- **Never** use inline hex or arbitrary Tailwind colours (`bg-[#…]`, `text-[#…]`).
- Use semantic classes / component variants: `bg-surface`, `bg-canvas`,
  `text-fg-primary`, `text-muted`, `text-secondary`, `border-border`, `bg-brand`,
  status `success/warning/danger`. (`text-navy`/`bg-navy` still work — they're warm now.)
- The brand **accent** is still a placeholder (cyan) pending the real hex — don't
  hard-code an accent colour; use `bg-brand` / `text-brand` so it swaps centrally.

## Need a new shared component?

Add it to `src/components/ui` (`atoms/` or `molecules/`), export it from the
barrel, and add a render check to `smoke.tsx`. Do **not** add it to
`controls.tsx`/`app/ui.tsx`.

## Gate before every commit (keep `main` green; don't squash)

```
npx tsc --noEmit && npx next lint && npm run smoke
```
