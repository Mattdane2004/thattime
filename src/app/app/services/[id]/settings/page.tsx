"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Sheet, Toggle } from "@/components/ui";
import { useOffersStore } from "@/lib/store/offersStore";
import type { OfferSettings } from "@/lib/data/offers";

// Service settings (Figma 38584) — access/visibility, booking rules,
// rescheduling, payment. Picker rows open bottom sheets (Reset/Save); rows read
// "Default" until overridden. Persists offer.settings.

type PickerKey = "whoCanBook" | "leadTime" | "maxAdvance" | "buffer" | "cancellation" | "rescheduleLimit" | "payment";
interface PickerCfg { title: string; desc: string; businessDefault: string; kind: "options" | "amount"; options?: string[]; units?: string[] }

const PICKERS: Record<PickerKey, PickerCfg> = {
  whoCanBook: { title: "Who can book", desc: "Who can book this service online.", businessDefault: "Anyone", kind: "options", options: ["Anyone", "Existing clients", "Members only"] },
  leadTime: { title: "Lead time", desc: "How much notice a client needs before booking.", businessDefault: "24 hours", kind: "amount", units: ["hours", "days"] },
  maxAdvance: { title: "Max advance booking", desc: "How far ahead clients can book.", businessDefault: "60 days", kind: "amount", units: ["days", "weeks", "months"] },
  buffer: { title: "Buffer time", desc: "Time blocked after each booking.", businessDefault: "No buffer", kind: "amount", units: ["min"] },
  cancellation: { title: "Cancellation policy", desc: "How late clients can cancel for free.", businessDefault: "24 hours", kind: "options", options: ["No policy", "24 hours", "48 hours", "1 week"] },
  rescheduleLimit: { title: "Reschedule limit", desc: "How many times a booking can be moved.", businessDefault: "Unlimited", kind: "options", options: ["Unlimited", "Once", "Twice", "No reschedules"] },
  payment: { title: "Payment methods", desc: "How clients can pay for this service.", businessDefault: "All methods", kind: "options", options: ["All methods", "Card only", "Cash only"] },
};

export default function OfferSettingsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const setStatus = useOffersStore((s) => s.setStatus);
  const removeOffer = useOffersStore((s) => s.removeOffer);
  const [editing, setEditing] = useState<PickerKey | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header title="Settings" onBack={() => router.push("/app/services")} />
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  const s: OfferSettings = offer.settings ?? {};
  const kind = offer.type === "class" ? "class" : "service";
  const set = (patch: Partial<OfferSettings>) => updateOffer(offer.id, { settings: { ...s, ...patch } });
  const tog = (key: keyof OfferSettings, dflt: boolean) => set({ [key]: !(s[key] ?? dflt) } as Partial<OfferSettings>);

  return (
    <div className="flex h-full flex-col bg-surface">
      <Header title={offer.type === "class" ? "Policies, payments & rules" : "Service settings"} sub={offer.name} onBack={() => router.push(`/app/services/${offer.id}`)} />
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-2">
        <Section label="Access & visibility">
          <ToggleRow title="Online booking" desc="When off, clients can't book online. Staff can still book manually." on={s.onlineBooking ?? true} onToggle={() => tog("onlineBooking", true)} />
          <PickerRow title="Who can book" value={s.whoCanBook} onClick={() => setEditing("whoCanBook")} />
          <ToggleRow title="Prescription required" desc="Flag only — no verification is applied." on={s.prescription ?? false} onToggle={() => tog("prescription", false)} last />
        </Section>

        <Section label="Booking rules">
          <PickerRow title="Lead time" value={s.leadTime} onClick={() => setEditing("leadTime")} />
          <PickerRow title="Max advance booking" value={s.maxAdvance} onClick={() => setEditing("maxAdvance")} />
          <PickerRow title="Buffer time" value={s.buffer} onClick={() => setEditing("buffer")} />
          <PickerRow title="Cancellation policy" value={s.cancellation} onClick={() => setEditing("cancellation")} last />
        </Section>

        <Section label="Rescheduling">
          <ToggleRow title="Client rescheduling" desc="When off, only staff can reschedule a booking." on={s.clientReschedule ?? true} onToggle={() => tog("clientReschedule", true)} />
          <PickerRow title="Reschedule limit" value={s.rescheduleLimit} onClick={() => setEditing("rescheduleLimit")} last />
        </Section>

        <Section label="Payment">
          <PickerRow title="Payment methods" value={s.payment} onClick={() => setEditing("payment")} />
          <ToggleRow title="Pay on arrival" desc="Client confirms booking without paying — pays when they arrive." on={s.payOnArrival ?? false} onToggle={() => tog("payOnArrival", false)} />
          <ToggleRow title="Pay after service" desc="Client is invoiced after the appointment." on={s.payAfterService ?? false} onToggle={() => tog("payAfterService", false)} last />
        </Section>

        <Section label="Danger zone">
          <button onClick={() => { setStatus(offer.id, "draft"); router.push("/app/services"); }} className="flex w-full items-center justify-between px-4 py-3.5 text-left hover:bg-canvas">
            <span><span className="block text-[14px] font-medium text-navy">Unpublish &amp; archive</span><span className="block text-[12px] text-muted">Hide from clients, keep history</span></span>
          </button>
          <button onClick={() => { if (!confirmDelete) { setConfirmDelete(true); return; } removeOffer(offer.id); router.push("/app/services"); }} className="flex w-full items-center justify-between border-t border-border px-4 py-3.5 text-left hover:bg-danger/5">
            <span><span className="block text-[14px] font-medium text-danger">{confirmDelete ? "Tap again to confirm delete" : "Delete permanently"}</span><span className="block text-[12px] text-muted">{confirmDelete ? "This can't be undone." : `Removes this ${kind} and its settings`}</span></span>
          </button>
        </Section>
      </div>

      {editing && (
        <SettingSheet cfg={PICKERS[editing]} value={s[editing]} onClose={() => setEditing(null)}
          onSave={(v) => { set({ [editing]: v } as Partial<OfferSettings>); setEditing(null); }}
          onReset={() => { set({ [editing]: undefined } as Partial<OfferSettings>); setEditing(null); }} />
      )}
    </div>
  );
}

