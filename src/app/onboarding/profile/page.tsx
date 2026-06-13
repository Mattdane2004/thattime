"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton, Field, inputClass } from "@/components/ui";
import { useOnboarding2 } from "@/lib/store/onboarding2";

const domains = ["@gmail.com", "@hotmail.com", "@hotmail.co.uk"];

export default function ProfilePage() {
  const router = useRouter();
  const { firstName, lastName, email, set } = useOnboarding2();
  const valid = firstName.trim() && lastName.trim() && /\S+@\S+\.\S+/.test(email);

  return (
    <Screen
      footer={
        <PrimaryButton disabled={!valid} onClick={() => router.push("/onboarding/preparing")}>
          Continue
        </PrimaryButton>
      }
    >
      <Title sub="This will be used on your That Time account.">
        Create your professional account
      </Title>
      <div className="flex flex-col gap-6 px-6 pt-6">
        <Field label="Name">
          <div className="flex gap-3">
            <input
              value={firstName}
              onChange={(e) => set("firstName", e.target.value)}
              className={inputClass}
              placeholder="First name"
            />
            <input
              value={lastName}
              onChange={(e) => set("lastName", e.target.value)}
              className={inputClass}
              placeholder="Last name"
            />
          </div>
        </Field>
        <div>
          <Field label="Email">
            <input
              type="email"
              inputMode="email"
              value={email}
              onChange={(e) => set("email", e.target.value)}
              className={inputClass}
              placeholder="you@yourshop.com"
            />
          </Field>
          <div className="-mx-6 mt-3 flex gap-2 overflow-x-auto px-6 pb-1 [scrollbar-width:none]">
            {domains.map((d, i) => (
              <motion.button
                key={d}
                type="button"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const base = email.split("@")[0] || "you";
                  set("email", base + d);
                }}
                className="shrink-0 rounded-full border border-border bg-white px-4 py-2 text-[13px] text-navy"
              >
                {d}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </Screen>
  );
}
