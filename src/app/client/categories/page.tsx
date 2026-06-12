"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton } from "@/components/onboarding2/controls";
import { useOnboarding2 } from "@/lib/store/onboarding2";

const cats = [
  { id: "nail-salons", label: "Nail Salons", img: "/onboarding/photo-cat-1.png" },
  { id: "fitness", label: "Fitness", img: "/onboarding/photo-cat-2.png" },
  { id: "pet-grooming", label: "Pet Grooming", img: "/onboarding/photo-cat-3.png" },
  { id: "barbers", label: "Barbers", img: "/onboarding/photo-carousel-center.png" },
  { id: "massage", label: "Massage", img: "/onboarding/photo-cat-4.png" },
  { id: "tutoring", label: "Tutoring", img: "/onboarding/photo-cat-2.png" },
  { id: "tattoos", label: "Tattoos", img: "/onboarding/photo-cat-3.png" },
  { id: "hair-salons", label: "Hair Salons", img: "/onboarding/photo-cat-1.png" },
  { id: "beauty", label: "Beauty", img: "/onboarding/photo-cat-4.png" },
  { id: "spa", label: "Spa", img: "/onboarding/photo-carousel-left.png" },
  { id: "wellness", label: "Wellness", img: "/onboarding/photo-cat-2.png" },
  { id: "aesthetics", label: "Aesthetics", img: "/onboarding/photo-carousel-right.png" },
];

export default function ClientCategoriesPage() {
  const router = useRouter();
  const { clientCategories, toggleClientCategory } = useOnboarding2();

  return (
    <Screen
      footer={
        <>
          <PrimaryButton onClick={() => router.push("/client/finding")}>Continue</PrimaryButton>
          <button
            type="button"
            onClick={() => router.push("/client/finding")}
            className="mt-3 w-full text-center text-[15px] font-semibold text-navy"
          >
            skip
          </button>
        </>
      }
    >
      <Title sub="Allow us to tailor you a more personalised experience by selecting up to 5 categories">
        Select your usual or try something new
      </Title>
      <div className="grid grid-cols-3 gap-2.5 px-6 pb-4 pt-4">
        {cats.map((c, i) => {
          const selected = clientCategories.includes(c.id);
          return (
            <motion.button
              key={c.id}
              type="button"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.03 * i }}
              whileTap={{ scale: 0.94 }}
              onClick={() => toggleClientCategory(c.id)}
              className={`rounded-lg p-1 transition-colors ${selected ? "bg-coral" : "bg-[#F0E6DC]"}`}
            >
              <span className="relative block h-[100px] w-full overflow-hidden rounded-[5px]">
                <Image src={c.img} alt={c.label} fill sizes="110px" className="object-cover" />
              </span>
              <span className={`block py-1.5 text-center text-[12px] font-semibold ${selected ? "text-white" : "text-ink"}`}>
                {c.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </Screen>
  );
}
