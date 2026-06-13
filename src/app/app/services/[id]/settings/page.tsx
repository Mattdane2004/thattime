"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { Toggle, FieldLabel } from "@/components/app/WizardChrome";
import { useOffersStore } from "@/lib/store/offersStore";

// Offer settings (Figma 12135:50034) — access & visibility, booking rules,
// and the archive / delete danger zone. Rules default to business settings;
// toggling a row overrides it for this offer only.

const LEAD_TIMES = ["1h", "4h", "24h", "48h"];
const CANCEL_WINDOWS = ["12h", "24h", "48h", "72h"];
const WHO_CAN_BOOK = [
  { key: "anyone", label: "Anyone" },
  { key: "existing", label: "Existing clients" },
  { key: "members", label: "Members only" },
];

export default function OfferSettingsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const setStatus = useOffersStore((s) => s.setStatus);
  const removeOffer = useOffersStore((s) => s.removeOffer);

  const [onlineBooking, setOnlineBooking] = useState(true);
  const [whoCanBook, setWhoCanBook] = useState("anyone");
  const [leadTime, setLeadTime] = useState("24h");
  const [cancelWindow, setCancelWindow] = useState("24h");
  const [prescription, setPrescription] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <ScreenHeader title="Settings" onBack={() => router.push("/app/services")} border />
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-surface">
      <ScreenHeader title="Settings" onBack={() => router.push(`/app/services/${offer.id}`)} border />
      <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
        <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Access & visibility</div>
        <div className="mb-6 overflow-hidden rounded-2xl border border-border">
          <button onClick={() => setOnlineBooking((v) => !v)} className="flex w-full items-center justify-between px-4 py-3.5 text-left">
            <span>
              <span className="block text-[14px] font-medium text-navy">Online booking</span>
              <span className="block text-[12px] text-muted">Clients can book this themselves</span>
            </span>
            <Toggle on={onlineBooking} />
          </button>
          <div className="border-t border-border px-4 py-3.5">
            <FieldLabel>Who can book</FieldLabel>
            <div className="flex gap-2">
              {WHO_CAN_BOOK.map((w) => (
                <button
                  key={w.key}
                  onClick={() => setWhoCanBook(w.key)}
                  className={`flex-1 rounded-xl border py-2 text-[12px] font-medium ${
                    whoCanBook === w.key ? "border-navy bg-navy text-white" : "border-border text-secondary hover:bg-canvas"
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Booking rules</div>
        <div className="mb-6 overflow-hidden rounded-2xl border border-border">
          <div className="px-4 py-3.5">
            <FieldLabel>Lead time — how close to the start clients can book</FieldLabel>
            <div className="flex gap-2">
              {LEAD_TIMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setLeadTime(t)}
                  className={`flex-1 rounded-xl border py-2 text-[12px] font-medium ${
                    leadTime === t ? "border-navy bg-navy text-white" : "border-border text-secondary hover:bg-canvas"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-border px-4 py-3.5">
            <FieldLabel>Free cancellation window</FieldLabel>
            <div className="flex gap-2">
              {CANCEL_WINDOWS.map((t) => (
                <button
                  key={t}
                  onClick={() => setCancelWindow(t)}
                  className={`flex-1 rounded-xl border py-2 text-[12px] font-medium ${
                    cancelWindow === t ? "border-navy bg-navy text-white" : "border-border text-secondary hover:bg-canvas"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setPrescription((v) => !v)} className="flex w-full items-center justify-between border-t border-border px-4 py-3.5 text-left">
            <span>
              <span className="block text-[14px] font-medium text-navy">Prescription required</span>
              <span className="block text-[12px] text-muted">Flag only — no verification is applied</span>
            </span>
            <Toggle on={prescription} />
          </button>
        </div>

        <div className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted">Danger zone</div>
        <div className="overflow-hidden rounded-2xl border border-border">
          <button
            onClick={() => { setStatus(offer.id, "draft"); router.push("/app/services"); }}
            className="flex w-full items-center justify-between px-4 py-3.5 text-left hover:bg-canvas"
          >
            <span>
              <span className="block text-[14px] font-medium text-navy">Unpublish & archive</span>
              <span className="block text-[12px] text-muted">Hide from clients, keep history</span>
            </span>
          </button>
          <button
            onClick={() => {
              if (!confirmDelete) { setConfirmDelete(true); return; }
              removeOffer(offer.id);
              router.push("/app/services");
            }}
            className="flex w-full items-center justify-between border-t border-border px-4 py-3.5 text-left hover:bg-danger/5"
          >
            <span>
              <span className="block text-[14px] font-medium text-danger">{confirmDelete ? "Tap again to confirm delete" : "Delete permanently"}</span>
              <span className="block text-[12px] text-muted">
                {confirmDelete ? "This can't be undone." : "Removes this offer and its settings"}
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
