"use client";

// Inbox — conversation list with local search filtering.

import { useState } from "react";
import Link from "next/link";
import { SquarePen, Search, MessageCircle } from "lucide-react";
import { conversations, getSalon } from "@/lib/data/b2c";
import { Avatar } from "@/components/ui/consumer";

export default function InboxPage() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const filtered = conversations.filter(
    (c) => c.salonName.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q),
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      {/* header */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <h1 className="font-display text-[20px] font-extrabold tracking-tight text-navy">Inbox</h1>
        <button type="button" aria-label="New message" className="p-1 text-navy">
          <SquarePen size={20} strokeWidth={1.75} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* search */}
        <div className="bg-surface px-4 pb-3 pt-3">
          <div className="flex h-10 items-center gap-2 rounded-full border border-border bg-canvas px-4">
            <Search size={16} strokeWidth={1.75} className="shrink-0 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations"
              className="min-w-0 flex-1 bg-transparent text-[13px] text-navy placeholder:text-muted focus:outline-none"
            />
          </div>
        </div>

        {/* conversation rows */}
        <div className="bg-surface">
          {filtered.map((c) => {
            const unread = c.unread > 0;
            return (
              <Link
                key={c.id}
                href={`/c/inbox/${c.id}`}
                className="flex items-center gap-3 border-b border-border px-4 py-3.5"
              >
                <Avatar initials={c.avatar} category={getSalon(c.salonId)?.category} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-coral" />}
                    <p className={`truncate text-[14px] text-navy ${unread ? "font-extrabold" : "font-bold"}`}>
                      {c.salonName}
                    </p>
                  </div>
                  <p className={`truncate text-[13px] ${unread ? "font-medium text-navy" : "text-secondary"}`}>
                    {c.lastMessage}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="text-[11px] text-muted">{c.time}</span>
                  {unread && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1.5 text-[11px] font-bold text-white">
                      {c.unread}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        {/* empty search state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-8 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-muted">
              <MessageCircle size={24} strokeWidth={1.75} />
            </span>
            <p className="text-[15px] font-bold text-navy">No conversations found</p>
            <p className="text-[13px] text-secondary">
              Nothing matches &ldquo;{query}&rdquo;. Try a different salon name.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
