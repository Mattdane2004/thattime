"use client";

// /c/explore — discovery surface. Two modes: "For you" (Instagram-style
// explore grid of posts) and "Nearby" (map preview + salon cards). Search
// state with recents/trending, category chips and a full filters sheet.

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, MapPin, Clock, TrendingUp, ChevronRight } from "lucide-react";
import { Sheet, DarkButton, GhostButton, Segmented, SectionLabel, StatusPill } from "@/components/ui";
import { Avatar, Stars, OfferTypeBadge } from "@/components/client/shared";
import { defaultCategories, tintFromHex } from "@/lib/tokens/categories";
import type { CategoryName } from "@/lib/tokens/categories";
import { salons, explorePosts, getOffer } from "@/lib/data/b2c";
import type { OfferType } from "@/lib/types/offer";

const RECENT_SEARCHES = ["balayage", "skin fade", "reformer pilates"];
const TRENDING = ["Blow dry", "Deep tissue", "Puppy social", "Beard trim", "Root tint"];
const RATING_OPTIONS = ["4.0+", "4.5+", "4.8+"] as const;
const DISTANCE_OPTIONS = ["0.5 mi", "1 mi", "2 mi", "5 mi+"] as const;
const PRICE_OPTIONS = ["£", "££", "£££"] as const;
const OFFER_TYPE_OPTIONS: { label: string; value: OfferType }[] = [
  { label: "Services", value: "service" },
  { label: "Classes", value: "class" },
  { label: "Bundles", value: "bundle" },
  { label: "Memberships", value: "subscription" },
];

const categoryColor = (name: CategoryName) =>
  defaultCategories.find((c) => c.name === name)?.color ?? "#475569";

// Mock pin positions over the map placeholder, one per salon.
const PIN_POSITIONS = [
  { left: "22%", top: "30%" },
  { left: "58%", top: "22%" },
  { left: "72%", top: "55%" },
  { left: "38%", top: "62%" },
  { left: "50%", top: "42%" },
];

