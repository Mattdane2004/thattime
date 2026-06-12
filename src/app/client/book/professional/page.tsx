"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Screen, Title } from "@/components/onboarding2/Shell";
import { PrimaryButton, SelectCard } from "@/components/onboarding2/controls";
import { teamRoster, initialsOf } from "@/lib/data/team";
import { useClientBooking, ANY_PROFESSIONAL } from "@/lib/store/clientBooking";

export default function ChooseProfessionalPage() {
  const router = useRouter();
  const { staffId, setStaff } = useClientBooking();
  const team = teamRoster.filter((t) => t.bookable && t.status === "active");

  return (
    <Screen
      footer={
        <PrimaryButton disabled={!staffId} onClick={() => router.push("/client/book/time")}>
          Continue
        </PrimaryButton>
      }
    >
      <Title sub="We'll only show times they're available.">Choose a professional</Title>
      <div className="flex flex-col gap-3 px-6 pb-4 pt-4">
        <SelectCard
          icon={<Sparkles size={18} strokeWidth={1.8} />}
          title="Any professional"
          desc="Maximum availability — we'll pick for you"
          selected={staffId === ANY_PROFESSIONAL}
          onClick={() => setStaff(ANY_PROFESSIONAL)}
        />
        {team.map((t) => (
          <SelectCard
            key={t.id}
            icon={
              <span className={`flex h-11 w-11 items-center justify-center rounded-full text-[14px] font-bold ${t.avatarColor}`}>
                {initialsOf(t.name)}
              </span>
            }
            title={t.name}
            desc={t.role}
            selected={staffId === t.id}
            onClick={() => setStaff(t.id)}
          />
        ))}
      </div>
    </Screen>
  );
}
