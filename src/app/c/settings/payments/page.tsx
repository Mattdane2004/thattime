"use client";

// Payment methods — card list with manage sheet, add-card sheet, billing history.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, CreditCard, Plus, Star, Trash2, Receipt } from "lucide-react";
import { clientUser, clientBookings, type PaymentMethod } from "@/lib/data/b2c";
import { Sheet, DarkButton, GhostButton, StatusPill } from "@/components/ui";

const billingHistory = [
  ...clientBookings
    .filter((b) => b.status === "completed")
    .map((b) => ({ id: b.id, label: `${b.offerName} — ${b.salonName}`, date: b.date, amount: `-${b.price}` })),
  ...clientUser.wallet.transactions.map((t) => ({ id: t.id, label: t.label, date: t.date, amount: t.amount })),
];

export default function PaymentsPage() {
  const router = useRouter();
  const [methods, setMethods] = useState<PaymentMethod[]>(clientUser.paymentMethods);
  const [manage, setManage] = useState<PaymentMethod | null>(null);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const closeManage = () => {
    setManage(null);
    setConfirmRemove(false);
  };

  const setDefault = (id: string) => {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
    closeManage();
  };

  const remove = (id: string) => {
    setMethods((prev) => prev.filter((m) => m.id !== id));
    closeManage();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      {/* header */}
      <div className="flex items-center gap-2 border-b border-border bg-surface px-2 py-2.5">
        <button type="button" aria-label="Back" onClick={() => router.back()} className="p-1.5 text-navy">
          <ChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <h1 className="font-display text-[17px] font-extrabold tracking-tight text-navy">Payment methods</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-5">
        {/* methods */}
        <div className="flex flex-col gap-3">
          {methods.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setManage(m)}
              className="flex w-full items-center gap-3.5 rounded-2xl border border-border bg-surface px-4 py-3.5 text-left"
            >
              <span className="flex h-10 w-14 items-center justify-center rounded-lg bg-ink text-white">
                <CreditCard size={18} strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-bold text-navy">
                  {m.brand}
                  {m.last4 && <span className="font-medium text-secondary"> ••{m.last4}</span>}
                </span>
                {m.expiry && <span className="block text-[12px] text-secondary">Expires {m.expiry}</span>}
              </span>
              {m.isDefault && <StatusPill>Default</StatusPill>}
            </button>
          ))}
        </div>

        <DarkButton className="mt-4" onClick={() => setAddOpen(true)}>
          <Plus size={16} strokeWidth={2} />
          Add payment method
        </DarkButton>

        {/* billing history */}
        <p className="pb-2 pt-7 text-[12px] font-bold uppercase tracking-wide text-muted">Billing history</p>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          {billingHistory.map((row) => (
            <div key={row.id} className="flex items-center gap-3.5 border-b border-border px-4 py-3.5 last:border-b-0">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas text-secondary">
                <Receipt size={16} strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-navy">{row.label}</span>
                <span className="block text-[12px] text-secondary">{row.date}</span>
              </span>
              <span
                className={`shrink-0 text-[13px] font-bold ${
                  row.amount.startsWith("+") ? "text-coral" : "text-navy"
                }`}
              >
                {row.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* manage sheet */}
      <Sheet
        open={manage !== null}
        onClose={closeManage}
        title={manage ? `${manage.brand}${manage.last4 ? ` ••${manage.last4}` : ""}` : undefined}
        sub={manage?.expiry ? `Expires ${manage.expiry}` : undefined}
      >
        {manage && !confirmRemove && (
          <div className="flex flex-col pb-2">
            <button
              type="button"
              onClick={() => setDefault(manage.id)}
              disabled={manage.isDefault}
              className="flex items-center gap-3 border-b border-border py-4 text-left text-[15px] font-medium text-navy disabled:opacity-40"
            >
              <Star size={20} strokeWidth={1.75} />
              {manage.isDefault ? "Already the default" : "Set as default"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmRemove(true)}
              className="flex items-center gap-3 py-4 text-left text-[15px] font-medium text-coral"
            >
              <Trash2 size={20} strokeWidth={1.75} />
              Remove
            </button>
          </div>
        )}
        {manage && confirmRemove && (
          <div className="flex flex-col gap-3 pb-2 pt-1">
            <p className="text-[13px] text-secondary">
              Remove {manage.brand}
              {manage.last4 ? ` ending ${manage.last4}` : ""}? Future bookings will use your default method.
            </p>
            <DarkButton onClick={() => remove(manage.id)}>Yes, remove it</DarkButton>
            <GhostButton onClick={() => setConfirmRemove(false)}>Keep it</GhostButton>
          </div>
        )}
      </Sheet>

      {/* add card sheet */}
      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Add card" sub="Cards are stored securely.">
        <div className="flex flex-col gap-4 pb-2">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold text-secondary">Card number</span>
            <input
              placeholder="1234 5678 9012 3456"
              className="h-12 w-full rounded-2xl border border-border bg-canvas px-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
            />
          </label>
          <div className="flex gap-3">
            <label className="block flex-1">
              <span className="mb-1.5 block text-[12px] font-semibold text-secondary">Expiry</span>
              <input
                placeholder="MM/YY"
                className="h-12 w-full rounded-2xl border border-border bg-canvas px-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
              />
            </label>
            <label className="block flex-1">
              <span className="mb-1.5 block text-[12px] font-semibold text-secondary">CVC</span>
              <input
                placeholder="123"
                className="h-12 w-full rounded-2xl border border-border bg-canvas px-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold text-secondary">Name on card</span>
            <input
              placeholder="Emma Carter"
              className="h-12 w-full rounded-2xl border border-border bg-canvas px-4 text-[14px] text-navy placeholder:text-muted focus:outline-none"
            />
          </label>
          <DarkButton onClick={() => setAddOpen(false)}>Add card</DarkButton>
        </div>
      </Sheet>
    </div>
  );
}
