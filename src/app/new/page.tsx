"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Play, Sparkles, PoundSterling, Users2, ImageIcon } from "lucide-react";
import { ScreenHeader } from "@/components/ui";

// Wizard intro — "Set up your service in a few simple steps" (Figma 12220:48430).
// Get started → type selector; plus a "Watch a quick tutorial" affordance.

const POINTS = [
  { Icon: Sparkles, title: "Be found and booked instantly", body: "Clients discover and book your services in seconds." },
  { Icon: PoundSterling, title: "Pricing that works for your business", body: "Set flexible rules by role, location or time of day." },
  { Icon: Users2, title: "Your whole team, coordinated", body: "Assign staff and locations so nothing falls through the gaps." },
];

export default function NewOfferIntroPage() {
  const router = useRouter();

  return (
    <>
      <ScreenHeader title="New service" onClose={() => router.push("/app/hub")} />
      <div className="flex-1 overflow-y-auto">
        <div className="flex h-52 items-center justify-center bg-canvas">
          <ImageIcon size={52} className="text-border" strokeWidth={1.5} />
        </div>
        <div className="px-5 pt-6">
          <div className="text-[26px] font-semibold leading-tight tracking-tight text-navy">
            Set up your service in a few simple steps
          </div>
          <div className="mt-2 text-[14px] leading-relaxed text-muted">
            Everything your clients need to know about a service, in one place. Takes less than 5 minutes.
          </div>
          <div className="mt-5 space-y-2.5 pb-6">
            {POINTS.map(({ Icon, title, body }) => (
              <div key={title} className="flex items-start gap-3.5 rounded-2xl border border-border bg-canvas p-4 shadow-[0_1px_2px_rgba(8,7,6,0.04)]">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface shadow-[0_1px_2px_rgba(8,7,6,0.06)]">
                  <Icon size={17} className="text-navy" strokeWidth={1.75} />
                </span>
                <span>
                  <span className="block text-[14px] font-semibold text-navy">{title}</span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-secondary">{body}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="shrink-0 space-y-3 px-5 pb-5 pt-3">
        <button
          onClick={() => router.push("/new/type")}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-navy text-[15px] font-semibold text-white hover:bg-navy/90"
        >
          Get started <ArrowRight size={16} />
        </button>
        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-border bg-surface text-[14px] font-semibold text-navy hover:bg-canvas"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy">
            <Play size={11} className="ml-0.5 fill-white text-white" />
          </span>
          Watch a quick tutorial
        </button>
      </div>
    </>
  );
}
