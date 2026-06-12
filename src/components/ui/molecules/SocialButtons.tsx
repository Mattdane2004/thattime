"use client";

import { motion } from "framer-motion";

// SocialButtons — Apple / Google / Facebook auth. Brand marks stay bespoke SVGs
// (logo colours are intentional, not theme tokens). API identical to original.
export function SocialButtons({ onPick }: { onPick: (p: "apple" | "google" | "facebook") => void }) {
  return (
    <div className="flex flex-col gap-3">
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onPick("apple")}
        className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-fg-primary text-[15px] font-semibold text-white"
      >
        <svg width="16" height="19" viewBox="0 0 16 19" fill="currentColor" aria-hidden>
          <path d="M13.06 10.05c.02 2.42 2.12 3.22 2.14 3.23-.02.06-.33 1.15-1.1 2.27-.67.97-1.36 1.94-2.45 1.96-1.07.02-1.42-.64-2.65-.64-1.22 0-1.6.62-2.62.66-1.05.04-1.86-1.05-2.53-2.02C2.47 13.53 1.4 9.9 2.81 7.42a3.93 3.93 0 0 1 3.32-2.02c1.03-.02 2.01.7 2.65.7.63 0 1.82-.86 3.07-.73.52.02 1.99.21 2.93 1.59-.08.05-1.75 1.02-1.72 3.09M11.05 4.05c.56-.68.94-1.63.84-2.57-.81.03-1.79.54-2.37 1.22-.52.6-.98 1.57-.85 2.49.9.07 1.82-.46 2.38-1.14" />
        </svg>
        Continue with Apple
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onPick("google")}
        className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-white text-[15px] font-semibold text-navy shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-border"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C36.9 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
        </svg>
        Continue with Google
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onPick("facebook")}
        className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-[#1877F2] text-[15px] font-semibold text-white"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4h-3V12h3V9.4c0-3 1.8-4.7 4.6-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" />
        </svg>
        Continue with Facebook
      </motion.button>
    </div>
  );
}
