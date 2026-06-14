"use client";

// Social home feed — stories rail + feed of salon posts with bookable
// offer strips (the thattime differentiator: see a look, book it).

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Bell,
  Bookmark,
  Flag,
  Heart,
  Info,
  MessageCircle,
  MoreHorizontal,
  Plus,
  PlusSquare,
  Send,
  Share2,
  UserMinus,
} from "lucide-react";
import { feedPosts, type FeedPost } from "@/lib/data/b2c";
import { stories } from "@/lib/data/b2c";
import { Sheet } from "@/components/ui";
import { Avatar } from "@/components/ui/consumer";

const spring = { type: "spring", stiffness: 420, damping: 34 } as const;

function StoriesRow() {
  return (
    <div className="flex gap-4 overflow-x-auto px-4 py-3 [scrollbar-width:none]">
      <Link href="/c/create" className="flex w-[64px] shrink-0 flex-col items-center gap-1.5">
        <span className="relative">
          <span className="flex h-[58px] w-[58px] items-center justify-center rounded-full border border-dashed border-border bg-surface">
            <Avatar initials="EC" size={50} />
          </span>
          <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-coral text-white ring-2 ring-surface">
            <Plus size={12} strokeWidth={2.5} />
          </span>
        </span>
        <span className="text-[11px] text-secondary">Your story</span>
      </Link>
      {stories.map((s) => (
        <Link key={s.id} href={`/c/story/${s.id}`} className="flex w-[64px] shrink-0 flex-col items-center gap-1.5">
          <span
            className={`flex h-[58px] w-[58px] items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-surface ${
              s.viewed ? "ring-border" : "ring-coral"
            }`}
          >
            <Avatar initials={s.avatar} size={54} />
          </span>
          <span className="max-w-[64px] truncate text-[11px] text-secondary">{s.salonName}</span>
        </Link>
      ))}
    </div>
  );
}

function FeedPostCard({
  post,
  onComments,
  onMenu,
}: {
  post: FeedPost;
  onComments: (p: FeedPost) => void;
  onMenu: (p: FeedPost) => void;
}) {
  const [liked, setLiked] = useState(post.liked);
  const [saved, setSaved] = useState(post.saved);
  const likeCount = post.likes + (liked && !post.liked ? 1 : !liked && post.liked ? -1 : 0);

  return (
    <article className="border-b border-border bg-surface pb-4">
      {/* header */}
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
        <button type="button" aria-label="Post options" onClick={() => onMenu(post)} className="p-1 text-navy">
          <MoreHorizontal size={20} strokeWidth={1.75} />
        </button>
      </div>

      {/* image */}
      <div className="relative aspect-[4/5] w-full bg-border">
        <Image src={post.image} alt={post.caption} fill sizes="378px" className="object-cover" />
      </div>

      {/* booking strip */}
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

      {/* actions */}
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
        <button type="button" aria-label="Comments" onClick={() => onComments(post)} className="flex items-center gap-1.5 text-navy">
          <MessageCircle size={20} strokeWidth={1.75} />
          <span className="text-[13px] font-semibold">{post.commentList.length}</span>
        </button>
        <button type="button" aria-label="Share" onClick={() => onMenu(post)} className="text-navy">
          <Send size={20} strokeWidth={1.75} />
        </button>
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

      {/* caption */}
      <p className="px-4 pt-2 text-[13px] leading-relaxed text-navy">
        <Link href={`/c/salon/${post.salonId}`} className="font-bold">
          {post.salonName}
        </Link>{" "}
        {post.caption}
      </p>
      {post.commentList.length > 0 && (
        <button type="button" onClick={() => onComments(post)} className="px-4 pt-1 text-[13px] text-secondary">
          View all {post.commentList.length} comments
        </button>
      )}
    </article>
  );
}

export default function HomeFeedPage() {
  const [commentsPost, setCommentsPost] = useState<FeedPost | null>(null);
  const [menuPost, setMenuPost] = useState<FeedPost | null>(null);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      {/* header */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <span className="font-display text-[20px] font-extrabold tracking-tight text-navy">thattime</span>
        <div className="flex items-center gap-4">
          <Link href="/c/notifications" aria-label="Notifications" className="relative p-1 text-navy">
            <Bell size={20} strokeWidth={1.75} />
            <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-coral" />
          </Link>
          <Link href="/c/create" aria-label="Create post" className="p-1 text-navy">
            <PlusSquare size={20} strokeWidth={1.75} />
          </Link>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="border-b border-border bg-surface">
          <StoriesRow />
        </div>
        {feedPosts.map((p) => (
          <FeedPostCard key={p.id} post={p} onComments={setCommentsPost} onMenu={setMenuPost} />
        ))}
        <p className="py-8 text-center text-[12px] text-muted">You&apos;re all caught up ✨</p>
      </div>

      {/* comments sheet */}
      <Sheet
        open={commentsPost !== null}
        onClose={() => setCommentsPost(null)}
        title="Comments"
        sub={commentsPost ? `${commentsPost.commentList.length} on this post` : undefined}
      >
        {commentsPost && (
          <div className="flex flex-col gap-5 pb-4">
            {commentsPost.commentList.length === 0 && (
              <p className="py-6 text-center text-[13px] text-muted">No comments yet — be the first.</p>
            )}
            {commentsPost.commentList.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar initials={c.initials} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-navy">
                    <span className="font-bold">{c.author}</span>{" "}
                    <span className="text-muted">{c.timeAgo}</span>
                  </p>
                  <p className="text-[13px] text-navy">{c.text}</p>
                </div>
              </div>
            ))}
            <div className="mt-2 flex items-center gap-3 border-t border-border pt-4">
              <Avatar initials="EC" size={34} />
              <input
                readOnly
                placeholder="Add a comment…"
                className="h-10 min-w-0 flex-1 rounded-full border border-border bg-canvas px-4 text-[13px] text-navy placeholder:text-muted focus:outline-none"
              />
              <button type="button" className="text-[13px] font-semibold text-coral">
                Post
              </button>
            </div>
          </div>
        )}
      </Sheet>

      {/* ellipsis menu sheet */}
      <Sheet open={menuPost !== null} onClose={() => setMenuPost(null)} title={menuPost?.salonName}>
        <div className="flex flex-col">
          {[
            { icon: <Info size={20} strokeWidth={1.75} />, label: "About this account" },
            { icon: <Share2 size={20} strokeWidth={1.75} />, label: "Share" },
            { icon: <UserMinus size={20} strokeWidth={1.75} />, label: "Unfollow" },
            { icon: <Flag size={20} strokeWidth={1.75} />, label: "Report", danger: true },
          ].map((row) => (
            <button
              key={row.label}
              type="button"
              onClick={() => setMenuPost(null)}
              className={`flex items-center gap-3 border-b border-border py-4 text-left text-[15px] font-medium last:border-b-0 ${
                row.danger ? "text-coral" : "text-navy"
              }`}
            >
              {row.icon}
              {row.label}
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
