import { useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import ScreenHeader from '../../../components/ScreenHeader';
import TextField from '../../../components/TextField';
import Toggle from '../../../components/Toggle';
import { deliveryTargets, isPublicClass } from '../../../data/classFlow';
import { emptyClassDetails } from '../../../data/offerTypes';

const DEFAULT_BOOKING_SETTINGS = emptyClassDetails().bookingSettings;

const SAMPLE_STUDENTS = [
  { name: 'Maya Patel', note: 'Paid in full', status: 'Checked in' },
  { name: 'Theo Clarke', note: 'Deposit paid', status: 'Booked' },
  { name: 'Isla Morgan', note: 'Awaiting waiver', status: 'Action needed' },
  { name: 'Sofia Khan', note: 'Model consent attached', status: 'Booked' },
];

export default function BookingsAttendees() {
  const navigate = useNavigate();
  const { draft, updateDraft } = useOutletContext();
  const details = draft.classDetails || emptyClassDetails();
  const settings = {
    ...DEFAULT_BOOKING_SETTINGS,
    ...(details.bookingSettings || {}),
  };
  const isPublic = isPublicClass(details.format);
  const sessions = useMemo(() => sessionPreview(draft, details), [draft, details]);
  const capacity = Number(details.capacity) || Number(details.hybridSeats?.inPerson) || 12;
  const booked = isPublic ? sessions.reduce((total, session) => total + session.booked, 0) : 2;

  const updateSettings = (patch) =>
    updateDraft({
      classDetails: {
        ...details,
        bookingSettings: { ...settings, ...patch },
      },
    });

  return (
    <>
      <ScreenHeader title="Bookings & attendees" onBack={() => navigate('/class')} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 space-y-5">
        <div className="grid grid-cols-3 gap-2">
          <SummaryCard label={isPublic ? 'Sessions' : 'Requests'} value={isPublic ? sessions.length || 0 : 2} />
          <SummaryCard label="Students" value={booked} />
          <SummaryCard label={isPublic ? 'Capacity' : 'Group size'} value={isPublic ? capacity : groupSize(details)} />
        </div>

        {isPublic ? (
          <section>
            <SectionTitle
              title="Session roster"
              desc="Use this to monitor students across the live course dates."
            />
            <div className="space-y-2">
              {sessions.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="No sessions yet"
                  body="Add course dates in Schedule before bookings can be grouped by session."
                />
              ) : (
                sessions.map((session) => (
                  <div key={session.id} className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-medium text-gray-500">{session.day}</span>
                        <span className="text-[13px] font-semibold text-gray-900">{session.dayNumber}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-medium text-gray-900 truncate">
                          {session.label} · {session.time}
                        </div>
                        <div className="text-[12px] text-gray-500 mt-0.5">
                          {session.booked}/{capacity} students booked
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-full bg-white text-[11px] font-medium text-gray-600">
                        {session.booked >= capacity ? 'Full' : 'Open'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        ) : (
          <section>
            <SectionTitle
              title="Private group bookings"
              desc="Private courses use instructor calendars. Keep roster and group controls here."
            />
            <div className="space-y-2">
              {[
                ['Soho salon training day', '4 students · requested Sarah'],
                ['Brand team practical workshop', '6 students · date pending'],
              ].map(([title, meta]) => (
                <div key={title} className="bg-gray-50 rounded-2xl p-4">
                  <div className="text-[14px] font-medium text-gray-900">{title}</div>
                  <div className="text-[12px] text-gray-500 mt-0.5">{meta}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionTitle title="Attendee controls" desc="Set the operational rules for the course roster." />
          <div className="bg-gray-50 rounded-2xl overflow-hidden">
            <SettingRow
              title="Student check-in"
              desc="Mark students as arrived on the day."
              checked={settings.checkInEnabled}
              onChange={(value) => updateSettings({ checkInEnabled: value })}
            />
            <SettingRow
              title="Message booked students"
              desc="Keep a message draft ready for schedule changes or reminders."
              checked={settings.messageStudentsEnabled}
              onChange={(value) => updateSettings({ messageStudentsEnabled: value })}
            />
            <SettingRow
              title="Collect emergency contact"
              desc="Ask for a contact before the training starts."
              checked={settings.collectEmergencyContact}
              onChange={(value) => updateSettings({ collectEmergencyContact: value })}
            />
            <SettingRow
              title="Allow student substitution"
              desc="Let the booker swap a student before the course."
              checked={settings.allowStudentSubstitution}
              onChange={(value) => updateSettings({ allowStudentSubstitution: value })}
            />
          </div>
        </section>

        <section className="space-y-4">
          <TextField
            label="Roster notes"
            value={settings.rosterNotes}
            onChange={(value) => updateSettings({ rosterNotes: value })}
            rows={4}
            placeholder="Internal notes for the course team"
          />
          {settings.messageStudentsEnabled && (
            <TextField
              label="Student message draft"
              value={settings.messageDraft}
              onChange={(value) => updateSettings({ messageDraft: value })}
              rows={4}
              placeholder="e.g. Please arrive 15 minutes early and bring photo ID."
            />
          )}
        </section>

        <section>
          <SectionTitle title="Student list preview" desc="This uses booking data once the course is live." />
          <div className="bg-gray-50 rounded-2xl overflow-hidden">
            {SAMPLE_STUDENTS.map((student, index) => (
              <div key={student.name} className={'flex items-center gap-3 p-4 ' + (index > 0 ? 'border-t border-white' : '')}>
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[11px] font-semibold text-gray-700 shrink-0">
                  {initials(student.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-gray-900 truncate">{student.name}</div>
                  <div className="text-[12px] text-gray-500 truncate">{student.note}</div>
                </div>
                <span className="text-[11px] text-gray-500 shrink-0">{student.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate('/class')}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done
        </button>
      </div>
    </>
  );
}

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-3">
      <div className="text-[11px] text-gray-500">{label}</div>
      <div className="text-[17px] font-semibold text-gray-900 mt-0.5 truncate">{value}</div>
    </div>
  );
}

function SectionTitle({ title, desc }) {
  return (
    <div className="mb-3">
      <div className="text-[12px] font-semibold uppercase tracking-wider text-gray-500">{title}</div>
      <div className="text-[13px] text-gray-500 mt-1 leading-snug">{desc}</div>
    </div>
  );
}

function SettingRow({ title, desc, checked, onChange }) {
  return (
    <div className="flex items-center gap-4 p-4 border-t border-white first:border-t-0">
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-medium text-gray-900">{title}</div>
        <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">{desc}</div>
      </div>
      <Toggle checked={Boolean(checked)} onChange={onChange} />
    </div>
  );
}

function EmptyState({ icon, title, body }) {
  const Icon = icon;
  return (
    <div className="bg-gray-50 rounded-2xl p-5 text-center">
      <div className="w-12 h-12 rounded-2xl bg-white mx-auto flex items-center justify-center mb-3">
        <Icon size={19} className="text-gray-600" strokeWidth={1.75} />
      </div>
      <div className="text-[15px] font-medium text-gray-900">{title}</div>
      <div className="text-[13px] text-gray-500 mt-1 leading-snug">{body}</div>
    </div>
  );
}

function sessionPreview(draft, details) {
  const explicit = (details.courseSessions || []).filter((session) => session.date && session.startTime && session.status !== 'cancelled');
  const blocks = (details.scheduleBlocks || []).filter((block) => block.time && (block.days || []).length > 0);
  const capacity = Number(details.capacity) || Number(details.hybridSeats?.inPerson) || 12;
  const today = new Date();
  const targets = deliveryTargets(draft, 'public').length || 1;
  if (explicit.length > 0) {
    return explicit.slice(0, 5).map((session, index) => {
      const date = new Date(`${session.date}T00:00:00`);
      return {
        id: session.id,
        day: date.toLocaleDateString('en-GB', { weekday: 'short' }),
        dayNumber: String(date.getDate()),
        label: date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
        time: `${session.startTime || '09:00'}-${session.endTime || '10:00'}`,
        booked: Math.min(capacity, Math.max(1, (index + targets + 2) % (capacity + 1))),
      };
    });
  }
  return blocks.slice(0, 3).map((block, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + (index + 1) * 7);
    const day = (block.days || [])[0] || 'Mon';
    return {
      id: block.id || index,
      day,
      dayNumber: String(date.getDate()),
      label: `${day} course block ${index + 1}`,
      time: block.time || '09:00',
      booked: Math.min(capacity, Math.max(1, (index + targets + 2) % (capacity + 1))),
    };
  });
}

function groupSize(details) {
  const party = details.partySize || {};
  if (!party.min || !party.max) return 'Not set';
  return `${party.min}-${party.max}`;
}

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
