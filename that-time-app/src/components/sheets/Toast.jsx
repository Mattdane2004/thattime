import { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';

// Small confirmation toast shown above the tab bar after inline actions.
export default function Toast({ message, onDone }) {
  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [message, onDone]);

  if (!message) return null;

  // Anchored to the top of the phone so it never covers sheet/modal buttons,
  // and z-50 so it always renders above open bottom sheets.
  return (
    <div className="absolute left-4 right-4 top-4 z-50 flex justify-center pointer-events-none">
      <div className="flex items-center gap-2 bg-gray-900 text-white rounded-full pl-3.5 pr-4 py-3 shadow-lg">
        <CheckCircle2 size={15} strokeWidth={2} className="shrink-0" />
        <span className="text-[13px] font-medium">{message}</span>
      </div>
    </div>
  );
}