export default function ExplorePage() {
  const router = useRouter();
  const [mode, setMode] = useState("For you");
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryName | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapSalonIdx, setMapSalonIdx] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filters sheet state (wireframe-local).
  const [fCategories, setFCategories] = useState<CategoryName[]>([]);
  const [fRating, setFRating] = useState<string | null>(null);
  const [fDistance, setFDistance] = useState<string>("2 mi");
  const [fPrices, setFPrices] = useState<string[]>([]);
  const [fOpenNow, setFOpenNow] = useState(false);
  const [fToday, setFToday] = useState(false);
  const [fTypes, setFTypes] = useState<OfferType[]>([]);

  const searching = searchFocused || query.length > 0;
  const q = query.trim().toLowerCase();

  const salonResults = useMemo(
    () => (q ? salons.filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)) : []),
    [q],
  );
  const offerResults = useMemo(
    () =>
      q
        ? salons.flatMap((s) =>
            s.offers
              .filter((o) => o.name.toLowerCase().includes(q))
              .map((o) => ({ salon: s, offer: o })),
          )
        : [],
    [q],
  );

  const visibleSalons = activeCategory ? salons.filter((s) => s.category === activeCategory) : salons;
  const visiblePosts = activeCategory
    ? explorePosts.filter((p) => salons.find((s) => s.id === p.salonId)?.category === activeCategory)
    : explorePosts;

  const clearFilters = () => {
    setFCategories([]);
    setFRating(null);
    setFDistance("2 mi");
    setFPrices([]);
    setFOpenNow(false);
    setFToday(false);
    setFTypes([]);
  };

  const toggle = <T,>(list: T[], v: T, set: (l: T[]) => void) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const mapSalon = salons[mapSalonIdx];

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      {/* Sticky top: search + mode + categories */}
      <div className="shrink-0 border-b border-border bg-surface px-4 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <div className="flex h-11 flex-1 items-center gap-2 rounded-full bg-canvas px-4">
            <Search size={18} strokeWidth={1.75} className="shrink-0 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder="Search services, salons, classes…"
              className="min-w-0 flex-1 bg-transparent text-[14px] text-navy outline-none placeholder:text-muted"
            />
            {searching && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  setSearchFocused(false);
                }}
                className="shrink-0 rounded-full bg-border p-1 text-secondary"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            )}
          </div>
          <motion.button
            type="button"
            aria-label="Filters"
            whileTap={{ scale: 0.97 }}
            onClick={() => setFiltersOpen(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-navy"
          >
            <SlidersHorizontal size={20} strokeWidth={1.75} />
          </motion.button>
        </div>

        {!searching && (
          <>
            <div className="mt-3 flex">
              <Segmented options={["For you", "Nearby"]} value={mode} onChange={setMode} />
            </div>
            <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
              {defaultCategories.map((c) => {
                const active = activeCategory === c.name;
                return (
                  <motion.button
                    key={c.name}
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveCategory(active ? null : c.name)}
                    className="shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-semibold"
                    style={
                      active
                        ? { background: c.color, color: "#fff" }
                        : { background: tintFromHex(c.color, 0.12), color: c.color }
                    }
                  >
                    {c.name}
                  </motion.button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Scroll area */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {searching ? (
          q === "" ? (
            <div className="px-4 pt-4">
              <SectionLabel>Recent</SectionLabel>
              <div className="-mt-1 space-y-1">
                {RECENT_SEARCHES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setQuery(r)}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left"
                  >
                    <Clock size={16} strokeWidth={1.75} className="text-muted" />
                    <span className="text-[14px] text-navy">{r}</span>
                  </button>
                ))}
              </div>
              <div className="pt-4">
                <SectionLabel>Trending</SectionLabel>
              </div>
              <div className="flex flex-wrap gap-2 px-2">
                {TRENDING.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setQuery(t)}
                    className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2 text-[12px] font-medium text-navy"
                  >
                    <TrendingUp size={13} strokeWidth={2} className="text-coral" />
                    {t}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-4 pb-24 pt-4">
              {salonResults.length === 0 && offerResults.length === 0 && (
                <p className="px-2 pt-10 text-center text-[14px] text-secondary">
                  No results for “{query}”. Try another search.
                </p>
              )}
              {salonResults.length > 0 && (
                <>
                  <SectionLabel count={salonResults.length}>Salons</SectionLabel>
                  <div className="space-y-2">
                    {salonResults.map((s) => (
                      <motion.button
                        key={s.id}
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => router.push(`/c/salon/${s.id}`)}
                        className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-left"
                      >
                        <Avatar initials={s.avatar} category={s.category} size={44} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-semibold text-navy">{s.name}</p>
                          <div className="flex items-center gap-2">
                            <Stars rating={s.rating} count={s.reviewCount} />
                            <span className="text-[12px] text-muted">· {s.distance}</span>
                          </div>
                        </div>
                        <ChevronRight size={16} strokeWidth={1.75} className="text-muted" />
                      </motion.button>
                    ))}
                  </div>
                </>
              )}
              {offerResults.length > 0 && (
                <>
                  <div className="pt-4">
                    <SectionLabel count={offerResults.length}>Services & classes</SectionLabel>
                  </div>
                  <div className="space-y-2">
                    {offerResults.map(({ salon, offer }) => (
                      <motion.button
                        key={offer.id}
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => router.push(`/c/salon/${salon.id}/book?offer=${offer.id}`)}
                        className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-left"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-[14px] font-semibold text-navy">{offer.name}</p>
                            <OfferTypeBadge type={offer.type} />
                          </div>
                          <p className="truncate text-[12px] text-secondary">{salon.name}</p>
                        </div>
                        <span className="shrink-0 text-[14px] font-semibold text-navy">{offer.price}</span>
                      </motion.button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )
        ) : mode === "For you" ? (
          /* Instagram-explore masonry grid */
          <div className="grid grid-flow-dense grid-cols-3 gap-0.5 pb-24 pt-0.5">
            {visiblePosts.map((p, i) => {
              const offer = p.offerId ? getOffer(p.salonId, p.offerId) : undefined;
              const big = i % 5 === 0;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => router.push(`/c/post/${p.id}`)}
                  className={`relative block overflow-hidden bg-border ${big ? "col-span-2 row-span-2" : ""}`}
                  style={{ aspectRatio: "1 / 1" }}
                >
                  <Image src={p.image} alt={p.caption} fill sizes={big ? "252px" : "126px"} className="object-cover" />
                  {offer && (
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {offer.price}
                    </span>
                  )}
                </button>
              );
            })}
            {visiblePosts.length === 0 && (
              <p className="col-span-3 px-6 pt-10 text-center text-[14px] text-secondary">
                Nothing here yet — try another category.
              </p>
            )}
          </div>
        ) : (
          /* Nearby */
          <div className="px-4 pb-24 pt-4">
            {/* Map preview header */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setMapOpen(true)}
              className="relative mb-4 block h-36 w-full overflow-hidden rounded-2xl border border-border"
            >
              <Image src="/onboarding/map-streets.png" alt="Map of nearby salons" fill sizes="346px" className="object-cover" />
              {visibleSalons.slice(0, PIN_POSITIONS.length).map((s, i) => (
                <span
                  key={s.id}
                  className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-md"
                  style={{ ...PIN_POSITIONS[i % PIN_POSITIONS.length], background: categoryColor(s.category) }}
                >
                  <MapPin size={13} strokeWidth={2.5} />
                </span>
              ))}
              <span className="absolute bottom-2 right-2 rounded-full bg-ink px-3 py-1.5 text-[12px] font-semibold text-white">
                Open map
              </span>
            </motion.button>

            <SectionLabel count={visibleSalons.length}>Nearby</SectionLabel>
            <div className="space-y-3">
              {visibleSalons.map((s) => (
                <div key={s.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
                  <button
                    type="button"
                    onClick={() => router.push(`/c/salon/${s.id}`)}
                    className="relative block h-32 w-full bg-border"
                  >
                    <Image src={s.cover} alt={s.name} fill sizes="346px" className="object-cover" />
                    <span className="absolute left-2 top-2">
                      <StatusPill tone={s.openNow ? "light" : "amber"}>{s.openNow ? "Open now" : "Closed"}</StatusPill>
                    </span>
                  </button>
                  <div className="p-3">
                    <button
                      type="button"
                      onClick={() => router.push(`/c/salon/${s.id}`)}
                      className="block w-full text-left"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[15px] font-bold text-navy">{s.name}</p>
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                          style={{ background: tintFromHex(categoryColor(s.category), 0.12), color: categoryColor(s.category) }}
                        >
                          {s.category}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2">
                        <Stars rating={s.rating} count={s.reviewCount} />
                        <span className="text-[12px] text-muted">· {s.distance}</span>
                      </div>
                      <p className="mt-1 text-[12px] text-secondary">Next available · {s.nextAvailable}</p>
                    </button>
                    <div className="mt-2.5">
                      <DarkButton className="!h-10 !text-[13px]" onClick={() => router.push(`/c/salon/${s.id}`)}>
                        Book
                      </DarkButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Map sheet */}
      <Sheet open={mapOpen} onClose={() => setMapOpen(false)} title="Nearby on the map" sub="Sunningdale & Ascot" full>
        <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-border">
          <Image src="/onboarding/map-streets.png" alt="Map" fill sizes="346px" className="object-cover" />
          {salons.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={s.name}
              onClick={() => setMapSalonIdx(i)}
              className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-md transition-all ${
                i === mapSalonIdx ? "h-8 w-8" : "h-6 w-6 opacity-80"
              }`}
              style={{ ...PIN_POSITIONS[i % PIN_POSITIONS.length], background: categoryColor(s.category) }}
            >
              <MapPin size={i === mapSalonIdx ? 16 : 13} strokeWidth={2.5} />
            </button>
          ))}
        </div>
        {/* Selected salon mini-card */}
        <motion.button
          key={mapSalon.id}
          type="button"
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => router.push(`/c/salon/${mapSalon.id}`)}
          className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-left"
        >
          <Avatar initials={mapSalon.avatar} category={mapSalon.category} size={48} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-navy">{mapSalon.name}</p>
            <div className="flex items-center gap-2">
              <Stars rating={mapSalon.rating} count={mapSalon.reviewCount} />
              <span className="text-[12px] text-muted">· {mapSalon.distance}</span>
            </div>
            <p className="mt-0.5 text-[12px] text-secondary">Next available · {mapSalon.nextAvailable}</p>
          </div>
          <ChevronRight size={16} strokeWidth={1.75} className="text-muted" />
        </motion.button>
      </Sheet>

      {/* Filters sheet */}
      <Sheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters" sub="Refine what you see" full>
        <div className="space-y-6 pb-4">
          <div>
            <p className="pb-2 text-[13px] font-bold text-navy">Categories</p>
            <div className="flex flex-wrap gap-2">
              {defaultCategories.map((c) => {
                const active = fCategories.includes(c.name);
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => toggle(fCategories, c.name, setFCategories)}
                    className="rounded-full px-3.5 py-1.5 text-[12px] font-semibold"
                    style={
                      active
                        ? { background: c.color, color: "#fff" }
                        : { background: tintFromHex(c.color, 0.12), color: c.color }
                    }
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="pb-2 text-[13px] font-bold text-navy">Rating</p>
            <div className="flex gap-2">
              {RATING_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFRating(fRating === r ? null : r)}
                  className={`flex-1 rounded-full border py-2 text-[13px] font-semibold ${
                    fRating === r ? "border-ink bg-ink text-white" : "border-border bg-surface text-navy"
                  }`}
                >
                  ★ {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="pb-2 text-[13px] font-bold text-navy">Distance</p>
            <div className="flex rounded-full bg-canvas p-1">
              {DISTANCE_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFDistance(d)}
                  className={`flex-1 rounded-full py-2 text-[12px] font-semibold ${
                    fDistance === d ? "bg-white text-navy shadow-sm" : "text-secondary"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="pb-2 text-[13px] font-bold text-navy">Price range</p>
            <div className="flex gap-2">
              {PRICE_OPTIONS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => toggle(fPrices, p, setFPrices)}
                  className={`flex-1 rounded-full border py-2 text-[13px] font-semibold ${
                    fPrices.includes(p) ? "border-ink bg-ink text-white" : "border-border bg-surface text-navy"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="pb-2 text-[13px] font-bold text-navy">Availability</p>
            {[
              { label: "Open now", value: fOpenNow, set: setFOpenNow },
              { label: "Available today", value: fToday, set: setFToday },
            ].map(({ label, value, set }) => (
              <button
                key={label}
                type="button"
                onClick={() => set(!value)}
                className="flex w-full items-center justify-between py-2.5"
              >
                <span className="text-[14px] text-navy">{label}</span>
                <span
                  className={`flex h-7 w-12 items-center rounded-full p-1 transition-colors ${
                    value ? "bg-ink" : "bg-border"
                  }`}
                >
                  <span
                    className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      value ? "translate-x-5" : ""
                    }`}
                  />
                </span>
              </button>
            ))}
          </div>

          <div>
            <p className="pb-2 text-[13px] font-bold text-navy">Offer type</p>
            <div className="space-y-1">
              {OFFER_TYPE_OPTIONS.map(({ label, value }) => {
                const active = fTypes.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggle(fTypes, value, setFTypes)}
                    className="flex w-full items-center justify-between py-2.5"
                  >
                    <span className="text-[14px] text-navy">{label}</span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-md border text-[11px] font-bold ${
                        active ? "border-ink bg-ink text-white" : "border-border bg-surface text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <GhostButton className="flex-1" onClick={clearFilters}>
              Clear all
            </GhostButton>
            <DarkButton className="flex-1" onClick={() => setFiltersOpen(false)}>
              Show results
            </DarkButton>
          </div>
        </div>
      </Sheet>
    </div>
  );
}
