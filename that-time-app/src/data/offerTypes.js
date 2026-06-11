export const OFFER_TYPES = {
  service: {
    label: 'Service',
    plural: 'Services',
    singular: 'service',
    noun: 'service',
    basicsHint: 'Give this service a name and a category.',
    namePlaceholder: 'e.g. Classic haircut',
    priceLabel: 'Price (£)',
    priceHint: 'How much, how long, and what to charge up front.',
    createLabel: 'Create service',
    dashboardTitleFallback: 'Untitled service',
  },
  class: {
    label: 'Class',
    plural: 'Classes',
    singular: 'class',
    noun: 'course',
    basicsHint: 'Give this course or training session a name and category.',
    namePlaceholder: 'e.g. Lip filler foundation course',
    priceLabel: 'Price per student (£)',
    priceHint: 'Set the course price, duration, and deposit.',
    createLabel: 'Create course',
    dashboardTitleFallback: 'Untitled course',
  },
  bundle: {
    label: 'Bundle',
    plural: 'Bundles',
    singular: 'bundle',
    noun: 'bundle',
    basicsHint: 'Give this bundle a name and a category.',
    namePlaceholder: 'e.g. Cut + colour package',
    createLabel: 'Create bundle',
    dashboardTitleFallback: 'Untitled bundle',
  },
  subscription: {
    label: 'Subscription',
    plural: 'Subscriptions',
    singular: 'subscription',
    noun: 'subscription',
    basicsHint: 'Give this membership a name and a category.',
    namePlaceholder: 'e.g. Monthly cuts membership',
    createLabel: 'Create subscription',
    dashboardTitleFallback: 'Untitled subscription',
  },
};

export const offerTypeMeta = (type) => OFFER_TYPES[type] || OFFER_TYPES.service;

export const emptyClassDetails = () => ({
  bookingStructure: 'seat_based', // seat_based | private_group
  visibilityMode: 'marketplace',  // marketplace | private_link
  classStructure: '',        // single_session | multi_session
  repeatSetting: '',         // one_off | repeats | one_intake | repeating_intake
  deliveryMethod: '',        // in_person | online | mixed

  // Legacy compatibility. Several existing routes still ask "is this public
  // or private"; derive/update this alongside bookingStructure where needed.
  format: null,
  visibility: { hidden: false },
  difficulty: 'all',          // 'all' | 'beginner' | 'intermediate' | 'advanced'

  // Single session/repeating occurrence data. Repeating single sessions are
  // booked one occurrence at a time.
  singleSession: {
    title: '',
    date: '',
    firstDate: '',
    startTime: '09:00',
    endTime: '10:00',
    repeatPattern: 'weekly',
    repeatEnd: { mode: 'none', value: '' },
  },

  // Multi-session courses are booked once as a complete course/intake.
  defaultSessionTime: { startTime: '09:00', endTime: '10:00' },
  courseSessions: [],
  // Session shape:
  //   { id, date, startTime, endTime, moduleName, locationTargetId,
  //     instructorIds, capacity, status, agendaItems: [] }
  intakeRepeat: {
    pattern: 'weekly',
    customLabel: '',
    end: { mode: 'none', value: '' },
  },

  // Legacy block-based repeat templates still render in old demo data and can
  // be used by dashboard tools to generate future occurrences.
  publicBookingMode: 'course',
  scheduleBlocks: [],

  capacity: 12,
  minParticipants: 1,
  bookingCloseTime: 'business_default',
  autoCancelIfBelowMin: false,
  autoCancelBeforeStart: { value: '24', unit: 'hours' },
  waitlistEnabled: true,
  waitlistLimit: '',
  allowRegularBookingsOutsideClassTimes: false,
  clientStaffChoiceRequired: false,
  publishWindow: {
    staffWeeksAhead: 8,
    clientWeeksAhead: 4,
  },
  seriesSettings: {
    requiresAllDates: true,
    cancellationMode: 'whole_series',
  },
  // Private group: one buyer books the whole class for their group.
  partySize: { min: 1, max: 1 },
  allowClientGroupSizeChoice: true,
  requireAttendeeNames: false,

  courseMaterials: [],
  // Material shape:
  //   {
  //     id, title, fileName, fileSize, mimeType, materialType,
  //     access: 'before_booking' | 'after_booking' | 'internal',
  //     notes, uploadedAt
  //   }
  availabilityWindows: [],

  // Staff assignments are keyed by delivery target:
  //   loc:loc1, online, mobile
  // Seat-based classes use leadInstructorId/supportingStaffIds.
  // Individual date/session overrides can be refined in the dashboard.
  // Private groups use privateStaffIds + assignmentMethod.
  staffAssignments: {},
  privateAssignmentMethod: 'business_assigns',
  remoteSettings: {
    hostingMode: 'per_location', // 'per_location' | 'single_host'
    sharedLink: '',
    perLocationLinks: {},
  },
  bookingSettings: {
    checkInEnabled: true,
    attendanceMode: 'per_session',
    collectEmergencyContact: false,
    allowStudentSubstitution: false,
    messageStudentsEnabled: true,
    rosterNotes: '',
    messageDraft: '',
  },
  modelSettings: {
    usesLiveModels: false,
    provider: 'business',
    priceMode: 'free',
    modelFee: '',
    approvalRequired: true,
    consentRequired: true,
    prepInstructions: '',
    treatmentArea: '',
    beforeAfterConsent: false,
    matchToSessions: false,
    marketplaceOptIn: false,
    candidateCriteria: {
      gender: 'all',
      requireAdult: true,
      ageMin: '18',
      ageMax: '',
      baselineTags: [],
      customRequirements: '',
    },
    mediaRequirements: {
      frontPhoto: true,
      sidePhoto: false,
      backPhoto: false,
      targetConfirmation: '',
      evidenceRequired: false,
      evidenceInstructions: '',
    },
    intakeRules: {
      modelsPerStudent: '1',
      applicationCap: '10',
      deadline: '',
    },
    safetyRules: {
      patchTestRequired: false,
      noShowFee: '',
    },
    applicationLink: 'that-time.app/models/apply/course',
  },
  certificateSettings: {
    enabled: false,
    certificateName: '',
    issueMode: 'completion',
    requireAttendance: true,
    requireAssessment: false,
    requireEvidenceUpload: false,
    uploadLabel: '',
    expiryMonths: '',
    notes: '',
  },
  pricingVariants: {
    duration: [],
    staff: [],
    location: [],
    intake: [],
    groupSize: [],
  },
  sessionOverrides: {},
  pricingType: 'fixed', // 'free' | 'fixed' | 'from' | 'poa'
  publicPrice: '',
  privatePrice: '',
  publicPriceModel: 'per_person',
  privatePriceModel: 'per_group',
  depositRefundable: false,
  calendarColor: '#7C3AED',
  nonRefundableBooking: false,
  wrapUpTimesEnabled: false,
  preventOnlineBooking: false,
  limitedOffer: {
    enabled: false,
    type: 'percent',
    amount: '',
    startDate: '',
    endDate: '',
  },
  hybridSeats: { inPerson: 12, stream: 30 },
  schedule: {
    recurrence: 'never',
    time: '09:00',
    date: '',
    days: ['Mon'],
    monthlyMode: 'dayOfWeek',
    monthlyOrdinal: '1st',
    monthlyWeekday: 'Mon',
    monthlyDayOfMonth: '1',
    customInterval: '1',
    customUnit: 'week',
    endMode: 'never',
    endSessions: '',
    endDate: '',
  },
});

