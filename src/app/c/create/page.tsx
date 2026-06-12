"use client";

// Create post flow — three local-state steps (select / details / shared).
// Tab bar hidden by ClientTabBar route rules.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Calendar,
  Camera,
  Check,
  ChevronRight,
  Store,
  X,
} from "lucide-react";
import { photo, salons, clientBookings, type Salon } from "@/lib/data/b2c";
import { Sheet, DarkButton, GhostButton } from "@/components/app/ui";
import { Avatar } from "@/components/client/shared";

const spring = { type: "spring", stiffness: 420, damping: 34 } as const;

export default function CreatePostPage() {
  const router = useRouter();
  const [step, setStep] = useState<"select" | "details" | "shared">("select");
  const [selected, setSelected] = useState(0);
  const [caption, setCaption] = useState("");
  const [taggedSalon, setTaggedSalon] = useState<Salon | null>(null);
  const [tagSheetOpen, setTagSheetOpen] = useState(false);
  const [taggedBooking, setTaggedBooking] = useState(false);
  const [shareToStory, setShareToStory] = useState(true);

  const recentBooking = clientBookings.find((b) => b.status === "completed");

  if (step === "shared") {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 bg-canvas px-8">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink text-white">
          <Check size={30} strokeWidth={2.25} />
        </span>
        <h1 className="font-display text-[24px] font-extrabold tracking-tight text-navy">Posted!</h1>
        <p className="text-center text-[14px] leading-relaxed text-secondary">
          {taggedSalon
            ? `${taggedSalon.name} has been tagged — they may feature your post on their page.`
            : "Your post is live on your profile."}
        </p>
        <div className="mt-4 flex w-full flex-col gap-3">
          <DarkButton onClick={() => router.push("/c/profile")}>View profile</DarkButton>
          <GhostButton onClick={() => router.push("/c/home")}>Done</GhostButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-canvas">
      {/* header */}
      <div className="flex items-center justify-between border-b border-border bg-surface px-2 py-3">
        <button
          type="button"
          aria-label="Close"
          onClick={() => (step === "details" ? setStep("select") : router.back())}
          className="p-1.5 text-navy"
        >
          <X size={22} strokeWidth={1.75} />
        </button>
        <h1 className="text-[16px] font-bold text-navy">New post</h1>
        <button
          type="button"
          onClick={() => setStep(step === "select" ? "details" : "shared")}
          className="px-3 py-1.5 text-[14px] font-semibold text-coral"
        >
          {step === "select" ? "Next" : "Share"}
        </button>
      </div>

      {step === "select" && (
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* preview */}
          <div className="relative aspect-square w-full bg-border">
            <Image src={photo(selected)} alt="Selected photo" fill sizes="378px" className="object-cover" />
          </div>
          <p className="px-4 pb-2 pt-4 text-[13px] font-semibold text-navy">Recents</p>
          <div className="grid grid-cols-3 gap-0.5 pb-6">
            <button
              type="button"
              className="flex aspect-square w-full flex-col items-center justify-center gap-1.5 bg-surface text-secondary"
            >
              <Camera size={22} strokeWidth={1.75} />
              <span className="text-[11px]">Camera</span>
            </button>
            {Array.from({ length: 9 }, (_, i) => (
              <motion.button
                key={i}
                type="button"
                whileTap={{ scale: 0.97 }}
                transition={spring}
                onClick={() => setSelected(i)}
                className={`relative aspect-square w-full overflow-hidden bg-border ${
                  selected === i ? "ring-2 ring-inset ring-coral" : ""
                }`}
              >
                <Image src={photo(i)} alt="" fill sizes="126px" className="object-cover" />
                {selected === i && (
                  <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-coral text-white">
                    <Check size={12} strokeWidth={2.5} />
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {step === "details" && (
        <div className="min-h-0 flex-1 overflow-y-auto">
          {/* preview + caption */}
          <div className="flex gap-3 border-b border-border bg-surface p-4">
            <span className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-border">
              <Image src={photo(selected)} alt="Selected photo" fill sizes="80px" className="object-cover" />
            </span>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption…"
              rows={3}
              className="min-w-0 flex-1 resize-none bg-transparent text-[14px] text-navy placeholder:text-muted focus:outline-none"
            />
          </div>

          {/* tag a business */}
          <button
            type="button"
            onClick={() => setTagSheetOpen(true)}
            className="flex w-full items-center gap-3 border-b border-border bg-surface px-4 py-4 text-left"
          >
            <Store size={20} strokeWidth={1.75} className="text-navy" />
            <span className="flex-1 text-[14px] font-medium text-navy">Tag a business</span>
            {taggedSalon ? (
              <span className="flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1 text-[12px] font-semibold text-navy">
                <Avatar initials={taggedSalon.avatar} category={taggedSalon.category} size={18} />
                {taggedSalon.name}
              </span>
            ) : (
              <ChevronRight size={20} strokeWidth={1.75} className="text-muted" />
            )}
          </button>

          {/* tag your booking */}
          <button
            type="button"
            onClick={() => setTaggedBooking((v) => !v)}
            className="flex w-full items-center gap-3 border-b border-border bg-surface px-4 py-4 text-left"
          >
            <Calendar size={20} strokeWidth={1.75} className="text-navy" />
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium text-navy">Tag your booking</span>
              {recentBooking && (
                <span className="block truncate text-[12px] text-secondary">
                  {recentBooking.offerName} · {recentBooking.salonName} · {recentBooking.date}
                </span>
              )}
            </span>
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                taggedBooking ? "border-ink bg-ink text-white" : "border-border text-transparent"
              }`}
            >
              <Check size={13} strokeWidth={2.5} />
            </span>
          </button>

          {/* share to story toggle */}
          <button
            type="button"
            onClick={() => setShareToStory((v) => !v)}
            className="flex w-full items-center gap-3 border-b border-border bg-surface px-4 py-4 text-left"
          >
            <span className="flex-1 text-[14px] font-medium text-navy">Also share to story</span>
            <span
              className={`flex h-7 w-12 items-center rounded-full p-1 transition-colors ${
                shareToStory ? "justify-end bg-ink" : "justify-start bg-border"
              }`}
            >
              <motion.span layout transition={spring} className="h-5 w-5 rounded-full bg-white shadow" />
            </span>
          </button>

          <div className="px-4 py-6">
            <DarkButton onClick={() => setStep("shared")}>Share post</DarkButton>
          </div>
        </div>
      )}

      {/* tag business sheet */}
      <Sheet open={tagSheetOpen} onClose={() => setTagSheetOpen(false)} title="Tag a business" sub="Businesses you've visited or follow">
        <div className="flex flex-col">
          {salons.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setTaggedSalon(s);
                setTagSheetOpen(false);
              }}
              className="flex items-center gap-3 border-b border-border py-3.5 text-left last:border-b-0"
            >
              <Avatar initials={s.avatar} category={s.category} size={40} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold text-navy">{s.name}</span>
                <span className="block text-[12px] text-secondary">
                  {s.category} · {s.handle}
                </span>
              </span>
              {taggedSalon?.id === s.id && <Check size={18} strokeWidth={2.25} className="text-coral" />}
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
