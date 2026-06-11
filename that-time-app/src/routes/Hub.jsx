import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowLeftRight } from 'lucide-react';
import HubCard from '../components/HubCard';
import HubListCard from '../components/HubListCard';
import HubFeatureCard from '../components/HubFeatureCard';
import HubSetupCard from '../components/HubSetupCard';
import PersonalProfileCard from '../components/PersonalProfileCard';
import { useMainActions } from '../components/sheets/MainActionsContext';
import {
  operationsItems,
  setupItems,
  accountItems,
  marketingEntry,
} from '../data/hubMenu';

function withLayout(items) {
  // Trailing odd item spans both columns.
  return items.map((item, i) => {
    const isLast = i === items.length - 1;
    const isOdd = items.length % 2 === 1;
    return { ...item, full: isLast && isOdd };
  });
}

function BusinessTab({ role = 'owner' }) {
  // Staff see day-to-day operations only — no business setup, no marketing.
  const isOwner = role === 'owner';
  const staffOperations = operationsItems.filter((item) =>
    ['calendar', 'clients', 'sales', 'messages', 'schedule', 'bookings'].some((k) =>
      `${item.key || ''} ${item.label || ''}`.toLowerCase().includes(k),
    ),
  );
  const operationsLaid = withLayout(isOwner ? operationsItems : staffOperations);

  return (
    <div className="space-y-6">
      {isOwner && <HubSetupCard />}

      <div>
        <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
          {isOwner ? 'Operations' : 'Your day-to-day'}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {operationsLaid.map(({ key, ...rest }) => (
            <HubCard key={key} {...rest} />
          ))}
        </div>
      </div>

      {isOwner && (
        <HubFeatureCard
          icon={marketingEntry.icon}
          label={marketingEntry.label}
          desc={marketingEntry.desc}
          to={marketingEntry.to}
        />
      )}

      {isOwner && <HubListCard title="Business setup" items={setupItems} />}
    </div>
  );
}

function ProfileTab() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PersonalProfileCard />
      <HubListCard title="Account" items={accountItems} />
      <button
        onClick={() => navigate('/soon/logout')}
        className="w-full h-12 rounded-full bg-white border border-gray-100 text-[14px] font-medium text-red-500 hover:bg-gray-50 transition-colors"
      >
        Log out
      </button>
    </div>
  );
}

export default function Hub() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('business');
  const role = useMainActions()?.role ?? 'owner';

  return (
    <>
      {/* Header — title + tabs. Sits above the scroll area so it stays in view. */}
      <div className="shrink-0 bg-gray-50">
        <div className="flex items-center px-4 h-14">
          <button
            onClick={() => navigate('/')}
            className="-ml-2 w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100"
            aria-label="Back to home"
          >
            <ChevronLeft size={22} />
          </button>
          <div className="flex-1 ml-1 text-[17px] font-semibold text-gray-900">Hub</div>
        </div>
        <div className="px-4 pb-3">
          <div className="bg-white border border-gray-100 rounded-full p-1 flex">
            {[
              { k: 'business', label: 'Business' },
              { k: 'profile', label: 'Profile' },
            ].map((t) => (
              <button
                key={t.k}
                onClick={() => setTab(t.k)}
                className={
                  'flex-1 py-2 rounded-full text-[14px] font-medium transition-colors ' +
                  (tab === t.k ? 'bg-gray-900 text-white' : 'text-gray-600')
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 pt-2 pb-8">
        {/* Mode switch — visible on both tabs */}
        <button
          onClick={() => navigate('/b2c')}
          className="w-full flex items-center gap-3 bg-gray-900 text-white rounded-2xl px-4 py-3.5 mb-6 hover:bg-gray-800 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <ArrowLeftRight size={18} strokeWidth={2} />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-[15px] font-semibold">Switch to client view</div>
            <div className="text-[12px] text-white/60 mt-0.5">See the B2C app clients use to book</div>
          </div>
          <div className="text-[11px] font-semibold uppercase tracking-widest bg-white/10 rounded-full px-2 py-1 shrink-0">
            B2C
          </div>
        </button>

        {tab === 'business' ? <BusinessTab role={role} /> : <ProfileTab />}
      </div>
    </>
  );
}
