"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronDown, Plus, Check, Trash2 } from "lucide-react";
import { useOffersStore } from "@/lib/store/offersStore";
import { nextId } from "@/lib/ids";
import type { NotifStage } from "@/lib/data/offers";

// Notifications module (Figma 41152) — per-stage channels. Each stage inherits
// the business default until overridden for this service.

const CHANNELS = ["Email", "SMS", "Push"];
const DEFAULT_STAGES: NotifStage[] = [
  { id: "confirmation", label: "Booking confirmation", channels: ["Email", "SMS"], inherited: true },
  { id: "reminder", label: "Reminder", channels: ["SMS"], inherited: true },
  { id: "reminder2", label: "Second reminder", channels: [], inherited: true },
  { id: "followup", label: "Follow-up", channels: [], inherited: true },
];
const DEFAULT_IDS = DEFAULT_STAGES.map((s) => s.id);

export default function NotificationsModulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const [open, setOpen] = useState<string | null>(null);

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header title="Notifications" onBack={() => router.push("/app/services")} />
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  const stages = offer.notifications ?? DEFAULT_STAGES;
  const kind = offer.type === "class" ? "class" : "service";
  const setStages = (next: NotifStage[]) => updateOffer(offer.id, { notifications: next });
  const update = (id: string, patch: Partial<NotifStage>) => setStages(stages.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const toggleChannel = (id: string, ch: string) => {
    const s = stages.find((x) => x.id === id);
    if (!s) return;
    update(id, { channels: s.channels.includes(ch) ? s.channels.filter((c) => c !== ch) : [...s.channels, ch], inherited: false });
  };
  const reset = (id: string) => { const d = DEFAULT_STAGES.find((s) => s.id === id); if (d) update(id, { channels: d.channels, inherited: true }); };
  const addStage = () => { const id = nextId("ntf"); setStages([...stages, { id, label: "Custom notification", channels: [], inherited: false }]); setOpen(id); };
  const removeStage = (id: string) => setStages(stages.filter((s) => s.id !== id));

  return (
    <div className="flex h-full flex-col bg-surface">
      <Header title="Notifications" sub={offer.name} onBack={() => router.push(`/app/services/${offer.id}`)} />
      <p className="px-5 pb-3 pt-1 text-[13px] text-muted">What clients receive at each stage of the booking. Overrides apply only to this {kind}.</p>
      <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-6">
        {stages.map((s) => {
          const isOpen = open === s.id;
          const isCustom = !DEFAULT_IDS.includes(s.id);
          return (
            <div key={s.id} className="overflow-hidden rounded-2xl border border-border">
              <button onClick={() => setOpen(isOpen ? null : s.id)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold text-navy">{s.label}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${s.inherited ? "bg-canvas text-secondary" : "bg-navy text-white"}`}>{s.inherited ? "Inherited" : "Custom"}</span>
                  </span>
                  <span className="mt-0.5 block text-[12px] text-muted">{s.channels.length ? s.channels.join(", ") : "No channels"} · {s.inherited ? "Business default" : `This ${kind}`}</span>
                </span>
                <ChevronDown size={18} className={`shrink-0 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="border-t border-border/60 bg-canvas/40 px-4 py-3">
                  <p className="pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Channels</p>
                  <div className="space-y-2">
                    {CHANNELS.map((ch) => {
                      const on = s.channels.includes(ch);
                      return (
                        <button key={ch} onClick={() => toggleChannel(s.id, ch)} className="flex w-full items-center gap-3 text-left">
                          <span className="flex-1 text-[14px] text-navy">{ch}</span>
                          <span className={`flex h-6 w-6 items-center justify-center rounded-md ${on ? "bg-navy text-white" : "border-2 border-border"}`}>{on && <Check size={13} strokeWidth={3} />}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    {!s.inherited && !isCustom ? (
                      <button onClick={() => reset(s.id)} className="text-[13px] font-medium text-navy">Reset to business default</button>
                    ) : <span />}
                    {isCustom && <button onClick={() => removeStage(s.id)} className="flex items-center gap-1 text-[13px] font-medium text-danger"><Trash2 size={14} />Remove</button>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <button onClick={addStage} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border text-[14px] font-medium text-navy">
          <Plus size={16} /> Add notification
        </button>
      </div>
      <div className="shrink-0 border-t border-border px-5 pb-5 pt-3">
        <button onClick={() => router.push(`/app/services/${offer.id}`)} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">Done</button>
      </div>
    </div>
  );
}

function Header({ title, onBack, sub }: { title: string; onBack: () => void; sub?: string }) {
  return (
    <div className="flex h-16 items-center px-5">
      <button type="button" aria-label="Back" onClick={onBack} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas"><ChevronLeft size={22} /></button>
      <span className="ml-1">
        <span className="block text-[17px] font-semibold leading-tight text-navy">{title}</span>
        {sub ? <span className="block text-[11px] text-muted">{sub}</span> : null}
      </span>
    </div>
  );
}
