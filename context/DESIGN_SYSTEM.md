# Design system — that:time

**Read this before touching any screen.** It is the contract for building and
migrating UI in this repo. One design system, two product surfaces, one canonical
component library. The goal: every screen is **layout + data + component
instances** — no hand-rolled primitives, no inline hex.

---

## 0. The one rule that matters

**Compose every screen from `@/components/ui` (and `@/components/ui/consumer` for
the B2C app). Never hand-write a primitive (button, input, card, list row, sheet,
toggle, tab, chip, badge, avatar, rating, stat tile, header, empty state) and
never use an inline hex colour (`bg-[#…]`, `text-[#…]`).** A screen may keep
one-off layout/spacing wrappers (`flex`, `grid`, padding) — nothing else.

If a pattern you need doesn't exist in the library yet, **add it to the library**
(see §7), don't inline it in the screen.

> ⚠️ **Branch note:** the canonical library currently lives on the **`rollout`**
> branch. To build with it, branch off `rollout` (or wait until it's merged to
> `main`). On plain `main` the old scattered primitives may still be present.

---

## 1. Two surfaces, one system

The app has two product surfaces with **deliberately different visual languages**.
They share the same library, tokens, phone frame, and conventions — but each has
its own accent and, where the use case differs, its own components. **Do not
homogenise them.**

| | **B2B — business app** | **B2C — consumer app** |
|---|---|---|
| Routes | `/app/**`, `/onboarding/**`, `/new/**` | `/c/**` |
| Visual language | Ink / navy, fog & white surfaces | Coral accent, social-first |
| Accent token | `navy` / `fg-primary` | `coral` |
| Tab bar | `AppTabBar` (Home/Schedule/Clients/Message/Add) | `ClientTabBar` (Home/Find/Message/Schedule) |
| Page frame | `AppFrame` (shared phone shell) | `AppFrame` (same shell) |
| Sub-page header | `ScreenHeader` (compact nav bar) · `BackHeader` (hero title + sub) | bespoke inline headers + `ClientTabBar` |
| Avatar | `Avatar` (initials, from the barrel) | `consumer.Avatar` (category-tinted, ring-coral option) |
| Rating | `StarRating` (5-star row) | `consumer.Stars` (compact "4.8 ★ (765)") |
| Toggle | `Toggle` (WizardChrome) · `ToggleRow tone="ink"` | `consumer.Toggle` (coral) · `ToggleRow tone="coral"` |
| Summary rows | inline / `ListRow` | `consumer.SummaryRow` (coral `accent`) |
| Wizard | `WizardChrome` (`/new/*` offer creation) | — |

**Why some components are duplicated on purpose:** `StarRating` (5 stars) and
`consumer.Stars` (a numeric label) are *different components*, not restyles. The
business `Avatar` is initials; the consumer `Avatar` is category-tinted. When a
use case genuinely differs, prefer a **separate component** (or a `tone`/`variant`
prop when *only the accent* differs, e.g. `ToggleRow tone="ink"|"coral"`). Unify
only true duplicates.

---

## 2. Where everything lives

```
src/components/
  ui/                         ← THE design system (single source of truth)
    index.ts                  ← the barrel — import from "@/components/ui"
    atoms/                    ← Button, Input, Badge, Avatar, Chip, Tag, …
    molecules/                ← Card, ListRow, Sheet, ToggleRow, StarRating, …
    organisms/                ← AppHeader, BackHeader, ScreenHeader, WizardChrome, ClientTabBar
    consumer.tsx              ← B2C (coral) components — import "@/components/ui/consumer"
  app/                        ← app-owned components that COMPOSE the barrel
                                (AppFrame, AppTabBar, AppointmentSheet,
                                 QuickActions, UpNextCard) — not re-exported from
                                 the barrel to avoid import cycles
  onboarding2/                ← onboarding shell/chrome (Shell, chrome, MobileFrame,
                                PhotoCarousel, RouteTransition)
  illustrations/              ← line-art SVGs
src/lib/
  tokens/categories.ts        ← service-category palette (Hair/Colour/Barbering…)
  data/                       ← one typed module per domain (offers, team, b2c, …)
  store/                      ← one Zustand store per concern (appStore, teamStore, …)
src/styles/tokens.css         ← generated design tokens (warm palette)
scripts/build-tokens.mjs      ← token pipeline (npm run tokens)
tailwind.config.ts            ← semantic token classes + fonts
```

