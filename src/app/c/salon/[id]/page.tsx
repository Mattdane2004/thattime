"use client";

// /c/salon/[id] — the salon social page. Instagram-profile layout
// (stats, highlights, grid) fused with Fresha-style booking surfaces
// (services, reviews, about). Tabs: Grid | Services | Reviews | About.

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Share,
  MoreHorizontal,
  Star,
  Grid3X3,
  Scissors,
  MessageSquare,
  Info,
  MapPin,
  Heart,
  MessageCircle,
  Navigation,
  Wifi,
  CreditCard,
  Accessibility,
  Car,
} from "lucide-react";
import { Sheet, DarkButton, GhostButton, SectionLabel, StatusPill } from "@/components/ui";
import { Avatar, Stars, GridTile } from "@/components/client/shared";
import { defaultCategories, tintFromHex } from "@/lib/tokens/categories";
import { salons, getSalon, getOffer, conversations } from "@/lib/data/b2c";
import type { ClientOffer, SalonHighlight, SalonPost } from "@/lib/data/b2c";

type TabId = "grid" | "services" | "reviews" | "about";

const TABS: { id: TabId; icon: typeof Grid3X3; label: string }[] = [
  { id: "grid", icon: Grid3X3, label: "Posts" },
  { id: "services", icon: Scissors, label: "Services" },
  { id: "reviews", icon: MessageSquare, label: "Reviews" },
  { id: "about", icon: Info, label: "About" },
];

const OPENING_HOURS = [
  { day: "Monday", hours: "09:00 – 18:00" },
  { day: "Tuesday", hours: "09:00 – 18:00" },
  { day: "Wednesday", hours: "09:00 – 19:00" },
  { day: "Thursday", hours: "09:00 – 19:00" },
  { day: "Friday", hours: "09:00 – 19:00" },
  { day: "Saturday", hours: "08:00 – 17:00" },
  { day: "Sunday", hours: "Closed" },
];

const AMENITIES = [
  { label: "Wi-Fi", icon: Wifi },
  { label: "Card payments", icon: CreditCard },
  { label: "Wheelchair access", icon: Accessibility },
  { label: "Parking", icon: Car },
];

// Mock rating distribution (percent of reviews per star, 5 → 1).
const RATING_BARS = [82, 12, 4, 1, 1];

