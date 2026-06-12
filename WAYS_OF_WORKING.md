# Ways of working

Two people, separate branches, one architecture. This is how we stay out of each
other's way and avoid the duplication/merge-conflict mess that creeps in when two
people touch the same product.

## Who owns what

| | **Austin — UI** | **Matt — UX** |
|---|---|---|
| Focus | Component library, design system, Figma↔code, styling rollout | Flows, screens, wiring, the UX of the wireframes |
| Owns these files | `src/components/ui/**` (the component library), `tailwind.config.ts`, `src/lib/tokens/**`, `src/app/globals.css` | `src/app/**` (routes/pages), `src/lib/data/**` (screen data), `src/lib/store/**` (state), navigation |
| Don't edit without a heads-up | the other person's column | the other person's column |
| Shared (coordinate first) | `src/lib/types/**`, route structure, anything in both columns | same |

Rule of thumb: **Austin makes things look right; Matt makes things work right.**
If a change is "how does this *look*", it's a component/token change (Austin). If
it's "what does this screen *do* / where does it go", it's a screen change (Matt).

## The #1 rule that prevents merge conflicts

**Screens compose components — they do NOT carry inline Tailwind.**

The single biggest conflict risk is both of us editing long inline `className`
strings on the *same* screen file. Kill it like this:

- Austin builds reusable primitives in **`src/components/ui/`** (`Button`, `Card`,
  `Input`, `Sheet`, `Pill`, `Chip`, `SectionLabel`, etc.) — the styling lives
  there.
- Matt's screens **import** those primitives instead of writing raw class strings:
  `<Button variant="primary">` not `<button className="h-12 w-full rounded-full bg-navy …">`.
- Net effect: **Austin edits `components/ui/*`, Matt edits `app/*` → different
  files → no conflicts.** And a styling tweak happens in *one* place, not pasted
  across 30 screens.

Today most screens still have inline Tailwind (from the initial build). That's
fine — extract to `components/ui` opportunistically as Austin rolls out the
library; don't block on a big-bang refactor.

### Styling conventions (so the library stays coherent)
- **Never hardcode hex.** Use tokens: `bg-navy`, `text-muted`, `bg-canvas`,
  `border-border`, `text-secondary`, `bg-surface`, `text-success/warning/danger`.
  Service-category colours come from `src/lib/tokens/categories.ts`.
- New colours/spacing/radii go into `tailwind.config.ts` (Austin), then get used
  by name — not as one-off arbitrary values.

## Single sources of truth (this is what just bit us)

We had two onboarding flows and two data layers (`product.ts` vs `offers.ts`)
because work landed in parallel. Don't re-create that:

- **One data module per domain** in `src/lib/data`. Extend the existing one;
  don't add a parallel `productV2.ts`.
- **One store per concern** in `src/lib/store`. **One** design-token set. **One**
  onboarding flow (`components/onboarding2` is canonical).
- **Domain types** live in `src/lib/types` — import them, never redefine.

Before adding a new `lib/data` / `lib/store` / `components/*` file, grep for an
existing one that already covers it.

## Branch workflow

```bash
# always start from the latest main
git fetch origin
git switch main && git pull --ff-only origin main
git switch -c <area>-<short-desc>        # e.g. ui-button-library, ux-checkout-flow
```

- **Branch from latest `main` every time.** Never commit to `main` directly.
- **Keep branches small and short-lived.** A branch open for a week = a painful
  merge. Aim for a PR every day or two.
- **Pull `main` into your branch daily** (`git merge origin/main` or rebase) so
  conflicts surface small and early, not as a giant wall at the end.
- **PR → `main`**, the other person gives it a glance, then merge. Delete the
  branch after.

## The quality gate — run before EVERY commit

All three must be green, or the Vercel build fails:

```bash
npx tsc --noEmit          # types
npx next lint             # must say "No ESLint warnings or errors" (unused vars FAIL the build)
npm run smoke             # renders ported screens via react-dom/server
```

`npm run dev` uses Turbopack (`next dev --turbo`). If it hangs, use
`npm run dev:webpack`.

## Architecture map (where things go)

```
src/app/
  onboarding/   ← signup flow (Matt; uses components/onboarding2)
  app/          ← the product app — Home, Schedule, Clients, Messages, Hub, etc.
  new/          ← the offer-creation wizard
  client/       ← consumer-facing flow
src/components/
  ui/           ← the component library (Austin) — primitives screens compose
  app/          ← product app chrome (AppFrame, AppTabBar, ScreenHeader)
  onboarding2/  ← onboarding shell/controls
src/lib/
  types/        ← shared domain types (Business, Staff, Client, Offer…)
  data/         ← typed demo data, one module per domain
  store/        ← Zustand stores (one per concern)
  tokens/       ← design tokens (category palette)
tailwind.config.ts  ← brand/surface tokens + fonts (Austin)
```

Each screen is a `page.tsx`. `main` auto-deploys to Vercel — **keep `main`
green**; never merge a red branch.

## TL;DR
1. Branch from latest `main`; keep it small; pull `main` in daily.
2. Austin owns `components/ui` + tokens; Matt owns `app/*` + data/state.
3. Screens compose components; no inline Tailwind sprawl; no hardcoded hex.
4. One source of truth per domain — grep before you create.
5. `tsc` + `next lint` + `npm run smoke` green before every commit.
