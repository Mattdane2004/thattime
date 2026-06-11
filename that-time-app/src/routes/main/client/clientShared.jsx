import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Star } from 'lucide-react';

// Header for section screens — back always returns to the profile index.
export function SectionHeader({ title, subtitle }) {
  const navigate = useNavigate();
  const { clientId } = useParams();

  return (
    <div className="shrink-0 bg-white flex items-center px-4 h-14">
      <button
        onClick={() => navigate(`/clients/${clientId}`)}
        className="-ml-2 w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100"
        aria-label="Back to profile"
      >
        <ChevronLeft size={22} />
      </button>
      <div className="ml-1 min-w-0">
        <div className="text-[16px] font-bold text-gray-900 truncate">{title}</div>
        {subtitle && <div className="text-[11px] text-gray-400">{subtitle}</div>}
      </div>
    </div>
  );
}

export function Stars({ count, size = 13 }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={n <= count ? 'text-gray-900 fill-gray-900' : 'text-gray-300'}
        />
      ))}
    </span>
  );
}

export function MiniToggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={
        'rounded-full p-0.5 transition-colors shrink-0 ' + (on ? 'bg-gray-900' : 'bg-gray-200')
      }
      style={{ width: 44, height: 26 }}
      role="switch"
      aria-checked={on}
    >
      <span
        className={
          'block bg-white rounded-full transition-transform ' +
          (on ? 'translate-x-[18px]' : 'translate-x-0')
        }
        style={{ width: 22, height: 22 }}
      />
    </button>
  );
}

