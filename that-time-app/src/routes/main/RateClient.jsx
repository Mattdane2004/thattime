import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import Home from './Home';

const NOTE_CHIPS = [
  'Punctual',
  'Quite',
  'Late arrival',
  'No-show',
  'Easy to work with',
  'Needs extra time',
  'Talkative',
];

// "Rate your Client" sheet — Figma frame 9844:15847. Renders over Home, opened
// after marking a booking complete.
export default function RateClient() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientName = searchParams.get('name') || 'Emily Davis';
  const [stars, setStars] = useState(0);
  const [chips, setChips] = useState([]);
  const [note, setNote] = useState('');

  const toggleChip = (chip) =>
    setChips((c) => (c.includes(chip) ? c.filter((x) => x !== chip) : [...c, chip]));

  return (
    <>
      <Home />
      <div className="absolute inset-0 z-30">
        <div className="absolute inset-0 bg-black/30" onClick={() => navigate(-1)} />
        <div className="absolute left-0 right-0 bottom-0 top-[176px] bg-white rounded-t-3xl flex flex-col">
          <div className="flex justify-center pt-2.5">
            <div className="w-10 h-1 rounded-full bg-gray-200" />
          </div>
          <div className="flex-1 overflow-y-auto px-5 pt-3 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[18px] font-bold text-gray-900">Rate your Client</div>
                <div className="text-[13px] text-gray-500 mt-0.5">{clientName}</div>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="text-[13px] text-gray-500 hover:text-gray-900 pt-1"
              >
                Skip
              </button>
            </div>

            <div className="flex justify-center gap-3 mt-6 mb-8">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setStars(n)} aria-label={`${n} stars`}>
                  <Star
                    size={38}
                    strokeWidth={1.25}
                    className={n <= stars ? 'text-gray-900 fill-gray-900' : 'text-gray-300'}
                  />
                </button>
              ))}
            </div>

            <div className="text-[14px] text-gray-400 mb-3">Anything to note?</div>
            <div className="flex flex-wrap gap-2.5">
              {NOTE_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => toggleChip(chip)}
                  className={
                    'rounded-full px-4 py-2.5 text-[13px] font-medium border transition-colors ' +
                    (chips.includes(chip)
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50')
                  }
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="bg-gray-50 rounded-2xl px-4 pt-3.5 pb-2 mt-6">
              <div className="text-[12px] font-medium text-gray-500 mb-1">Add a private note</div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything the team should know before their next visit..."
                rows={2}
                className="w-full bg-transparent text-[14px] text-gray-900 placeholder-gray-400 outline-none resize-none"
              />
            </div>
          </div>

          <div className="px-5 pb-6 shrink-0">
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-gray-900 text-white rounded-full py-4 text-[14px] font-semibold hover:bg-gray-800 transition-colors"
            >
              Submit Rating
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
