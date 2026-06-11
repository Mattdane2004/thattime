import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import ScreenHeader from '../../components/ScreenHeader';
import HelpTrigger from '../../components/HelpTrigger';
import WizardFooter from '../../components/WizardFooter';
import TextField from '../../components/TextField';
import DurationPicker from '../../components/DurationPicker';
import DepositControl from '../../components/DepositControl';
import Toggle from '../../components/Toggle';
import { emptyClassDetails, offerTypeMeta, wizardTotalFor, wizardTotalForDraft } from '../../data/offerTypes';
import { hasValidClassPrice, isPrivateGroupClass, isSeatBasedClass } from '../../data/classFlow';

export default function Price() {
  const navigate = useNavigate();
  const route = useLocation();
  const { draft, updateDraft } = useOutletContext();
  const meta = offerTypeMeta(draft.type);
  const isClass = draft.type === 'class';
  const isDashboardEdit = route.pathname === '/class/pricing';
  const total = isClass ? wizardTotalForDraft(draft) : wizardTotalFor(draft.type);
  const details = draft.classDetails || emptyClassDetails();
  const seatBased = isClass && isSeatBasedClass(details);
  const privateGroup = isClass && isPrivateGroupClass(details);
  const step = isClass ? 7 : 4;
  const backPath = isClass ? '/new/class-staff' : '/new/staff';

  const updateClass = (patch) =>
    updateDraft({ classDetails: { ...details, ...patch } });

  const canContinue = isClass
    ? (seatBased && hasValidClassPrice(draft, 'public')) ||
        (privateGroup && hasValidClassPrice(draft, 'private'))
    : Boolean(draft.price && Number(draft.durationMin) > 0);

  const create = () => {
    updateDraft({ status: 'draft' });
    navigate('/service');
  };

  const finishClassSetup = () => {
    const patch = {};
    if (seatBased && !details.publicPrice) patch.publicPrice = draft.price;
    if (privateGroup && !details.privatePrice) patch.privatePrice = draft.price;
    updateDraft({
      status: 'draft',
      ...(Object.keys(patch).length > 0 ? { classDetails: { ...details, ...patch } } : {}),
    });
    navigate('/class');
  };

  return (
    <>
      <ScreenHeader
        title=""
        onBack={() => navigate(isDashboardEdit ? '/class' : backPath)}
        rightAction={<HelpTrigger helpKey="price" />}
      />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pt-2 pb-10">
          <div className="text-[28px] leading-tight font-semibold tracking-tight">
            {isClass ? 'Price' : 'Price & duration'}
          </div>
          <div className="text-[14px] text-gray-500 mt-1">
            {isClass
              ? 'How much'
              : meta.priceHint}
          </div>
        </div>

        <div className="space-y-6 pb-6">
          {isClass ? (
            <ClassPricePanel
              label={seatBased ? 'Price per person' : 'Group price'}
              value={seatBased ? details.publicPrice || draft.price : details.privatePrice || draft.price}
              placeholder={seatBased ? '60' : '120'}
              capacity={details.capacity}
              showRevenueHelper={seatBased}
              depositEnabled={draft.depositEnabled}
              depositType={draft.depositType || 'fixed'}
              depositAmount={draft.depositAmount}
              onPriceChange={(price) => {
                updateClass(seatBased
                  ? { pricingType: 'fixed', publicPrice: price, publicPriceModel: 'per_person' }
                  : { pricingType: 'fixed', privatePrice: price, privatePriceModel: 'per_group' });
                updateDraft({ price });
              }}
              onDepositChange={(patch) => updateDraft(patch)}
            />
          ) : (
            <>
              <TextField
                label={meta.priceLabel}
                type="number"
                value={draft.price}
                onChange={(v) => updateDraft({ price: v })}
                placeholder="35"
              />

              <DurationPicker
                value={draft.durationMin}
                onChange={(v) => updateDraft({ durationMin: v })}
              />

              <DepositControl draft={draft} updateDraft={updateDraft} />
            </>
          )}
        </div>
      </div>

      <WizardFooter
        step={step}
        total={total}
        onBack={() => navigate(isDashboardEdit ? '/class' : backPath)}
        onNext={isClass ? finishClassSetup : create}
        nextLabel={isDashboardEdit ? 'Done' : isClass ? 'Go to dashboard' : meta.createLabel}
        nextDisabled={!canContinue}
      />
    </>
  );
}

function ClassPricePanel({
  label,
  value,
  placeholder,
  capacity,
  showRevenueHelper,
  depositEnabled,
  depositType,
  depositAmount,
  onPriceChange,
  onDepositChange,
}) {
  const priceNumber = Number(value) || 0;
  const capacityNumber = Number(capacity) || 0;
  const potentialRevenue = priceNumber * capacityNumber;

  return (
    <section className="space-y-8">
      <label className="block">
        <span className="text-[13px] text-gray-900">{label}</span>
        <div className="mt-2 bg-[#f9f9f9] rounded-lg px-4 py-5 flex items-end gap-2">
          <span className="text-[12px] text-gray-500 mb-1">£</span>
          <input
            type="number"
            value={value}
            onChange={(event) => onPriceChange(event.target.value)}
            placeholder={placeholder}
            className="w-full min-w-0 bg-transparent outline-none text-[32px] leading-none font-medium text-gray-900 placeholder:text-gray-300"
          />
        </div>
        {showRevenueHelper && priceNumber > 0 && capacityNumber > 0 && (
          <div className="mt-2 text-[12px] text-gray-500">
            £{formatMoney(priceNumber)} per person x {capacityNumber} seats = £{formatMoney(potentialRevenue)} potential revenue
          </div>
        )}
      </label>

      <div className="bg-[#f9f9f9] rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-gray-900">Deposit</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Charge a deposit at booking</div>
          </div>
          <Toggle
            checked={Boolean(depositEnabled)}
            onChange={(depositEnabled) => onDepositChange({ depositEnabled })}
          />
        </div>

        {depositEnabled && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 bg-white rounded-xl p-1">
              {[
                { key: 'fixed', label: 'Amount' },
                { key: 'percent', label: 'Percent' },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => onDepositChange({ depositType: option.key })}
                  className={
                    'h-9 rounded-lg text-[12px] font-medium transition-colors ' +
                    (depositType === option.key ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-700')
                  }
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="bg-white rounded-xl px-4 py-3 flex items-baseline gap-2">
              <span className="text-[13px] text-gray-500">{depositType === 'percent' ? '%' : '£'}</span>
              <input
                type="number"
                value={depositAmount}
                onChange={(event) => onDepositChange({ depositAmount: event.target.value })}
                placeholder={depositType === 'percent' ? '20' : '10'}
                className="flex-1 min-w-0 bg-transparent outline-none text-[16px] font-medium text-gray-900"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function formatMoney(value) {
  return Number(value).toLocaleString('en-GB', {
    maximumFractionDigits: Number.isInteger(Number(value)) ? 0 : 2,
  });
}
