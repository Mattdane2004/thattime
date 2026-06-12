"use client";

// Full-screen story viewer — tab bar hidden by ClientTabBar route rules.
// Tap right/left to advance/rewind; rolls into the next salon's story.

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Send, X } from "lucide-react";
import { getStory, stories } from "@/lib/data/b2c";

export default function StoryViewerPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const story = getStory(id);
  const [seg, setSeg] = useState(0);

  if (!story) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-ink text-white">
        <p className="text-[14px]">Story not found</p>
        <Link href="/c/home" className="mt-3 text-[13px] underline">
          Back home
        </Link>
      </div>
    );
  }

  const segment = story.segments[seg];
  const storyIdx = stories.findIndex((s) => s.id === story.id);

  const next = () => {
    if (seg < story.segments.length - 1) {
      setSeg(seg + 1);
    } else if (storyIdx < stories.length - 1) {
      setSeg(0);
      router.push(`/c/story/${stories[storyIdx + 1].id}`);
    } else {
      router.push("/c/home");
    }
  };

  const prev = () => {
    if (seg > 0) {
      setSeg(seg - 1);
    } else if (storyIdx > 0) {
      setSeg(0);
      router.push(`/c/story/${stories[storyIdx - 1].id}`);
    }
  };

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-ink">
      {/* image */}
      <div className="absolute inset-0">
        <Image src={segment.image} alt={segment.caption} fill sizes="378px" className="object-cover opacity-90" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/70 to-transparent" />
      </div>

      {/* tap zones */}
      <button type="button" aria-label="Previous" onClick={prev} className="absolute inset-y-0 left-0 z-10 w-1/3" />
      <button type="button" aria-label="Next" onClick={next} className="absolute inset-y-0 right-0 z-10 w-2/3" />

      {/* progress bars */}
      <div className="relative z-20 flex gap-1.5 px-3 pt-3">
        {story.segments.map((s, i) => (
          <span key={s.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
            <span className={`block h-full rounded-full bg-white transition-all ${i < seg ? "w-full" : i === seg ? "w-2/3" : "w-0"}`} />
          </span>
        ))}
      </div>

      {/* header */}
      <div className="relative z-20 flex items-center gap-2.5 px-3 pt-3">
        <Link href={`/c/salon/${story.salonId}`} className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-[11px] font-semibold text-white">
            {story.avatar}
          </span>
          <span className="text-[14px] font-semibold text-white">{story.salonName}</span>
          <span className="text-[12px] text-white/70">2h</span>
        </Link>
        <button type="button" aria-label="Close" onClick={() => router.back()} className="ml-auto p-1.5 text-white">
          <X size={22} strokeWidth={2} />
        </button>
      </div>

      {/* caption + CTA */}
      <div className="relative z-20 mt-auto flex flex-col gap-3 px-4 pb-4">
        <p className="text-center text-[15px] font-medium leading-snug text-white">{segment.caption}</p>
        {segment.offerId && (
          <Link href={`/c/salon/${story.salonId}/book?offer=${segment.offerId}`} className="relative z-20 mx-auto">
            <motion.span
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="flex h-11 items-center rounded-full bg-white px-7 text-[14px] font-semibold text-navy shadow-lg"
            >
              Book this
            </motion.span>
          </Link>
        )}
        <div className="flex items-center gap-3 pt-1">
          <div className="flex h-11 flex-1 items-center rounded-full border border-white/40 px-5 text-[13px] text-white/70">
            Send message
          </div>
          <span className="p-1 text-white">
            <Heart size={22} strokeWidth={1.75} />
          </span>
          <span className="p-1 text-white">
            <Send size={22} strokeWidth={1.75} />
          </span>
        </div>
      </div>
    </div>
  );
}
