# Products (preferences, retail & stock) — Finalisation Plan

> **Status:** Plan only — no implementation until the open questions below are resolved.
> **Scope:** The **Products** domain — (1) the V1 **product-preferences** picker inside a service (catalog-validated input + the "products you've used on similar services" prompting system), and (2) a new **Products catalog** in the business hub that becomes the single source of truth. The V2 **retail shop** (selling products at checkout, stock/inventory, low-stock alerts) is documented in full per the user's request but is clearly marked deferred.
> **Surface:** B2B only (ink/navy, `/app`). No B2C (`/c`, coral) touchpoint this pass — products surface to clients only inside an existing service preference question and (V2) a retail line item, both already-built B2B screens.
> **Out of scope this pass:** warehouse-grade inventory (Available/Committed/On-hand ledger, adjustment "Reason" codes, multi-location stock transfers), CSV/template import, stocktake reconciliation, purchase-orders-to-suppliers, and a standalone consumer-facing product store. All are V2/V3 — see "V2 / deferred".
> **Source of truth for feedback:** Granola sessions with Shabbir & Vishal (that-time.co.uk) + internal SDS planning. The decisive product feedback is the **19 May** "That Time Product alignment" session; the full walkthrough sign-off is **15 Jun** "that time sign off"; remaining-section priorities are the **16 Jun** internal "TT planning". ⚠️ Shop functionality was **postponed to V2 on 19 May** but is included now per the user.

---

## What this section is

Products is the business's library of the things it **uses on clients** (colour, oils, "Lemon Bottle", treatments) and (V2) the things it **sells to clients** (retail shampoo off the shelf). It sits in the business hub alongside Offerings, Team and Marketing — the hub already has a **Products** card labelled "Internal & retail library" (`src/app/app/hub/page.tsx:30`), but that card currently leads nowhere. This plan gives it a home: one **Products catalog** that is the source of truth, so a service's product-preference question picks from it (V1) and the checkout sells from it (V2) instead of three separate hand-typed lists.

---

## Feedback → source map

