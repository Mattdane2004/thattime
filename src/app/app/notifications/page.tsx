"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, MoreVertical, Sparkles, ChevronRight, X, Check, BookOpen,
  Pencil, CalendarClock, Trash2, Star, Lock, Bell,
} from "lucide-react";
import { notificationGroups } from "@/lib/data/product";
import { notificationChannelSettings } from "@/lib/data/finalisation";
import { Sheet } from "@/components/ui";

// Notifications — grouped feed with message requests, product updates and
// swipe-to-delete on dismissible rows.

const FILTERS = ["All", "Appointments", "Messages", "Reviews", "Favourites"];

function TypeBadge({ kind }: { kind: string }) {
  const icon =
    kind === "cancel" ? <X size={9} strokeWidth={3} />
    : kind === "booking" ? <Check size={9} strokeWidth={3} />
    : kind === "review" ? <Pencil size={8} strokeWidth={2.5} />
    : <CalendarClock size={8} strokeWidth={2.5} />;
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-navy ring-1 ring-border">
      {icon}
    </span>
  );
}

function SwipeRow({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-y-0 right-0 flex w-20 items-center justify-center rounded-r-2xl bg-danger text-white">
        <Trash2 size={18} strokeWidth={1.75} />
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.05}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) onDelete();
        }}
        className="relative"
      >
        {children}
      </motion.div>
    </div>
  );
}

// Which filter tab each notification kind belongs to.
const kindCat = (k: string) =>
  ["booking", "cancel", "reschedule"].includes(k) ? "Appointments"
  : k === "request" ? "Messages"
  : k === "review" ? "Reviews"
  : k === "favourite" ? "Favourites"
  : "Other";

