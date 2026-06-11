import { useState } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { ArrowDownToLine, CalendarDays, ChevronRight, Plus, Repeat, Store, Users } from 'lucide-react';
import BottomSheet from '../../components/BottomSheet';
import ProductSelect from '../../components/ProductSelect';
import ScreenHeader from '../../components/ScreenHeader';
import TextField from '../../components/TextField';
import Toggle from '../../components/Toggle';
import { staff as fallbackTeamMembers, initialsFor } from '../../data/staff';

// The staff side of the app — what a team member (or freelancer) sees.
// Owners preview it via "viewing as"; in production this would be the
// member's own logged-in home. Requests submitted here land in the owner's
// Team → Schedule for approval, completing the loop.

const WEEK = [
  { day: 'Mon', date: '18 May' },
  { day: 'Tue', date: '19 May' },
  { day: 'Wed', date: '20 May' },
  { day: 'Thu', date: '21 May' },
  { day: 'Fri', date: '22 May' },
  { day: 'Sat', date: '23 May' },
  { day: 'Sun', date: '24 May' },
];

const TABS = [
  { key: 'schedule', label: 'My schedule' },
  { key: 'requests', label: 'Requests' },
  { key: 'profile', label: 'Profile' },
];

export default function StaffView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    teamMembers = fallbackTeamMembers,
    updateTeamMember,
    teamRequests = [],
    addTeamRequest,
  } = useOutletContext();

  const memberOptions = teamMembers
    .filter((item) => item.status !== 'pending')
    .map((item) => ({ value: item.id, label: item.name }));
  const [memberId, setMemberId] = useState(
    searchParams.get('member') || memberOptions[0]?.value || teamMembers[0]?.id,
  );
  const member = teamMembers.find((item) => item.id === memberId) || teamMembers[0];
  const [tab, setTab] = useState('schedule');
  const [composer, setComposer] = useState(null); // 'time_off' | 'swap'

  const isFreelancer = member?.memberType === 'freelancer';
  const myRequests = teamRequests.filter((request) => request.memberId === member?.id);
  const firstName = member?.name?.split(' ')[0] || 'You';

  if (!member) return null;

  return (
    <>
      <ScreenHeader title="My space" onBack={() => navigate('/team')} border />
      <div className="flex-1 overflow-y-auto bg-white px-5 pt-5 pb-10">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Avatar member={member} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] text-gray-500">Viewing as</div>
              <ProductSelect
                value={member.id}
                onChange={setMemberId}
                options={memberOptions}
                compact
                buttonClassName="h-9 border-0 bg-transparent px-0 text-[18px] font-semibold"
                menuClassName="left-0 w-56"
              />
            </div>
            {isFreelancer && (
              <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-700">
                Freelancer
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1 rounded-full bg-gray-50 p-1">
            {TABS.map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={
                  'h-10 rounded-full text-[13px] font-semibold transition-colors ' +
                  (tab === item.key ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500')
                }
              >
                {item.label}
              </button>
            ))}
          </div>

          {tab === 'schedule' && (
            <MySchedule
              member={member}
              isFreelancer={isFreelancer}
              onRequestTimeOff={() => setComposer('time_off')}
              onRequestSwap={() => setComposer('swap')}
            />
          )}
          {tab === 'requests' && (
            <MyRequests
              requests={myRequests}
              members={teamMembers}
              onRequestTimeOff={() => setComposer('time_off')}
              onRequestSwap={() => setComposer('swap')}
            />
          )}
          {tab === 'profile' && (
            <MyProfile member={member} isFreelancer={isFreelancer} onPatch={(patch) => updateTeamMember?.(member.id, patch)} />
          )}

          <button
            onClick={() => navigate('/wallet')}
            className="w-full rounded-3xl bg-gray-950 text-white p-5 text-left flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <ArrowDownToLine size={17} strokeWidth={1.9} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-semibold">My earnings</div>
              <div className="text-[12px] text-white/60 mt-0.5">
                {isFreelancer ? 'Splits land as bookings are paid' : 'Balance, payslips, and payouts'}
              </div>
            </div>
            <ChevronRight size={16} className="text-white/40" strokeWidth={2} />
          </button>
        </div>
      </div>

      <RequestComposer
        type={composer}
        member={member}
        colleagues={teamMembers.filter((item) => item.id !== member.id && item.bookable && item.memberType !== 'freelancer')}
        onClose={() => setComposer(null)}
        onSubmit={(request) => {
          addTeamRequest?.({ ...request, memberId: member.id, submitted: 'Just now' });
          setComposer(null);
          setTab('requests');
        }}
      />
    </>
  );
}

