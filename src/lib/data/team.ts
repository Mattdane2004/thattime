// Canonical team domain data — full Staff records for the Team section
// (roster, member detail, shifts, time off, pay). The list view derives a
// summary from these, so SystemRole / StaffStatus stay type-checked.
import type {
  AccessLevel,
  PayRun,
  Staff,
  StaffPermissions,
  WeeklyScheduleDay,
  Weekday,
} from "@/lib/types";

export type TeamMemberSummary = Pick<
  Staff,
  "id" | "name" | "role" | "systemRoles" | "status" | "avatarColor" | "bookable"
> & { services: number };

const WEEKDAYS: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Standard salon week: Mon–Sat 9–6, Sunday off. */
export function defaultWeek(daysOff: Weekday[] = ["Sun"]): WeeklyScheduleDay[] {
  return WEEKDAYS.map((day) => ({
    day,
    enabled: !daysOff.includes(day),
    start: "09:00",
    end: "18:00",
  }));
}

/** Permission presets per access level — the flags each level switches on. */
export const ACCESS_PRESETS: Record<AccessLevel, StaffPermissions> = {
  basic: { calendar: true, bookings: false, clients: false, services: false, payments: false, team: false, reports: false, settings: false },
  low: { calendar: true, bookings: true, clients: true, services: false, payments: false, team: false, reports: false, settings: false },
  medium: { calendar: true, bookings: true, clients: true, services: true, payments: true, team: false, reports: false, settings: false },
  high: { calendar: true, bookings: true, clients: true, services: true, payments: true, team: true, reports: true, settings: false },
  owner: { calendar: true, bookings: true, clients: true, services: true, payments: true, team: true, reports: true, settings: true },
};

export const ACCESS_LEVELS: { key: AccessLevel; label: string; desc: string }[] = [
  { key: "basic", label: "Basic", desc: "View their own calendar only" },
  { key: "low", label: "Low", desc: "Own calendar, bookings, and clients" },
  { key: "medium", label: "Medium", desc: "Front of house — bookings, clients, checkout" },
  { key: "high", label: "High", desc: "Management — team, reports, and payments" },
  { key: "owner", label: "Owner", desc: "Full access to everything" },
];

function member(
  base: Pick<Staff, "id" | "name" | "role" | "systemRoles" | "status" | "avatarColor" | "bookable" | "services">,
  extra?: Partial<Staff>,
): Staff {
  const accessLevel = extra?.accessLevel ?? (base.systemRoles.includes("Manager") ? "high" : "low");
  return {
    email: `${base.name.toLowerCase().replace(/[^a-z]+/g, ".")}@thattime.app`,
    phone: "+44 7700 900000",
    active: base.status === "active",
    locations: ["loc1"],
    accessLevel,
    profile: { publicName: base.name.split(" ")[0], bio: "", visibleOnProfile: base.bookable, featured: false },
    schedule: { timezone: "Europe/London", weekly: defaultWeek(), timeOff: [] },
    permissions: ACCESS_PRESETS[accessLevel],
    payment: { type: "employee", payRate: "12.50", commission: 20, tips: true, payoutStatus: "Up to date" },
    rota: { thisWeekHours: 40, nextShift: "Tomorrow · 9:00–18:00", notes: "" },
    invite: { sentAt: "2026-05-02", acceptedAt: base.status === "active" ? "2026-05-03" : "" },
    ...base,
    ...extra,
  };
}

