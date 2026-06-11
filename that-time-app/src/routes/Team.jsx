import { createElement, useMemo, useState } from 'react';
import { Link, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowDownToLine,
  Ban,
  Banknote,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Download,
  FileText,
  Mail,
  MapPin,
  Plus,
  ReceiptText,
  Repeat,
  Scissors,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserPlus,
  UserRound,
  Users,
  WalletCards,
} from 'lucide-react';
import BottomSheet from '../components/BottomSheet';
import ProductSelect from '../components/ProductSelect';
import ScreenHeader from '../components/ScreenHeader';
import TextField from '../components/TextField';
import Toggle from '../components/Toggle';
import PaySetupFlow from './team/PaySetupFlow';
import SetupChecklist from './team/SetupChecklist';
import { businessLocations } from '../data/business';
import { coverageFor, demandByDay, nextHoliday, upcomingHolidays } from '../data/coverage';
import { demoServices } from '../data/demoServices';
import {
  SYSTEM_ROLES,
  emptyWeeklySchedule,
  initialsFor,
  isBookable,
  staff as fallbackTeamMembers,
} from '../data/staff';
import {
  bankStatusLabel,
  buildPayrollPrototype,
  calculatePayrollLine,
  formatMoney,
  memberPayrollProfile,
  payrollStateLabel,
  payslips,
} from '../data/payroll';

const TABS = [
  { key: 'overview', label: 'Overview', Icon: CalendarDays },
  { key: 'members', label: 'Members', Icon: Users },
  { key: 'schedule', label: 'Schedule', Icon: Clock },
  { key: 'pay', label: 'Pay', Icon: WalletCards },
];

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const ROLE_OPTIONS = SYSTEM_ROLES.filter((role) => role !== 'Owner');

const PERMISSIONS = [
  { key: 'calendar', label: 'Calendar', desc: 'View working hours and rota' },
  { key: 'bookings', label: 'Bookings', desc: 'Create, move, and cancel bookings' },
  { key: 'clients', label: 'Clients', desc: 'View client records and notes' },
  { key: 'services', label: 'Services', desc: 'Edit services, classes, and prices' },
  { key: 'payments', label: 'Payments', desc: 'Refunds, invoices, and payouts' },
  { key: 'team', label: 'Team', desc: 'Invite staff and edit team setup' },
  { key: 'reports', label: 'Reports', desc: 'Revenue and performance reporting' },
  { key: 'settings', label: 'Settings', desc: 'Business policies and integrations' },
];

const AVATAR_COLORS = [
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-emerald-100 text-emerald-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
];

const MEMBER_TEMPLATES = [
  { key: 'bookable_staff', label: 'Bookable staff', desc: 'Employee or regular team member who takes bookings.' },
  { key: 'freelancer', label: 'Freelancer / chair renter', desc: 'Independent worker with commission, rent, or hybrid terms.' },
  { key: 'flexi_cover', label: 'Flexi cover', desc: 'Ad-hoc cover worker assigned shifts when needed.' },
  { key: 'admin', label: 'Admin / back-office', desc: 'Business-side user who does not take client bookings.' },
];

const PAYMENT_MODELS = [
  { key: 'hourly', label: 'Hourly wage', desc: 'Pay from approved hours.' },
  { key: 'salary', label: 'Fixed salary', desc: 'Pay a fixed amount each pay period.' },
  { key: 'no_base', label: 'No base pay', desc: 'Use only add-ons like commission, tips, or chair rent.' },
  { key: 'none', label: 'Set up later', desc: 'Skip pay rules during this setup.' },
];

const SCHEDULE_PATTERNS = [
  { key: 'weekly', label: 'Weekly', desc: 'Repeats every week.' },
  { key: 'biweekly', label: 'Bi-weekly', desc: 'Repeats every two weeks.' },
  { key: 'four_week', label: 'Four-week rota', desc: 'Repeats every four weeks.' },
  { key: 'custom', label: 'Custom', desc: 'Use custom repeat rules.' },
  { key: 'flexi', label: 'Flexi / ad-hoc', desc: 'Assign shifts only when needed.' },
];

const PAY_PERIOD_OPTIONS = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'session', label: 'Session' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

const PAYOUT_OPTIONS = [
  { value: 'member', label: 'Their Stripe account', desc: 'Approved pay lands in their Stripe-backed earnings after invite.' },
  { value: 'owner', label: 'Owner manages payout', desc: 'Keep payout settings under the business account.' },
  { value: 'not_required', label: 'No payout required', desc: 'Use for unpaid, admin, or non-payrolled access.' },
];

const FLEXI_OPTIONS = [
  { value: 'open_shifts', label: 'Can accept open shifts', desc: 'They can pick up shifts needing cover.' },
  { value: 'cover_only', label: 'Cover only', desc: 'Use for sickness, holiday, and busy-day cover.' },
  { value: 'owner_assigned', label: 'Owner assigned only', desc: 'Managers add them to shifts manually.' },
];

const CUSTOM_CYCLE_OPTIONS = [
  { value: '2', label: '2-week cycle' },
  { value: '3', label: '3-week cycle' },
  { value: '4', label: '4-week cycle' },
  { value: '6', label: '6-week cycle' },
];

// Access levels — the collapsed role model shown on the profile Access tab.
// Selecting one applies its permission set; the 8 toggles stay available
// under "Customise access" for exceptions.
const ACCESS_LEVELS = [
  { key: 'owner', label: 'Owner', desc: 'Just you', disabled: true },
  {
    key: 'manager',
    label: 'Manager',
    desc: 'Runs the day-to-day — bookings, team, money',
    permissions: { calendar: true, bookings: true, clients: true, services: true, payments: true, team: true, reports: true, settings: false },
  },
  {
    key: 'staff',
    label: 'Staff',
    desc: 'Their own calendar and bookings',
    permissions: { calendar: true, bookings: true, clients: true, services: false, payments: false, team: false, reports: false, settings: false },
  },
  {
    key: 'front_desk',
    label: 'Front desk',
    desc: 'Bookings and clients for the whole team, no money',
    permissions: { calendar: true, bookings: true, clients: true, services: false, payments: false, team: false, reports: false, settings: false },
  },
];

const PERMISSION_PRESETS = [
  { key: 'staff', label: 'Staff', roles: ['Staff'] },
  { key: 'manager', label: 'Manager', roles: ['Manager', 'Staff'] },
  { key: 'instructor', label: 'Instructor', roles: ['Instructor'] },
  { key: 'admin', label: 'Admin', roles: ['Manager'] },
];

const TEAM_WIZARD_STEPS = [
  { key: 'details', label: 'Staff details' },
  { key: 'services', label: 'Services' },
  { key: 'pay', label: 'Pay' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'locations', label: 'Locations' },
  { key: 'permissions', label: 'Access' },
  { key: 'review', label: 'Review' },
];

// Profile hub sections — each renders as an icon card with a live status
// line, opening full-screen when tapped. Replaces the old 7-tab strip.
const PROFILE_SECTIONS = [
  { key: 'schedule', label: 'Schedule', Icon: CalendarDays, blurb: 'Working hours and repeat pattern.' },
  { key: 'workspaces', label: 'Services', Icon: Scissors, blurb: 'What clients can book with them.' },
  { key: 'pay', label: 'Pay', Icon: WalletCards, blurb: 'How they earn, and payouts.' },
  { key: 'access', label: 'Access', Icon: ShieldCheck, blurb: 'Bookings, visibility, and permissions.' },
  { key: 'locations', label: 'Location', Icon: MapPin, blurb: 'Where they work from.' },
  { key: 'details', label: 'Personal', Icon: UserRound, blurb: 'Contact details and public profile.' },
];

const MEMBER_PROFILE_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'details', label: 'Personal' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'access', label: 'Access' },
  { key: 'workspaces', label: 'Services' },
  { key: 'pay', label: 'Pay' },
  { key: 'locations', label: 'Locations' },
];

