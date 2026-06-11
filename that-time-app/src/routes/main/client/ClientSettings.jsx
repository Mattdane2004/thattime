import { useState } from 'react';
import { Chip } from '../../../components/sheets/SheetShell';
import { useMainActions } from '../../../components/sheets/MainActionsContext';
import { useClient } from './useClient';
import { SectionHeader, MiniToggle } from './clientShared';

// Settings — unchanged content from the previous tab, re-homed as a section.
export default function ClientSettings() {
  const { client } = useClient();
  const { showToast } = useMainActions();

  const [payment, setPayment] = useState(['Card', 'Cash']);
  const [marketing, setMarketing] = useState({ Email: true, SMS: false, WhatsApp: true });
  const [reminder, setReminder] = useState('24h before');
  const [quietHours, setQuietHours] = useState(true);
  const [restrict, setRestrict] = useState(true);
  const [slots, setSlots] = useState(['After 13:00', 'Thursdays']);
  const [policy, setPolicy] = useState('Standard');

  const togglePayment = (p) =>
    setPayment((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));
  const toggleSlot = (s) =>
    setSlots((x) => (x.includes(s) ? x.filter((y) => y !== s) : [...x, s]));

  return (
    <>
      <SectionHeader title="Settings" subtitle={client.name} />

      <div className="flex-1 overflow-y-auto bg-white px-4 pb-8 space-y-3">
        <div className="text-[12px] text-gray-400">
          Preferences for {client.name} — saved automatically.
        </div>

        <div className="bg-gray-50 rounded-2xl px-4 py-4">
          <div className="text-[13px] font-semibold text-gray-900 mb-1">Payment preference</div>
          <div className="text-[11px] text-gray-400 mb-3">How this client is allowed to pay</div>
          <div className="flex flex-wrap gap-2">
            {['Card', 'Cash', 'Finance'].map((p) => (
              <Chip key={p} selected={payment.includes(p)} onClick={() => togglePayment(p)}>
                {p}
              </Chip>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl px-4 py-4">
          <div className="text-[13px] font-semibold text-gray-900 mb-3">Marketing preference</div>
          {Object.entries(marketing).map(([channel, on]) => (
            <div key={channel} className="flex items-center justify-between py-2">
              <span className="text-[13px] text-gray-900">{channel} marketing</span>
              <MiniToggle
                on={on}
                onChange={(v) => {
                  setMarketing((m) => ({ ...m, [channel]: v }));
                  showToast(`${channel} marketing ${v ? 'on' : 'off'}`);
                }}
              />
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-2xl px-4 py-4">
          <div className="text-[13px] font-semibold text-gray-900 mb-1">Notification preference</div>
          <div className="text-[11px] text-gray-400 mb-3">When reminders go out</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {['24h before', '48h before', 'Morning of'].map((r) => (
              <Chip key={r} selected={reminder === r} onClick={() => setReminder(r)}>
                {r}
              </Chip>
            ))}
          </div>
          <div className="flex items-center justify-between py-1">
            <div>
              <div className="text-[13px] text-gray-900">Quiet hours</div>
              <div className="text-[11px] text-gray-400">Only notify between 09:00 – 18:00</div>
            </div>
            <MiniToggle on={quietHours} onChange={setQuietHours} />
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl px-4 py-4">
          <div className="flex items-center justify-between mb-1">
            <div className="text-[13px] font-semibold text-gray-900">Booking restrictions</div>
            <MiniToggle on={restrict} onChange={setRestrict} />
          </div>
          <div className="text-[11px] text-gray-400 mb-3">
            Limit which slots this client can see and book
          </div>
          {restrict && (
            <>
              <div className="flex flex-wrap gap-2">
                {['After 13:00', 'Before 12:00', 'Thursdays', 'Weekends only'].map((s) => (
                  <Chip key={s} selected={slots.includes(s)} onClick={() => toggleSlot(s)}>
                    {s}
                  </Chip>
                ))}
              </div>
              {slots.length > 0 && (
                <div className="text-[11px] text-gray-500 mt-3 bg-white border border-gray-100 rounded-xl px-3 py-2.5">
                  {client.name.split(' ')[0]} will only see slots {slots.join(' · ').toLowerCase()}.
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-gray-50 rounded-2xl px-4 py-4">
          <div className="text-[13px] font-semibold text-gray-900 mb-1">Cancellation policy</div>
          <div className="text-[11px] text-gray-400 mb-3">Applied to this client's bookings</div>
          <div className="flex flex-wrap gap-2">
            {['Flexible', 'Standard', 'Strict · 50% fee'].map((p) => (
              <Chip key={p} selected={policy === p} onClick={() => setPolicy(p)}>
                {p}
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
