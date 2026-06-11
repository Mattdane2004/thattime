import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import ScreenHeader from '../../../components/ScreenHeader';
import TextField from '../../../components/TextField';
import DurationPicker, { formatDuration } from '../../../components/DurationPicker';
import DepositControl from '../../../components/DepositControl';
import { demoServices } from '../../../data/demoServices';
import { emptyBundleDetails } from '../../../data/offerTypes';
import { offerBasePath } from '../../routeBase';

const sourceServices = demoServices.filter((item) => item.type === 'service');

export default function BundlePricing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft, updateDraft } = useOutletContext();
  const details = draft.bundleDetails || emptyBundleDetails();
  const returnPath = offerBasePath(draft, location);
  const included = sourceServices.filter((item) => details.includedServiceIds?.includes(item.id));
  const bundleKind = details.bundleKind || 'services';
  const quantity = Math.max(1, Number(details.quantity) || 1);
  const sourceTotal = bundleKind === 'pack'
    ? (Number(included[0]?.price) || 0) * quantity
    : included.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const durationTotal = bundleKind === 'pack'
    ? Number(included[0]?.durationMin) || 0
    : included.reduce((sum, item) => sum + (Number(item.durationMin) || 0), 0);
  const shownDuration = details.durationMode === 'custom'
    ? Number(details.customDurationMin) || durationTotal
    : durationTotal;
  const discount = Number(details.discountPercent) || 0;
  const discountedPrice = Math.max(0, sourceTotal - sourceTotal * (discount / 100));
  const durationWarning = bundleKind === 'services' && shownDuration < durationTotal;

  const updateDetails = (patch) =>
    updateDraft({ bundleDetails: { ...details, ...patch } });

  const save = () => {
    updateDraft({
      price: details.priceMode === 'discount'
        ? String(Math.round(discountedPrice * 100) / 100)
        : draft.price,
      durationMin: shownDuration || durationTotal,
    });
    navigate(returnPath);
  };

  return (
    <>
      <ScreenHeader title="Price & duration" onBack={() => navigate(returnPath)} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 space-y-6">
        <div>
          <div className="text-[13px] font-medium text-gray-700 mb-2">Pricing style</div>
          <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-2xl p-1">
            {[
              { key: 'fixed', label: 'Fixed price' },
              { key: 'discount', label: 'Discount' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => updateDetails({ priceMode: item.key })}
                className={
                  'py-3 rounded-xl text-[13px] font-medium transition-colors ' +
                  (details.priceMode === item.key ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-white')
                }
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {details.priceMode === 'discount' ? (
          <div>
            <TextField
              label="Discount (%)"
              type="number"
              value={details.discountPercent}
              onChange={(v) => updateDetails({ discountPercent: v })}
              placeholder="10"
            />
            <div className="text-[12px] text-gray-500 mt-2">
              Services total £{sourceTotal || 0} · bundle price £{discountedPrice.toFixed(2)}
            </div>
          </div>
        ) : (
          <TextField
            label="Bundle price (£)"
            type="number"
            value={draft.price}
            onChange={(v) => updateDraft({ price: v })}
            placeholder="85"
          />
        )}

        <div>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="text-[13px] font-medium text-gray-700">Duration</div>
              <div className="text-[12px] text-gray-500 mt-0.5">
                {bundleKind === 'pack'
                  ? `${quantity} separate booking${quantity === 1 ? '' : 's'} · ${formatDuration(durationTotal)} each`
                  : `Combined service time is ${formatDuration(durationTotal)}`}
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-[12px] text-gray-600">
              {formatDuration(shownDuration)}
            </span>
          </div>
          <DurationPicker
            value={shownDuration}
            onChange={(v) => updateDetails({ durationMode: 'custom', customDurationMin: v })}
          />
          {durationWarning && (
            <div className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-[12px] leading-snug text-amber-800">
              This is shorter than the services normally take together. That can work for packages with shared prep or overlap, but check staff and room availability before publishing.
            </div>
          )}
        </div>

        <DepositControl draft={draft} updateDraft={updateDraft} />
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={save}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Save changes
        </button>
      </div>
    </>
  );
}
