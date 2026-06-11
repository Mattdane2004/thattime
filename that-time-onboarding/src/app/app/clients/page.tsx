"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, UserPlus, ArrowUpDown, SlidersHorizontal, ChevronDown, Star, Flag } from "lucide-react";
import type { TagTone } from "@/lib/types";
import { clientList, clientSortOptions, sortClients, type SortOption } from "@/lib/data/clients";

// Clients directory — ported from the legacy that-time-app /routes/main/Clients.jsx.
// Search/sort/filter run on local state; the original's import/merge/block
// mutation sheets are deferred to the shared app-state slice (see PORTING.md).

const TAG_TONES: Record<TagTone, string> = {
  light: "bg-canvas text-muted",
  mid: "bg-muted text-white",
  dark: "bg-navy text-white",
};

export default function ClientsPage() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption["id"]>("recent");
  const [filter, setFilter] = useState("All");

  const filterOptions = useMemo(
    () => ["All", ...Array.from(new Set(clientList.flatMap((c) => c.tags.map((t) => t.label))))],
    [],
  );

  const visible = useMemo(() => {
    const matched = clientList.filter((c) => {
      if (!c.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
      if (filter !== "All" && !c.tags.some((t) => t.label === filter)) return false;
      return true;
    });
    return sortClients(matched, sort);
  }, [query, sort, filter]);

  const sortLabel = clientSortOptions.find((o) => o.id === sort)?.label;

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 items-center px-5">
        <div className="text-[17px] font-semibold text-navy">Clients</div>
      </div>

      <div className="px-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-12 flex-1 items-center gap-2 rounded-full bg-canvas px-4">
            <Search size={16} className="shrink-0 text-muted" strokeWidth={1.75} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, phone, or email"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-navy outline-none placeholder:text-muted"
            />
          </div>
          <button className="flex h-12 shrink-0 items-center gap-1.5 rounded-full bg-navy px-4 text-[13px] font-semibold text-white hover:bg-navy/90">
            <UserPlus size={15} strokeWidth={1.75} />Add
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          {/* Sort cycles through options (no sheet yet) */}
          <button
            onClick={() => {
              const i = clientSortOptions.findIndex((o) => o.id === sort);
              setSort(clientSortOptions[(i + 1) % clientSortOptions.length].id);
            }}
            className="flex items-center gap-1.5 rounded-full bg-canvas px-3.5 py-2 text-[12px] font-medium text-secondary"
          >
            <ArrowUpDown size={13} strokeWidth={1.75} />{sortLabel}<ChevronDown size={13} strokeWidth={1.75} />
          </button>
          <button
            onClick={() => {
              const i = filterOptions.indexOf(filter);
              setFilter(filterOptions[(i + 1) % filterOptions.length]);
            }}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-medium transition-colors ${
              filter !== "All" ? "bg-navy text-white" : "bg-canvas text-secondary"
            }`}
          >
            <SlidersHorizontal size={13} strokeWidth={1.75} />{filter === "All" ? "Filter" : filter}
            <ChevronDown size={13} strokeWidth={1.75} />
          </button>
        </div>

        <div className="mt-3 text-[12px] text-muted">
          {visible.length} client{visible.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-6">
        {visible.map((client) => (
          <Link key={client.id} href={`/app/clients/${client.id}`} className="flex items-start gap-3.5 rounded-2xl bg-canvas px-4 py-4 transition-colors hover:bg-border/40">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-border text-[12px] font-semibold ${client.muted ? "text-muted" : "text-secondary"}`}>
              {client.initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-[14px] font-semibold ${client.muted ? "text-muted" : "text-navy"}`}>{client.name}</span>
                {client.rating && (
                  <span className={`flex items-center gap-0.5 text-[12px] font-medium ${client.muted ? "text-muted" : "text-secondary"}`}>
                    <Star size={11} className="fill-current" />{client.rating}
                  </span>
                )}
              </div>
              <div className={`mt-0.5 text-[12px] ${client.muted ? "text-muted" : "text-muted"}`}>{client.schedule}</div>
              {client.tags.length > 0 && (
                <div className="mt-2 flex items-center gap-1.5">
                  {client.tags.map((tag) => (
                    <span key={tag.label} className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${TAG_TONES[tag.tone]}`}>{tag.label}</span>
                  ))}
                </div>
              )}
            </div>
            {client.tags.some((t) => t.label === "Allergy") && <Flag size={11} className="shrink-0 fill-navy text-navy" />}
          </Link>
        ))}
        {visible.length === 0 && <div className="pt-12 text-center text-[13px] text-muted">No clients match</div>}
      </div>
    </div>
  );
}
