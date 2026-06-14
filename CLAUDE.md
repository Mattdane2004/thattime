# thattime — agent guide

That Time product app: Next.js 14 (App Router) + TypeScript + Tailwind + Zustand.
Two surfaces — **B2B** business app (`/app`, `/onboarding`, `/new`, ink/navy) and
**B2C** consumer app (`/c`, coral) — on one component library.

## Read before building or changing any screen
- **[`context/DESIGN_SYSTEM.md`](context/DESIGN_SYSTEM.md)** — the component-library
  contract. Both surfaces side by side, the full `@/components/ui` inventory, token
  rules, and step-by-step guides for building a new flow or migrating an existing one.
- [`context/WAYS_OF_WORKING.md`](context/WAYS_OF_WORKING.md) — branch flow & ownership.
- [`context/PORTING.md`](context/PORTING.md) — how the app was consolidated.

## The rules that matter
1. **Compose every screen from `@/components/ui`** (and `@/components/ui/consumer`
   for the B2C `/c` app). Never hand-roll a primitive (button/input/card/row/sheet/
   toggle/tab/chip/badge/avatar/rating/header) and never use inline hex
   (`bg-[#…]`/`text-[#…]`) — use semantic token classes / component variants.
2. **Keep the two surfaces distinct** — B2B is ink, B2C is coral. Use a `tone`/
   `variant` prop when only the accent differs; a separate component when structure
   differs. Don't homogenise them.
3. **New shared component →** add it to `src/components/ui/**`, export from the
   barrel `src/components/ui/index.ts`, add a `smoke.tsx` check. Don't recreate the
   retired `components/app/ui.tsx` / `onboarding2/controls.tsx` / `client/shared.tsx`.
4. **One source of truth per domain** in `src/lib/data` / `src/lib/store` — grep
   before creating a new module.

## Quality gate — green before every commit (this is what Vercel runs)
```bash
npx tsc --noEmit && npx next lint && npm run smoke
```
`next lint` treats unused vars as fatal. SSR-safe: no `Date.now()`/argless
`new Date()`/`Math.random()`/`window`/`document` at module or render top level.
Run the app with `npm run dev` (Turbopack). Keep `main` green — it auto-deploys.
