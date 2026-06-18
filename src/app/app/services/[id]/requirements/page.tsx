"use client";

import { useRouter } from "next/navigation";
import { GraduationCap, ShieldCheck, UserCheck, ClipboardCheck, BookOpen, FileText } from "lucide-react";
import { ScreenHeader, FieldLabel, Toggle, fieldInput } from "@/components/ui";
import { useOffersStore } from "@/lib/store/offersStore";
import type { ClassRequirements } from "@/lib/data/offers";

const emptyRequirements: ClassRequirements = {
  courseLevel: "na",
  ageLimits: false,
  minAge: "",
  maxAge: "",
  qualificationRequired: false,
  qualificationRequirement: "",
  insuranceProof: false,
  insuranceInstructions: "",
  studentDeclarations: false,
  declarationText: "",
  preparationInstructions: false,
  preparationText: "",
  eligibilityNotes: false,
  eligibilityNotesText: "",
};

const levels: { value: ClassRequirements["courseLevel"]; label: string }[] = [
  { value: "na", label: "Not applicable" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export default function RequirementsModulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <ScreenHeader title="Requirements" onBack={() => router.push("/app/services")} border />
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  const req = { ...emptyRequirements, ...(offer.requirements ?? {}) };
  const set = (patch: Partial<ClassRequirements>) => updateOffer(offer.id, { requirements: { ...req, ...patch } });

  return (
    <div className="flex h-full flex-col bg-surface">
      <ScreenHeader title="Requirements" onBack={() => router.push(`/app/services/${offer.id}`)} border />
      <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4">
        <p className="pb-6 text-[18px] font-medium leading-snug text-secondary">
          Set what students must know or prove before booking this course.
        </p>

        <section className="pb-5">
          <SectionLabel>Course level</SectionLabel>
          <div className="space-y-2">
            {levels.map((level) => {
              const on = req.courseLevel === level.value;
              return (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => set({ courseLevel: level.value })}
                  className={`flex h-14 w-full items-center gap-3 rounded-2xl px-4 text-left ${
                    on ? "bg-navy text-white" : "bg-canvas text-navy"
                  }`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${on ? "border-white" : "border-muted"}`}>
                    {on && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                  <span className="text-[15px] font-semibold">{level.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        <div className="space-y-3">
          <TogglePanel
            icon={<UserCheck size={17} />}
            title="Age limits"
            desc="Block bookings outside this age range."
            on={req.ageLimits}
            onToggle={() => set({ ageLimits: !req.ageLimits })}
          >
            <div className="grid grid-cols-2 gap-3">
              <label>
                <FieldLabel>Min age</FieldLabel>
                <input type="number" inputMode="numeric" value={req.minAge} onChange={(e) => set({ minAge: e.target.value })} placeholder="18" className={fieldInput} />
              </label>
              <label>
                <FieldLabel>Max age</FieldLabel>
                <input type="number" inputMode="numeric" value={req.maxAge} onChange={(e) => set({ maxAge: e.target.value })} placeholder="Optional" className={fieldInput} />
              </label>
            </div>
          </TogglePanel>

          <TogglePanel
            icon={<GraduationCap size={17} />}
            title="Required qualification"
            desc="Use this for aesthetics, beauty, medical, or advanced course eligibility."
            on={req.qualificationRequired}
            onToggle={() => set({ qualificationRequired: !req.qualificationRequired })}
          >
            <label>
              <FieldLabel>Qualification requirement</FieldLabel>
              <textarea
                value={req.qualificationRequirement}
                onChange={(e) => set({ qualificationRequirement: e.target.value })}
                placeholder="e.g. Must hold Level 3 Beauty Therapy or equivalent."
                rows={4}
                className={textAreaClass}
              />
            </label>
          </TogglePanel>

          <TogglePanel
            icon={<ShieldCheck size={17} />}
            title="Insurance proof"
            desc="Ask students to confirm or bring proof of professional insurance."
            on={req.insuranceProof}
            onToggle={() => set({ insuranceProof: !req.insuranceProof })}
          >
            <label>
              <FieldLabel>Insurance instructions</FieldLabel>
              <textarea
                value={req.insuranceInstructions}
                onChange={(e) => set({ insuranceInstructions: e.target.value })}
                placeholder="e.g. Bring proof of practitioner insurance covering injectables."
                rows={4}
                className={textAreaClass}
              />
            </label>
          </TogglePanel>

          <TogglePanel
            icon={<ClipboardCheck size={17} />}
            title="Student declarations"
            desc="Add declarations students must accept at booking."
            on={req.studentDeclarations}
            onToggle={() => set({ studentDeclarations: !req.studentDeclarations })}
          >
            <label>
              <FieldLabel>Declaration text</FieldLabel>
              <textarea
                value={req.declarationText}
                onChange={(e) => set({ declarationText: e.target.value })}
                placeholder="e.g. I confirm I am qualified to perform this treatment within my scope of practice."
                rows={4}
                className={textAreaClass}
              />
            </label>
          </TogglePanel>

          <TogglePanel
            icon={<BookOpen size={17} />}
            title="Preparation instructions"
            desc="Tell students how to prepare before the course."
            on={req.preparationInstructions}
            onToggle={() => set({ preparationInstructions: !req.preparationInstructions })}
          >
            <label>
              <FieldLabel>Preparation instructions</FieldLabel>
              <textarea
                value={req.preparationText}
                onChange={(e) => set({ preparationText: e.target.value })}
                placeholder="e.g. Complete pre-course theory and arrive with hair tied back."
                rows={4}
                className={textAreaClass}
              />
            </label>
          </TogglePanel>

          <TogglePanel
            icon={<FileText size={17} />}
            title="Eligibility notes"
            desc="Extra rules your team should review before accepting a booking."
            on={req.eligibilityNotes}
            onToggle={() => set({ eligibilityNotes: !req.eligibilityNotes })}
          >
            <label>
              <FieldLabel>Eligibility notes</FieldLabel>
              <textarea
                value={req.eligibilityNotesText}
                onChange={(e) => set({ eligibilityNotesText: e.target.value })}
                placeholder="e.g. Manual approval required for non-medical practitioners."
                rows={4}
                className={textAreaClass}
              />
            </label>
          </TogglePanel>
        </div>
      </div>

      <div className="shrink-0 border-t border-border px-5 pb-5 pt-3">
        <button onClick={() => router.push(`/app/services/${offer.id}`)} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">
          Done
        </button>
      </div>
    </div>
  );
}

const textAreaClass = "w-full resize-none rounded-xl border border-border bg-canvas px-4 py-3 text-[14px] text-navy outline-none placeholder:text-muted focus:border-navy focus:ring-1 focus:ring-navy";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="pb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{children}</p>;
}

function TogglePanel({
  icon,
  title,
  desc,
  on,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  on: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl bg-canvas">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-3 p-4 text-left">
        <span className="flex min-w-0 gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-secondary">{icon}</span>
          <span>
            <span className="block text-[15px] font-semibold text-navy">{title}</span>
            <span className="block text-[12px] leading-snug text-muted">{desc}</span>
          </span>
        </span>
        <Toggle on={on} />
      </button>
      {on && <div className="border-t border-border/60 px-4 pb-4 pt-3">{children}</div>}
    </section>
  );
}
