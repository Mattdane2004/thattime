"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Screen } from "@/components/onboarding2/Shell";
import { PrimaryButton } from "@/components/ui";
import { WeekEditor } from "@/components/team/WeekEditor";
import { useOnboarding2 } from "@/lib/store/onboarding2";

// Join-flow schedule step. If the owner hasn't set a schedule, or has granted
// self-edit, the member sets their own "when are you free to work?" hours here;
// otherwise it's a read-only confirmation of what the owner set up.

export default function StaffWeekPage() {
  const router = useRouter();
  const { staffName, staffManager, staffScheduleSet, staffCanSelfEdit, staffAvailability, set } =
    useOnboarding2();

  const editable = !staffScheduleSet || staffCanSelfEdit;
  const skip = !staffScheduleSet; // owner left it to the member to fill in
  const workingDays = staffAvailability.filter((d) => d.enabled).length;

  const sub = skip
    ? "Add the days and times you can work — your manager will confirm them."
    : editable
      ? `${staffManager} set this up. Adjust anything that's not right.`
      : `${staffManager} has you in ${workingDays} days a week. Welcome aboard.`;

  return (
    <Screen
      footer={
        <PrimaryButton onClick={() => router.push("/onboarding/staff/done")}>
          {editable ? "Save my hours" : "Looks good"}
        </PrimaryButton>
      }
    >
      <div className="px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-[28px] font-extrabold tracking-tight text-navy"
        >
          {skip ? (
            <>When are you free to work, <span className="text-coral">{staffName.first}</span>?</>
          ) : (
            <>Here&rsquo;s your week, <span className="text-coral">{staffName.first}</span></>
          )}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-2 text-[15px] text-secondary"
        >
          {sub}
        </motion.p>
      </div>

      <div className="px-6 pt-6">
        <WeekEditor
          week={staffAvailability}
          readOnly={!editable}
          onChange={(day, patch) =>
            set(
              "staffAvailability",
              staffAvailability.map((d) => (d.day === day ? { ...d, ...patch } : d)),
            )
          }
        />
      </div>
    </Screen>
  );
}
