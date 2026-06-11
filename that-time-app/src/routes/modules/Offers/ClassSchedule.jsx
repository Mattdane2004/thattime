import { useNavigate, useOutletContext } from 'react-router-dom';
import ScreenHeader from '../../../components/ScreenHeader';
import TextField from '../../../components/TextField';
import Toggle from '../../../components/Toggle';
import ClassScheduleFields from '../../../components/ClassScheduleFields';
import { emptyClassDetails } from '../../../data/offerTypes';

export default function ClassSchedule() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useOutletContext();
  const details = draft.classDetails || emptyClassDetails();
  const schedule = details.schedule || emptyClassDetails().schedule;

  const updateDetails = (patch) =>
    updateDraft({ classDetails: { ...details, ...patch } });

  const updateSchedule = (patch) =>
    updateDetails({ schedule: { ...schedule, ...patch } });

  return (
    <>
      <ScreenHeader title="Sessions & timetable" onBack={() => navigate('/service')} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 space-y-6">

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

      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate('/service')}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done
        </button>
      </div>
    </>
  );
}
