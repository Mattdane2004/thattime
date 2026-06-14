"use client";

import { create } from "zustand";

/**
 * Which persona the business app is being viewed as. A prototype switcher
 * (header dropdown) flips this; in a real build it would be derived from the
 * signed-in user's access level. Drives the home dashboard composition and
 * gates staff out of business settings/setup.
 *
 * - owner: full business — analytics, team management, settings.
 * - solo:  single operator — personal analytics, no team management.
 * - staff: stripped back — their own day, schedule and earnings only.
 */
export type AppRole = "solo" | "owner" | "staff";

export const roleLabels: Record<AppRole, { label: string; sub: string }> = {
  owner: { label: "Owner", sub: "Full business — analytics, team & settings" },
  solo: { label: "Solo", sub: "Just you — personal dashboard, no team" },
  staff: { label: "Staff", sub: "Your day, schedule and bookings" },
};

interface RoleState {
  role: AppRole;
  setRole: (r: AppRole) => void;
}

// Default `owner` = the richest surface, matching today's home.
export const useRoleStore = create<RoleState>((set) => ({
  role: "owner",
  setRole: (role) => set({ role }),
}));