export default function NotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("All");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [requestState, setRequestState] = useState<"pending" | "accepted" | "declined">("pending");
  const [deleted, setDeleted] = useState<Record<string, boolean>>({});

  // Accept/decline lingers for a moment, then the card folds away.
  const resolveRequest = (id: string, state: "accepted" | "declined") => {
    setRequestState(state);
    setTimeout(() => setDeleted((d) => ({ ...d, [id]: true })), 2600);
  };

  return (
    <div className="min-h-full bg-fog pb-6">
      <div className="flex items-center justify-between bg-white px-4 py-4">
        <span className="flex items-center gap-2">
          <button type="button" aria-label="Back" onClick={() => router.back()} className="-ml-1 p-1 text-navy">
            <ChevronLeft size={22} strokeWidth={2} />
          </button>
          <h1 className="text-[17px] font-bold text-navy">Notifications</h1>
        </span>
        <button aria-label="Notification settings" onClick={() => setSettingsOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-full bg-canvas text-navy">
          <MoreVertical size={16} strokeWidth={1.75} />
        </button>
      </div>

      <div className="-mx-0 flex gap-2 overflow-x-auto bg-white px-4 pb-4 [scrollbar-width:none]">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium ${
              filter === f ? "bg-fg-primary text-white" : "bg-canvas text-secondary"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {notificationGroups.map((group) => {
        const visible = group.items.filter(
          (n) => !deleted[n.id] && (filter === "All" || kindCat(n.kind) === filter),
        );
        if (visible.length === 0) return null;
        return (
        <div key={group.label}>
          <p className="px-4 pb-2 pt-5 text-[15px] font-bold text-navy">{group.label}</p>
          <div className="flex flex-col gap-2.5 px-4">
            <AnimatePresence initial={false}>
            {visible.map((n) => {
              if (n.kind === "request")
                return (
                  <motion.div
                    key={n.id}
                    layout
                    exit={{ opacity: 0, height: 0, marginBottom: -10 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(8,7,6,0.04)]"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas text-[11px] font-bold text-secondary">
                        {n.who}
                      </span>
                      <div>
                        <p className="text-[12px] text-muted">{n.title}</p>
                        <p className="pt-0.5 text-[14px] leading-snug text-navy">{n.body}</p>
                      </div>
                    </div>
                    <AnimatePresence mode="wait" initial={false}>
                      {requestState === "pending" ? (
                        <motion.div key="btns" exit={{ opacity: 0 }} className="flex gap-2.5 pt-3.5">
                          <button
                            onClick={() => resolveRequest(n.id, "accepted")}
                            className="h-10 flex-1 rounded-full bg-fg-primary text-[13px] font-semibold text-white"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => resolveRequest(n.id, "declined")}
                            className="h-10 flex-1 rounded-full border border-border text-[13px] font-semibold text-navy"
                          >
                            Decline
                          </button>
                        </motion.div>
                      ) : (
                        <motion.p
                          key="done"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-1.5 pt-3 text-[12px] font-semibold text-navy"
                        >
                          <Check size={13} strokeWidth={2.5} />
                          {requestState === "accepted" ? "Accepted — they can now message you." : "Declined."}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );

              if (n.kind === "promo")
                return (
                  <div key={n.id} className="rounded-2xl bg-fg-primary p-4 text-white">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                        <Sparkles size={17} strokeWidth={1.6} />
                      </span>
                      <div>
                        <p className="text-[12px] text-white/60">{n.title}</p>
                        <p className="pt-0.5 text-[14px] leading-snug">{n.body}</p>
                        <button className="mt-3 flex h-9 items-center gap-1 rounded-full bg-white px-4 text-[12px] font-bold text-navy">
                          {n.cta}
                          <ChevronRight size={13} strokeWidth={2.25} />
                        </button>
                      </div>
                    </div>
                  </div>
                );

              if (n.kind === "favourite")
                return (
                  <SwipeRow key={n.id} onDelete={() => setDeleted((d) => ({ ...d, [n.id]: true }))}>
                    <div className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(8,7,6,0.04)]">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas text-secondary">
                        <Star size={16} strokeWidth={1.75} />
                      </span>
                      <div>
                        <p className="text-[12px] text-muted">{n.title}</p>
                        <p className="pt-0.5 text-[14px] leading-snug text-navy">{n.body}</p>
                        <p className="pt-1 text-[10px] text-muted">Swipe to dismiss</p>
                      </div>
                    </div>
                  </SwipeRow>
                );

              if (n.kind === "blog")
                return (
                  <div key={n.id} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(8,7,6,0.04)]">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas text-secondary">
                      <BookOpen size={17} strokeWidth={1.6} />
                    </span>
                    <div>
                      <p className="text-[12px] text-muted">{n.title}</p>
                      <p className="pt-0.5 text-[14px] font-medium leading-snug text-navy">{n.body}</p>
                      {"meta" in n && n.meta ? <p className="pt-1 text-[11px] text-muted">{String(n.meta)}</p> : null}
                    </div>
                  </div>
                );

              return (
                <div key={n.id} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(8,7,6,0.04)]">
                  <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas text-[11px] font-bold text-secondary">
                    {"who" in n ? n.who : "TT"}
                    <TypeBadge kind={n.kind} />
                  </span>
                  <div>
                    <p className="text-[12px] text-muted">{n.title}</p>
                    <p className="pt-0.5 text-[14px] leading-snug text-navy">{n.body}</p>
                  </div>
                </div>
              );
            })}
            </AnimatePresence>
          </div>
        </div>
        );
      })}

      <Sheet open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Notification settings" sub="In-app is free; SMS, WhatsApp and email can be paid add-ons" full>
        <div className="rounded-2xl bg-canvas p-4">
          <p className="flex items-center gap-2 text-[13px] font-bold text-navy">
            <Bell size={15} strokeWidth={1.8} />
            Channel rules
          </p>
          <p className="pt-1 text-[12px] leading-snug text-muted">
            Push/in-app reminders are included. Paid channels are shown locked unless the business subscribes to the notification package.
          </p>
        </div>
        <div className="flex flex-col gap-2.5 pt-4">
          {notificationChannelSettings.map((setting) => (
            <div key={setting.id} className="rounded-2xl border border-border bg-white p-4">
              <p className="text-[14px] font-bold text-navy">{setting.label}</p>
              <p className="pt-0.5 text-[12px] text-muted">{setting.description}</p>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {([
                  ["push", "In-app", setting.push, false],
                  ["email", "Email", setting.email, setting.paid],
                  ["sms", "SMS", setting.sms, setting.paid],
                  ["whatsapp", "WhatsApp", setting.whatsapp, setting.paid],
                ] as const).map(([key, label, on, paid]) => (
                  <button
                    key={key}
                    type="button"
                    className={`flex h-10 items-center justify-center gap-1 rounded-xl text-[11px] font-semibold ${
                      paid ? "bg-canvas text-muted" : on ? "bg-fg-primary text-white" : "border border-border text-navy"
                    }`}
                  >
                    {paid && <Lock size={10} strokeWidth={2} />}
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
