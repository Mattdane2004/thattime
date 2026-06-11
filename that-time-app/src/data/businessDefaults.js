// Business-level defaults. Service settings inherit from here unless overridden.

export const businessDefaults = {
  // Section 2 — Booking rules
  leadTime: { value: 24, unit: 'hours' },
  maxAdvance: { value: 3, unit: 'months' },
  buffer: { before: 0, after: 10 },
  cancellation: { type: 'moderate', customText: '' },

  // Section 3 — Rescheduling
  rescheduleLimit: null, // null = unlimited

  // Section 5 — Payment
  paymentMethods: { card: true, cash: true, transfer: false, bnpl: false },
  deposit: {
    required: false,
    amount: '',
    unit: '£',
    whenCharged: 'booking',
    daysBefore: 0,
  },

};

// A fresh, service-level settings object.
// Inheritable fields default to null (= inherit). Non-inheritable have real defaults.
export const emptyServiceSettings = () => ({
  // Section 1 — service-specific, no inheritance
  onlineBooking: true,
  whoCanBook: 'anyone',
  prescriptionRequired: false,

  // Section 2 — inheritable
  leadTime: null,
  maxAdvance: null,
  buffer: null,
  cancellation: null,

  // Section 3
  clientReschedulingEnabled: true,
  rescheduleLimit: null,

  // Section 5
  paymentMethods: null,
  deposit: null,
  payOnArrival: false,
  payAfterService: false,
});

export const effective = (overrideValue, businessDefault) =>
  overrideValue ?? businessDefault;
