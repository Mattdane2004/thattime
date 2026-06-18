"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, FileCheck2, Megaphone, ShieldCheck, SlidersHorizontal, Users } from "lucide-react";
import { ScreenHeader, Sheet, Toggle, FieldLabel, fieldInput } from "@/components/ui";
import { useOffersStore } from "@/lib/store/offersStore";
import type { ClassModels } from "@/lib/data/offers";

const emptyModels: ClassModels = {
  enabled: false,
  gender: "Any suitable candidate",
  minAge: "",
  maxAge: "",
  require18: true,
  candidateRequirements: "",
  evidenceRequired: false,
  evidencePrompt: "",
  suitabilityConfirmation: "",
  modelsPerStudent: "1",
  applicationCap: "",
  applicationDeadline: "",
  safetyCheck: true,
  noShowFee: "",
  applicationLink: "https://thattime.app/join/model/beginner-yoga",
};

type SheetKey = "criteria" | "evidence" | "intake" | "safety";

export default function ModelsModulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const [openSheet, setOpenSheet] = useState<SheetKey | null>(null);
  const [copied, setCopied] = useState(false);

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <ScreenHeader title="Models" onBack={() => router.push("/app/services")} border />
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  const models = { ...emptyModels, ...(offer.models ?? {}) };
  const set = (patch: Partial<ClassModels>) => updateOffer(offer.id, { models: { ...models, ...patch } });
  const appLink = models.applicationLink || `https://thattime.app/join/model/${offer.id}`;

  const copyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      void navigator.clipboard.writeText(appLink);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="flex h-full flex-col bg-surface">
      <ScreenHeader title="Models & practice clients" onBack={() => router.push(`/app/services/${offer.id}`)} border />
      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4">
        <button onClick={() => set({ enabled: !models.enabled })} className="flex w-full items-center justify-between gap-4 rounded-2xl bg-canvas p-4 text-left">
          <span className="flex min-w-0 gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface text-secondary">
              <Megaphone size={19} strokeWidth={1.75} />
            </span>
            <span>
              <span className="block text-[16px] font-semibold text-navy">Model applications</span>
              <span className="mt-1 block text-[13px] leading-snug text-muted">Collect demo-client requests, consent and matching details for practical classes.</span>
            </span>
          </span>
          <Toggle on={models.enabled} />
        </button>

        {models.enabled ? (
          <div className="space-y-5 pt-5">
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <SetupRow
                icon={<Users size={16} />}
                title="Candidate criteria"
                desc={criteriaSummary(models)}
                onClick={() => setOpenSheet("criteria")}
              />
              <SetupRow
                icon={<FileCheck2 size={16} />}
                title="Evidence & assessment"
                desc={models.evidenceRequired ? "Evidence upload required" : "Evidence upload optional"}
                onClick={() => setOpenSheet("evidence")}
                divider
              />
              <SetupRow
                icon={<SlidersHorizontal size={16} />}
                title="Intake & capacity"
                desc={`${models.modelsPerStudent || "1"} model${models.modelsPerStudent === "1" ? "" : "s"} per student${models.applicationCap ? ` · cap ${models.applicationCap}` : ""}`}
                onClick={() => setOpenSheet("intake")}
                divider
              />
              <SetupRow
                icon={<ShieldCheck size={16} />}
                title="Safety & commitment"
                desc={models.safetyCheck ? "Safety check required" : "No safety check required"}
                onClick={() => setOpenSheet("safety")}
                divider
              />
            </div>

            <div className="rounded-2xl bg-canvas p-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Application link</div>
              <div className="mt-2 break-all text-[14px] font-medium leading-snug text-navy">{appLink}</div>
              <button onClick={copyLink} className="mt-4 flex h-10 items-center gap-2 rounded-full bg-navy px-4 text-[13px] font-semibold text-white">
                <Copy size={14} strokeWidth={1.75} />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center px-6 pt-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-canvas">
              <Megaphone size={28} className="text-muted" strokeWidth={1.5} />
            </span>
            <div className="mt-4 text-[16px] font-semibold text-navy">No model applications</div>
            <div className="mt-1 text-[13px] leading-snug text-muted">Turn this on when the class needs practice clients, demo models or supervised assessment candidates.</div>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border px-5 pb-5 pt-3">
        <button onClick={() => router.push(`/app/services/${offer.id}`)} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">
          Done
        </button>
      </div>

      <Sheet
        open={openSheet === "criteria"}
        onClose={() => setOpenSheet(null)}
        title="Candidate criteria"
        footer={<button onClick={() => setOpenSheet(null)} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">Save criteria</button>}
      >
        <div className="space-y-5">
          <label className="block">
            <FieldLabel>Gender or demographic</FieldLabel>
            <input value={models.gender} onChange={(e) => set({ gender: e.target.value })} placeholder="Any suitable candidate" className={fieldInput} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <FieldLabel>Min age</FieldLabel>
              <input type="number" inputMode="numeric" value={models.minAge} onChange={(e) => set({ minAge: e.target.value })} placeholder="18" className={fieldInput} />
            </label>
            <label className="block">
              <FieldLabel>Max age</FieldLabel>
              <input type="number" inputMode="numeric" value={models.maxAge} onChange={(e) => set({ maxAge: e.target.value })} placeholder="Optional" className={fieldInput} />
            </label>
          </div>
          <ToggleLine title="Require 18+" desc="Models must confirm they are over 18." on={models.require18} onClick={() => set({ require18: !models.require18 })} />
          <label className="block">
            <FieldLabel>Candidate requirements</FieldLabel>
            <textarea
              value={models.candidateRequirements}
              onChange={(e) => set({ candidateRequirements: e.target.value })}
              placeholder="e.g. Must be comfortable with a trainee performing the treatment under supervision."
              rows={4}
              className={textAreaClass}
            />
          </label>
        </div>
      </Sheet>

      <Sheet
        open={openSheet === "evidence"}
        onClose={() => setOpenSheet(null)}
        title="Evidence & assessment"
        footer={<button onClick={() => setOpenSheet(null)} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">Save evidence rules</button>}
      >
        <div className="space-y-5">
          <ToggleLine title="Require evidence upload" desc="Ask applicants to upload photos or documents before approval." on={models.evidenceRequired} onClick={() => set({ evidenceRequired: !models.evidenceRequired })} />
          <label className="block">
            <FieldLabel>What evidence is needed?</FieldLabel>
            <textarea
              value={models.evidencePrompt}
              onChange={(e) => set({ evidencePrompt: e.target.value })}
              placeholder="e.g. Upload a clear photo of current hair length and colour."
              rows={4}
              className={textAreaClass}
            />
          </label>
          <label className="block">
            <FieldLabel>Agreement / suitability confirmation</FieldLabel>
            <textarea
              value={models.suitabilityConfirmation}
              onChange={(e) => set({ suitabilityConfirmation: e.target.value })}
              placeholder="e.g. I understand a student will perform the service under trainer supervision."
              rows={4}
              className={textAreaClass}
            />
          </label>
        </div>
      </Sheet>

      <Sheet
        open={openSheet === "intake"}
        onClose={() => setOpenSheet(null)}
        title="Intake & capacity"
        footer={<button onClick={() => setOpenSheet(null)} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">Save intake</button>}
      >
        <div className="space-y-5">
          <label className="block">
            <FieldLabel>Models per student</FieldLabel>
            <input type="number" inputMode="numeric" min={0} value={models.modelsPerStudent} onChange={(e) => set({ modelsPerStudent: e.target.value })} className={fieldInput} />
          </label>
          <label className="block">
            <FieldLabel>Application cap</FieldLabel>
            <input type="number" inputMode="numeric" value={models.applicationCap} onChange={(e) => set({ applicationCap: e.target.value })} placeholder="Optional" className={fieldInput} />
          </label>
          <label className="block">
            <FieldLabel>Application deadline</FieldLabel>
            <input type="date" value={models.applicationDeadline} onChange={(e) => set({ applicationDeadline: e.target.value })} className={fieldInput} />
          </label>
        </div>
      </Sheet>

      <Sheet
        open={openSheet === "safety"}
        onClose={() => setOpenSheet(null)}
        title="Safety & commitment"
        footer={<button onClick={() => setOpenSheet(null)} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">Save safety rules</button>}
      >
        <div className="space-y-5">
          <ToggleLine title="Require safety check" desc="Team must approve suitability before matching a model." on={models.safetyCheck} onClick={() => set({ safetyCheck: !models.safetyCheck })} />
          <label className="block">
            <FieldLabel>No-show penalty fee</FieldLabel>
            <div className="flex items-center rounded-xl border border-border bg-canvas px-4">
              <span className="text-[15px] text-muted">£</span>
              <input type="number" inputMode="decimal" value={models.noShowFee} onChange={(e) => set({ noShowFee: e.target.value })} placeholder="Optional" className="h-12 min-w-0 flex-1 bg-transparent px-2 text-[14px] text-navy outline-none placeholder:text-muted" />
            </div>
          </label>
        </div>
      </Sheet>
    </div>
  );
}

function SetupRow({ icon, title, desc, onClick, divider = false }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void; divider?: boolean }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-canvas ${divider ? "border-t border-border" : ""}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canvas text-secondary">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold text-navy">{title}</span>
        <span className="block truncate text-[12px] text-muted">{desc}</span>
      </span>
    </button>
  );
}

function ToggleLine({ title, desc, on, onClick }: { title: string; desc: string; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border px-4 py-3 text-left">
      <span>
        <span className="block text-[14px] font-semibold text-navy">{title}</span>
        <span className="block text-[12px] leading-snug text-muted">{desc}</span>
      </span>
      <Toggle on={on} />
    </button>
  );
}

function criteriaSummary(models: ClassModels) {
  const ages = [models.minAge && `${models.minAge}+`, models.maxAge && `under ${models.maxAge}`].filter(Boolean).join(" · ");
  return [models.gender, models.require18 ? "18+ required" : ages].filter(Boolean).join(" · ") || "Any suitable candidate";
}

const textAreaClass = "w-full resize-none rounded-xl border border-border bg-canvas px-4 py-3 text-[14px] text-navy outline-none placeholder:text-muted focus:border-navy focus:ring-1 focus:ring-navy";
