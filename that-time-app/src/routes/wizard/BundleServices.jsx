import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Check, ListChecks, Scissors } from 'lucide-react';
import ScreenHeader from '../../components/ScreenHeader';
import HelpTrigger from '../../components/HelpTrigger';
import WizardFooter from '../../components/WizardFooter';
import { demoServices } from '../../data/demoServices';
import { emptyBundleDetails, wizardTotalFor } from '../../data/offerTypes';
import { formatDuration } from '../../components/DurationPicker';
import { offerBasePath } from '../routeBase';

const availableServices = demoServices.filter((item) => item.type === 'service');

export default function BundleServices() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft, updateDraft } = useOutletContext();
  const details = draft.bundleDetails || emptyBundleDetails();
  const bundleKind = details.bundleKind === 'package' ? 'package' : 'services';
  const selected = new Set(details.includedServiceIds || []);
  const isWizard = location.pathname.startsWith('/new/');
  const returnPath = isWizard ? '/new/basics' : offerBasePath(draft, location);
  const nextPath = isWizard ? '/new/bundle-order' : returnPath;

  const updateIncluded = (ids, patch = {}) => {
    const totalDuration = availableServices
      .filter((item) => ids.includes(item.id))
      .reduce((sum, item) => sum + (Number(item.durationMin) || 0), 0);

    updateDraft({
      durationMin: totalDuration || draft.durationMin,
      bundleDetails: {
        ...details,
        includedServiceIds: ids,
        durationMode: details.durationMode || 'sum',
        ...patch,
      },
    });
  };

  const setBundleKind = (kind) => {
    updateIncluded(details.includedServiceIds || [], {
      bundleKind: kind,
      bookingBehavior: kind === 'package' ? 'customer_choice' : 'single_booking',
    });
  };

  const toggle = (id) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    updateIncluded(Array.from(next));
  };

  return (
    <>
      <ScreenHeader title="" onBack={() => navigate(returnPath)} rightAction={<HelpTrigger helpKey="bundleServices" />} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pt-2 pb-6">
          <div className="text-[26px] leading-tight font-semibold tracking-tight">Included services</div>
          <div className="text-[14px] text-gray-500 mt-1">
            Choose whether clients buy a fixed set, or choose from a set.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <BundleKindCard
            active={bundleKind === 'services'}
            icon={Scissors}
            title="Fixed bundle"
            body="Clients buy these exact services together."
            onClick={() => setBundleKind('services')}
          />
          <BundleKindCard
            active={bundleKind === 'package'}
            icon={ListChecks}
            title="Flexible package"
            body="Clients choose a few services from this list."
            onClick={() => setBundleKind('package')}
          />
        </div>

        <div className="text-[12px] text-gray-500 mb-3 leading-snug">
          {bundleKind === 'package'
            ? 'Select every service customers can choose from. You will set the minimum and discount on the pricing step.'
            : 'Select the services that are always included in this bundle.'}
        </div>

        <div className="-mx-2 pb-6">
          {availableServices.map((service) => {
            const active = selected.has(service.id);
            return (
              <button
                key={service.id}
                onClick={() => toggle(service.id)}
                className="w-full flex items-center gap-4 px-3 py-3 rounded-xl text-left hover:bg-gray-50 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <Scissors size={17} className="text-gray-700" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] text-gray-900 truncate">{service.name}</div>
                  <div className="text-[13px] text-gray-500 mt-0.5">
                    {formatDuration(service.durationMin)} · {service.price ? `£${service.price}` : 'Free'}
                  </div>
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
      </div>
      {isWizard ? (
        <WizardFooter
          step={2}
          total={wizardTotalFor(draft.type)}
          onBack={() => navigate('/new/basics')}
          onNext={() => navigate(nextPath)}
          nextDisabled={selected.size === 0}
        />
      ) : (
        <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
          <button
            onClick={() => navigate(returnPath)}
            disabled={selected.size === 0}
            className={
              'w-full h-12 rounded-full text-[15px] font-medium transition-colors ' +
              (selected.size === 0 ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 hover:bg-gray-800 text-white')
            }
          >
            Done · {selected.size} selected
          </button>
        </div>
      )}
    </>
  );
}

function BundleKindCard({ active, icon: Icon, title, body, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        'rounded-2xl p-4 text-left transition-colors ' +
        (active ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900 hover:bg-gray-100')
      }
    >
      <div
        className={
          'w-9 h-9 rounded-xl flex items-center justify-center mb-3 ' +
          (active ? 'bg-white/10' : 'bg-white')
        }
      >
        <Icon size={17} strokeWidth={1.75} />
      </div>
      <div className="text-[14px] font-semibold leading-tight">{title}</div>
      <div className={'text-[12px] leading-snug mt-1 ' + (active ? 'text-white/70' : 'text-gray-500')}>
        {body}
      </div>
    </button>
  );
}
