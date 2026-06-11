import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import ScreenHeader from '../../components/ScreenHeader';
import HelpTrigger from '../../components/HelpTrigger';
import WizardFooter from '../../components/WizardFooter';
import TextField from '../../components/TextField';
import Toggle from '../../components/Toggle';
import ProductSelect from '../../components/ProductSelect';
import { emptyClassDetails, wizardTotalForDraft } from '../../data/offerTypes';
import { hasValidPrivateGroupSize, hasValidPublicParticipants, isPrivateGroupClass, isSeatBasedClass } from '../../data/classFlow';

export default function ClassParticipants() {
  const navigate = useNavigate();
  const route = useLocation();
  const { draft, updateDraft } = useOutletContext();
  const isDashboardEdit = route.pathname === '/class/attendees';
  const details = draft.classDetails || emptyClassDetails();
  const seatBased = isSeatBasedClass(details);
  const privateGroup = isPrivateGroupClass(details);
  const partySize = details.partySize || { min: 1, max: 1 };
  const autoCancelBeforeStart = details.autoCancelBeforeStart || { value: '24', unit: 'hours' };
  const updateClass = (patch) => updateDraft({ classDetails: { ...details, ...patch } });
  const canContinue = seatBased ? hasValidPublicParticipants(details) : hasValidPrivateGroupSize(details);

  const setBookingStructure = (bookingStructure) => {
    updateClass({
      bookingStructure,
      format: bookingStructure === 'private_group' ? 'private' : 'public',
    });
  };

  return (
    <>
      <ScreenHeader
        title=""
        onBack={() => navigate(isDashboardEdit ? '/class' : '/new/basics')}
        rightAction={<HelpTrigger helpKey="participants" />}
      />
      <div className="flex-1 overflow-y-auto px-5">
        <div className="pt-2 pb-6">
          <div className="text-[26px] leading-tight font-semibold tracking-tight">
            Attendees
          </div>
          <div className="text-[14px] text-gray-500 mt-1">
            Choose how people join, then set the minimum and maximum class size.
          </div>
        </div>

        <div className="space-y-6 pb-6">
          <section className="space-y-3">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-gray-500">
              Class type
            </div>
            <div className="grid grid-cols-2 gap-1.5 bg-gray-50 rounded-xl p-1">
              <SegmentButton active={seatBased} onClick={() => setBookingStructure('seat_based')}>
                Public group
              </SegmentButton>
              <SegmentButton active={privateGroup} onClick={() => setBookingStructure('private_group')}>
                Private booking
              </SegmentButton>
            </div>
            <div className="text-[12px] text-gray-500 leading-snug">
              {seatBased
                ? 'People book individual seats. Best for courses, workshops, yoga and group sessions.'
                : 'One client books the whole class for their own group.'}
            </div>
          </section>

          {seatBased && (
            <section className="space-y-4">
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-wider text-gray-500">Group size</div>
                <div className="text-[12px] text-gray-500 mt-1">Set the smallest class you will run and the total number of seats.</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Minimum attendees" type="number" value={details.minParticipants} onChange={(minParticipants) => updateClass({ minParticipants })} placeholder="1" />
                <TextField label="Maximum seats" type="number" value={details.capacity} onChange={(capacity) => updateClass({ capacity })} placeholder="12" />
              </div>

              <div className="rounded-2xl bg-gray-50 p-4 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="text-[15px] font-medium text-gray-900">Auto-cancel if minimum is not met</div>
                    <div className="text-[12px] text-gray-500 mt-1 leading-snug">
                      If fewer than {details.minParticipants || 1} people have booked, cancel the class automatically before it starts.
                    </div>
                  </div>
                  <Toggle
                    checked={details.autoCancelIfBelowMin}
                    onChange={(autoCancelIfBelowMin) => updateClass({ autoCancelIfBelowMin })}
                  />
                </div>

                {details.autoCancelIfBelowMin && (
                  <div className="grid grid-cols-[1fr_1.1fr] gap-3">
                    <TextField
                      label="Cancel"
                      type="number"
                      value={autoCancelBeforeStart.value}
                      onChange={(value) => updateClass({ autoCancelBeforeStart: { ...autoCancelBeforeStart, value } })}
                      placeholder="24"
                    />
                    <SelectField
                      label="Before class"
                      value={autoCancelBeforeStart.unit}
                      onChange={(unit) => updateClass({ autoCancelBeforeStart: { ...autoCancelBeforeStart, unit } })}
                      options={[
                        { key: 'hours', label: 'Hours before' },
                        { key: 'days', label: 'Days before' },
                      ]}
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          {privateGroup && (
            <section className="space-y-4">
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-wider text-gray-500">Private group size</div>
                <div className="text-[12px] text-gray-500 mt-1">Set the group size one client can book for.</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Minimum group" type="number" value={partySize.min} onChange={(min) => updateClass({ partySize: { ...partySize, min } })} placeholder="1" />
                <TextField label="Maximum group" type="number" value={partySize.max} onChange={(max) => updateClass({ partySize: { ...partySize, max } })} placeholder="8" />
              </div>
            </section>
          )}
        </div>
      </div>

      <WizardFooter
        step={2}
        total={wizardTotalForDraft(draft)}
        onBack={() => navigate(isDashboardEdit ? '/class' : '/new/basics')}
        onNext={() => navigate(isDashboardEdit ? '/class' : '/new/class-schedule')}
        nextLabel={isDashboardEdit ? 'Done' : 'Next'}
        nextDisabled={!canContinue}
      />
    </>
  );
}

function SegmentButton({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        'h-10 rounded-lg text-[13px] font-medium transition-colors ' +
        (active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700')
      }
    >
      {children}
    </button>
  );
}

function SelectField({ label, value, options, onChange }) {
  return <ProductSelect label={label} value={value} options={options} onChange={onChange} buttonClassName="bg-white" />;
}
