import { create } from "zustand";
import type { AccessLevel, PayRun, Staff, TimeOff, WeeklyScheduleDay } from "@/lib/types";
import { ACCESS_PRESETS, defaultWeek, demoPayRuns, teamMembers } from "@/lib/data/team";

// Team section state — full Staff records seeded from the demo roster so
// invites, schedule edits, permissions, and pay changes survive navigation
// within a session (same pattern as useAppStore; no persistence yet).

export interface InviteInput {
  name: string;
  email: string;
  role: string;
  memberType: "employee" | "freelancer";
  bookable: boolean;
  accessLevel: AccessLevel;
}

const AVATAR_COLORS = [
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-amber-100 text-amber-700",
  "bg-emerald-100 text-emerald-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

interface TeamState {
  members: Staff[];
  payRuns: PayRun[];
  inviteMember: (input: InviteInput) => Staff;
  updateMember: (id: string, patch: Partial<Staff>) => void;
  setAccessLevel: (id: string, level: AccessLevel) => void;
  togglePermission: (id: string, key: keyof Staff["permissions"]) => void;
  setWeeklyDay: (id: string, day: WeeklyScheduleDay["day"], patch: Partial<WeeklyScheduleDay>) => void;
  addTimeOff: (id: string, entry: Omit<TimeOff, "id">) => void;
  removeTimeOff: (id: string, timeOffId: string) => void;
  resendInvite: (id: string) => void;
  archiveMember: (id: string) => void;
  restoreMember: (id: string) => void;
  completePayRun: (runId: string) => void;
}

export const useTeamStore = create<TeamState>((set) => ({
  members: teamMembers,
  payRuns: demoPayRuns,

  inviteMember: (input) => {
    const created: Staff = {
      id: `s_${Math.random().toString(36).slice(2, 8)}`,
      name: input.name,
      email: input.email,
      phone: "",
      role: input.role || (input.memberType === "freelancer" ? "Freelancer" : "Team member"),
      memberType: input.memberType,
      systemRoles: ["Staff"],
      active: false,
      status: "pending",
      avatarColor: AVATAR_COLORS[input.name.length % AVATAR_COLORS.length],
      locations: ["loc1"],
      services: [],
      bookable: input.bookable,
      accessLevel: input.accessLevel,
      profile: { publicName: input.name.split(" ")[0], bio: "", visibleOnProfile: input.bookable, featured: false },
      schedule: { timezone: "Europe/London", weekly: defaultWeek(), timeOff: [] },
      permissions: ACCESS_PRESETS[input.accessLevel],
      payment: {
        // Pay is left unset at invite — the owner configures it later (skippable).
        components: {},
        tips: input.memberType !== "freelancer",
        payoutStatus: "Not set up",
      },
      rota: { thisWeekHours: 0, nextShift: "Not scheduled", notes: "" },
      invite: { sentAt: new Date().toISOString().slice(0, 10), acceptedAt: "" },
    };
    set((s) => ({ members: [...s.members, created] }));
    return created;
  },

  updateMember: (id, patch) =>
    set((s) => ({ members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),

  setAccessLevel: (id, level) =>
    set((s) => ({
      members: s.members.map((m) =>
        m.id === id ? { ...m, accessLevel: level, permissions: ACCESS_PRESETS[level] } : m,
      ),
    })),

  togglePermission: (id, key) =>
    set((s) => ({
      members: s.members.map((m) =>
        m.id === id ? { ...m, permissions: { ...m.permissions, [key]: !m.permissions[key] } } : m,
      ),
    })),

  setWeeklyDay: (id, day, patch) =>
    set((s) => ({
      members: s.members.map((m) =>
        m.id === id
          ? {
              ...m,
              schedule: {
                ...m.schedule,
                weekly: m.schedule.weekly.map((d) => (d.day === day ? { ...d, ...patch } : d)),
              },
            }
          : m,
      ),
    })),

  addTimeOff: (id, entry) =>
    set((s) => ({
      members: s.members.map((m) =>
        m.id === id
          ? {
              ...m,
              schedule: {
                ...m.schedule,
                timeOff: [...m.schedule.timeOff, { ...entry, id: `to_${Math.random().toString(36).slice(2, 8)}` }],
              },
            }
          : m,
      ),
    })),

  removeTimeOff: (id, timeOffId) =>
    set((s) => ({
      members: s.members.map((m) =>
        m.id === id
          ? { ...m, schedule: { ...m.schedule, timeOff: m.schedule.timeOff.filter((t) => t.id !== timeOffId) } }
          : m,
      ),
    })),

  resendInvite: (id) =>
    set((s) => ({
      members: s.members.map((m) =>
        m.id === id ? { ...m, invite: { ...m.invite, sentAt: new Date().toISOString().slice(0, 10) } } : m,
      ),
    })),

  archiveMember: (id) =>
    set((s) => ({
      members: s.members.map((m) =>
        m.id === id ? { ...m, status: "archived", active: false, bookable: false } : m,
      ),
    })),

  restoreMember: (id) =>
    set((s) => ({
      members: s.members.map((m) => (m.id === id ? { ...m, status: "active", active: true } : m)),
    })),

  completePayRun: (runId) =>
    set((s) => ({
      payRuns: s.payRuns.map((r) => (r.id === runId ? { ...r, status: "completed" } : r)),
    })),
}));
