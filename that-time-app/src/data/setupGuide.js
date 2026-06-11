import {
  BadgeCheck,
  BookOpen,
  Building2,
  CalendarCheck2,
  Crown,
  FileText,
  LockKeyhole,
  Megaphone,
  Plug,
  Rocket,
  Scissors,
  Send,
  Settings2,
  Sparkles,
  Target,
  Trophy,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react';

export const setupLevels = [
  {
    key: 'founder',
    label: 'Founder',
    title: 'Get ready to take bookings',
    desc: 'The launch basics: profile, services, rules, and your first client booking.',
    icon: Rocket,
    tone: 'bg-gray-900 text-white',
    steps: [
      {
        key: 'business-profile',
        title: 'Complete your business profile',
        desc: 'Add the public details clients see before they book.',
        lesson: 'Identity, category, location, and booking page basics',
        time: '4 min',
        status: 'done',
        icon: Building2,
        to: '/soon/business-profile',
      },
      {
        key: 'services',
        title: 'Add your first services',
        desc: 'Turn your starter menu into real bookable offers.',
        lesson: 'Prices, durations, deposits, and service photos',
        time: '8 min',
        status: 'current',
        icon: Scissors,
        to: '/services',
      },
      {
        key: 'booking-rules',
        title: 'Set booking rules',
        desc: 'Choose lead time, cancellations, deposits, and who can book.',
        lesson: 'Policies that protect your calendar',
        time: '5 min',
        status: 'todo',
        icon: Settings2,
        to: '/soon/business-settings',
      },
      {
        key: 'first-booking',
        title: 'Get your first booking',
        desc: 'Preview the client flow, then share your booking page.',
        lesson: 'Testing the client journey before you go live',
        time: '3 min',
        status: 'todo',
        icon: CalendarCheck2,
        to: '/soon/first-booking',
      },
    ],
  },
  {
    key: 'operator',
    label: 'Operator',
    title: 'Keep the day moving',
    desc: 'Payments, calendars, reminders, and client records that keep the business moving.',
    icon: BadgeCheck,
    tone: 'bg-emerald-600 text-white',
    steps: [
      {
        key: 'payments',
        title: 'Connect payments',
        desc: 'Set up payouts, deposits, taxes, and accepted payment methods.',
        lesson: 'Taking money without manual follow-up',
        time: '6 min',
        status: 'todo',
        icon: Wallet,
        to: '/soon/payments',
      },
      {
        key: 'calendar-sync',
        title: 'Sync your calendar',
        desc: 'Bring appointments and availability into one source of truth.',
        lesson: 'Avoiding clashes across personal and work calendars',
        time: '4 min',
        status: 'locked',
        icon: CalendarCheck2,
        to: '/soon/calendar-sync',
      },
      {
        key: 'client-reminders',
        title: 'Turn on client reminders',
        desc: 'Send confirmations, reminders, and follow-ups automatically.',
        lesson: 'Reducing no-shows and support messages',
        time: '5 min',
        status: 'locked',
        icon: Send,
        to: '/notifications',
      },
      {
        key: 'client-import',
        title: 'Import clients and bookings',
        desc: 'Upload CSV files with your client and booking data.',
        lesson: 'Moving your existing records into That Time',
        time: '10 min',
        status: 'todo',
        icon: Users,
        to: '/setup/import',
      },
    ],
  },
  {
    key: 'team-builder',
    label: 'Team builder',
    title: 'Bring people into the business',
    desc: 'Team members, resources, forms, and the operating details that remove bottlenecks.',
    icon: Trophy,
    tone: 'bg-sky-600 text-white',
    steps: [
      {
        key: 'team-members',
        title: 'Add team members',
        desc: 'Invite staff or create profiles for anyone clients can book with.',
        lesson: 'Roles, permissions, profiles, and bookable hours',
        time: '7 min',
        status: 'locked',
        icon: UserPlus,
        to: '/team',
      },
      {
        key: 'service-staff',
        title: 'Assign staff to services',
        desc: 'Control who can deliver each service, class, bundle, or subscription.',
        lesson: 'Keeping availability accurate as your team grows',
        time: '5 min',
        status: 'locked',
        icon: Users,
        to: '/service/staff',
      },
      {
        key: 'resources',
        title: 'Add rooms and equipment',
        desc: 'Stop double-booking rooms, chairs, stations, and specialist kit.',
        lesson: 'Resource rules for busy schedules',
        time: '6 min',
        status: 'locked',
        icon: Plug,
        to: '/resources',
      },
      {
        key: 'forms',
        title: 'Add forms and intake questions',
        desc: 'Collect the information you need before each appointment.',
        lesson: 'Consent, prep, and service-specific questions',
        time: '6 min',
        status: 'locked',
        icon: FileText,
        to: '/forms',
      },
    ],
  },
  {
    key: 'growth',
    label: 'Growth',
    title: 'Find your next clients',
    desc: 'Campaigns, automation, reporting, and loyalty tools for a business that is ready to grow.',
    icon: Crown,
    tone: 'bg-violet-600 text-white',
    steps: [
      {
        key: 'campaign',
        title: 'Create your first campaign',
        desc: 'Send a targeted offer to a segment of clients.',
        lesson: 'Audience, offer, message, and measurement',
        time: '9 min',
        status: 'locked',
        icon: Megaphone,
        to: '/marketing',
      },
      {
        key: 'automation',
        title: 'Build a rebooking automation',
        desc: 'Prompt clients to come back at the right moment.',
        lesson: 'Triggers, timing, and client-friendly nudges',
        time: '8 min',
        status: 'locked',
        icon: Sparkles,
        to: '/soon/automations',
      },
      {
        key: 'performance',
        title: 'Review business performance',
        desc: 'Use bookings, revenue, and gaps to decide what to improve next.',
        lesson: 'Reading trends without getting lost in reports',
        time: '6 min',
        status: 'locked',
        icon: Target,
        to: '/soon/analytics',
      },
      {
        key: 'loyalty',
        title: 'Create a loyalty offer',
        desc: 'Reward repeat clients with a reason to book again.',
        lesson: 'Rewards, discounts, and retention loops',
        time: '7 min',
        status: 'locked',
        icon: BookOpen,
        to: '/soon/rewards',
      },
    ],
  },
];

export function getSetupSteps() {
  return setupLevels.flatMap((level) =>
    level.steps.map((step) => ({
      ...step,
      levelKey: level.key,
      levelLabel: level.label,
    })),
  );
}

export function getSetupProgress() {
  const steps = getSetupSteps();
  const completed = steps.filter((step) => step.status === 'done').length;
  const available = steps.filter((step) => step.status !== 'locked').length;
  const currentStep = steps.find((step) => step.status === 'current') || steps.find((step) => step.status === 'todo');
  const currentLevel = setupLevels.find((level) => level.key === currentStep?.levelKey) || setupLevels[0];

  return {
    total: steps.length,
    completed,
    available,
    percent: Math.round((completed / steps.length) * 100),
    currentStep,
    currentLevel,
  };
}

export function getSetupPreviewSteps(limit = 3) {
  return getSetupSteps()
    .filter((step) => step.status === 'current' || step.status === 'todo')
    .slice(0, limit);
}

export const setupStubItems = getSetupSteps()
  .filter((step) => step.to?.startsWith('/soon/'))
  .map((step) => ({
    key: step.key,
    label: step.title,
    desc: step.desc,
    icon: step.icon || LockKeyhole,
    to: step.to,
  }));
