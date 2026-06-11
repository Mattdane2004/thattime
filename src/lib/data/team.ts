// Demo roster for the Team screen — ported (typed) from the legacy
// that-time-app src/data/staff.js. The Team list view needs only a summary
// of each member; this picks the list-relevant fields off the shared Staff
// contract (so SystemRole / StaffStatus stay type-checked) plus a service count.
import type { Staff } from "@/lib/types";

export type TeamMemberSummary = Pick<
  Staff,
  "id" | "name" | "role" | "systemRoles" | "status" | "avatarColor" | "bookable"
> & { services: number };

export const teamRoster: TeamMemberSummary[] = [
  { id: "s1", name: "Alex Morgan", role: "Senior stylist", systemRoles: ["Staff"], status: "active", avatarColor: "bg-sky-100 text-sky-700", services: 2, bookable: true },
  { id: "s2", name: "Priya Shah", role: "Stylist", systemRoles: ["Staff"], status: "active", avatarColor: "bg-violet-100 text-violet-700", services: 2, bookable: true },
  { id: "s3", name: "Jordan Lee", role: "Colourist", systemRoles: ["Staff"], status: "active", avatarColor: "bg-amber-100 text-amber-700", services: 2, bookable: true },
  { id: "s4", name: "Sam Rivera", role: "Barber", systemRoles: ["Staff"], status: "active", avatarColor: "bg-emerald-100 text-emerald-700", services: 3, bookable: true },
  { id: "s5", name: "Nina Okafor", role: "Apprentice", systemRoles: ["Staff"], status: "needs_setup", avatarColor: "bg-rose-100 text-rose-700", services: 0, bookable: false },
  { id: "s6", name: "Tom Becker", role: "Barber", systemRoles: ["Manager", "Staff"], status: "active", avatarColor: "bg-slate-100 text-slate-700", services: 3, bookable: true },
  { id: "s7", name: "Amara Nwosu", role: "Senior instructor", systemRoles: ["Manager", "Instructor"], status: "active", avatarColor: "bg-cyan-100 text-cyan-700", services: 1, bookable: true },
  { id: "s8", name: "Jamie Kowalski", role: "Yoga instructor", systemRoles: ["Instructor"], status: "active", avatarColor: "bg-lime-100 text-lime-700", services: 1, bookable: true },
  { id: "s9", name: "Rachel Byrne", role: "Fitness trainer", systemRoles: ["Instructor"], status: "pending", avatarColor: "bg-orange-100 text-orange-700", services: 0, bookable: false },
  { id: "s10", name: "Tom Adeyemi", role: "Pilates instructor", systemRoles: ["Instructor"], status: "active", avatarColor: "bg-fuchsia-100 text-fuchsia-700", services: 0, bookable: true },
  { id: "s11", name: "Priya Mehta", role: "Wellbeing coach", systemRoles: ["Instructor"], status: "needs_setup", avatarColor: "bg-teal-100 text-teal-700", services: 0, bookable: false },
];

export const STATUS_LABEL: Record<TeamMemberSummary["status"], string> = {
  active: "Active",
  pending: "Invite sent",
  needs_setup: "Needs setup",
};

export function initialsOf(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}
