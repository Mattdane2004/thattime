"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Building2, PenSquare, Users, Settings2, Check, Smartphone } from "lucide-react";
import { AppHeader, Sheet } from "@/components/ui";
import { conversations, clientRows, teamColumns, type Conversation } from "@/lib/data/product";
import { messagePermissionOptions } from "@/lib/data/finalisation";

// Messages — conversation list with unread/group/business filters, plus a
// compose button that opens a 1:1 with any client or team member. Group chats
// are never created here — they only exist as auto-managed class threads.

const FILTERS = ["All", "Unread", "Clients", "Team & business"];
const isBiz = (c: { kind: string }) => c.kind !== "client";
const initialsOf = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2);

// Compose recipients — every client and every team member (1:1 only).
const composeRecipients = {
  Clients: clientRows.map((c) => ({ id: c.id, name: c.name, initials: initialsOf(c.name), sub: c.tags[0] ?? "Client" })),
  "Team members": teamColumns.map((t) => ({ id: t.id, name: t.name, initials: t.initials, sub: t.role })),
};

function GroupAvatar({ members }: { members?: { initials: string }[] }) {
  const m = members?.slice(0, 3) ?? [];
  if (m.length === 0)
    return (
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-secondary">
        <Users size={20} strokeWidth={1.5} />
      </span>
    );
  return (
    <span className="relative block h-12 w-12">
      <span className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-canvas text-[8px] font-bold text-secondary">{m[0]?.initials}</span>
      {m[1] && <span className="absolute bottom-0 left-3.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-canvas text-[8px] font-bold text-secondary">{m[1].initials}</span>}
      {m[2] && <span className="absolute right-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-canvas text-[7px] font-bold text-secondary">{m[2].initials}</span>}
    </span>
  );
}

export default function MessagesPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [compose, setCompose] = useState(false);
  const [composeQuery, setComposeQuery] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [permission, setPermission] = useState<(typeof messagePermissionOptions)[number]["id"]>("after");

  const visible = conversations.filter((c) => {
    if (!c.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === "Unread") return c.unread > 0;
    if (filter === "Clients") return !isBiz(c);
    if (filter === "Team & business") return isBiz(c);
    return true;
  });

  // Client chats and internal/business chats are kept visually separate.
  const sections: { label: string | null; items: Conversation[] }[] =
    filter === "All" || filter === "Unread"
      ? [
          { label: "Clients", items: visible.filter((c) => !isBiz(c)) },
          { label: "Team & business", items: visible.filter(isBiz) },
        ].filter((s) => s.items.length > 0)
      : [{ label: null, items: visible }];

  const startChat = (id: string) => {
    setCompose(false);
    router.push(`/app/messages/${id}`);
  };

  return (
    <div className="min-h-full bg-white pb-6">
      <AppHeader title="Messages" />
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <Search size={15} strokeWidth={1.75} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations..."
              className="h-11 w-full rounded-full bg-canvas pl-10 pr-4 text-[13px] text-navy placeholder:text-muted focus:outline-none"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            aria-label="New message"
            onClick={() => setCompose(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-canvas text-navy"
          >
            <PenSquare size={17} strokeWidth={1.85} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="button"
            aria-label="Message settings"
            onClick={() => setSettingsOpen(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-canvas text-navy"
          >
            <Settings2 size={17} strokeWidth={1.85} />
          </motion.button>
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
              <Link href={`/app/messages/${c.id}`} className={`flex items-center gap-3.5 px-4 py-4 ${c.archived ? "opacity-60" : ""}`}>
                <span className="relative shrink-0">
                  {c.kind === "group" || c.kind === "class" ? (
                    <GroupAvatar members={c.members} />
                  ) : c.kind === "business" ? (
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-canvas text-secondary">
                      <Building2 size={20} strokeWidth={1.5} />
                    </span>
                  ) : (
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas text-[13px] font-semibold text-muted">
                      {initialsOf(c.name)}
                    </span>
                  )}
                  {c.unread > 0 && <span className="absolute left-0 top-0 h-2.5 w-2.5 rounded-full bg-fg-primary ring-2 ring-white" />}
                </span>
                <span className="min-w-0 flex-1 border-b border-border pb-4">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className={`truncate text-[15px] ${c.unread ? "font-bold" : "font-semibold"} text-navy`}>{c.name}</span>
                      {c.archived && (
                        <span className="shrink-0 rounded-full bg-canvas px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.06em] text-muted">
                          Ended
                        </span>
                      )}
                    </span>
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

      {/* Compose — start a 1:1 with a client or team member */}
      <Sheet open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Message settings" sub="Business default inherited by clients" full>
        <p className="px-1 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Who can message?</p>
        <div className="flex flex-col gap-2.5">
          {messagePermissionOptions.map((o) => {
            const on = permission === o.id;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => setPermission(o.id)}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left ${on ? "border-fg-primary bg-fg-primary text-white" : "border-border bg-white text-navy"}`}
              >
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${on ? "bg-white/15 text-white" : "bg-canvas text-secondary"}`}>
                  {on ? <Check size={14} strokeWidth={2.5} /> : <Users size={14} strokeWidth={1.8} />}
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-bold">{o.label}</span>
                  <span className={`block pt-0.5 text-[12px] leading-snug ${on ? "text-white/70" : "text-muted"}`}>{o.sub}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 rounded-2xl bg-canvas p-4">
          <p className="flex items-center gap-2 text-[13px] font-bold text-navy">
            <Smartphone size={15} strokeWidth={1.8} />
            Client app gate
          </p>
          <p className="pt-1 text-[12px] leading-snug text-muted">
            Clients can read conversion prompts on web, but replying and sending files requires the That Time app.
          </p>
        </div>
      </Sheet>

      <Sheet open={compose} onClose={() => setCompose(false)} title="New message" sub="Pick a client or team member" full>
        <div className="relative pt-1">
          <Search size={15} strokeWidth={1.75} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={composeQuery}
            onChange={(e) => setComposeQuery(e.target.value)}
            placeholder="Search people..."
            className="h-11 w-full rounded-full bg-canvas pl-10 pr-4 text-[13px] text-navy placeholder:text-muted focus:outline-none"
          />
        </div>
        {Object.entries(composeRecipients).map(([group, people]) => {
          const matches = people.filter((p) => p.name.toLowerCase().includes(composeQuery.toLowerCase()));
          if (matches.length === 0) return null;
          return (
            <div key={group}>
              <p className="px-1 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{group}</p>
              {matches.map((p) => (
                <button
                  key={`${group}-${p.id}`}
                  type="button"
                  onClick={() => startChat(p.id)}
                  className="flex w-full items-center gap-3 border-b border-border px-1 py-3 text-left last:border-b-0"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas text-[12px] font-semibold text-muted">
                    {p.initials}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold text-navy">{p.name}</span>
                    <span className="block text-[12px] text-muted">{p.sub}</span>
                  </span>
                </button>
              ))}
            </div>
          );
        })}
        <p className="px-1 pt-4 text-[11px] text-muted">
          Group chats are created automatically for each class — they can&apos;t be started here.
        </p>
      </Sheet>
    </div>
  );
}
