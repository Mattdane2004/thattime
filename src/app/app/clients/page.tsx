"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, UserPlus, ArrowUpDown, SlidersHorizontal, ChevronDown, Star } from "lucide-react";
import { AppHeader } from "@/components/app/ui";
import { useAppStore } from "@/lib/store/appStore";
import { clientRows } from "@/lib/data/product";

// Clients — searchable directory with tags; Add opens the New Client sheet.

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

export default function ClientsPage() {
  const [query, setQuery] = useState("");
  const setQuickAction = useAppStore((s) => s.setQuickAction);
  const visible = clientRows.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

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
            onClick={() => setQuickAction("client")}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-[#14181F] px-4 text-[13px] font-semibold text-white"
          >
            <UserPlus size={15} strokeWidth={1.8} />
            Add
          </motion.button>
        </div>
        <div className="flex items-center gap-2 px-4 pb-3">
          <button className="flex items-center gap-1.5 rounded-full bg-canvas px-3.5 py-2 text-[12px] font-medium text-navy">
            <ArrowUpDown size={13} strokeWidth={1.75} />
            Recent booking
            <ChevronDown size={12} className="text-muted" />
          </button>
          <button className="flex items-center gap-1.5 rounded-full bg-canvas px-3.5 py-2 text-[12px] font-medium text-navy">
            <SlidersHorizontal size={13} strokeWidth={1.75} />
            Filter
            <ChevronDown size={12} className="text-muted" />
          </button>
        </div>
      </div>

      <p className="px-4 pb-2 pt-3 text-[12px] text-muted">{visible.length} clients</p>
      <div className="flex flex-col gap-2.5 px-4">
        {visible.map((c, i) => {
          const blocked = c.tags.includes("Blocked");
          return (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i, duration: 0.22 }}
            >
              <Link
                href={`/app/clients/${c.id}`}
                className={`flex items-center gap-3.5 rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(15,26,46,0.04)] ${
                  blocked ? "opacity-55" : ""
                }`}
              >
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
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
