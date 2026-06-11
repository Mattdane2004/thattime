import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import ScreenHeader from '../../components/ScreenHeader';
import HelpTrigger from '../../components/HelpTrigger';
import WizardFooter from '../../components/WizardFooter';
import TextField from '../../components/TextField';
import DepositControl from '../../components/DepositControl';
import { demoServices } from '../../data/demoServices';
import { emptyBundleDetails, wizardTotalFor } from '../../data/offerTypes';
import { offerBasePath } from '../routeBase';

const sourceServices = demoServices.filter((item) => item.type === 'service');

export default function BundlePricing() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft, updateDraft } = useOutletContext();
  const isWizard = location.pathname.startsWith('/new/');
  const details = draft.bundleDetails || emptyBundleDetails();
  const included = sourceServices.filter((item) => details.includedServiceIds?.includes(item.id));
  const bundleKind = details.bundleKind || 'services';
  const isPackage = bundleKind === 'package';
  const quantity = Math.max(1, Number(details.quantity) || 1);
  const packService = included[0];
  const sourceTotal = bundleKind === 'pack'
    ? (Number(packService?.price) || 0) * quantity
    : included.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
  const discount = Number(details.discountPercent) || 0;
  const discountedPrice = Math.max(0, sourceTotal - sourceTotal * (discount / 100));
  const wizardTotal = bundleKind === 'pack' ? 3 : wizardTotalFor(draft.type);
  const previousStep = bundleKind === 'pack' ? '/new/bundle-services' : '/new/bundle-order';
  const dashboardReturn = offerBasePath(draft, location);
  const valueLabel = bundleKind === 'pack'
    ? `${quantity} x ${packService?.name || 'selected service'}`
    : `${included.length} service${included.length === 1 ? '' : 's'}`;
  const packageTiers = normalisePackageTiers(details);

  const updateDetails = (patch) =>
    updateDraft({ bundleDetails: { ...details, ...patch } });

  const updatePackageTiers = (nextTiers) => {
    const cleaned = nextTiers.length ? nextTiers : [{ minimumSelections: 3, discountPercent: '' }];
    const first = cleaned[0] || {};
    updateDetails({
      packageTiers: cleaned,
      minimumSelections: first.minimumSelections,
      packageDiscountPercent: first.discountPercent,
    });
  };

  const canCreate =
    isPackage
      ? included.length > 0 && packageTiers.length > 0 && packageTiers.every((tier) => isValidTier(tier, included.length))
      : details.priceMode === 'discount'
      ? Boolean(details.discountPercent)
      : Boolean(draft.price);

  const create = () => {
    updateDraft({
      status: isWizard ? 'draft' : draft.status,
      price: !isPackage && details.priceMode === 'discount' ? String(Math.round(discountedPrice * 100) / 100) : draft.price,
      bundleDetails: isPackage
        ? {
            ...details,
            priceMode: 'discount',
            packageTiers,
            minimumSelections: packageTiers[0]?.minimumSelections,
            packageDiscountPercent: packageTiers[0]?.discountPercent,
            discountPercent: packageTiers[0]?.discountPercent,
          }
        : details,
    });
    navigate(isWizard ? '/bundle' : dashboardReturn);
  };

  return (
    <>
      <ScreenHeader title="" onBack={() => navigate(isWizard ? previousStep : dashboardReturn)} rightAction={<HelpTrigger helpKey="bundlePricing" />} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pt-2 pb-6">
          <div className="text-[26px] leading-tight font-semibold tracking-tight">Pricing</div>
          <div className="text-[14px] text-gray-500 mt-1">
            Set what clients pay for the bundle.
          </div>
        </div>

        <div className="space-y-6 pb-6">
          {isPackage ? (
            <div className="space-y-5">
              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                <div className="text-[13px] font-medium text-gray-900">Flexible package tiers</div>
                <div className="text-[12px] text-gray-500 mt-1 leading-snug">
                  Add one or more discount tiers, like choose 4 for 10% off and 6 for 15% off.
                </div>
              </div>

              <div className="space-y-3">
                {packageTiers.map((tier, index) => (
                  <div key={index} className="rounded-2xl bg-gray-50 p-3">
                    <div className="flex items-center gap-2">
                      <div className="grid grid-cols-2 gap-2 flex-1">
                        <TextField
                          label="Choose at least"
                          type="number"
                          value={tier.minimumSelections}
                          onChange={(minimumSelections) => {
                            const next = [...packageTiers];
                            next[index] = { ...tier, minimumSelections };
                            updatePackageTiers(next);
                          }}
                          placeholder="4"
                        />
                        <TextField
                          label="Discount (%)"
                          type="number"
                          value={tier.discountPercent}
                          onChange={(discountPercent) => {
                            const next = [...packageTiers];
                            next[index] = { ...tier, discountPercent };
                            updatePackageTiers(next);
                          }}
                          placeholder="10"
                        />
                      </div>
                      {packageTiers.length > 1 && (
                        <button
                          onClick={() => updatePackageTiers(packageTiers.filter((_, tierIndex) => tierIndex !== index))}
                          className="w-9 h-9 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center shrink-0"
                          aria-label="Remove tier"
                        >
                          <X size={15} className="text-gray-500" strokeWidth={1.75} />
                        </button>
                      )}
                    </div>
                    <div className="text-[12px] text-gray-500 mt-2">
                      {tier.minimumSelections || 0} of {included.length} eligible services unlocks {tier.discountPercent || 0}% off.
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => updatePackageTiers([...packageTiers, { minimumSelections: '', discountPercent: '' }])}
                  className="w-full h-11 rounded-2xl border border-dashed border-gray-200 text-[14px] font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Plus size={16} strokeWidth={2} />
                  Add tier
                </button>
              </div>

              <div className="text-[12px] text-gray-500">
                {included.length} eligible service{included.length === 1 ? '' : 's'} available in this package.
              </div>
            </div>
          ) : (
            <>
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
                    Total value £{sourceTotal.toFixed(2)} · {valueLabel} · bundle price £{discountedPrice.toFixed(2)}
                  </div>
                </div>
              ) : (
                <div>
                  <TextField
                    label="Bundle price (£)"
                    type="number"
                    value={draft.price}
                    onChange={(v) => updateDraft({ price: v })}
                    placeholder="85"
                  />
                  {sourceTotal > 0 && (
                    <div className="text-[12px] text-gray-500 mt-2">
                      Total value £{sourceTotal.toFixed(2)} · {valueLabel}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <DepositControl draft={draft} updateDraft={updateDraft} />
        </div>
      </div>
      {isWizard ? (
        <WizardFooter
          step={wizardTotal}
          total={wizardTotal}
          onBack={() => navigate(previousStep)}
          onNext={create}
          nextLabel="Create bundle"
          nextDisabled={!canCreate}
        />
      ) : (
        <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
          <button
            onClick={create}
            disabled={!canCreate}
            className={
              'w-full h-12 rounded-full text-[15px] font-medium transition-colors ' +
              (canCreate ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'bg-gray-100 text-gray-400')
            }
          >
            Done
          </button>
        </div>
      )}
    </>
  );
}

function normalisePackageTiers(details = {}) {
  if (Array.isArray(details.packageTiers) && details.packageTiers.length) {
    return details.packageTiers.map((tier) => ({
      minimumSelections: tier.minimumSelections ?? '',
      discountPercent: tier.discountPercent ?? '',
    }));
  }
  return [{
    minimumSelections: details.minimumSelections || 3,
    discountPercent: details.packageDiscountPercent || '',
  }];
}

function isValidTier(tier, eligibleCount) {
  const minimum = Number(tier.minimumSelections);
  return minimum > 0 && minimum <= eligibleCount && Boolean(tier.discountPercent);
}