export default function SalonPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const salon = getSalon(params.id) ?? salons[0];
  const color = defaultCategories.find((c) => c.name === salon.category)?.color ?? "#475569";
  const conversationId = conversations.find((c) => c.salonId === salon.id)?.id;

  const [tab, setTab] = useState<TabId>("grid");
  const [following, setFollowing] = useState(salon.isFollowing);
  const [highlight, setHighlight] = useState<SalonHighlight | null>(null);
  const [post, setPost] = useState<SalonPost | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSent, setReviewSent] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const groupedOffers = useMemo(() => {
    const by = (t: ClientOffer["type"]) => salon.offers.filter((o) => o.type === t);
    return [
      { label: "Services", items: by("service") },
      { label: "Classes", items: by("class") },
      { label: "Bundles", items: by("bundle") },
      { label: "Memberships", items: by("subscription") },
    ].filter((g) => g.items.length > 0);
  }, [salon]);

  const goToServices = () => {
    setTab("services");
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const book = (offerId?: string) =>
    router.push(`/c/salon/${salon.id}/book${offerId ? `?offer=${offerId}` : ""}`);

  const postOffer = post?.offerId ? getOffer(salon.id, post.offerId) : undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      {/* Header bar */}
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-surface px-2 py-2.5">
        <button type="button" aria-label="Back" onClick={() => router.back()} className="p-2 text-navy">
          <ChevronLeft size={20} strokeWidth={1.75} />
        </button>
        <span className="text-[14px] font-semibold text-navy">{salon.handle}</span>
        <div className="flex items-center">
          <button type="button" aria-label="Share" onClick={() => {}} className="p-2 text-navy">
            <Share size={20} strokeWidth={1.75} />
          </button>
          <button type="button" aria-label="More" onClick={() => {}} className="p-2 text-navy">
            <MoreHorizontal size={20} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        {/* Profile block */}
        <div className="bg-surface px-4 pt-4">
          <div className="flex items-center gap-5">
            <Avatar initials={salon.avatar} category={salon.category} size={72} />
            <div className="flex flex-1 items-center justify-around text-center">
              <div>
                <p className="text-[16px] font-bold text-navy">{salon.postsCount}</p>
                <p className="text-[11px] text-secondary">posts</p>
              </div>
              <div>
                <p className="text-[16px] font-bold text-navy">{salon.followers}</p>
                <p className="text-[11px] text-secondary">followers</p>
              </div>
              <button type="button" onClick={() => setTab("reviews")}>
                <p className="flex items-center justify-center gap-1 text-[16px] font-bold text-navy">
                  {salon.rating}
                  <Star size={13} className="fill-current" />
                </p>
                <p className="text-[11px] text-secondary">rating</p>
              </button>
            </div>
          </div>

          <div className="pt-3">
            <h1 className="font-display text-[18px] font-extrabold tracking-tight text-navy">{salon.name}</h1>
            <p className="text-[12px] text-secondary">
              <span className="font-semibold" style={{ color }}>
                {salon.category}
              </span>{" "}
              · {salon.address} · {salon.distance}
            </p>
            <p className="mt-1.5 text-[13px] leading-snug text-navy">{salon.bio}</p>
            <p className="mt-1.5 flex items-center gap-2 text-[12px] text-secondary">
              {salon.hours}
              <StatusPill tone={salon.openNow ? "light" : "amber"}>{salon.openNow ? "Open now" : "Closed"}</StatusPill>
            </p>
          </div>

          {/* Action row */}
          <div className="flex gap-2 pt-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setFollowing((f) => !f)}
              className={`h-10 flex-1 rounded-full text-[13px] font-semibold ${
                following ? "border border-border bg-surface text-navy" : "bg-coral text-white"
              }`}
            >
              {following ? "Following" : "Follow"}
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push(conversationId ? `/c/inbox/${conversationId}` : "/c/inbox")}
              className="h-10 flex-1 rounded-full border border-border bg-surface text-[13px] font-semibold text-navy"
            >
              Message
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={goToServices}
              className="h-10 flex-1 rounded-full bg-ink text-[13px] font-semibold text-white"
            >
              Book
            </motion.button>
          </div>

          {/* Highlights */}
          <div className="-mx-4 mt-4 flex gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none]">
            {salon.highlights.map((h) => (
              <button key={h.id} type="button" onClick={() => setHighlight(h)} className="w-16 shrink-0 text-center">
                <span
                  className="relative mx-auto block h-16 w-16 overflow-hidden rounded-full border-2 p-0.5"
                  style={{ borderColor: tintFromHex(color, 0.5) }}
                >
                  <Image src={h.image} alt={h.label} fill sizes="64px" className="rounded-full object-cover" />
                </span>
                <span className="mt-1 block truncate text-[11px] text-navy">{h.label}</span>
              </button>
            ))}
          </div>

          {/* Tabs */}
          <div className="-mx-4 flex border-t border-border">
            {TABS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                type="button"
                aria-label={label}
                onClick={() => setTab(id)}
                className={`flex flex-1 items-center justify-center border-t-2 py-3 ${
                  tab === id ? "border-navy text-navy" : "border-transparent text-muted"
                }`}
              >
                <Icon size={20} strokeWidth={1.75} />
              </button>
            ))}
          </div>
        </div>

        {/* ------- Grid tab ------- */}
        {tab === "grid" && (
          <div className="grid grid-cols-3 gap-0.5 pb-24 pt-0.5">
            {salon.posts.map((p) => {
              const offer = p.offerId ? getOffer(salon.id, p.offerId) : undefined;
              return (
                <GridTile
                  key={p.id}
                  image={p.image}
                  onClick={() => setPost(p)}
                  badge={
                    offer ? (
                      <span className="rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-semibold text-white">
                        {offer.price}
                      </span>
                    ) : undefined
                  }
                />
              );
            })}
          </div>
        )}

        {/* ------- Services tab ------- */}
        {tab === "services" && (
          <div className="px-4 pb-32 pt-4">
            {groupedOffers.map((group) => (
              <div key={group.label} className="pb-5">
                <SectionLabel count={group.items.length}>{group.label}</SectionLabel>
                <div className="space-y-2">
                  {group.items.map((o) => (
                    <div key={o.id} className="rounded-2xl border border-border bg-surface p-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-[14px] font-semibold text-navy">{o.name}</p>
                            {o.popular && <StatusPill>Popular</StatusPill>}
                          </div>
                          <p className="truncate text-[12px] text-secondary">
                            {o.durationMin ? `${o.durationMin} min · ` : ""}
                            {o.description}
                          </p>
                          {o.type === "class" && o.nextSession && (
                            <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-secondary">
                              {o.nextSession}
                              {o.spotsLeft !== undefined && (
                                <StatusPill tone={o.spotsLeft <= 3 ? "amber" : "light"}>
                                  {o.spotsLeft} {o.spotsLeft === 1 ? "spot" : "spots"} left
                                </StatusPill>
                              )}
                            </p>
                          )}
                          {o.type === "bundle" && o.includes && (
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              {o.includes.map((inc) => (
                                <span key={inc} className="rounded-full bg-canvas px-2 py-0.5 text-[10px] font-medium text-secondary">
                                  {inc}
                                </span>
                              ))}
                              {o.saving && <StatusPill tone="amber">{o.saving}</StatusPill>}
                            </div>
                          )}
                          {o.type === "subscription" && o.benefits && (
                            <ul className="mt-1.5 space-y-0.5">
                              {o.benefits.map((b) => (
                                <li key={b} className="text-[12px] text-secondary">
                                  · {b}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <div className="text-right">
                            <p className="text-[14px] font-bold text-navy">{o.price}</p>
                            {o.billing && <p className="text-[10px] text-muted">{o.billing}</p>}
                          </div>
                          <motion.button
                            type="button"
                            whileTap={{ scale: 0.97 }}
                            onClick={() => book(o.id)}
                            className="rounded-full bg-ink px-4 py-1.5 text-[12px] font-semibold text-white"
                          >
                            {o.type === "class" ? "Join" : "Book"}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ------- Reviews tab ------- */}
        {tab === "reviews" && (
          <div className="px-4 pb-24 pt-4">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="font-display text-[36px] font-extrabold tracking-tight text-navy">{salon.rating}</p>
                  <span className="flex justify-center text-navy">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} size={12} className="fill-current" />
                    ))}
                  </span>
                  <p className="text-[11px] text-secondary">{salon.reviewCount.toLocaleString()} reviews</p>
                </div>
                <div className="flex-1 space-y-1">
                  {RATING_BARS.map((pct, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-3 text-right text-[11px] text-secondary">{5 - i}</span>
                      <div className="h-1.5 flex-1 rounded-full bg-canvas">
                        <div className="h-1.5 rounded-full bg-navy" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {salon.reviews.map((r) => (
                <div key={r.id} className="rounded-2xl border border-border bg-surface p-3.5">
                  <div className="flex items-center gap-3">
                    <Avatar initials={r.initials} size={36} />
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-navy">{r.author}</p>
                      <div className="flex items-center gap-2">
                        <span className="flex text-navy">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} size={11} className={i < r.stars ? "fill-current" : "text-border"} />
                          ))}
                        </span>
                        <span className="text-[11px] text-muted">{r.date}</span>
                      </div>
                    </div>
                    <StatusPill>{r.service}</StatusPill>
                  </div>
                  <p className="mt-2 text-[13px] leading-snug text-navy">{r.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              <GhostButton onClick={() => setReviewOpen(true)}>Write a review</GhostButton>
              <GhostButton onClick={() => router.push(`/c/salon/${salon.id}/reviews`)}>
                See all {salon.reviewCount.toLocaleString()} reviews
              </GhostButton>
            </div>
          </div>
        )}

        {/* ------- About tab ------- */}
        {tab === "about" && (
          <div className="px-4 pb-24 pt-4">
            <div className="overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="relative h-32 w-full">
                <Image src="/onboarding/map-streets.png" alt="Map" fill sizes="346px" className="object-cover" />
                <span
                  className="absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-md"
                  style={{ background: color }}
                >
                  <MapPin size={15} strokeWidth={2.5} />
                </span>
              </div>
              <div className="flex items-center justify-between p-3.5">
                <div>
                  <p className="text-[13px] font-semibold text-navy">{salon.address}</p>
                  <p className="text-[12px] text-secondary">{salon.distance} away</p>
                </div>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {}}
                  className="flex items-center gap-1.5 rounded-full border border-border px-3.5 py-2 text-[12px] font-semibold text-navy"
                >
                  <Navigation size={14} strokeWidth={1.75} />
                  Get directions
                </motion.button>
              </div>
            </div>

            <div className="pt-5">
              <SectionLabel>Opening hours</SectionLabel>
            </div>
            <div className="rounded-2xl border border-border bg-surface px-3.5 py-1">
              {OPENING_HOURS.map((d) => (
                <div key={d.day} className="flex items-center justify-between border-b border-border py-2.5 last:border-0">
                  <span className="text-[13px] text-navy">{d.day}</span>
                  <span className={`text-[13px] ${d.hours === "Closed" ? "text-muted" : "font-medium text-navy"}`}>
                    {d.hours}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-5">
              <SectionLabel count={salon.staff.length}>Team</SectionLabel>
            </div>
            <div className="space-y-2">
              {salon.staff.map((m) => (
                <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3">
                  <Avatar initials={m.initials} category={salon.category} size={40} />
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-navy">{m.name}</p>
                    <p className="text-[12px] text-secondary">{m.role}</p>
                  </div>
                  <Stars rating={m.rating} />
                </div>
              ))}
            </div>

            <div className="pt-5">
              <SectionLabel>Amenities</SectionLabel>
            </div>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2 text-[12px] font-medium text-navy"
                >
                  <Icon size={14} strokeWidth={1.75} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky book footer (services tab) */}
      {tab === "services" && (
        <div className="shrink-0 border-t border-border bg-surface px-4 pb-3 pt-3">
          <DarkButton onClick={() => book()}>Book now · next available {salon.nextAvailable}</DarkButton>
        </div>
      )}

      {/* Highlight story-ish overlay */}
      <Sheet open={highlight !== null} onClose={() => setHighlight(null)} full>
        {highlight && (
          <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 pb-3">
              <Avatar initials={salon.avatar} category={salon.category} size={36} ring />
              <div>
                <p className="text-[13px] font-semibold text-navy">{salon.name}</p>
                <p className="text-[11px] text-secondary">{highlight.label}</p>
              </div>
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-ink">
              <Image src={highlight.image} alt={highlight.label} fill sizes="346px" className="object-cover" />
              <span className="absolute inset-x-0 top-0 mx-3 mt-2 h-0.5 rounded-full bg-white/80" />
              <span className="absolute bottom-4 left-4 rounded-full bg-ink/70 px-3 py-1.5 text-[13px] font-semibold text-white">
                {highlight.label}
              </span>
            </div>
          </div>
        )}
      </Sheet>

      {/* Post sheet */}
      <Sheet open={post !== null} onClose={() => setPost(null)} title={salon.name} sub={post ? `${post.timeAgo} ago` : undefined}>
        {post && (
          <div>
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-border">
              <Image src={post.image} alt={post.caption} fill sizes="346px" className="object-cover" />
            </div>
            <div className="flex items-center gap-4 pt-3 text-secondary">
              <span className="flex items-center gap-1.5 text-[13px]">
                <Heart size={18} strokeWidth={1.75} /> {post.likes}
              </span>
              <span className="flex items-center gap-1.5 text-[13px]">
                <MessageCircle size={18} strokeWidth={1.75} /> {post.comments}
              </span>
            </div>
            <p className="pt-2 text-[13px] leading-snug text-navy">
              <span className="font-semibold">{salon.handle}</span> {post.caption}
            </p>
            {postOffer && (
              <div className="pt-4">
                <DarkButton onClick={() => book(postOffer.id)}>
                  Book this look · {postOffer.name} {postOffer.price}
                </DarkButton>
              </div>
            )}
          </div>
        )}
      </Sheet>

      {/* Write a review sheet */}
      <Sheet
        open={reviewOpen}
        onClose={() => {
          setReviewOpen(false);
          setReviewSent(false);
          setReviewStars(0);
          setReviewText("");
        }}
        title={reviewSent ? "Thank you!" : "Write a review"}
        sub={reviewSent ? undefined : salon.name}
      >
        {reviewSent ? (
          <div className="flex flex-col items-center pt-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream text-coral">
              <Star size={26} className="fill-current" />
            </span>
            <p className="pt-3 text-[15px] font-semibold text-navy">Review submitted</p>
            <p className="pt-1 text-[13px] text-secondary">
              Thanks for sharing — {salon.name} will see it shortly.
            </p>
            <div className="w-full pt-6">
              <DarkButton
                onClick={() => {
                  setReviewOpen(false);
                  setReviewSent(false);
                  setReviewStars(0);
                  setReviewText("");
                }}
              >
                Done
              </DarkButton>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-center gap-2 pt-2">
              {Array.from({ length: 5 }, (_, i) => (
                <button key={i} type="button" aria-label={`${i + 1} stars`} onClick={() => setReviewStars(i + 1)}>
                  <Star
                    size={32}
                    strokeWidth={1.5}
                    className={i < reviewStars ? "fill-current text-coral" : "text-border"}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="How was your visit?"
              rows={4}
              className="mt-4 w-full resize-none rounded-2xl border border-border bg-canvas p-3.5 text-[14px] text-navy outline-none placeholder:text-muted"
            />
            <div className="pt-4">
              <DarkButton disabled={reviewStars === 0} onClick={() => setReviewSent(true)}>
                Submit review
              </DarkButton>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
