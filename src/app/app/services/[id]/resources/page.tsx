"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check, Plus, DoorOpen, Wrench, Box, Trash2 } from "lucide-react";
import { resourcesCatalog } from "@/lib/data/modules";
import { useOffersStore } from "@/lib/store/offersStore";

// Resources module — setup flow (empty → choose Room / Equipment → pick → list).
// Persists to offer.resourceIds via updateOffer.

type ResType = "space" | "equipment";

export default function ResourcesModulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const [picking, setPicking] = useState<ResType | null>(null);

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header title="Resources" onBack={() => router.push("/app/services")} />
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  const selected = offer.resourceIds ?? [];
  const toggle = (id: string) =>
    updateOffer(offer.id, { resourceIds: selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id] });
  const chosen = resourcesCatalog.filter((r) => selected.includes(r.id));

  if (picking) {
    const list = resourcesCatalog.filter((r) => r.type === picking);
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header title={picking === "space" ? "Assign a room" : "Assign equipment"} onBack={() => setPicking(null)} />
        <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-6 pt-2">
          {list.map((r) => {
            const sel = selected.includes(r.id);
            return (
              <button key={r.id} onClick={() => toggle(r.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${sel ? "border-navy" : "border-border hover:bg-canvas"}`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas">
                  {picking === "space" ? <DoorOpen size={17} className="text-navy" /> : <Wrench size={17} className="text-navy" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium text-navy">{r.name}</span>
                  {r.capacity && <span className="block text-[12px] text-muted">Capacity {r.capacity}</span>}
                </span>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${sel ? "bg-navy text-white" : "bg-canvas text-muted"}`}>{sel ? <Check size={15} /> : <Plus size={15} />}</span>
              </button>
            );
          })}
        </div>
        <div className="shrink-0 border-t border-border px-5 pb-5 pt-3">
          <button onClick={() => setPicking(null)} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-surface">
      <Header title="Resources" onBack={() => router.push(`/app/services/${offer.id}`)} />
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        {chosen.length === 0 ? (
          <div className="flex flex-col items-center px-6 pt-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-canvas">
              <Box size={28} className="text-muted" strokeWidth={1.5} />
            </span>
            <div className="mt-4 text-[16px] font-semibold text-navy">No resources yet</div>
            <div className="mt-1 text-[13px] text-muted">Reserve a room or equipment whenever this is booked.</div>
            <div className="mt-5 w-full space-y-2.5 text-left">
              <TypeChoice icon={<DoorOpen size={18} className="text-navy" strokeWidth={1.75} />} label="Add a room" desc="Reserve a space" onClick={() => setPicking("space")} />
              <TypeChoice icon={<Wrench size={18} className="text-navy" strokeWidth={1.75} />} label="Add equipment" desc="Reserve a tool or device" onClick={() => setPicking("equipment")} />
            </div>
          </div>
        ) : (
          <div className="space-y-4 pt-3">
            {(["space", "equipment"] as ResType[]).map((t) => {
              const items = chosen.filter((r) => r.type === t);
              if (!items.length) return null;
              return (
                <div key={t}>
                  <div className="flex items-center justify-between px-1 pb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">{t === "space" ? "Rooms" : "Equipment"}</span>
                    <button onClick={() => setPicking(t)} className="text-[12px] font-medium text-navy">Add</button>
                  </div>
                  <div className="space-y-2">
                    {items.map((r) => (
                      <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas">
                          {t === "space" ? <DoorOpen size={16} className="text-navy" /> : <Wrench size={16} className="text-navy" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[14px] font-semibold text-navy">{r.name}</span>
                          {r.capacity && <span className="block text-[12px] text-muted">Capacity {r.capacity}</span>}
                        </span>
                        <button onClick={() => toggle(r.id)} aria-label="Remove resource" className="shrink-0 text-muted hover:text-danger">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function TypeChoice({ icon, label, desc, onClick }: { icon: React.ReactNode; label: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3.5 rounded-2xl border border-border p-4 text-left hover:bg-canvas">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-canvas">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-navy">{label}</span>
        <span className="block text-[12px] text-muted">{desc}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-muted" />
    </button>
  );
}

function Header({ title, onBack, action }: { title: string; onBack: () => void; action?: React.ReactNode }) {
  return (
    <div className="flex h-16 items-center justify-between px-5">
      <div className="flex items-center">
        <button type="button" aria-label="Back" onClick={onBack} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
          <ChevronLeft size={22} />
        </button>
        <span className="ml-1 text-[17px] font-semibold text-navy">{title}</span>
      </div>
      {action}
    </div>
  );
}
