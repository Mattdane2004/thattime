"use client";

// /c/salon/[id]/reviews — full reviews list. Same content as the salon
// page Reviews tab, standalone with a back header and sort chips.

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Star } from "lucide-react";
import { StatusPill } from "@/components/ui";
import { Avatar } from "@/components/client/shared";
import { salons, getSalon } from "@/lib/data/b2c";

const SORTS = ["Newest", "Highest", "Lowest"] as const;
type Sort = (typeof SORTS)[number];

// Mock rating distribution (percent of reviews per star, 5 → 1).
const RATING_BARS = [82, 12, 4, 1, 1];

export default function SalonReviewsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const salon = getSalon(params.id) ?? salons[0];
  const [sort, setSort] = useState<Sort>("Newest");

  const reviews = useMemo(() => {
    const list = [...salon.reviews];
    if (sort === "Highest") list.sort((a, b) => b.stars - a.stars);
    if (sort === "Lowest") list.sort((a, b) => a.stars - b.stars);
    return list; // "Newest" keeps data order (already newest-first)
  }, [salon, sort]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      {/* Back header */}
      <div className="flex shrink-0 items-center gap-1 border-b border-border bg-surface px-2 py-2.5">
        <button type="button" aria-label="Back" onClick={() => router.back()} className="p-2 text-navy">
          <ChevronLeft size={20} strokeWidth={1.75} />
        </button>
        <div>
          <h1 className="text-[15px] font-bold leading-tight text-navy">Reviews</h1>
          <p className="text-[11px] text-secondary">{salon.name}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-24 pt-4">
        {/* Summary */}
        <div className="rounded-2xl border border-border bg-surface p-4">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="font-display text-[36px] font-extrabold tracking-tight text-navy">{salon.rating}</p>
              <span className="flex justify-center text-navy">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} size={12} className="fill-current" />
                ))}
              </span>
              <p className="text-[11px] text-secondary">{salon.reviewCount.toLocaleString()} reviews</p>
            </div>
            <div className="flex-1 space-y-1">
              {RATING_BARS.map((pct, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-3 text-right text-[11px] text-secondary">{5 - i}</span>
                  <div className="h-1.5 flex-1 rounded-full bg-canvas">
                    <div className="h-1.5 rounded-full bg-navy" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sort chips */}
        <div className="flex gap-2 pt-4">
          {SORTS.map((s) => (
            <motion.button
              key={s}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setSort(s)}
              className={`rounded-full border px-4 py-2 text-[12px] font-semibold ${
                sort === s ? "border-ink bg-ink text-white" : "border-border bg-surface text-navy"
              }`}
            >
              {s}
            </motion.button>
          ))}
        </div>

        {/* Reviews */}
        <div className="space-y-3 pt-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-surface p-3.5">
              <div className="flex items-center gap-3">
                <Avatar initials={r.initials} size={36} />
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-navy">{r.author}</p>
                  <div className="flex items-center gap-2">
                    <span className="flex text-navy">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} size={11} className={i < r.stars ? "fill-current" : "text-border"} />
                      ))}
                    </span>
                    <span className="text-[11px] text-muted">{r.date}</span>
                  </div>
                </div>
                <StatusPill>{r.service}</StatusPill>
              </div>
              <p className="mt-2 text-[13px] leading-snug text-navy">{r.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
