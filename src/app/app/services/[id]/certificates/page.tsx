"use client";

import { useRouter } from "next/navigation";
import { ScreenHeader, Toggle, FieldLabel } from "@/components/ui";
import { useOffersStore } from "@/lib/store/offersStore";

// Completion & certificates module (class) — whether the class issues a
// certificate and the pass criteria. Persists live via updateOffer.

const empty = { enabled: false, passCriteria: "" };

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

  const cert = offer.certificate ?? empty;
  const set = (patch: Partial<typeof empty>) => updateOffer(offer.id, { certificate: { ...cert, ...patch } });

  return (
    <div className="flex h-full flex-col bg-surface">
      <ScreenHeader title="Completion & certificates" onBack={() => router.push(`/app/services/${offer.id}`)} border />
      <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-8 pt-4">
        <div className="overflow-hidden rounded-2xl border border-border">
          <button onClick={() => set({ enabled: !cert.enabled })} className="flex w-full items-center justify-between px-4 py-3.5 text-left">
            <span className="pr-3">
              <span className="block text-[14px] font-medium text-navy">Issue a certificate</span>
              <span className="block text-[12px] text-muted">Attendees receive a completion certificate</span>
            </span>
            <Toggle on={cert.enabled} />
          </button>
        </div>

        {cert.enabled && (
          <label className="block px-1">
            <FieldLabel>Pass criteria</FieldLabel>
            <textarea
              value={cert.passCriteria}
              onChange={(e) => set({ passCriteria: e.target.value })}
              placeholder="What attendees must do to pass and earn the certificate"
              rows={4}
              className="w-full resize-none rounded-xl border border-border bg-canvas px-4 py-3 text-[14px] text-navy outline-none placeholder:text-muted focus:ring-1 focus:ring-navy"
            />
          </label>
        )}
      </div>
    </div>
  );
}
