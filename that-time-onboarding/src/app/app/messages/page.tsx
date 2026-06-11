"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Building2 } from "lucide-react";
import { conversationList, type Conversation } from "@/lib/data/messages";

// Messages — ported from the legacy that-time-app /routes/main/Messages.jsx.
// Self-contained (client/internal tabs, search, unread filter). Opening a
// thread (the Conversation screen) is part of the backlog — see PORTING.md.

function Avatar({ convo }: { convo: Conversation }) {
  if (convo.group && Array.isArray(convo.initials)) {
    const [a, b, c] = convo.initials;
    return (
      <div className="relative h-12 w-12 shrink-0">
        <span className="absolute right-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-canvas text-[8px] font-semibold text-muted">{a}</span>
        <span className="absolute left-0 top-3 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-border text-[8px] font-semibold text-muted">{b}</span>
        {c && <span className="absolute bottom-0 right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-canvas text-[8px] font-semibold text-muted">{c}</span>}
      </div>
    );
  }
  if (convo.business) {
    return (
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-canvas">
        <Building2 size={20} className="text-muted" strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-canvas text-[13px] font-semibold text-muted">
      {convo.initials as string}
      {convo.unread && <span className="absolute left-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-surface bg-navy" />}
    </div>
  );
}

const TABS = [
  { key: "clients", label: "Clients" },
  { key: "internal", label: "Team & Business" },
] as const;

export default function MessagesPage() {
  const [tab, setTab] = useState<"clients" | "internal">("clients");
  const [filter, setFilter] = useState<"All" | "Unread">("All");
  const [query, setQuery] = useState("");

  const inTab = conversationList.filter((c) =>
    tab === "internal" ? c.group || c.business : !c.group && !c.business,
  );
  const visible = inTab.filter((c) => {
    if (query && !c.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
    if (filter === "Unread") return Boolean(c.unread);
    return true;
  });

  return (
    <div className="flex h-full flex-col bg-surface">
      <div className="flex h-16 items-center px-5">
        <div className="text-[17px] font-semibold text-navy">Messages</div>
      </div>

      <div className="px-4 pb-3">
        <div className="mb-3 flex rounded-full bg-canvas p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setFilter("All"); }}
              className={`flex-1 rounded-full py-2 text-[13px] font-medium transition-colors ${
                tab === t.key ? "bg-surface font-semibold text-navy shadow-sm" : "text-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex h-12 items-center gap-2 rounded-full bg-canvas px-4">
          <Search size={16} className="shrink-0 text-muted" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations…"
            className="min-w-0 flex-1 bg-transparent text-[13px] text-navy outline-none placeholder:text-muted"
          />
        </div>
        <div className="mt-3 flex items-center gap-2">
          {(["All", "Unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-2 text-[12px] font-medium transition-colors ${
                filter === f ? "bg-navy text-white" : "bg-canvas text-muted"
              }`}
            >
              {f === "Unread" ? `Unread ${inTab.filter((c) => c.unread).length}` : f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {visible.map((convo, i) => (
          <Link key={convo.id} href={`/app/messages/${convo.id}`} className={`flex w-full items-center gap-3.5 py-4 text-left ${i > 0 ? "border-t border-border" : ""}`}>
            <Avatar convo={convo} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[14px] font-semibold text-navy">{convo.name}</span>
                <span className="shrink-0 text-[11px] text-muted">{convo.time}</span>
              </div>
              <div className="mt-0.5 flex items-center justify-between gap-2">
                <span className={`truncate text-[13px] ${convo.unread ? "font-medium text-navy" : "text-muted"}`}>{convo.preview}</span>
                {convo.unread && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-navy text-[10px] font-semibold text-white">{convo.unread}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
        {visible.length === 0 && <div className="pt-12 text-center text-[13px] text-muted">No conversations</div>}
      </div>
    </div>
  );
}
