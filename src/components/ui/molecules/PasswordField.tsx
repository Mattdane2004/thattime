"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { inputClass } from "./PhoneInput";

/** Password field with eye toggle + animated 3-segment strength meter. */
export function PasswordField({
  value,
  onChange,
  withMeter = true,
  hint = "Use 8 or more characters.",
}: {
  value: string;
  onChange: (v: string) => void;
  withMeter?: boolean;
  hint?: string;
}) {
  const [show, setShow] = useState(false);
  const score = value.length >= 12 ? 3 : value.length >= 8 ? 2 : value.length > 0 ? 1 : 0;
  return (
    <div>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder="Password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} pr-12`}
        />
        <button
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow((s) => !s)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary"
        >
          {show ? <EyeOff size={19} strokeWidth={1.6} /> : <Eye size={19} strokeWidth={1.6} />}
        </button>
      </div>
      {withMeter && (
        <div className="mt-3 flex gap-2">
          {[1, 2, 3].map((i) => (
            <motion.span
              key={i}
              className="h-[5px] flex-1 origin-left rounded-full"
              animate={{ backgroundColor: score >= i ? "#0F0E0C" : "#F0E6DC" }}
              transition={{ duration: 0.25 }}
            />
          ))}
        </div>
      )}
      <p className="mt-2 text-[13px] text-secondary">{hint}</p>
    </div>
  );
}
