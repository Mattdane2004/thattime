// ── Team / staff domain ──────────────────────────────────────────────
// Mirrors the records in the legacy that-time-app src/data/staff.js.
// `role` is the human-readable job title; `systemRoles` gate permissions
// and class-teaching eligibility (only "Instructor" can lead a class).

export type SystemRole = "Owner" | "Manager" | "Instructor" | "Staff";

export type StaffStatus = "active" | "pending" | "needs_setup" | "archived";

/** Workspace access level — a preset over the per-area permission flags. */
export type AccessLevel = "basic" | "low" | "medium" | "high" | "owner";

export type Weekday = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface WeeklyScheduleDay {
  day: Weekday;
  enabled: boolean;
  start: string; // "HH:MM"
  end: string; // "HH:MM"
}

export interface TimeOff {
  id: string;
  label: string;
  date: string;
}

/** One line in a pay run — a member's earnings for the period. */
export interface PayRunLine {
  staffId: string;
  wages: number;
  commission: number;
  tips: number;
  adjustments: number;
}

export type PayRunStatus = "draft" | "completed";

export interface PayRun {
  id: string;
  period: string; // e.g. "1–14 Jun 2026"
  status: PayRunStatus;
  lines: PayRunLine[];
}

export interface StaffSchedule {
  timezone: string;
  weekly: WeeklyScheduleDay[];
  timeOff: TimeOff[];
}

export interface StaffProfile {
  publicName: string;
  bio: string;
  visibleOnProfile: boolean;
  featured: boolean;
}

/** Per-area access flags gating what a member can see/do in the app. */
export interface StaffPermissions {
  calendar: boolean;
  bookings: boolean;
  clients: boolean;
  services: boolean;
  payments: boolean;
  team: boolean;
  reports: boolean;
  settings: boolean;
}

export interface StaffPayment {
  type: "employee" | "contractor";
  payRate: string;
  commission: number;
  tips: boolean;
  payoutStatus: string;
}

export interface StaffRota {
  thisWeekHours: number;
  nextShift: string;
  notes: string;
}

export interface StaffInvite {
  sentAt: string;
  acceptedAt: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  /** Human-readable job title shown under the name. */
  role: string;
  systemRoles: SystemRole[];
  active: boolean;
  status: StaffStatus;
  /** Tailwind utility pair for the avatar chip, e.g. "bg-sky-100 text-sky-700". */
  avatarColor: string;
  /** BusinessLocation ids this member works at. */
  locations: string[];
  /** Service names this member can deliver. */
  services: string[];
  bookable: boolean;
  accessLevel: AccessLevel;
  profile: StaffProfile;
  schedule: StaffSchedule;
  permissions: StaffPermissions;
  payment: StaffPayment;
  rota: StaffRota;
  invite: StaffInvite;
}
