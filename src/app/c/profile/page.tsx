"use client";

// Own social profile — stats, wallet strip, passes, Posts / Saved / Following tabs.

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Settings,
  Plus,
  MapPin,
  Wallet,
  ChevronRight,
  Grid3X3,
  Bookmark,
  Users,
  Heart,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { clientUser, feedPosts, getSalon, type UserPost } from "@/lib/data/b2c";
import { Sheet, DarkButton, GhostButton } from "@/components/ui";
import { Avatar, Stars, GridTile, OfferTypeBadge } from "@/components/ui/consumer";

type Tab = "posts" | "saved" | "following";

export default function ProfilePage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("posts");
  const [editOpen, setEditOpen] = useState(false);
  const [openPost, setOpenPost] = useState<UserPost | null>(null);
  const [following, setFollowing] = useState<string[]>(clientUser.followingSalonIds);

  // editable profile (local wireframe state)
  const [name, setName] = useState(clientUser.name);
  const [bio, setBio] = useState(clientUser.bio);
  const [location, setLocation] = useState(clientUser.location);

  const savedPosts = feedPosts.filter((p) => clientUser.savedPostIds.includes(p.id));
  const followingSalons = clientUser.followingSalonIds
    .map((id) => getSalon(id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const tabs: { id: Tab; icon: typeof Grid3X3; label: string }[] = [
    { id: "posts", icon: Grid3X3, label: "Posts" },
    { id: "saved", icon: Bookmark, label: "Saved" },
    { id: "following", icon: Users, label: "Following" },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      {/* header */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <h1 className="font-display text-[18px] font-extrabold tracking-tight text-navy">{clientUser.handle}</h1>
        <div className="flex items-center gap-4">
          <Link href="/c/create" aria-label="Create post" className="p-1 text-navy">
            <Plus size={20} strokeWidth={1.75} />
          </Link>
          <Link href="/c/settings" aria-label="Settings" className="p-1 text-navy">
            <Settings size={20} strokeWidth={1.75} />
          </Link>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {/* profile block */}
        <div className="bg-surface px-4 pb-4 pt-5">
          <div className="flex items-center gap-5">
            <Avatar initials={clientUser.initials} size={72} ring />
            <div className="flex flex-1 items-center justify-around text-center">
              {[
                { v: clientUser.posts.length, l: "Posts" },
                { v: clientUser.followersCount, l: "Followers" },
                { v: clientUser.followingCount, l: "Following" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="text-[17px] font-extrabold text-navy">{s.v}</p>
                  <p className="text-[12px] text-secondary">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="pt-3 text-[15px] font-bold text-navy">{name}</p>
          <p className="flex items-center gap-1 pt-0.5 text-[12px] text-secondary">
            <MapPin size={12} strokeWidth={1.75} />
            {location}
          </p>
          <p className="pt-1.5 text-[13px] leading-relaxed text-navy">{bio}</p>
          <GhostButton className="mt-3 !h-10" onClick={() => setEditOpen(true)}>
            Edit profile
          </GhostButton>
        </div>

        {/* wallet strip */}
        <div className="px-4 pt-4">
          <Link
            href="/c/settings/wallet"
            className="flex items-center gap-3 rounded-2xl bg-ink px-4 py-3.5 text-white"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
              <Wallet size={18} strokeWidth={1.75} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold">{clientUser.wallet.balance} in wallet</span>
              <span className="block text-[12px] text-white/70">
                {clientUser.wallet.loyaltyPoints} points · {clientUser.wallet.tier} tier
              </span>
            </span>
            <ChevronRight size={18} strokeWidth={1.75} className="shrink-0 text-white/70" />
          </Link>
        </div>

        {/* passes */}
        <div className="pt-5">
          <p className="px-4 pb-2.5 text-[15px] font-bold text-navy">Your passes</p>
          <div className="flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
            {clientUser.memberships.map((m) => (
              <div key={m.id} className="w-[240px] shrink-0 rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between">
                  <OfferTypeBadge type={m.kind} />
                  <Sparkles size={14} strokeWidth={1.75} className="text-muted" />
                </div>
                <p className="pt-2.5 text-[14px] font-bold text-navy">{m.name}</p>
                <p className="text-[12px] text-secondary">{m.salonName}</p>
                <p className="pt-1.5 text-[12px] text-secondary">{m.detail}</p>
                <Link
                  href={`/c/salon/${m.salonId}`}
                  className="mt-3 flex h-9 items-center justify-center rounded-full bg-ink text-[13px] font-semibold text-white"
                >
                  Book
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* tabs */}
        <div className="mt-5 flex border-b border-border bg-surface">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                aria-label={t.label}
                onClick={() => setTab(t.id)}
                className={`relative flex flex-1 items-center justify-center py-3 ${
                  active ? "text-navy" : "text-muted"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2 : 1.75} />
                {active && (
                  <motion.span layoutId="profile-tab" className="absolute inset-x-8 bottom-0 h-0.5 rounded-full bg-navy" />
                )}
              </button>
            );
          })}
        </div>

        {/* posts grid */}
        {tab === "posts" && (
          <div className="grid grid-cols-3 gap-px bg-border">
            {clientUser.posts.map((p) => (
              <GridTile key={p.id} image={p.image} onClick={() => setOpenPost(p)} />
            ))}
          </div>
        )}

        {/* saved grid */}
        {tab === "saved" &&
          (savedPosts.length > 0 ? (
            <div className="grid grid-cols-3 gap-px bg-border">
              {savedPosts.map((p) => (
                <GridTile key={p.id} image={p.image} onClick={() => router.push(`/c/post/${p.id}`)} />
              ))}
            </div>
          ) : (
            <p className="px-8 py-12 text-center text-[13px] text-muted">
              Tap the bookmark on any post to save looks for later.
            </p>
          ))}

        {/* following rows */}
        {tab === "following" && (
          <div className="bg-surface">
            {followingSalons.map((s) => {
              const isFollowing = following.includes(s.id);
              return (
                <div key={s.id} className="flex items-center gap-3 border-b border-border px-4 py-3.5">
                  <button type="button" onClick={() => router.push(`/c/salon/${s.id}`)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <Avatar initials={s.avatar} category={s.category} size={44} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-bold text-navy">{s.name}</span>
                      <span className="flex items-center gap-2 text-[12px] text-secondary">
                        {s.category}
                        <Stars rating={s.rating} size={11} />
                      </span>
                    </span>
                  </button>
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                      setFollowing((prev) =>
                        prev.includes(s.id) ? prev.filter((x) => x !== s.id) : [...prev, s.id],
                      )
                    }
                    className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-semibold ${
                      isFollowing ? "border border-border bg-surface text-navy" : "bg-ink text-white"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </motion.button>
                </div>
              );
            })}
          </div>
        )}
        <div className="h-6" />
      </div>

      {/* edit profile sheet */}
      <Sheet open={editOpen} onClose={() => setEditOpen(false)} title="Edit profile">
        <div className="flex flex-col gap-4 pb-2">
          {[
            { label: "Name", value: name, set: setName },
            { label: "Location", value: location, set: setLocation },
          ].map((f) => (
            <label key={f.label} className="block">
              <span className="mb-1.5 block text-[12px] font-semibold text-secondary">{f.label}</span>
              <input
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                className="h-12 w-full rounded-2xl border border-border bg-canvas px-4 text-[14px] text-navy focus:outline-none"
              />
            </label>
          ))}
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold text-secondary">Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-2xl border border-border bg-canvas px-4 py-3 text-[14px] text-navy focus:outline-none"
            />
          </label>
          <DarkButton onClick={() => setEditOpen(false)}>Save changes</DarkButton>
        </div>
      </Sheet>

      {/* post detail sheet */}
      <Sheet open={openPost !== null} onClose={() => setOpenPost(null)} title={openPost ? clientUser.handle : undefined} sub={openPost?.timeAgo}>
        {openPost && (
          <div className="flex flex-col gap-3 pb-2">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-border">
              <Image src={openPost.image} alt={openPost.caption} fill sizes="330px" className="object-cover" />
            </div>
            <div className="flex items-center gap-4 text-navy">
              <span className="flex items-center gap-1.5">
                <Heart size={18} strokeWidth={1.75} />
                <span className="text-[13px] font-semibold">{openPost.likes}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircle size={18} strokeWidth={1.75} />
                <span className="text-[13px] font-semibold">{openPost.comments}</span>
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-navy">{openPost.caption}</p>
            {openPost.taggedSalonId && (
              <Link
                href={`/c/salon/${openPost.taggedSalonId}`}
                className="flex items-center justify-between rounded-2xl border border-border bg-canvas px-4 py-3"
              >
                <span className="text-[13px] font-semibold text-navy">Tagged: {openPost.taggedSalonName}</span>
                <ChevronRight size={16} strokeWidth={1.75} className="text-muted" />
              </Link>
            )}
          </div>
        )}
      </Sheet>
    </div>
  );
}
