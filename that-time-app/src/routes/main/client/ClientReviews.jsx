import { useState } from 'react';
import { Star, Send, Reply } from 'lucide-react';
import { useMainActions } from '../../../components/sheets/MainActionsContext';
import { useClient } from './useClient';
import { SectionHeader, Stars } from './clientShared';

// Reviews — unchanged content from the previous tab, re-homed as a section.
export default function ClientReviews() {
  const { client } = useClient();
  const { showToast } = useMainActions();
  const { average, count, items } = client.reviews;

  const [requested, setRequested] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [replies, setReplies] = useState({});

  const firstName = client.name.split(' ')[0];

  return (
    <>
      <SectionHeader title="Reviews" subtitle={client.name} />

      <div className="flex-1 overflow-y-auto bg-white px-4 pb-8 space-y-3">
        <div className="flex items-center gap-2">
          <Star size={16} className="text-gray-900 fill-gray-900" />
          <span className="text-[16px] font-bold text-gray-900">{average}</span>
          <span className="text-[13px] text-gray-400">{count}</span>
        </div>

        {/* Request a review for unreviewed visits */}
        <div className="border border-gray-200 rounded-2xl px-4 py-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <Star size={15} className="text-gray-700" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold text-gray-900">1 visit without a review</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Cut & Blow Dry · 20 Jan 2026</div>
          </div>
          {requested ? (
            <span className="shrink-0 text-[12px] font-medium text-gray-400">Requested</span>
          ) : (
            <button
              onClick={() => {
                setRequested(true);
                showToast(`Review request sent to ${firstName}`);
              }}
              className="shrink-0 bg-gray-900 text-white rounded-full px-3.5 py-2 text-[12px] font-semibold hover:bg-gray-800 transition-colors"
            >
              Request review
            </button>
          )}
        </div>

        {items.map((review) => (
          <div key={review.id} className="bg-gray-50 rounded-2xl px-4 py-4">
            <div className="flex items-center gap-2.5">
              <Stars count={review.stars} />
              <span className="text-[11px] text-gray-400">{review.date}</span>
            </div>
            <div className="text-[14px] text-gray-900 mt-2.5 leading-snug">{review.text}</div>
            <div className="text-[12px] text-gray-400 mt-2">{review.service}</div>

            {replies[review.id] ? (
              <div className="mt-3 border-l-2 border-gray-200 pl-3">
                <div className="text-[12px] text-gray-900 leading-snug">{replies[review.id]}</div>
                <div className="text-[10px] text-gray-400 mt-1">Your reply · shows on your page</div>
              </div>
            ) : replyingTo === review.id ? (
              <div className="flex items-center gap-2 mt-3">
                <input
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  placeholder="Write a public reply…"
                  autoFocus
                  className="flex-1 bg-white border border-gray-200 rounded-full px-4 h-10 text-[13px] text-gray-900 placeholder-gray-400 outline-none min-w-0"
                />
                <button
                  onClick={() => {
                    if (!replyDraft.trim()) return;
                    setReplies((r) => ({ ...r, [review.id]: replyDraft.trim() }));
                    setReplyDraft('');
                    setReplyingTo(null);
                    showToast('Reply posted to your page');
                  }}
                  className="shrink-0 w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center"
                  aria-label="Post reply"
                >
                  <Send size={14} strokeWidth={1.75} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setReplyingTo(review.id)}
                className="flex items-center gap-1.5 text-[12px] font-medium text-gray-500 hover:text-gray-900 mt-3"
              >
                <Reply size={13} strokeWidth={1.75} />
                Reply
              </button>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center text-[13px] text-gray-400 py-8">No reviews yet</div>
        )}
      </div>
    </>
  );
}
