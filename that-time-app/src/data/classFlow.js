import { businessLocations } from './business';
import { staffById } from './staff';

export const BOOKING_STRUCTURES = [
  { key: 'seat_based', label: 'Seat based class', desc: 'Individuals book their own spaces on the class.' },
  { key: 'private_group', label: 'Private group class', desc: 'One client books the whole class for their group.' },
];

export const CLASS_STRUCTURES = [
  { key: 'single_session', label: 'Single session', desc: 'One class occurrence. It can be one-off or repeat.' },
  { key: 'multi_session', label: 'Multi-session course', desc: 'Several sessions sold as one complete course or intake.' },
];

export const SINGLE_REPEAT_OPTIONS = [
  { key: 'one_off', label: 'One off', desc: 'One date and time.' },
  { key: 'repeats', label: 'Repeats', desc: 'Creates recurring occurrences clients book individually.' },
];

export const COURSE_REPEAT_OPTIONS = [
  { key: 'one_intake', label: 'One course intake', desc: 'One set of dates booked together.' },
  { key: 'repeating_intake', label: 'Repeating course intake', desc: 'The full course repeats as a future intake.' },
];

export const DELIVERY_METHODS = [
  { key: 'in_person', label: 'In person', desc: 'Hosted at one or more business locations.' },
  { key: 'online', label: 'Online', desc: 'Hosted virtually. Joining details can be added later.' },
  { key: 'mixed', label: 'Mixed', desc: 'Supports both in-person and online delivery.' },
  { key: 'mobile', label: 'Travel to client', desc: 'Hosted at the client location or another off-site venue.' },
];

export const CLASS_FORMATS = {
  public: 'Seat based class',
  private: 'Private group class',
  both: 'Seat based and private group',
};

export const bookingStructureFor = (details = {}) => {
  if (details.bookingStructure) return details.bookingStructure;
  if (details.format === 'private') return 'private_group';
  if (details.format === 'public' || details.format === 'both') return 'seat_based';
  return '';
};

export const bookingStructureLabel = (input) => {
  const key = typeof input === 'object' ? bookingStructureFor(input) : input;
  return BOOKING_STRUCTURES.find((item) => item.key === key)?.label || 'Booking type not set';
};

export const visibilityLabel = (key) =>
  key === 'marketplace' ? 'Public' : key ? 'Private' : 'Visibility not set';

export const classStructureLabel = (details = {}) => {
  const base = CLASS_STRUCTURES.find((item) => item.key === details.classStructure)?.label || 'Structure not set';
  if (!details.repeatSetting) return base;
  const repeat = [...SINGLE_REPEAT_OPTIONS, ...COURSE_REPEAT_OPTIONS].find((item) => item.key === details.repeatSetting)?.label;
  return repeat ? `${base} · ${repeat}` : base;
};

export const deliveryMethodLabel = (key) =>
  DELIVERY_METHODS.find((item) => item.key === key)?.label || 'Delivery not set';

export const isSeatBasedClass = (details = {}) => bookingStructureFor(details) === 'seat_based';

export const isPrivateGroupClass = (details = {}) => bookingStructureFor(details) === 'private_group';

export const isSingleSession = (details = {}) => details.classStructure === 'single_session';
export const isMultiSessionCourse = (details = {}) => details.classStructure === 'multi_session';
export const isRepeating = (details = {}) => ['repeats', 'repeating_intake'].includes(details.repeatSetting);

// Legacy aliases used by existing shared modules.
export const isPublicClass = (formatOrDetails) =>
  typeof formatOrDetails === 'object'
    ? isSeatBasedClass(formatOrDetails)
    : formatOrDetails === 'public' || formatOrDetails === 'both';

export const isPrivateClass = (formatOrDetails) =>
  typeof formatOrDetails === 'object'
    ? isPrivateGroupClass(formatOrDetails)
    : formatOrDetails === 'private' || formatOrDetails === 'both';

export function deliveryTargets(draft, route = 'any') {
  const details = draft.classDetails || {};
  const method = details.deliveryMethod;
  const targets = [];

  if (method === 'in_person' || method === 'mixed' || draft.locations?.inSalon?.enabled) {
    const ids = draft.locations?.inSalon?.locationIds?.length
      ? draft.locations.inSalon.locationIds
      : [];
    ids.forEach((id) => {
      const location = businessLocations.find((item) => item.id === id);
      targets.push({
        id: `loc:${id}`,
        type: 'location',
        label: location?.name || 'Location',
        desc: location?.address || 'Physical location',
        public: true,
        private: true,
      });
    });
  }

  if (method === 'online' || method === 'mixed' || draft.locations?.remote?.enabled) {
    targets.push({
      id: 'online',
      type: 'online',
      label: 'Online',
      desc: 'Virtual class',
      public: true,
      private: true,
    });
  }

  if (method === 'mobile' || method === 'mixed' || draft.locations?.mobile?.enabled) {
    targets.push({
      id: 'mobile',
      type: 'mobile',
      label: 'Travel to client',
      desc: 'Client location or off-site venue',
      public: false,
      private: true,
    });
  }

  return targets.filter((target) =>
    route === 'public' ? target.public : route === 'private' ? target.private : target.public || target.private,
  );
}

