import { createElement } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { BadgePercent, Check, CreditCard, Repeat } from 'lucide-react';
import ScreenHeader from '../../components/ScreenHeader';
import HelpTrigger from '../../components/HelpTrigger';
import WizardFooter from '../../components/WizardFooter';
import { emptySubscriptionDetails, wizardTotalFor } from '../../data/offerTypes';

const TYPES = [
  {
    key: 'frequency',
    label: 'Service frequency',
    desc: 'Clients pay a fixed fee and redeem services on a set or unlimited frequency.',
    Icon: Repeat,
  },
  {
    key: 'credit',
    label: 'Store credit',
    desc: 'Clients receive monthly credit to spend on services or products.',
    Icon: CreditCard,
  },
  {
    key: 'membership',
    label: 'Membership benefits',
    desc: 'Clients pay for discounts, member access, and perks.',
    Icon: BadgePercent,
  },
];

export default function SubscriptionType() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useOutletContext();
  const details = draft.subscriptionDetails || emptySubscriptionDetails();

  const choose = (subscriptionType) => {
    const defaultsByType = {
      frequency: { benefitType: 'sessions', includedSessions: details.includedSessions || 1 },
      credit: { benefitType: 'credit' },
      membership: { benefitType: 'discount' },
    };
    updateDraft({
      subscriptionDetails: {
        ...details,
        subscriptionType,
        ...defaultsByType[subscriptionType],
      },
    });
  };

  return (
    <>
      <ScreenHeader title="" onBack={() => navigate('/new')} rightAction={<HelpTrigger helpKey="subscriptionType" />} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pt-2 pb-6">
          <div className="text-[26px] leading-tight font-semibold tracking-tight">Subscription type</div>
          <div className="text-[14px] text-gray-500 mt-1">
            Choose the membership model. You can refine limits and rules after setup.
          </div>
        </div>

        <div className="space-y-2 pb-6">
          {TYPES.map(({ key, label, desc, Icon }) => {
            const active = (details.subscriptionType || 'frequency') === key;
            return (
              <button
                key={key}
                onClick={() => choose(key)}
                className={
                  'w-full flex items-center gap-4 rounded-2xl p-4 text-left transition-colors ' +
                  (active ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900 hover:bg-gray-100')
                }
              >
                <div className={'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ' + (active ? 'bg-white/10' : 'bg-white')}>
                  {createElement(Icon, { size: 18, strokeWidth: 1.75 })}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] font-medium">{label}</div>
                  <div className={'text-[12px] mt-0.5 leading-snug ' + (active ? 'text-white/70' : 'text-gray-500')}>
                    {desc}
                  </div>
                </div>
                {active && <Check size={17} strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      </div>
      <WizardFooter
        step={1}
        total={wizardTotalFor(draft.type)}
        onBack={() => navigate('/new')}
        onNext={() => navigate('/new/basics')}
      />
    </>
  );
}
