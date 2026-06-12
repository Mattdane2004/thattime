"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, UserPlus, ArrowUpDown, SlidersHorizontal, ChevronDown, Star,
  MoreVertical, Upload, Merge, FileSpreadsheet, FileText, CheckSquare, Check,
  Ban, Tag as TagIcon, Trash2, X,
} from "lucide-react";
import { AppHeader, Sheet, DarkButton, GhostButton } from "@/components/app/ui";
import { useAppStore } from "@/lib/store/appStore";
import { clientRows } from "@/lib/data/product";

// Clients — searchable, sortable, filterable directory with import/export,
// merge-duplicates and a multi-select mode for bulk block/tag/delete.

const sortOptions = ["Recent booking", "Name A–Z", "Rating"];
const filterTags = ["All", "Regular", "VIP", "Allergy", "Blocked", "Inactive"];

function Tag({ label }: { label: string }) {
  const dark = label === "Allergy" || label === "Blocked";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        dark ? "bg-[#14181F] text-white" : "bg-canvas text-secondary"
      }`}
    >
      {label}
    </span>
  );
}

type Row = (typeof clientRows)[number];

export default function ClientsPage() {
  const router = useRouter();
  const setQuickAction = useAppStore((s) => s.setQuickAction);
  const [rows, setRows] = useState<Row[]>(() => clientRows.map((c) => ({ ...c, tags: [...c.tags] })));
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState(sortOptions[0]);
  const [filterTag, setFilterTag] = useState("All");
  const [sheet, setSheet] = useState<null | "add" | "tools" | "import" | "merge" | "filter" | "sort">(null);
  const [imported, setImported] = useState<"idle" | "picked" | "done">("idle");
  const [merged, setMerged] = useState(false);
  const [exported, setExported] = useState<string | null>(null);

  // Multi-select mode for bulk actions.
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const toggleSel = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const exitSelect = () => {
    setSelectMode(false);
    setSelected([]);
  };
  const bulk = (action: "block" | "tag" | "delete") => {
    setRows((rs) =>
      action === "delete"
        ? rs.filter((r) => !selected.includes(r.id))
        : rs.map((r) =>
            selected.includes(r.id)
              ? { ...r, tags: Array.from(new Set([...r.tags, action === "block" ? "Blocked" : "VIP"])) }
              : r,
          ),
    );
    exitSelect();
  };

  const visible = rows
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    .filter((c) => filterTag === "All" || c.tags.includes(filterTag))
    .sort((a, b) =>
      sortBy === "Name A–Z" ? a.name.localeCompare(b.name) : sortBy === "Rating" ? b.rating - a.rating : 0,
    );

  return (
    <div className="min-h-full bg-fog pb-6">
      <div className="bg-white pb-1">
        <AppHeader title="Clients" />
        <div className="flex items-center gap-2.5 px-4 pb-3">
          <div className="relative flex-1">
            <Search size={15} strokeWidth={1.75} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, phone, or email"
              className="h-11 w-full rounded-full bg-canvas pl-10 pr-4 text-[13px] text-navy placeholder:text-muted focus:outline-none"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSheet("add")}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-[#14181F] px-4 text-[13px] font-semibold text-white"
          >
            <UserPlus size={15} strokeWidth={1.8} />
            Add
          </motion.button>
          <button
            type="button"
            aria-label="Client tools"
            onClick={() => setSheet("tools")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-canvas text-navy"
          >
            <MoreVertical size={16} strokeWidth={1.75} />
          </button>
        </div>
        <div className="flex items-center gap-2 px-4 pb-3">
          <button
            onClick={() => setSheet("sort")}
            className="flex items-center gap-1.5 rounded-full bg-canvas px-3.5 py-2 text-[12px] font-medium text-navy"
          >
            <ArrowUpDown size={13} strokeWidth={1.75} />
            {sortBy}
            <ChevronDown size={12} className="text-muted" />
          </button>
          <button
            onClick={() => setSheet("filter")}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-medium ${
              filterTag !== "All" ? "bg-[#14181F] text-white" : "bg-canvas text-navy"
            }`}
          >
            <SlidersHorizontal size={13} strokeWidth={1.75} />
            {filterTag === "All" ? "Filter" : filterTag}
            {filterTag !== "All" ? <X size={12} onClick={(e) => { e.stopPropagation(); setFilterTag("All"); }} /> : <ChevronDown size={12} className="text-muted" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-4 pb-2 pt-3">
        <p className="text-[12px] text-muted">
          {selectMode ? `${selected.length} selected` : `${visible.length} clients`}
        </p>
        {selectMode && (
          <button onClick={exitSelect} className="text-[12px] font-semibold text-navy">
            Cancel
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2.5 px-4">
        <AnimatePresence initial={false}>
        {visible.map((c) => {
          const blocked = c.tags.includes("Blocked");
          const isSel = selected.includes(c.id);
          return (
            <motion.div
              key={c.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, marginBottom: -10 }}
              transition={{ duration: 0.22 }}
            >
              <button
                type="button"
                onClick={() => (selectMode ? toggleSel(c.id) : router.push(`/app/clients/${c.id}`))}
                className={`flex w-full items-center gap-3.5 rounded-2xl bg-white p-4 text-left shadow-[0_1px_4px_rgba(15,26,46,0.04)] ${
                  blocked && !selectMode ? "opacity-55" : ""
                } ${isSel ? "ring-2 ring-[#14181F]" : ""}`}
              >
                {selectMode && (
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                      isSel ? "border-[#14181F] bg-[#14181F] text-white" : "border-border"
                    }`}
                  >
                    {isSel && <Check size={13} strokeWidth={3} />}
                  </span>
                )}
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-canvas text-[13px] font-semibold text-muted">
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="text-[15px] font-semibold text-navy">{c.name}</span>
                    {c.rating > 0 && (
                      <span className="flex items-center gap-0.5 text-[12px] font-medium text-navy">
                        <Star size={11} className="fill-current" />
                        {c.rating}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-muted">{c.meta}</span>
                  {c.tags.length > 0 && (
                    <span className="mt-1.5 flex gap-1.5">
                      {c.tags.map((t) => (
                        <Tag key={t} label={t} />
                      ))}
                    </span>
                  )}
                </span>
              </button>
            </motion.div>
          );
        })}
        </AnimatePresence>
      </div>

      {/* Bulk action bar */}
      <AnimatePresence>
        {selectMode && selected.length > 0 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-[78px] z-40 flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#14181F] p-1.5 pl-4 text-white shadow-[0_6px_20px_rgba(15,26,46,0.35)]"
            >
              <span className="text-[12px] font-semibold">{selected.length}</span>
              {[
                { icon: <Ban size={14} />, label: "Block", run: () => bulk("block") },
                { icon: <TagIcon size={14} />, label: "Tag VIP", run: () => bulk("tag") },
                { icon: <Trash2 size={14} />, label: "Delete", run: () => bulk("delete") },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={a.run}
                  className="flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-[12px] font-semibold"
                >
                  {a.icon}
                  {a.label}
                </button>
              ))}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add menu */}
      <Sheet open={sheet === "add"} onClose={() => setSheet(null)} title="Add clients">
        <div className="flex flex-col gap-3 pt-1">
          {[
            { icon: <UserPlus size={19} strokeWidth={1.7} />, t: "New client", s: "Add one client by hand", run: () => { setSheet(null); setQuickAction("client"); } },
            { icon: <Upload size={18} strokeWidth={1.7} />, t: "Import clients", s: "Bring a list over from a CSV file", run: () => { setImported("idle"); setSheet("import"); } },
          ].map((a) => (
            <button key={a.t} onClick={a.run} className="flex w-full items-center gap-4 rounded-2xl border border-border bg-white p-4 text-left">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-canvas text-navy">{a.icon}</span>
              <span>
                <span className="block text-[15px] font-semibold text-navy">{a.t}</span>
                <span className="mt-0.5 block text-[12px] text-muted">{a.s}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="h-2" />
      </Sheet>

      {/* Tools (3-dot) */}
      <Sheet open={sheet === "tools"} onClose={() => setSheet(null)} title="Manage client list">
        <div className="flex flex-col pt-1">
          {[
            { icon: <CheckSquare size={17} strokeWidth={1.7} />, t: "Select clients", s: "Bulk block, tag or delete", run: () => { setSheet(null); setSelectMode(true); } },
            { icon: <Upload size={17} strokeWidth={1.7} />, t: "Import from CSV", s: "Upload a spreadsheet of clients", run: () => { setImported("idle"); setSheet("import"); } },
            { icon: <Merge size={17} strokeWidth={1.7} />, t: "Merge duplicates", s: "Find and combine duplicate profiles", run: () => { setMerged(false); setSheet("merge"); } },
            { icon: <FileSpreadsheet size={17} strokeWidth={1.7} />, t: "Export as Excel", s: ".xlsx — opens in Excel or Numbers", run: () => setExported("Excel") },
            { icon: <FileText size={17} strokeWidth={1.7} />, t: "Export as CSV", s: ".csv — works everywhere", run: () => setExported("CSV") },
          ].map((a) => (
            <button key={a.t} onClick={a.run} className="flex w-full items-center gap-3.5 border-b border-border py-3.5 text-left last:border-0">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas text-navy">{a.icon}</span>
              <span className="flex-1">
                <span className="block text-[14px] font-semibold text-navy">{a.t}</span>
                <span className="block text-[12px] text-muted">{a.s}</span>
              </span>
              {exported && a.t.includes(exported) && (
                <span className="flex items-center gap-1 text-[12px] font-semibold text-navy">
                  <Check size={13} strokeWidth={2.5} /> Sent
                </span>
              )}
            </button>
          ))}
        </div>
        {exported && (
          <p className="pt-3 text-center text-[12px] text-muted">
            {visible.length} clients exported — download link sent to your email.
          </p>
        )}
      </Sheet>

      {/* Import CSV */}
      <Sheet open={sheet === "import"} onClose={() => setSheet(null)} title="Import clients" sub="Names, numbers, emails and notes come across">
        {imported === "done" ? (
          <div className="flex flex-col items-center pb-2 pt-4 text-center">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="flex h-16 w-16 items-center justify-center rounded-full bg-[#14181F] text-white">
              <Check size={26} strokeWidth={2.2} />
            </motion.span>
            <p className="pt-5 text-[16px] font-bold text-navy">38 clients imported</p>
            <p className="pt-1 text-[13px] text-secondary">Duplicates were skipped automatically.</p>
            <div className="w-full pt-6">
              <DarkButton onClick={() => setSheet(null)}>Done</DarkButton>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setImported("picked")}
              className={`flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed px-4 py-8 ${
                imported === "picked" ? "border-[#14181F] bg-canvas" : "border-border bg-white"
              }`}
            >
              <Upload size={22} strokeWidth={1.5} className="text-secondary" />
              {imported === "picked" ? (
                <>
                  <span className="text-[14px] font-bold text-navy">clients.csv</span>
                  <span className="text-[12px] text-muted">38 rows · 4 columns recognised</span>
                </>
              ) : (
                <>
                  <span className="text-[14px] font-semibold text-navy">Upload a CSV file</span>
                  <span className="text-[12px] text-muted">From Fresha, Booksy, Excel or anywhere else</span>
                </>
              )}
            </button>
            <div className="pt-5">
              <DarkButton disabled={imported !== "picked"} onClick={() => setImported("done")}>
                {imported === "picked" ? "Import 38 clients" : "Choose a file first"}
              </DarkButton>
            </div>
          </>
        )}
      </Sheet>

      {/* Merge duplicates */}
      <Sheet open={sheet === "merge"} onClose={() => setSheet(null)} title="Merge duplicates" sub="We look for matching names, numbers and emails">
        {merged ? (
          <div className="flex flex-col items-center pb-2 pt-4 text-center">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="flex h-16 w-16 items-center justify-center rounded-full bg-[#14181F] text-white">
              <Merge size={24} strokeWidth={1.8} />
            </motion.span>
            <p className="pt-5 text-[16px] font-bold text-navy">1 pair merged</p>
            <p className="pt-1 text-[13px] text-secondary">Bookings, notes and forms were combined.</p>
            <div className="w-full pt-6">
              <DarkButton onClick={() => setSheet(null)}>Done</DarkButton>
            </div>
          </div>
        ) : (
          <>
            <p className="pb-3 text-[13px] text-secondary">1 possible duplicate found:</p>
            <div className="overflow-hidden rounded-2xl border border-border">
              {[
                ["Sarah Johnson", "(555) 234-5678 · 24 bookings"],
                ["S. Johnson", "(555) 234-5678 · 2 bookings"],
              ].map(([n, m], i) => (
                <div key={n} className={`flex items-center gap-3 px-4 py-3 ${i > 0 ? "border-t border-border" : ""}`}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-[11px] font-bold text-secondary">SJ</span>
                  <span className="flex-1">
                    <span className="block text-[14px] font-semibold text-navy">{n}</span>
                    <span className="block text-[12px] text-muted">{m}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-5">
              <DarkButton onClick={() => setMerged(true)}>
                <Merge size={15} />
                Merge into Sarah Johnson
              </DarkButton>
              <GhostButton className="mt-3" onClick={() => setSheet(null)}>Not duplicates</GhostButton>
            </div>
          </>
        )}
      </Sheet>

      {/* Sort */}
      <Sheet open={sheet === "sort"} onClose={() => setSheet(null)} title="Sort by">
        {sortOptions.map((o) => (
          <button
            key={o}
            onClick={() => {
              setSortBy(o);
              setSheet(null);
            }}
            className="flex w-full items-center justify-between border-b border-border py-3.5 text-left text-[14px] font-medium text-navy last:border-0"
          >
            {o}
            {sortBy === o && <Check size={15} strokeWidth={2.5} />}
          </button>
        ))}
      </Sheet>

      {/* Filter */}
      <Sheet open={sheet === "filter"} onClose={() => setSheet(null)} title="Filter clients">
        <div className="flex flex-wrap gap-2 pt-1">
          {filterTags.map((t) => (
            <button
              key={t}
              onClick={() => {
                setFilterTag(t);
                setSheet(null);
              }}
              className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-colors ${
                filterTag === t ? "border-[#14181F] bg-[#14181F] text-white" : "border-border bg-white text-navy"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="h-4" />
      </Sheet>
    </div>
  );
}
