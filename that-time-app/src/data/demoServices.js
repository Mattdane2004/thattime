// Pre-made services available from the Services list. Tapping one loads it
// into the draft so the user can edit every field from the dashboard.
// Shape matches `emptyDraft` in App.jsx.

import { defaultMobileProfile } from './business';
import { emptyServiceSettings } from './businessDefaults';
import { emptyClassDetails } from './offerTypes';

const baseSettings = () => emptyServiceSettings();

const base = {
  photos: [],
  locations: {
    inSalon: { enabled: true, locationIds: ['loc1'] },
    mobile: { enabled: false, ...defaultMobileProfile },
    remote: { enabled: false, platforms: [] },
  },
  depositEnabled: false,
  depositType: 'fixed',
  depositAmount: '',
  variants: [],
  ticketTypes: [],
  sessionPacks: [],
  products: [],
  related: [],
  resources: [],
  forms: [],
};

export const demoServices = [
  // ───── Services (1-to-1) ─────
  {
    ...base,
    id: 'svc_classic_haircut',
    type: 'service',
    name: 'Classic haircut',
    category: 'Hair',
    description: 'A precision cut and style tailored to you — consultation, wash, cut, and finish.',
    iconKey: 'scissors',
    locations: {
      inSalon: { enabled: true, locationIds: ['loc1', 'loc2'] },
      mobile: { enabled: false, ...defaultMobileProfile },
      remote: { enabled: false, platforms: [] },
    },
    staff: ['s1', 's2', 's4', 's6'],
    price: '35',
    durationMin: 45,
    status: 'published',
    settings: { ...baseSettings(), cancellation: { type: 'moderate', customText: '' } },
  },
  {
    ...base,
    id: 'svc_beard_trim',
    type: 'service',
    name: 'Beard trim',
    category: 'Barbering',
    description: 'Shape, tidy, and hot-towel finish. Great as an add-on or standalone.',
    iconKey: 'scissors',
    staff: ['s4', 's6'],
    price: '15',
    durationMin: 20,
    status: 'published',
    settings: baseSettings(),
  },
  {
    ...base,
    id: 'svc_colour_consult',
    type: 'service',
    name: 'Colour consultation',
    category: 'Colour',
    description: 'A 30-minute sit-down to plan your next colour — tone, depth, upkeep, cost.',
    iconKey: 'scissors',
    locations: {
      inSalon: { enabled: true, locationIds: ['loc1'] },
      mobile: { enabled: false, ...defaultMobileProfile },
      remote: { enabled: true, platforms: [{ key: 'zoom' }] },
    },
    staff: ['s3'],
    price: '',
    durationMin: 30,
    status: 'draft',
    settings: baseSettings(),
  },
  {
    ...base,
    id: 'svc_root_tint',
    type: 'service',
    name: 'Root tint',
    category: 'Colour',
    description: 'Regrowth tint application with a professional colour match and finish.',
    iconKey: 'scissors',
    locations: {
      inSalon: { enabled: true, locationIds: ['loc1', 'loc2'] },
      mobile: { enabled: false, ...defaultMobileProfile },
      remote: { enabled: false, platforms: [] },
    },
    staff: ['s2', 's3'],
    price: '55',
    durationMin: 75,
    status: 'published',
    settings: baseSettings(),
  },
  {
    ...base,
    id: 'svc_blow_dry',
    type: 'service',
    name: 'Blow dry',
    category: 'Hair',
    description: 'Wash, blow dry, and finish for smooth everyday styling or a polished event look.',
    iconKey: 'scissors',
    staff: ['s1', 's2', 's6'],
    price: '28',
    durationMin: 35,
    status: 'published',
    settings: baseSettings(),
  },
  {
    ...base,
    id: 'svc_lash_lift',
    type: 'service',
    name: 'Lash lift',
    category: 'Lashes',
    description: 'Lift and shape natural lashes for a longer, brighter look without extensions.',
    iconKey: 'sparkle',
    staff: ['s5'],
    price: '45',
    durationMin: 60,
    status: 'published',
    settings: baseSettings(),
  },
  {
    ...base,
    id: 'svc_brow_shape_tint',
    type: 'service',
    name: 'Brow shape & tint',
    category: 'Brows',
    description: 'Brow mapping, tidy, and tint for a defined natural finish.',
    iconKey: 'sparkle',
    staff: ['s5'],
    price: '30',
    durationMin: 35,
    status: 'published',
    settings: baseSettings(),
  },
  {
    ...base,
    id: 'svc_gel_manicure',
    type: 'service',
    name: 'Gel manicure',
    category: 'Nails',
    description: 'Cuticle work, nail shaping, gel colour, and glossy finish.',
    iconKey: 'sparkle',
    staff: ['s5'],
    price: '32',
    durationMin: 50,
    status: 'published',
    settings: baseSettings(),
  },
  {
    ...base,
    id: 'svc_biotin_injection',
    type: 'service',
    name: 'Biotin injection',
    category: 'Aesthetics',
    description: 'Quick wellness injection appointment with pre-treatment checks.',
    iconKey: 'sparkle',
    staff: ['s2', 's3'],
    price: '35',
    durationMin: 15,
    status: 'published',
    settings: baseSettings(),
  },
  {
    ...base,
    id: 'svc_skin_consultation',
    type: 'service',
    name: 'Skin consultation',
    category: 'Skin',
    description: 'Assessment, treatment planning, and product guidance for your skin goals.',
    iconKey: 'sparkle',
    locations: {
      inSalon: { enabled: true, locationIds: ['loc1'] },
      mobile: { enabled: false, ...defaultMobileProfile },
      remote: { enabled: true, platforms: [{ key: 'zoom' }] },
    },
    staff: ['s2', 's3'],
    price: '25',
    durationMin: 30,
    status: 'published',
    settings: baseSettings(),
  },
  {
    ...base,
    id: 'svc_relaxing_massage',
    type: 'service',
    name: 'Relaxing massage',
    category: 'Massage',
    description: 'A calming full-body massage focused on tension release and relaxation.',
    iconKey: 'sparkle',
    locations: {
      inSalon: { enabled: true, locationIds: ['loc1'] },
      mobile: { enabled: true, ...defaultMobileProfile },
      remote: { enabled: false, platforms: [] },
    },
    staff: ['s8'],
    price: '60',
    durationMin: 60,
    status: 'published',
    settings: baseSettings(),
  },
  {
    ...base,
    id: 'svc_pt_session',
    type: 'service',
    name: 'Personal training session',
    category: 'Fitness',
    description: 'One-to-one coaching session built around strength, movement, and confidence.',
    iconKey: 'class',
    locations: {
      inSalon: { enabled: true, locationIds: ['loc2'] },
      mobile: { enabled: true, ...defaultMobileProfile },
      remote: { enabled: true, platforms: [{ key: 'zoom' }] },
    },
    staff: ['s8'],
    price: '50',
    durationMin: 60,
    status: 'published',
    settings: baseSettings(),
  },

  // ───── Classes (1-to-many) ─────
  {
    ...base,
    id: 'cls_beginner_yoga',
    type: 'class',
    name: 'Beginner yoga',
    category: 'Fitness',
    description: '45 minutes of grounding, breath-led practice — designed for first-timers.',
    iconKey: 'class',
    staff: [],
    leadInstructor: 's8', // Jamie Kowalski — yoga instructor
    price: '15',
    durationMin: 45,
    status: 'published',
    ticketTypes: [],
    classDetails: {
      ...emptyClassDetails(),
      format: 'public',
      capacity: 12,
      minParticipants: 2,
      waitlistEnabled: true,
      schedule: { recurrence: 'weekly', time: '09:00', days: ['Mon', 'Wed', 'Fri'], date: '' },
    },
    settings: baseSettings(),
  },
  {
    ...base,
    id: 'cls_styling_workshop',
    type: 'class',
    name: 'Hair styling workshop',
    category: 'Hair',
    description: 'Hands-on session with our senior stylists. Saturdays only.',
    iconKey: 'class',
    staff: [],
    leadInstructor: 's7', // Amara Nwosu — senior instructor
    price: '45',
    durationMin: 120,
    status: 'draft',
    ticketTypes: [],
    classDetails: {
      ...emptyClassDetails(),
      format: 'public',
      capacity: 8,
      minParticipants: 2,
      waitlistEnabled: false,
      schedule: { recurrence: 'weekly', time: '10:00', days: ['Sat'], date: '' },
    },
    settings: baseSettings(),
  },

  // ───── Bundles ─────
  {
    ...base,
    id: 'bun_cut_colour',
    type: 'bundle',
    name: 'Cut + colour package',
    category: 'Hair',
    description: 'Full colour service with a cut and finish — book together, save 10%.',
    iconKey: 'bundle',
    staff: ['s3'],
    price: '85',
    durationMin: 180,
    status: 'published',
    includedServiceIds: ['svc_classic_haircut', 'svc_colour_consult'],
    discountPercent: 10,
    settings: baseSettings(),
  },

  // ───── Subscriptions ─────
  {
    ...base,
    id: 'sub_monthly_cuts',
    type: 'subscription',
    name: 'Monthly cuts membership',
    category: 'Hair',
    description: 'One haircut a month plus 20% off every add-on. Cancel anytime.',
    iconKey: 'subscription',
    staff: ['s1', 's2', 's4', 's6'],
    price: '40',
    durationMin: 45,
    status: 'published',
    recurrence: { interval: 'month', count: 1 },
    includedPerPeriod: 1,
    settings: baseSettings(),
  },
];

