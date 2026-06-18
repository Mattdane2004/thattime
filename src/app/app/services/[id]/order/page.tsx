"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useOffersStore } from "@/lib/store/offersStore";
import { syncBundleLinks, type BundleLink } from "@/lib/store/wizardStore";
import { BundleOrderEditor } from "@/components/offer/BundleOrderEditor";

// Bundle "Order & gaps" editor on the saved offer (Figma 12231-52864 / 53053).
// Reuses the same BundleOrderEditor as the creation wizard; changes persist live
// via updateOffer. Reached from the bundle dashboard Overview tab.

export default function BundleOrderRoute({ params }: { params: { id: string } }) {
  const router = useRouter();
  const offer = useOffersStore((s) => s.offers.find((o) => o.id === params.id));
  const updateOffer = useOffersStore((s) => s.updateOffer);
  const offers = useOffersStore((s) => s.offers);

  if (!offer || !offer.bundle) {
    return (
      <div className="flex h-full flex-col bg-surface">
        <Header title="Order & gaps" onBack={() => router.push("/app/services")} />
        <div className="pt-12 text-center text-[13px] text-muted">Bundle not found</div>
      </div>
    );
  }

  const serviceIds = offer.bundle.serviceIds;
  const links = syncBundleLinks(serviceIds, offer.bundle.links ?? []);
  const onChange = (nextIds: string[], nextLinks: BundleLink[]) =>
    updateOffer(offer.id, { bundle: { ...offer.bundle!, serviceIds: nextIds, links: nextLinks } });

  return (
    <div className="flex h-full flex-col bg-surface">
      <Header title="Order & gaps" sub={offer.name} onBack={() => router.push(`/app/services/${offer.id}`)} />
      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-1">
        <p className="pb-4 text-[13px] text-muted">
          Drag services into order and tap a service to add a gap, overlap, or separate visit.
        </p>
        {serviceIds.length < 2 ? (
          <p className="rounded-2xl bg-canvas px-4 py-6 text-center text-[13px] text-muted">
            This bundle needs at least two services.
          </p>
        ) : (
          <BundleOrderEditor serviceIds={serviceIds} links={links} offers={offers} onChange={onChange} />
        )}
      </div>
    </div>
  );
}

function Header({ title, onBack, sub }: { title: string; onBack: () => void; sub?: string }) {
  return (
    <div className="flex h-16 items-center px-5">
      <button type="button" aria-label="Back" onClick={onBack} className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas"><ChevronLeft size={22} /></button>
      <span className="ml-1">
        <span className="block text-[17px] font-semibold leading-tight text-navy">{title}</span>
        {sub ? <span className="block text-[11px] text-muted">{sub}</span> : null}
      </span>
    </div>
  );
}
