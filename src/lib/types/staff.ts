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
  /** Can change their own working hours (gates the editable join-flow week). */
  scheduleSelfEdit: boolean;
  /** Can see everyone's shifts, not just their own. */
  viewTeamSchedule: boolean;
}

/**
 * Employee vs freelancer/chair-renter. Drives whether the owner sets a schedule
 * (freelancers self-schedule, so they're off the owner rota) and the direction
 * of pay (employees are paid; freelancers pay the owner rent/commission).
 */
export type MemberType = "employee" | "freelancer";

/** Which way commission flows: to the member (employee) or to the owner (chair-renter). */
export type CommissionDirection = "to_member" | "to_owner";

/**
 * Pay is built from independent components so a member can mix several (a low
 * chair rent AND a commission, say) and any of them can be left unset ("set up
 * later"). Settlement (bank details, payouts) is handled later via Stripe.
 */
export interface PayComponents {
  /** Fixed salary label, e.g. "2,400/mo" or "32,000/yr". */
  salary?: string;
  /** Hourly rate in £, e.g. "12.50". */
  hourly?: string;
  /** Commission on services delivered. */
  commission?: { rate: number; direction: CommissionDirection };
  /** Chair/room rent a freelancer pays the business. */
  chairRent?: { amount: string; frequency: "weekly" | "monthly" };
}

export interface StaffPayment {
  components: PayComponents;
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
  /** Employee vs freelancer/chair-renter — drives scheduling and pay direction. */
  memberType: MemberType;
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