export const SERVICE_TYPES = [
  { key: 'service',      label: 'Services',      singular: 'service' },
  { key: 'class',        label: 'Classes',       singular: 'class' },
  { key: 'bundle',       label: 'Bundles',       singular: 'bundle' },
  { key: 'subscription', label: 'Subscriptions', singular: 'subscription' },
];

export const EMPTY_STATE_COPY = {
  service:      { body: 'Services are one-on-one appointments — haircuts, consultations, treatments.' },
  class:        { body: 'Classes are group sessions where multiple clients book the same slot.' },
  bundle:       { body: 'Bundles package services together at a discount.' },
  subscription: { body: 'Subscriptions give clients recurring access — memberships, monthly packages.' },
};

export const statusFor = (s) => (s.status === 'published' ? 'Active' : 'Draft');

export const metaFor = (s) => {
  const price = s.price ? `£${s.price}` : 'Free';
  if (s.type === 'class') {
    const capacity = s.classDetails?.capacity || s.capacity;
    return `${s.durationMin} min · ${price}${capacity ? ` · ${capacity} spots` : ''}`;
  }
  if (s.type === 'bundle') {
    const count = s.bundleDetails?.includedServiceIds?.length || s.includedServiceIds?.length || 0;
    return `${count} service${count === 1 ? '' : 's'} · ${price}`;
  }
  if (s.type === 'subscription') {
    const unit = s.subscriptionDetails?.billingPeriod || s.recurrence?.interval || 'month';
    return `${price} / ${unit}`;
  }
  return `${s.durationMin} min · ${price}`;
};
