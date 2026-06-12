# Proposal: one demo-data catalogue instead of two

**Status: proposal only — nothing has been migrated.** No screens were touched
for this. Decision + migration to be coordinated with Austin.

## The problem, in plain terms

The app currently keeps two separate "menus" of the same business data:

- `src/lib/data/product.ts` — used by the Home / Schedule / Clients / Messages /
  Checkout screens (12 importers). Simple lists: services, retail products,
  clients, past appointments, forms.
- `src/lib/data/offers.ts` + `src/lib/data/products.ts` — used by the Services
  hub, offer dashboards and the creation wizard (7 importers). Richer model:
  typed `DemoOffer` / `OfferType` covering services, classes, bundles and
  subscriptions.

Both describe "what this salon sells", so a price or name changed in one place
doesn't change in the other. Harmless in a prototype, confusing over time.

## Recommendation

1. **`offers.ts` becomes the canonical catalogue** ("what we sell"). Its typed
   model already handles every offer type the wizard can create; `product.ts`'s
   flat `services`/`products` lists are a subset of it.
2. **`product.ts` shrinks to screen demo data** ("what's happening today"):
   the Up Next queue, agenda rows, calendar grids, conversations, notifications,
   client rows/forms/reviews, client notes. None of that exists in `offers.ts`
   and none of it should move.
3. **Migration = a thin adapter, not a rewrite.** Add
   `export const services / products` derived from `offers.ts` (same shapes the
   12 importers already consume), point `product.ts` at it, and no screen needs
   to change at all. The visible screens (Home, Schedule, Clients, Messages,
   Onboarding) keep working exactly as they do now.

## Who does what

- Mat's side: the adapter in `product.ts` (one small PR, screens untouched).
- Austin's side: nothing required immediately; later he can fold the two retail
  product lists (`products.ts` vs `product.ts#products`) into one.

## Out of scope here

This branch deliberately changes no data modules — it only retires the dead
onboarding prototype code.
