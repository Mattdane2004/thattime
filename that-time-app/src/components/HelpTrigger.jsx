import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import BottomSheet from './BottomSheet';
import { helpContent } from '../data/helpContent';

/**
 * Trigger + sheet combo. Renders a question-mark icon button in the header's
 * rightAction slot. Tapping opens a bottom sheet with a summary and deeper
 * sections for the given helpKey.
 */
export default function HelpTrigger({ helpKey }) {
  const [open, setOpen] = useState(false);
  const content = helpContent[helpKey];

  if (!content) {
    // Fail silently in dev — missing key should just not render.
    if (typeof window !== 'undefined' && window.console) {
      // eslint-disable-next-line no-console
      console.warn(`HelpTrigger: no helpContent for key "${helpKey}"`);
    }
    return null;
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="-mr-2 w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500"
        aria-label="Help"
      >
        <HelpCircle size={18} strokeWidth={1.75} />
      </button>

      <BottomSheet open={open} onClose={() => setOpen(false)} title={content.title}>
        <div className="space-y-5">
          <div className="text-[14px] text-gray-700 leading-relaxed">{content.summary}</div>
          {content.sections && content.sections.length > 0 && (
            <div className="space-y-3">
              {content.sections.map((s) => (
                <div key={s.heading} className="bg-gray-50 rounded-2xl px-4 py-3">
                  <div className="text-[13px] font-semibold text-gray-900">{s.heading}</div>
                  <div className="text-[13px] text-gray-600 mt-1 leading-relaxed">{s.body}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </BottomSheet>
    </>
  );
}
