"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader } from "@/components/app/ScreenHeader";
import { WizardFooter, WizardTitle, FieldLabel, fieldInput, Toggle, TOTAL_STEPS } from "@/components/app/WizardChrome";
import { useWizardStore, type ClassDraft } from "@/lib/store/wizardStore";

// Class wizard — "Attendees" (Figma 12135:47063): public group vs private
// booking, group size, auto-cancel if the minimum isn't met.

const STRUCTURES: { key: ClassDraft["bookingStructure"]; title: string }[] = [
  { key: "seat_based", title: "Public group" },
  { key: "private_group", title: "Private booking" },
];

export default function ClassParticipantsPage() {
  const router = useRouter();
  const cls = useWizardStore((s) => s.draft.classDetails);
  const updateClass = useWizardStore((s) => s.updateClass);

  const seatBased = cls.bookingStructure === "seat_based";
  const canContinue = !seatBased || (cls.capacity > 0 && cls.minParticipants > 0 && cls.minParticipants <= cls.capacity);

  return (
    <>
      <ScreenHeader onBack={() => router.push("/new/basics")} rightAction={<span className="text-[13px] text-muted">Help</span>} />
      <div className="flex-1 overflow-y-auto px-5">
        <WizardTitle title="Attendees" subtitle="Choose how people join, then set the minimum and maximum class size." />

        <div className="pb-5">
          <FieldLabel>Class type</FieldLabel>
          <div className="flex rounded-2xl bg-canvas p-1">
            {STRUCTURES.map(({ key, title }) => (
              <button
                key={key}
                onClick={() => updateClass({ bookingStructure: key })}
                className={`flex-1 rounded-xl py-2.5 text-[13px] font-medium transition-colors ${
                  cls.bookingStructure === key ? "bg-surface text-navy shadow-card" : "text-secondary"
                }`}
              >
                {title}
              </button>
            ))}
          </div>
          <div className="mt-2 text-[12px] leading-snug text-muted">
            {seatBased
              ? "People book individual seats. Best for courses, workshops, yoga and group sessions."
              : "One client books the whole class for their group. Best for parties and private sessions."}
          </div>
        </div>

        {seatBased && (
          <div className="pb-6">
            <FieldLabel>Group size</FieldLabel>
            <div className="mb-3 text-[12px] text-muted">Set the smallest class you will run and the total number of seats.</div>
            <div className="flex gap-3">
              <label className="block flex-1">
                <span className="mb-2 block text-[12px] font-medium text-navy">Minimum attendees</span>
                <input
                  type="number" inputMode="numeric" value={cls.minParticipants}
                  onChange={(e) => updateClass({ minParticipants: Number(e.target.value) || 0 })}
                  className={fieldInput}
                />
              </label>
              <label className="block flex-1">
                <span className="mb-2 block text-[12px] font-medium text-navy">Maximum seats</span>
                <input
                  type="number" inputMode="numeric" value={cls.capacity}
                  onChange={(e) => updateClass({ capacity: Number(e.target.value) || 0 })}
                  className={fieldInput}
                />
              </label>
            </div>

            <button
              onClick={() => updateClass({ autoCancel: !cls.autoCancel })}
              className="mt-4 flex w-full items-start justify-between gap-3 rounded-2xl bg-canvas px-4 py-3.5 text-left"
            >
              <span>
                <span className="block text-[14px] font-medium text-navy">Auto-cancel if minimum is not met</span>
                <span className="mt-0.5 block text-[12px] leading-snug text-muted">
                  If fewer than {cls.minParticipants || 1} {cls.minParticipants === 1 ? "person has" : "people have"} booked, cancel the class automatically before it starts.
                </span>
              </span>
              <Toggle on={cls.autoCancel} />
            </button>
          </div>
        )}
      </div>

      <WizardFooter
        step={2}
        total={TOTAL_STEPS.class}
        onBack={() => router.push("/new/basics")}
        onNext={() => canContinue && router.push("/new/class-schedule")}
        disabled={!canContinue}
      />
    </>
  );
}
