"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Centerpiece carousel from the Figma flow: a large rounded-square tile with
 * side tiles peeking in from the edges. Pass image srcs for the photo version
 * (B2C) or omit for the grey placeholder version (B2B intro).
 *
 * Placement lives on plain wrappers (framer-motion owns `transform` on the
 * animated nodes, so Tailwind translate utilities can't be used there).
 */
export function PhotoCarousel({ images }: { images?: [string, string, string] }) {
  const tile = "relative overflow-hidden rounded-[40px] bg-[#807B75] h-full w-full";
  return (
    <div className="relative h-[290px] w-full overflow-hidden">
      <div className="absolute right-[calc(50%+146px)] top-1/2 h-[190px] w-[190px] -translate-y-1/2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className={tile}
        >
          {images && <Image src={images[0]} alt="" fill sizes="190px" className="object-cover" />}
        </motion.div>
      </div>
      <div className="absolute left-[calc(50%+146px)] top-1/2 h-[190px] w-[190px] -translate-y-1/2">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className={tile}
        >
          {images && <Image src={images[2]} alt="" fill sizes="190px" className="object-cover" />}
        </motion.div>
      </div>
      <div className="absolute left-1/2 top-1/2 h-[252px] w-[252px] -translate-x-1/2 -translate-y-1/2">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 22 }}
          className={tile}
        >
          {images && <Image src={images[1]} alt="" fill sizes="252px" priority className="object-cover" />}
        </motion.div>
      </div>
    </div>
  );
}
