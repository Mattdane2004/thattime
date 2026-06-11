import { useState } from 'react';
import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';
import ScreenHeader from '../../components/ScreenHeader';
import Toggle from '../../components/Toggle';
import { businessLocations } from '../../data/business';
import { staff as fallbackTeamMembers } from '../../data/staff';
import {
  ScheduleFrequencyEditor,
  ServicesSelector,
  WeeklyScheduleEditor,
} from '../Team';
import PaySetupFlow from './PaySetupFlow';

// The guided "let's get them ready" flow shown right after quick-add.
// One focused screen per setup item with a plain explanation of what it is
// and why it matters. Every step can be skipped — skipped items stay on the
// profile checklist, and the member can't take bookings until the required
// ones (services, schedule, location) are done.

const STEP_META = {
  services: {
    title: () => 'Select services',
    body: (name) => `What clients can book ${name} for.`,
    required: true,
  },
  schedule: {
    title: () => 'Working hours',
    body: (name) => `When clients can book ${name}.`,
    required: true,
  },
  location: {
    title: () => 'Locations',
    body: (name) => `Where ${name} works, and how.`,
    required: true,
  },
  pay: {
    title: () => 'Set up pay',
    body: () => 'Optional — wages and commission calculate automatically.',
    required: false,
  },
};

