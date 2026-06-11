"use client";

import { useRouter } from "next/navigation";
import { Users, User, Check } from "lucide-react";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { useWizardStore, type ClassDraft } from "@/lib/store/wizardStore";

// Class wizard 1/2 — participants. Ported from that-time-app
// /routes/wizard/ClassParticipants.jsx.

const STRUCTURES: { key: ClassDraft["bookingStructure"]; title: string; body: string; Icon: typeof Users }[] = [
  { key: "seat_based", title: "Seat-based", body: "Individuals book a seat each.", Icon: Users },
  { key: "private_group", title: "Private group", body: "One client books the whole class.", Icon: User },
];

export default function ClassParticipantsPage() {
  const router = useRouter();
  const cls = useWizardStore((s) => s.draft.classDetails);
  const updateClass = useWizardStore((s) => s.updateClass);

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/basics")} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pb-6 pt-2">
          <div className="text-[26px] font-semibold leading-tight tracking-tight text-navy">Who can attend?</div>
          <div className="mt-1 text-[14px] text-muted">Choose how the class is booked, then set the group size.</div>
        </div>

        <div className="grid grid-cols-2 gap-3 pb-5">
          {STRUCTURES.map(({ key, title, body, Icon }) => {
            const active = cls.bookingStructure === key;
            return (
              <button key={key} onClick={() => updateClass({ bookingStructure: key })}
                className={`rounded-2xl border p-4 text-left transition-colors ${active ? "border-navy bg-navy text-white" : "border-border bg-surface text-navy hover:bg-canvas"}`}>
                <Icon size={20} strokeWidth={1.75} />
                <div className="mt-3 text-[14px] font-semibold leading-tight">{title}</div>
                <div className={`mt-1 text-[12px] ${active ? "text-white/70" : "text-muted"}`}>{body}</div>
              </button>
            );
          })}
        </div>

        {cls.bookingStructure === "seat_based" && (
          <div className="space-y-4 pb-6">
            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-secondary">Minimum attendees</span>
              <input type="number" inputMode="numeric" value={cls.minParticipants}
                onChange={(e) => updateClass({ minParticipants: Number(e.target.value) || 0 })}
                className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy outline-none focus:ring-1 focus:ring-navy" />
            </label>
            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-secondary">Maximum seats</span>
              <input type="number" inputMode="numeric" value={cls.capacity}
                onChange={(e) => updateClass({ capacity: Number(e.target.value) || 0 })}
                className="h-12 w-full rounded-xl bg-canvas px-4 text-[14px] text-navy outline-none focus:ring-1 focus:ring-navy" />
            </label>
          </div>
        )}
        {cls.bookingStructure === "private_group" && (
          <div className="flex items-center gap-2 rounded-xl bg-canvas px-4 py-3 pb-6 text-[13px] text-secondary">
            <Check size={15} className="text-success" />One client books the whole class for their group.
          </div>
        )}
      </div>
      <div className="shrink-0 border-t border-border px-5 py-4">
        <button onClick={() => router.push("/new/class-schedule")}
          className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white hover:bg-navy/90">
          Continue
        </button>
      </div>
    </>
  );
}
