"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton, CheckCircle } from "@/components/onboarding2/controls";
import { demoOffers, offerMeta } from "@/lib/data/offers";
import { clientBusiness } from "@/lib/data/clientApp";
import { useClientBooking } from "@/lib/store/clientBooking";

export default function ChooseServicesPage() {
  const router = useRouter();
  const { serviceIds, toggleService } = useClientBooking();
  const services = demoOffers.filter((o) => o.type === "service" && o.status === "published");
  const total = serviceIds.reduce(
    (sum, id) => sum + Number(demoOffers.find((o) => o.id === id)?.price ?? 0),
    0
  );

  return (
    <Screen
      footer={
        <PrimaryButton
          disabled={serviceIds.length === 0}
          onClick={() => router.push("/client/book/professional")}
        >
          {serviceIds.length
            ? `Continue · ${serviceIds.length} service${serviceIds.length > 1 ? "s" : ""} · £${total}`
            : "Select a service"}
        </PrimaryButton>
      }
    >
      <Title sub={`${clientBusiness.name} · ${clientBusiness.address}`}>Choose services</Title>
      <div className="flex flex-col gap-3 px-6 pb-4 pt-4">
        {services.map((s) => {
          const on = serviceIds.includes(s.id);
          return (
            <motion.button
              key={s.id}
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleService(s.id)}
              className={`flex w-full items-center gap-4 rounded-2xl border bg-white p-4 text-left transition-colors ${
                on ? "border-navy" : "border-border"
              }`}
            >
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold text-navy">{s.name}</span>
                <span className="mt-0.5 block text-[13px] text-secondary">
                  {offerMeta(s)} · {s.category}
                </span>
              </span>
              <CheckCircle on={on} />
            </motion.button>
          );
        })}
      </div>
    </Screen>
  );
}
