import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const firstNameOf = (name = '') => name.trim().split(' ')[0] || 'them';

// Profile setup checklist for members created through the quick-add flow
// (member.setup exists). Tracks what the guided setup hasn't covered yet:
// services, schedule, and location are required before bookings; pay is
// optional. "Continue setup" re-enters the guided flow.
export default function SetupChecklist({ member, onOpenTab, onPatch, setupHref }) {
  const setup = member.setup;
  if (!setup) return null;

  const isFreelancer = member.memberType === 'freelancer';
  const firstName = firstNameOf(member.name);

  const items = [
    // Services only count for bookable employees — freelancers manage their own.
    ...(!isFreelancer && member.bookable
      ? [{ key: 'services', label: 'Services', tab: 'workspaces', done: Boolean(setup.services), required: true }]
      : []),
    {
      key: 'schedule',
      label: 'Schedule',
      tab: 'schedule',
      done: Boolean(setup.schedule),
      delegated: Boolean(setup.delegatedSchedule),
      required: true,
      askable: true,
    },
    ...(!isFreelancer
      ? [{ key: 'location', label: 'Location', tab: 'locations', done: Boolean(setup.location), required: true }]
      : []),
    {
      key: 'pay',
      label: isFreelancer ? 'Rent & commission' : 'Pay',
      tab: 'pay',
      done: Boolean(setup.pay),
      required: false,
    },
  ];

  // Delegated items stay visible ("Asked Leo") — the member still can't take
  // bookings until they're actually done.
  const open = items.filter((item) => !item.done);
  if (open.length === 0) return null;
  const requiredLeft = open.filter((item) => item.required).length;
  const onlyWaiting = open.every((item) => item.delegated);

  const askSchedule = () =>
    onPatch?.((current) => ({ setup: { ...(current.setup || {}), delegatedSchedule: true } }));

  return (
    <section className="rounded-3xl border border-gray-200 p-5">
      <div className="text-[17px] font-semibold tracking-tight text-gray-950">Finish setting up</div>
      <div className="text-[13px] text-gray-500 mt-1 leading-snug">
        {onlyWaiting
          ? `Waiting on ${firstName} — they've been asked to finish the rest.`
          : requiredLeft > 0
            ? `${firstName} can't take bookings until the required bits are done.`
            : `Just the optional bits left — ${firstName} is ready for bookings.`}
      </div>

      <div className="mt-4 divide-y divide-gray-100 border-t border-gray-100">
        {items.map((item) => (
          <div key={item.key}>
            <button
              onClick={() => onOpenTab?.(item.tab)}
              className="w-full py-3.5 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
            >
              <span
                className={
                  'w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ' +
                  (item.done ? 'border-gray-900 bg-gray-900' : 'border-gray-300')
                }
              >
                {item.done && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5.5L4 8L8.5 2.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-[14px] font-medium text-gray-900">{item.label}</span>
                {!item.required && <span className="ml-2 text-[11px] font-medium text-gray-400">Optional</span>}
              </div>
              <ItemStatus item={item} firstName={firstName} />
              <ChevronRight size={16} className="text-gray-300 shrink-0" strokeWidth={2} />
            </button>
            {item.askable && !item.done && !item.delegated && (
              <button
                onClick={askSchedule}
                className="mb-3 -mt-1 ml-8 text-[13px] font-medium text-gray-900 underline underline-offset-2"
              >
                Ask {firstName} to do this
              </button>
            )}
          </div>
        ))}

        <button
          onClick={() => onOpenTab?.('pay')}
          className="w-full py-3.5 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
        >
          <span className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-medium text-gray-900">Stripe payouts</div>
            <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">
              They connect their own bank through Stripe
            </div>
          </div>
          <span className="text-[12px] font-medium text-gray-500 shrink-0">Waiting on {firstName}</span>
        </button>
      </div>

      {setupHref && (
        <Link
          to={setupHref}
          className="mt-4 w-full h-11 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[14px] font-medium transition-colors flex items-center justify-center"
        >
          Continue setup
        </Link>
      )}
    </section>
  );
}

function ItemStatus({ item, firstName }) {
  if (item.done) {
    return <span className="text-[12px] font-semibold text-gray-900 shrink-0">Done</span>;
  }
  if (item.delegated) {
    return <span className="text-[12px] font-medium text-gray-500 shrink-0">Asked {firstName}</span>;
  }
  return <span className="text-[12px] font-medium text-gray-500 shrink-0">To do</span>;
}
