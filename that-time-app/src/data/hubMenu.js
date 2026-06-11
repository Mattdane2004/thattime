import {
  Scissors,
  Package,
  Users,
  MapPin,
  Wallet,
  BarChart3,
  Box,
  FileText,
  Building2,
  Settings2,
  Plug,
  Megaphone,
  Send,
  Zap,
  Star,
  Gift,
  Tag,
  BadgePercent,
  ClipboardCheck,
  CircleUser,
  CreditCard,
  Share2,
  Bell,
  Database,
  Sliders,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { setupStubItems } from './setupGuide';

// ────────── BUSINESS TAB ──────────

// Primary operations grid — things touched day-to-day.
export const operationsItems = [
  { key: 'services',   label: 'Services',   desc: 'Services, classes, bundles', icon: Scissors,   to: '/services' },
  { key: 'products',   label: 'Products',   desc: 'Internal & retail library',  icon: Package,    to: '/soon/products-library' },
  { key: 'team',       label: 'Team',       desc: 'Staff, roles, hours',        icon: Users,      to: '/team' },
  { key: 'locations',  label: 'Locations',  desc: 'Multi-site management',      icon: MapPin,     to: '/soon/locations' },
  { key: 'payments',   label: 'Payments',   desc: 'Transactions, refunds, tax', icon: Wallet,     to: '/soon/payments' },
  { key: 'analytics',  label: 'Analytics',  desc: 'Performance & opportunities',icon: BarChart3,  to: '/soon/analytics' },
  { key: 'notifications', label: 'Notifications', desc: 'Client messages & reminders', icon: Bell, to: '/notifications' },
  { key: 'resources',  label: 'Resources',  desc: 'Rooms & equipment library',  icon: Box,        to: '/soon/resources-library' },
  { key: 'forms',      label: 'Forms',      desc: 'Templates & builder',        icon: FileText,   to: '/soon/forms-library' },
];

// Set-once items grouped in a list card.
export const setupItems = [
  { key: 'setup-guide',       label: 'Setup guide',       desc: 'Guided setup & learning',    icon: ClipboardCheck, to: '/setup' },
  { key: 'business-profile',  label: 'Business profile',  desc: 'Public identity clients see', icon: Building2, to: '/soon/business-profile' },
  { key: 'business-settings', label: 'Business settings', desc: 'Booking rules & policies',    icon: Settings2, to: '/soon/business-settings' },
  { key: 'import-data',       label: 'Import data',       desc: 'Clients & bookings from CSV', icon: Database,  to: '/setup/import' },
  { key: 'integrations',      label: 'Integrations',      desc: 'Stripe, Calendar, payments',  icon: Plug,      to: '/soon/integrations' },
];

// Marketing entry — shown as a single feature card on the Business tab.
export const marketingEntry = {
  key: 'marketing',
  label: 'Marketing',
  desc: 'Campaigns, automations, rewards',
  icon: Megaphone,
  to: '/marketing',
};

// ────────── MARKETING HUB ──────────

export const marketingGroups = [
  {
    key: 'engage',
    title: 'Engage',
    items: [
      { key: 'campaigns',   label: 'Campaigns',       desc: 'Targeted promos & announcements',     icon: Megaphone, to: '/soon/campaigns' },
      { key: 'blasts',      label: 'Blast campaigns', desc: 'One-off broadcasts to segments',      icon: Send,      to: '/soon/blasts' },
      { key: 'automations', label: 'Automations',     desc: 'Triggered flows — birthdays, win-back', icon: Zap,     to: '/soon/automations' },
      { key: 'reviews',     label: 'Reviews',         desc: 'Aggregate feed & responses',          icon: Star,      to: '/soon/reviews' },
    ],
  },
  {
    key: 'offers',
    title: 'Offers',
    items: [
      { key: 'rewards',        label: 'Rewards',        desc: 'Loyalty points & tiers',       icon: Gift,         to: '/soon/rewards' },
      { key: 'discount-codes', label: 'Discount codes', desc: 'Promo codes for clients',      icon: Tag,          to: '/soon/discount-codes' },
      { key: 'sales',          label: 'Sales',          desc: 'Limited-time service pricing', icon: BadgePercent, to: '/soon/sales' },
    ],
  },
];

// ────────── PROFILE TAB ──────────

export const accountItems = [
  { key: 'my-profile',    label: 'My profile',      desc: 'Personal details, avatar', icon: CircleUser, to: '/soon/my-profile' },
  { key: 'wallet',        label: 'Wallet',          desc: 'Payouts, bank account, payslips', icon: Wallet, to: '/wallet' },
  { key: 'billing',       label: 'Plans & billing', desc: 'Tier, payment, invoices',  icon: CreditCard, to: '/soon/billing' },
  { key: 'referrals',     label: 'Referrals',       desc: 'Refer other businesses',   icon: Share2,     to: '/soon/referrals' },
  { key: 'personal-notifications', label: 'Notification preferences', desc: 'Personal alerts', icon: Bell, to: '/soon/notification-preferences' },
  { key: 'preferences',   label: 'Preferences',     desc: 'Theme, language, units',   icon: Sliders,    to: '/soon/preferences' },
  { key: 'help',          label: 'Help & FAQ',      desc: 'Support & knowledge base', icon: HelpCircle, to: '/soon/help' },
  { key: 'legal',         label: 'Legal',           desc: 'Terms, privacy, data',     icon: FileCheck,  to: '/soon/legal' },
];

// Flat list for stub page slug lookup
export const allItems = [
  ...operationsItems,
  ...setupItems,
  ...accountItems,
  ...marketingGroups.flatMap((g) => g.items),
  ...setupStubItems,
  marketingEntry,
];

export const findBySlug = (slug) => {
  const path = `/soon/${slug}`;
  return allItems.find((i) => i.to === path);
};
