"use client";

// Post detail — deep-link target from explore / profile grids.
// Full post card + inline comments + booking strip + more from the salon.

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Bookmark, ChevronLeft, Heart, MessageCircle, Send } from "lucide-react";
import { getFeedPost, getSalon } from "@/lib/data/b2c";
import { Avatar, GridTile } from "@/components/ui/consumer";

const spring = { type: "spring", stiffness: 420, damping: 34 } as const;

export default function PostDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const post = getFeedPost(id);
  const [liked, setLiked] = useState(post?.liked ?? false);
  const [saved, setSaved] = useState(post?.saved ?? false);

  if (!post) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center bg-canvas">
        <p className="text-[14px] text-secondary">Post not found</p>
        <Link href="/c/home" className="mt-2 text-[13px] font-semibold text-coral">
          Back home
        </Link>
      </div>
    );
  }

  const salon = getSalon(post.salonId);
  const morePosts = (salon?.posts ?? []).slice(0, 3);
  const likeCount = post.likes + (liked && !post.liked ? 1 : !liked && post.liked ? -1 : 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      {/* header */}
      <div className="flex items-center gap-2 border-b border-border bg-surface px-2 py-3">
        <button type="button" aria-label="Back" onClick={() => router.back()} className="p-1.5 text-navy">
          <ChevronLeft size={22} strokeWidth={1.75} />
        </button>
        <h1 className="text-[16px] font-bold text-navy">Post</h1>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <article className="border-b border-border bg-surface pb-4">
          <div className="flex items-center gap-3 px-4 py-3">
            <Link href={`/c/salon/${post.salonId}`}>
              <Avatar initials={post.avatar} category={post.category} size={36} />
            </Link>
            <Link href={`/c/salon/${post.salonId}`} className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-bold text-navy">{post.salonName}</p>
              <p className="text-[12px] text-secondary">
                {post.category} · {post.timeAgo}
              </p>
            </Link>
          </div>

          <div className="relative aspect-[4/5] w-full bg-border">
            <Image src={post.image} alt={post.caption} fill sizes="378px" className="object-cover" />
          </div>

          {post.offerId && (
            <div className="mx-4 mt-3 flex items-center gap-3 rounded-2xl border border-border bg-canvas px-4 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-navy">{post.offerName}</p>
                <p className="text-[12px] text-secondary">{post.offerPrice}</p>
              </div>
              <Link href={`/c/salon/${post.salonId}/book?offer=${post.offerId}`}>
                <motion.span
                  whileTap={{ scale: 0.97 }}
                  transition={spring}
                  className="flex h-9 items-center rounded-full bg-ink px-5 text-[13px] font-semibold text-white"
                >
                  Book
                </motion.span>
              </Link>
            </div>
          )}

          <div className="flex items-center gap-4 px-4 pt-3">
            <motion.button
              type="button"
              aria-label="Like"
              whileTap={{ scale: 0.97 }}
              onClick={() => setLiked((v) => !v)}
              className={`flex items-center gap-1.5 ${liked ? "text-coral" : "text-navy"}`}
            >
              <Heart size={20} strokeWidth={liked ? 2.25 : 1.75} className={liked ? "fill-current" : ""} />
              <span className="text-[13px] font-semibold">{likeCount}</span>
            </motion.button>
            <span className="flex items-center gap-1.5 text-navy">
              <MessageCircle size={20} strokeWidth={1.75} />
              <span className="text-[13px] font-semibold">{post.commentList.length}</span>
            </span>
            <span className="text-navy">
              <Send size={20} strokeWidth={1.75} />
            </span>
            <motion.button
              type="button"
              aria-label="Save"
              whileTap={{ scale: 0.97 }}
              onClick={() => setSaved((v) => !v)}
              className="ml-auto text-navy"
            >
              <Bookmark size={20} strokeWidth={saved ? 2.25 : 1.75} className={saved ? "fill-current" : ""} />
            </motion.button>
          </div>

          <p className="px-4 pt-2 text-[13px] leading-relaxed text-navy">
            <Link href={`/c/salon/${post.salonId}`} className="font-bold">
              {post.salonName}
            </Link>{" "}
            {post.caption}
          </p>
        </article>

        {/* comments inline */}
        <div className="border-b border-border bg-surface px-4 py-4">
          <p className="pb-3 text-[14px] font-bold text-navy">Comments</p>
          {post.commentList.length === 0 && (
            <p className="pb-2 text-[13px] text-muted">No comments yet — be the first.</p>
          )}
          <div className="flex flex-col gap-4">
            {post.commentList.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar initials={c.initials} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-navy">
                    <span className="font-bold">{c.author}</span> <span className="text-muted">{c.timeAgo}</span>
                  </p>
                  <p className="text-[13px] text-navy">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* more from salon */}
        {salon && (
          <div className="bg-surface pb-6 pt-4">
            <div className="flex items-center justify-between px-4 pb-3">
              <p className="text-[14px] font-bold text-navy">More from {salon.name}</p>
              <Link href={`/c/salon/${salon.id}`} className="text-[13px] font-semibold text-coral">
                View profile
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-0.5">
              {morePosts.map((p) => (
                <GridTile key={p.id} image={p.image} onClick={() => router.push(`/c/salon/${salon.id}`)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
