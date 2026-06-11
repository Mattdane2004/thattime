import { useState } from 'react';
import { Navigate, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Store, Users } from 'lucide-react';
import ProductSelect from '../../components/ProductSelect';
import ScreenHeader from '../../components/ScreenHeader';
import TextField from '../../components/TextField';
import Toggle from '../../components/Toggle';
import { businessLocations, businessPlan } from '../../data/business';
import { emptyWeeklySchedule } from '../../data/staff';

const MEMBER_TYPE_CARDS = [
  {
    key: 'employee',
    label: 'Employee',
    desc: 'Works for your business. You manage their schedule, services, and pay.',
    Icon: Users,
  },
  {
    key: 'freelancer',
    label: 'Freelancer',
    desc: 'Runs their own business from your space. Manages their own diary, services, and clients.',
    Icon: Store,
  },
];

const RENT_FREQUENCY_OPTIONS = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

// Staff permission preset — their own calendar and bookings.
const STAFF_PERMISSIONS = {
  calendar: true,
  bookings: true,
  clients: true,
  services: false,
  payments: false,
  team: false,
  reports: false,
  settings: false,
};

export default function QuickAdd() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addTeamMember } = useOutletContext();
  const [step, setStep] = useState('type');
  const [memberType, setMemberType] = useState(null);

  // Shared details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Employee details
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [takesBookings, setTakesBookings] = useState(true);
  const [employeeOnProfile, setEmployeeOnProfile] = useState(true);

  // Freelancer details
  const [businessName, setBusinessName] = useState('');
  const [locationId, setLocationId] = useState(businessLocations[0]?.id || 'loc1');
  const [rentEnabled, setRentEnabled] = useState(false);
  const [rentAmount, setRentAmount] = useState('');
  const [rentFrequency, setRentFrequency] = useState('weekly');
  const [commissionEnabled, setCommissionEnabled] = useState(false);
  const [commissionPercent, setCommissionPercent] = useState('');
  const [showOnProfile, setShowOnProfile] = useState(true);

  // Solo plan gate — adding people requires the Team plan. The upgrade
  // screen passes `upgraded` state back so the flow can continue.
  if (businessPlan === 'solo' && !location.state?.upgraded) {
    return <Navigate to="/team/upgrade" replace />;
  }

  const isFreelancer = memberType === 'freelancer';
  const canCreate = isFreelancer
    ? name.trim().length > 0 && email.trim().length > 0
    : name.trim().length > 0 && email.trim().length > 0 && jobTitle.trim().length > 0;

  const create = () => {
    if (!canCreate) return;
    const member = isFreelancer
      ? buildFreelancerMember({
        name,
        email,
        businessName,
        locationId,
        rentEnabled,
        rentAmount,
        rentFrequency,
        commissionEnabled,
        commissionPercent,
        showOnProfile,
      })
      : buildEmployeeMember({ name, email, phone, jobTitle, takesBookings, showOnProfile: employeeOnProfile });
    addTeamMember?.(member);
    navigate(isFreelancer ? `/team/${member.id}` : `/team/${member.id}/setup`, { replace: true });
  };

  if (step === 'type') {
    return (
      <>
        <ScreenHeader title="Add team member" onBack={() => navigate('/team')} border />
        <div className="flex-1 overflow-y-auto bg-white px-5 pt-6 pb-8">
          <div className="text-[22px] font-semibold tracking-tight text-gray-950">Who are you adding?</div>
          <div className="text-[13px] text-gray-500 mt-1 leading-snug">This decides who manages their diary and pay.</div>
          <div className="mt-6 space-y-3">
            {MEMBER_TYPE_CARDS.map(({ key, label, desc, Icon }) => (
              <button
                key={key}
                onClick={() => {
                  setMemberType(key);
                  setStep('details');
                }}
                className="w-full rounded-3xl border border-gray-200 p-5 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-700">
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <div className="mt-4 text-[17px] font-semibold text-gray-950">{label}</div>
                <div className="mt-1 text-[13px] text-gray-500 leading-snug">{desc}</div>
              </button>
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ScreenHeader
        title={isFreelancer ? 'Add freelancer' : 'Add employee'}
        onBack={() => setStep('type')}
        border
      />
      <div className="flex-1 overflow-y-auto bg-white px-5 pt-6 pb-36">
        {isFreelancer ? (
          <div className="space-y-5">
            <TextField label="Full name" value={name} onChange={setName} placeholder="Sofia Ellis" />
            <TextField label="Email" type="email" value={email} onChange={setEmail} placeholder="sofia@example.com" />
            <FieldWithHelper helper="They can work under their own name">
              <TextField
                label="Business name (optional)"
                value={businessName}
                onChange={setBusinessName}
                placeholder="Sofia Ellis Hair"
              />
            </FieldWithHelper>
            <ProductSelect
              label="Location / space"
              value={locationId}
              onChange={setLocationId}
              options={businessLocations.map((item) => ({ value: item.id, label: item.name, desc: item.address }))}
            />

            <div>
              <div className="text-[15px] font-semibold text-gray-900 mb-1">Rent terms</div>
              <div className="space-y-4 border-y border-gray-100 py-4">
                <ToggleField
                  label="Chair / space rent"
                  description="A fixed amount they pay for the space."
                  checked={rentEnabled}
                  onChange={setRentEnabled}
                />
                {rentEnabled && (
                  <div className="grid grid-cols-2 gap-3">
                    <TextField
                      label="Amount (£)"
                      type="number"
                      value={rentAmount}
                      onChange={setRentAmount}
                      placeholder="120"
                    />
                    <ProductSelect
                      label="Frequency"
                      value={rentFrequency}
                      onChange={setRentFrequency}
                      options={RENT_FREQUENCY_OPTIONS}
                    />
                  </div>
                )}
                <ToggleField
                  label="Commission to you"
                  description="You keep a cut of what they earn here, in return for the space."
                  checked={commissionEnabled}
                  onChange={setCommissionEnabled}
                />
                {commissionEnabled && (
                  <FieldWithHelper helper={`e.g. 10 means you take 10% of ${name.trim() ? name.trim().split(' ')[0] + "'s" : 'their'} earnings`}>
                    <TextField
                      label="Your cut (%)"
                      type="number"
                      value={commissionPercent}
                      onChange={setCommissionPercent}
                      placeholder="10"
                    />
                  </FieldWithHelper>
                )}
              </div>
            </div>

            <div className="border-b border-gray-100 pb-4">
              <ToggleField
                label="Show on your public profile"
                description="They appear once their invite is accepted."
                checked={showOnProfile}
                onChange={setShowOnProfile}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <TextField label="Full name" value={name} onChange={setName} placeholder="Sofia Ellis" />
            <FieldWithHelper helper="Used for their invite">
              <TextField label="Email" type="email" value={email} onChange={setEmail} placeholder="sofia@example.com" />
            </FieldWithHelper>
            <TextField label="Phone (optional)" value={phone} onChange={setPhone} placeholder="+44..." />
            <TextField label="Job title" value={jobTitle} onChange={setJobTitle} placeholder="e.g. Stylist" />
            <div className="border-y border-gray-100 py-4 space-y-4">
              <ToggleField
                label="Takes bookings"
                description="Turn off for back-of-house or admin people"
                checked={takesBookings}
                onChange={setTakesBookings}
              />
              <ToggleField
                label="Show on your public profile"
                description="Clients can see and pick them when booking."
                checked={employeeOnProfile}
                onChange={setEmployeeOnProfile}
              />
            </div>
          </div>
        )}
      </div>

      <div className="absolute left-0 right-0 bottom-0 px-5 pb-5 pt-3 bg-white border-t border-gray-100">
        <button
          onClick={create}
          disabled={!canCreate}
          className={
            'w-full h-12 rounded-full text-[15px] font-medium transition-colors ' +
            (canCreate ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-gray-100 text-gray-400')
          }
        >
          Add and send invite
        </button>
        {!isFreelancer && (
          <div className="mt-3 text-center text-[12px] text-gray-500 leading-snug">
            You can set up pay, schedule, and services after — or ask them to do it.
          </div>
        )}
      </div>
    </>
  );
}

function FieldWithHelper({ helper, children }) {
  return (
    <div>
      {children}
      <div className="mt-1.5 text-[12px] text-gray-500 leading-snug">{helper}</div>
    </div>
  );
}

function ToggleField({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-gray-900">{label}</div>
        {description && <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">{description}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// ── Member builders ─────────────────────────────────────────────────────────
// Both build a complete member object matching the src/data/staff.js shape so
// every profile tab renders without crashing. Pay, schedule, and services are
// finished later from the profile setup checklist.

function baseQuickAddMember({ memberType, name, email, phone = '', role, bookable, locationId, publicWhenOnboarded, payment, setupPay }) {
  const trimmedName = name.trim();
  return {
    id: 's_' + Date.now().toString(36),
    memberType,
    name: trimmedName,
    email: email.trim(),
    phone: phone.trim(),
    role,
    systemRoles: ['Staff'],
    accessLevel: 'staff',
    active: true,
    status: 'needs_setup',
    avatarColor: 'bg-gray-100 text-gray-700',
    locations: [locationId],
    locationPrefs: {
      primaryLocationId: locationId,
      allowedLocationIds: [locationId],
      mobile: false,
      remote: false,
    },
    services: [],
    bookable,
    profile: {
      publicName: trimmedName,
      bio: '',
      visibleOnProfile: false,
      publicWhenOnboarded,
      featured: false,
    },
    schedule: {
      timezone: 'Europe/London',
      pattern: 'weekly',
      weekly: emptyWeeklySchedule().map((day) => ({ ...day, enabled: false })),
      timeOff: [],
    },
    permissions: { ...STAFF_PERMISSIONS },
    payment,
    rota: { thisWeekHours: 0, nextShift: 'No rota set', notes: '' },
    invite: { sentAt: 'Just now', acceptedAt: null, channel: phone.trim() ? 'email + phone' : 'email' },
    onboarding: { accepted: false, profileComplete: false, payoutSetup: 'member_required' },
    setup: {
      pay: setupPay,
      schedule: false,
      services: false,
      location: memberType === 'freelancer',
      access: true,
      delegatedSchedule: false,
      delegatedPayout: false,
    },
  };
}

function emptyPayment() {
  return {
    model: 'unset',
    type: 'employee',
    payRate: '',
    rate: '',
    ratePeriod: 'hourly',
    commission: 0,
    commissionEnabled: false,
    chairRentEnabled: false,
    rentAmount: '',
    rentFrequency: 'weekly',
    tips: false,
    tipsIncluded: false,
    payoutStatus: 'Not set up',
    payout: 'member',
    walletRequired: true,
    includedInPayRuns: true,
  };
}

function buildEmployeeMember({ name, email, phone, jobTitle, takesBookings, showOnProfile = true }) {
  return baseQuickAddMember({
    memberType: 'employee',
    name,
    email,
    phone,
    role: jobTitle.trim(),
    bookable: takesBookings,
    locationId: businessLocations[0]?.id || 'loc1',
    publicWhenOnboarded: takesBookings && showOnProfile,
    payment: emptyPayment(),
    setupPay: false,
  });
}

function buildFreelancerMember({
  name,
  email,
  businessName,
  locationId,
  rentEnabled,
  rentAmount,
  rentFrequency,
  commissionEnabled,
  commissionPercent,
  showOnProfile,
}) {
  const member = baseQuickAddMember({
    memberType: 'freelancer',
    name,
    email,
    role: 'Freelancer',
    bookable: true,
    locationId,
    publicWhenOnboarded: showOnProfile,
    payment: {
      ...emptyPayment(),
      type: 'contractor',
      commission: commissionEnabled ? Number(commissionPercent || 0) : 0,
      commissionEnabled,
      chairRentEnabled: rentEnabled,
      rentAmount: rentEnabled ? rentAmount : '',
      rentFrequency,
    },
    // Rent & commission terms are captured at creation, so the pay item is
    // already done when either is enabled.
    setupPay: rentEnabled || commissionEnabled,
  });
  member.freelance = {
    businessName: businessName.trim(),
    rentEnabled,
    rentAmount,
    rentFrequency,
    commissionEnabled,
    commissionPercent,
    locationId,
  };
  return member;
}
