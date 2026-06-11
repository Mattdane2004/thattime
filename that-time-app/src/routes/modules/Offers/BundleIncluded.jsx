import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Check, Repeat, Scissors } from 'lucide-react';
import ScreenHeader from '../../../components/ScreenHeader';
import { demoServices } from '../../../data/demoServices';
import { emptyBundleDetails } from '../../../data/offerTypes';
import { formatDuration } from '../../../components/DurationPicker';
import { offerBasePath } from '../../routeBase';

const availableServices = demoServices.filter((item) => item.type === 'service');
const TIMING_OPTIONS = [
  { key: 'none', label: 'No gap' },
  { key: '15', label: '15m gap' },
  { key: '30', label: '30m gap' },
  { key: 'separate', label: 'Separate visit' },
];

export default function BundleIncluded() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft, updateDraft } = useOutletContext();
  const details = draft.bundleDetails || emptyBundleDetails();
  const bundleKind = details.bundleKind || 'services';
  const selected = new Set(details.includedServiceIds || []);
  const selectedServices = (details.includedServiceIds || [])
    .map((id) => availableServices.find((service) => service.id === id))
    .filter(Boolean);
  const returnPath = offerBasePath(draft, location);

  const updateDetails = (patch) => {
    updateDraft({ bundleDetails: { ...details, ...patch } });
  };

  const updateIncluded = (ids, patch = {}) => {
    const totalDuration = availableServices
      .filter((item) => ids.includes(item.id))
      .reduce((sum, item) => sum + (Number(item.durationMin) || 0), 0);

    updateDraft({
      durationMin: details.durationMode === 'custom' ? draft.durationMin : totalDuration,
      bundleDetails: { ...details, includedServiceIds: ids, ...patch },
    });
  };

  const setBundleKind = (kind) => {
    const firstId = details.includedServiceIds?.[0];
    updateIncluded(kind === 'pack' && firstId ? [firstId] : details.includedServiceIds || [], {
      bundleKind: kind,
      bookingBehavior: kind === 'pack' ? 'separate_bookings' : 'single_booking',
    });
  };

  const toggle = (id) => {
    if (bundleKind === 'pack') {
      updateIncluded([id]);
      return;
    }
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    updateIncluded(Array.from(next));
  };

  const move = (id, direction) => {
    const ids = [...(details.includedServiceIds || [])];
    const index = ids.indexOf(id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= ids.length) return;
    const next = [...ids];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    updateIncluded(next);
  };

  const cycleTiming = (id) => {
    const current = details.serviceTimings?.[id]?.after || 'none';
    const index = TIMING_OPTIONS.findIndex((option) => option.key === current);
    const next = TIMING_OPTIONS[(index + 1) % TIMING_OPTIONS.length];
    updateDetails({
      serviceTimings: {
        ...(details.serviceTimings || {}),
        [id]: { ...(details.serviceTimings?.[id] || {}), after: next.key },
      },
    });
  };

  const updateQuantity = (quantity) => {
    updateDetails({ quantity: Math.max(1, Number(quantity) || 1) });
  };

  return (
    <>
      <ScreenHeader title="Bundle contents" onBack={() => navigate(returnPath)} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6">
        <p className="text-[14px] text-gray-500 mb-4 leading-snug">
          Choose whether this is a package of different services or one service bought several times.
        </p>

        <div className="grid grid-cols-2 gap-2 mb-5">
          <ModeCard
            active={bundleKind === 'services'}
            icon={Scissors}
            title="Services together"
            body="A set of treatments booked as one package."
            onClick={() => setBundleKind('services')}
          />
          <ModeCard
            active={bundleKind === 'pack'}
            icon={Repeat}
            title="Session pack"
            body="One service sold with multiple redemptions."
            onClick={() => setBundleKind('pack')}
          />
        </div>

        {bundleKind === 'services' && selectedServices.length > 0 && (
          <section className="mb-5">
            <div className="text-[13px] font-semibold uppercase tracking-wide text-gray-500 mb-2">Order & timing</div>
            <div className="rounded-3xl bg-gray-50 overflow-hidden">
              {selectedServices.map((service, index) => {
                const timing = TIMING_OPTIONS.find((option) => option.key === details.serviceTimings?.[service.id]?.after) || TIMING_OPTIONS[0];
                return (
                  <div key={service.id} className="flex items-center gap-3 px-4 py-3 border-t border-white first:border-t-0">
                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-[12px] font-semibold text-gray-900 shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-medium text-gray-900 truncate">{service.name}</div>
                      <div className="text-[12px] text-gray-500 mt-0.5">{formatDuration(service.durationMin)}</div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => move(service.id, -1)}
                        disabled={index === 0}
                        className="w-8 h-8 rounded-full bg-white text-gray-500 disabled:opacity-30"
                        aria-label="Move up"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => move(service.id, 1)}
                        disabled={index === selectedServices.length - 1}
                        className="w-8 h-8 rounded-full bg-white text-gray-500 disabled:opacity-30"
                        aria-label="Move down"
                      >
                        ↓
                      </button>
                    </div>
                    {index < selectedServices.length - 1 && (
                      <button
                        onClick={() => cycleTiming(service.id)}
                        className="h-8 px-3 rounded-full bg-white text-[12px] font-medium text-gray-600 shrink-0"
                      >
                        {timing.label}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {bundleKind === 'pack' && (
          <section className="rounded-3xl bg-gray-50 p-4 mb-5">
            <div className="text-[13px] font-medium text-gray-700">Sessions included</div>
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={() => updateQuantity((details.quantity || 1) - 1)}
                className="w-11 h-11 rounded-full bg-white text-[22px] text-gray-700"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={details.quantity || 1}
                onChange={(event) => updateQuantity(event.target.value)}
                className="flex-1 bg-transparent text-center text-[28px] font-semibold outline-none"
              />
              <button
                onClick={() => updateQuantity((details.quantity || 1) + 1)}
                className="w-11 h-11 rounded-full bg-white text-[22px] text-gray-700"
              >
                +
              </button>
            </div>
            <div className="text-[12px] text-gray-500 text-center mt-1">
              Clients buy the pack once, then book each session separately.
            </div>
          </section>
        )}

        <div className="text-[13px] font-semibold uppercase tracking-wide text-gray-500 mb-2">
          {bundleKind === 'pack' ? 'Choose the service' : 'Choose services'}
        </div>

        <div className="space-y-1 -mx-2">
          {[...availableServices]
            .sort((a, b) => sortBySelection(a, b, details.includedServiceIds || []))
            .map((service) => {
              const active = selected.has(service.id);
              return (
                <div
                  key={service.id}
                  className="flex items-center gap-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <button
                    onClick={() => toggle(service.id)}
                    className="flex-1 flex items-center gap-4 px-3 py-3 text-left"
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
                </div>
              );
            })}
        </div>
      </div>

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
    </>
  );
}

function ModeCard({ active, icon: Icon, title, body, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        'rounded-2xl p-4 text-left transition-colors ' +
        (active ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900 hover:bg-gray-100')
      }
    >
      <div className={(active ? 'bg-white/10' : 'bg-white') + ' w-9 h-9 rounded-xl flex items-center justify-center mb-3'}>
        <Icon size={17} strokeWidth={1.75} />
      </div>
      <div className="text-[14px] font-semibold leading-tight">{title}</div>
      <div className={(active ? 'text-white/70' : 'text-gray-500') + ' text-[12px] leading-snug mt-1'}>{body}</div>
    </button>
  );
}

function sortBySelection(a, b, ids) {
  const aIndex = ids.indexOf(a.id);
  const bIndex = ids.indexOf(b.id);
  if (aIndex >= 0 && bIndex >= 0) return aIndex - bIndex;
  if (aIndex >= 0) return -1;
  if (bIndex >= 0) return 1;
  return a.name.localeCompare(b.name);
}