| Area | Feedback | Source | Pattern ref (Mobbin) |
|---|---|---|---|
| Preferences stay manual | Product preferences in services **remain manual input** for now — don't auto-derive | 19 May | [Shopify Tags — inline "Add" + suggestions](https://mobbin.com/screens/2070f1b0-21c5-469d-86cb-1ee8c9d5f69c) |
| Validate common products | Add **validation for common products** (e.g. canonical "Lemon Bottle") as the owner types | 19 May | [Shopify Tags field](https://mobbin.com/screens/2070f1b0-21c5-469d-86cb-1ee8c9d5f69c) |
| Prompting / repeat input | **Suggest products you've used on similar services** — a prompting system for repeated inputs | 19 May | [BFF — typed entry + suggestion chips + add-on-the-fly](https://mobbin.com/screens/e00bf255-e08f-4fdd-b9d9-acf8624054f7) |
| Catalog as source of truth | A **Products catalog in the hub** — the list a business uses, so preferences pick from it instead of free-typing | 19 May | [Shopify — Products list with "Out-of-stock" shelf](https://mobbin.com/screens/528a9eaa-7a7c-4339-8c74-bf1cfd30be30) |
| Shop postponed | **Shop functionality postponed to V2** (retail sale, stock, alerts) — but model it now | 19 May | [Squarespace — Add Product, Track Stock → Quantity, auto SKU](https://mobbin.com/screens/80ee60ea-2034-4ef9-b1f7-7124f81d1c55) |
| Checkout already has Products | Checkout already supports a **"Products" line-item category** to sell into (V2 wiring point) | 15 Jun (walkthrough) | [eBay — "Choose quantity" stepper capped at N available](https://mobbin.com/screens/4d496fe4-1184-44a9-bf00-91ed0cce301d) |
| One product = simple | A salon product should be **name + price + photo + optional track-stock** — not warehouse-grade | (research — SMB ceiling) | [Shopify — Create a Product sheet](https://mobbin.com/screens/c261aa98-a1c9-4356-ae49-30831af7b08b) |
| Don't count everything | Many products are use-in-services only or sold casually — offer **don't-track vs track-count** | (research — Square dual mode) | [Shopify — "Big" product: Track quantity, Available stepper](https://mobbin.com/screens/5f598677-569b-468a-8af2-9f92f9579187) |
| Low-stock surfacing | **Low/Out pills** on rows + a pinned "needs attention" shelf; daily digest, not real-time pings | (research — Square + Thrive) | [Thrive Market — Out of Stock / Running Low pills](https://mobbin.com/screens/c9a96ef6-03f8-4122-b08b-117204c2f2a2) |
| Section priority | Products is **not** in the "big three" (Services/Team/Analytics); Marketing pairs with Analytics | 16 Jun (internal) | — |

---

## Current state

**Status legend:** ✅ done · 🟡 partial · ❌ missing.

- 🟡 **Service product preferences** — `src/app/app/services/[id]/products/page.tsx`. A working question builder: question text, single/multi select, required toggle, a per-product price-override + extra-duration sheet (`ProductSheet`), and a live client-preview card. Picks from a **fixed catalog** grouped by category. **The catalog search box is `disabled`** (line 55) and there is **no "add new product"** path — exactly the gap the 19 May feedback names. Data is `offer.productPrefs?: ProductPref[]` (`src/lib/data/offers.ts:86–92, 173`), persisted via `offersStore.updateOffer`.
- ❌ **Products catalog (hub)** — the hub card exists (`src/app/app/hub/page.tsx:30`, "Internal & retail library") but renders as a **dead `<button>` with no `href`** (line 81). There is **no `/app/products` route**, no catalog list, no product editor, and no products store.
- ❌ **Catalog validation / canonical names** — no "Lemon Bottle ✓ in catalog" matching; free-typed values can't graduate into the catalog.
- ❌ **"Used on similar services" prompting** — no suggestion chips anywhere.
- 🟡 **Three parallel product lists** (the core data-model debt the feedback implies):
  1. `src/lib/data/products.ts` → `productsCatalog` (`{id, category, name, basePrice}`, categories `Oils/Treatments/Shampoos`) — feeds the **preference picker**.
  2. `src/lib/data/product.ts` → `products` (`{id, name, size, price, category}`, categories `Hair care/Styling`) — feeds **checkout** and the catalogue-ish demo screens.
  3. The checkout add-sheet reads list #2 via `addProducts` (`src/app/app/checkout/page.tsx:225, 620–624`) under a **"Products" category** (`{type:"product", label:"Products"}`, line 43), already rendering a `CatalogRow` + qty `Stepper`.
- ✅ **Checkout plumbing for retail** — `CatalogRow` (`checkout/page.tsx:57`) + `Stepper` (line 72) + a `product` line-item kind already exist; V2 retail is a wiring job, not a new component.
- ❌ **Stock / inventory** — no `track/quantity/lowStockThreshold/sku/barcode/supplier` anywhere; no low-stock pills, no "needs attention" shelf, no decrement-on-sale.

---

## Recommended UX calls

Opinionated decisions to reduce owner cognitive load — simplest flow that satisfies the 19 May feedback.

1. **One unified `Product` record, one catalog, one store.** Consolidate the three lists into a single `products.ts` catalog and a new `productsStore` (per CLAUDE.md "one source of truth per domain"). One record carries **role flags** (`useInServices` / `sellRetail`) so the *same* shampoo can power the preference picker and (V2) the checkout. **[ASSUMPTION]** — the feedback asks for "a Products catalog … so preferences pick from it"; serving both surfaces from one record is the obvious model and the user explicitly asked us to "recommend the catalog data model that serves both the V1 preference picker and the V2 shop".
2. **Keep preferences manual — just make them smart.** Per 19 May, the owner still *types* a product. We layer three assists on the existing picker: (a) **live search** over the catalog (un-disable the box), (b) **canonical-name validation** for known brands, and (c) an inline **"Add '<typed>' to your catalog"** row so a free-typed value graduates into the catalog. No auto-derivation. (Shopify Tags pattern.)
3. **"Used on similar services" = matched by service category.** The prompting system surfaces, as tappable chips above the picker, the catalog products already used in `productPrefs` on **other offers of the same `category`**. One tap adds them. **[ASSUMPTION]** "similar" is undefined in the feedback — category-match is the cheap, legible default; refine later if owners want tag-based similarity.
4. **Canonical product list is a small seed dictionary, not an API.** Ship a static `commonProducts` list (Lemon Bottle, Olaplex, Moroccanoil, …) for the validation tick. SSR-safe, no network. **[ASSUMPTION]**.
5. **"Track stock" defaults OFF; offer a simple In-stock/Out for the rest.** Most salon products are used-in-services or sold casually. OFF = treat as In stock / Out only (Square "track availability"); ON progressively reveals Quantity + low-stock threshold + optional SKU/barcode under "More". Never force counting. **[ASSUMPTION for V2]**.
6. **Don't hard-block the last unit.** If a tracked item hits 0, the checkout **warns** but still allows the sale (salons sell the last bottle off the shelf). **[ASSUMPTION for V2]**.
7. **Surface low stock passively.** Amber **Low** / red **Out** pills on catalog rows + a pinned **"Needs attention"** shelf at the top; optionally a daily digest. No real-time per-sale pings. **[ASSUMPTION for V2]**.
8. **SKU/barcode auto-suggested and collapsed.** A salon owner doesn't think in SKUs (Squarespace auto-fills). Hidden under "More details". **[ASSUMPTION]**.
9. **Catalog migration is back-compatible.** `productPrefs` references catalog ids; the new `Product.id`s must keep the existing `p1…p10` ids so the seed offers' preferences keep rendering. **[OPEN — needs user decision]** on whether retail-list ids (`shampoo`, `wax`, …) are merged or kept distinct (see Open questions).

---

## Phase 1 — Unify the data model (the core fix, no new screens)

**Goal:** Collapse the three product lists into one catalog + store so everything downstream reads one source of truth. This is invisible to the user but unblocks every later phase and satisfies CLAUDE.md's "one source of truth per domain".

**Flow:** (no UI — internal refactor verified by the existing preference picker + checkout still rendering.)
1. Define a unified `Product` type and a single seed catalog merging `productsCatalog` (preference products, ids `p1…p10`) and the retail `products` (size/price).
2. Add a `productsStore` (Zustand) wrapping the catalog with `addProduct` / `updateProduct` / `removeProduct`.
3. Point the preference picker at the store (replace the static `productsCatalog` import).
4. Point checkout's `addProducts` at the same catalog (filter to `sellRetail`).

**Changes:**
- Add `src/lib/store/productsStore.ts` (new — grep confirmed no products store exists).
- Rewrite `src/lib/data/products.ts` → unified `Product[]` seed + `productCategories` (keep export names where possible to limit churn).
- Edit `src/app/app/services/[id]/products/page.tsx` — import catalog from the store; keep `basePrice` accessor working.
- Edit `src/app/app/checkout/page.tsx` — `addProducts` reads the store filtered to `sellRetail`; map `basePrice`→`price`, `size`.
- Deprecate the retail `products`/`productCategories` exports in `src/lib/data/product.ts` (leave a re-export shim if other screens read them — grep first).

**Data:** new unified `Product { id; name; category; basePrice; size?; photo?; useInServices: boolean; sellRetail: boolean; stock?: ProductStock }`. Seed keeps ids `p1…p10` (+ retail items) so `offer.productPrefs[].products[].id` references stay valid.

**Risk:** medium — touches two live screens; the seed-id continuity is the trap (Open Q1). Quality gate must stay green; the preference picker and checkout are the regression surfaces.

---

## Phase 2 — Products catalog home (the hub source of truth)

**Goal:** Give the hub Products card a real destination — a single catalog list the owner manages, replacing the dead button.

**Flow:**
1. Owner taps **Products** in the hub → `/app/products`.
2. **Catalog list:** search field at top + a segmented filter **All / In services / Retail** (maps to the role flags); products grouped by category (reuse the preference-picker's category-section pattern).
3. Each **row:** thumbnail (or category glyph) · name · `category · size` · price · (V2) a status pill when stock-tracked.
4. **Empty state:** "Add the products you use and sell" + one primary **Add product** button (smoke needle here).
5. Primary **+ Add product** (top-right) opens the create sheet (Phase 3).

**Changes:**
- Add `src/app/app/products/page.tsx` (new route — the catalog list + empty state).
- Edit `src/app/app/hub/page.tsx` — give the Products card `href: "/app/products"` (line 30).
- Compose from `@/components/ui` (search input, segmented filter, rows) — no hand-rolled primitives, no inline hex.

**Data:** reads `productsStore`; the **All / In services / Retail** filter reads `useInServices` / `sellRetail`.

**Risk:** low — a list over an existing store; the only new route in V1.

---

## Phase 3 — Add / edit a product (one progressive sheet)

**Goal:** Create or edit a product in a single short sheet — minimal for the common case (a thing you only stock), progressive for stock tracking. (Shopify Create-a-Product + Squarespace progressive-reveal.)

**Flow:**
1. **+ Add product** opens a bottom **"New product"** sheet.
2. **Name** (required) with catalog validation: if a known brand is typed (e.g. "Lemon Bottle"), confirm the canonical spelling with a "✓" affordance; if it matches an existing product, warn "already in your catalog".
3. **Category** — reuse `productCategories` chips; allow **"Add new category"** inline.
4. **Photo** (optional — Camera / Upload, Shopify-style) and **Price (£)**.
5. **Two role toggles** so one record serves both surfaces: **Use in services** (available to preference pickers) and **Sell to clients / retail** (V2 checkout). At least one defaults on.
6. **Track stock** toggle — **default OFF** (= In stock / Out only). ON reveals: **Quantity** stepper, optional **Low-stock threshold** (default e.g. 3), optional **SKU / barcode** (auto-suggested, collapsed under "More"). *(The stock reveal lands functionally in V2; the toggle + fields can render now but only the catalog/role data is wired in V1.)*
7. Optional **Supplier / brand** under a **"More details"** disclosure (future-proofs Fresha-style reordering without clutter).
8. **Save** → inline **"Saved"** toast, return to the list (no separate confirmation screen — Shopify inline-save pattern).

**Changes:**
- Add `src/app/app/products/[id]/page.tsx` **or** an in-route `ProductSheet` editor (consistent with how `services/[id]` edit-sheets are factored) — compose `Sheet` + `Toggle` + steppers from `@/components/ui`.
- Add `src/lib/data/commonProducts.ts` — static canonical-name dictionary for validation (SSR-safe constant).

**Data:** writes a `Product` via `productsStore.addProduct` / `updateProduct`; `stock?: ProductStock { track; quantity?; lowStockThreshold?; sku?; barcode?; supplier?; brand? }`.

**Risk:** low–medium — the progressive disclosure is the design care-point (keep ~4 visible fields for the common case). SKU auto-suggest must avoid `Math.random()`/clock at module top level (use a counter-based `nextId`).

---

## Phase 4 — Smart preference picker (the V1 priority)

**Goal:** Deliver the 19 May ask end-to-end: manual input, **validated** against the catalog, with a **prompting** system for repeat inputs — by upgrading the *existing* picker rather than rebuilding it.

**Flow:**
1. From a service's **Product preferences** module, **Add preference** opens the existing question editor (question + single/multi + required — keep as-is).
2. **Choose products** opens the catalog picker, grouped by category. **Un-disable the search box** (`products/page.tsx:55`) and make it filter live.
3. As the owner types, show matched catalog products as **validated suggestions** ("Lemon Bottle ✓ in catalog") and an inline **"Add '<typed>' to catalog"** row that creates a new `Product` on the fly (reusing the Phase 3 create logic, defaulting `useInServices: true`).
4. Above the picker, a **"You've used these on similar services"** chip row — catalog products used in `productPrefs` on other offers of the same `category`. One tap adds them.
5. Selected products list with the existing per-product **+£ / Included** + **extra duration** sheet (`ProductSheet` — keep).
6. The existing **Client preview** card stays (already built — keep).
7. **Save preference.**

**Changes:**
- Edit `src/app/app/services/[id]/products/page.tsx` — enable live search; add the validated-suggestion + "add to catalog" inline row; add the "used on similar services" chip row computed from `offersStore`.
- Reuse the Phase 3 add-product logic (factor it so the picker and the hub editor share one path).

**Data:** no change to `ProductPref` / `PrefProduct` shape; new preferences may reference newly-created `Product` ids. Similar-service suggestions are **derived** (read other offers' `productPrefs`), not stored.

**Risk:** medium — the cross-offer "similar services" query and the add-on-the-fly graduation are the new logic. No data-shape change, which keeps the seed offers safe.

---

## Phase 5 — (V2) Retail at checkout

**Goal:** Sell catalog products to clients via the existing checkout **Products** category, decrementing stock for tracked items. **Deferred — shop postponed to V2 (19 May).**

**Flow:**
1. In checkout, tap the existing **Products** category in "Add a service or product".
2. The list (reuse `CatalogRow` + `Stepper`) shows thumbnail · name · `size` · price · qty stepper, and **"N in stock"** when tracked; low/out items show a pill but stay tappable.
3. Add to sale → line item in the basket with the existing qty stepper.
4. On payment completion, **decrement stock** for tracked items; if a sale crosses the threshold, show a low-stock toast.
5. The owner later sees the item flagged in the catalog's **Needs attention** shelf and reorders manually (no PO system in V1 retail).

**Changes (V2):**
- Edit `src/app/app/checkout/page.tsx` — `addProducts` already exists; add "N in stock" caption, soft-cap (warn-not-block) at count, and decrement on completion.
- Edit the catalog list/rows (Phase 2) to render Low/Out pills + the Needs-attention shelf.

**Data:** uses `Product.stock`; decrement updates `stock.quantity` via `productsStore`.

**Risk:** medium — stock decrement is the first place a sale mutates the catalog; keep it warn-not-block.

---

## Phase 6 — (V2) Stock essentials & low-stock surfacing

**Goal:** The minimum stock feature set — manual count, per-item threshold, passive surfacing. **Deferred.**

**Flow:**
1. From a product's editor, set **Track stock** ON → enter Quantity + low-stock threshold (Phase 3 fields go live).
2. Catalog list pins a **"Needs attention"** shelf at the very top whenever any tracked item is Low/Out (Shopify "Out-of-stock products" pattern).
3. Rows show amber **Low** / red **Out** pills, sorted to the top.
4. **[OPEN]** optional daily digest notification ("what's low/out") rather than real-time pings.

**Changes (V2):** wire the stock block in the product editor; add the Needs-attention shelf + pills to `/app/products`; (optional) a daily-digest stub in the notifications surface.

**Data:** `ProductStock.lowStockThreshold`; Low/Out status is **derived** (`quantity <= threshold` → Low; `<= 0` → Out), not stored.

**Risk:** low–medium — mostly derived state and presentational pills.

---

## V2 / deferred

The user asked to include everything now; these are the parked retail/stock items, each with a recommended direction.

- **Retail shop at checkout** (Phase 5) — *direction:* reuse the existing `CatalogRow`/`Stepper`/`product` line-item; no new components.
- **Stock essentials** (Phase 6) — *direction:* manual count + per-item threshold + dual-mode (track-count vs in/out); decrement-on-sale; Low/Out pills + Needs-attention shelf.
- **Low-stock digest** — *direction:* a daily summary, not real-time pings (Square pattern). Park behind a notifications hook.
- **Categories + supplier/brand for reordering** — *direction:* adopt `supplier`/`brand` as **optional** catalog fields now (cheap, future-proofs), but defer any reorder action.
- **CSV / template import** — *direction:* **defer** (Fresha power-feature, big surface area, little SMB payoff for the first release). Note the hub already has a generic "Data import" entry (`hub/page.tsx:47`) that could host it later.
- **Stocktake reconciliation** — *direction:* **defer** to V3; reconcile counts + stock value is warehouse-grade.
- **Purchase-orders-to-suppliers** — *direction:* **defer** to V3 (create + send stock orders to suppliers, Fresha). Optional `supplier` field is the only foundation we lay now.
- **Consumer-facing product store (B2C)** — *direction:* **defer**; the catalog's `sellRetail` flag is the future hook. Keep this B2B-only for now (don't homogenise into the coral surface).

**Explicit anti-patterns (do not build):** no Available/Committed/On-hand ledger; no stock-adjustment "Reason" codes; no multi-location stock transfers; no required/prominent SKU field; no hard stock cap on the last unit; no per-sale notification spam; no third (or fourth) parallel product list.

---

## Suggested order & rationale

`1 (unify model) → 2 (catalog home) → 3 (add/edit sheet) → 4 (smart picker — V1 priority)` … then deferred `→ 5 (retail checkout) → 6 (stock essentials)`.

Phase 1 first because the consolidation unblocks everything and is the one change CLAUDE.md's "one source of truth" rule demands — the three lists are the real debt. Phases 2–3 stand up the catalog + editor that the 19 May feedback explicitly requests. **Phase 4 is the V1 priority** (the manual-input-with-validation + prompting system the client actually asked for) and depends on 1–3 existing so the picker has a real catalog to search and graduate into. Phases 5–6 are the V2 retail/stock work, deferred per 19 May but sequenced so retail (5) lands before stock-management depth (6). Products is **not** in the 16 Jun "big three" (Services/Team/Analytics), so this whole section sequences **after** the Services and Team finalisation passes.

Every phase ends green on `npx tsc --noEmit && npx next lint && npm run smoke`, with a smoke needle for each new empty/setup state (the `/app/products` empty state, the create sheet). Persistence stays session-local Zustand; all new fields are additive/back-compatible so the seed offers' `productPrefs` keep rendering.

---

## Cross-cutting data-model changes

New unified type in `src/lib/data/products.ts` + new `src/lib/store/productsStore.ts`:

```ts
interface ProductStock {            // optional block, V2
  track: boolean;                   // default false (= In stock / Out only)
  quantity?: number;
  lowStockThreshold?: number;       // default e.g. 3
  sku?: string;                     // auto-suggested, collapsed
  barcode?: string;
}
interface Product {
  id: string;                       // keep p1…p10 for seed continuity
  name: string;
  category: string;
  basePrice: number;
  size?: string;                    // from the retail list
  photo?: string;                   // optional
  useInServices: boolean;           // role flag → preference picker
  sellRetail: boolean;              // role flag → checkout (V2)
  supplier?: string;                // "More details", future reordering
  brand?: string;
  stock?: ProductStock;             // V2
}
```

- `productsStore` → `products`, `addProduct`, `updateProduct`, `removeProduct` (mirrors `offersStore`).
- `src/lib/data/commonProducts.ts` → static canonical-name dictionary (validation).
- **No change** to `ProductPref` / `PrefProduct` (`offers.ts:81–92`) — preferences keep referencing catalog ids.
- Status (Low/Out) and "used on similar services" suggestions are **derived**, not stored.

All optional/back-compatible; persistence stays session-local Zustand; no clock/random/`window` at module or render top level (use counter-based `nextId` for auto-SKUs).

---

## Open questions for the user

1. **ID merge strategy.** Phase 1 keeps preference ids `p1…p10`. Should the retail list's items (`shampoo`, `conditioner`, `serum`, `wax`, `spray` in `product.ts`) be **merged into the same records** (deduped where they're the same product) or kept as **distinct retail-only records**? This decides whether one shampoo can be both used-in-services and sold.
2. **Category vocabulary.** Preferences use `Oils / Treatments / Shampoos`; retail uses `Hair care / Styling`. Do we **unify into one category set** (and which names), or keep service vs retail category groupings separate within the one catalog?
3. **"Similar services" definition.** Category-match is the proposed default for the prompting chips. Is category enough, or do you want similarity by something richer (service tags, same client segment)?
4. **Canonical product dictionary scope.** Is a small static seed (Lemon Bottle, Olaplex, Moroccanoil, a handful more) acceptable for the validation tick in V1, or do you expect a broader/maintained brand list?
5. **V2 retail timing & B2C.** When retail lands, is it **B2B checkout only** (sell in-store at the till), or does it also need a **consumer-facing product store** in the coral `/c` app? (The latter is a separate, larger build.)
6. **Low-stock notification channel (V2).** A passive **Needs-attention shelf + optional daily digest** is recommended over real-time pings — confirm the digest is wanted, and where it should appear (Notifications surface vs the catalog only).
