// Visibility — public listing vs private invite-link only.
// When set to private, generates a stable URL that the owner can share with
// specific clients. Public is the default and shown on the booking page.

import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Copy, Eye, EyeOff } from 'lucide-react';
import ScreenHeader from '../../../components/ScreenHeader';
import { emptyAdvancedOptions } from '../../../data/advancedOptions';
import { offerBasePath } from '../../routeBase';

const OPTIONS = [
  {
    key: 'public',
    label: 'Public',
    desc: 'Listed on your booking page. Anyone can discover and book it.',
    Icon: Eye,
  },
  {
    key: 'private',
    label: 'Private',
    desc: 'Not listed. Only clients with the invite link can book.',
    Icon: EyeOff,
  },
];

const fakeInviteUrl = (id = 'class') =>
  `https://thattime.app/i/${id}-${Math.random().toString(36).slice(2, 8)}`;

export default function Visibility() {
  const navigate = useNavigate();
  const location = useLocation();
  const { draft, updateDraft } = useOutletContext();
  const ao = draft.advancedOptions || emptyAdvancedOptions();
  const visibility = ao.visibility || 'public';
  const inviteUrl = ao.inviteUrl;
  const returnPath = offerBasePath(draft, location);

  const setVisibility = (next) => {
    const patch = { visibility: next };
    if (next === 'private' && !inviteUrl) {
      patch.inviteUrl = fakeInviteUrl(draft.id);
    }
    updateDraft({ advancedOptions: { ...ao, ...patch } });
  };

  const regenerate = () =>
    updateDraft({
      advancedOptions: { ...ao, inviteUrl: fakeInviteUrl(draft.id) },
    });

  const copy = () => {
    if (inviteUrl) navigator.clipboard?.writeText(inviteUrl).catch(() => {});
  };

  return (
    <>
      <ScreenHeader title="Visibility" onBack={() => navigate(returnPath)} />
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-6 space-y-5">
        <p className="text-[14px] text-gray-500 leading-snug">
          Who can find and book this offer.
        </p>

        <div className="space-y-2">
          {OPTIONS.map(({ key, label, desc, Icon }) => {
            const active = visibility === key;
            return (
              <button
                key={key}
                onClick={() => setVisibility(key)}
                className={
                  'w-full text-left rounded-2xl px-4 py-3 border transition-colors ' +
                  (active
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 hover:bg-gray-50')
                }
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-gray-700" strokeWidth={1.75} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-medium text-gray-900">{label}</div>
                    <div className="text-[12px] text-gray-500 mt-0.5 leading-snug">{desc}</div>
                  </div>
                  <div
                    className={
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ' +
                      (active ? 'border-gray-900' : 'border-gray-300')
                    }
                  >
                    {active && <span className="w-2 h-2 rounded-full bg-gray-900" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {visibility === 'private' && (
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <div className="text-[12px] font-semibold uppercase tracking-wider text-gray-500">
              Invite link
            </div>
            <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5">
              <span className="flex-1 text-[13px] text-gray-700 truncate">
                {inviteUrl || '—'}
              </span>
              <button
                onClick={copy}
                aria-label="Copy"
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <Copy size={14} className="text-gray-500" strokeWidth={1.75} />
              </button>
            </div>
            <button
              onClick={regenerate}
              className="text-[12px] text-gray-500 underline underline-offset-2 hover:text-gray-700"
            >
              Generate a new link
            </button>
            <p className="text-[11px] text-gray-400 leading-snug">
              Anyone with the link can book. Regenerating invalidates the previous link.
            </p>
          </div>
        )}
      </div>

      <div className="px-5 pb-5 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={() => navigate(returnPath)}
          className="w-full h-12 rounded-full bg-gray-900 hover:bg-gray-800 text-white text-[15px] font-medium transition-colors"
        >
          Done
        </button>
      </div>
    </>
  );
}
