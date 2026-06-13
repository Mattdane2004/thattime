"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton, Field, inputClass, PhoneInput } from "@/components/ui";
import { useOnboarding2 } from "@/lib/store/onboarding2";

export default function StaffProfilePage() {
  const router = useRouter();
  const { staffName, staffEmail, phone, set } = useOnboarding2();
  const [photoAdded, setPhotoAdded] = useState(false);

  return (
    <Screen
      footer={
        <PrimaryButton onClick={() => router.push("/onboarding/staff/week")}>
          Save profile
        </PrimaryButton>
      }
    >
      <Title sub="This is what your manager and clients will see around the schedule.">
        Create your profile
      </Title>
      <div className="px-6 pt-4">
        <div className="flex flex-col items-center">
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={() => setPhotoAdded((p) => !p)}
            className={`flex h-[100px] w-[100px] items-center justify-center rounded-full text-3xl transition-colors ${
              photoAdded ? "bg-coral text-white" : "bg-[#F0E6DC] text-secondary"
            }`}
            aria-label="Add profile photo"
          >
            {photoAdded ? (
              <span className="font-display text-[34px] font-bold">
                {staffName.first[0]}
                {staffName.last[0]}
              </span>
            ) : (
              "+"
            )}
          </motion.button>
          <button type="button" className="mt-3 text-[13px] text-muted underline">
            Skip for now
          </button>
        </div>

        <div className="flex flex-col gap-5 pt-5">
          <Field label="Name">
            <div className="flex gap-3">
              <input
                value={staffName.first}
                onChange={(e) => set("staffName", { ...staffName, first: e.target.value })}
                className={inputClass}
                placeholder="First name"
              />
              <input
                value={staffName.last}
                onChange={(e) => set("staffName", { ...staffName, last: e.target.value })}
                className={inputClass}
                placeholder="Last name"
              />
            </div>
          </Field>
          <Field label="Email">
            <input
              value={staffEmail}
              onChange={(e) => set("staffEmail", e.target.value)}
              className={inputClass}
              type="email"
            />
          </Field>
          <Field label="Mobile number">
            <PhoneInput value={phone} onChange={(v) => set("phone", v)} />
          </Field>
        </div>
        <div className="h-4" />
      </div>
    </Screen>
  );
}
