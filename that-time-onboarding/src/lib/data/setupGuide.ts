// Setup guide data — ported (typed) from the legacy that-time-app
// src/data/setupGuide.js (setupLevels). Tiered checklist of setup tasks.

export type StepStatus = "done" | "current" | "todo" | "locked";

export interface SetupStep {
  label: string;
  desc: string;
  status: StepStatus;
}

export interface SetupLevel {
  key: string;
  title: string;
  steps: SetupStep[];
}

export const setupLevels: SetupLevel[] = [
  {
    key: "founder",
    title: "Get ready to take bookings",
    steps: [
      { label: "Business profile", desc: "Add the public details clients see before they book.", status: "done" },
      { label: "Services", desc: "Turn your starter menu into real bookable offers.", status: "current" },
      { label: "Booking rules", desc: "Choose lead time, cancellations, deposits, and who can book.", status: "todo" },
      { label: "Go live", desc: "Preview the client flow, then share your booking page.", status: "todo" },
    ],
  },
  {
    key: "operator",
    title: "Keep the day moving",
    steps: [
      { label: "Payments", desc: "Set up payouts, deposits, taxes, and accepted payment methods.", status: "todo" },
      { label: "Calendar", desc: "Bring appointments and availability into one source of truth.", status: "locked" },
      { label: "Notifications", desc: "Send confirmations, reminders, and follow-ups automatically.", status: "locked" },
      { label: "Import data", desc: "Upload CSV files with your client and booking data.", status: "todo" },
    ],
  },
  {
    key: "team-builder",
    title: "Bring people into the business",
    steps: [
      { label: "Invite team", desc: "Invite staff or create profiles for anyone clients can book with.", status: "locked" },
      { label: "Permissions", desc: "Control who can deliver each service, class, bundle, or subscription.", status: "locked" },
      { label: "Resources", desc: "Stop double-booking rooms, chairs, stations, and specialist kit.", status: "locked" },
      { label: "Forms", desc: "Collect the information you need before each appointment.", status: "locked" },
    ],
  },
  {
    key: "growth",
    title: "Find your next clients",
    steps: [
      { label: "Campaigns", desc: "Send a targeted offer to a segment of clients.", status: "locked" },
      { label: "Win-back", desc: "Prompt clients to come back at the right moment.", status: "locked" },
      { label: "Analytics", desc: "Use bookings, revenue, and gaps to decide what to improve next.", status: "locked" },
      { label: "Rewards", desc: "Reward repeat clients with a reason to book again.", status: "locked" },
    ],
  },
];

export const STATUS_LABEL: Record<StepStatus, string> = {
  done: "Done", current: "Next", todo: "Open", locked: "Later",
};

export function setupProgress(): { done: number; total: number } {
  const steps = setupLevels.flatMap((l) => l.steps);
  return { done: steps.filter((s) => s.status === "done").length, total: steps.length };
}