export const teamMembers: Staff[] = [
  member({ id: "s1", name: "Alex Morgan", role: "Senior stylist", systemRoles: ["Owner", "Staff"], status: "active", avatarColor: "bg-sky-100 text-sky-700", bookable: true, services: ["Classic haircut", "Blow dry"] }, { accessLevel: "owner", payment: { type: "employee", payRate: "", commission: 0, tips: true, payoutStatus: "Owner draw" } }),
  member({ id: "s2", name: "Priya Shah", role: "Stylist", systemRoles: ["Staff"], status: "active", avatarColor: "bg-violet-100 text-violet-700", bookable: true, services: ["Classic haircut", "Blow dry"] }),
  member({ id: "s3", name: "Jordan Lee", role: "Colourist", systemRoles: ["Staff"], status: "active", avatarColor: "bg-amber-100 text-amber-700", bookable: true, services: ["Root tint", "Colour consultation"] }, { payment: { type: "employee", payRate: "14.00", commission: 25, tips: true, payoutStatus: "Up to date" } }),
  member({ id: "s4", name: "Sam Rivera", role: "Barber", systemRoles: ["Staff"], status: "active", avatarColor: "bg-emerald-100 text-emerald-700", bookable: true, services: ["Classic haircut", "Beard trim", "Blow dry"] }, { schedule: { timezone: "Europe/London", weekly: defaultWeek(["Sun", "Mon"]), timeOff: [{ id: "to1", label: "Holiday", date: "22–26 Jun" }] } }),
  member({ id: "s5", name: "Nina Okafor", role: "Apprentice", systemRoles: ["Staff"], status: "needs_setup", avatarColor: "bg-rose-100 text-rose-700", bookable: false, services: [] }, { accessLevel: "basic", rota: { thisWeekHours: 0, nextShift: "Not scheduled", notes: "" } }),
  member({ id: "s6", name: "Tom Becker", role: "Barber", systemRoles: ["Manager", "Staff"], status: "active", avatarColor: "bg-slate-100 text-slate-700", bookable: true, services: ["Classic haircut", "Beard trim", "Blow dry"] }),
  member({ id: "s7", name: "Amara Nwosu", role: "Senior instructor", systemRoles: ["Manager", "Instructor"], status: "active", avatarColor: "bg-cyan-100 text-cyan-700", bookable: true, services: ["Beginner yoga"] }),
  member({ id: "s8", name: "Jamie Kowalski", role: "Yoga instructor", systemRoles: ["Instructor"], status: "active", avatarColor: "bg-lime-100 text-lime-700", bookable: true, services: ["Beginner yoga"] }, { payment: { type: "contractor", payRate: "30.00", commission: 0, tips: false, payoutStatus: "Invoices monthly" } }),
  member({ id: "s9", name: "Rachel Byrne", role: "Fitness trainer", systemRoles: ["Instructor"], status: "pending", avatarColor: "bg-orange-100 text-orange-700", bookable: false, services: [] }, { invite: { sentAt: "2026-06-08", acceptedAt: "" }, rota: { thisWeekHours: 0, nextShift: "Not scheduled", notes: "" } }),
  member({ id: "s10", name: "Tom Adeyemi", role: "Pilates instructor", systemRoles: ["Instructor"], status: "active", avatarColor: "bg-fuchsia-100 text-fuchsia-700", bookable: true, services: [] }, { payment: { type: "contractor", payRate: "28.00", commission: 0, tips: false, payoutStatus: "Up to date" } }),
  member({ id: "s11", name: "Priya Mehta", role: "Wellbeing coach", systemRoles: ["Instructor"], status: "needs_setup", avatarColor: "bg-teal-100 text-teal-700", bookable: false, services: [] }, { rota: { thisWeekHours: 0, nextShift: "Not scheduled", notes: "" } }),
];

export const demoPayRuns: PayRun[] = [
  {
    id: "run_jun_1",
    period: "1–14 Jun 2026",
    status: "draft",
    lines: [
      { staffId: "s2", wages: 500, commission: 168, tips: 42, adjustments: 0 },
      { staffId: "s3", wages: 560, commission: 245, tips: 61, adjustments: 0 },
      { staffId: "s4", wages: 500, commission: 132, tips: 38, adjustments: 0 },
      { staffId: "s6", wages: 500, commission: 154, tips: 47, adjustments: 0 },
      { staffId: "s8", wages: 360, commission: 0, tips: 0, adjustments: 0 },
    ],
  },
  {
    id: "run_may_2",
    period: "16–31 May 2026",
    status: "completed",
    lines: [
      { staffId: "s2", wages: 540, commission: 182, tips: 55, adjustments: 0 },
      { staffId: "s3", wages: 600, commission: 230, tips: 49, adjustments: -20 },
      { staffId: "s4", wages: 540, commission: 121, tips: 33, adjustments: 0 },
      { staffId: "s6", wages: 540, commission: 162, tips: 51, adjustments: 0 },
    ],
  },
  {
    id: "run_may_1",
    period: "1–15 May 2026",
    status: "completed",
    lines: [
      { staffId: "s2", wages: 540, commission: 150, tips: 40, adjustments: 0 },
      { staffId: "s3", wages: 600, commission: 210, tips: 45, adjustments: 0 },
      { staffId: "s4", wages: 540, commission: 140, tips: 30, adjustments: 0 },
    ],
  },
];

export const lineTotal = (l: PayRun["lines"][number]) => l.wages + l.commission + l.tips + l.adjustments;
export const runTotal = (r: PayRun) => r.lines.reduce((sum, l) => sum + lineTotal(l), 0);

export function summaryOf(m: Staff): TeamMemberSummary {
  return {
    id: m.id,
    name: m.name,
    role: m.role,
    systemRoles: m.systemRoles,
    status: m.status,
    avatarColor: m.avatarColor,
    bookable: m.bookable,
    services: m.services.length,
  };
}

/** List-view summary of the demo team (kept for existing imports). */
export const teamRoster: TeamMemberSummary[] = teamMembers.map(summaryOf);

export const STATUS_LABEL: Record<Staff["status"], string> = {
  active: "Active",
  pending: "Invite sent",
  needs_setup: "Needs setup",
  archived: "Archived",
};

export function initialsOf(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
