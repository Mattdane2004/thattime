"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Check, Scissors, MoreVertical } from "lucide-react";
import { FieldLabel } from "@/components/ui";
import { useOffersStore } from "@/lib/store/offersStore";
import { syncBundleLinks, backToBack, type BundleDraft, type BundleLink, type BundleLinkKind } from "@/lib/store/wizardStore";
import { offerMeta } from "@/lib/data/offers";
import { LinkSheet } from "@/components/offer/BundleOrderEditor";

// Bundle "Included services" editor on the saved offer. Mirrors the wizard
// bundle-services page but operates on the persisted offer via updateOffer.
// Reached from the bundle dashboard Overview → "Included services" row.
// Selected services show a 3-dot button to open the order/gap LinkSheet inline.

const KINDS: { key: BundleDraft["kind"]; title: string; body: string }[] = [
  { key: "fixed", title: "Fixed bundle", body: "A set list of services booked together." },
  { key: "flexible", title: "Flexible package", body: "Clients choose from a list of services." },
];

const arrayMove = <T,>(arr: T[], from: number, to: number): T[] => {
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

export default function BundleServicesRoute({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const allOffers = useOffersStore((s) => s.offers);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  if (!offer || !offer.bundle) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header onBack={() => router.push("/app/services")} />
        <div className="pt-12 text-center text-[13px] text-muted">Bundle not found</div>
      </div>
    );
  }

  const b = offer.bundle;
  const links = syncBundleLinks(b.serviceIds, b.links ?? []);
  const published = allOffers.filter((o) => o.type === "service" && o.status === "published");

  const setKind = (kind: BundleDraft["kind"]) =>
    updateOffer(offer.id, { bundle: { ...b, kind } });

  const setChooseCount = (chooseCount: number) =>
    updateOffer(offer.id, { bundle: { ...b, chooseCount } });

  const toggle = (svcId: string) => {
    const next = b.serviceIds.includes(svcId)
      ? b.serviceIds.filter((x) => x !== svcId)
      : [...b.serviceIds, svcId];
    updateOffer(offer.id, {
      bundle: { ...b, serviceIds: next, links: syncBundleLinks(next, b.links ?? []) },
    });
  };

  const move = (from: number, dir: -1 | 1) => {
    const to = from + dir;
    if (to < 0 || to >= b.serviceIds.length) return;
    const ids = arrayMove(b.serviceIds, from, to);
    const lks = arrayMove(links, from, to);
    updateOffer(offer.id, { bundle: { ...b, serviceIds: ids, links: syncBundleLinks(ids, lks) } });
    setEditIndex(to);
  };

  const setLinkKind = (i: number, kind: BundleLinkKind) => {
    const link: BundleLink = { kind };
    if (kind === "gap") link.gapMin = links[i]?.gapMin ?? 30;
    if (kind === "separate") link.gapDays = links[i]?.gapDays ?? 1;
    const next = links.map((l, idx) => (idx === i ? link : l));
    updateOffer(offer.id, { bundle: { ...b, links: syncBundleLinks(b.serviceIds, next) } });
  };

  const patchLink = (i: number, patch: Partial<BundleLink>) => {
    const next = links.map((l, idx) => (idx === i ? { ...l, ...patch } : l));
    updateOffer(offer.id, { bundle: { ...b, links: next } });
  };

  const editOffer = editIndex !== null ? allOffers.find((o) => o.id === b.serviceIds[editIndex]) : null;
  const nextOffer = editIndex !== null ? allOffers.find((o) => o.id === b.serviceIds[editIndex + 1]) : null;

  return (
    <div className="flex h-full flex-col bg-surface">
      <Header sub={offer.name} onBack={() => router.push(`/app/services/${offer.id}`)} />

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <div className="pb-5 pt-2">
          <div className="flex rounded-2xl bg-canvas p-1">
            {KINDS.map(({ key, title }) => (
              <button
                key={key}
                onClick={() => setKind(key)}
                className={`flex-1 rounded-xl py-2.5 text-[13px] font-medium transition-colors ${
                  b.kind === key ? "bg-surface text-navy shadow-card" : "text-secondary"
                }`}
              >
                {title}
              </button>
            ))}
          </div>
          <div className="mt-2 text-[12px] text-muted">
            {KINDS.find((k) => k.key === b.kind)?.body}
          </div>
        </div>

        {b.kind === "flexible" && (
          <div className="pb-5">
            <FieldLabel>Clients choose</FieldLabel>
            <div className="flex items-center gap-3 rounded-2xl bg-canvas px-4 py-3">
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={b.chooseCount ?? 1}
                onChange={(e) => setChooseCount(Math.max(1, Number(e.target.value) || 1))}
                className="w-14 bg-transparent text-[18px] font-bold text-navy outline-none"
              />
              <span className="text-[13px] text-muted">
                of {b.serviceIds.length || "the"} selected service{b.serviceIds.length === 1 ? "" : "s"}
              </span>
            </div>
            {b.serviceIds.length > 0 && (b.chooseCount ?? 1) > b.serviceIds.length && (
              <div className="mt-1.5 text-[12px] text-danger">Choose at most {b.serviceIds.length}.</div>
            )}
          </div>
        )}

        <FieldLabel>Services ({b.serviceIds.length} selected)</FieldLabel>
        <div className="space-y-2">
          {published.map((svc) => {
            const sel = b.serviceIds.includes(svc.id);
            const svcIndex = sel ? b.serviceIds.indexOf(svc.id) : -1;

            if (sel) {
              return (
                <div key={svc.id} className="flex items-center overflow-hidden rounded-2xl border border-navy">
                  <button
                    onClick={() => toggle(svc.id)}
                    className="flex flex-1 items-center gap-3 px-4 py-3 text-left"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas">
                      <Scissors size={16} className="text-navy" strokeWidth={1.75} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium text-navy">{svc.name}</span>
                      <span className="block text-[12px] text-muted">{offerMeta(svc)}</span>
                    </span>
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-navy bg-navy">
                      <Check size={14} className="text-white" strokeWidth={3} />
                    </span>
                  </button>
                  <button
                    onClick={() => setEditIndex(svcIndex)}
                    aria-label="Edit order and timing"
                    className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted hover:bg-canvas"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              );
            }

            return (
              <button
                key={svc.id}
                onClick={() => toggle(svc.id)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border px-4 py-3 text-left transition-colors hover:bg-canvas"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-canvas">
                  <Scissors size={16} className="text-navy" strokeWidth={1.75} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium text-navy">{svc.name}</span>
                  <span className="block text-[12px] text-muted">{offerMeta(svc)}</span>
                </span>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border bg-canvas" />
              </button>
            );
          })}
          {published.length === 0 && (
            <p className="rounded-2xl bg-canvas px-4 py-5 text-center text-[13px] text-muted">
              No published services yet.
            </p>
          )}
        </div>
      </div>

      {editIndex !== null && editOffer && (
        <LinkSheet
          index={editIndex}
          isFirst={editIndex === 0}
          isLast={editIndex === b.serviceIds.length - 1}
          total={b.serviceIds.length}
          name={editOffer.name}
          nextName={nextOffer?.name}
          link={links[editIndex] ?? backToBack()}
          onClose={() => setEditIndex(null)}
          onMove={(dir) => move(editIndex, dir)}
          onKind={(k) => setLinkKind(editIndex, k)}
          onPatch={(p) => patchLink(editIndex, p)}
        />
      )}
    </div>
  );
}

function Header({ onBack, sub }: { onBack: () => void; sub?: string }) {
  return (
    <div className="flex h-16 items-center px-5">
      <button type="button" aria-label="Back" onClick={onBack} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
        <ChevronLeft size={22} />
      </button>
      <span className="ml-1">
        <span className="block text-[17px] font-semibold leading-tight text-navy">Included services</span>
        {sub ? <span className="block text-[11px] text-muted">{sub}</span> : null}
      </span>
    </div>
  );
}
