// migrate-cool.mjs — second pass: replace the remaining COOL blacks & greys
// (Tailwind built-in cool palettes, pure black, cool-neutral grey hexes) with
// the warm Neutrals ramp. Reports every change. Run once, then delete.
// Audited to skip: category palette, social-login logo blues, warm status tints.

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const RULES = [
  // class forms first
  [/-\[#111\]/g, "-fg-primary"], // arbitrary near-black class → token
  [/\b(bg|text|border|ring|fill|stroke|from|to|via|divide|placeholder|outline)-black\b/g, "$1-fg-primary"], // pure black → warm ink
  [/-(?:slate|gray|zinc|neutral)-(\d{2,3})\b/g, "-grey-$1"], // cool Tailwind palettes → warm grey ramp
  // hex forms (inline style / SVG / data / config) — 6-digit before 3-digit
  [/#111111\b/gi, "#0F0E0C"],
  [/#111\b/g, "#0F0E0C"],
  [/#F4F4F6\b/gi, "#F7F0E8"], // cool fog → warm
  [/#E5E5E8\b/gi, "#F0E6DC"], // old cool border → warm
  [/#D6D6DA\b/gi, "#E5DDD4"], // cool slider track → warm
  [/#4A5468\b/gi, "#5C5753"], // cool slate-grey → warm
  [/#FBF6F1\b/gi, "#FDF6EE"], // tidy warm-off → ramp
  [/#EFEDE8\b/gi, "#F0E6DC"], // tidy warm-off → ramp
];

const TARGETS = [];
(function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) { if (e !== "node_modules" && e !== ".next" && e !== "styles") walk(p); }
    else if ([".tsx", ".ts", ".css"].includes(extname(p))) TARGETS.push(p);
  }
})(join(ROOT, "src"));
TARGETS.push(join(ROOT, "tailwind.config.ts"));

let files = 0, edits = 0;
for (const f of TARGETS) {
  let src = readFileSync(f, "utf8");
  const before = src;
  let n = 0;
  for (const [re, to] of RULES) src = src.replace(re, (...a) => { n++; return to.replace("$1", a[1] ?? ""); });
  if (src !== before) {
    writeFileSync(f, src);
    files++; edits += n;
    console.log(`  ${n.toString().padStart(3)}  ${f.replace(ROOT + "/", "")}`);
  }
}
console.log(`\n✓ ${edits} replacements across ${files} files`);
