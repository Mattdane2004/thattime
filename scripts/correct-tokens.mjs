// correct-tokens.mjs — applies documented, judgement-based corrections to the
// Figma semantic export where its values are wrong FOR HOW WE USE THEM. Run AFTER
// any fresh Figma export, BEFORE build-tokens (chained in `npm run tokens`).
// Idempotent: each correction just re-points an alias, so re-running is safe.
//
// Why this exists: the Figma Style collection shipped with (a) a collapsed text
// hierarchy — secondary/tertiary sat one step off primary, so muted text rendered
// almost as dark as body text; and (b) white shadow colours, invisible on light
// surfaces. We keep the real Neutrals/Black ramp (primitives) as the source of
// truth and only fix which step each semantic token points at.
//
// When Figma is fixed at source, delete the matching entries below.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const rd = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));
const prim = rd("Tokens/Mode 1.tokens.json").Colours;

// re-point a semantic token at a primitive path, syncing its baked value + alias name
function repoint(tok, targetPath) {
  const [, group, step] = targetPath.split("/");
  const src = prim[group]?.[step];
  if (!src) throw new Error("no primitive " + targetPath);
  tok.$value = JSON.parse(JSON.stringify(src.$value));
  const a = tok.$extensions?.["com.figma.aliasData"];
  if (a) a.targetVariableName = targetPath;
}

// ── corrections, per mode ────────────────────────────────────────────────────
// Text: give the hierarchy real separation (primary → secondary → muted → disabled).
const TEXT = {
  Light: { secondary: "Colours/grey/700", tertiary: "Colours/grey/500", disable: "Colours/grey/400" },
  Dark: { secondary: "Colours/grey/300", tertiary: "Colours/grey/500" }, // disable=700 already fine
};

let n = 0;
for (const mode of ["Light", "Dark"]) {
  const file = `Tokens/Style/${mode}.tokens.json`;
  const j = rd(file);

  for (const [key, target] of Object.entries(TEXT[mode])) {
    repoint(j.Colours.Text[key], target);
    n++;
  }

  // Shadows: white → black at the same alpha level (Alpha-white/alpha-N → Alpha-black/alpha-N).
  for (const lvl of Object.keys(j.Shadows)) {
    const g = j.Shadows[lvl];
    const colorKey = Object.keys(g).find((k) => k.startsWith("color"));
    const a = g[colorKey]?.$extensions?.["com.figma.aliasData"];
    if (a && /Alpha-white/.test(a.targetVariableName)) {
      repoint(g[colorKey], a.targetVariableName.replace("Alpha-white", "Alpha-black"));
      n++;
    }
  }

  writeFileSync(join(ROOT, file), JSON.stringify(j, null, 1) + "\n");
}
console.log(`✓ corrected ${n} semantic tokens (text hierarchy + shadow colour)`);
