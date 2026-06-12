"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Building2 } from "lucide-react";
import { AppHeader } from "@/components/app/ui";
import { conversations } from "@/lib/data/product";

// Messages — conversation list with unread/group/business filters.

const FILTERS = ["All", "Unread", "Clients", "Team & business"];
const isBiz = (c: { kind: string }) => c.kind !== "client";

export default function MessagesPage() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");

  const visible = conversations.filter((c) => {
    if (!c.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === "Unread") return c.unread > 0;
    if (filter === "Clients") return !isBiz(c);
    if (filter === "Team & business") return isBiz(c);
    return true;
  });

  // Client chats and internal/business chats are kept visually separate.
  const sections: { label: string | null; items: typeof visible }[] =
    filter === "All" || filter === "Unread"
      ? [
          { label: "Clients", items: visible.filter((c) => !isBiz(c)) },
          { label: "Team & business", items: visible.filter(isBiz) },
        ].filter((s) => s.items.length > 0)
      : [{ label: null, items: visible }];

  return (
    <div className="min-h-full bg-white pb-6">
      <AppHeader title="Messages" />
      <div className="px-4 pb-3">
        <div className="relative">
          <Search size={15} strokeWidth={1.75} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations..."
            className="h-11 w-full rounded-full bg-canvas pl-10 pr-4 text-[13px] text-navy placeholder:text-muted focus:outline-none"
          />
        </div>
        <div className="flex gap-2 pt-3">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium ${
                filter === f ? "bg-fg-primary text-white" : "bg-canvas text-secondary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {sections.map((section) => (
      <div key={section.label ?? "list"} className="flex flex-col">
        {section.label && (
          <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
            {section.label}
          </p>
        )}
        {section.items.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * i, duration: 0.2 }}
          >
            <Link href={`/app/messages/${c.id}`} className="flex items-center gap-3.5 px-4 py-4">
              <span className="relative shrink-0">
                {c.kind === "group" ? (
                  <span className="relative block h-12 w-12">
                    <span className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-canvas text-[8px] font-bold text-secondary">
                      SJ
                    </span>
                    <span className="absolute bottom-0 left-3.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-canvas text-[8px] font-bold text-secondary">
                      AB
                    </span>
                    <span className="absolute right-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-canvas text-[7px] font-bold text-secondary">
                      MD
                    </span>
                  </span>
                ) : c.kind === "business" ? (
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-canvas text-secondary">
                    <Building2 size={20} strokeWidth={1.5} />
                  </span>
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-[13px] font-semibold text-muted">
                    {c.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </span>
                )}
                {c.unread > 0 && <span className="absolute left-0 top-0 h-2.5 w-2.5 rounded-full bg-fg-primary ring-2 ring-white" />}
              </span>
              <span className="min-w-0 flex-1 border-b border-border pb-4">
                <span className="flex items-baseline justify-between">
                  <span className={`text-[15px] ${c.unread ? "font-bold" : "font-semibold"} text-navy`}>{c.name}</span>
                  <span className="shrink-0 text-[11px] text-muted">{c.time}</span>
                </span>
                <span className="flex items-center justify-between pt-0.5">
                  <span className={`truncate text-[13px] ${c.unread ? "font-medium text-navy" : "text-muted"}`}>
                    {c.preview}
                  </span>
                  {c.unread > 0 && (
                    <span className="ml-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-fg-primary text-[10px] font-bold text-white">
                      {c.unread}
                    </span>
                  )}
                </span>
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
      ))}
    </div>
  );
}
