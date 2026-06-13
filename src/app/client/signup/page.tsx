"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Screen, Title, TermsFootnote } from "@/components/onboarding2/Shell";
import {
  PrimaryButton,
  SocialButtons,
  OrDivider,
  Field,
  inputClass,
} from "@/components/ui";
import { useOnboarding2 } from "@/lib/store/onboarding2";

const domains = ["@gmail.com", "@hotmail.com", "@hotmail.co.uk"];

export default function ClientSignupPage() {
  const router = useRouter();
  const { clientEmail, set } = useOnboarding2();
  const valid = /\S+@\S+\.\S+/.test(clientEmail);

  return (
    <Screen>
      <Title sub="Sign up with email or continue with your favourite account to start finding services.">
        create your account
      </Title>
      <div className="px-6 pt-5">
        <Field label="Email">
          <input
            type="email"
            inputMode="email"
            value={clientEmail}
            onChange={(e) => set("clientEmail", e.target.value)}
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
              transition={{ delay: 0.08 + i * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => set("clientEmail", (clientEmail.split("@")[0] || "you") + d)}
              className="shrink-0 rounded-full border border-border bg-white px-4 py-2 text-[13px] text-navy"
            >
              {d}
            </motion.button>
          ))}
        </div>
        <div className="pt-5">
          <PrimaryButton disabled={!valid} onClick={() => router.push("/client/details")}>
            Continue
          </PrimaryButton>
        </div>
        <OrDivider />
        <SocialButtons onPick={() => router.push("/client/details")} />
        <TermsFootnote />
      </div>
    </Screen>
  );
}
