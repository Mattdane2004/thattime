import { useNavigate, useOutletContext } from 'react-router-dom';
import ScreenHeader from '../../components/ScreenHeader';
import HelpTrigger from '../../components/HelpTrigger';
import WizardFooter from '../../components/WizardFooter';
import TextField from '../../components/TextField';
import Toggle from '../../components/Toggle';
import ClassScheduleFields from '../../components/ClassScheduleFields';
import { emptyClassDetails, wizardTotalFor } from '../../data/offerTypes';
import { emptyAdvancedOptions } from '../../data/advancedOptions';

export default function ClassDetails() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useOutletContext();
  const details = draft.classDetails || emptyClassDetails();
  const schedule = details.schedule || emptyClassDetails().schedule;

  const ao = draft.advancedOptions || emptyAdvancedOptions();
  const visibility = ao.visibility || 'public';

  const updateDetails = (patch) =>
    updateDraft({ classDetails: { ...details, ...patch } });

  const updateSchedule = (patch) =>
    updateDetails({ schedule: { ...schedule, ...patch } });

  const setVisibility = (next) =>
    updateDraft({ advancedOptions: { ...ao, visibility: next } });

  const canContinue =
    Number(details.capacity) > 0 &&
    Boolean(schedule.time) &&
    (schedule.recurrence === 'never'
      ? Boolean(schedule.date)
      : schedule.recurrence === 'monthly' || schedule.recurrence === 'daily' || schedule.recurrence === 'yearly'
        ? true
        : schedule.recurrence === 'custom'
          ? Boolean(schedule.customInterval)
          : (schedule.days?.length > 0));

  return (
    <>
      <ScreenHeader title="" onBack={() => navigate('/new/locations')} rightAction={<HelpTrigger helpKey="classDetails" />} />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pt-2 pb-6">
          <div className="text-[26px] leading-tight font-semibold tracking-tight">Participants & schedule</div>
          <div className="text-[14px] text-gray-500 mt-1">
            Set how many people can join and when this class runs.
          </div>
        </div>

        <div className="space-y-6 pb-6">
          {/* Capacity */}
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="Capacity"
              type="number"
              value={details.capacity}
              onChange={(v) => updateDetails({ capacity: v })}
              placeholder="12"
            />
            <TextField
              label="Minimum"
              type="number"
              value={details.minParticipants}
              onChange={(v) => updateDetails({ minParticipants: v })}
              placeholder="2"
            />
          </div>

          {/* Waitlist */}
          <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4">
            <div className="flex-1">
              <div className="text-[15px] font-medium">Waitlist</div>
              <div className="text-[13px] text-gray-500 mt-0.5">Let clients join when the class is full</div>
            </div>
            <Toggle
              checked={details.waitlistEnabled}
              onChange={(v) => updateDetails({ waitlistEnabled: v })}
            />
          </div>

          {/* Schedule */}
          <ClassScheduleFields schedule={schedule} onChange={updateSchedule} />

          {/* Visibility — segmented control. Public listings are discoverable;
              private classes are accessed via a unique invite link generated
              when the class is published. */}
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Visibility
            </div>
            <div className="grid grid-cols-2 gap-2 bg-gray-50 rounded-2xl p-1">
              {[
                { key: 'public',  label: 'Public' },
                { key: 'private', label: 'Private' },
              ].map(({ key, label }) => {
                const active = visibility === key;
                return (
                  <button
                    key={key}
                    onClick={() => setVisibility(key)}
                    className={
                      'h-10 rounded-xl text-[13px] font-medium transition-colors ' +
                      (active ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100')
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="text-[12px] text-gray-500 mt-2 leading-relaxed">
              {visibility === 'public'
                ? 'Listed on your booking page. Anyone can discover and book it.'
                : 'Not listed. Only clients with the invite link can book.'}
            </div>
          </div>
        </div>
      </div>
      <WizardFooter
        step={3}
        total={wizardTotalFor(draft.type)}
        onBack={() => navigate('/new/locations')}
        onNext={() => navigate('/new/class-staff')}
        nextDisabled={!canContinue}
      />
    </>
  );
}
