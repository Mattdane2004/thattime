import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import ScreenHeader from '../../../components/ScreenHeader';
import TextField from '../../../components/TextField';
import Toggle from '../../../components/Toggle';
import ProductSelect from '../../../components/ProductSelect';
import { emptySubscriptionDetails } from '../../../data/offerTypes';
import { offerBasePath } from '../../routeBase';

const periods = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'quarter', label: 'Quarter' },
  { key: 'year', label: 'Year' },
];

export default function SubscriptionRules() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft, updateDraft } = useOutletContext();
  const details = draft.subscriptionDetails || emptySubscriptionDetails();
  const returnPath = offerBasePath(draft, location);

  const updateDetails = (patch) =>
    updateDraft({ subscriptionDetails: { ...details, ...patch } });

  return (
    <>
      <ScreenHeader title="Terms & renewals" onBack={() => navigate(returnPath)} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 space-y-6">
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

        <div className="rounded-2xl bg-gray-50 p-4 space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-[15px] font-medium">Cooldown between redemptions</div>
              <div className="text-[13px] text-gray-500 mt-0.5">Prevent back-to-back use when a benefit needs spacing.</div>
            </div>
            <Toggle
              checked={details.cooldown?.enabled}
              onChange={(v) => updateDetails({ cooldown: { ...(details.cooldown || {}), enabled: v } })}
            />
          </div>
          {details.cooldown?.enabled && (
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <TextField
                label="Cooldown"
                type="number"
                value={details.cooldown?.value}
                onChange={(v) => updateDetails({ cooldown: { ...(details.cooldown || {}), value: v } })}
                placeholder="7"
              />
              <div className="pt-[21px] text-[14px] text-gray-500">days</div>
            </div>
          )}
        </div>

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

        <div className="grid grid-cols-[1fr_auto] gap-3">
          <TextField
            label="Cancellation notice"
            type="number"
            value={details.cancellationNotice?.value}
            onChange={(v) => updateDetails({ cancellationNotice: { ...(details.cancellationNotice || {}), value: v } })}
            placeholder="30"
          />
          <div className="pt-[21px] text-[14px] text-gray-500">days</div>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4 space-y-3">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="text-[15px] font-medium">Allow membership pauses</div>
              <div className="text-[13px] text-gray-500 mt-0.5">Members can request a temporary hold.</div>
            </div>
            <Toggle
              checked={details.pauseRule?.enabled}
              onChange={(v) => updateDetails({ pauseRule: { ...(details.pauseRule || {}), enabled: v } })}
            />
          </div>
          {details.pauseRule?.enabled && (
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Max pause days"
                type="number"
                value={details.pauseRule?.maxDays}
                onChange={(v) => updateDetails({ pauseRule: { ...(details.pauseRule || {}), maxDays: v } })}
                placeholder="60"
              />
              <TextField
                label="Notice days"
                type="number"
                value={details.pauseRule?.noticeDays}
                onChange={(v) => updateDetails({ pauseRule: { ...(details.pauseRule || {}), noticeDays: v } })}
                placeholder="7"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4">
          <div className="flex-1">
            <div className="text-[15px] font-medium">Rollover unused sessions</div>
            <div className="text-[13px] text-gray-500 mt-0.5">Unused included sessions can move into the next period</div>
          </div>
          <Toggle
            checked={details.rollover}
            onChange={(v) => updateDetails({ rollover: v })}
          />
        </div>
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