function MySchedule({ member, isFreelancer, onRequestTimeOff, onRequestSwap }) {
  const weekly = member.schedule?.weekly || [];
  const shifts = WEEK.map((item) => ({
    ...item,
    shift: weekly.find((day) => day.day === item.day) || { enabled: false },
  }));
  const next = shifts.find((item) => item.shift.enabled);

  if (isFreelancer) {
    return (
      <div className="space-y-5">
        <div className="rounded-3xl border border-gray-200 p-5">
          <div className="text-[15px] font-semibold text-gray-900">You run your own diary</div>
          <div className="text-[13px] text-gray-500 mt-1 leading-snug">
            Bookings, availability, and days off live in your own calendar. The shop only sees your typical in-shop times.
          </div>
        </div>
        <Section title="Typical in-shop times">
          <WeekList shifts={shifts} />
        </Section>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-gray-950 text-white p-5">
        <div className="text-[12px] uppercase tracking-[0.12em] text-white/60">Next shift</div>
        <div className="text-[24px] font-semibold tracking-tight mt-2">
          {next ? `${next.day} ${next.date} · ${next.shift.start}` : 'No shifts this week'}
        </div>
        {next && <div className="text-[13px] text-white/65 mt-1">{next.shift.start}-{next.shift.end}</div>}
      </div>

      <Section title="This week">
        <WeekList shifts={shifts} />
      </Section>

      <Section title="Time off">
        <div className="divide-y divide-gray-100 border-y border-gray-100">
          {(member.schedule?.timeOff || []).length ? (
            member.schedule.timeOff.map((item) => (
              <div key={item.id} className="py-3">
                <div className="text-[14px] font-medium text-gray-900">{item.label}</div>
                <div className="text-[12px] text-gray-500 mt-0.5">{item.date}</div>
              </div>
            ))
          ) : (
            <div className="py-4 text-[13px] text-gray-500">No time off booked.</div>
          )}
        </div>
      </Section>

      <div className="flex gap-2">
        <button
          onClick={onRequestTimeOff}
          className="flex-1 h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[14px] font-medium transition-colors"
        >
          Request time off
        </button>
        <button
          onClick={onRequestSwap}
          className="flex-1 h-12 rounded-full border border-gray-200 text-[14px] font-medium text-gray-900 hover:bg-gray-50 transition-colors"
        >
          Swap a shift
        </button>
      </div>
    </div>
  );
}

function WeekList({ shifts }) {
  return (
    <div className="divide-y divide-gray-100 border-y border-gray-100">
      {shifts.map((item) => (
        <div key={item.day} className={'py-3 flex items-center gap-3 ' + (!item.shift.enabled ? 'opacity-45' : '')}>
          <div className="w-12 text-[13px] font-semibold text-gray-700">{item.day}</div>
          <div className="flex-1 text-[13px] text-gray-500">{item.date}</div>
          <div className="text-[13px] font-medium text-gray-900">
            {item.shift.enabled ? `${item.shift.start}-${item.shift.end}` : 'Off'}
          </div>
        </div>
      ))}
    </div>
  );
}

function MyRequests({ requests, members, onRequestTimeOff, onRequestSwap }) {
  return (
    <div className="space-y-5">
      <Section title="Your requests">
        <div className="divide-y divide-gray-100 border-y border-gray-100">
          {requests.length === 0 ? (
            <div className="py-4 text-[13px] text-gray-500">Nothing requested yet.</div>
          ) : (
            requests.map((request) => {
              const withMember = members.find((item) => item.id === request.withMemberId);
              return (
                <div key={request.id} className="py-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-700 shrink-0">
                    {request.type === 'swap' ? <Repeat size={16} strokeWidth={1.9} /> : <CalendarDays size={16} strokeWidth={1.9} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-gray-900 truncate">
                      {request.label} · {request.dates}
                    </div>
                    <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">
                      {request.type === 'swap' && withMember ? `With ${withMember.name} · ` : ''}
                      {request.submitted}
                    </div>
                  </div>
                  <RequestStatusPill status={request.status} />
                </div>
              );
            })
          )}
        </div>
      </Section>

      <div className="flex gap-2">
        <button
          onClick={onRequestTimeOff}
          className="flex-1 h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[14px] font-medium transition-colors"
        >
          Request time off
        </button>
        <button
          onClick={onRequestSwap}
          className="flex-1 h-12 rounded-full border border-gray-200 text-[14px] font-medium text-gray-900 hover:bg-gray-50 transition-colors"
        >
          Swap a shift
        </button>
      </div>
    </div>
  );
}

function RequestStatusPill({ status }) {
  const label =
    status === 'approved' ? 'Approved'
    : status === 'declined' ? 'Declined'
    : status === 'peer_accepted' ? 'With your manager'
    : 'Pending';
  const tone = status === 'approved' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600';
  return <span className={'shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ' + tone}>{label}</span>;
}

function MyProfile({ member, isFreelancer, onPatch }) {
  const profile = member.profile || {};
  const freelance = member.freelance || {};
  const updateProfile = (patch) => onPatch({ profile: { ...profile, ...patch } });

  return (
    <div className="space-y-5">
      <Section title={isFreelancer ? 'Your business' : 'Public profile'}>
        <div className="space-y-4">
          {isFreelancer && (
            <TextField
              label="Business name"
              value={freelance.businessName || ''}
              onChange={(businessName) => onPatch({ freelance: { ...freelance, businessName } })}
              placeholder={member.name}
            />
          )}
          <TextField
            label="Public name"
            value={profile.publicName || ''}
            onChange={(publicName) => updateProfile({ publicName })}
            placeholder={member.name}
          />
          <TextField
            label="Bio"
            value={profile.bio || ''}
            onChange={(bio) => updateProfile({ bio })}
            multiline
            rows={3}
            placeholder="Short intro shown on the booking profile"
          />
          <div className="flex items-center gap-3 border-y border-gray-100 py-4">
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium text-gray-900">Show me on the shop's public page</div>
              <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">
                {isFreelancer ? 'You appear under your own name.' : 'Clients can pick you when booking.'}
              </div>
            </div>
            <Toggle
              checked={Boolean(profile.visibleOnProfile || profile.publicWhenOnboarded)}
              onChange={(visible) => updateProfile({ visibleOnProfile: visible, publicWhenOnboarded: visible })}
            />
          </div>
        </div>
      </Section>

      {isFreelancer && (
        <Section title="Your setup">
          <div className="divide-y divide-gray-100 border-y border-gray-100">
            <MiniRow
              Icon={Store}
              title="Your services"
              body={`${(member.services || []).length || 'No'} services · your own menu and prices`}
            />
            <MiniRow Icon={Users} title="Your clients" body="Your client list stays yours" />
            <MiniRow
              Icon={CalendarDays}
              title="Rent"
              body={
                freelance.rentEnabled
                  ? `£${freelance.rentAmount}/${freelance.rentFrequency === 'weekly' ? 'wk' : 'mo'} · auto-collected via Stripe${freelance.commissionEnabled ? ` · ${freelance.commissionPercent}% commission` : ''}`
                  : freelance.commissionEnabled
                    ? `${freelance.commissionPercent}% commission on sales`
                    : 'No rent agreement yet'
              }
            />
          </div>
        </Section>
      )}
    </div>
  );
}

function MiniRow({ Icon, title, body }) {
  return (
    <div className="py-3.5 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-700 shrink-0">
        <Icon size={16} strokeWidth={1.9} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-gray-900">{title}</div>
        <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">{body}</div>
      </div>
    </div>
  );
}

// Composer for time off and shift swap requests. Swaps name the colleague
// who'll cover — they agree first, then the owner approves.
function RequestComposer({ type, member, colleagues, onClose, onSubmit }) {
  const [label, setLabel] = useState('');
  const [dates, setDates] = useState('');
  const [day, setDay] = useState('Fri');
  const [withMemberId, setWithMemberId] = useState(colleagues[0]?.id || '');
  const [note, setNote] = useState('');
  const isSwap = type === 'swap';

  const reset = () => {
    setLabel('');
    setDates('');
    setNote('');
  };

  const canSubmit = isSwap ? Boolean(withMemberId && day) : Boolean(label.trim() && dates.trim());

  const submit = () => {
    if (!canSubmit) return;
    onSubmit(
      isSwap
        ? {
            type: 'swap',
            label: 'Shift swap',
            dates: `${day} ${WEEK.find((item) => item.day === day)?.date || ''}`.trim(),
            day,
            withMemberId,
            note: note.trim() || 'Swap agreed between colleagues.',
            status: 'peer_accepted',
          }
        : {
            type: 'time_off',
            label: label.trim(),
            dates: dates.trim(),
            day: WEEK.find((item) => dates.includes(item.day))?.day || null,
            note: note.trim(),
            status: 'pending',
          },
    );
    reset();
  };

  return (
    <BottomSheet open={Boolean(type)} onClose={onClose} title={isSwap ? 'Swap a shift' : 'Request time off'}>
      <div className="space-y-4">
        {isSwap ? (
          <>
            <ProductSelect
              label="Which day?"
              value={day}
              onChange={setDay}
              options={WEEK.map((item) => ({ value: item.day, label: `${item.day} ${item.date}` }))}
            />
            <ProductSelect
              label="Who covers it?"
              value={withMemberId}
              onChange={setWithMemberId}
              options={colleagues.map((item) => ({ value: item.id, label: item.name, desc: item.role }))}
            />
            <div className="text-[12px] text-gray-500 leading-snug">
              They'll be asked to agree first. Your manager gets the final say.
            </div>
          </>
        ) : (
          <>
            <TextField label="Reason" value={label} onChange={setLabel} placeholder="e.g. Holiday, appointment" />
            <TextField label="When" value={dates} onChange={setDates} placeholder="e.g. Fri 29 May, or 1-5 Jun" />
          </>
        )}
        <TextField label="Note (optional)" value={note} onChange={setNote} placeholder="Anything your manager should know" />
        <button
          onClick={submit}
          disabled={!canSubmit}
          className={
            'w-full h-12 rounded-full text-[15px] font-medium transition-colors ' +
            (canSubmit ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-gray-100 text-gray-400')
          }
        >
          {isSwap ? 'Send swap request' : 'Send request'}
        </button>
      </div>
    </BottomSheet>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <div className="text-[17px] font-semibold tracking-tight text-gray-950 mb-3">{title}</div>
      {children}
    </section>
  );
}

function Avatar({ member }) {
  return (
    <div
      className={
        'w-11 h-11 rounded-full flex items-center justify-center text-[14px] font-semibold shrink-0 ' +
        (member.avatarColor || 'bg-gray-100 text-gray-700')
      }
    >
      {initialsFor(member.name)}
    </div>
  );
}