export const emptyBundleDetails = () => ({
  bundleKind: 'services',
  includedServiceIds: [],
  quantity: 5,
  minimumSelections: 3,
  packageDiscountPercent: '',
  packageTiers: [{ minimumSelections: 3, discountPercent: '' }],
  priceMode: 'fixed',
  discountPercent: '',
  durationMode: 'sum',
  customDurationMin: 60,
  bookingBehavior: 'single_booking',
  serviceTimings: {},
});

export const emptySubscriptionDetails = () => ({
  subscriptionType: 'frequency',
  billingPeriod: 'month',
  benefitType: 'sessions',
  includedItemIds: [],
  includedProductIds: [],
  includedSessions: 1,
  unlimitedUsage: false,
  frequencyPeriod: 'month',
  cooldown: { enabled: false, value: '', unit: 'days' },
  storeCreditAmount: '',
  memberDiscountPercent: '',
  productDiscountPercent: '',
  accessRule: 'member_only',
  joiningFeeEnabled: false,
  joiningFee: '',
  minimumTermMonths: '',
  creditBonusEnabled: false,
  creditBonusPercent: '',
  creditSpendMode: 'all',
  cancellationNotice: { value: '', unit: 'days' },
  cancellationRule: 'cancel_anytime',
  pauseRule: { enabled: true, maxDays: '', noticeDays: '' },
  rollover: false,
});

export const wizardTotalFor = (type) =>
  ({ service: 4, class: 7, bundle: 4, subscription: 4 }[type] || 4);

export const wizardTotalForDraft = (draft = {}) => {
  if (draft.type !== 'class') return wizardTotalFor(draft.type);
  return 7;
};

export const basicsNextFor = (draft) => {
  const type = typeof draft === 'string' ? draft : draft?.type;
  if (type === 'bundle') return '/new/bundle-services';
  if (type === 'class') return '/new/class-participants';
  if (type === 'subscription') {
    const subType = typeof draft === 'object' ? draft?.subscriptionDetails?.subscriptionType : null;
    if (subType === 'frequency') return '/new/frequency-sessions';
    return '/new/subscription-benefits';
  }
  return '/new/locations';
};

export const anyLocationEnabled = (locations = {}) =>
  Object.values(locations).some((location) => location?.enabled);

export const billingPeriodLabel = (period) =>
  ({ week: 'week', month: 'month', quarter: 'quarter', year: 'year' }[period] || 'month');
