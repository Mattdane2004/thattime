import { useNavigate, useOutletContext } from 'react-router-dom';
import ScreenHeader from '../../components/ScreenHeader';
import HelpTrigger from '../../components/HelpTrigger';
import WizardFooter from '../../components/WizardFooter';
import TextField from '../../components/TextField';
import Toggle from '../../components/Toggle';
import ProductSelect from '../../components/ProductSelect';
import { emptySubscriptionDetails, wizardTotalFor } from '../../data/offerTypes';

const periods = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'quarter', label: 'Quarter' },
  { key: 'year', label: 'Year' },
];

export default function SubscriptionBilling() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useOutletContext();
  const details = draft.subscriptionDetails || emptySubscriptionDetails();

  const updateDetails = (patch) =>
    updateDraft({ subscriptionDetails: { ...details, ...patch } });

  const create = () => {
    updateDraft({ status: 'draft', durationMin: 0 });
    navigate('/subscription');
  };

  return (
    <>
      <ScreenHeader title="" onBack={() => navigate('/new/subscription-benefits')} rightAction={<HelpTrigger helpKey="subscriptionBilling" />} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pt-2 pb-6">
          <div className="text-[26px] leading-tight font-semibold tracking-tight">Billing</div>
          <div className="text-[14px] text-gray-500 mt-1">
            Set the recurring price and basic membership terms.
          </div>
        </div>

        <div className="space-y-6 pb-6">
          <div>
            <div className="text-[13px] font-medium text-gray-700 mb-2">Billing price</div>
            <div className="h-14 rounded-2xl bg-gray-50 px-4 flex items-center gap-3">
              <div className="text-[18px] font-medium text-gray-500">£</div>
              <input
                type="number"
                value={draft.price}
                onChange={(event) => updateDraft({ price: event.target.value })}
                placeholder="40"
                className="flex-1 min-w-0 bg-transparent outline-none text-[18px] font-medium text-gray-900 placeholder:text-gray-400"
              />
              <ProductSelect
                value={details.billingPeriod}
                onChange={(billingPeriod) => updateDetails({ billingPeriod })}
                options={periods}
                compact
                className="w-28"
                buttonClassName="bg-white h-10 min-h-0 px-3 py-0 text-[13px] font-medium"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4 space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-[15px] font-medium">Joining fee</div>
                <div className="text-[13px] text-gray-500 mt-0.5">A one-off charge when a member first signs up.</div>
              </div>
              <Toggle
                checked={Boolean(details.joiningFeeEnabled)}
                onChange={(v) => updateDetails({ joiningFeeEnabled: v, joiningFee: v ? details.joiningFee : '' })}
              />
            </div>
            {details.joiningFeeEnabled && (
              <TextField
                label="Amount (£)"
                type="number"
                value={details.joiningFee}
                onChange={(v) => updateDetails({ joiningFee: v })}
                placeholder="25"
              />
            )}
          </div>

          <TextField
            label="Minimum term (months)"
            type="number"
            value={details.minimumTermMonths}
            onChange={(v) => updateDetails({ minimumTermMonths: v })}
            placeholder="3"
          />

          <div>
            <div className="text-[13px] font-medium text-gray-700 mb-2">Cancellation</div>
            <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-2xl p-1">
              {[
                { key: 'cancel_anytime', label: 'Cancel anytime' },
                { key: 'after_term', label: 'After term' },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => updateDetails({ cancellationRule: item.key })}
                  className={
                    'py-3 rounded-xl text-[13px] font-medium transition-colors ' +
                    (details.cancellationRule === item.key ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-white')
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4">
            <div className="flex-1">
              <div className="text-[15px] font-medium">Rollover unused sessions</div>
              <div className="text-[13px] text-gray-500 mt-0.5">Can be refined in the hub later</div>
            </div>
            <Toggle
              checked={details.rollover}
              onChange={(v) => updateDetails({ rollover: v })}
            />
          </div>
        </div>
      </div>
      <WizardFooter
        step={4}
        total={wizardTotalFor(draft.type)}
        onBack={() => navigate('/new/subscription-benefits')}
        onNext={create}
        nextLabel="Create subscription"
        nextDisabled={!draft.price}
      />
    </>
  );
}