export default function Team() {
  const navigate = useNavigate();
  const {
    teamMembers = fallbackTeamMembers,
    updateTeamMember,
    teamRequests = [],
    updateTeamRequest,
  } = useOutletContext();
  // Tabs live in the URL (?tab=pay) so screens are deep-linkable in reviews.
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';
  const setTab = (next) =>
    setSearchParams(next === 'overview' ? {} : { tab: next }, { replace: true });
  const [query, setQuery] = useState('');
  const [memberSort, setMemberSort] = useState('name');
  const [memberStatusFilter, setMemberStatusFilter] = useState('all');
  const [memberRoleFilter, setMemberRoleFilter] = useState('all');
  const [memberLocationFilter, setMemberLocationFilter] = useState('all');

  const members = teamMembers || fallbackTeamMembers;

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members
      .filter((member) => {
        const matchesQuery = !q || [member.name, member.email, member.role, ...(member.systemRoles || [])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(q);
        return matchesQuery &&
          matchesMemberStatusFilter(member, memberStatusFilter) &&
          matchesMemberRoleFilter(member, memberRoleFilter) &&
          matchesMemberLocationFilter(member, memberLocationFilter);
      })
      .sort((a, b) => sortMembers(a, b, memberSort));
  }, [members, query, memberSort, memberStatusFilter, memberRoleFilter, memberLocationFilter]);

  const metrics = teamMetrics(members);
  const requestDisplays = buildRequestDisplays(teamRequests, members);

  const updateMember = (id, patch) => {
    updateTeamMember?.(id, patch);
  };
  const openMember = (id) => navigate(`/team/${id}`);

  // Team of one — the most common first-run state. Previewable at /team?demo=solo.
  if (members.length === 0 || searchParams.get('demo') === 'solo') {
    return (
      <>
        <ScreenHeader title="Team" onBack={() => navigate('/hub')} border />
        <div className="flex-1 overflow-y-auto bg-white px-5 pt-10 pb-8">
          <div className="rounded-3xl border border-gray-200 p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-700">
              <Users size={20} strokeWidth={1.75} />
            </div>
            <div className="mt-5 text-[22px] font-semibold tracking-tight text-gray-950">It's just you right now</div>
            <div className="mt-2 text-[14px] text-gray-500 leading-snug">
              Your own schedule and bookings live in your calendar. When someone joins you —
              an employee or a freelancer renting a chair — add them here.
            </div>
            <button
              onClick={() => navigate('/team/new')}
              className="mt-6 w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
            >
              Add your first team member
            </button>
            <div className="mt-3 text-[12px] text-gray-400 leading-snug">
              Adding someone upgrades you from the Solo plan.
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ScreenHeader
        title="Team"
        onBack={() => navigate('/hub')}
        rightAction={
          <button
            onClick={() => navigate('/team/new')}
            className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
            aria-label="Add team member"
          >
            <Plus size={18} strokeWidth={2} />
          </button>
        }
        border
      />

      <div className="shrink-0 px-5 pt-2 bg-white border-b border-gray-100">
        <div className="grid grid-cols-4">
          {TABS.map((item) => {
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={
                  'relative h-12 text-[14px] font-semibold transition-colors ' +
                  (active ? 'text-gray-950' : 'text-gray-500 hover:text-gray-900')
                }
              >
                <span>{item.label}</span>
                {active && <span className="absolute left-3 right-3 bottom-0 h-0.5 rounded-full bg-gray-950" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white px-5 pt-5 pb-24">
        {tab === 'overview' && (
          <OverviewPanel
            members={members}
            metrics={metrics}
            requests={requestDisplays}
            onAdd={() => navigate('/team/new')}
            onOpenMember={openMember}
            onOpenSchedule={() => setTab('schedule')}
            onOpenMembers={() => setTab('members')}
          />
        )}
        {tab === 'members' && (
          <MembersPanel
            members={filteredMembers}
            metrics={metrics}
            query={query}
            onQuery={setQuery}
            sort={memberSort}
            statusFilter={memberStatusFilter}
            roleFilter={memberRoleFilter}
            locationFilter={memberLocationFilter}
            onSort={setMemberSort}
            onStatusFilter={setMemberStatusFilter}
            onRoleFilter={setMemberRoleFilter}
            onLocationFilter={setMemberLocationFilter}
            onSelect={openMember}
          />
        )}
        {tab === 'schedule' && (
          <SchedulePanel
            members={members}
            requests={requestDisplays}
            onSelect={openMember}
            onUpdateMember={updateMember}
            onUpdateRequest={updateTeamRequest}
          />
        )}
        {tab === 'pay' && <PayPanel members={members} onSelect={openMember} />}
      </div>

      <div className="absolute left-0 right-0 bottom-0 px-5 pb-5 pt-3 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate('/team/new')}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <UserPlus size={16} strokeWidth={2} />
          Add team member
        </button>
      </div>

    </>
  );
}

export function TeamMemberProfile() {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const {
    teamMembers = fallbackTeamMembers,
    updateTeamMember,
  } = useOutletContext();
  const member = teamMembers.find((item) => item.id === memberId);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';
  const setTab = (next) =>
    setSearchParams(next === 'overview' ? {} : { tab: next }, { replace: true });

  if (!member) {
    return (
      <>
        <ScreenHeader title="Team member" onBack={() => navigate('/team')} border />
        <div className="flex-1 bg-gray-50 px-5 pt-8">
          <EmptyPanel icon={Users} title="Member not found" body="This team member could not be found in the local team list." />
        </div>
      </>
    );
  }

  // Every profile edit funnels through withSetupProgress so quick-add members
  // tick off their setup checklist as the matching tab data is saved.
  const patch = (next) => updateTeamMember?.(member.id, (current) => withSetupProgress(current, next));
  const patchFromCurrent = (fn) => updateTeamMember?.(member.id, (current) => withSetupProgress(current, fn(current)));
  const updateProfile = (next) =>
    patchFromCurrent((current) => ({ profile: { ...(current.profile || {}), ...next } }));
  const updatePayment = (next) =>
    patchFromCurrent((current) => ({ payment: { ...normalisePayment(current.payment), ...next } }));
  const updateLocations = (next) =>
    patchFromCurrent((current) => ({
      locationPrefs: { ...(current.locationPrefs || {}), ...next },
      locations: next.allowedLocationIds || current.locations,
    }));

  // The profile is a hub of icon cards; tapping one opens that area
  // full-screen. Back from a section returns to the hub, not the team list.
  const section = PROFILE_SECTIONS.find((item) => item.key === tab);

  return (
    <>
      <ScreenHeader
        title={section ? `${member.name.split(' ')[0]} · ${section.label}` : 'Team profile'}
        onBack={() => (section ? setTab('overview') : navigate('/team'))}
        border
      />
      <div className="flex-1 overflow-y-auto bg-white px-5 pt-5 pb-8">
        {!section && (
          <>
            <div className="pb-6">
              <div className="flex items-start gap-4">
                <Avatar member={member} large />
                <div className="flex-1 min-w-0 pt-1">
                  <div className="text-[24px] font-semibold tracking-tight text-gray-950 truncate">{member.name}</div>
                  <div className="text-[15px] text-gray-500 truncate">{member.role || member.email || 'Team member'}</div>
                  <div className="mt-1.5">
                    <StatusPill label={memberTypePillLabel(member)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <SetupChecklist
                member={member}
                onOpenTab={setTab}
                onPatch={patchFromCurrent}
                setupHref={`/team/${member.id}/setup`}
              />

              {member.status === 'pending' && (
                <div className="rounded-2xl bg-gray-50 p-4">
                  <div className="text-[15px] font-semibold text-gray-900">They haven't accepted their invite yet.</div>
                  <button
                    onClick={() => patchFromCurrent(markInviteAccepted)}
                    className="mt-3 text-[14px] font-semibold text-gray-900 flex items-center gap-2"
                  >
                    Mark invite accepted
                    <ChevronRight size={16} strokeWidth={2} />
                  </button>
                </div>
              )}

              {member.status !== 'needs_setup' && <CompactPerformanceCard member={member} />}

              <ProfileSectionGrid member={member} onOpen={setTab} />

              <PanelSection title="Their side of the app">
                <Link
                  to={`/staff?member=${member.id}`}
                  className="w-full py-4 flex items-center gap-3 text-left border-y border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
                    <Users size={17} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-semibold text-gray-900">Preview what {member.name.split(' ')[0]} sees</div>
                    <div className="text-[12px] text-gray-500 mt-0.5">Their schedule, requests, earnings, and profile.</div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" strokeWidth={2} />
                </Link>
              </PanelSection>
            </div>
          </>
        )}

        {section && (
          <div className="space-y-7">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                <section.Icon size={19} strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <div className="text-[18px] font-semibold tracking-tight text-gray-950">{section.label}</div>
                <div className="text-[12px] text-gray-500 leading-snug">{section.blurb}</div>
              </div>
            </div>

            {tab === 'details' && (
              <MemberProfileDetails member={member} onPatch={patch} onProfileChange={updateProfile} />
            )}
            {tab === 'schedule' && (
              <MemberProfileSchedule member={member} onPatch={patch} />
            )}
            {tab === 'access' && (
              <MemberProfileAccess member={member} onPatch={patch} onProfileChange={updateProfile} />
            )}
            {tab === 'workspaces' && (
              <MemberProfileWorkspaces member={member} onPatch={patch} />
            )}
            {tab === 'pay' && (
              <MemberProfilePay member={member} onChange={updatePayment} />
            )}
            {tab === 'locations' && (
              <LocationPreferencesEditor
                value={normaliseLocationPrefs(member)}
                onChange={updateLocations}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}

export function StaffWallet() {
  const navigate = useNavigate();
  const { teamMembers = fallbackTeamMembers } = useOutletContext();
  const staffOptions = teamMembers
    .filter((member) => member.active || member.status === 'pending' || member.status === 'needs_setup')
    .map((member) => ({ value: member.id, label: member.name }));
  const [memberId, setMemberId] = useState(staffOptions[0]?.value || teamMembers[0]?.id);
  const [bankOpen, setBankOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const member = teamMembers.find((item) => item.id === memberId) || teamMembers[0] || fallbackTeamMembers[0];
  const profile = memberPayrollProfile(member);
  const line = calculatePayrollLine(member);
  const walletBalance = profile.walletBalance + Math.max(0, line.net);

  const freelance = isFreelancerMember(member) || member.payment?.type === 'contractor';

  return (
    <>
      <ScreenHeader title="My earnings" onBack={() => navigate('/hub')} border />
      <div className="flex-1 overflow-y-auto bg-white px-5 pt-5 pb-8">
        <div className="space-y-7">
          <div className="flex items-center gap-3">
            <Avatar member={member} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-gray-500">Viewing as</div>
              <ProductSelect
                value={member.id}
                onChange={setMemberId}
                options={staffOptions}
                compact
                buttonClassName="h-9 border-0 bg-transparent px-0 text-[18px] font-semibold"
                menuClassName="left-0 w-56"
              />
            </div>
          </div>

          <section className="rounded-[28px] bg-gray-950 text-white px-5 py-5">
            <div className="text-[12px] uppercase tracking-[0.12em] text-white/60">Earnings balance</div>
            <div className="mt-3 text-[38px] font-semibold tracking-tight">{formatMoney(walletBalance)}</div>
            <div className="mt-2 text-[13px] text-white/65">
              {freelance
                ? 'Your split lands here as each booking is paid.'
                : `${formatMoney(line.net)} pending from ${payrollPeriodLabel()} pay run.`}
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setWithdrawOpen(true)}
                className="h-11 px-5 rounded-full bg-white text-gray-950 text-[14px] font-semibold inline-flex items-center gap-2"
              >
                <ArrowDownToLine size={16} strokeWidth={2} />
                Instant payout
              </button>
              <button
                onClick={() => setBankOpen(true)}
                className="h-11 px-5 rounded-full bg-white/10 text-white text-[14px] font-semibold inline-flex items-center gap-2"
              >
                <CreditCard size={16} strokeWidth={2} />
                Payouts
              </button>
            </div>
            <div className="mt-4 text-[11px] text-white/50 leading-snug">
              Earnings sit in your own Stripe account. Standard payouts arrive every Friday.
            </div>
          </section>

          <PanelSection title="Payouts">
            <button
              onClick={() => setBankOpen(true)}
              className="w-full py-4 flex items-center gap-3 text-left border-y border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
                <Banknote size={18} strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold text-gray-900">{stripeStatusLabel(profile.bankStatus)}</div>
                <div className="text-[12px] text-gray-500 mt-0.5">
                  {profile.bankStatus === 'ready'
                    ? 'Weekly payouts to your account ending 4821.'
                    : 'Finish Stripe onboarding to receive payouts.'}
                </div>
              </div>
              <ChevronRight size={16} className="text-gray-300" strokeWidth={2} />
            </button>
          </PanelSection>

          <PanelSection title="Latest pay breakdown">
            <div className="divide-y divide-gray-100 border-y border-gray-100">
              <PayDetailRow label="Wages" value={formatMoney(line.wages)} />
              <PayDetailRow label="Commission" value={`${formatMoney(line.commission)} from ${formatMoney(line.sales)} sales`} />
              <PayDetailRow label="Tips" value={formatMoney(line.tips)} />
              <PayDetailRow label="Deductions" value={line.deductions ? `-${formatMoney(line.deductions)}` : formatMoney(0)} />
              <PayDetailRow label="Net pay" value={formatMoney(line.net)} strong />
            </div>
          </PanelSection>

          <PanelSection title={freelance ? 'Earnings statements' : 'Payslips'}>
            {freelance && (
              <div className="text-[12px] text-gray-500 leading-snug mb-1">
                You run your own business, so these are statements of what you earned through this shop — not payslips.
              </div>
            )}
            <div className="divide-y divide-gray-100 border-y border-gray-100">
              {payslips.map((slip) => (
                <div key={slip.id} className="py-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-600 flex items-center justify-center">
                    <FileText size={17} strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-gray-900">{slip.label}</div>
                    <div className="text-[12px] text-gray-500 mt-0.5">{slip.date} · {formatMoney(slip.net)} net</div>
                  </div>
                  <button className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-500" aria-label={`Download ${slip.label} ${freelance ? 'statement' : 'payslip'}`}>
                    <Download size={16} strokeWidth={1.75} />
                  </button>
                </div>
              ))}
            </div>
          </PanelSection>
        </div>
      </div>

      <BottomSheet open={bankOpen} onClose={() => setBankOpen(false)} title="Payouts via Stripe">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
              <CreditCard size={18} strokeWidth={1.75} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-semibold text-gray-900">{stripeStatusLabel(profile.bankStatus)}</div>
              <div className="text-[12px] text-gray-500 mt-0.5">
                {profile.bankStatus === 'ready' ? 'Account ending 4821 · payouts every Friday' : 'A few details left to confirm'}
              </div>
            </div>
            <StatusPill
              label={profile.bankStatus === 'ready' ? 'Verified' : profile.bankStatus === 'verifying' ? 'In progress' : 'Not started'}
              tone={profile.bankStatus === 'ready' ? 'success' : 'muted'}
            />
          </div>
          <div className="text-[13px] text-gray-600 leading-snug">
            Bank details and identity checks happen in Stripe's secure onboarding. That Time never sees your bank login —
            you connect once and payouts run automatically.
          </div>
          <button onClick={() => setBankOpen(false)} className="w-full h-12 rounded-full bg-gray-900 text-white text-[14px] font-semibold">
            {profile.bankStatus === 'ready' ? 'Manage in Stripe' : 'Continue Stripe onboarding'}
          </button>
          <div className="text-[11px] text-gray-400 leading-snug text-center">
            Prototype: this would open Stripe's hosted onboarding in-app.
          </div>
        </div>
      </BottomSheet>

      <BottomSheet open={withdrawOpen} onClose={() => setWithdrawOpen(false)} title="Instant payout">
        <div className="space-y-5">
          <div>
            <div className="text-[13px] text-gray-500">Available now</div>
            <div className="text-[34px] font-semibold tracking-tight text-gray-950">{formatMoney(walletBalance)}</div>
          </div>
          <div className="text-[13px] text-gray-600 leading-snug">
            Standard payouts arrive every Friday at no cost. Instant payout moves your balance to your bank in minutes
            for a 1% Stripe fee.
          </div>
          <button onClick={() => setWithdrawOpen(false)} className="w-full h-12 rounded-full bg-gray-900 text-white text-[14px] font-semibold">
            Pay out {formatMoney(walletBalance)} now
          </button>
          <div className="text-[11px] text-gray-400 leading-snug text-center">
            Prototype: instant payouts are simulated.
          </div>
        </div>
      </BottomSheet>
    </>
  );
}

// Icon card grid — the profile's main navigation. Status lines tell the
// owner what's set up and what still needs them, at a glance.
function ProfileSectionGrid({ member, onOpen }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {PROFILE_SECTIONS.map((section) => {
        const status = profileSectionStatus(member, section.key);
        return (
          <button
            key={section.key}
            onClick={() => onOpen(section.key)}
            className="rounded-3xl border border-gray-200 p-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
              <section.Icon size={18} strokeWidth={1.75} />
            </div>
            <div className="mt-3 text-[15px] font-semibold text-gray-950">{section.label}</div>
            <div className={'mt-0.5 text-[12px] leading-snug truncate ' + (status.attention ? 'font-medium text-gray-900 underline underline-offset-2' : 'text-gray-500')}>
              {status.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function profileSectionStatus(member, key) {
  const setup = member.setup || {};
  if (key === 'schedule') {
    if (setup.delegatedSchedule && !hasWorkingHours(member)) return { label: `Asked ${member.name.split(' ')[0]}` };
    if (!hasWorkingHours(member)) return { label: 'To do', attention: true };
    const hours = memberWeeklyHours(member).reduce((sum, item) => sum + item.hours, 0);
    return { label: `${Math.round(hours)}h/wk · ${schedulePatternLabel(member.schedule?.pattern)}` };
  }
  if (key === 'workspaces') {
    if (!member.bookable) return { label: 'Bookings off' };
    const count = (member.services || []).length;
    if (count === 0) return { label: 'To do', attention: true };
    return { label: `${count} service${count === 1 ? '' : 's'}` };
  }
  if (key === 'pay') {
    if (isFreelancerMember(member)) return { label: chairRentSummary(member.payment) || 'Rent & commission' };
    const model = normalisePayment(member.payment).model;
    if (!model || model === 'unset' || model === 'none') return { label: 'Optional · not set up' };
    return { label: paymentModelLabel(model) };
  }
  if (key === 'access') {
    const levels = { owner: 'Owner', manager: 'Manager', staff: 'Staff', front_desk: 'Front desk' };
    return { label: levels[member.accessLevel] || 'Staff' };
  }
  if (key === 'locations') {
    if (member.setup && !setup.location) return { label: 'To do', attention: true };
    return { label: locationSummary(member) };
  }
  return { label: member.email || 'Contact details' };
}

// One-line performance summary replacing the old full-width charts.
function CompactPerformanceCard({ member }) {
  const performance = memberPerformance(member);
  return (
    <div className="rounded-3xl bg-gray-950 text-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[12px] uppercase tracking-[0.12em] text-white/60">This week</div>
        <span className="text-[11px] font-medium text-white/50">Week to date</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <div className="text-[20px] font-semibold tracking-tight">{formatMoney(performance.sales)}</div>
          <div className="text-[11px] text-white/60 mt-0.5">Sales</div>
        </div>
        <div>
          <div className="text-[20px] font-semibold tracking-tight">{performance.bookings}</div>
          <div className="text-[11px] text-white/60 mt-0.5">Bookings</div>
        </div>
        <div>
          <div className="text-[20px] font-semibold tracking-tight">{performance.utilisation}%</div>
          <div className="text-[11px] text-white/60 mt-0.5">Schedule used</div>
        </div>
      </div>
    </div>
  );
}

function MemberProfileOverview({ member, onAcceptInvite, onOpenTab, onPatch }) {
  const performance = memberPerformance(member);
  const payrollLine = calculatePayrollLine(member);
  const wallet = memberPayrollProfile(member);
  const trend = memberTrendData(member, performance.sales);
  const weeklyHours = memberWeeklyHours(member);

  return (
    <>
      <SetupChecklist member={member} onOpenTab={onOpenTab} onPatch={onPatch} />

      {member.status === 'pending' && (
        <div className="rounded-2xl bg-amber-50 p-4">
          <div className="text-[15px] font-semibold text-amber-950">This team member has not accepted their invite yet.</div>
          <button
            onClick={onAcceptInvite}
            className="mt-3 text-[14px] font-semibold text-amber-950 flex items-center gap-2"
          >
            Mark invite accepted
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>
      )}

      {member.status !== 'needs_setup' && (<>
      <PanelSection title="Performance">
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[17px] font-semibold text-gray-900">Week to date</div>
              <div className="text-[12px] text-gray-500 mt-0.5">Sales, bookings, earnings, and schedule use</div>
            </div>
            <ProductSelect
              value="week"
              onChange={() => {}}
              options={[
                { value: 'week', label: 'Week' },
                { value: 'month', label: 'Month' },
              ]}
              compact
              buttonClassName="h-9 rounded-full border border-gray-200 bg-white px-3 text-[13px] font-medium"
              menuClassName="right-0 w-32"
            />
          </div>

          <div className="rounded-[28px] bg-gray-950 px-5 py-5 text-white overflow-hidden relative">
            <div className="absolute -right-12 -bottom-16 w-36 h-36 rounded-full bg-white/10" />
            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[12px] uppercase tracking-[0.12em] text-white/55">Sales trend</div>
                  <div className="mt-2 text-[34px] font-semibold tracking-tight">{formatMoney(performance.sales)}</div>
                  <div className="text-[12px] text-white/55 mt-1">{performance.bookings} bookings · {performance.hours} scheduled hours</div>
                </div>
                <MiniUtilisation value={performance.utilisation} />
              </div>
              <SalesSparkline points={trend} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Metric label="Net pay" value={formatMoney(payrollLine.net)} />
            <Metric label="Wallet" value={formatMoney(wallet.walletBalance)} />
            <Metric label="Bookings" value={performance.bookings} />
          </div>

          <div className="grid grid-cols-[110px_1fr] gap-5 items-center border-y border-gray-100 py-5">
            <UtilisationDonut value={performance.utilisation} />
            <div>
              <div className="text-[15px] font-semibold text-gray-900">Schedule utilisation</div>
              <div className="text-[12px] text-gray-500 mt-1 leading-snug">
                {performance.hours} of 35 target hours scheduled this week.
              </div>
              <div className="mt-4 grid grid-cols-7 gap-2 items-end h-24">
                {weeklyHours.map((item) => (
                  <div key={item.day} className="h-full flex flex-col items-center justify-end gap-2">
                    <div className="w-full rounded-full bg-gray-100 h-full flex items-end overflow-hidden">
                      <div
                        className="w-full rounded-full bg-gray-900"
                        style={{ height: `${Math.max(8, Math.min(100, (item.hours / 8) * 100))}%` }}
                      />
                    </div>
                    <div className="text-[9px] font-semibold text-gray-400 uppercase">{item.day.slice(0, 1)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PanelSection>

      <PanelSection title="Pay mix">
        <PayMixChart line={payrollLine} />
      </PanelSection>

      <PanelSection title="Today">
        <div className="border-y border-gray-100 py-4">
          <div className="text-[16px] font-semibold text-gray-900">{member.rota?.nextShift || 'No rota set'}</div>
          <div className="text-[13px] text-gray-500 mt-1">{member.rota?.notes || schedulePatternLabel(member.schedule?.pattern)}</div>
        </div>
      </PanelSection>

      </>)}

      <SetupSummary member={member} />

      <PanelSection title="Their side of the app">
        <Link
          to={`/staff?member=${member.id}`}
          className="w-full py-4 flex items-center gap-3 text-left border-y border-gray-100 hover:bg-gray-50 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600">
            <Users size={17} strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-semibold text-gray-900">Preview what {member.name.split(' ')[0]} sees</div>
            <div className="text-[12px] text-gray-500 mt-0.5">Their schedule, requests, earnings, and profile.</div>
          </div>
          <ChevronRight size={16} className="text-gray-300" strokeWidth={2} />
        </Link>
      </PanelSection>
    </>
  );
}

function MiniUtilisation({ value }) {
  return (
    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center shrink-0">
      <div className="text-center">
        <div className="text-[18px] font-semibold leading-none">{value}%</div>
        <div className="text-[9px] text-white/45 mt-1">used</div>
      </div>
    </div>
  );
}

function SalesSparkline({ points }) {
  const max = Math.max(...points, 1);
  const coords = points.map((point, index) => {
    const x = (index / Math.max(1, points.length - 1)) * 100;
    const y = 44 - (point / max) * 34;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="mt-6 h-16">
      <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible" preserveAspectRatio="none" aria-hidden="true">
        <polyline
          points={coords}
          fill="none"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        {points.map((point, index) => {
          const x = (index / Math.max(1, points.length - 1)) * 100;
          const y = 44 - (point / max) * 34;
          return <circle key={`${point}-${index}`} cx={x} cy={y} r="1.8" fill="white" />;
        })}
      </svg>
      <div className="mt-1 grid grid-cols-5 text-[10px] text-white/45">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((item) => <span key={item}>{item}</span>)}
      </div>
    </div>
  );
}

function UtilisationDonut({ value }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, value) / 100) * circumference;
  return (
    <div className="relative w-[104px] h-[104px]">
      <svg viewBox="0 0 104 104" className="w-full h-full -rotate-90" aria-hidden="true">
        <circle cx="52" cy="52" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="12" />
        <circle
          cx="52"
          cy="52"
          r={radius}
          fill="none"
          stroke="#111827"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[24px] font-semibold text-gray-950 leading-none">{value}%</div>
        <div className="text-[10px] text-gray-500 mt-1">utilised</div>
      </div>
    </div>
  );
}

function PayMixChart({ line }) {
  const positive = [
    { key: 'wages', label: 'Wages', value: line.wages, color: 'bg-sky-400' },
    { key: 'commission', label: 'Commission', value: line.commission, color: 'bg-violet-400' },
    { key: 'tips', label: 'Tips', value: line.tips, color: 'bg-emerald-400' },
  ].filter((item) => item.value > 0);
  const total = positive.reduce((sum, item) => sum + item.value, 0) || 1;

  return (
    <div className="border-y border-gray-100 py-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[28px] font-semibold tracking-tight text-gray-950">{formatMoney(line.net)}</div>
          <div className="text-[12px] text-gray-500 mt-1">Estimated net pay this run</div>
        </div>
        {line.deductions > 0 && (
          <div className="text-right">
            <div className="text-[14px] font-semibold text-rose-700">-{formatMoney(line.deductions)}</div>
            <div className="text-[11px] text-gray-500">deductions</div>
          </div>
        )}
      </div>
      <div className="mt-5 h-3 rounded-full bg-gray-100 overflow-hidden flex">
        {positive.map((item) => (
          <div
            key={item.key}
            className={item.color}
            style={{ width: `${Math.max(8, (item.value / total) * 100)}%` }}
          />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {positive.map((item) => (
          <div key={item.key}>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${item.color}`} />
              <span className="text-[11px] text-gray-500">{item.label}</span>
            </div>
            <div className="text-[13px] font-semibold text-gray-900 mt-1">{formatMoney(item.value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MemberProfileSchedule({ member, onPatch }) {
  const schedule = {
    timezone: 'Europe/London',
    pattern: 'weekly',
    weekly: emptyWeeklySchedule(),
    timeOff: [],
    ...(member.schedule || {}),
  };
  const updateSchedule = (patch) => onPatch({ schedule: { ...schedule, ...patch } });

  // Alternating patterns: week 1 lives in schedule.weekly (the rota reads it),
  // weeks 2+ live in schedule.cycleWeeks keyed by week number. Tabs switch
  // which week of the cycle is being edited.
  const cycleLength = scheduleCycleLength(schedule);
  const [editingWeek, setEditingWeek] = useState(1);
  const week = Math.min(editingWeek, cycleLength);
  const blankWeek = () => schedule.weekly.map((day) => ({ ...day, enabled: false }));
  const weekly = week === 1 ? schedule.weekly : schedule.cycleWeeks?.[week] || blankWeek();
  const weekIsEmpty = week > 1 && !weekly.some((day) => day.enabled);

  const updateWeekly = (next) => {
    if (week === 1) {
      onPatch({ schedule: next });
      return;
    }
    updateSchedule({ cycleWeeks: { ...(schedule.cycleWeeks || {}), [week]: next.weekly } });
  };

  return (
    <div className="space-y-5">
      <PanelSection title="Schedule frequency">
        <ScheduleFrequencyEditor schedule={schedule} onChange={updateSchedule} />
      </PanelSection>
      <PanelSection title="Schedule">
        {cycleLength > 1 && (
          <div className="mb-3 space-y-2">
            <div className="grid gap-1 rounded-full bg-gray-50 p-1" style={{ gridTemplateColumns: `repeat(${cycleLength}, 1fr)` }}>
              {Array.from({ length: cycleLength }, (_, index) => index + 1).map((value) => (
                <button
                  key={value}
                  onClick={() => setEditingWeek(value)}
                  className={
                    'h-9 rounded-full text-[13px] font-semibold transition-colors ' +
                    (week === value ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500')
                  }
                >
                  Week {value}
                </button>
              ))}
            </div>
            <div className="text-[12px] text-gray-500 leading-snug">
              The rota alternates each week of the {cycleLength}-week cycle.
            </div>
            {weekIsEmpty && (
              <button
                onClick={() => updateSchedule({ cycleWeeks: { ...(schedule.cycleWeeks || {}), [week]: schedule.weekly.map((day) => ({ ...day })) } })}
                className="text-[13px] font-medium text-gray-900 underline underline-offset-2"
              >
                Copy Week 1 hours
              </button>
            )}
          </div>
        )}
        <WeeklyScheduleEditor
          schedule={{ ...schedule, weekly }}
          onChange={updateWeekly}
        />
      </PanelSection>
      <PanelSection title="Time off and exceptions">
        <div className="divide-y divide-gray-100 border-y border-gray-100">
          {(member.schedule?.timeOff || []).length ? (
            member.schedule.timeOff.map((item) => (
              <div key={item.id} className="py-3">
                <div className="text-[14px] font-medium text-gray-900">{item.label}</div>
                <div className="text-[12px] text-gray-500 mt-0.5">{item.date}</div>
              </div>
            ))
          ) : (
            <div className="py-4 text-[13px] text-gray-500">No holiday, sickness, or time-off records.</div>
          )}
        </div>
        <RecordTimeOff
          onAdd={(record) =>
            updateSchedule({ timeOff: [...(schedule.timeOff || []), record] })
          }
        />
        <div className="mt-2 text-[12px] text-gray-500 leading-snug">
          Staff can also request time off themselves — requests wait for your approval in Schedule.
        </div>
      </PanelSection>
    </div>
  );
}

// Owner-side quick entry for holiday/sickness — the "they phoned in" path.
// Staff-initiated time off arrives as a request instead.
function RecordTimeOff({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState('');
  const [date, setDate] = useState('');

  const save = () => {
    if (!label.trim() || !date.trim()) return;
    onAdd({ id: `to_${Date.now().toString(36)}`, label: label.trim(), date: date.trim() });
    setLabel('');
    setDate('');
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 flex items-center gap-2 text-[13px] font-medium text-gray-900 underline underline-offset-2"
      >
        <Plus size={14} strokeWidth={2} />
        Record time off
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-2xl bg-gray-50 p-4 space-y-3">
      <TextField label="Reason" value={label} onChange={setLabel} placeholder="e.g. Holiday, sick day" />
      <TextField label="When" value={date} onChange={setDate} placeholder="e.g. Fri 29 May" />
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={!label.trim() || !date.trim()}
          className={
            'h-10 px-4 rounded-full text-[13px] font-medium transition-colors ' +
            (label.trim() && date.trim() ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-gray-100 text-gray-400')
          }
        >
          Save
        </button>
        <button
          onClick={() => setOpen(false)}
          className="h-10 px-4 rounded-full text-[13px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export function ScheduleFrequencyEditor({ schedule, onChange }) {
  const pattern = schedule.pattern || 'weekly';
  const cycleLength = schedule.customCycle || (pattern === 'biweekly' ? '2' : pattern === 'four_week' ? '4' : '4');

  const setPattern = (nextPattern) => {
    onChange({
      pattern: nextPattern,
      customCycle: nextPattern === 'custom' ? cycleLength : nextPattern === 'biweekly' ? '2' : nextPattern === 'four_week' ? '4' : schedule.customCycle,
      activeCycleWeek: nextPattern === 'weekly' || nextPattern === 'monthly' ? undefined : schedule.activeCycleWeek || '1',
    });
  };

  return (
    <div className="space-y-4 border-y border-gray-100 py-4">
      <ProductSelect
        label="Repeats"
        value={pattern}
        onChange={setPattern}
        options={SCHEDULE_PATTERNS.map((item) => ({ value: item.key, label: item.label, desc: item.desc }))}
      />

      {['biweekly', 'four_week', 'custom'].includes(pattern) && (
        <div className="grid grid-cols-2 gap-3">
          {pattern === 'custom' ? (
            <ProductSelect
              label="Cycle length"
              value={cycleLength}
              onChange={(customCycle) => onChange({ customCycle })}
              options={CUSTOM_CYCLE_OPTIONS}
            />
          ) : (
            <ReadOnlyField label="Cycle length" value={pattern === 'biweekly' ? '2 weeks' : '4 weeks'} />
          )}
          <TextField
            label="Cycle starts"
            type="date"
            value={schedule.cycleStarts || ''}
            onChange={(cycleStarts) => onChange({ cycleStarts })}
          />
        </div>
      )}

      {pattern === 'flexi' ? (
        <div className="space-y-3">
          <ProductSelect
            label="Flexi mode"
            value={schedule.flexiMode || 'open_shifts'}
            onChange={(flexiMode) => onChange({ flexiMode })}
            options={FLEXI_OPTIONS}
          />
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Notice hours"
              type="number"
              value={schedule.noticeHours || ''}
              onChange={(noticeHours) => onChange({ noticeHours })}
              placeholder="24"
            />
            <TextField
              label="Max shifts/week"
              type="number"
              value={schedule.maxShifts || ''}
              onChange={(maxShifts) => onChange({ maxShifts })}
              placeholder="3"
            />
          </div>
        </div>
      ) : pattern === 'weekly' ? (
        <TextField
          label="Cycle starts"
          type="date"
          value={schedule.cycleStarts || ''}
          onChange={(cycleStarts) => onChange({ cycleStarts })}
        />
      ) : null}

      <div className="text-[12px] text-gray-500 leading-snug">
        The hours below apply to {scheduleFrequencyDescription(pattern, schedule)}.
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <div className="text-[13px] font-medium text-gray-700 mb-2">{label}</div>
      <div className="min-h-12 rounded-xl bg-gray-50 px-4 py-3 text-[15px] text-gray-900">{value}</div>
    </div>
  );
}

function MemberProfileAccess({ member, onPatch, onProfileChange }) {
  return (
    <div className="space-y-5">
      <PanelSection title="Booking access">
        <div className="space-y-4 border-y border-gray-100 py-4">
          <ToggleField
            label="Can take bookings?"
            description="When off, they remain on the team but cannot be assigned to client appointments."
            checked={Boolean(member.bookable)}
            onChange={(bookable) => onPatch({ bookable, services: bookable ? member.services : [] })}
          />
          <ToggleField
            label="Show on public profile"
            description="They only appear publicly after the invite is accepted and onboarding is complete."
            checked={Boolean(member.profile?.publicWhenOnboarded || member.profile?.visibleOnProfile)}
            onChange={(visible) => onProfileChange({ publicWhenOnboarded: visible, visibleOnProfile: visible && member.status === 'active' })}
          />
        </div>
      </PanelSection>

      <PanelSection title="Access level">
        <AccessLevelEditor member={member} onPatch={onPatch} />
      </PanelSection>
    </div>
  );
}

function AccessLevelEditor({ member, onPatch }) {
  const [customOpen, setCustomOpen] = useState(false);
  const selected = selectedAccessLevel(member);

  return (
    <div>
      <div className="divide-y divide-gray-100 border-y border-gray-100">
        {ACCESS_LEVELS.map((level) => {
          const active = selected === level.key;
          return (
            <button
              key={level.key}
              onClick={() => onPatch({ accessLevel: level.key, permissions: { ...level.permissions } })}
              disabled={level.disabled}
              className={
                'w-full py-3.5 flex items-center gap-3 text-left transition-colors ' +
                (level.disabled ? 'opacity-40' : 'hover:bg-gray-50')
              }
            >
              <span
                className={
                  'w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ' +
                  (active ? 'border-gray-900' : 'border-gray-300')
                }
              >
                {active && <span className="w-2.5 h-2.5 rounded-full bg-gray-900" />}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-[14px] font-medium text-gray-900">{level.label}</span>
                <span className="block text-[12px] text-gray-500 mt-0.5 leading-snug">{level.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="border-b border-gray-100">
        <button
          onClick={() => setCustomOpen((open) => !open)}
          className="w-full py-3.5 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
        >
          <span className="flex-1 text-[14px] font-medium text-gray-900">Customise access</span>
          {selected === 'custom' && <span className="text-[12px] font-medium text-gray-500 shrink-0">Custom</span>}
          <ChevronRight
            size={16}
            strokeWidth={2}
            className={'text-gray-400 shrink-0 transition-transform ' + (customOpen ? 'rotate-90' : '')}
          />
        </button>
        {customOpen && (
          <div className="pb-4">
            <PermissionEditor
              permissions={member.permissions || {}}
              onChange={(permissions) => onPatch({ permissions })}
              bare
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Derive the highlighted access level from the member's permissions. Falls
// back to the stored accessLevel when two presets share a permission set
// (Staff and Front desk), and to 'custom' when the toggles match no preset.
function selectedAccessLevel(member) {
  const permissions = member.permissions || {};
  const matches = ACCESS_LEVELS.filter(
    (level) =>
      level.permissions &&
      PERMISSIONS.every(({ key }) => Boolean(permissions[key]) === Boolean(level.permissions[key])),
  );
  if (!matches.length) return 'custom';
  const stored = matches.find((level) => level.key === member.accessLevel);
  return (stored || matches[0]).key;
}

function MemberProfileDetails({ member, onPatch, onProfileChange }) {
  return (
    <PanelSection title="Personal details">
      <div className="space-y-4">
        <TextField label="Name" value={member.name} onChange={(name) => onPatch({ name })} />
        <TextField label="Email" type="email" value={member.email || ''} onChange={(email) => onPatch({ email })} />
        <TextField label="Phone" value={member.phone || ''} onChange={(phone) => onPatch({ phone })} />
        <TextField label="Job title" value={member.role || ''} onChange={(role) => onPatch({ role })} />
        <TextField
          label="Public display name"
          value={member.profile?.publicName || ''}
          onChange={(publicName) => onProfileChange({ publicName })}
          placeholder={member.name}
        />
        <TextField
          label="Bio"
          rows={3}
          value={member.profile?.bio || ''}
          onChange={(bio) => onProfileChange({ bio })}
          placeholder="Short intro shown on their booking profile"
        />
      </div>
    </PanelSection>
  );
}

function MemberProfileWorkspaces({ member, onPatch }) {
  if (!member.bookable) {
    return (
      <PanelSection title="Services">
        <div className="border-y border-gray-100 py-5">
          <div className="text-[16px] font-semibold text-gray-900">Bookings are off</div>
          <div className="text-[13px] text-gray-500 mt-1 leading-snug">
            Turn bookings on in Access before assigning services.
          </div>
        </div>
      </PanelSection>
    );
  }

  return (
    <ServicesSelector
      selectedServices={member.services || []}
      onChange={(services) => onPatch({ services })}
    />
  );
}

function MemberProfilePay({ member, onChange }) {
  const [editing, setEditing] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const payment = normalisePayment(member.payment);
  const line = calculatePayrollLine(member);
  const firstName = member.name.split(' ')[0];
  const isSet = payment.model && payment.model !== 'unset' && payment.model !== 'none';

  // Freelancers aren't paid by the business — the business collects rent
  // and/or commission, so their pay area is a terms summary.
  if (isFreelancerMember(member)) {
    const freelance = member.freelance || {};
    return (
      <div className="space-y-5">
        <div className="rounded-3xl border border-gray-200 p-5">
          <div className="text-[15px] font-semibold text-gray-950">Your agreement with {firstName}</div>
          <div className="mt-4 divide-y divide-gray-100">
            {freelance.rentEnabled && (
              <PayDetailRow label="Chair / space rent" value={`£${freelance.rentAmount} ${freelance.rentFrequency}`} />
            )}
            {freelance.commissionEnabled && (
              <PayDetailRow
                label="Your cut"
                value={`${freelance.commissionPercent}% of ${firstName}'s earnings — for using the space`}
              />
            )}
            {!freelance.rentEnabled && !freelance.commissionEnabled && (
              <div className="py-3 text-[13px] text-gray-500">No rent agreement set yet.</div>
            )}
            <PayDetailRow label="Collected" value="Automatically via Stripe" />
          </div>
        </div>
        <div className="text-[12px] text-gray-500 leading-snug">
          {firstName} sets their own prices and keeps their own earnings — splits land in their Stripe account as bookings are paid.
        </div>
      </div>
    );
  }

  if (editing || !isSet) {
    if (!editing) {
      return (
        <div className="rounded-3xl border border-gray-200 p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-700">
            <WalletCards size={20} strokeWidth={1.75} />
          </div>
          <div className="mt-5 text-[20px] font-semibold tracking-tight text-gray-950">Set up {firstName}'s pay</div>
          <div className="mt-2 text-[13px] text-gray-500 leading-snug">
            Answer two quick questions and wages or commission calculate automatically each week.
          </div>
          <button
            onClick={() => setEditing(true)}
            className="mt-6 w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
          >
            Set up pay
          </button>
          <div className="mt-3 text-[12px] text-gray-400 leading-snug">
            Optional — {firstName} can take bookings without this.
          </div>
        </div>
      );
    }
    return (
      <PaySetupFlow
        memberName={member.name}
        onComplete={(next) => {
          onChange(next);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-gray-200 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[15px] font-semibold text-gray-950">{paymentModelLabel(payment.model)}</div>
            <div className="text-[12px] text-gray-500 mt-0.5">
              {payment.rate ? `£${payment.rate} ${payment.ratePeriod === 'monthly' ? '/ month' : payment.ratePeriod === 'weekly' ? '/ week' : '/ hour'}` : 'No base pay'}
              {Number(payment.commission) > 0 ? ` · ${payment.commission}% commission` : ''}
              {payment.tips ? ' · keeps tips' : ''}
            </div>
          </div>
          <StatusPill label={stripeStatusLabel(line.bankStatus)} tone={line.bankStatus === 'ready' ? 'success' : 'muted'} />
        </div>
        <button
          onClick={() => setEditing(true)}
          className="mt-4 text-[13px] font-medium text-gray-900 underline underline-offset-2"
        >
          Edit pay
        </button>
      </div>

      <div className="rounded-3xl border border-gray-200 px-5">
        <button
          onClick={() => setDetailsOpen((open) => !open)}
          className="w-full py-4 flex items-center gap-3 text-left"
        >
          <span className="flex-1 text-[14px] font-medium text-gray-900">This pay run</span>
          <span className="text-[13px] font-semibold text-gray-950">{formatMoney(line.net)}</span>
          <ChevronRight
            size={16}
            strokeWidth={2}
            className={'text-gray-400 shrink-0 transition-transform ' + (detailsOpen ? 'rotate-90' : '')}
          />
        </button>
        {detailsOpen && (
          <div className="pb-4 divide-y divide-gray-100 border-t border-gray-100">
            <PayDetailRow label="Wages" value={formatMoney(line.wages)} />
            <PayDetailRow label="Commission" value={`${formatMoney(line.commission)} from ${formatMoney(line.sales)} sales`} />
            <PayDetailRow label="Tips" value={formatMoney(line.tips)} />
            <PayDetailRow label="Net pay" value={formatMoney(line.net)} strong />
          </div>
        )}
      </div>
    </div>
  );
}

function PayDetailRow({ label, value, strong = false }) {
  return (
    <div className="py-3 flex items-start justify-between gap-4">
      <div className="text-[13px] text-gray-500">{label}</div>
      <div className={(strong ? 'font-semibold text-gray-950' : 'font-medium text-gray-900') + ' text-[14px] text-right leading-snug'}>
        {value}
      </div>
    </div>
  );
}

// Setup checklist auto-completion for quick-add members (member.setup set).
// When a profile tab saves pay, schedule, or services data the matching setup
// flag flips to done; once every required item is complete the member is
// promoted from 'needs_setup' to 'active' and the checklist disappears.
function withSetupProgress(current, next) {
  if (!current.setup) return next;
  const setup = { ...current.setup, ...(next.setup || {}) };
  if ('payment' in next) setup.pay = true;
  if ('schedule' in next) setup.schedule = true;
  if ('locations' in next || 'locationPrefs' in next) setup.location = true;
  if (Array.isArray(next.services) && next.services.length > 0) setup.services = true;
  const merged = { ...current, ...next, setup };
  const activate = current.status === 'needs_setup' && setupItemsComplete(merged);
  return {
    ...next,
    setup,
    ...(activate ? { status: 'active', active: true } : {}),
  };
}

function setupItemsComplete(member) {
  const setup = member.setup || {};
  const needsServices = member.memberType !== 'freelancer' && Boolean(member.bookable);
  // Pay is intentionally optional — a team can run without pay tracking.
  return Boolean(setup.schedule && setup.location && (!needsServices || setup.services));
}

// Header pill label. Old demo members have no memberType, so it is derived
// from their payment type (contractor → freelancer).
function memberTypePillLabel(member) {
  const type = member.memberType || (member.payment?.type === 'contractor' ? 'freelancer' : 'employee');
  if (type !== 'freelancer') return 'Employee';
  const rentEnabled = Boolean(member.freelance?.rentEnabled || member.payment?.chairRentEnabled);
  return rentEnabled ? 'Freelancer · chair renter' : 'Freelancer';
}

function markInviteAccepted(current) {
  return {
    status: 'active',
    active: true,
    invite: { ...(current.invite || {}), acceptedAt: 'Just now' },
    onboarding: { ...(current.onboarding || {}), accepted: true, profileComplete: true },
    profile: {
      ...(current.profile || {}),
      visibleOnProfile: Boolean(current.bookable && current.profile?.publicWhenOnboarded),
    },
  };
}

function normalisePayment(payment = {}) {
  const model = payment.model || (payment.type === 'contractor' ? 'commission' : 'hourly');
  const rateMatch = typeof payment.payRate === 'string' ? payment.payRate.match(/(\d+(?:\.\d+)?)/) : null;
  return {
    setupMode: payment.setupMode || 'manual',
    structureId: payment.structureId || '',
    copiedFromMemberId: payment.copiedFromMemberId || '',
    model,
    paymentType: payment.paymentType || model,
    rate: payment.rate || payment.terms?.rate || rateMatch?.[1] || '',
    ratePeriod: payment.ratePeriod || payment.terms?.ratePeriod || 'hourly',
    commission: String(payment.commission || payment.terms?.commission || ''),
    commissionEnabled: Boolean(payment.commissionEnabled || payment.terms?.commissionEnabled || Number(payment.commission) > 0),
    rentAmount: payment.terms?.rentAmount || payment.rentAmount || '',
    rentFrequency: payment.terms?.rentFrequency || payment.rentFrequency || 'weekly',
    chairRentEnabled: Boolean(payment.chairRentEnabled || payment.terms?.chairRentEnabled || payment.terms?.rentAmount || payment.rentAmount),
    payout: payment.payout || (payment.payoutStatus === 'Not required' ? 'not_required' : 'member'),
    walletRequired: payment.walletRequired ?? payment.terms?.walletRequired ?? (model !== 'none'),
    includedInPayRuns: payment.includedInPayRuns ?? payment.terms?.includedInPayRuns ?? (model !== 'none'),
    timesheetSource: payment.timesheetSource || payment.terms?.timesheetSource || 'scheduled',
    overtimeEnabled: Boolean(payment.overtimeEnabled || payment.terms?.overtimeEnabled || payment.overtimeRate || payment.terms?.overtimeRate),
    overtimeRate: payment.overtimeRate || payment.terms?.overtimeRate || '',
    paidBreaks: Boolean(payment.paidBreaks || payment.terms?.paidBreaks),
    tipsIncluded: payment.tipsIncluded ?? payment.terms?.tipsIncluded ?? payment.tips !== false,
    deductionsAllowed: payment.deductionsAllowed ?? payment.terms?.deductionsAllowed ?? (model !== 'none'),
    commissionBasis: payment.commissionBasis || payment.terms?.commissionBasis || 'services',
    commissionType: payment.commissionType || payment.terms?.commissionType || 'fixed',
    commissionEffectiveDate: payment.commissionEffectiveDate || payment.terms?.commissionEffectiveDate || '',
  };
}

function normaliseLocationPrefs(member) {
  const locations = member.locations?.length ? member.locations : ['loc1'];
  return {
    primaryLocationId: member.locationPrefs?.primaryLocationId || locations[0],
    allowedLocationIds: member.locationPrefs?.allowedLocationIds?.length ? member.locationPrefs.allowedLocationIds : locations,
    mobile: Boolean(member.locationPrefs?.mobile),
    remote: Boolean(member.locationPrefs?.remote),
  };
}

export function AddTeamMemberWizard() {
  const navigate = useNavigate();
  const { addTeamMember, teamMembers = fallbackTeamMembers } = useOutletContext();
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState(() => emptyTeamMemberWizardDraft());
  const step = TEAM_WIZARD_STEPS[stepIndex];
  const setupChecks = wizardSetupChecks(draft);
  const blockingChecks = setupChecks.filter((check) => check.blocking);

  const update = (patch) => setDraft((current) => ({ ...current, ...patch }));
  const updateNested = (key, patch) =>
    setDraft((current) => ({ ...current, [key]: { ...(current[key] || {}), ...patch } }));

  const setMemberType = (memberType) => {
    const template = templateDefaults(memberType);
    setDraft((current) => ({
      ...current,
      ...template,
      memberType,
      permissions: defaultPermissionsFor(template.systemRoles),
    }));
  };

  const canContinue = step.key === 'details'
    ? draft.name.trim().length > 0 && draft.email.trim().length > 0
    : step.key === 'review'
      ? blockingChecks.length === 0
      : true;
  const atLastStep = stepIndex === TEAM_WIZARD_STEPS.length - 1;

  const goBack = () => {
    if (stepIndex === 0) {
      navigate('/team');
      return;
    }
    setStepIndex((value) => value - 1);
  };

  const goNext = () => {
    if (!canContinue) return;
    if (!atLastStep) {
      setStepIndex((value) => value + 1);
      return;
    }
    const member = buildWizardMember(draft);
    addTeamMember?.(member);
    navigate(`/team/${member.id}`, { replace: true });
  };

  return (
    <>
      <ScreenHeader title="Add team member" onBack={goBack} border />
      <div className="flex-1 overflow-y-auto bg-white px-5 pt-5 pb-28">
        <WizardProgress steps={TEAM_WIZARD_STEPS} activeIndex={stepIndex} />

        {step.key === 'details' && (
          <StaffDetailsStep
            draft={draft}
            update={update}
            updateProfile={(patch) => updateNested('profile', patch)}
            onMemberType={setMemberType}
          />
        )}
        {step.key === 'services' && (
          <ServicesSetupStep
            draft={draft}
            update={(services) => update({ services })}
          />
        )}
        {step.key === 'pay' && (
          <PaySetupStep
            draft={draft}
            teamMembers={teamMembers}
            update={(patch) => updateNested('payment', patch)}
          />
        )}
        {step.key === 'schedule' && (
          <ScheduleSetupStep
            draft={draft}
            update={(patch) => updateNested('schedule', patch)}
          />
        )}
        {step.key === 'locations' && (
          <LocationsSetupStep
            draft={draft}
            update={(patch) => updateNested('locations', patch)}
          />
        )}
        {step.key === 'permissions' && (
          <PermissionsSetupStep
            draft={draft}
            update={update}
            updatePermissions={(permissions) => update({ permissions })}
          />
        )}
        {step.key === 'review' && (
          <ReviewSetupStep
            draft={draft}
            checks={setupChecks}
          />
        )}
      </div>

      <div className="absolute left-0 right-0 bottom-0 px-5 pb-5 pt-3 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <button
            onClick={goBack}
            className="w-24 h-12 rounded-full border border-gray-200 text-gray-900 text-[15px] font-medium hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={goNext}
            disabled={!canContinue}
            className={
              'flex-1 h-12 rounded-full text-[15px] font-medium transition-colors ' +
              (canContinue ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-gray-100 text-gray-400')
            }
          >
            {atLastStep ? 'Create and invite' : 'Next'}
          </button>
        </div>
      </div>
    </>
  );
}

function WizardProgress({ steps, activeIndex }) {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-[22px] font-semibold tracking-tight text-gray-900">{steps[activeIndex].label}</div>
          <div className="text-[13px] text-gray-500 mt-0.5">Step {activeIndex + 1} of {steps.length}</div>
        </div>
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
        {steps.map((item, index) => (
          <div
            key={item.key}
            className={'h-1.5 rounded-full ' + (index <= activeIndex ? 'bg-gray-900' : 'bg-gray-200')}
          />
        ))}
      </div>
    </div>
  );
}

function StaffDetailsStep({ draft, update, updateProfile, onMemberType }) {
  const memberType = MEMBER_TEMPLATES.find((item) => item.key === draft.memberType);

  return (
    <div className="space-y-8">
      <WizardFormSection title="Basics" description="Choose what kind of team member this is and add their name.">
        <SelectField
          label="Member type"
          value={draft.memberType}
          onChange={onMemberType}
          options={MEMBER_TEMPLATES.map((item) => ({ value: item.key, label: item.label, desc: item.desc }))}
        />
        {memberType?.desc && (
          <div className="rounded-2xl bg-gray-50 px-4 py-3 text-[13px] leading-snug text-gray-600">
            {memberType.desc}
          </div>
        )}
        <TextField label="Full name" value={draft.name} onChange={(name) => update({ name })} placeholder="Sofia Ellis" />
      </WizardFormSection>

      <WizardFormSection title="Contact info" description="Used for their invite and account setup.">
        <TextField label="Email" type="email" value={draft.email} onChange={(email) => update({ email })} placeholder="sofia@example.com" />
        <TextField label="Phone optional" value={draft.phone} onChange={(phone) => update({ phone })} placeholder="+44..." />
      </WizardFormSection>

      <WizardFormSection title="Employment info" description="These details help owners identify their role in the team.">
        <TextField label="Job title" value={draft.role} onChange={(role) => update({ role })} placeholder="Senior stylist" />
        <TextField label="Start date optional" type="date" value={draft.startDate} onChange={(startDate) => update({ startDate })} />
      </WizardFormSection>

      {draft.memberType !== 'admin' && (
        <WizardFormSection title="Booking profile" description="Decide if they can take bookings and whether they can appear publicly later.">
          <ToggleField
            label="Can take bookings?"
            description="When on, this member can be assigned to services, shifts, and client appointments."
            checked={Boolean(draft.bookable)}
            onChange={(bookable) => update({
              bookable,
              services: bookable ? draft.services : [],
              profile: bookable ? draft.profile : { ...draft.profile, visibility: 'private' },
            })}
          />
          {draft.bookable && (
            <ToggleField
              label="Show on public profile"
              description="They stay hidden until they accept the invite and complete onboarding."
              checked={draft.profile.visibility === 'public'}
              onChange={(visible) => updateProfile({ visibility: visible ? 'public' : 'private' })}
            />
          )}
        </WizardFormSection>
      )}
    </div>
  );
}

function ServicesSetupStep({ draft, update }) {
  if (draft.memberType === 'admin' || !draft.bookable) {
    return (
      <WizardFormSection title="Services" description="Service assignment is only needed for people who take bookings.">
        <div className="py-2">
          <div className="text-[16px] font-semibold text-gray-900">No booking services needed</div>
          <div className="text-[13px] text-gray-500 mt-1 leading-snug">
            This member is not taking client bookings, so they do not need service assignments.
          </div>
        </div>
      </WizardFormSection>
    );
  }

  return (
    <ServicesSelector
      selectedServices={draft.services}
      onChange={update}
    />
  );
}

export function ServicesSelector({ selectedServices, onChange }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const serviceOptions = demoServices.filter((item) => item.type === 'service' || item.type === 'class');
  const categories = Array.from(new Set(serviceOptions.map((service) => service.category).filter(Boolean)));
  const filtered = serviceOptions.filter((service) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || [service.name, service.category, service.type]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(q);
    const matchesCategory = category === 'all' || service.category === category;
    return matchesQuery && matchesCategory;
  });
  const visibleNames = filtered.map((service) => service.name);
  const allVisibleSelected = visibleNames.length > 0 && visibleNames.every((name) => selectedServices.includes(name));

  const toggleService = (name) => {
    onChange(
      selectedServices.includes(name)
        ? selectedServices.filter((item) => item !== name)
        : [...selectedServices, name],
    );
  };

  const toggleVisible = () => {
    if (allVisibleSelected) {
      onChange(selectedServices.filter((name) => !visibleNames.includes(name)));
      return;
    }
    onChange(Array.from(new Set([...selectedServices, ...visibleNames])));
  };

  return (
    <div className="space-y-8">
      <WizardFormSection>
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3">
            <Search size={15} className="text-gray-400 shrink-0" strokeWidth={1.75} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search services"
              className="flex-1 min-w-0 bg-transparent text-[15px] outline-none placeholder:text-gray-400"
            />
          </div>
          <div>
            <div className="text-[13px] font-medium text-gray-700 mb-2">Category</div>
            <div className="-mx-4 overflow-x-auto px-4">
              <div className="flex gap-2 min-w-max">
                {[
                  { value: 'all', label: 'All' },
                  ...categories.map((item) => ({ value: item, label: item })),
                ].map((item) => {
                  const active = category === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setCategory(item.value)}
                      className={
                        'h-10 px-4 rounded-full text-[13px] font-medium transition-colors ' +
                        (active ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100')
                      }
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
      </WizardFormSection>

      <WizardFormSection title="Assigned services">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="text-[14px] font-medium text-gray-500">{selectedServices.length} selected</div>
          {visibleNames.length > 0 && (
            <button
              type="button"
              onClick={toggleVisible}
              className="h-9 px-3 rounded-full bg-gray-50 text-[13px] font-medium text-gray-900 hover:bg-gray-100"
            >
              {allVisibleSelected ? 'Clear visible' : 'Select visible'}
            </button>
          )}
        </div>
        <div className="divide-y divide-gray-100 border-y border-gray-100">
          {filtered.length > 0 ? (
            filtered.map((service) => {
              const selected = selectedServices.includes(service.name);
              return (
                <label key={service.id} className="flex items-center gap-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleService(service.name)}
                    className="h-4 w-4 rounded border-gray-300 accent-gray-900"
                  />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[14px] font-medium text-gray-900 truncate">{service.name}</span>
                    <span className="block text-[12px] text-gray-500 truncate">{service.category} · {service.type}</span>
                  </span>
                </label>
              );
            })
          ) : (
            <div className="p-5 text-center text-[13px] text-gray-500">No services match this filter.</div>
          )}
        </div>
      </WizardFormSection>
    </div>
  );
}

function PaySetupStep({ draft, update }) {
  return (
    <div className="space-y-8">
      <PaymentSetupFields payment={draft.payment} onChange={update} />
    </div>
  );
}

function PaymentSetupFields({ payment, onChange }) {
  const [commissionSheetOpen, setCommissionSheetOpen] = useState(false);
  const model = payment.model || 'hourly';
  const hasPayments = model !== 'none';
  const hasBaseRate = ['hourly', 'salary'].includes(model);
  const commissionOn = Boolean(payment.commissionEnabled);
  const chairRentOn = Boolean(payment.chairRentEnabled);
  const overtimeOn = Boolean(payment.overtimeEnabled);
  const ratePeriodOptions = model === 'salary'
    ? [
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'yearly', label: 'Yearly' },
    ]
    : [{ value: 'hourly', label: 'Hourly' }];

  const setModel = (nextModel) => {
    const disabled = nextModel === 'none';
    onChange({
      model: nextModel,
      paymentType: nextModel,
      rate: ['hourly', 'salary'].includes(nextModel) ? payment.rate : '',
      ratePeriod: nextModel === 'salary' ? 'monthly' : nextModel === 'hourly' ? 'hourly' : payment.ratePeriod,
      commissionEnabled: disabled ? false : payment.commissionEnabled,
      chairRentEnabled: disabled ? false : payment.chairRentEnabled,
      tipsIncluded: disabled ? false : payment.tipsIncluded !== false,
      deductionsAllowed: disabled ? false : Boolean(payment.deductionsAllowed || payment.chairRentEnabled),
      payout: disabled ? 'not_required' : 'member',
      walletRequired: !disabled,
      includedInPayRuns: !disabled,
      timesheetSource: nextModel === 'hourly' ? payment.timesheetSource || 'scheduled' : payment.timesheetSource || 'manual',
      setupMode: 'manual',
      structureId: '',
      copiedFromMemberId: '',
    });
  };

  return (
    <div className="space-y-8">
      <WizardFormSection title="Base pay" description="Choose the simple base arrangement. Commission, tips, and chair rent are added separately.">
        <ProductSelect
          label="Pay arrangement"
          value={model}
          onChange={setModel}
          options={PAYMENT_MODELS.map((item) => ({ value: item.key, label: item.label, desc: item.desc }))}
        />

        {hasBaseRate && (
          <MoneyRateField
            label={model === 'salary' ? 'Salary amount' : 'Hourly rate'}
            value={payment.rate}
            period={payment.ratePeriod}
            onValueChange={(rate) => onChange({ rate })}
            onPeriodChange={(ratePeriod) => onChange({ ratePeriod })}
            periodOptions={ratePeriodOptions}
          />
        )}
      </WizardFormSection>

      {hasPayments && (
        <WizardFormSection title="Hours and pay run" description="Keep pay runs simple for setup. Detailed payroll rules can be managed later from Pay.">
          {model === 'hourly' && (
            <ProductSelect
              label="Hours source"
              value={payment.timesheetSource || 'scheduled'}
              onChange={(timesheetSource) => onChange({ timesheetSource })}
              options={[
                { value: 'scheduled', label: 'Scheduled shifts' },
                { value: 'clock_in', label: 'Clock in/out' },
                { value: 'manual', label: 'Manual approval' },
              ]}
            />
          )}
          <div className="grid grid-cols-2 gap-3">
            <ProductSelect
              label="Pay run"
              value={payment.payFrequency || 'business_default'}
              onChange={(payFrequency) => onChange({ payFrequency })}
              options={[
                { value: 'business_default', label: 'Business default' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'fortnightly', label: 'Fortnightly' },
                { value: 'monthly', label: 'Monthly' },
              ]}
            />
            <ToggleField
              label="Overtime"
              description="Optional for hourly staff."
              checked={overtimeOn}
              onChange={(overtimeEnabled) => onChange({ overtimeEnabled, overtimeRate: overtimeEnabled ? payment.overtimeRate : '' })}
            />
          </div>

          {overtimeOn && (
            <TextField
              label="Overtime rate"
              value={payment.overtimeRate || ''}
              onChange={(overtimeRate) => onChange({ overtimeRate })}
              placeholder="1.5x"
            />
          )}
        </WizardFormSection>
      )}

      {hasPayments && (
        <WizardFormSection title="Add-ons" description="Layer commission, tips, and chair rent on top of the base setup when needed.">
          <div className="space-y-4">
            {commissionOn ? (
              <PayRuleSummary
                title="Commission"
                detail={commissionRuleSummary(payment)}
                onEdit={() => setCommissionSheetOpen(true)}
                onRemove={() => onChange({ commissionEnabled: false, commission: '', commissionType: 'percentage' })}
              />
            ) : (
              <InlineAddButton label="Add commission" onClick={() => {
                onChange({ commissionEnabled: true, commissionType: 'percentage', commissionBasis: payment.commissionBasis || 'services' });
                setCommissionSheetOpen(true);
              }} />
            )}

            <ToggleField
              label="Tips"
              description="Include tips in their pay breakdown."
              checked={payment.tipsIncluded !== false}
              onChange={(tipsIncluded) => onChange({ tipsIncluded })}
            />

            {chairRentOn ? (
              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[14px] font-medium text-gray-900">Chair rent</div>
                    <div className="text-[12px] text-gray-500 mt-0.5">Deduct a rent fee from pay runs.</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onChange({ chairRentEnabled: false, rentAmount: '' })}
                    className="text-[13px] font-medium text-gray-500"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-[1fr_120px] gap-3">
                  <TextField
                    label="Rent amount"
                    value={payment.rentAmount}
                    onChange={(rentAmount) => onChange({ rentAmount, deductionsAllowed: true })}
                    placeholder="250"
                  />
                  <ProductSelect
                    label="Frequency"
                    value={payment.rentFrequency}
                    onChange={(rentFrequency) => onChange({ rentFrequency })}
                    options={[
                      { value: 'weekly', label: 'Weekly' },
                      { value: 'monthly', label: 'Monthly' },
                    ]}
                  />
                </div>
              </div>
            ) : (
              <InlineAddButton label="Add chair rent" onClick={() => onChange({ chairRentEnabled: true, deductionsAllowed: true })} />
            )}
          </div>
        </WizardFormSection>
      )}

      {hasPayments && (
        <WizardFormSection title="Payouts" description="Approved pay goes to their Stripe account. They connect their own bank through Stripe onboarding.">
          <ToggleField
            label="Include in pay runs"
            description="Show this person when the owner authorises payouts."
            checked={Boolean(payment.includedInPayRuns)}
            onChange={(includedInPayRuns) => onChange({ includedInPayRuns })}
          />
          <div className="py-2">
            <div className="text-[14px] font-medium text-gray-900">Payout destination</div>
            <div className="text-[13px] text-gray-500 mt-1 leading-snug">Staff wallet after invite. Bank account and withdrawals are completed by the staff member.</div>
          </div>
        </WizardFormSection>
      )}

      <PayPreview payment={payment} />

      <BottomSheet open={commissionSheetOpen} onClose={() => setCommissionSheetOpen(false)} title="Commission rule">
        <div className="space-y-4">
          <ProductSelect
            label="Commission type"
            value={payment.commissionType || 'percentage'}
            onChange={(commissionType) => onChange({ commissionType })}
            options={[
              { value: 'percentage', label: 'Percentage' },
              { value: 'fixed_amount', label: 'Fixed amount' },
            ]}
          />
          <TextField
            label={payment.commissionType === 'fixed_amount' ? 'Amount' : 'Percentage'}
            type="number"
            value={payment.commission}
            onChange={(commission) => onChange({ commission })}
            placeholder={payment.commissionType === 'fixed_amount' ? '5' : '10'}
          />
          <ProductSelect
            label="Applies to"
            value={payment.commissionBasis || 'services'}
            onChange={(commissionBasis) => onChange({ commissionBasis })}
            options={[
              { value: 'services', label: 'Services' },
              { value: 'service_addons', label: 'Service add-ons' },
              { value: 'products', label: 'Products' },
              { value: 'memberships', label: 'Memberships' },
              { value: 'all_offerings', label: 'All offerings' },
            ]}
          />
          <ProductSelect
            label="Advanced scope"
            value={payment.commissionScope || 'all_locations'}
            onChange={(commissionScope) => onChange({ commissionScope })}
            options={[
              { value: 'all_locations', label: 'All locations and times' },
              { value: 'location_rules_later', label: 'Add location rules later' },
              { value: 'time_rules_later', label: 'Add time/date rules later' },
            ]}
          />
          <button
            type="button"
            onClick={() => setCommissionSheetOpen(false)}
            className="w-full h-12 rounded-2xl bg-gray-950 text-white text-[14px] font-semibold"
          >
            Save commission
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

function PayPreview({ payment }) {
  const checks = paymentSetupChecks(payment);
  const blocking = checks.filter((item) => item.blocking);
  const hasPayments = payment.model !== 'none';
  return (
    <section className="space-y-3">
      <div className="text-[18px] font-semibold tracking-tight text-gray-950">Pay preview</div>
      <div className="bg-gray-950 text-white rounded-3xl p-5 overflow-hidden relative">
        <div className="relative z-10 space-y-4">
          <div>
            <div className="text-[13px] text-white/60">Gross basis</div>
            <div className="text-[20px] font-semibold mt-0.5">{hasPayments ? paymentTermsSummary(payment) : 'Not included in payroll'}</div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-[13px]">
            <div>
              <div className="text-white/50">Deductions / rent</div>
              <div className="font-medium mt-1">{payment.chairRentEnabled ? `${payment.rentAmount || 'Rent'} ${payment.rentFrequency || 'weekly'}` : payment.deductionsAllowed ? 'Allowed' : 'Off'}</div>
            </div>
            <div>
              <div className="text-white/50">Payout route</div>
              <div className="font-medium mt-1">{payoutLabel(payment.payout)}</div>
            </div>
            <div>
              <div className="text-white/50">Pay runs</div>
              <div className="font-medium mt-1">{payment.includedInPayRuns ? 'Included' : 'Excluded'}</div>
            </div>
            <div>
              <div className="text-white/50">Wallet setup</div>
              <div className="font-medium mt-1">{payment.walletRequired ? 'Staff completes' : 'Not required'}</div>
            </div>
          </div>
          <div className="pt-2 border-t border-white/10">
            <div className="text-[12px] font-medium text-white/60 mb-2">
              {blocking.length ? `${blocking.length} blocker${blocking.length === 1 ? '' : 's'}` : 'Ready for setup'}
            </div>
            <div className="flex flex-wrap gap-2">
              {checks.map((check) => (
                <span key={check.label} className={'rounded-full px-2.5 py-1 text-[11px] font-medium ' + (check.blocking ? 'bg-amber-300 text-gray-950' : 'bg-white/10 text-white')}>
                  {check.label}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-12 w-36 h-36 rounded-full bg-white/10" />
      </div>
    </section>
  );
}

function ReviewSetupStep({ draft, checks }) {
  const blocking = checks.filter((check) => check.blocking);
  const reviewRows = [
    { label: 'Profile', value: `${draft.name || 'Unnamed'} · ${draft.email || 'No email'}` },
    { label: 'Type', value: memberTypeLabel(draft.memberType) },
    { label: 'Bookings', value: draft.bookable ? `${draft.services.length} service${draft.services.length === 1 ? '' : 's'} assigned` : 'Not taking bookings' },
    { label: 'Pay', value: paymentTermsSummary(draft.payment) },
    { label: 'Pay add-ons', value: paymentAddOnSummary(draft.payment) },
    { label: 'Schedule', value: schedulePatternLabel(draft.schedule?.pattern) },
    { label: 'Location', value: locationName(draft.locations?.primaryLocationId) },
    { label: 'Access', value: permissionPresetLabel(draft.permissionPreset) },
  ];

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div>
          <div className="text-[18px] font-semibold tracking-tight text-gray-950">Ready to create?</div>
          <div className="text-[13px] text-gray-500 mt-1 leading-snug">
            The profile and invite are created only after this step. Staff finish wallet and payout details after accepting.
          </div>
        </div>
        <div className="bg-gray-950 text-white rounded-3xl p-5">
          <div className="text-[13px] text-white/60">Invite</div>
          <div className="text-[22px] font-semibold tracking-tight mt-1">{draft.email || 'Email required'}</div>
          <div className="text-[13px] text-white/60 mt-2">
            {draft.phone ? 'Invite metadata includes email and phone.' : 'Invite metadata includes email.'}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="text-[18px] font-semibold tracking-tight text-gray-950">Setup summary</div>
        <div className="divide-y divide-gray-100">
          {reviewRows.map((row) => (
            <div key={row.label} className="py-3 flex items-start justify-between gap-4">
              <div className="text-[13px] text-gray-500">{row.label}</div>
              <div className="text-[14px] font-medium text-gray-900 text-right">{row.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[18px] font-semibold tracking-tight text-gray-950">Confidence checks</div>
          <StatusPill label={blocking.length ? `${blocking.length} to fix` : 'Ready'} tone={blocking.length ? 'muted' : 'success'} />
        </div>
        <div className="space-y-2">
          {checks.map((check) => (
            <div key={check.label} className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-b-0">
              <div className={'w-8 h-8 rounded-full flex items-center justify-center shrink-0 ' + (check.blocking ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700')}>
                {check.blocking ? <AlertCircle size={16} strokeWidth={2} /> : <Check size={16} strokeWidth={2} />}
              </div>
              <div className="min-w-0">
                <div className="text-[14px] font-medium text-gray-900">{check.label}</div>
                {check.detail && <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">{check.detail}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function paymentSetupChecks(payment = {}) {
  const checks = [];
  const model = payment.model || 'none';
  if (model === 'none') {
    checks.push({ label: 'Pay setup later', detail: 'No wages, wallet, or payout details are required now.', blocking: false });
    return checks;
  }
  if (['hourly', 'salary'].includes(model) && !payment.rate) {
    checks.push({ label: 'Add a base rate', detail: 'This is needed for payroll calculations.', blocking: true });
  }
  if (model === 'no_base' && !payment.commissionEnabled && !payment.chairRentEnabled && payment.tipsIncluded === false) {
    checks.push({ label: 'Add a pay rule', detail: 'Use commission, tips, chair rent, or choose set up later.', blocking: true });
  }
  if (payment.commissionEnabled && !Number(payment.commission || 0)) {
    checks.push({ label: 'Finish commission rule', detail: 'Add a percentage or fixed amount.', blocking: true });
  }
  if (payment.chairRentEnabled && !payment.rentAmount) {
    checks.push({ label: 'Add chair rent amount', detail: 'Rent deductions need an amount and frequency.', blocking: true });
  }
  if (payment.walletRequired) {
    checks.push({ label: 'Wallet setup after invite', detail: 'They add bank details from their staff Wallet.', blocking: false });
  }
  if (payment.includedInPayRuns) {
    checks.push({ label: 'Included in pay runs', detail: 'Owner payroll review will include this member.', blocking: false });
  }
  if (!checks.length) checks.push({ label: 'Pay setup ready', detail: 'No payroll blockers found.', blocking: false });
  return checks;
}

function wizardSetupChecks(draft = {}) {
  const checks = [];
  if (!draft.name?.trim()) checks.push({ label: 'Full name required', detail: 'Add their name before creating the profile.', blocking: true });
  if (!draft.email?.trim()) checks.push({ label: 'Email required', detail: 'The invite needs an email address.', blocking: true });
  if (draft.bookable && draft.memberType !== 'admin' && !draft.services?.length) {
    checks.push({ label: 'Assign at least one service', detail: 'Bookable staff need services before they can take appointments.', blocking: true });
  }
  paymentSetupChecks(draft.payment).forEach((check) => checks.push(check));
  const schedule = draft.schedule || {};
  const recurring = schedule.pattern !== 'flexi';
  if (recurring && !(schedule.weekly || []).some((day) => day.enabled)) {
    checks.push({ label: 'Add working days', detail: 'Recurring schedules need at least one active day.', blocking: true });
  }
  if (!checks.some((check) => check.blocking)) {
    checks.push({ label: 'Profile can be created', detail: 'Invite metadata and setup rules are ready.', blocking: false });
  }
  return checks;
}

function payoutLabel(value) {
  return PAYOUT_OPTIONS.find((item) => item.value === value)?.label || 'Member adds payout details';
}

function permissionPresetLabel(value) {
  return PERMISSION_PRESETS.find((item) => item.key === value)?.label || 'Staff';
}

function locationName(locationId) {
  return businessLocations.find((location) => location.id === locationId)?.name || 'Primary location';
}

function MoneyRateField({ label, value, period, onValueChange, onPeriodChange, periodOptions = PAY_PERIOD_OPTIONS }) {
  return (
    <div>
      <div className="text-[13px] font-medium text-gray-700 mb-2">{label}</div>
      <div className="min-h-12 rounded-xl bg-gray-50 px-4 py-1.5 flex items-center gap-3">
        <div className="text-[17px] font-medium text-gray-500">£</div>
        <input
          type="number"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder="18"
          className="flex-1 min-w-0 bg-transparent text-[15px] text-gray-900 outline-none placeholder:text-gray-400"
        />
        <ProductSelect
          value={period || 'hourly'}
          onChange={onPeriodChange}
          options={periodOptions}
          compact
          className="w-28"
          buttonClassName="bg-white h-9 min-h-0 px-3 py-0 text-[13px]"
          menuClassName="right-0"
        />
      </div>
    </div>
  );
}

function PayRuleSummary({ title, detail, onEdit, onRemove }) {
  return (
    <div className="flex items-center gap-3 py-3 border-t border-gray-100 first:border-t-0">
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-gray-900">{title}</div>
        <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">{detail}</div>
      </div>
      <button type="button" onClick={onEdit} className="text-[13px] font-medium text-gray-900">
        Edit
      </button>
      <button type="button" onClick={onRemove} className="text-[13px] font-medium text-gray-500">
        Remove
      </button>
    </div>
  );
}

function InlineAddButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-900 hover:text-gray-600"
    >
      <Plus size={14} strokeWidth={2} />
      {label}
    </button>
  );
}

function ScheduleSetupStep({ draft, update }) {
  const schedule = draft.schedule;
  const hasRecurringHours = schedule.pattern !== 'flexi';

  return (
    <div className="space-y-8">
      <WizardFormSection title="Schedule pattern" description="Choose how this person usually works. You can override shifts later from the rota.">
          <SelectField
            label="Repeats"
            value={schedule.pattern}
            onChange={(pattern) => update({ pattern })}
            options={SCHEDULE_PATTERNS.map((item) => ({ value: item.key, label: item.label }))}
          />
          {schedule.pattern === 'custom' && (
            <ProductSelect
              label="Cycle length"
              value={schedule.customCycle || '4'}
              onChange={(customCycle) => update({ customCycle })}
              options={CUSTOM_CYCLE_OPTIONS}
            />
          )}
          {schedule.pattern === 'flexi' && (
            <>
              <ProductSelect
                label="Flexi mode"
                value={schedule.flexiMode || 'open_shifts'}
                onChange={(flexiMode) => update({ flexiMode })}
                options={FLEXI_OPTIONS}
              />
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Notice hours"
                  type="number"
                  value={schedule.noticeHours || ''}
                  onChange={(noticeHours) => update({ noticeHours })}
                  placeholder="24"
                />
                <TextField
                  label="Max shifts/week"
                  type="number"
                  value={schedule.maxShifts || ''}
                  onChange={(maxShifts) => update({ maxShifts })}
                  placeholder="3"
                />
              </div>
            </>
          )}
      </WizardFormSection>
      {hasRecurringHours && (
        <WizardFormSection title="Working hours" description="Set the regular days and times for this schedule pattern.">
          <WizardWeeklySchedule
            weekly={schedule.weekly}
            onChange={(weekly) => update({ weekly })}
          />
        </WizardFormSection>
      )}
    </div>
  );
}

function PermissionsSetupStep({ draft, update, updatePermissions }) {
  const preset = draft.permissionPreset;

  const setPreset = (nextPreset) => {
    const option = PERMISSION_PRESETS.find((item) => item.key === nextPreset) || PERMISSION_PRESETS[0];
    update({
      permissionPreset: option.key,
      systemRoles: option.roles,
      permissions: defaultPermissionsFor(option.roles),
    });
  };

  return (
    <div className="space-y-8">
      <WizardFormSection title="Access preset" description="Start with a simple role, then adjust individual permissions.">
          <SelectField
            label="Preset"
            value={preset}
            onChange={setPreset}
            options={PERMISSION_PRESETS.map((item) => ({ value: item.key, label: item.label }))}
          />
      </WizardFormSection>
      <WizardFormSection title="Permissions" description="Choose what this team member can manage in the business app.">
        <PermissionEditor permissions={draft.permissions} onChange={updatePermissions} bare />
      </WizardFormSection>
    </div>
  );
}

function LocationsSetupStep({ draft, update }) {
  return (
    <div className="space-y-8">
      <WizardFormSection title="Locations" description="Choose their default site and where they are allowed to work.">
        <LocationPreferencesEditor
          value={draft.locations}
          onChange={update}
          bare
        />
      </WizardFormSection>
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

function LocationPreferencesEditor({ value = {}, onChange, bare = false }) {
  const allowed = value.allowedLocationIds?.length ? value.allowedLocationIds : [value.primaryLocationId || 'loc1'];
  const primaryLocationId = value.primaryLocationId || allowed[0] || businessLocations[0]?.id;

  const toggleLocation = (locationId) => {
    const nextAllowed = allowed.includes(locationId)
      ? allowed.filter((id) => id !== locationId)
      : [...allowed, locationId];
    const safeAllowed = nextAllowed.length ? nextAllowed : [locationId];
    onChange({
      ...value,
      allowedLocationIds: safeAllowed,
      primaryLocationId: safeAllowed.includes(primaryLocationId) ? primaryLocationId : safeAllowed[0],
    });
  };

  return (
    <div className={bare ? 'space-y-4' : 'space-y-4 bg-white border border-gray-100 rounded-2xl p-4'}>
      <ProductSelect
        label="Primary location"
        value={primaryLocationId}
        onChange={(nextPrimary) => onChange({
          ...value,
          primaryLocationId: nextPrimary,
          allowedLocationIds: Array.from(new Set([...allowed, nextPrimary])),
        })}
        options={businessLocations.map((location) => ({ value: location.id, label: location.name }))}
      />

      <div>
        <div className="text-[13px] font-medium text-gray-700 mb-2">Can work at</div>
        <div className={bare ? 'divide-y divide-gray-100 border-y border-gray-100' : 'divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden'}>
          {businessLocations.map((location) => (
            <label key={location.id} className={'flex items-center gap-3 py-3 ' + (bare ? '' : 'px-4')}>
              <input
                type="checkbox"
                checked={allowed.includes(location.id)}
                onChange={() => toggleLocation(location.id)}
                className="h-4 w-4 rounded border-gray-300 accent-gray-900"
              />
              <span className="flex-1 min-w-0">
                <span className="block text-[14px] text-gray-900 truncate">{location.name}</span>
                <span className="block text-[12px] text-gray-500 truncate">{location.address}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <ToggleField
        label="Can do mobile appointments"
        description="Allow this member to work outcalls or house visits where the service supports it."
        checked={Boolean(value.mobile)}
        onChange={(mobile) => onChange({ ...value, mobile })}
      />
      <ToggleField
        label="Can deliver remote appointments"
        description="Use for online consultations, calls, or livestream sessions."
        checked={Boolean(value.remote)}
        onChange={(remote) => onChange({ ...value, remote })}
      />
    </div>
  );
}

function SelectField({ label, value, options, onChange }) {
  return <ProductSelect label={label} value={value} options={options} onChange={onChange} />;
}

function WizardWeeklySchedule({ weekly, onChange }) {
  const updateDay = (index, patch) => {
    onChange(weekly.map((day, i) => (i === index ? { ...day, ...patch } : day)));
  };

  return (
    <div className="divide-y divide-gray-100 border-t border-gray-100">
      {weekly.map((day, index) => (
        <div key={day.day} className="py-3 flex items-center gap-3">
          <label className="w-16 flex items-center gap-2 text-[13px] font-semibold text-gray-700">
            <input
              type="checkbox"
              checked={Boolean(day.enabled)}
              onChange={(event) => updateDay(index, { enabled: event.target.checked })}
              className="h-4 w-4 rounded border-gray-300 accent-gray-900"
            />
            {day.day}
          </label>
          <div className={'flex-1 grid grid-cols-2 gap-2 ' + (!day.enabled ? 'opacity-40' : '')}>
            <input
              type="time"
              value={day.start}
              disabled={!day.enabled}
              onChange={(event) => updateDay(index, { start: event.target.value })}
              className="min-w-0 rounded-xl bg-gray-50 px-2 py-2 text-[13px] outline-none"
            />
            <input
              type="time"
              value={day.end}
              disabled={!day.enabled}
              onChange={(event) => updateDay(index, { end: event.target.value })}
              className="min-w-0 rounded-xl bg-gray-50 px-2 py-2 text-[13px] outline-none"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function OverviewPanel({ members, metrics, requests = [], onAdd, onOpenMember, onOpenSchedule }) {
  const today = 'Mon';
  const workingToday = membersWorkingOn(members, today);
  const issues = setupIssues(members);
  const payIssues = members.filter((member) => member.payment?.payoutStatus !== 'Ready');
  const insight = teamInsightMetrics(members);
  const pendingRequests = requests.filter((item) => item.status === 'pending').length;
  const insightCards = [
    {
      key: 'staff',
      label: 'Staff',
      value: members.length,
      body: `${metrics.ready} ready for bookings`,
      tone: 'bg-sky-50 text-sky-900',
      Icon: Users,
    },
    {
      key: 'earnings',
      label: 'Avg earnings',
      value: `£${insight.averageEarnings}`,
      body: 'Estimated per team member',
      tone: 'bg-emerald-50 text-emerald-900',
      Icon: WalletCards,
    },
    {
      key: 'utilisation',
      label: 'Utilisation',
      value: `${insight.utilisation}%`,
      body: `${metrics.hours} scheduled hours`,
      tone: 'bg-violet-50 text-violet-900',
      Icon: Clock,
    },
    {
      key: 'attention',
      label: 'Needs attention',
      value: issues.length,
      body: pendingRequests ? `${pendingRequests} request${pendingRequests === 1 ? '' : 's'} pending` : 'No pending requests',
      tone: 'bg-amber-50 text-amber-900',
      Icon: AlertCircle,
    },
  ];

  return (
    <div className="space-y-7">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[22px] font-semibold tracking-tight text-gray-900">Team overview</div>
            <div className="text-[13px] text-gray-500 mt-0.5">
              {workingToday.length} working today · {issues.length} item{issues.length === 1 ? '' : 's'} need attention
            </div>
          </div>
          <button
            onClick={onAdd}
            className="w-11 h-11 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0 hover:bg-gray-800 transition-colors"
            aria-label="Add team member"
          >
            <UserPlus size={18} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="-mx-5 overflow-x-auto px-5 no-scrollbar">
        <div className="flex gap-3 pb-1">
          {insightCards.map((card) => (
            <OverviewInsightCard key={card.key} card={card} />
          ))}
        </div>
      </div>

      <PanelSection title="Today">
        <TodayRotaCard
          workingToday={workingToday}
          onOpenSchedule={onOpenSchedule}
        />
      </PanelSection>

      <PanelSection title="Needs attention">
        <div className="-mx-5 overflow-x-auto px-5 no-scrollbar">
          <div className="flex gap-3 pb-1">
            {issues.slice(0, 5).map((issue) => (
              <AttentionCard
                key={`${issue.member.id}-${issue.key}`}
                issue={issue}
                onClick={() => onOpenMember(issue.member.id)}
              />
            ))}
            {issues.length === 0 && (
              <CalmStateCard icon={Check} title="Team is ready" body="Profiles, schedules, and payouts look healthy." />
            )}
          </div>
        </div>
      </PanelSection>

      <PanelSection title="Requests and exceptions">
        <div className="-mx-5 overflow-x-auto px-5 no-scrollbar">
          <div className="flex gap-3 pb-1">
          {requests.slice(0, 3).map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onClick={() => onOpenMember(request.member.id)}
              compact
            />
          ))}
          {requests.length === 0 && <CalmStateCard icon={Check} title="No requests open" body="Holiday, sickness, and cover exceptions are clear." />}
          </div>
        </div>
      </PanelSection>

      {payIssues.length > 0 && (
        <PanelSection title="Pay follow-up">
          <PayFollowUpCard
            members={payIssues}
            onClick={() => onOpenMember(payIssues[0].id)}
          />
        </PanelSection>
      )}
    </div>
  );
}

function OverviewInsightCard({ card }) {
  const Icon = card.Icon;
  return (
    <div className={`w-[156px] shrink-0 rounded-3xl p-4 ${card.tone}`}>
      <div className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center">
        <Icon size={17} strokeWidth={1.9} />
      </div>
      <div className="text-[26px] font-semibold tracking-tight mt-5">{card.value}</div>
      <div className="text-[13px] font-semibold mt-1">{card.label}</div>
      <div className="text-[12px] opacity-70 mt-1 leading-snug">{card.body}</div>
    </div>
  );
}

function TodayRotaCard({ workingToday, onOpenSchedule }) {
  const sorted = [...workingToday].sort((a, b) => shiftFor(a, 'Mon').start.localeCompare(shiftFor(b, 'Mon').start));
  const visible = sorted.slice(0, 5);
  return (
    <button
      onClick={onOpenSchedule}
      className="w-full rounded-3xl bg-gray-950 text-white p-5 text-left overflow-hidden relative"
    >
      <div className="relative z-[1]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[26px] font-semibold tracking-tight">{workingToday.length}</div>
            <div className="text-[13px] text-white/70 mt-0.5">working today</div>
          </div>
          <div className="flex -space-x-2">
            {visible.map((member) => <MiniAvatar key={member.id} member={member} />)}
            {workingToday.length > visible.length && (
              <span className="w-5 h-5 rounded-full bg-white text-[9px] font-semibold text-gray-900 flex items-center justify-center">
                +{workingToday.length - visible.length}
              </span>
            )}
          </div>
        </div>
        <div className="mt-5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
          <div className="space-y-1">
          {sorted.map((member, index) => {
            const shift = shiftFor(member, 'Mon');
            return (
              <div key={member.id} className="flex items-center gap-3 rounded-2xl px-1 py-2">
                <div className="relative flex flex-col items-center self-stretch">
                  <Avatar member={member} />
                  {index < sorted.length - 1 && <span className="mt-1 w-px flex-1 bg-white/15" />}
                </div>
                <div className="flex-1 min-w-0 border-b border-white/10 pb-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[14px] font-semibold truncate">{member.name}</div>
                    <div className="text-[12px] font-medium text-white/70 shrink-0">{hoursForShift(shift)}h</div>
                  </div>
                  <div className="text-[12px] text-white/60 mt-0.5">{shift.start}-{shift.end} · {member.role}</div>
                </div>
              </div>
            );
          })}
          </div>
          {sorted.length === 0 && (
            <div className="rounded-2xl bg-white/10 px-4 py-5 text-center text-[13px] text-white/70">
              No one is scheduled today.
            </div>
          )}
        </div>
      </div>
      <div className="absolute -right-10 -bottom-16 w-36 h-36 rounded-full bg-white/10" />
    </button>
  );
}

function AttentionCard({ issue, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-[238px] shrink-0 rounded-3xl bg-amber-50 p-4 text-left hover:bg-amber-100/70 transition-colors"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="w-10 h-10 rounded-full bg-white text-amber-700 flex items-center justify-center">
          <AlertCircle size={17} strokeWidth={1.9} />
        </div>
        <ChevronRight size={17} className="text-amber-700/50" strokeWidth={2} />
      </div>
      <div className="mt-4 text-[15px] font-semibold text-amber-950 truncate">{issue.title}</div>
      <div className="text-[12px] text-amber-800 mt-1 leading-snug line-clamp-2">{issue.member.name} · {issue.body}</div>
    </button>
  );
}

function PayFollowUpCard({ members, onClick }) {
  const first = members[0];
  return (
    <button
      onClick={onClick}
      className="w-full rounded-3xl bg-gray-50 p-4 text-left hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Avatar member={first} />
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold text-gray-900 truncate">{members.length} payment setup item{members.length === 1 ? '' : 's'}</div>
          <div className="text-[12px] text-gray-500 mt-0.5 truncate">{first.name} · {first.payment?.payoutStatus || 'Not set'}</div>
        </div>
        <ChevronRight size={16} className="text-gray-300" strokeWidth={2} />
      </div>
    </button>
  );
}

function CalmStateCard({ icon: Icon, title, body }) {
  return (
    <div className="w-[238px] shrink-0 rounded-3xl bg-emerald-50 p-4">
      <div className="w-10 h-10 rounded-full bg-white text-emerald-700 flex items-center justify-center">
        {createElement(Icon, { size: 17, strokeWidth: 1.9 })}
      </div>
      <div className="mt-4 text-[15px] font-semibold text-emerald-950">{title}</div>
      <div className="text-[12px] text-emerald-800 mt-1 leading-snug">{body}</div>
    </div>
  );
}

function MembersPanel({ members, metrics, query, sort, statusFilter, roleFilter, locationFilter, onQuery, onSort, onStatusFilter, onRoleFilter, onLocationFilter, onSelect }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount = [sort !== 'name', statusFilter !== 'all', roleFilter !== 'all', locationFilter !== 'all'].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-full px-4 py-3">
          <Search size={15} className="text-gray-400 shrink-0" strokeWidth={1.75} />
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Search team"
            className="flex-1 text-[15px] bg-transparent placeholder:text-gray-400 outline-none"
          />
        </div>
        <button
          onClick={() => setFiltersOpen(true)}
          className="w-12 h-12 rounded-full bg-gray-900 text-white hover:bg-gray-800 flex items-center justify-center"
          aria-label="Filter and order members"
        >
          <SlidersHorizontal size={18} strokeWidth={1.9} />
        </button>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3 mb-2 px-1">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
            Members · {members.length}
          </div>
          <div className="text-[11px] text-gray-400">
            {metrics.ready} bookable · {metrics.pending} invited{activeFilterCount ? ` · ${activeFilterCount} filter${activeFilterCount === 1 ? '' : 's'}` : ''}
          </div>
        </div>
        <div className="divide-y divide-gray-100 border-y border-gray-100">
          {members.length > 0 ? (
            members.map((member) => (
              <MemberRow key={member.id} member={member} onClick={() => onSelect(member.id)} />
            ))
          ) : (
            <div className="p-5 text-center text-[13px] text-gray-500">
              No team members match these filters.
            </div>
          )}
        </div>
      </div>

      <MemberFiltersSheet
        open={filtersOpen}
        sort={sort}
        statusFilter={statusFilter}
        roleFilter={roleFilter}
        locationFilter={locationFilter}
        onClose={() => setFiltersOpen(false)}
        onSort={onSort}
        onStatusFilter={onStatusFilter}
        onRoleFilter={onRoleFilter}
        onLocationFilter={onLocationFilter}
        onReset={() => {
          onSort('name');
          onStatusFilter('all');
          onRoleFilter('all');
          onLocationFilter('all');
        }}
      />
    </div>
  );
}

function MemberFiltersSheet({ open, sort, statusFilter, roleFilter, locationFilter, onClose, onSort, onStatusFilter, onRoleFilter, onLocationFilter, onReset }) {
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Filter members"
      footer={
        <div className="flex gap-2">
          <button
            onClick={onReset}
            className="flex-1 h-12 rounded-full border border-gray-200 text-gray-900 text-[15px] font-medium hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
          >
            Apply
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <FilterSelect
          label="Order"
          value={sort}
          onChange={onSort}
          options={[
            { value: 'name', label: 'Name' },
            { value: 'role', label: 'Role' },
            { value: 'status', label: 'Status' },
            { value: 'hours', label: 'Hours' },
          ]}
        />
        <FilterSelect
          label="Status"
          value={statusFilter}
          onChange={onStatusFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'setup', label: 'Setup' },
            { value: 'pending', label: 'Invited' },
            { value: 'bookable', label: 'Bookable' },
          ]}
        />
        <FilterSelect
          label="Role"
          value={roleFilter}
          onChange={onRoleFilter}
          options={[
            { value: 'all', label: 'All' },
            ...SYSTEM_ROLES.map((role) => ({ value: role, label: role })),
          ]}
        />
        <FilterSelect
          label="Location"
          value={locationFilter}
          onChange={onLocationFilter}
          options={[
            { value: 'all', label: 'All locations' },
            ...businessLocations.map((location) => ({ value: location.id, label: location.name })),
          ]}
        />
      </div>
    </BottomSheet>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <ProductSelect
      label={label}
      value={value}
      options={options}
      onChange={onChange}
      compact
      className="bg-gray-50 rounded-xl px-3 py-2"
      buttonClassName="bg-transparent hover:bg-gray-50 focus:bg-gray-50 px-0 h-7 min-h-0 py-0 text-[13px] font-medium"
      menuClassName="-left-3 w-[calc(100%+24px)]"
    />
  );
}

function SchedulePanel({ members, requests = [], onSelect, onUpdateMember, onUpdateRequest }) {
  const [day, setDay] = useState('Mon');
  const [view, setView] = useState('week');
  const [rotaMode, setRotaMode] = useState('week');
  const [weekOffset, setWeekOffset] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [openShiftId, setOpenShiftId] = useState(null);
  const [openShifts, setOpenShifts] = useState(() => defaultOpenShifts());
  const [filters, setFilters] = useState({
    staff: true,
    locations: true,
    openShifts: true,
    requests: true,
  });
  // Business-day setting surfaced by the bank holiday banner. When on, staff
  // are automatically marked off on bank holidays.
  const [closeOnBankHolidays, setCloseOnBankHolidays] = useState(true);
  const week = weekDays(weekOffset);
  const activeDay = week.find((item) => item.day === day) || week[0];
  const visibleMembers = filters.staff ? members : [];
  const visibleOpenShifts = filters.openShifts ? openShifts : [];
  const working = membersWorkingOn(visibleMembers, day).sort((a, b) => shiftFor(a, day).start.localeCompare(shiftFor(b, day).start));
  const queueItems = filters.requests
    ? scheduleIssueQueue(members, visibleOpenShifts, requests)
    : [];
  const selectedOpenShifts = visibleOpenShifts.filter((shift) => shift.day === day && shift.status !== 'filled');

  const updateShift = (memberId, patch, targetDay = day) => {
    const member = members.find((item) => item.id === memberId);
    if (!member) return;
    const weekly = ensureWeekly(member.schedule?.weekly).map((shift) =>
      shift.day === targetDay ? { ...shift, ...patch } : shift,
    );
    onUpdateMember(memberId, {
      schedule: {
        ...(member.schedule || {}),
        weekly,
      },
      rota: {
        ...(member.rota || {}),
        nextShift: patch.enabled === false ? member.rota?.nextShift : `${targetDay} ${(patch.start || shiftFor(member, targetDay).start)}`,
      },
    });
  };

  const editTarget = editingShift
    ? members.find((member) => member.id === editingShift.memberId)
    : null;
  const activeOpenShift = openShifts.find((shift) => shift.id === openShiftId);

  const [requestId, setRequestId] = useState(null);
  const pendingRequests = requests.filter((request) => request.actionable);
  const activeRequest = pendingRequests.find((request) => request.id === requestId);

  // Approving a time-off request records it on the member and frees the day;
  // approving a swap moves the requester's shift onto the colleague who agreed
  // to cover it. Either way the rota and coverage estimates update immediately.
  const approveRequest = (request) => {
    if (request.type === 'time_off') {
      onUpdateMember(request.memberId, (current) => ({
        schedule: {
          ...(current.schedule || {}),
          timeOff: [
            ...(current.schedule?.timeOff || []),
            { id: request.id, label: request.label, date: request.dates },
          ],
          weekly: request.day
            ? ensureWeekly(current.schedule?.weekly).map((shift) =>
                shift.day === request.day ? { ...shift, enabled: false } : shift,
              )
            : current.schedule?.weekly,
        },
      }));
    }
    if (request.type === 'swap' && request.withMember && request.day) {
      const requester = members.find((item) => item.id === request.memberId);
      const coverShift = requester ? shiftFor(requester, request.day) : null;
      onUpdateMember(request.memberId, (current) => ({
        schedule: {
          ...(current.schedule || {}),
          weekly: ensureWeekly(current.schedule?.weekly).map((shift) =>
            shift.day === request.day ? { ...shift, enabled: false } : shift,
          ),
        },
      }));
      onUpdateMember(request.withMemberId, (current) => ({
        schedule: {
          ...(current.schedule || {}),
          weekly: ensureWeekly(current.schedule?.weekly).map((shift) =>
            shift.day === request.day
              ? { ...shift, enabled: true, start: coverShift?.start || shift.start, end: coverShift?.end || shift.end }
              : shift,
          ),
        },
      }));
    }
    onUpdateRequest?.(request.id, { status: 'approved' });
    setRequestId(null);
  };

  const declineRequest = (request) => {
    onUpdateRequest?.(request.id, { status: 'declined' });
    setRequestId(null);
  };

  const assignOpenShift = (shiftId, memberId) => {
    const shift = openShifts.find((item) => item.id === shiftId);
    if (!shift || !memberId) return;
    setDay(shift.day);
    updateShift(memberId, { enabled: true, start: shift.start, end: shift.end }, shift.day);
    setOpenShifts((items) =>
      items.map((item) =>
        item.id === shiftId ? { ...item, status: 'filled', assignedTo: memberId } : item,
      ),
    );
    setOpenShiftId(null);
  };

  const toggleCandidate = (shiftId, memberId) => {
    setOpenShifts((items) =>
      items.map((item) => {
        if (item.id !== shiftId) return item;
        const candidates = item.candidates || [];
        return {
          ...item,
          candidates: candidates.includes(memberId)
            ? candidates.filter((id) => id !== memberId)
            : [...candidates, memberId],
        };
      }),
    );
  };

  const goPrevious = () => {
    if (view === 'day') {
      setDay(adjacentDay(day, -1));
      return;
    }
    setWeekOffset((value) => value - (view === 'month' ? 4 : 1));
  };

  const goNext = () => {
    if (view === 'day') {
      setDay(adjacentDay(day, 1));
      return;
    }
    setWeekOffset((value) => value + (view === 'month' ? 4 : 1));
  };

  const openQueueItem = (item) => {
    if (item.type === 'open_shift') {
      setDay(item.day);
      setOpenShiftId(item.shift.id);
      return;
    }
    if (item.type === 'setup') {
      setDay(item.day || day);
      setEditingShift({ memberId: item.member.id });
      return;
    }
    if (item.day) {
      setDay(item.day);
      return;
    }
    if (item.member) onSelect(item.member.id);
  };

  return (
    <div className="space-y-5">
      <HolidayBanner closeOnBankHolidays={closeOnBankHolidays} onOpenSettings={() => setSettingsOpen(true)} />

      <CalendarToolbar
        label={calendarRangeLabel(view, week, activeDay)}
        sublabel={`${queueItems.length} manager task${queueItems.length === 1 ? '' : 's'} · ${working.length} on ${day}`}
        onPrevious={goPrevious}
        onNext={goNext}
        onSettings={() => setSettingsOpen(true)}
      />

      <div className="space-y-4">
        {view === 'month' ? (
          <>
            <MonthCalendar
              week={week}
              members={visibleMembers}
              selectedDay={day}
              closeOnBankHolidays={closeOnBankHolidays}
              onSelectDay={setDay}
            />
            <CoverageDayDetail
              day={day}
              members={visibleMembers}
              onOpenDay={() => setView('day')}
            />
          </>
        ) : view === 'day' ? (
          <DayAgenda
            day={day}
            dateLabel={`${activeDay.day} ${activeDay.date} ${activeDay.month}`}
            members={visibleMembers}
            openShifts={selectedOpenShifts}
            showLocations={filters.locations}
            onOpenMember={onSelect}
            onEditShift={(member) => setEditingShift({ memberId: member.id })}
            onOpenShift={setOpenShiftId}
            onSwipePrevious={() => setDay(adjacentDay(day, -1))}
            onSwipeNext={() => setDay(adjacentDay(day, 1))}
          />
        ) : (
          <>
            <RotaModeSwitch value={rotaMode} onChange={setRotaMode} />
            {rotaMode === 'week' ? (
              <WeekRotaAccordion
                week={week}
                selectedDay={day}
                members={visibleMembers}
                openShifts={visibleOpenShifts}
                showLocations={filters.locations}
                onSelectDay={setDay}
                onOpenMember={onSelect}
                onEditShift={(member, nextDay) => {
                  setDay(nextDay);
                  setEditingShift({ memberId: member.id });
                }}
                onOpenShift={setOpenShiftId}
              />
            ) : (
              <TeamRotaAccordion
                week={week}
                members={visibleMembers}
                selectedDay={day}
                showLocations={filters.locations}
                onSelectDay={setDay}
                onOpenMember={onSelect}
                onEditShift={(member, nextDay) => {
                  setDay(nextDay);
                  setEditingShift({ memberId: member.id });
                }}
              />
            )}
          </>
        )}
        <RequestsSection requests={pendingRequests} onOpen={setRequestId} onApprove={approveRequest} onDecline={declineRequest} />
        <ManagerQueue items={queueItems} onOpen={openQueueItem} compact />
      </div>
      <RequestSheet
        request={activeRequest}
        onClose={() => setRequestId(null)}
        onApprove={approveRequest}
        onDecline={declineRequest}
      />
      <ShiftSheet
        member={editTarget}
        day={day}
        shift={editTarget ? shiftFor(editTarget, day) : null}
        onClose={() => setEditingShift(null)}
        onSave={(patch) => {
          if (editTarget) updateShift(editTarget.id, patch);
          setEditingShift(null);
        }}
        onMarkSick={() => {
          if (!editTarget) return;
          updateShift(editTarget.id, { enabled: false });
          onUpdateMember(editTarget.id, (current) => ({
            schedule: {
              ...(current.schedule || {}),
              timeOff: [
                ...(current.schedule?.timeOff || []),
                { id: `sick_${day}_${current.schedule?.timeOff?.length || 0}`, label: 'Sick day', date: `${day} (this week)` },
              ],
            },
          }));
          setEditingShift(null);
        }}
        onCopyShift={({ start, end }) => {
          if (!editTarget) return;
          onUpdateMember(editTarget.id, (current) => ({
            schedule: {
              ...(current.schedule || {}),
              weekly: ensureWeekly(current.schedule?.weekly).map((item) =>
                item.enabled ? { ...item, start, end } : item,
              ),
            },
          }));
          setEditingShift(null);
        }}
      />
      <OpenShiftSheet
        shift={activeOpenShift}
        members={members}
        onClose={() => setOpenShiftId(null)}
        onClaim={(memberId) => activeOpenShift && toggleCandidate(activeOpenShift.id, memberId)}
        onAssign={(memberId) => activeOpenShift && assignOpenShift(activeOpenShift.id, memberId)}
      />
      <CalendarSettingsSheet
        open={settingsOpen}
        view={view}
        filters={filters}
        week={week}
        members={members}
        openShifts={openShifts}
        requests={requests}
        selectedDay={day}
        closeOnBankHolidays={closeOnBankHolidays}
        onSetCloseOnBankHolidays={setCloseOnBankHolidays}
        onClose={() => setSettingsOpen(false)}
        onSetView={setView}
        onSetFilters={setFilters}
        onSelectDay={(selection) => {
          const nextDay = typeof selection === 'string' ? selection : selection.day;
          setDay(nextDay);
          if (selection?.dateValue && view === 'week') {
            setWeekOffset(weekOffsetForDate(selection.dateValue));
          }
          if (view === 'day') setView('day');
          setSettingsOpen(false);
        }}
      />
    </div>
  );
}

function CalendarToolbar({ label, sublabel, onPrevious, onNext, onSettings, children }) {
  return (
    <div className="py-2">
      <div className="flex items-center gap-2">
        <button
          onClick={onPrevious}
          className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center shrink-0"
          aria-label="Previous"
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </button>
        <div className="flex-1 min-w-0 text-center">
          <div className="text-[15px] font-semibold text-gray-900 truncate">{label}</div>
          <div className="text-[11px] text-gray-500 mt-0.5 truncate">{sublabel}</div>
        </div>
        <button
          onClick={onNext}
          className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center shrink-0"
          aria-label="Next"
        >
          <ChevronRight size={18} strokeWidth={2} />
        </button>
        <button
          onClick={onSettings}
          className="w-10 h-10 rounded-full bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center shrink-0"
          aria-label="Calendar settings"
        >
          <CalendarDays size={17} strokeWidth={1.9} />
        </button>
      </div>
      {children && <div className="md:hidden mt-3">{children}</div>}
    </div>
  );
}

// Pending staff requests — time off and shift swaps — with one-tap actions.
// Tapping the row opens the full detail sheet.
function RequestsSection({ requests, onOpen, onApprove, onDecline }) {
  return (
    <PanelSection title="Requests">
      <div className="divide-y divide-gray-100 border-y border-gray-100">
        {requests.length === 0 ? (
          <div className="py-4 text-[13px] text-gray-500">No requests waiting on you.</div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="py-4">
              <button onClick={() => onOpen(request.id)} className="w-full flex items-start gap-3 text-left">
                <div className={'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ' + request.tone}>
                  {createElement(request.icon, { size: 17, strokeWidth: 1.9 })}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-gray-900 truncate">{request.title}</div>
                  <div className="text-[12px] text-gray-500 mt-0.5 truncate">
                    {request.member.name} · {request.submitted}
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-300 shrink-0 mt-1" strokeWidth={2} />
              </button>
              <div className="mt-3 ml-[52px] flex gap-2">
                <button
                  onClick={() => onApprove(request)}
                  className="h-9 px-4 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[13px] font-medium transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => onDecline(request)}
                  className="h-9 px-4 rounded-full border border-gray-200 text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </PanelSection>
  );
}

// Full request detail — who, when, why, and what approving will change.
function RequestSheet({ request, onClose, onApprove, onDecline }) {
  return (
    <BottomSheet open={Boolean(request)} onClose={onClose} title={request?.type === 'swap' ? 'Shift swap' : 'Time off request'}>
      {request && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Avatar member={request.member} />
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-semibold text-gray-900 truncate">{request.member.name}</div>
              <div className="text-[12px] text-gray-500">{request.member.role} · asked {request.submitted}</div>
            </div>
            <StatusPill label="Pending" tone="muted" />
          </div>

          <div className="rounded-2xl bg-gray-50 p-4 space-y-2">
            <div className="text-[14px] font-semibold text-gray-900">{request.label} · {request.dates}</div>
            {request.note && <div className="text-[13px] text-gray-600 leading-snug">{request.note}</div>}
            {request.type === 'swap' && request.withMember && (
              <div className="text-[12px] text-gray-500">
                {request.withMember.name} has already agreed to this swap.
              </div>
            )}
          </div>

          <div className="text-[12px] text-gray-500 leading-snug">
            {request.type === 'swap'
              ? 'Approving moves the shift across and updates the rota and coverage straight away.'
              : 'Approving records the time off, frees the day on the rota, and updates coverage.'}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onApprove(request)}
              className="flex-1 h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
            >
              Approve
            </button>
            <button
              onClick={() => onDecline(request)}
              className="flex-1 h-12 rounded-full border border-gray-200 text-[15px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Decline
            </button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}

function ManagerQueue({ items, onOpen, compact = false }) {
  const visibleItems = compact ? items.slice(0, 4) : items;

  return (
    <PanelSection title="Manager queue">
      <div className={compact ? 'flex gap-3 overflow-x-auto pb-1 no-scrollbar' : 'divide-y divide-gray-100 border-y border-gray-100'}>
        {visibleItems.length === 0 ? (
          <div className="py-4 text-[13px] text-gray-500">
            No schedule tasks need attention.
          </div>
        ) : (
          visibleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onOpen(item)}
              className={
                'text-left hover:bg-gray-50 transition-colors ' +
                (compact ? 'shrink-0 w-[258px] rounded-2xl bg-gray-50 p-4' : 'w-full py-4')
              }
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.tone}`}>
                  {createElement(item.icon, { size: 17, strokeWidth: 1.9 })}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-[14px] font-semibold text-gray-900 truncate">{item.title}</div>
                    <StatusPill label={item.badge} tone={item.priority === 'high' ? 'muted' : 'success'} />
                  </div>
                  <div className="text-[12px] text-gray-500 mt-1 leading-snug">{item.body}</div>
                  <div className="text-[11px] font-medium text-gray-400 mt-2">{item.meta}</div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </PanelSection>
  );
}

function DayStrip({ week, selectedDay, members, openShifts, requests, onSelectDay, embedded = false }) {
  return (
    <div className={'flex gap-2 overflow-x-auto no-scrollbar pb-1 ' + (embedded ? '' : '-mx-5 px-5')}>
      {week.map((item) => {
        const active = selectedDay === item.day;
        const status = dayStatus(item.day, members, openShifts, requests);
        return (
          <button
            key={item.day}
            onClick={() => onSelectDay(item.day)}
            className={
              'shrink-0 w-14 rounded-2xl p-2 text-center transition-colors ' +
              (active ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700')
            }
          >
            <div className={'text-[10px] font-semibold uppercase ' + (active ? 'text-white/60' : 'text-gray-400')}>
              {item.day}
            </div>
            <div className="text-[18px] leading-none font-semibold mt-1">{item.date}</div>
            <div className={`mx-auto mt-2 w-2 h-2 rounded-full ${status.dot}`} />
          </button>
        );
      })}
    </div>
  );
}

function DayAgenda({ day, dateLabel, members, openShifts, showLocations, onOpenMember, onEditShift, onOpenShift, onSwipePrevious, onSwipeNext }) {
  const working = membersWorkingOn(members, day).sort((a, b) => shiftFor(a, day).start.localeCompare(shiftFor(b, day).start));
  const span = timeSpanFor(working, day);
  const [touchStart, setTouchStart] = useState(null);

  const finishSwipe = (event) => {
    if (touchStart === null) return;
    const delta = event.changedTouches[0].clientX - touchStart;
    if (delta > 48) onSwipePrevious();
    if (delta < -48) onSwipeNext();
    setTouchStart(null);
  };

  return (
    <PanelSection title="Day rota">
      <div
        className="border-y border-gray-100"
        onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
        onTouchEnd={finishSwipe}
      >
        <div className="py-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[18px] font-semibold tracking-tight text-gray-900">{dateLabel}</div>
              <div className="text-[13px] text-gray-500 mt-0.5">
                {working.length} staff on · {openShifts.length} open · {span || 'No cover'}
              </div>
            </div>
            <StatusPill label={dayStatus(day, members, openShifts, []).label} tone={working.length < 2 || openShifts.length ? 'muted' : 'success'} />
          </div>
        </div>
        <div className="py-2 divide-y divide-gray-100">
          {working.map((member) => {
            const freelance = isFreelancerMember(member);
            return (
              <button
                key={member.id}
                onClick={() => (freelance ? onOpenMember(member.id) : onEditShift(member))}
                className={
                  'w-full flex items-center gap-3 py-3 text-left hover:bg-gray-50 transition-colors ' +
                  (freelance ? 'opacity-60' : '')
                }
              >
                <Avatar member={member} />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-semibold text-gray-900 truncate">{member.name}</div>
                  <div className="text-[12px] text-gray-500 truncate">
                    {freelance
                      ? 'Manages own diary'
                      : `${shiftFor(member, day).start}-${shiftFor(member, day).end}${showLocations ? ` · ${locationSummary(member)}` : ''}`}
                  </div>
                </div>
                {freelance ? (
                  <StatusPill label="Own diary" tone="muted" />
                ) : (
                  <div className="text-[12px] font-medium text-gray-500">{hoursForShift(shiftFor(member, day))}h</div>
                )}
              </button>
            );
          })}
          {openShifts.map((shift) => (
            <OpenShiftCard key={shift.id} shift={shift} onClick={() => onOpenShift(shift.id)} />
          ))}
          {working.length === 0 && openShifts.length === 0 && (
            <button
              onClick={() => members[0] && onOpenMember(members[0].id)}
              className="w-full h-32 rounded-2xl bg-gray-50 flex items-center justify-center text-[13px] text-gray-500"
            >
              No shifts on this day
            </button>
          )}
        </div>
      </div>
    </PanelSection>
  );
}

function RotaModeSwitch({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-full bg-gray-50 p-1">
      {[
        { key: 'week', label: 'Week' },
        { key: 'team', label: 'Team' },
      ].map((item) => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          className={
            'h-10 rounded-full text-[14px] font-semibold transition-colors ' +
            (value === item.key ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500')
          }
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function WeekRotaAccordion({ week, selectedDay, members, openShifts, showLocations, onSelectDay, onOpenMember, onEditShift, onOpenShift }) {
  const [expandedDay, setExpandedDay] = useState(null);

  return (
    <PanelSection title="Week rota">
      <div className="divide-y divide-gray-100 border-y border-gray-100">
        {week.map((item) => {
          const selected = selectedDay === item.day;
          const expanded = expandedDay === item.day;
          const working = membersWorkingOn(members, item.day).sort((a, b) => shiftFor(a, item.day).start.localeCompare(shiftFor(b, item.day).start));
          const dayOpenShifts = openShifts.filter((shift) => shift.day === item.day && shift.status !== 'filled');
          const span = timeSpanFor(working, item.day);
          return (
            <div key={item.day}>
              <button
                onClick={() => {
                  onSelectDay(item.day);
                  setExpandedDay((current) => (current === item.day ? null : item.day));
                }}
                className="w-full flex items-center gap-3 py-5 text-left hover:bg-gray-50 transition-colors"
              >
                <div className={'w-11 h-11 rounded-full flex flex-col items-center justify-center shrink-0 ' + (selected ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700')}>
                  <span className={'text-[10px] font-semibold uppercase ' + (selected ? 'text-white/60' : 'text-gray-400')}>{item.day}</span>
                  <span className="text-[15px] leading-none font-semibold">{item.date}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[14px] font-semibold text-gray-900 truncate">
                      {item.day} {item.date} {item.month}
                    </div>
                    <div className="flex -space-x-2 shrink-0">
                      {working.slice(0, 3).map((member) => <MiniAvatar key={member.id} member={member} />)}
                      {working.length > 3 && (
                        <span className="w-5 h-5 rounded-full bg-white border border-gray-200 text-[9px] font-semibold text-gray-500 flex items-center justify-center">
                          +{working.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-[12px] text-gray-500 mt-0.5 truncate">
                    {working.length} on shift · {dayOpenShifts.length} open · {span || 'No rota set'}
                  </div>
                </div>
                <ChevronRight
                  size={17}
                  className={'text-gray-300 transition-transform ' + (expanded ? 'rotate-90' : '')}
                  strokeWidth={2}
                />
              </button>

              {expanded && (
                <div className="pb-3 divide-y divide-gray-100">
                  {working.map((member) => {
                    const shift = shiftFor(member, item.day);
                    const freelance = isFreelancerMember(member);
                    return (
                      <div key={member.id} className={'flex items-center gap-2 py-3 ' + (freelance ? 'opacity-60' : '')}>
                        <button onClick={() => onOpenMember(member.id)} className="shrink-0" aria-label={`Open ${member.name}`}>
                          <Avatar member={member} />
                        </button>
                        <button
                          onClick={() => (freelance ? onOpenMember(member.id) : onEditShift(member, item.day))}
                          className="flex-1 min-w-0 text-left"
                        >
                          <div className="text-[14px] font-medium text-gray-900 truncate">{member.name}</div>
                          <div className="text-[12px] text-gray-500 truncate">
                            {freelance ? 'Manages own diary' : `${member.role}${showLocations ? ` · ${locationSummary(member)}` : ''}`}
                          </div>
                        </button>
                        {freelance ? (
                          <StatusPill label="Own diary" tone="muted" />
                        ) : (
                          <button onClick={() => onEditShift(member, item.day)} className="text-right shrink-0">
                            <div className="text-[13px] font-semibold text-gray-900">{shift.start}-{shift.end}</div>
                            <div className="text-[11px] text-gray-500">{hoursForShift(shift)}h</div>
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {dayOpenShifts.map((shift) => (
                    <OpenShiftCard key={shift.id} shift={shift} onClick={() => onOpenShift(shift.id)} />
                  ))}
                  {working.length === 0 && dayOpenShifts.length === 0 && (
                    <div className="h-24 rounded-2xl bg-gray-50 flex items-center justify-center text-[13px] text-gray-500">
                      No shifts on {item.day}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PanelSection>
  );
}

function TeamRotaAccordion({ week, members, selectedDay, showLocations, onSelectDay, onOpenMember, onEditShift }) {
  const [expandedMemberId, setExpandedMemberId] = useState(null);
  const sortedMembers = [...members].sort((a, b) => {
    const aHours = Number(a.rota?.thisWeekHours || 0);
    const bHours = Number(b.rota?.thisWeekHours || 0);
    return bHours - aHours || a.name.localeCompare(b.name);
  });

  return (
    <PanelSection title="Team rota">
      <div className="divide-y divide-gray-100 border-y border-gray-100">
        {sortedMembers.map((member) => {
          const shifts = week
            .map((item) => ({ ...item, shift: shiftFor(member, item.day) }))
            .filter((item) => item.shift.enabled)
            .sort((a, b) => a.shift.start.localeCompare(b.shift.start));
          const expanded = expandedMemberId === member.id;
          const selectedShift = shifts.find((item) => item.day === selectedDay);
          const hours = shifts.reduce((sum, item) => sum + hoursForShift(item.shift), 0);

          return (
            <div key={member.id}>
              <div className="w-full flex items-center gap-3 py-5 hover:bg-gray-50 transition-colors">
                <button onClick={() => onOpenMember(member.id)} className="shrink-0" aria-label={`Open ${member.name}`}>
                  <Avatar member={member} />
                </button>
                <button
                  onClick={() => setExpandedMemberId((current) => (current === member.id ? null : member.id))}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[15px] font-semibold text-gray-900 truncate">{member.name}</div>
                    <div className="text-[12px] font-medium text-gray-500 shrink-0">{hours}h</div>
                  </div>
                  <div className="text-[12px] text-gray-500 mt-0.5 truncate">
                    {selectedShift ? `${selectedShift.day} ${selectedShift.shift.start}-${selectedShift.shift.end}` : shifts.length ? `${shifts.length} shift${shifts.length === 1 ? '' : 's'} this week` : 'No shifts this week'}
                    {showLocations && shifts.length ? ` · ${locationSummary(member)}` : ''}
                  </div>
                </button>
                <button
                  onClick={() => setExpandedMemberId((current) => (current === member.id ? null : member.id))}
                  className="w-8 h-8 flex items-center justify-center shrink-0"
                  aria-label={expanded ? 'Collapse shifts' : 'Expand shifts'}
                >
                  <ChevronRight
                    size={17}
                    className={'text-gray-300 transition-transform ' + (expanded ? 'rotate-90' : '')}
                    strokeWidth={2}
                  />
                </button>
              </div>

              {expanded && (
                <div className="pb-3 ml-[52px] divide-y divide-gray-100">
                  {isFreelancerMember(member) && (
                    <div className="py-3 text-[12px] text-gray-500 leading-snug">
                      {member.name.split(' ')[0]} manages their own diary — these are their typical in-shop times.
                    </div>
                  )}
                  {shifts.map((item) => (
                    <button
                      key={`${member.id}-${item.day}`}
                      onClick={() => {
                        onSelectDay(item.day);
                        if (!isFreelancerMember(member)) onEditShift(member, item.day);
                      }}
                      className={
                        'w-full py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors ' +
                        (isFreelancerMember(member) ? 'opacity-60' : '')
                      }
                    >
                      <div className={'w-10 h-10 rounded-full flex flex-col items-center justify-center shrink-0 ' + (item.day === selectedDay ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700')}>
                        <span className={'text-[9px] font-semibold uppercase ' + (item.day === selectedDay ? 'text-white/60' : 'text-gray-400')}>{item.day}</span>
                        <span className="text-[13px] leading-none font-semibold">{item.date}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-medium text-gray-900">{item.shift.start}-{item.shift.end}</div>
                        <div className="text-[12px] text-gray-500 mt-0.5">{hoursForShift(item.shift)}h{showLocations ? ` · ${locationSummary(member)}` : ''}</div>
                      </div>
                    </button>
                  ))}
                  {shifts.length === 0 && (
                    <div className="py-4 text-[13px] text-gray-500">No shifts set for this week.</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PanelSection>
  );
}

// Month coverage view — every day compares the system's demand estimate
// (from booking history) against the scheduled headcount. Monochrome states:
// filled dot = covered, mid dot = tight, hollow ring = understaffed.
function MonthCalendar({ week, members, selectedDay, closeOnBankHolidays, onSelectDay }) {
  const cells = calendarPickerCells(week);
  const monthFocus = cells.find((item) => item.inMonth);
  const holidayKeys = new Map(upcomingHolidays.map((item) => [item.dateKey, item]));

  return (
    <PanelSection title={`${monthFocus?.month || 'Month'} coverage`}>
      <div className="bg-white border border-gray-100 rounded-2xl p-3">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEK_DAYS.map((day) => (
            <div key={day} className="text-center text-[10px] font-semibold text-gray-400">
              {day[0]}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell) => {
            const active = selectedDay === cell.day && cell.inMonth;
            const holiday = holidayKeys.get(cell.key);
            const status = dayStatus(cell.day, members);
            return (
              <button
                key={cell.key}
                onClick={() => onSelectDay(cell.day)}
                className={
                  'aspect-square rounded-xl flex flex-col items-center justify-center transition-colors ' +
                  (active
                    ? 'bg-gray-900 text-white'
                    : cell.inMonth
                      ? 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      : 'bg-gray-50/50 text-gray-300 hover:bg-gray-100')
                }
              >
                <span className="text-[12px] font-semibold">{cell.date}</span>
                {holiday ? (
                  <span className={'mt-0.5 text-[8px] font-bold uppercase tracking-wide ' + (active ? 'text-white/70' : 'text-gray-400')}>
                    {closeOnBankHolidays ? 'Closed' : 'BH'}
                  </span>
                ) : (
                  <span className={'mt-1 w-1.5 h-1.5 rounded-full ' + (active ? 'bg-white' : status.dot)} />
                )}
              </button>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[10px] text-gray-500">
          <LegendDot color="bg-gray-900" label="Covered" />
          <LegendDot color="bg-gray-400" label="Tight" />
          <LegendDot color="bg-white border-[1.5px] border-gray-900" label="Understaffed" />
          <span className="flex items-center gap-1.5">
            <span className="text-[8px] font-bold uppercase tracking-wide text-gray-400">BH</span>
            Bank holiday
          </span>
        </div>
      </div>
      <div className="mt-2 text-[11px] text-gray-400 leading-snug">
        Coverage is estimated from your typical bookings for each day.
      </div>
    </PanelSection>
  );
}

// Detail card for the selected day in the month view — spells out the
// demand estimate and what to do about a gap.
function CoverageDayDetail({ day, members, onOpenDay }) {
  const status = dayStatus(day, members);
  const demand = demandByDay[day] || { expectedBookings: 0 };
  const shortfall = Math.max(0, status.needed - status.scheduled);

  return (
    <PanelSection title={`${day} staffing`}>
      <div className="bg-white border border-gray-100 rounded-2xl p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[16px] font-semibold tracking-tight text-gray-900">{status.summary}</div>
            <div className="text-[12px] text-gray-500 mt-1 leading-snug">
              Around {demand.expectedBookings} bookings on a typical {day}.
            </div>
          </div>
          <StatusPill label={status.label} tone={status.state === 'covered' ? 'success' : 'muted'} />
        </div>
        {shortfall > 0 && (
          <div className="mt-3 rounded-xl bg-gray-50 p-3 text-[12px] text-gray-600 leading-snug">
            Add {shortfall} more {shortfall === 1 ? 'person' : 'people'} to the {day} rota, or post an open shift for cover.
          </div>
        )}
        <button
          onClick={onOpenDay}
          className="mt-3 text-[13px] font-medium text-gray-900 underline underline-offset-2"
        >
          Open day rota
        </button>
      </div>
    </PanelSection>
  );
}

// Banner counting down to the next bank holiday, with the business's
// close/stay-open behaviour spelled out.
function HolidayBanner({ closeOnBankHolidays, onOpenSettings }) {
  if (!nextHoliday) return null;
  return (
    <button
      onClick={onOpenSettings}
      className="w-full rounded-2xl border border-gray-200 p-4 flex items-start gap-3 text-left hover:bg-gray-50 transition-colors"
    >
      <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 text-gray-700">
        <CalendarDays size={17} strokeWidth={1.9} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold text-gray-900">
          {nextHoliday.name} · {nextHoliday.dateLabel}
        </div>
        <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">
          {nextHoliday.countdown} ·{' '}
          {closeOnBankHolidays
            ? "You're set to close — staff will be marked off automatically."
            : "You're staying open — check staffing for the day."}
        </div>
      </div>
      <ChevronRight size={16} className="text-gray-300 shrink-0 mt-1" strokeWidth={2} />
    </button>
  );
}

function ShiftSheet({ member, day, shift, onClose, onSave, onMarkSick, onCopyShift }) {
  if (!member || !shift) return null;
  return (
    <ShiftSheetContent
      key={`${member.id}-${day}-${shift.enabled}-${shift.start}-${shift.end}`}
      member={member}
      day={day}
      shift={shift}
      onClose={onClose}
      onSave={onSave}
      onMarkSick={onMarkSick}
      onCopyShift={onCopyShift}
    />
  );
}

function ShiftSheetContent({ member, day, shift, onClose, onSave, onMarkSick, onCopyShift }) {
  const [enabled, setEnabled] = useState(Boolean(shift.enabled));
  const [start, setStart] = useState(shift.start || '09:00');
  const [end, setEnd] = useState(shift.end || '17:00');

  return (
    <BottomSheet
      open={Boolean(member)}
      onClose={onClose}
      title={`${member.name} · ${day}`}
      footer={
        <div className="flex gap-2">
          <button
            onClick={() => onSave({ enabled: false })}
            className="flex-1 h-12 rounded-full border border-gray-200 text-gray-900 text-[15px] font-medium hover:bg-gray-50 transition-colors"
          >
            Set off
          </button>
          <button
            onClick={() => onSave({ enabled, start, end })}
            className="flex-1 h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
          >
            Save shift
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Avatar member={member} />
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-medium text-gray-900">{member.role}</div>
            <div className="text-[12px] text-gray-500">{locationSummary(member)}</div>
          </div>
          <Toggle checked={enabled} onChange={setEnabled} />
        </div>

        <div className={'grid grid-cols-2 gap-3 ' + (!enabled ? 'opacity-40' : '')}>
          <label>
            <span className="text-[13px] font-medium text-gray-700">Start</span>
            <input
              type="time"
              value={start}
              disabled={!enabled}
              onChange={(event) => setStart(event.target.value)}
              className="mt-2 w-full bg-gray-50 rounded-xl px-4 py-3 text-[15px] outline-none"
            />
          </label>
          <label>
            <span className="text-[13px] font-medium text-gray-700">End</span>
            <input
              type="time"
              value={end}
              disabled={!enabled}
              onChange={(event) => setEnd(event.target.value)}
              className="mt-2 w-full bg-gray-50 rounded-xl px-4 py-3 text-[15px] outline-none"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <ToolCard icon={Ban} label="Mark sick" detail="Record sick day, free the shift" onClick={onMarkSick} />
          <ToolCard icon={Copy} label="Copy to week" detail="Use these times all week" onClick={() => onCopyShift({ start, end })} />
        </div>
      </div>
    </BottomSheet>
  );
}

function OpenShiftSheet({ shift, members, onClose, onClaim, onAssign }) {
  if (!shift) return null;
  const available = members.filter((member) => !shiftFor(member, shift.day).enabled);
  const interested = members.filter((member) => (shift.candidates || []).includes(member.id));

  return (
    <BottomSheet
      open={Boolean(shift)}
      onClose={onClose}
      title={`Open shift · ${shift.day}`}
      footer={
        <button
          onClick={onClose}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done
        </button>
      }
    >
      <div className="space-y-5">
        <OpenShiftCard shift={shift} />

        <PanelSection title="Interested staff">
          {interested.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-4 text-[13px] text-gray-500 text-center">
              No one has claimed this yet.
            </div>
          ) : (
            <div className="space-y-2">
              {interested.map((member) => (
                <button
                  key={member.id}
                  onClick={() => onAssign(member.id)}
                  className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <Avatar member={member} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-gray-900 truncate">{member.name}</div>
                    <div className="text-[12px] text-gray-500 truncate">Assign this shift</div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" strokeWidth={2} />
                </button>
              ))}
            </div>
          )}
        </PanelSection>

        <PanelSection title="Available to ask">
          <div className="space-y-2">
            {available.map((member) => {
              const claimed = (shift.candidates || []).includes(member.id);
              return (
                <button
                  key={member.id}
                  onClick={() => onClaim(member.id)}
                  className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <Avatar member={member} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-gray-900 truncate">{member.name}</div>
                    <div className="text-[12px] text-gray-500 truncate">{claimed ? 'Interested' : 'Tap to mark as interested'}</div>
                  </div>
                  {claimed && <Check size={16} className="text-gray-900" strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
        </PanelSection>
      </div>
    </BottomSheet>
  );
}

function CalendarSettingsSheet({ open, view, filters, week, members, openShifts, requests, selectedDay, closeOnBankHolidays, onSetCloseOnBankHolidays, onClose, onSetView, onSetFilters, onSelectDay }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const toggleFilter = (key) => {
    onSetFilters((current) => ({ ...current, [key]: !current[key] }));
  };
  const selectedWeekDateKeys = new Set(week.map((item) => item.key));
  const selectedDayKey = week.find((item) => item.day === selectedDay)?.key;
  const monthCells = calendarPickerCells(week, monthOffset);
  const monthFocus = monthCells.find((item) => item.inMonth);
  const monthLabel = monthFocus?.month || week[0]?.month || 'Month';
  const monthYear = monthFocus?.year || '2026';

  return (
    <BottomSheet open={open} onClose={onClose} title="Calendar settings">
      <div className="space-y-6">
        <PanelSection title="View">
          <div className="grid grid-cols-3 gap-1 bg-gray-50 rounded-full p-1">
            {[
              { key: 'day', label: 'Day' },
              { key: 'week', label: 'Week' },
              { key: 'month', label: 'Month' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => onSetView(item.key)}
                className={
                  'h-10 rounded-full text-[13px] font-medium transition-colors ' +
                  (view === item.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500')
                }
              >
                {item.label}
              </button>
            ))}
          </div>
        </PanelSection>

        <PanelSection title="Pick a date">
          <div className="bg-white border border-gray-100 rounded-2xl p-3">
            <div className="flex items-center justify-between gap-3 mb-3">
              <button
                onClick={() => setMonthOffset((value) => value - 1)}
                className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft size={17} strokeWidth={2} />
              </button>
              <div className="text-[15px] font-semibold text-gray-900">{monthLabel} {monthYear}</div>
              <button
                onClick={() => setMonthOffset((value) => value + 1)}
                className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label="Next month"
              >
                <ChevronRight size={17} strokeWidth={2} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {week.map((item) => (
                <div key={item.day} className="text-center text-[10px] font-semibold text-gray-400">
                  {item.day[0]}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthCells.map((item) => {
                const status = dayStatus(item.day, members, openShifts, requests);
                const selectedWeek = view === 'week' && selectedWeekDateKeys.has(item.key);
                const active =
                  view === 'day'
                    ? item.key === selectedDayKey
                    : view === 'week'
                      ? selectedWeek
                      : false;
                const weekStart = selectedWeek && !monthCells.find((cell) => cell.index === item.index - 1 && selectedWeekDateKeys.has(cell.key));
                const weekEnd = selectedWeek && !monthCells.find((cell) => cell.index === item.index + 1 && selectedWeekDateKeys.has(cell.key));
                return (
                  <div key={item.key} className={(selectedWeek ? 'bg-gray-900 ' : '') + weekSelectionCellClass(weekStart, weekEnd)}>
                    <button
                      onClick={() => onSelectDay(item)}
                      className={
                        'aspect-square w-full flex flex-col items-center justify-center transition-colors ' +
                        (active
                          ? 'text-white'
                          : item.inMonth
                            ? 'rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100'
                            : 'rounded-xl bg-gray-50/50 text-gray-300 hover:bg-gray-100')
                      }
                    >
                      <span className="text-[12px] font-semibold">{item.date}</span>
                      <span className={'mt-1 w-1.5 h-1.5 rounded-full ' + (active ? 'bg-white/70' : status.dot)} />
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-[10px] text-gray-500">
              <LegendDot color="bg-gray-900" label="Covered" />
              <LegendDot color="bg-gray-400" label="Tight" />
              <LegendDot color="bg-white border-[1.5px] border-gray-900" label="Understaffed" />
            </div>
          </div>
        </PanelSection>

        <PanelSection title="Business days">
          <div className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3">
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium text-gray-900">Close on bank holidays</div>
              <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">
                Staff are marked off automatically. Next: {nextHoliday.name}, {nextHoliday.dateLabel}.
              </div>
            </div>
            <Toggle checked={closeOnBankHolidays} onChange={onSetCloseOnBankHolidays} />
          </div>
        </PanelSection>

        <PanelSection title="Show on calendar">
          <div className="space-y-2">
            {[
              { key: 'staff', label: 'Staff rows', detail: 'Show team members and their shifts' },
              { key: 'locations', label: 'Locations', detail: 'Show where shifts are happening' },
              { key: 'openShifts', label: 'Open shifts', detail: 'Show cover and claimable shifts' },
              { key: 'requests', label: 'Requests and issues', detail: 'Show manager queue tasks' },
            ].map((item) => (
              <div
                key={item.key}
                className="w-full flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-3"
              >
                <button onClick={() => toggleFilter(item.key)} className="flex-1 min-w-0 text-left">
                  <div className="text-[14px] font-medium text-gray-900">{item.label}</div>
                  <div className="text-[12px] text-gray-500 mt-0.5">{item.detail}</div>
                </button>
                <Toggle checked={filters[item.key]} onChange={() => toggleFilter(item.key)} />
              </div>
            ))}
          </div>
        </PanelSection>
      </div>
    </BottomSheet>
  );
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <span className="truncate">{label}</span>
    </div>
  );
}

function PayPanel({ members, onSelect }) {
  const payroll = useMemo(() => buildPayrollPrototype(members), [members]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [selectedPayoutLine, setSelectedPayoutLine] = useState(null);
  const [runState, setRunState] = useState(payroll.period.state);
  const stripeBalance = 18340;

  // Two money streams on Stripe rails: commission/freelancer earnings split
  // automatically per booking (nothing to authorise), wages accrue and move
  // in the scheduled pay run. Rent flows the other way — collected from
  // freelancers' own Stripe accounts.
  const isAutoSplit = (member) => isFreelancerMember(member) || member?.payment?.type === 'contractor';
  const memberFor = (line) => members.find((item) => item.id === line.memberId);
  const runLines = payroll.lines.filter((line) => !isAutoSplit(memberFor(line)));
  const splitLines = payroll.lines.filter((line) => isAutoSplit(memberFor(line)));
  const runTotal = runLines.reduce((sum, line) => sum + Math.max(0, line.net), 0);
  const splitTotal = splitLines.reduce((sum, line) => sum + Math.max(0, line.net), 0);
  const rentMembers = members.filter(
    (member) => member.payment?.chairRentEnabled || member.freelance?.rentEnabled,
  );
  const payrollForRun = { ...payroll, lines: runLines, totals: { ...payroll.totals, net: runTotal } };

  const openPayoutReview = (line = null) => {
    setSelectedPayoutLine(line);
    setReviewOpen(true);
  };

  return (
    <div className="space-y-7">
      <section className="rounded-[28px] bg-gray-950 text-white px-5 py-5 overflow-hidden relative">
        <div className="absolute -right-12 -bottom-16 w-40 h-40 rounded-full bg-white/10" />
        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[12px] uppercase tracking-[0.12em] text-white/60">Stripe balance</div>
              <div className="text-[28px] font-semibold tracking-tight mt-2">{formatMoney(stripeBalance)}</div>
              <div className="text-[13px] text-white/65 mt-1">{payroll.period.label} · {runLines.length} wages in next run</div>
            </div>
            <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white">
              {payrollStateLabel(runState)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <DarkMetric label="Next pay run (wages)" value={formatMoney(runTotal)} />
            <DarkMetric label="Split as earned" value={formatMoney(splitTotal)} />
          </div>

          <button
            onClick={() => openPayoutReview()}
            className="mt-6 h-11 px-5 rounded-full bg-white text-gray-950 text-[14px] font-semibold inline-flex items-center gap-2"
          >
            <ReceiptText size={16} strokeWidth={2} />
            Run payroll
          </button>

          <div className="mt-4 text-[11px] text-white/50 leading-snug">
            Payments and payouts run on your Stripe account. That Time never holds your money.
          </div>
        </div>
      </section>

      <PanelSection title="Next pay run">
        <div className="divide-y divide-gray-100 border-y border-gray-100">
          {runLines.map((line) => {
            const member = memberFor(line);
            return (
              <div key={line.memberId} className="py-4 flex items-center gap-3">
                <button onClick={() => onSelect(line.memberId)} className="shrink-0" aria-label={`Open ${line.memberName}`}>
                  {member && <Avatar member={member} />}
                </button>
                <button onClick={() => onSelect(line.memberId)} className="flex-1 min-w-0 text-left">
                  <div className="text-[15px] font-semibold text-gray-900 truncate">{line.memberName}</div>
                  <div className="text-[12px] text-gray-500 mt-0.5 truncate">
                    {paymentModelLabel(line.model)} · {stripeStatusLabel(line.bankStatus)}
                  </div>
                </button>
                <div className="text-right shrink-0">
                  <div className="text-[17px] font-semibold text-gray-950">{formatMoney(line.net)}</div>
                  <button
                    onClick={() => openPayoutReview(line)}
                    className="mt-1 text-[12px] font-semibold text-gray-900 underline decoration-gray-300 underline-offset-4"
                  >
                    Authorise
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </PanelSection>

      <PanelSection title="Split as earned">
        <div className="text-[12px] text-gray-500 leading-snug mb-1">
          Commission and freelancer earnings split automatically on every booking — nothing to authorise.
        </div>
        <div className="divide-y divide-gray-100 border-y border-gray-100">
          {splitLines.map((line) => {
            const member = memberFor(line);
            return (
              <div key={line.memberId} className="py-4 flex items-center gap-3">
                <button onClick={() => onSelect(line.memberId)} className="shrink-0" aria-label={`Open ${line.memberName}`}>
                  {member && <Avatar member={member} />}
                </button>
                <button onClick={() => onSelect(line.memberId)} className="flex-1 min-w-0 text-left">
                  <div className="text-[15px] font-semibold text-gray-900 truncate">{line.memberName}</div>
                  <div className="text-[12px] text-gray-500 mt-0.5 truncate">
                    {paymentModelLabel(line.model)} · {stripeStatusLabel(line.bankStatus)}
                  </div>
                </button>
                <div className="text-right shrink-0">
                  <div className="text-[17px] font-semibold text-gray-950">{formatMoney(Math.max(0, line.net))}</div>
                  <div className="mt-1 text-[11px] font-medium text-gray-400">Paid as earned</div>
                </div>
              </div>
            );
          })}
        </div>
      </PanelSection>

      {rentMembers.length > 0 && (
        <PanelSection title="Rent collected">
          <div className="divide-y divide-gray-100 border-y border-gray-100">
            {rentMembers.map((member) => {
              const rent = member.freelance || {};
              const amount = Number(rent.rentAmount || member.payment?.rentAmount || 0);
              const frequency = rent.rentFrequency || member.payment?.rentFrequency || 'monthly';
              return (
                <button
                  key={member.id}
                  onClick={() => onSelect(member.id)}
                  className="w-full py-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <Avatar member={member} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-semibold text-gray-900 truncate">
                      {member.name}
                      {rent.businessName ? ` · ${rent.businessName}` : ''}
                    </div>
                    <div className="text-[12px] text-gray-500 mt-0.5 truncate">
                      Chair rent · auto-collected via Stripe
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[17px] font-semibold text-gray-950">+{formatMoney(amount)}</div>
                    <div className="mt-1 text-[11px] font-medium text-gray-400">{frequency}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </PanelSection>
      )}

      <PanelSection title="Past pay runs">
        <div className="divide-y divide-gray-100 border-y border-gray-100">
          {payroll.pastRuns.map((run) => (
            <div key={run.id} className="py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                <FileText size={17} strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium text-gray-900">{run.label}</div>
                <div className="text-[12px] text-gray-500 mt-0.5">{run.paidAt}</div>
              </div>
              <div className="text-right">
                <div className="text-[14px] font-semibold text-gray-900">{formatMoney(run.total)}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{payrollStateLabel(run.state)}</div>
              </div>
            </div>
          ))}
        </div>
      </PanelSection>

      <PayRunReviewSheet
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        payroll={payrollForRun}
        selectedLine={selectedPayoutLine}
        runState={runState}
        onApprove={() => setRunState('approved')}
        onMarkPaid={() => setRunState('paid')}
      />
    </div>
  );
}

function DarkMetric({ label, value }) {
  return (
    <div>
      <div className="text-[21px] font-semibold text-white">{value}</div>
      <div className="text-[11px] text-white/55 mt-0.5">{label}</div>
    </div>
  );
}

function PayRunReviewSheet({ open, onClose, payroll, selectedLine, runState, onApprove, onMarkPaid }) {
  const lines = selectedLine ? [selectedLine] : payroll.lines;
  const payoutTotal = lines.reduce((sum, line) => sum + line.net, 0);
  const breakdown = lines.reduce((sum, line) => ({
    wages: sum.wages + line.wages,
    commission: sum.commission + line.commission,
    tips: sum.tips + line.tips,
    rent: sum.rent + line.chairRent,
    adjustment: sum.adjustment + line.adjustment,
  }), { wages: 0, commission: 0, tips: 0, rent: 0, adjustment: 0 });

  return (
    <BottomSheet open={open} onClose={onClose} title="Authorise payouts">
      <div className="space-y-6">
        <section>
          <div className="text-[22px] font-semibold tracking-tight text-gray-950">{selectedLine ? `Pay ${selectedLine.memberName}` : 'Pay the team'}</div>
          <div className="text-[13px] text-gray-500 mt-1">{payroll.period.label} · wages move via Stripe</div>
          <div className="grid grid-cols-2 gap-3 mt-5">
            <Metric label="Total payout" value={formatMoney(payoutTotal)} />
            <Metric label="Team members" value={lines.length} />
          </div>
        </section>

        <PanelSection title="Pay breakdown">
          <div className="flex flex-wrap gap-2">
            {[
              ['Wages', breakdown.wages],
              ['Commission', breakdown.commission],
              ['Tips', breakdown.tips],
              ['Chair rent', -breakdown.rent],
              ['Adjustments', breakdown.adjustment],
            ].map(([label, value]) => (
              <span key={label} className="rounded-full bg-gray-50 px-3 py-2 text-[12px] font-medium text-gray-700">
                {label} {formatMoney(value)}
              </span>
            ))}
          </div>
        </PanelSection>

        <PanelSection title="Team breakdown">
          <div className="divide-y divide-gray-100 border-y border-gray-100">
            {lines.map((line) => (
              <PayRunLine key={line.memberId} line={line} />
            ))}
          </div>
        </PanelSection>

        <div className="sticky bottom-0 bg-white pt-2 pb-3 flex gap-3">
          <button
            onClick={onApprove}
            disabled={runState === 'approved' || runState === 'paid'}
            className="flex-1 h-12 rounded-full bg-gray-900 text-white text-[14px] font-semibold disabled:bg-gray-100 disabled:text-gray-400"
          >
            Authorise
          </button>
          <button
            onClick={onMarkPaid}
            disabled={runState !== 'approved'}
            className="flex-1 h-12 rounded-full border border-gray-200 text-[14px] font-semibold text-gray-900 disabled:text-gray-300"
          >
            Mark paid
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

function PayRunLine({ line }) {
  return (
    <div className="py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-gray-900 truncate">{line.memberName}</div>
          <div className="text-[12px] text-gray-500 mt-0.5">
            {line.hours}h · {formatMoney(line.sales)} sales · via Stripe
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[16px] font-semibold text-gray-950">{formatMoney(line.net)}</div>
          <div className="text-[11px] text-gray-500 mt-0.5">{paymentModelLabel(line.model)}</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-3 text-[11px] text-gray-500">
        <span>Wages {formatMoney(line.wages)}</span>
        <span>Comm {formatMoney(line.commission)}</span>
        <span>Tips {formatMoney(line.tips)}</span>
        <span>Rent {formatMoney(line.chairRent)}</span>
      </div>
    </div>
  );
}

function ToolCard({ icon: Icon, label, detail, onClick }) {
  return (
    <button onClick={onClick} className="bg-white border border-gray-100 rounded-2xl p-4 text-left hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
          {createElement(Icon, { size: 16, className: 'text-gray-700', strokeWidth: 1.75 })}
        </div>
        <div className="min-w-0">
          <div className="text-[14px] font-medium text-gray-900 truncate">{label}</div>
          <div className="text-[12px] text-gray-500 truncate">{detail}</div>
        </div>
      </div>
    </button>
  );
}

function RequestCard({ request, onClick, compact = false }) {
  if (compact) {
    return (
      <button
        onClick={onClick}
        className="shrink-0 w-[238px] rounded-3xl bg-gray-50 p-4 text-left hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center justify-between gap-3">
          <div className={'w-10 h-10 rounded-full flex items-center justify-center ' + request.tone}>
            {createElement(request.icon, { size: 17, strokeWidth: 1.9 })}
          </div>
          <div className="flex items-center gap-2">
            <StatusPill label={request.status} tone={request.status === 'pending' ? 'muted' : 'dark'} />
            <ChevronRight size={17} className="text-gray-300" strokeWidth={2} />
          </div>
        </div>
        <div className="mt-4 text-[15px] font-semibold text-gray-950 truncate">{request.title}</div>
        <div className="text-[12px] text-gray-500 mt-1 truncate">{request.member.name} · {request.date}</div>
        <div className="text-[12px] text-gray-600 mt-3 leading-snug line-clamp-3">{request.impact}</div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full py-3 border-b border-gray-100 text-left hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className={'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ' + request.tone}>
          {createElement(request.icon, { size: 16, strokeWidth: 1.75 })}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-[14px] font-medium text-gray-900 truncate">{request.title}</div>
            <StatusPill label={request.status} tone={request.status === 'pending' ? 'muted' : 'dark'} />
          </div>
          <div className="text-[12px] text-gray-500 mt-0.5 truncate">{request.member.name} · {request.date}</div>
          <div className="text-[12px] text-gray-600 mt-2 leading-snug">{request.impact}</div>
        </div>
      </div>
    </button>
  );
}

function OpenShiftCard({ shift, onClick, compact = false }) {
  const location = businessLocations.find((item) => item.id === shift.locationId);
  const candidates = shift.candidates?.length || 0;
  return (
    <button
      onClick={onClick}
      className={
        'bg-amber-50 rounded-2xl p-4 text-left hover:bg-amber-100/60 transition-colors ' +
        (compact ? 'shrink-0 w-[218px]' : 'w-full')
      }
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-white text-amber-700 flex items-center justify-center shrink-0">
          <Plus size={16} strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="text-[14px] font-semibold text-amber-950 truncate">Open shift</div>
            <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-white text-amber-700">
              {candidates} interested
            </span>
          </div>
          <div className="text-[12px] text-amber-800 mt-1 truncate">{shift.day} · {shift.start}-{shift.end}</div>
          <div className="text-[12px] text-amber-700 mt-1 truncate">{shift.role} · {location?.name || 'Any location'}</div>
        </div>
      </div>
    </button>
  );
}

export function WeeklyScheduleEditor({ schedule, onChange }) {
  const normalized = {
    ...(schedule || {}),
    timezone: schedule?.timezone || 'Europe/London',
    weekly: schedule?.weekly?.length ? schedule.weekly : emptyWeeklySchedule(),
    timeOff: schedule?.timeOff || [],
  };

  const updateDay = (index, patch) => {
    onChange({
      ...normalized,
      weekly: normalized.weekly.map((day, i) => (i === index ? { ...day, ...patch } : day)),
    });
  };

  return (
    <div className="divide-y divide-gray-100 border-y border-gray-100">
      {normalized.weekly.map((day, index) => (
        <div key={day.day} className="py-3 flex items-center gap-3">
          <div className="w-9 text-[13px] font-semibold text-gray-700">{day.day}</div>
          <Toggle checked={Boolean(day.enabled)} onChange={(enabled) => updateDay(index, { enabled })} />
          <div className={'flex-1 grid grid-cols-2 gap-2 ' + (!day.enabled ? 'opacity-40' : '')}>
            <input
              type="time"
              value={day.start}
              disabled={!day.enabled}
              onChange={(event) => updateDay(index, { start: event.target.value })}
              className="min-w-0 rounded-xl bg-gray-50 px-2 py-2 text-[13px] outline-none"
            />
            <input
              type="time"
              value={day.end}
              disabled={!day.enabled}
              onChange={(event) => updateDay(index, { end: event.target.value })}
              className="min-w-0 rounded-xl bg-gray-50 px-2 py-2 text-[13px] outline-none"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RoleEditor({ roles, onChange }) {
  const toggleRole = (role) => {
    const next = roles.includes(role)
      ? roles.filter((item) => item !== role)
      : [...roles, role];
    onChange(next.length > 0 ? next : ['Staff']);
  };

  return (
    <div className="mb-4">
      <div className="text-[13px] font-medium text-gray-700 mb-2">Roles</div>
      <div className="flex gap-2">
        {ROLE_OPTIONS.map((role) => (
          <button
            key={role}
            onClick={() => toggleRole(role)}
            className={
              'h-10 px-3 rounded-full text-[13px] font-medium transition-colors ' +
              (roles.includes(role) ? 'bg-gray-900 text-white' : 'bg-white border border-gray-100 text-gray-600 hover:bg-gray-50')
            }
          >
            {role}
          </button>
        ))}
      </div>
    </div>
  );
}

function PermissionEditor({ permissions, onChange, bare = false }) {
  const className = bare
    ? 'divide-y divide-gray-100 border-t border-gray-100'
    : 'bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100';

  return (
    <div className={className}>
      {PERMISSIONS.map((permission) => (
        <label key={permission.key} className={(bare ? 'py-3' : 'px-4 py-3') + ' flex items-center gap-3'}>
          <input
            type="checkbox"
            checked={Boolean(permissions[permission.key])}
            onChange={(event) => onChange({ ...permissions, [permission.key]: event.target.checked })}
            className="h-4 w-4 rounded border-gray-300 accent-gray-900"
          />
          <div className="flex-1 min-w-0">
            <div className="text-[14px] text-gray-900">{permission.label}</div>
            <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">{permission.desc}</div>
          </div>
        </label>
      ))}
    </div>
  );
}

function MemberRow({ member, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
    >
      <Avatar member={member} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-[15px] font-medium text-gray-900 truncate">{member.name}</div>
          {member.status === 'pending' && <Mail size={13} className="text-gray-400 shrink-0" strokeWidth={2} />}
        </div>
        <div className="text-[12px] text-gray-500 mt-0.5 truncate">
          {member.role} · {memberNextShift(member)}
        </div>
      </div>
      <StatusPill label={statusLabel(member)} tone={member.status === 'active' ? 'dark' : 'muted'} />
      <ChevronRight size={16} className="text-gray-300 shrink-0" strokeWidth={2} />
    </button>
  );
}

function Metric({ label, value }) {
  return (
    <div className="py-2">
      <div className="text-[22px] font-semibold text-gray-950">{value}</div>
      <div className="text-[12px] text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function PanelSection({ title, children }) {
  return (
    <section>
      <div className="text-[18px] font-semibold tracking-tight text-gray-950 mb-3">{title}</div>
      {children}
    </section>
  );
}

function WizardFormSection({ title, description, children }) {
  return (
    <section className="space-y-4">
      {(title || description) && (
        <div>
          <div className="text-[17px] font-semibold tracking-tight text-gray-950">{title}</div>
          {description && <div className="text-[13px] text-gray-500 mt-1 leading-snug">{description}</div>}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
}

function SetupSummary({ member }) {
  const summary = [
    { label: 'Type', value: memberTypeLabel(member.memberType) },
    { label: 'Pay', value: paymentModelLabel(member.payment?.model || member.payment?.type) },
    { label: 'Schedule', value: schedulePatternLabel(member.schedule?.pattern) },
    { label: 'Invite', value: member.onboarding?.inviteCode || member.invite?.sentAt || 'Not sent' },
  ];

  return (
    <PanelSection title="Setup summary">
      <div className="grid grid-cols-2 gap-2">
        {summary.map((item) => (
          <div key={item.label} className="py-2 border-b border-gray-100">
            <div className="text-[12px] text-gray-500">{item.label}</div>
            <div className="text-[14px] font-medium text-gray-900 mt-1 truncate">{item.value}</div>
          </div>
        ))}
      </div>
    </PanelSection>
  );
}

function EmptyPanel({ icon: Icon, title, body }) {
  return (
    <div className="py-8 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
        {createElement(Icon, { size: 18, className: 'text-gray-500', strokeWidth: 1.75 })}
      </div>
      <div className="text-[15px] font-medium text-gray-900">{title}</div>
      <div className="text-[13px] text-gray-500 mt-1 leading-snug">{body}</div>
    </div>
  );
}

function MiniAvatar({ member }) {
  return (
    <div className={`w-5 h-5 rounded-full ${member.avatarColor || 'bg-gray-100 text-gray-700'} text-[8px] font-semibold flex items-center justify-center shrink-0`}>
      {initialsFor(member).slice(0, 1)}
    </div>
  );
}

function Avatar({ member, large = false }) {
  const size = large ? 'w-14 h-14 text-[16px]' : 'w-10 h-10 text-[12px]';
  return (
    <div className={`${size} rounded-full ${member.avatarColor || 'bg-gray-100 text-gray-700'} font-semibold flex items-center justify-center shrink-0`}>
      {initialsFor(member)}
    </div>
  );
}

function StatusPill({ label, tone = 'muted' }) {
  const cls =
    tone === 'dark'
      ? 'bg-gray-900 text-white'
      : tone === 'success'
        ? 'bg-emerald-50 text-emerald-700'
        : 'bg-gray-100 text-gray-600';
  return (
    <span className={`text-[11px] font-medium px-2 py-1 rounded-full shrink-0 ${cls}`}>
      {label}
    </span>
  );
}

function teamInsightMetrics(members) {
  const ready = members.filter(isReadyForBookings).length;
  const workingHours = members.reduce((sum, member) => sum + Number(member.rota?.thisWeekHours || 0), 0);
  const targetHours = Math.max(1, members.length * 35);
  const earnings = members.reduce((sum, member) => sum + memberEstimatedWeeklyEarnings(member), 0);
  return {
    utilisation: Math.round((workingHours / targetHours) * 100),
    averageEarnings: Math.round(earnings / Math.max(1, members.length)),
    ready,
  };
}

function memberPerformance(member) {
  const hours = Number(member.rota?.thisWeekHours || 0);
  const sales = Math.round(memberEstimatedWeeklyEarnings(member) * 1.8);
  return {
    sales,
    bookings: Math.max(0, Math.round(hours * 1.4)),
    hours,
    utilisation: Math.min(100, Math.round((hours / 35) * 100)),
  };
}

function memberTrendData(member, totalSales) {
  const seed = String(member.id || member.name || '').split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const weights = [0.14, 0.19, 0.16, 0.24, 0.27].map((weight, index) => weight + (((seed + index * 7) % 9) - 4) / 100);
  const totalWeight = weights.reduce((sum, item) => sum + item, 0) || 1;
  return weights.map((weight) => Math.max(20, Math.round((totalSales * weight) / totalWeight)));
}

function memberWeeklyHours(member) {
  return ensureWeekly(member.schedule?.weekly).map((shift) => ({
    day: shift.day,
    hours: shift.enabled ? hoursForShift(shift) : 0,
  }));
}

function memberEstimatedWeeklyEarnings(member) {
  const hours = Number(member.rota?.thisWeekHours || 0);
  const rate = numericPayRate(member.payment);
  const payRateText = String(member.payment?.payRate || '').toLowerCase();
  if (rate > 0 && /session|class/.test(payRateText)) return Math.round(rate * memberSessionCount(member));
  if (rate > 0) return Math.round(rate * hours);
  const commission = Number(member.payment?.commission || 0);
  if (commission > 0) return Math.round(hours * 42 * (commission / 100));
  return Math.round(hours * 18);
}

function memberSessionCount(member) {
  const scheduled = ensureWeekly(member.schedule?.weekly).filter((shift) => shift.enabled).length;
  return scheduled || Math.max(1, Math.round(Number(member.rota?.thisWeekHours || 0) / 6));
}

function numericPayRate(payment = {}) {
  const direct = Number(payment.rate || payment.terms?.rate || 0);
  if (direct > 0) return direct;
  const match = String(payment.payRate || '').match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : 0;
}

function timesheetStatusLabel(status) {
  if (status === 'approved') return 'Approved';
  if (status === 'pending') return 'Needs approval';
  if (status === 'none') return 'Not tracked';
  return 'Draft';
}

function payrollPeriodLabel() {
  return '18 May - 24 May';
}

function emptyTeamMemberWizardDraft() {
  const systemRoles = ['Staff'];
  return {
    memberType: 'bookable_staff',
    name: '',
    email: '',
    phone: '',
    startDate: '',
    role: 'Stylist',
    services: [],
    bookable: true,
    systemRoles,
    permissionPreset: 'staff',
    permissions: defaultPermissionsFor(systemRoles),
    profile: {
      visibility: 'private',
    },
    payment: {
      setupMode: 'manual',
      structureId: '',
      copiedFromMemberId: '',
      model: 'hourly',
      paymentType: 'hourly',
      rate: '',
      ratePeriod: 'hourly',
      commission: '',
      commissionEnabled: false,
      rentAmount: '',
      rentFrequency: 'weekly',
      chairRentEnabled: false,
      payout: 'member',
      walletRequired: true,
      includedInPayRuns: true,
      payFrequency: 'business_default',
      timesheetSource: 'scheduled',
      overtimeEnabled: false,
      overtimeRate: '',
      paidBreaks: false,
      tipsIncluded: true,
      deductionsAllowed: true,
    },
    schedule: {
      pattern: 'weekly',
      flexiMode: 'open_shifts',
      noticeHours: '',
      maxShifts: '',
      customCycle: '4',
      weekly: emptyWeeklySchedule(),
    },
    locations: {
      primaryLocationId: 'loc1',
      allowedLocationIds: ['loc1'],
      mobile: false,
      remote: false,
    },
  };
}

function templateDefaults(memberType) {
  if (memberType === 'admin') {
    return {
      role: 'Admin',
      bookable: false,
      services: [],
      systemRoles: ['Manager'],
      permissionPreset: 'admin',
      profile: { visibility: 'private' },
      payment: { setupMode: 'manual', structureId: '', copiedFromMemberId: '', model: 'none', paymentType: 'none', rate: '', ratePeriod: 'monthly', commission: '', commissionEnabled: false, rentAmount: '', rentFrequency: 'monthly', chairRentEnabled: false, payout: 'not_required', walletRequired: false, includedInPayRuns: false, payFrequency: 'business_default', timesheetSource: 'manual', overtimeEnabled: false, overtimeRate: '', paidBreaks: false, tipsIncluded: false, deductionsAllowed: false },
      schedule: { pattern: 'flexi', flexiMode: 'owner_assigned', noticeHours: '', maxShifts: '', customCycle: '4', weekly: emptyWeeklySchedule().map((day) => ({ ...day, enabled: false })) },
    };
  }
  if (memberType === 'freelancer') {
    return {
      role: 'Freelancer',
      bookable: true,
      systemRoles: ['Staff'],
      permissionPreset: 'staff',
      payment: { setupMode: 'manual', structureId: '', copiedFromMemberId: '', model: 'no_base', paymentType: 'no_base', rate: '', ratePeriod: 'hourly', commission: '40', commissionEnabled: true, rentAmount: '', rentFrequency: 'weekly', chairRentEnabled: false, payout: 'member', walletRequired: true, includedInPayRuns: true, payFrequency: 'business_default', timesheetSource: 'manual', overtimeEnabled: false, overtimeRate: '', paidBreaks: false, tipsIncluded: true, deductionsAllowed: true, commissionBasis: 'services', commissionType: 'percentage', commissionEffectiveDate: '' },
      schedule: { pattern: 'weekly', flexiMode: 'open_shifts', noticeHours: '', maxShifts: '', customCycle: '4', weekly: emptyWeeklySchedule() },
    };
  }
  if (memberType === 'flexi_cover') {
    return {
      role: 'Flexi cover',
      bookable: true,
      systemRoles: ['Staff'],
      permissionPreset: 'staff',
      payment: { setupMode: 'manual', structureId: '', copiedFromMemberId: '', model: 'hourly', paymentType: 'hourly', rate: '', ratePeriod: 'hourly', commission: '', commissionEnabled: false, rentAmount: '', rentFrequency: 'weekly', chairRentEnabled: false, payout: 'member', walletRequired: true, includedInPayRuns: true, payFrequency: 'business_default', timesheetSource: 'scheduled', overtimeEnabled: false, overtimeRate: '', paidBreaks: false, tipsIncluded: true, deductionsAllowed: true },
      schedule: { pattern: 'flexi', flexiMode: 'open_shifts', noticeHours: '24', maxShifts: '', customCycle: '4', weekly: emptyWeeklySchedule().map((day) => ({ ...day, enabled: false })) },
    };
  }
  return {
    role: 'Stylist',
    bookable: true,
    systemRoles: ['Staff'],
    permissionPreset: 'staff',
    payment: { setupMode: 'manual', structureId: '', copiedFromMemberId: '', model: 'hourly', paymentType: 'hourly', rate: '', ratePeriod: 'hourly', commission: '', commissionEnabled: false, rentAmount: '', rentFrequency: 'weekly', chairRentEnabled: false, payout: 'member', walletRequired: true, includedInPayRuns: true, payFrequency: 'business_default', timesheetSource: 'scheduled', overtimeEnabled: false, overtimeRate: '', paidBreaks: false, tipsIncluded: true, deductionsAllowed: true },
    schedule: { pattern: 'weekly', flexiMode: 'open_shifts', noticeHours: '', maxShifts: '', customCycle: '4', weekly: emptyWeeklySchedule() },
  };
}

function buildWizardMember(draft) {
  const id = 's_' + Date.now().toString(36);
  const inviteCode = `TT-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const schedule = draft.schedule || {};
  const weekly = schedule.pattern === 'flexi'
    ? emptyWeeklySchedule().map((day) => ({ ...day, enabled: false }))
    : schedule.weekly;
  const firstShift = weekly.find((day) => day.enabled);
  const payment = draft.payment || {};
  const memberType = draft.memberType;
  const bookable = memberType !== 'admin' && Boolean(draft.bookable);
  const locationPrefs = draft.locations || {};
  const allowedLocationIds = locationPrefs.allowedLocationIds?.length
    ? locationPrefs.allowedLocationIds
    : [locationPrefs.primaryLocationId || 'loc1'];
  const commissionEnabled = Boolean(payment.commissionEnabled);
  const chairRentEnabled = Boolean(payment.chairRentEnabled);

  return {
    id,
    memberType,
    name: draft.name.trim(),
    email: draft.email.trim(),
    phone: draft.phone.trim(),
    startDate: draft.startDate,
    role: draft.role.trim() || memberTypeLabel(memberType),
    systemRoles: draft.systemRoles,
    active: false,
    status: 'pending',
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    locations: allowedLocationIds,
    locationPrefs: {
      primaryLocationId: locationPrefs.primaryLocationId || allowedLocationIds[0],
      allowedLocationIds,
      mobile: Boolean(locationPrefs.mobile),
      remote: Boolean(locationPrefs.remote),
    },
    services: memberType === 'admin' || !bookable ? [] : draft.services,
    bookable,
    profile: {
      publicName: draft.name.trim(),
      bio: '',
      social: '',
      visibility: draft.profile.visibility,
      visibleOnProfile: false,
      publicWhenOnboarded: bookable && draft.profile.visibility === 'public',
      featured: false,
    },
    schedule: {
      timezone: 'Europe/London',
      pattern: schedule.pattern,
      flexiMode: schedule.flexiMode,
      noticeHours: schedule.noticeHours,
      maxShifts: schedule.maxShifts,
      customCycle: schedule.customCycle,
      weekly,
      timeOff: [],
    },
    permissions: draft.permissions,
    payment: {
      type: payment.model === 'no_base' && (commissionEnabled || chairRentEnabled) ? 'contractor' : 'employee',
      setupMode: payment.setupMode || 'manual',
      structureId: payment.structureId || '',
      copiedFromMemberId: payment.copiedFromMemberId || '',
      model: payment.model,
      paymentType: payment.paymentType || payment.model,
      payRate: payment.rate ? `£${payment.rate}/${payment.ratePeriod || 'hourly'}` : paymentTermsSummary(payment),
      rate: payment.rate,
      ratePeriod: payment.ratePeriod || 'hourly',
      commissionEnabled,
      commission: commissionEnabled ? Number(payment.commission || 0) : 0,
      chairRentEnabled,
      tips: payment.tipsIncluded !== false,
      tipsIncluded: payment.tipsIncluded !== false,
      deductionsAllowed: Boolean(payment.deductionsAllowed),
      walletRequired: payment.walletRequired ?? payment.model !== 'none',
      includedInPayRuns: payment.includedInPayRuns ?? payment.model !== 'none',
      payFrequency: payment.payFrequency || 'business_default',
      payoutStatus: payment.model === 'none' ? 'Not required' : 'Member payout needed',
      payout: payment.payout || (payment.model === 'none' ? 'not_required' : 'member'),
      terms: {
        setupMode: payment.setupMode || 'manual',
        structureId: payment.structureId || '',
        copiedFromMemberId: payment.copiedFromMemberId || '',
        paymentType: payment.paymentType || payment.model,
        rate: payment.rate,
        ratePeriod: payment.ratePeriod,
        commission: payment.commission,
        commissionEnabled,
        rentAmount: payment.rentAmount,
        rentFrequency: payment.rentFrequency,
        chairRentEnabled,
        timesheetSource: payment.timesheetSource,
        includedInPayRuns: payment.includedInPayRuns ?? payment.model !== 'none',
        walletRequired: payment.walletRequired ?? payment.model !== 'none',
        payFrequency: payment.payFrequency || 'business_default',
        overtimeEnabled: payment.overtimeEnabled,
        overtimeRate: payment.overtimeRate,
        paidBreaks: payment.paidBreaks,
        tipsIncluded: payment.tipsIncluded !== false,
        deductionsAllowed: Boolean(payment.deductionsAllowed),
        commissionBasis: payment.commissionBasis,
        commissionType: payment.commissionType,
        commissionEffectiveDate: payment.commissionEffectiveDate,
      },
    },
    rota: {
      thisWeekHours: weekly.reduce((sum, day) => sum + (day.enabled ? hoursForShift(day) : 0), 0),
      nextShift: firstShift ? `${firstShift.day} ${firstShift.start}` : 'No rota set',
      notes: schedule.pattern === 'flexi' ? 'Flexi cover - assign shifts as needed' : `${schedulePatternLabel(schedule.pattern)} pattern`,
    },
    invite: {
      sentAt: 'Just now',
      acceptedAt: null,
      channel: draft.phone.trim() ? 'email + phone' : 'email',
      code: inviteCode,
    },
    onboarding: {
      inviteCode,
      accepted: false,
      profileComplete: false,
      payoutSetup: payment.model === 'none' || payment.walletRequired === false ? 'not_required' : 'member_required',
    },
  };
}

function paymentTermsSummary(payment) {
  if (payment.model === 'none') return 'Set up later';
  const addOns = paymentAddOns(payment);
  if (payment.model === 'commission') return `${commissionRuleSummary(payment)}`;
  if (payment.model === 'chair_rent') return chairRentSummary(payment);
  if (payment.model === 'hybrid') return ['Hybrid', ...addOns].join(' + ');
  if (payment.model === 'no_base') return addOns.length ? addOns.join(' + ') : 'No base pay';
  if (payment.model === 'per_session') return payment.rate ? `£${payment.rate}/${payment.ratePeriod || 'session'}` : 'Per session';
  if (payment.rate) {
    const base = `£${payment.rate}/${payment.ratePeriod || 'hourly'}`;
    return addOns.length ? `${base} + ${addOns.join(' + ')}` : base;
  }
  return payment.model || 'Not set';
}

function paymentAddOns(payment = {}) {
  const addOns = [];
  if (payment.commissionEnabled || payment.model === 'commission' || payment.model === 'hybrid') addOns.push(commissionRuleSummary(payment));
  if (payment.tipsIncluded !== false && payment.model !== 'none') addOns.push('tips');
  if (payment.chairRentEnabled || payment.model === 'chair_rent' || payment.model === 'hybrid') addOns.push(chairRentSummary(payment));
  return addOns;
}

function paymentAddOnSummary(payment = {}) {
  const addOns = paymentAddOns(payment);
  if (payment.model === 'none') return 'None yet';
  return addOns.length ? addOns.join(', ') : 'No add-ons';
}

function commissionRuleSummary(payment = {}) {
  const amount = payment.commission || 'Not set';
  const basisLabels = {
    services: 'services',
    service_addons: 'service add-ons',
    products: 'products',
    memberships: 'memberships',
    packages: 'packages',
    all_sales: 'all sales',
    all_offerings: 'all offerings',
  };
  const basis = basisLabels[payment.commissionBasis] || 'services';
  if (payment.commissionType === 'fixed_amount') return `£${String(amount).replace('£', '')} per ${basis}`;
  return `${amount}% on ${basis}`;
}

function chairRentSummary(payment = {}) {
  const amount = payment.rentAmount ? `£${String(payment.rentAmount).replace('£', '')}` : 'Rent';
  return `${amount} ${payment.rentFrequency || 'weekly'} chair rent`;
}

function memberTypeLabel(value) {
  if (value === 'employee') return 'Employee';
  return MEMBER_TEMPLATES.find((item) => item.key === value)?.label || 'Team member';
}

function paymentModelLabel(value) {
  if (value === 'unset') return 'Not set up';
  return PAYMENT_MODELS.find((item) => item.key === value)?.label || value || 'Not set';
}

function schedulePatternLabel(value) {
  return SCHEDULE_PATTERNS.find((item) => item.key === value)?.label || 'Weekly';
}

function scheduleFrequencyDescription(pattern, schedule = {}) {
  if (pattern === 'biweekly') return `week ${schedule.activeCycleWeek || '1'} of a 2-week rota`;
  if (pattern === 'four_week') return `week ${schedule.activeCycleWeek || '1'} of a 4-week rota`;
  if (pattern === 'monthly') return schedule.monthlyRule === 'same_dates' ? 'the same dates each month' : 'the monthly rota rule';
  if (pattern === 'custom') return `week ${schedule.activeCycleWeek || '1'} of a ${schedule.customCycle || '4'}-week cycle`;
  if (pattern === 'flexi') return 'flexi availability and cover limits';
  return 'the weekly rota';
}

function defaultPermissionsFor(systemRoles) {
  const isManager = systemRoles.includes('Manager');
  return {
    calendar: true,
    bookings: true,
    clients: isManager,
    services: isManager,
    payments: isManager,
    team: isManager,
    reports: isManager,
    settings: false,
  };
}

function defaultOpenShifts() {
  return [
    {
      id: 'open_fri_cover',
      day: 'Fri',
      start: '10:00',
      end: '18:00',
      role: 'Stylist cover',
      locationId: 'loc1',
      status: 'open',
      candidates: ['s5'],
    },
    {
      id: 'open_sat_barber',
      day: 'Sat',
      start: '11:00',
      end: '16:00',
      role: 'Barber cover',
      locationId: 'loc2',
      status: 'open',
      candidates: [],
    },
  ];
}

function ensureWeekly(weekly) {
  if (weekly?.length) return weekly;
  return emptyWeeklySchedule().map((day) => ({ ...day, enabled: false }));
}

function shiftFor(member, day) {
  return ensureWeekly(member.schedule?.weekly).find((shift) => shift.day === day) || {
    day,
    enabled: false,
    start: '09:00',
    end: '17:00',
  };
}

function membersWorkingOn(members, day) {
  return members.filter((member) =>
    shiftFor(member, day).enabled,
  );
}

function weekDays(offset = 0) {
  const start = new Date(2026, 4, 18 + offset * 7);
  return WEEK_DAYS.map((day, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      day,
      date: String(date.getDate()),
      month: MONTHS[date.getMonth()],
      key: dateKey(date),
    };
  });
}

function calendarPickerCells(week, offset = 0) {
  const first = week[0];
  const monthIndex = Math.max(0, MONTHS.indexOf(first?.month || 'May')) + offset;
  const monthStart = new Date(2026, monthIndex, 1);
  const start = new Date(monthStart);
  start.setDate(monthStart.getDate() - ((monthStart.getDay() + 6) % 7));
  return Array.from({ length: 35 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      index,
      day: WEEK_DAYS[(date.getDay() + 6) % 7],
      date: String(date.getDate()),
      month: MONTHS[date.getMonth()],
      year: String(date.getFullYear()),
      inMonth: date.getMonth() === monthStart.getMonth(),
      key: dateKey(date),
      dateValue: new Date(date),
    };
  });
}

function weekOffsetForDate(date) {
  const baseMonday = new Date(2026, 4, 18);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  target.setDate(target.getDate() - ((target.getDay() + 6) % 7));
  return Math.round((target - baseMonday) / (7 * 24 * 60 * 60 * 1000));
}

function weekSelectionCellClass(start, end) {
  if (start && end) return 'rounded-xl';
  if (start) return 'rounded-l-xl';
  if (end) return 'rounded-r-xl';
  return '';
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function weekRangeLabel(week) {
  const first = week[0];
  const last = week[week.length - 1];
  if (!first || !last) return 'This week';
  return `${first.date} ${first.month} - ${last.date} ${last.month}`;
}

function calendarRangeLabel(view, week, activeDay) {
  if (view === 'day') return `${activeDay.day} ${activeDay.date} ${activeDay.month}`;
  if (view === 'month') return activeDay.month;
  return weekRangeLabel(week);
}

function adjacentDay(day, direction) {
  const index = WEEK_DAYS.indexOf(day);
  if (index === -1) return WEEK_DAYS[0];
  return WEEK_DAYS[(index + direction + WEEK_DAYS.length) % WEEK_DAYS.length];
}

function timeSpanFor(members, day) {
  const shifts = members.map((member) => shiftFor(member, day)).filter((shift) => shift.enabled);
  if (shifts.length === 0) return null;
  const start = shifts.map((shift) => shift.start).sort()[0];
  const end = shifts.map((shift) => shift.end).sort().at(-1);
  return `${start} - ${end}`;
}

function timeToMinutes(value) {
  const [hours = 0, minutes = 0] = String(value || '00:00').split(':').map(Number);
  return hours * 60 + minutes;
}

function hoursForShift(shift) {
  const minutes = Math.max(0, timeToMinutes(shift.end) - timeToMinutes(shift.start));
  return Math.round((minutes / 60) * 10) / 10;
}

// Freelancers manage their own diaries, so they show read-only on the rota
// and don't count toward the business's staffing coverage.
function isFreelancerMember(member) {
  return member?.memberType === 'freelancer';
}

// Payout readiness comes from Stripe onboarding, not bank forms we host.
function stripeStatusLabel(bankStatus) {
  if (bankStatus === 'ready') return 'Stripe verified';
  if (bankStatus === 'verifying') return 'Stripe onboarding';
  return 'Stripe not set up';
}

// How many distinct weeks a schedule pattern cycles through.
function scheduleCycleLength(schedule) {
  const pattern = schedule?.pattern || 'weekly';
  if (pattern === 'biweekly') return 2;
  if (pattern === 'four_week') return 4;
  if (pattern === 'custom') return Number(schedule?.customCycle) || 4;
  return 1;
}

// Coverage per day — the system estimates demand from booking history
// (see src/data/coverage.js) and compares it with the scheduled headcount.
function dayStatus(day, members) {
  const scheduled = membersWorkingOn(members, day).filter((member) => !isFreelancerMember(member)).length;
  return coverageFor(day, scheduled);
}

function scheduleIssueQueue(members, openShifts, requests) {
  const requestItems = requests.map((request) => ({
    id: `request-${request.id}`,
    type: 'request',
    priority: request.status === 'pending' ? 'high' : 'medium',
    member: request.member,
    title: request.title,
    body: request.impact,
    meta: request.date,
    badge: request.status === 'pending' ? 'Approval' : 'Time off',
    icon: request.icon || CalendarDays,
    tone: request.tone || 'bg-gray-50 text-gray-700',
  }));

  const openItems = openShifts
    .filter((shift) => shift.status !== 'filled')
    .map((shift) => ({
      id: `open-${shift.id}`,
      type: 'open_shift',
      priority: 'high',
      shift,
      day: shift.day,
      title: shift.reason || 'Open shift',
      body: `${shift.role} · ${shift.start}-${shift.end}`,
      meta: `${shift.day} · ${shift.candidates?.length || 0} interested`,
      badge: 'Cover',
      icon: MapPin,
      tone: 'bg-amber-50 text-amber-700',
    }));

  const setupItems = members
    .filter((member) => member.status === 'pending' || member.status === 'needs_setup' || !hasWorkingHours(member))
    .map((member) => ({
      id: `setup-${member.id}`,
      type: 'setup',
      priority: member.status === 'pending' ? 'high' : 'medium',
      member,
      day: WEEK_DAYS.find((item) => !shiftFor(member, item).enabled) || 'Mon',
      title: member.status === 'pending' ? 'Invite still pending' : 'Schedule setup needed',
      body: member.status === 'pending'
        ? `${member.name} cannot be counted until their account is active.`
        : `${member.name} needs working hours before bookings are reliable.`,
      meta: member.rota?.nextShift || 'No rota set',
      badge: member.status === 'pending' ? 'Account' : 'Setup',
      icon: member.status === 'pending' ? Mail : Clock,
      tone: member.status === 'pending' ? 'bg-rose-50 text-rose-700' : 'bg-gray-50 text-gray-700',
    }));

  // Understaffing warnings compare the rostered headcount with the demand
  // estimate from booking history. Posted open shifts count as cover pending.
  const lowCoverageItems = WEEK_DAYS.flatMap((item) => {
    const coverage = dayStatus(item, members);
    if (coverage.state !== 'understaffed') return [];
    const open = openShifts.filter((shift) => shift.day === item && shift.status !== 'filled');
    if (coverage.scheduled + open.length >= coverage.needed) return [];
    return [{
      id: `coverage-${item}`,
      type: 'coverage',
      priority: 'high',
      day: item,
      title: `Understaffed ${item}`,
      body: `${coverage.summary}.`,
      meta: 'Estimated from your typical bookings',
      badge: 'Coverage',
      icon: AlertCircle,
      tone: 'bg-gray-50 text-gray-700',
    }];
  });

  return [...requestItems, ...openItems, ...setupItems, ...lowCoverageItems];
}

function setupIssues(members) {
  return members.flatMap((member) => {
    const issues = [];
    if (member.status === 'pending') {
      issues.push({
        key: 'invite',
        member,
        title: 'Invite pending',
        body: member.invite?.sentAt || 'Invite not accepted yet',
      });
    }
    if (!member.profile?.visibleOnProfile && member.bookable) {
      issues.push({
        key: 'profile',
        member,
        title: 'Profile hidden',
        body: 'Turn on their public booking profile',
      });
    }
    if (!hasWorkingHours(member)) {
      issues.push({
        key: 'schedule',
        member,
        title: 'No working hours',
        body: 'Add availability before they take bookings',
      });
    }
    if (member.payment?.payoutStatus && member.payment.payoutStatus !== 'Ready') {
      issues.push({
        key: 'pay',
        member,
        title: 'Pay setup needed',
        body: member.payment.payoutStatus,
      });
    }
    return issues;
  });
}

// Live staff requests (from context state) merged with approved time-off
// records. Pending requests carry approve/decline actions; approved time off
// shows as history so owners can see why someone is off the rota.
function buildRequestDisplays(requests, members) {
  const live = (requests || [])
    .filter((request) => request.status === 'pending' || request.status === 'peer_accepted')
    .map((request) => {
      const member = members.find((item) => item.id === request.memberId);
      const withMember = members.find((item) => item.id === request.withMemberId);
      if (!member) return null;
      const isSwap = request.type === 'swap';
      return {
        ...request,
        member,
        withMember,
        title: isSwap ? `Shift swap · ${request.dates}` : `${request.label} · ${request.dates}`,
        date: request.submitted,
        status: 'pending',
        actionable: true,
        impact: isSwap
          ? `${withMember?.name.split(' ')[0] || 'A colleague'} has agreed. ${request.note}`
          : request.note || `${member.name.split(' ')[0]} would be unavailable. Check coverage first.`,
        icon: isSwap ? Repeat : CalendarDays,
        tone: 'bg-gray-100 text-gray-900',
      };
    })
    .filter(Boolean);

  const timeOff = members.flatMap((member) =>
    (member.schedule?.timeOff || []).map((item) => ({
      id: `${member.id}-${item.id}`,
      type: 'time_off',
      member,
      title: item.label,
      date: item.date,
      status: 'approved',
      actionable: false,
      impact: `${member.name.split(' ')[0]} is unavailable. Check coverage before publishing this rota.`,
      icon: CalendarDays,
      tone: 'bg-gray-50 text-gray-700',
    })),
  );

  return [...live, ...timeOff];
}

function locationSummary(member) {
  if (!member.locations?.length) return 'All';
  const first = businessLocations.find((location) => location.id === member.locations[0]);
  if (member.locations.length === 1) return first?.name?.replace('Salon ', '') || '1 site';
  return `${member.locations.length} sites`;
}

function teamMetrics(members) {
  return {
    ready: members.filter(isReadyForBookings).length,
    pending: members.filter((member) => member.status === 'pending').length,
    needsSetup: members.filter((member) => !isReadyForBookings(member)).length,
    hours: members.reduce((sum, member) => sum + Number(member.rota?.thisWeekHours || 0), 0),
  };
}

function isReadyForBookings(member) {
  return isBookable(member) && member.status === 'active' && hasWorkingHours(member);
}

function hasWorkingHours(member) {
  return Boolean((member.schedule?.weekly || []).some((day) => day.enabled));
}

function matchesMemberStatusFilter(member, filter) {
  if (filter === 'active') return member.status === 'active';
  if (filter === 'setup') return member.status === 'needs_setup' || !hasWorkingHours(member);
  if (filter === 'pending') return member.status === 'pending';
  if (filter === 'bookable') return isReadyForBookings(member);
  return true;
}

function matchesMemberRoleFilter(member, filter) {
  if (filter === 'all') return true;
  return (member.systemRoles || []).includes(filter);
}

// Location filter — essential once a business runs more than one site.
function matchesMemberLocationFilter(member, filter) {
  if (filter === 'all') return true;
  return (member.locations || []).includes(filter);
}

function sortMembers(a, b, sort) {
  if (sort === 'role') {
    return String(a.role || '').localeCompare(String(b.role || '')) || a.name.localeCompare(b.name);
  }
  if (sort === 'status') {
    return statusLabel(a).localeCompare(statusLabel(b)) || a.name.localeCompare(b.name);
  }
  if (sort === 'hours') {
    return Number(b.rota?.thisWeekHours || 0) - Number(a.rota?.thisWeekHours || 0) || a.name.localeCompare(b.name);
  }
  return a.name.localeCompare(b.name);
}

function statusLabel(member) {
  if (member.status === 'pending') return 'Invited';
  if (member.status === 'needs_setup') return 'Setup';
  if (!member.active) return 'Inactive';
  return 'Active';
}

function memberNextShift(member) {
  if (member.rota?.nextShift) return member.rota.nextShift;
  const next = (member.schedule?.weekly || []).find((day) => day.enabled);
  return next ? `${next.day} ${next.start}` : 'No schedule';
}
