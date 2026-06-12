"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, Star, Send, Check } from "lucide-react";
import { Sheet, DarkButton } from "@/components/app/ui";
import { clientReviews } from "@/lib/data/product";

// Client reviews — a dedicated page (was a bottom sheet). Summary up top,
// replies inline, ask-for-review one tap away.

function Stars({ n, size = 13 }: { n: number; size?: number }) {
  return (
    <span className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= n ? "fill-navy text-navy" : "text-border"} />
      ))}
    </span>
  );
}

export default function ClientReviewsPage() {
  const params = useParams<{ id: string }>();
  const clientId = params?.id ?? "sarah";

  const [replyFor, setReplyFor] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [replyDraft, setReplyDraft] = useState("");
  const [askReview, setAskReview] = useState(false);
  const [askSent, setAskSent] = useState(false);

  const awaiting = clientReviews.filter((r) => !replies[r.id]).length;

  return (
    <div className="min-h-full bg-fog pb-6">
      <div className="bg-white px-4 pb-4 pt-4">
        <Link href={`/app/clients/${clientId}`} aria-label="Back to profile" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full text-navy hover:bg-canvas">
          <ChevronLeft size={22} strokeWidth={2} />
        </Link>
        <h1 className="pt-1 text-[24px] font-bold text-navy">Reviews</h1>
        <p className="pt-0.5 text-[13px] text-muted">Sarah Johnson · what she says about you</p>
      </div>

      <div className="flex flex-col gap-5 px-4 pt-4">
        {/* Summary */}
        <div className="flex items-center gap-5 rounded-3xl bg-white p-5 shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
          <span>
            <span className="block text-[34px] font-bold leading-none text-navy">4.7</span>
            <span className="block pt-1.5"><Stars n={5} size={12} /></span>
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold text-navy">3 reviews</span>
            <span className="block pt-0.5 text-[12px] text-muted">
              {awaiting > 0 ? `${awaiting} awaiting a reply` : "All replied — nice"}
            </span>
          </span>
          <button
            onClick={() => { setAskSent(false); setAskReview(true); }}
            className="shrink-0 rounded-full bg-[#14181F] px-3.5 py-2 text-[12px] font-semibold text-white"
          >
            Ask for a review
          </button>
        </div>

        {/* Reviews */}
        <div className="flex flex-col gap-3">
          {clientReviews.map((r) => (
            <div key={r.id} className="rounded-2xl bg-white p-4 shadow-[0_1px_4px_rgba(15,26,46,0.04)]">
              <div className="flex items-center gap-2.5">
                <Stars n={r.stars} />
                <span className="text-[11px] text-muted">{r.date}</span>
              </div>
              <p className="pt-2 text-[14px] leading-snug text-navy">{r.text}</p>
              <p className="pt-1.5 text-[12px] text-muted">{r.service}</p>
              {replies[r.id] ? (
                <div className="mt-3 rounded-xl bg-canvas p-3">
                  <p className="text-[11px] font-semibold text-secondary">You replied</p>
                  <p className="pt-1 text-[13px] text-navy">{replies[r.id]}</p>
                </div>
              ) : replyFor === r.id ? (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    autoFocus
                    value={replyDraft}
                    onChange={(e) => setReplyDraft(e.target.value)}
                    placeholder="Write a public reply..."
                    className="h-10 flex-1 rounded-full bg-canvas px-4 text-[13px] text-navy placeholder:text-muted focus:outline-none"
                  />
                  <button
                    aria-label="Send reply"
                    disabled={!replyDraft.trim()}
                    onClick={() => {
                      setReplies((x) => ({ ...x, [r.id]: replyDraft }));
                      setReplyFor(null);
                      setReplyDraft("");
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#14181F] text-white disabled:opacity-40"
                  >
                    <Send size={14} />
                  </button>
                </div>
              ) : (
                <button onClick={() => setReplyFor(r.id)} className="mt-2.5 text-[12px] font-semibold text-navy underline">
                  Reply
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ask for a review */}
      <Sheet open={askReview} onClose={() => setAskReview(false)} title="Ask for a review" sub="Sent by SMS and in-app">
        {askSent ? (
          <div className="flex flex-col items-center pb-2 pt-4 text-center">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }} className="flex h-16 w-16 items-center justify-center rounded-full bg-[#14181F] text-white">
              <Check size={26} strokeWidth={2.2} />
            </motion.span>
            <p className="pt-5 text-[16px] font-bold text-navy">Request sent</p>
            <p className="pt-1 text-[13px] text-secondary">We&rsquo;ll nudge you if Sarah hasn&rsquo;t replied in a week.</p>
            <div className="w-full pt-6">
              <DarkButton onClick={() => setAskReview(false)}>Done</DarkButton>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-2xl bg-canvas p-4">
              <p className="text-[11px] font-semibold text-muted">PREVIEW</p>
              <p className="pt-2 text-[14px] leading-relaxed text-navy">
                Hi Sarah! Thanks for visiting Salon Soho. If you have a minute, we&rsquo;d love a quick review of your Cut & Style — it really helps. ⭐
              </p>
            </div>
            <div className="pt-5">
              <DarkButton onClick={() => setAskSent(true)}>
                <Send size={15} />
                Send review request
              </DarkButton>
            </div>
          </>
        )}
      </Sheet>
    </div>
  );
}
