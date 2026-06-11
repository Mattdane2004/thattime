"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Screen } from "@/components/onboarding2/Shell";
import { PhotoCarousel } from "@/components/onboarding2/PhotoCarousel";
import { useOnboarding2, type Audience } from "@/lib/store/onboarding2";

const options: { id: Audience; label: string }[] = [
  { id: "female", label: "Female" },
  { id: "male", label: "Male" },
  { id: "both", label: "Both" },
];

export default function ClientAudiencePage() {
  const router = useRouter();
  const set = useOnboarding2((s) => s.set);

  return (
    <Screen>
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center">
          <PhotoCarousel
            images={[
              "/onboarding/photo-carousel-left.png",
              "/onboarding/photo-carousel-center.png",
              "/onboarding/photo-carousel-right.png",
            ]}
          />
        </div>
        <div className="px-6">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-[30px] font-extrabold leading-[1.12] tracking-tight text-navy"
          >
            Discover services just Right you
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-2 text-[15px] text-secondary"
          >
            Show services design for:
          </motion.p>
        </div>
        <div className="flex flex-col gap-3 px-6 pb-6 pt-4">
          {options.map((o, i) => (
            <motion.button
              key={o.id}
              type="button"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                set("audience", o.id);
                router.push("/client/categories");
              }}
              className="h-12 rounded-2xl border border-navy/30 bg-white text-[15px] font-semibold text-navy"
            >
              {o.label}
            </motion.button>
          ))}
        </div>
      </div>
    </Screen>
  );
}
