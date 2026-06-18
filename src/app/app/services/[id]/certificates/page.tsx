"use client";

import { useRouter } from "next/navigation";
import { Award, CheckCircle2 } from "lucide-react";
import { ScreenHeader, Toggle, FieldLabel, fieldInput } from "@/components/ui";
import { useOffersStore } from "@/lib/store/offersStore";
import type { ClassCertificate } from "@/lib/data/offers";

const emptyCertificate: ClassCertificate = {
  enabled: false,
  name: "Certificate of completion",
  issueRule: "completion",
  expiryMonths: "",
  notes: "",
  passCriteria: "",
};

const issueRules: { value: ClassCertificate["issueRule"]; label: string; desc: string }[] = [
  { value: "completion", label: "On completion", desc: "Issue when the class is marked complete." },
  { value: "attendance", label: "Full attendance", desc: "Require the student to attend every session." },
  { value: "assessment", label: "Assessment pass", desc: "Issue only after a pass result is recorded." },
];

export default function CertificatesModulePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);

  if (!offer) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <ScreenHeader title="Certificates" onBack={() => router.push("/app/services")} border />
        <div className="pt-12 text-center text-[13px] text-muted">Offer not found</div>
      </div>
    );
  }

  const cert = { ...emptyCertificate, ...(offer.certificate ?? {}) };
  const set = (patch: Partial<ClassCertificate>) => updateOffer(offer.id, { certificate: { ...cert, ...patch } });

  return (
    <div className="flex h-full flex-col bg-surface">
      <ScreenHeader title="Completion & certificates" onBack={() => router.push(`/app/services/${offer.id}`)} border />
      <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4">
        <button onClick={() => set({ enabled: !cert.enabled })} className="flex w-full items-center justify-between gap-4 rounded-2xl bg-canvas p-4 text-left">
          <span className="flex min-w-0 gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface text-secondary">
              <Award size={19} strokeWidth={1.75} />
            </span>
            <span>
              <span className="block text-[16px] font-semibold text-navy">Completion certificate</span>
              <span className="mt-1 block text-[13px] leading-snug text-muted">Issue certificates when students complete or pass the class.</span>
            </span>
          </span>
          <Toggle on={cert.enabled} />
        </button>

        {!cert.enabled ? (
          <div className="flex flex-col items-center px-6 pt-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-canvas">
              <Award size={28} className="text-muted" strokeWidth={1.5} />
            </span>
            <div className="mt-4 text-[16px] font-semibold text-navy">No certificate configured</div>
            <div className="mt-1 text-[13px] leading-snug text-muted">Turn on completion certificates to set the name, issue rule, expiry and notes.</div>
          </div>
        ) : (
          <div className="space-y-5 pt-5">
            <label className="block">
              <FieldLabel>Certificate name</FieldLabel>
              <input value={cert.name} onChange={(e) => set({ name: e.target.value })} placeholder="Certificate of completion" className={fieldInput} />
            </label>

            <div>
              <FieldLabel>Issue rule</FieldLabel>
              <div className="space-y-2">
                {issueRules.map((rule) => (
                  <button
                    key={rule.value}
                    onClick={() => set({ issueRule: rule.value })}
                    className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left ${
                      cert.issueRule === rule.value ? "border-navy bg-canvas" : "border-border bg-surface"
                    }`}
                  >
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${cert.issueRule === rule.value ? "border-navy" : "border-muted"}`}>
                      {cert.issueRule === rule.value && <span className="h-2 w-2 rounded-full bg-navy" />}
                    </span>
                    <span>
                      <span className="block text-[14px] font-semibold text-navy">{rule.label}</span>
                      <span className="block text-[12px] leading-snug text-muted">{rule.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {cert.issueRule === "assessment" && (
              <label className="block">
                <FieldLabel>Pass criteria</FieldLabel>
                <textarea
                  value={cert.passCriteria ?? ""}
                  onChange={(e) => set({ passCriteria: e.target.value })}
                  placeholder="What students must do to pass and receive the certificate."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-border bg-canvas px-4 py-3 text-[14px] text-navy outline-none placeholder:text-muted focus:border-navy focus:ring-1 focus:ring-navy"
                />
              </label>
            )}

            <label className="block">
              <FieldLabel>Expiry in months</FieldLabel>
              <input type="number" inputMode="numeric" value={cert.expiryMonths} onChange={(e) => set({ expiryMonths: e.target.value })} placeholder="Optional" className={fieldInput} />
            </label>

            <label className="block">
              <FieldLabel>Certificate notes</FieldLabel>
              <textarea
                value={cert.notes}
                onChange={(e) => set({ notes: e.target.value })}
                placeholder="Add wording, internal notes or renewal guidance."
                rows={4}
                className="w-full resize-none rounded-xl border border-border bg-canvas px-4 py-3 text-[14px] text-navy outline-none placeholder:text-muted focus:border-navy focus:ring-1 focus:ring-navy"
              />
            </label>

            <div className="flex items-start gap-3 rounded-2xl bg-success/10 p-4">
              <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-success" />
              <p className="text-[13px] leading-snug text-navy">
                Students will see certificate details only when this class offers one.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-border px-5 pb-5 pt-3">
        <button onClick={() => router.push(`/app/services/${offer.id}`)} className="h-12 w-full rounded-full bg-navy text-[15px] font-semibold text-white">
          Done
        </button>
      </div>
    </div>
  );
}