export function assignmentsFor(draft) {
  return draft.classDetails?.staffAssignments || {};
}

export function assignmentFor(draft, targetId) {
  return assignmentsFor(draft)[targetId] || {};
}

export function leadInstructorFor(draft, targetId) {
  const assignment = assignmentFor(draft, targetId);
  if (assignment.leadInstructorId) return assignment.leadInstructorId;
  if (assignment.publicLeadId) return assignment.publicLeadId;
  if (assignment.publicStaffIds?.[0]) return assignment.publicStaffIds[0];
  return '';
}

export function supportingStaffFor(draft, targetId) {
  const assignment = assignmentFor(draft, targetId);
  return assignment.supportingStaffIds || assignment.publicStaffIds?.filter((id) => id !== leadInstructorFor(draft, targetId)) || [];
}

export function publicStaffIdsFor(draft, targetId) {
  const lead = leadInstructorFor(draft, targetId);
  const support = supportingStaffFor(draft, targetId);
  return [lead, ...support].filter(Boolean);
}

export function privateStaffIdsFor(draft, targetId = 'private') {
  const assignment = assignmentFor(draft, targetId);
  return assignment.privateStaffIds || draft.classDetails?.eligibleStaffIds || draft.staff || [];
}

export function priceForRoute(draft, route) {
  const details = draft.classDetails || {};
  if (route === 'private') return details.privatePrice || draft.price;
  return details.publicPrice || draft.price;
}

export function hasValidClassPrice(draft, route) {
  const details = draft.classDetails || {};
  if (details.pricingType === 'free') return true;
  if (details.pricingType === 'poa') return true;
  return Boolean(priceForRoute(draft, route));
}

export function validCourseSessions(details = {}) {
  return (details.courseSessions || []).filter((session) =>
    Boolean(
      (session.date || session.offsetDays !== '' && session.offsetDays !== undefined) &&
      session.startTime &&
      session.endTime &&
      session.status !== 'cancelled',
    ),
  );
}

export function hasValidSingleSession(details = {}) {
  const session = details.singleSession || {};
  if (details.repeatSetting === 'repeats') {
    return Boolean(session.firstDate && session.startTime && session.endTime && session.repeatPattern);
  }
  return Boolean(session.date && session.startTime && session.endTime);
}

export function hasValidPublicSchedule(details = {}) {
  if (details.classStructure === 'single_session') return hasValidSingleSession(details);
  if (details.classStructure === 'multi_session') {
    const hasSessions = validCourseSessions(details).length > 0;
    if (details.repeatSetting === 'repeating_intake') {
      return hasSessions && Boolean(details.intakeRepeat?.pattern);
    }
    return hasSessions;
  }

  // Legacy fallback.
  if (validCourseSessions(details).length > 0) return true;
  return (details.scheduleBlocks || []).some((block) => (block.days || []).length > 0 && block.time);
}

export function hasValidPublicParticipants(details = {}) {
  const max = Number(details.capacity);
  const min = Number(details.minParticipants);
  return max > 0 && min > 0 && max >= min;
}

export function hasValidPrivateGroupSize(details = {}) {
  const party = details.partySize || {};
  const min = Number(party.min);
  const max = Number(party.max);
  return min > 0 && max >= min;
}

