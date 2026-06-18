"use client";

import { Sheet, Toggle, FieldLabel } from "@/components/ui";
import { useOffersStore } from "@/lib/store/offersStore";
import type { DemoOffer } from "@/lib/data/offers";

// Bottom sheets that make the dashboard summary card editable. Each edits the
// offer live via updateOffer; the "Done" footer just closes. Frame-scoped Sheet.

const fieldBox = "flex items-baseline rounded-2xl border border-border bg-canvas px-4 py-4";
const numInput = "w-full bg-transparent text-[26px] font-bold text-navy outline-none placeholder:text-muted";

function DoneFooter({ onClose }: { onClose: () => void }) {
  return (
    <button type="button" onClick={onClose} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">
      Save settings
    </button>
  );
}

// ---- Price & duration (Figma 12216-36386) ----------------------------------

export function PriceDurationSheet({ offer, open, onClose }: { offer: DemoOffer; open: boolean; onClose: () => void }) {
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const dur = offer.durationMin ?? 0;
  const hours = Math.floor(dur / 60);
  const mins = dur % 60;
  const setHours = (raw: string) => {
    const h = raw === "" ? 0 : Math.max(0, parseInt(raw, 10) || 0);
    updateOffer(offer.id, { durationMin: h * 60 + mins });
  };
  const setMins = (raw: string) => {
    const mn = raw === "" ? 0 : Math.min(59, Math.max(0, parseInt(raw, 10) || 0));
    updateOffer(offer.id, { durationMin: hours * 60 + mn });
  };

  return (
    <Sheet open={open} onClose={onClose} title="Price & Duration" footer={<DoneFooter onClose={onClose} />}>
      <div className="flex flex-col gap-5">
        <div>
          <FieldLabel>Price</FieldLabel>
          <div className="flex items-baseline gap-1.5 rounded-2xl border border-border bg-canvas px-4 py-4">
            <span className="text-[18px] text-muted">£</span>
            <input type="number" inputMode="decimal" value={offer.price} placeholder="0"
              onChange={(e) => updateOffer(offer.id, { price: e.target.value })} className={numInput} />
          </div>
        </div>
        <div>
          <FieldLabel>Duration</FieldLabel>
          <div className="grid grid-cols-2 gap-3">
            <div className={fieldBox}>
              <input type="number" inputMode="numeric" value={hours === 0 ? "" : String(hours)} placeholder="0"
                onChange={(e) => setHours(e.target.value)} className={numInput} />
              <span className="shrink-0 text-[13px] text-muted">hours</span>
            </div>
            <div className={fieldBox}>
              <input type="number" inputMode="numeric" step={5} value={mins === 0 ? "" : String(mins)} placeholder="0"
                onChange={(e) => setMins(e.target.value)} className={numInput} />
              <span className="shrink-0 text-[13px] text-muted">min</span>
            </div>
          </div>
        </div>
      </div>
    </Sheet>
  );
}

// ---- Deposit (Figma 12216-36813) -------------------------------------------

export function DepositSheet({ offer, open, onClose }: { offer: DemoOffer; open: boolean; onClose: () => void }) {
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const deposit = offer.deposit ?? { enabled: false, amount: "", type: "fixed" as const };
  const set = (patch: Partial<typeof deposit>) => updateOffer(offer.id, { deposit: { ...deposit, ...patch } });
  const isPercent = deposit.type === "percent";

  return (
    <Sheet open={open} onClose={onClose} title="Deposit" footer={<DoneFooter onClose={onClose} />}>
      <div className="flex flex-col gap-4">
        <button type="button" onClick={() => set({ enabled: !deposit.enabled })}
          className="flex w-full items-center justify-between rounded-2xl border border-border bg-canvas px-4 py-4 text-left">
          <span>
            <span className="block text-[15px] font-semibold text-navy">Require Deposit</span>
            <span className="block text-[12px] text-muted">Charge a deposit at booking</span>
          </span>
          <Toggle on={deposit.enabled} />
        </button>
        {deposit.enabled && (
          <div className="flex items-stretch gap-2">
            {/* Fixed £ / Percentage % toggle */}
            <div className="flex shrink-0 rounded-xl border border-border bg-canvas p-1">
              {(["fixed", "percent"] as const).map((t) => (
                <button key={t} type="button" onClick={() => set({ type: t })}
                  className={`h-10 w-11 rounded-lg text-[16px] font-bold ${deposit.type === t ? "bg-navy text-white" : "text-secondary"}`}>
                  {t === "fixed" ? "£" : "%"}
                </button>
              ))}
            </div>
            <div className="flex flex-1 items-center rounded-xl border border-border bg-canvas px-4">
              {!isPercent && <span className="text-[15px] text-muted">£</span>}
              <input type="number" inputMode="decimal" value={deposit.amount} placeholder={isPercent ? "20" : "10"}
                onChange={(e) => set({ amount: e.target.value })}
                className="h-12 flex-1 bg-transparent px-2 text-[15px] font-semibold text-navy outline-none placeholder:font-normal placeholder:text-muted" />
              <span className="text-[13px] text-muted">{isPercent ? "% of price" : "per booking"}</span>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}

// ---- Cancellation policy (Figma 12216-36596) -------------------------------

const CANCEL_WINDOWS = [
  { key: "none", label: "No policy" },
  { key: "24h", label: "24 hours" },
  { key: "48h", label: "48 hours" },
  { key: "1week", label: "1 week" },
];

export function CancellationSheet({ offer, open, onClose }: { offer: DemoOffer; open: boolean; onClose: () => void }) {
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const current = offer.cancellation ?? "24h";
  return (
    <Sheet open={open} onClose={onClose} title="Cancellation policy" footer={<DoneFooter onClose={onClose} />}>
      <FieldLabel>Cancellation window</FieldLabel>
      <div className="flex flex-col gap-2.5">
        {CANCEL_WINDOWS.map((w) => {
          const on = current === w.key;
          return (
            <button key={w.key} type="button" onClick={() => updateOffer(offer.id, { cancellation: w.key })}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left transition-colors ${on ? "bg-navy" : "bg-canvas"}`}>
              <span className={`text-[15px] font-medium ${on ? "text-white" : "text-navy"}`}>{w.label}</span>
              <span className={`flex h-6 w-6 items-center justify-center rounded-full ${on ? "bg-white" : "border-2 border-border"}`}>
                {on && <span className="h-2.5 w-2.5 rounded-full bg-navy" />}
              </span>
            </button>
          );
        })}
      </div>
      <p className="pt-3 text-[12px] text-muted">Clients must cancel at least this far ahead to avoid charges.</p>
    </Sheet>
  );
}