export default function GuidedSetup() {
  const navigate = useNavigate();
  const { memberId } = useParams();
  const [searchParams] = useSearchParams();
  const { teamMembers = fallbackTeamMembers, updateTeamMember } = useOutletContext();
  const member = teamMembers.find((item) => item.id === memberId);

  const steps = member
    ? [
        ...(member.bookable ? ['services'] : []),
        'schedule',
        'location',
        'pay',
      ]
    : [];
  const requestedStep = searchParams.get('step');
  const [stepIndex, setStepIndex] = useState(() => {
    const index = steps.indexOf(requestedStep);
    return index >= 0 ? index : 0;
  });
  const [done, setDone] = useState(false);

  if (!member) {
    return (
      <>
        <ScreenHeader title="Team setup" onBack={() => navigate('/team')} border />
        <div className="flex-1 bg-white px-5 pt-8 text-[14px] text-gray-500">Team member not found.</div>
      </>
    );
  }

  const firstName = member.name.split(' ')[0];
  const stepKey = steps[Math.min(stepIndex, steps.length - 1)];
  const meta = STEP_META[stepKey];
  const setup = member.setup || {};

  const patch = (next) => updateTeamMember?.(member.id, next);
  const setSetupFlags = (flags) =>
    updateTeamMember?.(member.id, (current) => {
      const nextSetup = { ...(current.setup || {}), ...flags };
      const needsServices = current.memberType !== 'freelancer' && Boolean(current.bookable);
      const complete = nextSetup.schedule && nextSetup.location && (!needsServices || nextSetup.services);
      return {
        setup: nextSetup,
        ...(current.status === 'needs_setup' && complete ? { status: 'active', active: true } : {}),
      };
    });

  const advance = () => {
    if (stepIndex < steps.length - 1) setStepIndex(stepIndex + 1);
    else setDone(true);
  };

  const exitToProfile = () => navigate(`/team/${member.id}`, { replace: true });

  if (done) {
    const remaining = [
      member.bookable && !setup.services && 'services',
      !setup.schedule && !setup.delegatedSchedule && 'schedule',
      !setup.location && 'location',
    ].filter(Boolean);
    return (
      <>
        <ScreenHeader title="Team setup" onBack={exitToProfile} border />
        <div className="flex-1 overflow-y-auto bg-white px-5 pt-10 pb-8">
          <div className="rounded-3xl border border-gray-200 p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center text-white">
              <Check size={22} strokeWidth={2.2} />
            </div>
            <div className="mt-5 text-[22px] font-semibold tracking-tight text-gray-950">
              {remaining.length === 0 ? `${firstName} is ready for bookings` : 'Almost there'}
            </div>
            <div className="mt-2 text-[14px] text-gray-500 leading-snug">
              {remaining.length === 0
                ? 'Their invite is on its way. Everything else can be tweaked from their profile.'
                : `You skipped ${remaining.join(' and ')} — ${firstName} can't take bookings until ${remaining.length === 1 ? "it's" : "they're"} done. The checklist on their profile will keep track.`}
            </div>
            <button
              onClick={exitToProfile}
              className="mt-6 w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
            >
              Go to {firstName}'s profile
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ScreenHeader title={`Set up ${firstName}`} onBack={exitToProfile} border />
      <div className="flex-1 overflow-y-auto bg-white px-5 pt-6 pb-36">
        <div className="flex items-center gap-1.5 mb-5">
          {steps.map((key, index) => (
            <div
              key={key}
              className={'h-1.5 flex-1 rounded-full ' + (index <= stepIndex ? 'bg-gray-900' : 'bg-gray-100')}
            />
          ))}
        </div>

        <div className="text-[20px] font-semibold tracking-tight text-gray-950">{meta.title(firstName)}</div>
        <div className="text-[13px] text-gray-500 mt-1 leading-snug">{meta.body(firstName)}</div>

        <div className="mt-5">
          {stepKey === 'services' && (
            <ServicesSelector
              selectedServices={member.services || []}
              onChange={(services) => {
                patch({ services });
                setSetupFlags({ services: services.length > 0 });
              }}
            />
          )}

          {stepKey === 'schedule' && (
            <ScheduleStep member={member} firstName={firstName} patch={patch} setSetupFlags={setSetupFlags} onDelegate={advance} />
          )}

          {stepKey === 'location' && (
            <LocationStep member={member} patch={patch} setSetupFlags={setSetupFlags} />
          )}

          {stepKey === 'pay' && (
            <PaySetupFlow
              memberName={member.name}
              onComplete={(payment) => {
                updateTeamMember?.(member.id, (current) => ({
                  payment: { ...(current.payment || {}), ...payment },
                }));
                setSetupFlags({ pay: true });
                advance();
              }}
              onCancel={advance}
            />
          )}
        </div>
      </div>

      {stepKey !== 'pay' && (
        <div className="absolute left-0 right-0 bottom-0 px-5 pb-5 pt-3 bg-white border-t border-gray-100">
          <div className="flex gap-2">
            <button
              onClick={advance}
              className="h-12 px-5 rounded-full text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={advance}
              className="flex-1 h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
            >
              Continue
            </button>
          </div>
          {meta.required && (
            <div className="mt-2 text-center text-[11px] text-gray-400">
              Needed before {firstName} can take bookings — skipping keeps it on the checklist.
            </div>
          )}
        </div>
      )}
    </>
  );
}

function ScheduleStep({ member, firstName, patch, setSetupFlags, onDelegate }) {
  const schedule = member.schedule || {};
  const hasHours = (schedule.weekly || []).some((day) => day.enabled);

  return (
    <div className="space-y-5">
      {!hasHours && (
        <button
          onClick={() => {
            setSetupFlags({ delegatedSchedule: true });
            onDelegate();
          }}
          className="w-full rounded-2xl border border-gray-200 p-4 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
        >
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-gray-950">Let {firstName} set their own hours</div>
            <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">
              We'll ask them when they accept their invite — you approve it.
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-300 shrink-0" strokeWidth={2} />
        </button>
      )}
      <ScheduleFrequencyEditor
        schedule={schedule}
        onChange={(next) => patch({ schedule: { ...schedule, ...next } })}
      />
      <WeeklyScheduleEditor
        schedule={schedule}
        onChange={(next) => {
          patch({ schedule: next });
          setSetupFlags({ schedule: next.weekly?.some((day) => day.enabled) || false });
        }}
      />
    </div>
  );
}

function LocationStep({ member, patch, setSetupFlags }) {
  const prefs = member.locationPrefs || {};
  const selected = member.locations || [];
  const primary = prefs.primaryLocationId || selected[0];
  const mobile = Boolean(prefs.mobile);
  const remote = Boolean(prefs.remote);

  const apply = (nextSelected, nextPrimary, nextMobile, nextRemote) => {
    const safePrimary = nextSelected.includes(nextPrimary) ? nextPrimary : nextSelected[0];
    patch({
      locations: nextSelected,
      locationPrefs: {
        ...prefs,
        primaryLocationId: safePrimary,
        allowedLocationIds: nextSelected,
        mobile: nextMobile,
        remote: nextRemote,
      },
    });
    setSetupFlags({ location: nextSelected.length > 0 || nextMobile || nextRemote });
  };

  const toggleLocation = (id) => {
    const next = selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id];
    apply(next, primary, mobile, remote);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2.5">
        {businessLocations.map((location) => {
          const active = selected.includes(location.id);
          const isPrimary = active && primary === location.id;
          return (
            <div
              key={location.id}
              className={
                'w-full rounded-2xl border p-4 transition-colors ' +
                (active ? 'border-gray-900 bg-gray-50' : 'border-gray-200')
              }
            >
              <button onClick={() => toggleLocation(location.id)} className="w-full flex items-center gap-3 text-left">
                <span
                  className={
                    'w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center ' +
                    (active ? 'border-gray-900 bg-gray-900' : 'border-gray-300')
                  }
                >
                  {active && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5.5L4 8L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] font-semibold text-gray-950">{location.name}</span>
                  <span className="block text-[12px] text-gray-500 mt-0.5">{location.address}</span>
                </span>
                {isPrimary && (
                  <span className="shrink-0 rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-medium text-white">
                    Primary
                  </span>
                )}
              </button>
              {active && !isPrimary && selected.length > 1 && (
                <button
                  onClick={() => apply(selected, location.id, mobile, remote)}
                  className="mt-2 ml-8 text-[12px] font-medium text-gray-900 underline underline-offset-2"
                >
                  Make primary
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-y border-gray-100 py-4 space-y-4">
        <ToggleRow
          label="Mobile — travels to clients"
          description="They can be booked for visits to the client's address."
          checked={mobile}
          onChange={(value) => apply(selected, primary, value, remote)}
        />
        <ToggleRow
          label="Virtual — online services"
          description="They can be booked for video consultations and online sessions."
          checked={remote}
          onChange={(value) => apply(selected, primary, mobile, value)}
        />
      </div>
      <div className="text-[12px] text-gray-500 leading-snug">
        Their primary location is where their shifts and bookings show by default.
      </div>
    </div>
  );
}

function ToggleRow({ label, description, checked, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-gray-900">{label}</div>
        <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">{description}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}
