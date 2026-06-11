// Mock availability calculator for the class wizard's Staff step.
//
// In production, availability is computed by checking each generated session
// date against the staff member's existing bookings. Here we hard-code a
// small set of conflicts per staff member so designers can see all three UI
// states (Available / N conflicts / Unavailable) without needing real
// booking data.
//
// The schedule's recurrence is the only thing that affects classification:
//   - one-off (recurrence: 'never')   → any conflict ⇒ Unavailable
//   - recurring                       → some ⇒ partial, all ⇒ Unavailable

// ── Mock conflict ledger ──────────────────────────────────────────────────
// Each entry is a fake date the staff member is already booked elsewhere
// during the class slot. Keep this short and intentional so the three UI
// states are visible across the wizard.
const MOCK_CONFLICTS = {
  // Salon staff — generally not used for classes but included for sanity
  s1: [],
  s2: [{ date: '2025-05-21', label: 'Tue 21 May' }],
  s3: [],
  s4: [],
  s5: [],
  s6: [],

  // Instructors — varied so the chip designs are testable
  s7:  [],                                                        // Amara — fully available
  s8:  [{ date: '2025-05-21', label: 'Tue 21 May' }],             // Jamie — single clash (one-off → unavailable, recurring → 1 conflict)
  s9:  [
    { date: '2025-05-19', label: 'Mon 19 May' },
    { date: '2025-05-26', label: 'Mon 26 May' },
  ],                                                              // Rachel — 2 conflicts
  s10: [],                                                        // Tom Adeyemi — fully available
  s11: [
    { date: '2025-05-19', label: 'Mon 19 May' },
    { date: '2025-05-21', label: 'Wed 21 May' },
    { date: '2025-05-23', label: 'Fri 23 May' },
    { date: '2025-05-26', label: 'Mon 26 May' },
    { date: '2025-05-28', label: 'Wed 28 May' },
    { date: '2025-05-30', label: 'Fri 30 May' },
  ],                                                              // Priya Mehta — clashes on every session
};

// In production the session count is derived from the schedule (recurrence
// + endMode). For mocks we assume a fixed series length so the partial /
// unavailable boundary is meaningful.
const MOCK_SESSION_COUNT = 6;

const isRecurring = (schedule) =>
  Boolean(schedule?.recurrence && schedule.recurrence !== 'never');

// ── Public API ────────────────────────────────────────────────────────────

// Returns one of three states for a staff member against a class schedule:
//   { status: 'available'   | 'partial' | 'unavailable',
//     conflicts: [{ date, label }] }
//
// `partial` only applies to recurring classes. One-off classes are binary.
export function staffAvailability(staffId, schedule) {
  const conflicts = MOCK_CONFLICTS[staffId] || [];

  if (!isRecurring(schedule)) {
    return {
      status: conflicts.length > 0 ? 'unavailable' : 'available',
      conflicts,
    };
  }

  if (conflicts.length === 0)              return { status: 'available',   conflicts: [] };
  if (conflicts.length >= MOCK_SESSION_COUNT) return { status: 'unavailable', conflicts };
  return { status: 'partial', conflicts };
}

// Friendly chip label for the three states. Recurring partial shows the
// number of conflicts so designers can see the dynamic copy.
export function availabilityLabel({ status, conflicts }, schedule) {
  if (status === 'available')   return 'Available';
  if (status === 'unavailable') return 'Unavailable';
  // partial — only on recurring classes
  void schedule; // reserved for future use; kept for symmetry with the spec
  return `${conflicts.length} conflict${conflicts.length === 1 ? '' : 's'}`;
}
