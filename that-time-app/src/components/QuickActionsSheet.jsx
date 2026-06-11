import { useNavigate } from 'react-router-dom';
import { CalendarPlus, UserPlus, Clock, PoundSterling } from 'lucide-react';
import { useMainActions } from './sheets/MainActionsContext';

// "Quick Actions" sheet opened from the Add tab — Figma frame 8978:28305.
// Each item launches its real flow sheet via MainActions.
const ACTIONS = [
  { icon: CalendarPlus, label: 'Add New Appointment', desc: 'Schedule a new booking', type: 'appointment' },
  { icon: UserPlus, label: 'Add New Client', desc: 'Register a new customer', type: 'client' },
  { icon: Clock, label: 'Block Time', desc: 'Block time in your calendar', type: 'block' },
  { icon: PoundSterling, label: 'Take Payment', desc: 'Open the checkout till', to: '/checkout' },
];

export default function QuickActionsSheet({ open, onClose }) {
  const navigate = useNavigate();
  const { openAction } = useMainActions();
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-20 bottom-[72px]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl px-4 pt-6 pb-6">
        <div className="text-[18px] font-bold text-gray-900 text-center mb-5">Quick Actions</div>
        <div className="space-y-3">
          {ACTIONS.map(({ icon: Icon, label, desc, type, to }) => (
            <button
              key={label}
              onClick={() => {
                onClose();
                if (to) navigate(to);
                else openAction(type);
              }}
              className="w-full flex items-center gap-3.5 bg-white border border-gray-100 rounded-2xl px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-gray-900" strokeWidth={1.75} />
              </div>
              <div className="min-w-0">
                <div className="text-[14px] font-semibold text-gray-900">{label}</div>
                <div className="text-[12px] text-gray-500">{desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
