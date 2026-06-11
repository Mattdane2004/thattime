import { useNavigate, useOutletContext } from 'react-router-dom';
import { Store, Car, Video } from 'lucide-react';
import Toggle from './Toggle';
import { businessLocations, remotePlatforms } from '../data/business';

const ALL_TYPES = [
  { key: 'inSalon', label: 'In-salon', desc: 'At a fixed location', Icon: Store },
  { key: 'mobile', label: 'Mobile', desc: 'Stylist travels to client', Icon: Car },
  { key: 'remote', label: 'Remote', desc: 'Video call or online', Icon: Video },
];

const CLASS_TYPES = [
  { key: 'inSalon', label: 'In-person', desc: 'At a studio or venue', Icon: Store },
  { key: 'remote', label: 'Online / Virtual', desc: 'Live stream or recorded class', Icon: Video },
];

export default function LocationCards({ onEdit }) {
  const navigate = useNavigate();
  const { draft, updateDraft } = useOutletContext();
  const isClass = draft.type === 'class';
  const types = isClass ? CLASS_TYPES : ALL_TYPES;

  const setEnabled = (key, enabled) =>
    updateDraft({
      locations: { ...draft.locations, [key]: { ...draft.locations[key], enabled } },
    });

  return (
    <div className="space-y-3">
      {types.map(({ key, label, desc, Icon }) => {
        const loc = draft.locations[key];
        const summary = summaryFor(key, loc);
        const isVirtual = key === 'remote' && isClass;
        return (
          <div key={key} className="bg-gray-50 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                <Icon size={18} className="text-gray-700" strokeWidth={1.75} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-medium">{label}</div>
                <div className="text-[13px] text-gray-500 mt-0.5 truncate">{desc}</div>
              </div>
              <Toggle checked={loc.enabled} onChange={(v) => setEnabled(key, v)} />
            </div>
            {loc.enabled && (
              <div className="border-t border-white px-4 py-3 space-y-2">
                <div className="flex items-center gap-3">
                  <div className={'flex-1 text-[13px] truncate ' + (summary ? 'text-gray-700' : 'text-gray-400')}>
                    {summary || 'Not configured'}
                  </div>
                  <button
                    onClick={() => onEdit(key)}
                    className="px-3 py-1.5 rounded-full bg-white text-[12px] font-medium text-gray-900 hover:bg-gray-100"
                  >
                    Edit settings
                  </button>
                </div>
                {isVirtual && (
                  <button
                    onClick={() => navigate('/service/class-tickets')}
                    className="w-full text-left text-[12px] text-gray-500 leading-snug hover:text-gray-900 transition-colors"
                  >
                    To charge a different price for online attendees, set an Online ticket type →
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Mobile disabled notice for classes */}
      {isClass && (
        <div className="flex items-start gap-3 px-1 pt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
          <p className="text-[12px] text-gray-400 leading-snug">
            Mobile is not available for classes — clients attend at a fixed venue or online.
          </p>
        </div>
      )}
    </div>
  );
}

function summaryFor(key, loc) {
  if (key === 'inSalon') {
    const ids = loc.locationIds || [];
    if (ids.length === 0) return null;
    if (ids.length === businessLocations.length) return 'All locations';
    if (ids.length <= 2) {
      return ids.map((id) => businessLocations.find((l) => l.id === id)?.name).filter(Boolean).join(' · ');
    }
    const first = businessLocations.find((l) => l.id === ids[0])?.name || '';
    return `${first} + ${ids.length - 1} more`;
  }
  if (key === 'mobile') {
    if (!loc.radiusMiles) return null;
    const fee = loc.feeType === 'flat' ? `£${loc.feeAmount} flat fee` : `£${loc.feeAmount}/mile`;
    return `${loc.radiusMiles} miles · ${fee} · ${loc.noticeValue}${loc.noticeUnit?.[0] || 'h'} notice`;
  }
  if (key === 'remote') {
    const p = loc.platforms || [];
    if (p.length === 0) return null;
    if (p.length <= 2) {
      return p.map((k) => remotePlatforms.find((x) => x.key === k)?.label).filter(Boolean).join(' · ');
    }
    return `${p.length} platforms`;
  }
  return null;
}
