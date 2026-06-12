# 2026-06-12 · 11:17 BST — merge + handover

## Merged to `main` (a0a6e2f) — gate green (tsc + lint + smoke)
- **PR #2 onboarding-cleanup** — retired old onboarding flow + `lib/store.ts` + stale routes (`/home`, `/setup/[slug]`, `/client-placeholder`); `-6.7k` lines.
- **Onboarding-branch polish** — appointment status dropdown; checkout discount cards / "Other" payment / gift-card code+amount; two-step time-off.

## Decisions
- **Data-dedupe: `offers.ts` is canonical.** Matt to shrink `product.ts` to a thin screen-data adapter on his side (his 12 importers stay unchanged).
- **Next flow: Matt's call** — he owns UX; pick a flow and branch `ux-<flow>`.

## State
- **Austin / design system:** ON HOLD on `rollout` (3 provisional atoms). shadcn foundation from Austin's Figma-variables JSON pending → see `context/atomic-design.md`.
- **Matt / UX:** continue flows on `ux-*` branches; run the status-handoff brief at session end (→ `context/matt-status.md`).