export function classRouteSummary(draft) {
  const details = draft.classDetails || {};
  const seatBased = isSeatBasedClass(details);
  const privateGroup = isPrivateGroupClass(details);
  const targets = deliveryTargets(draft);
  const publicTargets = deliveryTargets(draft, 'public');
  const hasNameCategory = Boolean(draft.name?.trim() && draft.category);
  const hasBookingVisibility = Boolean(bookingStructureFor(details) && details.visibilityMode);
  const hasClassStructure = Boolean(details.classStructure && details.repeatSetting);
  const hasDelivery = Boolean(details.deliveryMethod && (['online', 'mobile'].includes(details.deliveryMethod) || targets.length > 0));
  const hasStaff = hasValidStaff(draft);
  const hasSchedule = hasValidPublicSchedule(details);
  const hasAttendance = seatBased ? hasValidPublicParticipants(details) : hasValidPrivateGroupSize(details);
  const hasPrice = privateGroup ? hasValidClassPrice(draft, 'private') : hasValidClassPrice(draft, 'public');

  return {
    publicReady: seatBased && hasNameCategory && hasBookingVisibility && hasClassStructure && hasDelivery && hasStaff && hasSchedule && hasAttendance && hasPrice,
    privateReady: privateGroup && hasNameCategory && hasBookingVisibility && hasClassStructure && hasDelivery && hasStaff && hasAttendance && hasPrice,
    canPublish: hasNameCategory && hasBookingVisibility && hasClassStructure && hasDelivery && hasStaff && hasSchedule && hasAttendance && hasPrice,
    publicTargets,
    privateTargets: targets,
    hasNameCategory,
    hasBookingVisibility,
    hasClassStructure,
    hasDelivery,
    publicStaffReady: hasStaff,
    privateStaffReady: hasStaff,
    hasPublicSchedule: hasSchedule,
    hasPublicCapacity: hasAttendance,
    hasPublicParticipants: hasAttendance,
    hasDuration: Number(draft.durationMin) > 0,
    hasValidParty: hasValidPrivateGroupSize(details),
    hasPublicPrice: hasPrice,
    hasPrivatePrice: hasPrice,
  };
}

export function classPublishIssues(draft) {
  const details = draft.classDetails || {};
  const issues = [];

  if (!draft.name?.trim()) issues.push({ key: 'name', label: 'Add a class name', path: '/new/basics' });
  if (!draft.category) issues.push({ key: 'category', label: 'Choose a category', path: '/new/basics' });
  if (!details.classStructure) issues.push({ key: 'structure-kind', label: 'Select class date or dates', path: '/new/class-schedule' });
  if (!bookingStructureFor(details)) issues.push({ key: 'booking', label: 'Choose how attendees book', path: '/new/class-participants' });
  if (!details.visibilityMode) issues.push({ key: 'visibility', label: 'Choose public or private listing', path: '/new/basics' });
  if (!details.repeatSetting) issues.push({ key: 'repeat', label: 'Choose whether it repeats', path: '/new/class-schedule' });
  if (!details.deliveryMethod || (!['online', 'mobile'].includes(details.deliveryMethod) && deliveryTargets(draft).length === 0)) {
    issues.push({ key: 'delivery', label: 'Choose delivery method and locations', path: '/new/class-location' });
  }

  if (!hasValidStaff(draft)) issues.push({ key: 'staff', label: 'Assign required staff', path: '/new/class-staff' });
  if (!hasValidPublicSchedule(details)) issues.push({ key: 'schedule', label: 'Add required schedule details', path: '/new/class-schedule' });
  if (isSeatBasedClass(details) && !hasValidPublicParticipants(details)) issues.push({ key: 'capacity', label: 'Set attendee limits', path: '/new/class-participants' });
  if (isPrivateGroupClass(details) && !hasValidPrivateGroupSize(details)) issues.push({ key: 'group-size', label: 'Set group size limits', path: '/new/class-participants' });
  if (!hasValidClassPrice(draft, isPrivateGroupClass(details) ? 'private' : 'public')) issues.push({ key: 'price', label: 'Set class pricing', path: '/new/price' });

  return issues;
}

export function classReadiness(draft) {
  const summary = classRouteSummary(draft);
  const issues = classPublishIssues(draft);
  return { ...summary, issues, canPublish: issues.length === 0 };
}

export function targetStaffLabel(draft, target, route = 'public') {
  if (route === 'private') {
    const ids = privateStaffIdsFor(draft, target.id);
    if (ids.length === 0) return 'No eligible staff';
    if (ids.length === 1) return staffById(ids[0])?.name || '1 eligible staff';
    return `${ids.length} eligible staff`;
  }
  const lead = leadInstructorFor(draft, target.id);
  const support = supportingStaffFor(draft, target.id);
  if (!lead) return 'No lead assigned';
  const leadName = staffById(lead)?.name || 'Lead assigned';
  return support.length ? `${leadName} + ${support.length} support` : leadName;
}

export function hasValidStaff(draft) {
  const details = draft.classDetails || {};
  if (isPrivateGroupClass(details)) {
    return privateStaffIdsFor(draft, 'private').length > 0;
  }
  const targets = deliveryTargets(draft, 'public');
  return targets.length > 0 && targets.every((target) => Boolean(leadInstructorFor(draft, target.id)));
}