// ---- Picker sheet (handles options + amount kinds) -------------------------

function SettingSheet({ cfg, value, onClose, onSave, onReset }: { cfg: PickerCfg; value?: string; onClose: () => void; onSave: (v: string) => void; onReset: () => void }) {
  const [opt, setOpt] = useState(value ?? cfg.options?.[0] ?? "");
  const [amount, setAmount] = useState(value ? value.split(" ")[0] : "");
  const [unit, setUnit] = useState(value ? value.split(" ")[1] ?? cfg.units?.[0] : cfg.units?.[0] ?? "");

  const footer = (
    <div className="flex gap-3">
      <button onClick={onReset} className="h-12 flex-1 rounded-full border border-border bg-surface text-[15px] font-semibold text-navy hover:bg-canvas">Reset to default</button>
      <button onClick={() => onSave(cfg.kind === "options" ? opt : `${amount || "0"} ${unit}`)} className="h-12 flex-1 rounded-full bg-navy text-[15px] font-semibold text-white">Save</button>
    </div>
  );

  return (
    <Sheet open onClose={onClose} title={cfg.title} footer={footer}>
      <p className="pb-4 text-[13px] text-muted">{cfg.desc} Business default: <span className="font-semibold text-secondary">{cfg.businessDefault}</span>.</p>
      {cfg.kind === "options" ? (
        <div className="flex flex-col gap-2.5">
          {cfg.options!.map((o) => {
            const on = opt === o;
            return (
              <button key={o} onClick={() => setOpt(o)} className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-left ${on ? "bg-navy" : "bg-canvas"}`}>
                <span className={`text-[15px] font-medium ${on ? "text-white" : "text-navy"}`}>{o}</span>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full ${on ? "bg-white" : "border-2 border-border"}`}>{on && <span className="h-2.5 w-2.5 rounded-full bg-navy" />}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-baseline rounded-xl border border-border bg-canvas px-4 py-3">
            <input type="number" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" className="w-full bg-transparent text-[22px] font-bold text-navy outline-none placeholder:font-normal placeholder:text-muted" />
          </div>
          {cfg.units!.length > 1 && (
            <div className="flex rounded-xl border border-border bg-canvas p-1">
              {cfg.units!.map((u) => <button key={u} onClick={() => setUnit(u)} className={`rounded-lg px-3 py-2 text-[13px] font-medium ${unit === u ? "bg-navy text-white" : "text-secondary"}`}>{u}</button>)}
            </div>
          )}
          {cfg.units!.length === 1 && <span className="px-2 text-[14px] text-muted">{cfg.units![0]}</span>}
        </div>
      )}
    </Sheet>
  );
}

// ---- rows ------------------------------------------------------------------

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <div className="mb-2 mt-4 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className="mb-2 overflow-hidden rounded-2xl border border-border">{children}</div>
    </>
  );
}

function PickerRow({ title, value, onClick, last }: { title: string; value?: string; onClick: () => void; last?: boolean }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center justify-between px-4 py-3.5 text-left hover:bg-canvas ${last ? "" : "border-b border-border"}`}>
      <span className="text-[14px] font-medium text-navy">{title}</span>
      <span className="flex items-center gap-1.5 text-[13px] text-muted">{value ?? "Default"}<ChevronRight size={16} /></span>
    </button>
  );
}

function ToggleRow({ title, desc, on, onToggle, last }: { title: string; desc: string; on: boolean; onToggle: () => void; last?: boolean }) {
  return (
    <button onClick={onToggle} className={`flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left ${last ? "" : "border-b border-border"}`}>
      <span className="min-w-0 flex-1"><span className="block text-[14px] font-medium text-navy">{title}</span><span className="block text-[12px] text-muted">{desc}</span></span>
      <Toggle on={on} />
    </button>
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
