import { useState } from 'react';
import SheetShell, { SheetCta, Chip, SheetSectionLabel } from './SheetShell';
import DayPicker from './DayPicker';
import { dayLabel, CURRENT_MONTH, timeSlots, busySlots } from '../../data/bookingOptions';

// Date + time picker sheet used wherever a booking gets moved — Up Next card,
// client profile, conversation "Select a date", booking details.
export default function RescheduleSheet({ open, onClose, title = 'Reschedule', subtitle, onDone }) {
  const [day, setDay] = useState(null);
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [time, setTime] = useState(null);

  const reset = () => {
    setDay(null);
    setMonth(CURRENT_MONTH);
    setTime(null);
  };

  return (
    <SheetShell
      open={open}
      onClose={() => {
        reset();
        onClose();
      }}
      title={title}
      subtitle={subtitle}
      footer={
        <SheetCta
          disabled={!day || !time}
          onClick={() => {
            onDone(dayLabel(day, month), time, day, month);
            reset();
            onClose();
          }}
        >
          {day && time ? `Confirm · ${dayLabel(day, month)}, ${time}` : 'Confirm new time'}
        </SheetCta>
      }
    >
      <SheetSectionLabel>Pick a day</SheetSectionLabel>
      <DayPicker
        selected={day}
        selectedMonth={month}
        onSelect={(d, m) => {
          setDay(d);
          setMonth(m);
        }}
      />
      <SheetSectionLabel>Pick a time</SheetSectionLabel>
      <div className="flex flex-wrap gap-2">
        {timeSlots.map((slot) => (
          <Chip
            key={slot}
            selected={time === slot}
            disabled={busySlots.includes(slot)}
            onClick={() => setTime(slot)}
          >
            {slot}
          </Chip>
        ))}
      </div>
      <div className="text-[11px] text-gray-400 mt-3">Greyed-out times are already booked.</div>
    </SheetShell>
  );
}
