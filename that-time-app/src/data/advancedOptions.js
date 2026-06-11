// Default state and chip helpers for the 8-section Advanced Options flow
// on a class. Each section has its own slice. Chip helpers compute the
// right-hand status text shown on the Advanced Options list screen.

export const emptyAdvancedOptions = () => ({
  // ── Section 1 ─────────────────────────────────────────────────────────
  pricingTiers: {
    earlyBird: {
      enabled: false,
      price: '',
      discountType: 'fixed',   // 'fixed' | 'percent'
      percentOff: '',
      windowValue: '',
      windowUnit: 'days',      // 'hours' | 'days' | 'weeks'
    },
    member: {
      enabled: false,
      price: '',
    },
    course: {
      enabled: false,
      price: '',
      sessionCount: '',
    },
    priorityRule: 'lowest',    // 'lowest' | 'member'
  },

  // ── Section 2 ─────────────────────────────────────────────────────────
  // [{ staffId, showOnPublic: bool }]
  additionalStaff: [],

  // ── Section 3 ─────────────────────────────────────────────────────────
  bookingRules: {
    open:    { override: false, value: '', unit: 'weeks' },   // hours|days|weeks
    close:   { override: false, value: '', unit: 'hours' },   // minutes|hours|days
    cancel:  { override: false, value: '', unit: 'hours' },   // hours|days
    lateFee: { enabled: false, type: 'fixed', amount: '' },   // fixed|percent
  },

  // ── Section 4 ─────────────────────────────────────────────────────────
  requirements: {
    difficulty: 'none',                                        // none|beginner|intermediate|advanced
    age:           { enabled: false, min: '', max: '' },
    prerequisites: { enabled: false, classIds: [] },
    bring:         { enabled: false, items: [] },
    qualification: { enabled: false, text: '' },
    insurance:     { enabled: false, uploadRequired: false, text: '' },
    certificate:   { enabled: false, uploadRequired: false, text: '' },
    declarations:  { enabled: false, text: '' },
    equipment:     { enabled: false, items: [] },
    preparation:   { enabled: false, text: '' },
    eligibility:   { enabled: false, text: '' },
  },

  // ── Section 5 ─────────────────────────────────────────────────────────
  visibility: 'public',          // 'public' | 'private'
  inviteUrl: '',                 // generated when first set to private

  // ── Section 6 ─────────────────────────────────────────────────────────
  onlineLink: {
    url: '',
    timing: '24h',               // 'immediate' | '24h' | '1h' | 'custom'
    customValue: '',
    customUnit: 'hours',         // 'minutes' | 'hours' | 'days'
  },

  // ── Section 7 ─────────────────────────────────────────────────────────
  // [{ id, sendTiming: 'on-booking' | 'days-before' | 'check-in', daysValue: '' }]
  classForms: [],

  // ── Section 8 ─────────────────────────────────────────────────────────
  classNotifications: {
    bookingConfirmation: { override: false, message: '' },
    reminder:            { override: false, message: '', timingValue: '24', timingUnit: 'hours' },
    cancellation:        { override: false, message: '' },
    minimumNotMet:       { override: false, message: '' },
    waitlistSpot:        { override: false, message: '' },
  },
});

// ── Chip helpers ───────────────────────────────────────────────────────────
// Each returns the string shown on the right-hand side of the section row.
// "Not set" / "Inherited" / "Public" indicate the default/empty state.

export function pricingTiersChip(ao) {
  const t = ao?.pricingTiers || {};
  const count =
    (t.earlyBird?.enabled ? 1 : 0) +
    (t.member?.enabled ? 1 : 0) +
    (t.course?.enabled ? 1 : 0);
  return count === 0 ? 'Not set' : `${count} tier${count === 1 ? '' : 's'} active`;
}

export function additionalStaffChip(ao) {
  const n = (ao?.additionalStaff || []).length;
  return n === 0 ? 'Not set' : `${n} staff added`;
}

export function bookingRulesChip(ao) {
  const r = ao?.bookingRules || {};
  const overrides =
    (r.open?.override   ? 1 : 0) +
    (r.close?.override  ? 1 : 0) +
    (r.cancel?.override ? 1 : 0);
  return overrides === 0 ? 'Inherited' : `${overrides} rule${overrides === 1 ? '' : 's'} overridden`;
}

export function requirementsChip(ao) {
  const r = ao?.requirements || {};
  let count = 0;
  if (r.difficulty && r.difficulty !== 'none') count++;
  if (r.age?.enabled) count++;
  if (r.qualification?.enabled) count++;
  if (r.insurance?.enabled) count++;
  if (r.declarations?.enabled) count++;
  if (r.preparation?.enabled) count++;
  if (r.eligibility?.enabled) count++;
  return count === 0 ? 'Not set' : `${count} attribute${count === 1 ? '' : 's'} set`;
}

export function visibilityChip(ao) {
  return ao?.visibility === 'private' ? 'Private' : 'Public';
}

export function onlineLinkChip(ao) {
  return ao?.onlineLink?.url ? 'Link added' : 'Not set';
}

export function formsChip(ao) {
  const n = (ao?.classForms || []).length;
  return n === 0 ? 'Not set' : `${n} form${n === 1 ? '' : 's'} attached`;
}

export function notificationsChip(ao) {
  const n = ao?.classNotifications || {};
  const overrides = Object.values(n).filter((x) => x?.override).length;
  return overrides === 0 ? 'Inherited' : `${overrides} overridden`;
}

// Whether the "Online class link" row should appear in the list.
export const hasOnlineLocation = (draft) => Boolean(draft?.locations?.remote?.enabled);

// "Inherited" / "Not set" / "Public" are the three muted defaults.
export const isMutedChip = (text) =>
  text === 'Not set' || text === 'Inherited' || text === 'Public';
