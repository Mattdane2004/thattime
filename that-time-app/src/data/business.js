// Business-level configuration that would normally come from onboarding.
// Services pick FROM these, not enter from scratch.

// Subscription plan for this business. Walkthroughs can flip this to 'solo'
// to preview the upgrade gate shown before adding team members (/team/upgrade).
export const businessPlan = 'team';

export const businessLocations = [
  { id: 'loc1', name: 'Salon Soho', address: '14 Greek Street' },
  { id: 'loc2', name: 'Salon Brixton', address: '4 Atlantic Rd' },
  { id: 'loc3', name: 'Salon Chelsea', address: '88 Kings Rd' },
];

export const defaultMobileProfile = {
  baseAddress: '14 Greek Street, Soho',
  radiusMiles: 10,
  feeType: 'flat', // 'flat' | 'perMile'
  feeAmount: 15,
  noticeValue: 2,
  noticeUnit: 'hours', // 'hours' | 'days'
  // Travel buffer added to the calendar around each booking — prevents
  // back-to-backs that don't account for the trip. Defaults inherit from
  // the staff member's profile but a class can override.
  travelBufferMin: 30,
};

export const remotePlatforms = [
  { key: 'zoom', label: 'Zoom', desc: 'zoom.us meeting link' },
  { key: 'meet', label: 'Google Meet', desc: 'meet.google.com link' },
  { key: 'phone', label: 'Phone call', desc: 'Client calls your number' },
  { key: 'teams', label: 'Microsoft Teams', desc: 'teams.microsoft.com link' },
  { key: 'custom', label: 'Other / custom link', desc: 'Paste your own meeting link' },
];
