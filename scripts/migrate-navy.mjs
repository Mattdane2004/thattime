// migrate-navy.mjs — one-off: replace hardcoded cool/navy colours the central
// token repoint couldn't reach. Reports every change. Run once, then delete.
//
//  - #14181F / #0F1A2E (cool "ink") used as Tailwind arbitrary classes  → fg-primary token
//  - the same hexes inline (SVG fill / style / data)                    → warm #080706
//  - rgba(15,26,46,…) navy-tinted shadows                               → warm rgba(8,7,6,…)
//  - cool chrome greys (#ECECEE, #8E8E93, …)                            → nearest warm hex
//  (category-palette hexes are deliberately NOT in the map — left intact.)

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// ordered: class-form replacements first, then bare-hex, then shadows/greys
const RULES = [
  // arbitrary Tailwind classes -[#HEX] → -fg-primary (works for bg/text/border/ring + /opacity)
  [/-\[#14181[fF]\]/g, "-fg-primary"],
  [/-\[#0[fF]1[aA]2[eE]\]/g, "-fg-primary"],
  // remaining bare hex (inline style, SVG fill, data) → warm primary
  [/#14181[fF]\b/g, "#080706"],
  [/#0[fF]1[aA]2[eE]\b/g, "#080706"],
  // navy-tinted shadows → warm black (preserve blur/alpha, just warm the tint)
  [/rgba\(15,\s*26,\s*46,/g, "rgba(8, 7, 6,"],
  // cool chrome greys → nearest warm ramp value
  [/#ECECEE\b/gi, "#F0E6DC"],
  [/#ECEDEF\b/gi, "#F0E6DC"],
  [/#EBEBED\b/gi, "#F0E6DC"],
  [/#F0F0F0\b/gi, "#F0E6DC"],
  [/#EEF2F6\b/gi, "#F7F0E8"],
  [/#E4E5E9\b/gi, "#E5DDD4"],
  [/#DCDCE0\b/gi, "#E5DDD4"],
  [/#8E8E93\b/gi, "#807B75"],
  [/#9B9B9B\b/gi, "#807B75"],
];

const TARGETS = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) { if (e !== "node_modules" && e !== ".next") walk(p); }
    else if ([".tsx", ".ts", ".css"].includes(extname(p))) TARGETS.push(p);
  }
})(join(ROOT, "src"));
TARGETS.push(join(ROOT, "tailwind.config.ts"));

let files = 0, edits = 0;
for (const f of TARGETS) {
  let src = readFileSync(f, "utf8");
  const before = src;
  let n = 0;
  for (const [re, to] of RULES) src = src.replace(re, (m) => { n++; return to; });
  if (src !== before) {
    writeFileSync(f, src);
    files++; edits += n;
    console.log(`  ${n.toString().padStart(3)}  ${f.replace(ROOT + "/", "")}`);
  }
}
console.log(`\n✓ ${edits} replacements across ${files} files`);
