"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  motion,
  AnimatePresence,
  animate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { Screen } from "@/components/onboarding2/Shell";
import { PrimaryButton, ProgressDashes } from "@/components/onboarding2/controls";
import { useFlowChrome } from "@/components/onboarding2/chrome";
import { useOnboarding2, businessLabel } from "@/lib/store/onboarding2";

/** Animated number that counts up when the slide mounts. */
function CountUp({ to, prefix = "", className }: { to: number; prefix?: string; className?: string }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => `${prefix}${Math.round(v).toLocaleString("en-GB")}`);
  useEffect(() => {
    const controls = animate(mv, to, { duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.25 });
    return controls.stop;
  }, [mv, to]);
  return <motion.span className={className}>{text}</motion.span>;
}

function CommissionBar({ name, amount, max, delay }: { name: string; amount: number; max: number; delay: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[14px] font-semibold text-navy">{name}</span>
        <span className="text-[14px] font-bold text-navy">£{amount}/mo</span>
      </div>
      <div className="mt-2 h-[7px] overflow-hidden rounded-full bg-fog">
        <motion.div
          className="h-full rounded-full bg-[#7C3AED]"
          initial={{ width: 0 }}
          animate={{ width: `${(amount / max) * 100}%` }}
          transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

export default function ValuePage() {
  const router = useRouter();
  const { weeklyBookings, avgPrice, businessName } = useOnboarding2();
  const [step, setStep] = useState(0); // 0 = loading, 1..5 = slides
  const touchX = useRef<number | null>(null);

  const monthly = Math.max(1, Math.round(weeklyBookings * 4.3));
  const revenue = monthly * (avgPrice || 13);
  const fresha = Math.max(49, Math.round(revenue * 0.1));
  const treatwell = Math.max(45, Math.round(revenue * 0.095));
  const booksie = Math.max(42, Math.round(revenue * 0.087));
  const saved = Math.max(35, Math.round(revenue * 0.072 / 10) * 10);

  useEffect(() => {
    if (step === 0) {
      const t = setTimeout(() => setStep(1), 2300);
      return () => clearTimeout(t);
    }
  }, [step]);

  const next = () => (step >= 5 ? router.push("/onboarding/trial") : setStep((s) => s + 1));

  // Header back steps back through slides before leaving the route.
  const setBackHandler = useFlowChrome((s) => s.setBackHandler);
  useEffect(() => {
    setBackHandler(step > 1 ? () => setStep((s) => Math.max(1, s - 1)) : null);
    return () => setBackHandler(null);
  }, [step, setBackHandler]);

  const back = () => (step <= 1 ? router.back() : setStep((s) => s - 1));

  const slideShell = "flex h-full flex-col px-6";

  return (
    <Screen>
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="loading"
            className={slideShell}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -16 }}
          >
            <h1 className="font-display text-[32px] font-extrabold leading-[1.1] tracking-tight text-ink">
              Right, let&rsquo;s talk bookings.
            </h1>
            <p className="mt-4 text-[15px] text-secondary">
              Here&rsquo;s what 0% commission could mean for {businessLabel(businessName)}.
            </p>
            <div className="flex flex-1 flex-col items-center justify-center pb-16">
              <p className="text-[15px] font-semibold text-ink">Checking your booking volume ...</p>
              <div className="mt-4 h-[3px] w-[260px] overflow-hidden rounded-full bg-ink">
                <motion.div
                  className="h-full bg-coral"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.1, ease: "easeInOut" }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {step > 0 && (
          <motion.div
            key={step}
            className={slideShell}
            initial={{ opacity: 0, x: 56 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -56 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            onTouchStart={(e) => {
              touchX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (dx < -60) next();
              if (dx > 60) back();
              touchX.current = null;
            }}
          >
            {step === 1 && (
              <>
                <h1 className="font-display text-[32px] font-extrabold leading-[1.1] tracking-tight text-ink">
                  Your Chairs are filling up
                </h1>
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, rotate: -3 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 160, damping: 18 }}
                  className="relative mx-auto my-4 w-full max-w-[300px] flex-1"
                >
                  <Image src="/onboarding/illo-chair.png" alt="Barber chair" fill sizes="300px" className="object-contain" priority />
                </motion.div>
                <div className="pb-2">
                  <CountUp to={monthly} className="block font-display text-[64px] font-extrabold leading-none text-coral" />
                  <p className="mt-1 text-[13px] font-bold text-navy">bookings a month</p>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <h1 className="font-display text-[32px] font-extrabold leading-[1.1] tracking-tight text-ink">
                  Those bookings add up
                </h1>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 160, damping: 18 }}
                  className="relative mx-auto my-4 w-full max-w-[300px] flex-1"
                >
                  <Image src="/onboarding/illo-coins.png" alt="Stacks of coins" fill sizes="300px" className="object-contain" />
                </motion.div>
                <div className="pb-2">
                  <CountUp to={revenue} prefix="£" className="block font-display text-[64px] font-extrabold leading-none text-coral" />
                  <p className="mt-1 text-[13px] font-bold text-navy">a month, before platform fees.</p>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h1 className="font-display text-[32px] font-extrabold leading-[1.1] tracking-tight text-ink">
                  Their cut goes up.
                  <br />
                  Ours doesn&rsquo;t.
                </h1>
                <div className="mt-6 rounded-3xl bg-white/80 p-6">
                  <p className="text-[16px] font-semibold text-ink">Estimated commission cost</p>
                  <div className="mt-3 border-t border-border pt-4">
                    <div className="flex flex-col gap-4">
                      <CommissionBar name="Fresha" amount={fresha} max={fresha} delay={0.2} />
                      <CommissionBar name="Treatwell" amount={treatwell} max={fresha} delay={0.35} />
                      <CommissionBar name="Booksie" amount={booksie} max={fresha} delay={0.5} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-end pb-2">
                  <motion.span
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, type: "spring", stiffness: 240, damping: 16 }}
                    className="block font-display text-[64px] font-extrabold leading-none text-coral"
                  >
                    £0
                  </motion.span>
                  <p className="mt-1 text-[13px] font-bold text-navy">Commission on That Time</p>
                </div>
              </>
            )}

            {step === 4 && (
              <>
                <h1 className="font-display text-[32px] font-extrabold leading-[1.1] tracking-tight text-ink">
                  That&rsquo;s money with better places to be
                </h1>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 160, damping: 18 }}
                  className="relative mx-auto my-4 w-full max-w-[320px] flex-1"
                >
                  <Image src="/onboarding/illo-coffee.png" alt="Coffee cup and coins" fill sizes="320px" className="object-contain" />
                </motion.div>
                <p className="pb-2 text-[15px] font-bold text-secondary">
                  Like those essential coffees that keep you going.
                </p>
              </>
            )}

            {step === 5 && (
              <>
                <h1 className="font-display text-[32px] font-extrabold leading-[1.1] tracking-tight text-ink">
                  Your bookings stay yours
                </h1>
                <motion.div
                  initial={{ opacity: 0, y: 20, rotate: 2 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 160, damping: 18 }}
                  className="relative mx-auto my-4 w-full max-w-[300px] flex-1"
                >
                  <Image src="/onboarding/illo-calendar.png" alt="Desk calendar" fill sizes="300px" className="object-contain" />
                </motion.div>
                <div className="pb-2">
                  <CountUp to={saved} prefix="£" className="block font-display text-[64px] font-extrabold leading-none text-coral" />
                  <p className="mt-1 text-[13px] font-bold leading-snug text-navy">
                    saved a month
                    <br />
                    with 0% commission on That Time.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {step > 0 && (
        <div className="shrink-0 px-6 pb-6 pt-2">
          <div className="flex items-end gap-2 px-4 pb-4">
            <p className="flex-1 text-[12px] text-muted">
              <span className="font-semibold text-[#111]">{step}</span> of 5
            </p>
            <ProgressDashes total={5} active={step} />
          </div>
          <PrimaryButton onClick={next}>Continue</PrimaryButton>
        </div>
      )}
    </Screen>
  );
}
