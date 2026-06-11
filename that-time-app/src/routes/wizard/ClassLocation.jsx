import { useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Check, MapPin, MonitorPlay, Navigation } from 'lucide-react';
import BottomSheet from '../../components/BottomSheet';
import ScreenHeader from '../../components/ScreenHeader';
import HelpTrigger from '../../components/HelpTrigger';
import WizardFooter from '../../components/WizardFooter';
import { businessLocations } from '../../data/business';
import { emptyClassDetails, wizardTotalForDraft } from '../../data/offerTypes';
import { isPrivateGroupClass } from '../../data/classFlow';

export default function ClassLocation() {
  const navigate = useNavigate();
  const route = useLocation();
  const { draft, updateDraft } = useOutletContext();
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
  const isDashboardEdit = route.pathname === '/class/location';
  const details = draft.classDetails || emptyClassDetails();
  const selectedIds = draft.locations?.inSalon?.locationIds || [];
  const inPerson = Boolean(draft.locations?.inSalon?.enabled);
  const online = Boolean(draft.locations?.remote?.enabled);
  const mobile = Boolean(draft.locations?.mobile?.enabled);
  const privateGroup = isPrivateGroupClass(details);
  const canContinue = (inPerson || online || mobile) && (!inPerson || selectedIds.length > 0);
  const updateClass = (patch) => updateDraft({ classDetails: { ...details, ...patch } });

  const syncDelivery = (nextInPerson, nextOnline, nextMobile = mobile) => {
    const activeCount = [nextInPerson, nextOnline, nextMobile].filter(Boolean).length;
    updateClass({
      deliveryMethod: activeCount > 1
        ? 'mixed'
        : nextInPerson
          ? 'in_person'
          : nextOnline
            ? 'online'
            : nextMobile
              ? 'mobile'
              : '',
    });
  };

  const setInPerson = (enabled) => {
    const locationIds = enabled
      ? (selectedIds.length ? selectedIds : [businessLocations[0]?.id].filter(Boolean))
      : [];
    updateDraft({
      locations: {
        ...draft.locations,
        inSalon: { ...draft.locations.inSalon, enabled, locationIds },
      },
    });
    syncDelivery(enabled, online, mobile);
  };

  const setOnline = (enabled) => {
    updateDraft({
      locations: {
        ...draft.locations,
        remote: { ...draft.locations.remote, enabled },
      },
    });
    syncDelivery(inPerson, enabled, mobile);
  };

  const setMobile = (enabled) => {
    updateDraft({
      locations: {
        ...draft.locations,
        mobile: { ...draft.locations.mobile, enabled },
      },
    });
    syncDelivery(inPerson, online, enabled);
  };

  const toggleLocation = (id) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((item) => item !== id)
      : [...selectedIds, id];
    updateDraft({
      locations: {
        ...draft.locations,
        inSalon: { ...draft.locations.inSalon, enabled: next.length > 0, locationIds: next },
      },
    });
    syncDelivery(next.length > 0, online, mobile);
  };

  return (
    <>
      <ScreenHeader
        title=""
        onBack={() => navigate(isDashboardEdit ? '/class' : '/new/class-schedule-times')}
        rightAction={<HelpTrigger helpKey="locations" />}
      />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pt-2 pb-8">
          <div className="text-[28px] leading-tight font-semibold tracking-tight">Where is it offered?</div>
          <div className="text-[14px] text-gray-500 mt-1">
            Pick one or more. You can set details for each.
          </div>
        </div>

        <div className="space-y-6 pb-6">
          <section className="space-y-4">
            <DeliveryCard
              icon={MapPin}
              label="In-salon"
              desc="At a fixed location"
              active={inPerson}
              onClick={() => setInPerson(!inPerson)}
              summary={inPerson ? selectedLocationSummary(selectedIds) : ''}
              actionLabel={inPerson ? 'Edit settings' : ''}
              onAction={(event) => {
                event.stopPropagation();
                setLocationSheetOpen(true);
              }}
            />
            <DeliveryCard
              icon={MonitorPlay}
              label="Remote"
              desc="Video call or online"
              active={online}
              onClick={() => setOnline(!online)}
            />
            {privateGroup && (
              <DeliveryCard
                icon={Navigation}
                label="Travel to client"
                desc="Teacher goes to the client or their venue"
                active={mobile}
                onClick={() => setMobile(!mobile)}
              />
            )}
          </section>

          {!privateGroup && (
            <div className="text-[12px] text-gray-500 leading-snug">
              Mobile delivery is only available on private classes — switch to a private booking on the previous step to offer travel-to-customer.
            </div>
          )}
        </div>
      </div>

      <WizardFooter
        step={5}
        total={wizardTotalForDraft(draft)}
        onBack={() => navigate(isDashboardEdit ? '/class' : '/new/class-schedule-times')}
        onNext={() => navigate(isDashboardEdit ? '/class' : '/new/class-staff')}
        nextLabel={isDashboardEdit ? 'Done' : 'Next'}
        nextDisabled={!canContinue}
      />

      <BottomSheet
        open={locationSheetOpen}
        onClose={() => setLocationSheetOpen(false)}
        title="In-salon locations"
        footer={
          <button
            onClick={() => setLocationSheetOpen(false)}
            className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
          >
            Done
          </button>
        }
      >
        <div className="space-y-2">
          {businessLocations.map((location) => {
            const active = selectedIds.includes(location.id);
            return (
              <button
                key={location.id}
                onClick={() => toggleLocation(location.id)}
                className="w-full rounded-2xl bg-gray-50 hover:bg-gray-100 px-4 py-3 flex items-center gap-3 text-left"
              >
                <span className={'w-6 h-6 rounded-full flex items-center justify-center shrink-0 ' + (active ? 'bg-gray-900 text-white' : 'bg-white text-transparent')}>
                  <Check size={14} strokeWidth={2.2} />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-[14px] font-medium text-gray-900">{location.name}</span>
                  <span className="block text-[12px] text-gray-500 truncate">{location.address}</span>
                </span>
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </>
  );
}

function DeliveryCard({ icon, label, desc, active, summary, actionLabel, onAction, onClick }) {
  const IconComponent = icon;
  return (
    <button
      onClick={onClick}
      className={
        'w-full rounded-[14px] p-4 text-left border transition-colors ' +
        (active ? 'bg-white border-gray-900' : 'bg-white border-gray-200 hover:bg-gray-50')
      }
    >
      <span className="flex items-center gap-3">
        <span className="w-[38px] h-[38px] rounded-[11px] bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
          <IconComponent size={17} className="text-gray-800" strokeWidth={1.75} />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[14px] font-medium text-gray-900">{label}</span>
          <span className="block text-[12px] text-gray-500 mt-0.5">{desc}</span>
        </span>
        <span className={'w-[22px] h-[22px] rounded-full flex items-center justify-center shrink-0 border ' + (active ? 'bg-gray-900 border-gray-900 text-white' : 'bg-gray-50 border-gray-200 text-transparent')}>
          <Check size={13} strokeWidth={2.3} />
        </span>
      </span>
      {active && summary && (
        <>
          <span className="block h-px bg-gray-100 my-4" />
          <span className="flex items-center justify-between gap-3">
            <span className="text-[12px] text-gray-500 truncate">{summary}</span>
            {actionLabel && (
              <span
                onClick={onAction}
                className="h-8 px-3 rounded-lg bg-gray-50 border border-gray-200 text-[12px] font-medium text-gray-900 flex items-center shrink-0"
              >
                {actionLabel}
              </span>
            )}
          </span>
        </>
      )}
    </button>
  );
}

function selectedLocationSummary(ids) {
  if (!ids.length) return 'No locations selected';
  const names = ids
    .map((id) => businessLocations.find((location) => location.id === id)?.name?.replace(/^Salon\s+/i, ''))
    .filter(Boolean);
  return `${names.slice(0, 2).join(' · ')}${ids.length > 2 ? ` · ${ids.length} locations` : ids.length > 1 ? ` · ${ids.length} locations` : ''}`;
}
