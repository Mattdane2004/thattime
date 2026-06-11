import { createElement } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Check, CreditCard, LockKeyhole, Scissors, TicketPercent } from 'lucide-react';
import ScreenHeader from '../../../components/ScreenHeader';
import TextField from '../../../components/TextField';
import Toggle from '../../../components/Toggle';
import { demoServices } from '../../../data/demoServices';
import { emptySubscriptionDetails } from '../../../data/offerTypes';
import { offerBasePath } from '../../routeBase';

const benefitTypes = [
  { key: 'sessions', label: 'Included sessions', Icon: Scissors },
  { key: 'credit', label: 'Store credit', Icon: CreditCard },
  { key: 'discount', label: 'Member discount', Icon: TicketPercent },
  { key: 'access', label: 'Access pass', Icon: LockKeyhole },
];

const availableItems = demoServices.filter((item) => item.type === 'service' || item.type === 'class');

export default function SubscriptionBenefits() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft, updateDraft } = useOutletContext();
  const details = draft.subscriptionDetails || emptySubscriptionDetails();
  const selected = new Set(details.includedItemIds || []);
  const returnPath = offerBasePath(draft, location);
  const allowedBenefitTypes = allowedBenefits(details.subscriptionType);

  const updateDetails = (patch) =>
    updateDraft({ subscriptionDetails: { ...details, ...patch } });

  const toggleItem = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    updateDetails({ includedItemIds: Array.from(next) });
  };

  return (
    <>
      <ScreenHeader title="Member benefits" onBack={() => navigate(returnPath)} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 space-y-6">
        <div>
          <div className="text-[13px] font-medium text-gray-700 mb-2">Benefit type</div>
          <div className="space-y-2">
            {benefitTypes
              .filter(({ key }) => allowedBenefitTypes.includes(key))
              .map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => updateDetails({ benefitType: key, subscriptionType: details.subscriptionType || typeForBenefit(key) })}
                className={
                  'w-full flex items-center gap-3 rounded-2xl p-4 text-left transition-colors ' +
                  (details.benefitType === key ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900 hover:bg-gray-100')
                }
              >
                {createElement(Icon, { size: 17, strokeWidth: 1.75 })}
                <span className="flex-1 text-[15px] font-medium">{label}</span>
                {details.benefitType === key && <Check size={16} strokeWidth={2.5} />}
              </button>
            ))}
          </div>
        </div>

        {details.benefitType === 'sessions' && (
          <div className="space-y-3">
            <button
              onClick={() => updateDetails({ unlimitedUsage: !details.unlimitedUsage })}
              className={
                'w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors ' +
                (details.unlimitedUsage ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900 hover:bg-gray-100')
              }
            >
              <span className="flex-1 text-[15px] font-medium">Unlimited redemptions this period</span>
              {details.unlimitedUsage && <Check size={16} strokeWidth={2.5} />}
            </button>
            {!details.unlimitedUsage && (
              <TextField
                label="Sessions per billing period"
                type="number"
                value={details.includedSessions}
                onChange={(v) => updateDetails({ includedSessions: v })}
                placeholder="1"
              />
            )}
          </div>
        )}

        {details.benefitType === 'credit' && (
          <>
            <TextField
              label="Credit per billing period (£)"
              type="number"
              value={details.storeCreditAmount}
              onChange={(v) => updateDetails({ storeCreditAmount: v })}
              placeholder="50"
            />

            <div className="rounded-2xl bg-gray-50 p-4 space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-[15px] font-medium">Bonus credit</div>
                  <div className="text-[13px] text-gray-500 mt-0.5 leading-snug">
                    Give members more than they pay — e.g. charge £30, give £33 credit.
                  </div>
                </div>
                <Toggle
                  checked={Boolean(details.creditBonusEnabled)}
                  onChange={(v) => updateDetails({ creditBonusEnabled: v, creditBonusPercent: v ? details.creditBonusPercent : '' })}
                />
              </div>
              {details.creditBonusEnabled && (
                <>
                  <div className="grid grid-cols-[1fr_auto] items-end gap-3">
                    <TextField
                      label="Bonus"
                      type="number"
                      value={details.creditBonusPercent}
                      onChange={(v) => updateDetails({ creditBonusPercent: v })}
                      placeholder="10"
                    />
                    <div className="pb-3 text-[14px] text-gray-500">% extra</div>
                  </div>
                  {details.storeCreditAmount && details.creditBonusPercent && (
                    <div className="bg-white rounded-xl px-3 py-2 text-[13px] text-gray-500">
                      Members receive £{(Number(details.storeCreditAmount) * (1 + Number(details.creditBonusPercent) / 100)).toFixed(2)} credit per period
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="rounded-2xl bg-gray-50 p-4 space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-[15px] font-medium">Restrict to selected services</div>
                  <div className="text-[13px] text-gray-500 mt-0.5">By default credit works on any service or product.</div>
                </div>
                <Toggle
                  checked={details.creditSpendMode === 'selected'}
                  onChange={(v) => updateDetails({ creditSpendMode: v ? 'selected' : 'all' })}
                />
              </div>
              {details.creditSpendMode === 'selected' && (
                <div className="-mx-1">
                  {availableItems.map((item) => {
                    const active = selected.has(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => toggleItem(item.id)}
                        className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl text-left hover:bg-white transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-[14px] text-gray-900 truncate">{item.name}</div>
                          <div className="text-[12px] text-gray-500 capitalize">{item.type}</div>
                        </div>
                        <div className={'w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ' + (active ? 'bg-gray-900' : 'bg-gray-200')}>
                          {active && <Check size={13} className="text-white" strokeWidth={2.5} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {details.benefitType === 'discount' && (
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Service discount (%)"
              type="number"
              value={details.memberDiscountPercent}
              onChange={(v) => updateDetails({ memberDiscountPercent: v })}
              placeholder="20"
            />
            <TextField
              label="Product discount (%)"
              type="number"
              value={details.productDiscountPercent}
              onChange={(v) => updateDetails({ productDiscountPercent: v })}
              placeholder="10"
            />
          </div>
        )}

        {details.benefitType !== 'credit' && <div>
          <div className="text-[13px] font-medium text-gray-700 mb-2">
            Included offers{details.benefitType === 'access' ? ' unlocked by this pass' : ''}
          </div>
          <div className="-mx-2">
            {availableItems.map((item) => {
              const active = selected.has(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                    <Scissors size={17} className="text-gray-700" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] text-gray-900 truncate">{item.name}</div>
                    <div className="text-[13px] text-gray-500 mt-0.5 capitalize">{item.type}</div>
                  </div>
                  <div
                    className={
                      'w-6 h-6 rounded-md flex items-center justify-center transition-colors ' +
                      (active ? 'bg-gray-900' : 'bg-gray-100')
                    }
                  >
                    {active && <Check size={14} className="text-white" strokeWidth={2.5} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>}
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate(returnPath)}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done
        </button>
      </div>
    </>
  );
}

function allowedBenefits(subscriptionType) {
  if (subscriptionType === 'credit') return ['credit'];
  if (subscriptionType === 'membership') return ['discount', 'access'];
  return ['sessions'];
}

function typeForBenefit(benefitType) {
  if (benefitType === 'credit') return 'credit';
  if (benefitType === 'discount' || benefitType === 'access') return 'membership';
  return 'frequency';
}