**Atomic design:** atoms → molecules → organisms, all flowing through the single
barrel `@/components/ui`. The B2C surface adds a namespaced sub-module
`@/components/ui/consumer` (kept separate so its coral, category-tinted
`Avatar`/`Stars` don't collide with the business primitives).

**Retired — do NOT recreate or import these (they're gone):**
`components/app/ui.tsx`, `components/onboarding2/controls.tsx`,
`components/client/shared.tsx`. Everything they had now lives in `@/components/ui`
(or `…/consumer`).

---

## 3. Inventory — `import { … } from "@/components/ui"`

**Atoms**
- `Button` (cva: `variant` primary/secondary/ghost/danger/solidDanger, `size` md/sm/icon, `fullWidth`)
- `Input`, `Textarea`, `Label`, `Badge` (tone neutral/solid/outline/success/warning/danger)
- `Avatar` (initials), `Chip` (selectable pill), `Spinner`, `Separator`
- `Switch`, `Checkbox`, `CheckCircle`
- `PrimaryButton` (full-width pill, `tone="ink"|"orange"`, `loading`), `DarkButton`, `GhostButton`
- `StatusPill` (tone light/dark/danger/amber), `Tag` (`emphasis` → solid ink)

**Molecules**
- `Card`, `Field`, `ListRow`, `SegmentedControl` (generic, bordered), `EmptyState`, `StatTile`
- `RadioGroup`/`RadioGroupItem`, `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`
- `Dialog`/`DialogTrigger`/`DialogContent`/… (Radix), `Toaster` + `toast()`
- **Frame-scoped overlays** (render inside the phone frame): `Sheet`, `BottomSheet`, `PermissionDialog`
- `Segmented` (sliding-pill, string options), `PasswordField`
- `MiniCalendar`, `TimeChips`, `timeSlots`
- `ToggleRow` (`tone="ink"|"coral"`, `title`/`sub`/`divider`), `SettingsGroup`, `StarRating`
- Onboarding/form: `PhoneInput`+`inputClass`, `OtpInput`, `SelectCard`, `CheckRow`, `SocialButtons`, `OrDivider`, `ProgressDashes`

**Organisms**
- `AppHeader` (B2B tab header: title + date + bell + avatar), `SectionLabel`
- `BackHeader` (hero sub-page header: back + 24px title + sub + optional action)
- `ScreenHeader` (compact nav bar: title + onBack + border)
- `WizardChrome`: `WizardTitle`, `WizardFooter`, `FieldLabel`, `Toggle`, `fieldInput`, `TOTAL_STEPS`
- `ClientTabBar` (B2C tab bar)

**Consumer — `import { … } from "@/components/ui/consumer"`**
- `Avatar` (category-tinted initials, `ring`), `Stars` (compact rating + count)
- `OfferTypeBadge` (class/bundle/membership), `GridTile` (Instagram-style)
- `Toggle` (coral switch), `SummaryRow` (label/value, coral `accent`)

**App-owned (compose the barrel; import from `@/components/app/*`)**
- `AppFrame` (phone shell — wraps every product surface), `AppTabBar`,
  `AppointmentSheet` (the suspend/restore booking sheet), `QuickActions`, `UpNextCard`

---

## 4. Tokens & colour

Use **semantic token classes only** — they're wired to a warm palette and are
dark-mode-ready, so a token change propagates to every screen with zero edits:

- Surfaces: `bg-canvas`, `bg-surface`, `bg-fog`, `bg-white`
- Text: `text-navy` / `text-fg-primary` (primary ink), `text-secondary`, `text-muted`
- Lines: `border-border`
- Accents: `bg-brand` / `text-brand`, `bg-coral` / `text-coral` (B2C)
- Status: `success`, `warning`, `danger`
- Service categories: from `src/lib/tokens/categories.ts` (don't hardcode)

**Never** write `bg-[#hex]` / `text-[#hex]` / inline `style` colours. New
colours/spacing/radii go into the token pipeline (`scripts/*.mjs`, `npm run
tokens`) and `tailwind.config.ts`, then get used by name.

_Known-pending tokens:_ the brand **accent** hex (`brand`/`coral`) is still a
placeholder, and a few status tints (amber `#FEF3C7`/`#B45309`) are not yet
tokenised — use `bg-brand`/status classes so they swap centrally later.

---

## 5. Building a NEW flow (the happy path for an agent)

1. **Branch off `rollout`** (the library lives there).
2. **Pick the surface.** B2B (`/app`, `/onboarding`, `/new`) = ink language; B2C
   (`/c`) = coral language. Match the table in §1.
3. **Compose the screen** = layout wrappers + component instances from
   `@/components/ui` (+ `…/consumer` for B2C). Chrome:
   - B2B tab page → `AppHeader` + `AppTabBar`, inside `AppFrame`.
   - B2B sub-page → `BackHeader` (hero) or `ScreenHeader` (nav bar).
   - Offer wizard step → `WizardChrome` (`WizardTitle`/`WizardFooter`/`TOTAL_STEPS`).
   - B2C → `ClientTabBar` + `consumer.*` components.
   - Bottom sheets / dialogs → `Sheet`/`BottomSheet`/`PermissionDialog` (frame-scoped — **not** Radix portals, which escape the phone frame).
4. **Tokens only** — semantic classes, no inline hex.
5. **Data & state** go in `src/lib/data` and `src/lib/store` — one module per
   domain; **grep for an existing one before creating** a new file.
6. **Gate green, one commit per screen** (see §8).

## 6. Migrating an EXISTING flow

1. Identify recurring inline patterns (buttons, cards, rows, sheets, toggles,
   headers) and replace each with the library component.
2. Delete any screen-local primitive definitions; import from the barrel instead.
3. De-hex to semantic tokens.
4. Preserve appearance unless you're unifying a clear duplicate (note it in the
   commit).
5. Gate green.

---

## 7. Adding a new shared component

1. Create it in `src/components/ui/{atoms|molecules|organisms}/` (or
   `consumer.tsx` for B2C-only). Token-driven; for interactive atoms follow the
   shadcn pattern (`cva` + `cn`, `forwardRef`, `focus-visible` ring, aria).
2. Export it from `src/components/ui/index.ts` (the barrel).
3. Add a render check to `smoke.tsx`.
4. If only the accent differs between surfaces, add a `tone` prop instead of
   forking; if structure/behaviour differs, make a separate component.
5. **Do not** add primitives back into `components/app/*` screens or recreate the
   retired files.

---

## 8. The quality gate (run before every commit — this is what Vercel runs)

```bash
npx tsc --noEmit        # types
npx next lint           # MUST say no warnings/errors — unused vars FAIL the build
npm run smoke           # SSR render check (react-dom/server) of screens + components
```

All three green, every commit, no squash. `npm run dev` (Turbopack) to run it;
`npm run dev:preview` for a second server on a separate build dir.
**SSR-safety:** no `Date.now()`/argless `new Date()`/`Math.random()`/`window`/
`document` at module or render top level (only inside effects/handlers).

> After moving/renaming component files, a long-running Turbopack dev server can
> serve a stale 500 — `rm -rf .next` and restart before treating it as a real bug.

---

## 9. Workflow & ownership

- **Austin** owns `src/components/ui/**`, tokens, `tailwind.config.ts`,
  `globals.css` — on the long-running **`rollout`** branch.
- **Matt** owns `src/app/**` (routes/screens), `src/lib/data`, `src/lib/store`,
  navigation — on `ux-<flow>` branches off the library.
- Because screens import the library by name, **Austin tunes a component/token →
  every screen updates with no screen edits**, and the two of you edit different
  files → **no merge conflicts**. See `WAYS_OF_WORKING.md` for the branch flow.

---

## 10. Still pending (open design decisions — ask Austin)

- **Bordered selectable pills** (≈7 B2B screens) vs the borderless library `Chip`:
  migrate to `Chip` (a visual change) or add a bordered `SelectablePill`?
- **Status tints** (`#FEF3C7`/`#B45309`…) → tokens: needs hue-matching to the
  `warning`/etc. palette.
- **`clients/[id]`** (large file): still has bespoke business-side cards to
  decompose into components.
