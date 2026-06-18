"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Check, DoorOpen, Wrench, Box, Trash2, Info } from "lucide-react";
import { Sheet } from "@/components/ui";
import { resourcesCatalog, equipmentInRoom, type Resource } from "@/lib/data/modules";
import { useOffersStore } from "@/lib/store/offersStore";
import { inheritedResources } from "@/lib/data/bundles";
import type { OfferResource } from "@/lib/data/offers";

const cat = (id: string) => resourcesCatalog.find((r) => r.id === id);
const mk = (id: string, auto: boolean): OfferResource => ({ id, auto, reservation: "whole", bufferBefore: "", bufferAfter: "", note: "" });

export default function ResourcesModulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const allOffers = useOffersStore((s) => s.offers);
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const [view, setView] = useState<"list" | "rooms" | "equipment">("list");
  const [choosing, setChoosing] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header title="Resources" onBack={() => router.push("/app/services")} />
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  const attached = offer.resources ?? [];
  const has = (id: string) => attached.some((r) => r.id === id);
  const get = (id: string) => attached.find((r) => r.id === id);
  const setRes = (next: OfferResource[]) => updateOffer(offer.id, { resources: next });

  const attachRoom = (roomId: string) => {
    if (has(roomId)) return;
    const eq = equipmentInRoom(roomId).filter((e) => !has(e.id)).map((e) => mk(e.id, true));
    setRes([...attached, mk(roomId, false), ...eq]);
  };
  const detachRoom = (roomId: string) => {
    const eqIds = equipmentInRoom(roomId).map((e) => e.id);
    setRes(attached.filter((r) => r.id !== roomId && !(eqIds.includes(r.id) && r.auto)));
  };
  const toggleEquip = (eqId: string) => {
    const e = cat(eqId);
    if (has(eqId)) {
      let next = attached.filter((r) => r.id !== eqId);
      if (e?.roomId) {
        const room = next.find((r) => r.id === e.roomId);
        const stillNeeded = next.some((r) => cat(r.id)?.type === "equipment" && cat(r.id)?.roomId === e.roomId);
        if (room?.auto && !stillNeeded) next = next.filter((r) => r.id !== e.roomId);
      }
      setRes(next);
    } else {
      const adds = [mk(eqId, false)];
      if (e?.roomId && !has(e.roomId)) adds.push(mk(e.roomId, true));
      setRes([...attached, ...adds]);
    }
  };
  const remove = (id: string) => setRes(attached.filter((r) => r.id !== id));

  // ---- Rooms screen ----
  if (view === "rooms") {
    const rooms = resourcesCatalog.filter((r) => r.type === "space");
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header title="Rooms" sub={offer.name} onBack={() => setView("list")} />
        <p className="px-5 pb-3 pt-1 text-[13px] text-muted">Pick a room. Equipment inside it is auto-included — you can untick anything you don&apos;t need.</p>
        <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-6">
          {rooms.map((room) => {
            const on = has(room.id);
            const eq = equipmentInRoom(room.id);
            return (
              <div key={room.id} className={`overflow-hidden rounded-2xl border ${on ? "border-navy" : "border-border"}`}>
                <button onClick={() => (on ? detachRoom(room.id) : attachRoom(room.id))} className="flex w-full items-center gap-3 p-4 text-left">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas"><DoorOpen size={17} className="text-navy" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-medium text-navy">{room.name}</span>
                    <span className="block text-[12px] text-muted">Capacity {room.capacity} · {room.location}</span>
                  </span>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-md ${on ? "bg-navy text-white" : "border-2 border-border"}`}>{on && <Check size={15} strokeWidth={3} />}</span>
                </button>
                {on && eq.length > 0 && (
                  <div className="border-t border-border/60 bg-canvas/40 px-4 py-3">
                    <p className="pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">Equipment inside — auto-included</p>
                    <div className="space-y-2">
                      {eq.map((e) => {
                        const eon = has(e.id);
                        return (
                          <button key={e.id} onClick={() => toggleEquip(e.id)} className="flex w-full items-center gap-3 text-left">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white"><Wrench size={14} className="text-navy" /></span>
                            <span className="min-w-0 flex-1"><span className="block text-[14px] text-navy">{e.name}</span><span className="block text-[11px] text-muted">{e.location}</span></span>
                            <span className={`flex h-6 w-6 items-center justify-center rounded-md ${eon ? "bg-navy text-white" : "border-2 border-border"}`}>{eon && <Check size={13} strokeWidth={3} />}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <DoneBar onDone={() => setView("list")} />
      </div>
    );
  }

  // ---- Equipment screen ----
  if (view === "equipment") {
    const equip = resourcesCatalog.filter((r) => r.type === "equipment");
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header title="Equipment" sub={offer.name} onBack={() => setView("list")} />
        <div className="mx-4 my-2 flex items-start gap-2 rounded-xl bg-canvas px-3 py-2.5">
          <Info size={14} className="mt-0.5 shrink-0 text-muted" /><span className="text-[12px] text-secondary">Parent rooms will be attached automatically for equipment that lives inside them.</span>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto px-4 pb-6">
          {equip.map((e) => {
            const on = has(e.id);
            const room = e.roomId ? cat(e.roomId) : undefined;
            return (
              <button key={e.id} onClick={() => toggleEquip(e.id)} className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left ${on ? "border-navy" : "border-border"}`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas"><Wrench size={16} className="text-navy" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium text-navy">{e.name}</span>
                  <span className="block text-[12px] text-muted">{room ? `in ${room.name} · ` : ""}{e.location}</span>
                </span>
                <span className={`flex h-7 w-7 items-center justify-center rounded-md ${on ? "bg-navy text-white" : "border-2 border-border"}`}>{on && <Check size={15} strokeWidth={3} />}</span>
              </button>
            );
          })}
        </div>
        <DoneBar onDone={() => setView("list")} />
      </div>
    );
  }

  // ---- List / empty ----
  const rooms = attached.filter((r) => cat(r.id)?.type === "space");
  const standalone = attached.filter((r) => { const c = cat(r.id); return c?.type === "equipment" && !(c.roomId && has(c.roomId)); });
  const editingRes = editing ? get(editing) : undefined;
  const isBundle = offer.type === "bundle";
  const inheritedRes = isBundle ? inheritedResources(offer.bundle?.serviceIds ?? [], allOffers) : [];

  return (
    <div className="flex h-full flex-col bg-surface">
      <Header title="Resources" sub={offer.name} onBack={() => router.push(`/app/services/${offer.id}`)} />
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
        {isBundle && inheritedRes.length > 0 && (
          <div className="mb-5">
            <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Inherited from services</div>
            <div className="space-y-2">
              {inheritedRes.map((r, i) => (
                <div key={`${r.id}-${i}`} className="flex items-center gap-3 rounded-2xl border border-border bg-canvas px-4 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface"><Box size={15} className="text-secondary" strokeWidth={1.75} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium text-navy">{cat(r.id)?.name}</span>
                    <span className="block truncate text-[12px] text-muted">From {r.from} · {cat(r.id)?.location}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="mb-1 mt-5 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Bundle resources</div>
          </div>
        )}
        {attached.length === 0 ? (
          <div className="flex flex-col items-center px-6 pt-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-canvas"><Box size={28} className="text-muted" strokeWidth={1.5} /></span>
            <div className="mt-4 text-[16px] font-semibold text-navy">No resources yet</div>
            <div className="mt-1 text-[13px] text-muted">Reserve a room or equipment whenever this is booked.</div>
            <div className="mt-5 w-full space-y-2.5 text-left">
              <TypeChoice icon={<DoorOpen size={18} className="text-navy" strokeWidth={1.75} />} label="Add a room" desc="Reserve a space" onClick={() => setView("rooms")} />
              <TypeChoice icon={<Wrench size={18} className="text-navy" strokeWidth={1.75} />} label="Add equipment" desc="Reserve a tool or device" onClick={() => setView("equipment")} />
            </div>
          </div>
        ) : (
          <>
            <div className="my-2 flex items-start gap-2 rounded-xl bg-canvas px-3 py-2.5">
              <Info size={14} className="mt-0.5 shrink-0 text-muted" /><span className="text-[12px] text-secondary">Each attachment reserves the resource for the booking plus any buffer time. Tap a row to customise.</span>
            </div>
            {rooms.map((roomRes) => {
              const room = cat(roomRes.id)!;
              const eq = attached.filter((r) => cat(r.id)?.roomId === room.id);
              return (
                <div key={room.id} className="mb-2 overflow-hidden rounded-2xl border border-border">
                  <button onClick={() => setEditing(room.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canvas"><DoorOpen size={16} className="text-navy" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2"><span className="text-[14px] font-semibold text-navy">{room.name}</span>{roomRes.auto && <span className="rounded-full bg-navy px-1.5 py-0.5 text-[9px] font-bold text-white">AUTO</span>}</span>
                      <span className="block text-[12px] text-muted">Capacity {room.capacity} · {room.location}</span>
                      {eq.length > 0 && <span className="block text-[12px] text-muted">Needed by {eq.map((r) => cat(r.id)?.name).join(", ")}</span>}
                    </span>
                    <ChevronRight size={16} className="shrink-0 text-muted" />
                    <button onClick={(e) => { e.stopPropagation(); remove(room.id); }} aria-label="Remove" className="shrink-0 text-muted hover:text-danger"><Trash2 size={15} /></button>
                  </button>
                  {eq.map((r) => (
                    <button key={r.id} onClick={() => setEditing(r.id)} className="flex w-full items-center gap-3 border-t border-border/60 px-4 py-3 pl-8 text-left">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-canvas"><Wrench size={14} className="text-navy" /></span>
                      <span className="min-w-0 flex-1"><span className="block text-[14px] text-navy">{cat(r.id)?.name}</span><span className="block text-[11px] text-muted">{cat(r.id)?.location}</span></span>
                      <ChevronRight size={16} className="shrink-0 text-muted" />
                      <button onClick={(e) => { e.stopPropagation(); remove(r.id); }} aria-label="Remove" className="shrink-0 text-muted hover:text-danger"><Trash2 size={15} /></button>
                    </button>
                  ))}
                </div>
              );
            })}
            {standalone.length > 0 && (
              <>
                <p className="px-1 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wider text-muted">Standalone equipment</p>
                <div className="space-y-2">
                  {standalone.map((r) => (
                    <button key={r.id} onClick={() => setEditing(r.id)} className="flex w-full items-center gap-3 rounded-2xl border border-border px-4 py-3 text-left">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas"><Wrench size={16} className="text-navy" /></span>
                      <span className="min-w-0 flex-1"><span className="block text-[14px] font-semibold text-navy">{cat(r.id)?.name}</span><span className="block text-[12px] text-muted">{cat(r.id)?.location}</span></span>
                      <ChevronRight size={16} className="shrink-0 text-muted" />
                      <button onClick={(e) => { e.stopPropagation(); remove(r.id); }} aria-label="Remove" className="shrink-0 text-muted hover:text-danger"><Trash2 size={15} /></button>
                    </button>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
      {attached.length > 0 && (
        <div className="flex shrink-0 gap-3 border-t border-border px-5 py-4">
          <button onClick={() => router.push(`/app/services/${offer.id}`)} className="h-12 flex-1 rounded-full border border-border bg-surface text-[15px] font-semibold text-navy hover:bg-canvas">Back</button>
          <button onClick={() => setChoosing(true)} className="h-12 flex-1 rounded-full bg-navy text-[15px] font-semibold text-white">Add</button>
        </div>
      )}

      <Sheet open={choosing} onClose={() => setChoosing(false)} title="Add a resource">
        <div className="space-y-2.5 pb-2">
          <TypeChoice icon={<DoorOpen size={18} className="text-navy" strokeWidth={1.75} />} label="Add a room" desc="Reserve a space" onClick={() => { setChoosing(false); setView("rooms"); }} />
          <TypeChoice icon={<Wrench size={18} className="text-navy" strokeWidth={1.75} />} label="Add equipment" desc="Reserve a tool or device" onClick={() => { setChoosing(false); setView("equipment"); }} />
        </div>
      </Sheet>

      <CustomiseSheet open={Boolean(editing)} resource={editingRes} catalog={editing ? cat(editing) : undefined}
        onClose={() => setEditing(null)}
        onSave={(patch) => { if (editing) setRes(attached.map((r) => (r.id === editing ? { ...r, ...patch } : r))); setEditing(null); }} />
    </div>
  );
}

// ---- Customise (edit-times) sheet (Figma 43961) -----------------------------

function CustomiseSheet({ open, resource, catalog, onClose, onSave }: {
  open: boolean; resource?: OfferResource; catalog?: Resource; onClose: () => void; onSave: (patch: Partial<OfferResource>) => void;
}) {
  const [reservation, setReservation] = useState<"whole" | "partial">(resource?.reservation ?? "whole");
  const [before, setBefore] = useState(resource?.bufferBefore ?? "");
  const [after, setAfter] = useState(resource?.bufferAfter ?? "");
  const [note, setNote] = useState(resource?.note ?? "");

  const [seen, setSeen] = useState<string | null>(null);
  if (open && resource && seen !== resource.id) {
    setSeen(resource.id); setReservation(resource.reservation); setBefore(resource.bufferBefore); setAfter(resource.bufferAfter); setNote(resource.note);
  }
  if (!open && seen) setSeen(null);

  return (
    <Sheet open={open} onClose={onClose} title={catalog?.name ?? ""}
      footer={<button onClick={() => onSave({ reservation, bufferBefore: before, bufferAfter: after, note })} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">Save customisation</button>}>
      <div className="flex flex-col gap-5">
        <div>
          <FieldLabel>Reservation window</FieldLabel>
          <div className="mb-2 flex rounded-xl border border-border bg-canvas p-1">
            {([["whole", "Whole session"], ["partial", "Partial"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => setReservation(v)} className={`flex-1 rounded-lg py-2 text-[13px] font-semibold ${reservation === v ? "bg-white text-navy shadow-card" : "text-secondary"}`}>{l}</button>
            ))}
          </div>
          <p className="text-[12px] text-muted">{reservation === "whole" ? "Resource is reserved for the entire booking." : "Reserved for part of the booking only."}</p>
        </div>
        <div>
          <FieldLabel>Buffer time</FieldLabel>
          <div className="grid grid-cols-2 gap-3">
            {([["Before", before, setBefore], ["After", after, setAfter]] as const).map(([label, val, setter]) => (
              <div key={label}>
                <p className="pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
                <div className="flex items-baseline rounded-xl border border-border bg-canvas px-3 py-2.5">
                  <input type="number" inputMode="numeric" value={val} onChange={(e) => setter(e.target.value)} placeholder="0" className="w-full bg-transparent text-[16px] font-semibold text-navy outline-none placeholder:font-normal placeholder:text-muted" />
                  <span className="text-[12px] text-muted">min</span>
                </div>
              </div>
            ))}
          </div>
          <p className="pt-1.5 text-[12px] text-muted">Extra reservation time either side of the booking. Blocks other bookings from grabbing the resource in between.</p>
        </div>
        <label className="block">
          <FieldLabel>Staff note <span className="text-muted">(optional)</span></FieldLabel>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Pre-heat 15 minutes before use" rows={3}
            className="w-full resize-none rounded-xl border border-border bg-canvas px-4 py-3 text-[14px] text-navy outline-none placeholder:text-muted focus:border-navy focus:ring-1 focus:ring-navy" />
          <span className="mt-1 block text-[12px] text-muted">Visible to staff only — never shown to clients.</span>
        </label>
      </div>
    </Sheet>
  );
}

// ---- shared ----------------------------------------------------------------

function TypeChoice({ icon, label, desc, onClick }: { icon: React.ReactNode; label: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3.5 rounded-2xl border border-border p-4 text-left hover:bg-canvas">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-canvas">{icon}</span>
      <span className="min-w-0 flex-1"><span className="block text-[15px] font-semibold text-navy">{label}</span><span className="block text-[12px] text-muted">{desc}</span></span>
      <ChevronRight size={18} className="shrink-0 text-muted" />
    </button>
  );
}

function DoneBar({ onDone }: { onDone: () => void }) {
  return (
    <div className="shrink-0 border-t border-border px-5 pb-5 pt-3">
      <button onClick={onDone} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">Add</button>
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

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-2 block text-[13px] font-medium text-secondary">{children}</span>;
}
