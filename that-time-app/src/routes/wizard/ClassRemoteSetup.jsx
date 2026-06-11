import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Info, Link2, MapPin, Video } from 'lucide-react';
import ScreenHeader from '../../components/ScreenHeader';
import HelpTrigger from '../../components/HelpTrigger';
import WizardFooter from '../../components/WizardFooter';
import TextField from '../../components/TextField';
import { businessLocations } from '../../data/business';
import { emptyClassDetails, wizardTotalForDraft } from '../../data/offerTypes';

export default function ClassRemoteSetup() {
  const navigate = useNavigate();
  const route = useLocation();
  const { draft, updateDraft } = useOutletContext();
  const isDashboardEdit = route.pathname === '/class/remote';
  const details = draft.classDetails || emptyClassDetails();
  const remoteSettings = {
    ...emptyClassDetails().remoteSettings,
    ...(details.remoteSettings || {}),
  };
  const inSalon = draft.locations?.inSalon;
  const remoteEnabled = Boolean(draft.locations?.remote?.enabled);
  const selectedLocations = selectedBusinessLocations(inSalon);
  const isHybrid = Boolean(inSalon?.enabled && selectedLocations.length > 0);

  const updateRemote = (patch) =>
    updateDraft({
      classDetails: {
        ...details,
        remoteSettings: {
          ...remoteSettings,
          ...patch,
        },
      },
    });

  const setPerLocationLink = (locationId, value) =>
    updateRemote({
      perLocationLinks: {
        ...(remoteSettings.perLocationLinks || {}),
        [locationId]: value,
      },
    });

  const goNext = () => navigate(isDashboardEdit ? '/class' : '/new/class-staff');
  const goBack = () => navigate(isDashboardEdit ? '/class' : '/new/class-location');

  return (
    <>
      <ScreenHeader
        title=""
        onBack={goBack}
        rightAction={<HelpTrigger helpKey="locations" />}
      />

      <div className="flex-1 overflow-y-auto px-5">
        <div className="pt-2 pb-6">
          <div className="text-[26px] leading-tight font-semibold tracking-tight">
            Remote setup
          </div>
          <div className="text-[14px] text-gray-500 mt-1">
            Add meeting links now, or skip this and finish it from the dashboard.
          </div>
        </div>

        <div className="space-y-4 pb-6">
          {!remoteEnabled ? (
            <div className="bg-gray-50 rounded-2xl p-4 flex gap-3">
              <Info size={16} className="text-gray-500 mt-0.5 shrink-0" strokeWidth={1.75} />
              <div>
                <div className="text-[14px] font-medium text-gray-900">Remote is off</div>
                <div className="text-[13px] text-gray-500 mt-0.5 leading-snug">
                  Turn remote on in Location if this class needs a video link.
                </div>
              </div>
            </div>
          ) : isHybrid ? (
            <>
              <section className="space-y-3">
                <div>
                  <div className="text-[12px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                    Hosting
                  </div>
                  <div className="grid grid-cols-2 gap-1 bg-gray-100 rounded-xl p-1">
                    <ModeButton
                      active={remoteSettings.hostingMode !== 'single_host'}
                      label="Each location"
                      onClick={() => updateRemote({ hostingMode: 'per_location' })}
                    />
                    <ModeButton
                      active={remoteSettings.hostingMode === 'single_host'}
                      label="One shared host"
                      onClick={() => updateRemote({ hostingMode: 'single_host' })}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 flex gap-3">
                  {remoteSettings.hostingMode === 'single_host' ? (
                    <Video size={16} className="text-gray-500 mt-0.5 shrink-0" strokeWidth={1.75} />
                  ) : (
                    <MapPin size={16} className="text-gray-500 mt-0.5 shrink-0" strokeWidth={1.75} />
                  )}
                  <div className="text-[13px] text-gray-600 leading-snug">
                    {remoteSettings.hostingMode === 'single_host'
                      ? 'One link is used for every selected location. You can decide the operational host later if needed.'
                      : 'Each selected location can use its own link. Staff still comes from the location assignment step.'}
                  </div>
                </div>
              </section>

              {remoteSettings.hostingMode === 'single_host' ? (
                <LinkField
                  label="Shared meeting link"
                  value={remoteSettings.sharedLink}
                  onChange={(sharedLink) => updateRemote({ sharedLink })}
                />
              ) : (
                <section className="space-y-3">
                  <div className="text-[12px] font-semibold uppercase tracking-wider text-gray-500">
                    Location links
                  </div>
                  {selectedLocations.map((location) => (
                    <div key={location.id} className="bg-gray-50 rounded-2xl p-4 space-y-3">
                      <div>
                        <div className="text-[14px] font-medium text-gray-900">{location.name}</div>
                        <div className="text-[12px] text-gray-500 mt-0.5">{location.address}</div>
                      </div>
                      <LinkField
                        label="Meeting link"
                        value={remoteSettings.perLocationLinks?.[location.id] || ''}
                        onChange={(value) => setPerLocationLink(location.id, value)}
                      />
                    </div>
                  ))}
                </section>
              )}
            </>
          ) : (
            <>
              <div className="bg-gray-50 rounded-2xl p-4 flex gap-3">
                <Video size={16} className="text-gray-500 mt-0.5 shrink-0" strokeWidth={1.75} />
                <div className="text-[13px] text-gray-600 leading-snug">
                  This is a remote-only class. You’ll choose the instructor on the next step. The link is optional for now.
                </div>
              </div>
              <LinkField
                label="Meeting link"
                value={remoteSettings.sharedLink}
                onChange={(sharedLink) => updateRemote({ sharedLink })}
              />
            </>
          )}
        </div>
      </div>

      <WizardFooter
        step={3}
        total={wizardTotalForDraft(draft)}
        onBack={goBack}
        onNext={goNext}
        nextLabel={isDashboardEdit ? 'Done' : 'Next'}
      />
    </>
  );
}

function ModeButton({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        'h-10 rounded-lg text-[12px] font-medium transition-colors ' +
        (active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')
      }
    >
      {label}
    </button>
  );
}

function LinkField({ label, value, onChange }) {
  return (
    <div className="relative">
      <TextField
        label={label}
        value={value}
        onChange={onChange}
        placeholder="https://zoom.us/j/123456"
      />
      <Link2 size={15} className="absolute right-3 top-[35px] text-gray-300" strokeWidth={1.75} />
    </div>
  );
}

function selectedBusinessLocations(inSalon = {}) {
  if (!inSalon?.enabled) return [];
  const ids = inSalon.locationIds?.length
    ? inSalon.locationIds
    : businessLocations.map((location) => location.id);
  return ids
    .map((id) => businessLocations.find((location) => location.id === id))
    .filter(Boolean);
}
