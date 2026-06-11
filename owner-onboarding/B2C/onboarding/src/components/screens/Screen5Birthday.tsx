"use client";

import { OnboardingData } from "../OnboardingFlow";
import { Field, PrimaryButton, ScreenHeader } from "../ui";

type Props = {
  data: OnboardingData;
  update: (p: Partial<OnboardingData>) => void;
  onNext: () => void;
};

export default function Screen5Birthday({ data, update, onNext }: Props) {
  const valid = !!data.birthday;
  const firstName = data.fullName.split(" ")[0];

  return (
    <div className="flex flex-col h-full">
      <ScreenHeader
        emoji="🎂"
        title={firstName ? `When’s your birthday, ${firstName}?` : "When’s your birthday?"}
        subtitle="So we can make your experience feel a little more personal."
      />

      <div className="flex-1">
        <Field
          label="Date of birth"
          type="date"
          value={data.birthday}
          onChange={(e) => update({ birthday: e.target.value })}
          max={new Date().toISOString().split("T")[0]}
        />
        <p className="mt-3 text-xs text-muted">
          Expect a little something on your special day 🎁
        </p>
      </div>

      <PrimaryButton onClick={onNext} disabled={!valid}>
        Next
      </PrimaryButton>
    </div>
  );
}
