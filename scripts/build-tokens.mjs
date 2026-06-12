// build-tokens.mjs — resolves the Figma DTCG export in `Tokens/` into
// app-consumable token layers, WITHOUT touching the source.
//
//   Tokens/ (Figma source of truth, mirrors the Figma collections 1:1)
//     ├─ Mode 1.tokens.json          → Primitives   (raw palette + number scale)
//     ├─ Style/{Light,Dark}.json     → Style        (semantic colour + shadows, themed)
//     └─ Responsiveness/{Desktop,…}  → Responsiveness (type scale, radius, grid, spacing)
//
//   →  src/styles/tokens.css         (:root + .dark CSS custom properties)
//   →  src/styles/tokens.tailwind.ts (object the tailwind config merges in)
//
// CONTRACT — the generated CSS var names mirror the Figma token paths exactly
// (kebab-cased), so Figma ⇄ code stays a deterministic round-trip:
//     Figma  Colours/Text/primary   ⇄   --colours-text-primary
//     Figma  Radius/rounded-md       ⇄   --radius-rounded-md
//
// ALIASES are preserved: a semantic token that points at a primitive emits a
// `var(--…)` reference, not a baked hex — so swapping the placeholder primitive
// hexes later (real brand) propagates everywhere with one edit. Raw (un-aliased)
// values emit literally.
//
// HELD (per design decision): the type scale is generated from Desktop only;
// Mobile/Tablet type is undecided, so only the *layout* values that actually
// differ per breakpoint (side margin, grid gutter) emit responsive overrides.
//
// Run: `node scripts/build-tokens.mjs`  (or `npm run tokens`)

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

// ── path → css var name ──────────────────────────────────────────────────────
const kebab = (s) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2") // camelCase split
    .replace(/[^a-zA-Z0-9]+/g, "-") // spaces, slashes, punctuation
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

const varName = (path) => "--" + path.map(kebab).join("-");

// Figma alias target "Colours/grey/950" → "var(--colours-grey-950)"
const aliasToVar = (targetName) =>
  `var(${varName(targetName.split("/").map((s) => s.trim()))})`;

const WEIGHTS = { thin: 100, extralight: 200, light: 300, regular: 400, normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900 };

// ── value renderers ──────────────────────────────────────────────────────────
const alias = (tok) => tok?.$extensions?.["com.figma.aliasData"]?.targetVariableName;

const channels = (v) => (v.components || []).map((c) => Math.round(c * 255)).join(" ");

// CSS-var declaration value. Solids emit "r g b" channels (shadcn pattern) so
// Tailwind can apply <alpha-value> (enables bg-navy/40 etc.); aliases pass
// through (channels chain through var()). Alpha is dropped here — the only
// alpha-bearing tokens (Alpha-*) are consumed as literal colours via fullColor().
function colorValue(tok) {
  const a = alias(tok);
  if (a) return aliasToVar(a);
  const v = tok.$value;
  if (typeof v === "string") return v;
  return channels(v);
}

// Literal rgba() — for places that need a real colour string (shadows). Resolves
// an alias down to its primitive to recover the baked alpha.
function fullColor(tok, primRoot) {
  const a = alias(tok);
  const t = a ? a.split("/").reduce((o, k) => o?.[k.trim()], primRoot) : tok;
  const v = (t || tok).$value;
  const [r, g, b] = (v.components || []).map((c) => Math.round(c * 255));
  return `rgba(${r}, ${g}, ${b}, ${+(v.alpha ?? 1).toFixed(3)})`;
}

// resolve Figma's internal `{a.b.c}` string-refs against the same file
function resolveRef(value, fileRoot) {
  if (typeof value !== "string" || !value.startsWith("{")) return value;
  const node = value.slice(1, -1).split(".").reduce((o, k) => o?.[k], fileRoot);
  return node?.$value ?? value;
}

function numberValue(path, v) {
  const key = path[path.length - 1].toLowerCase();
  if (key.includes("column")) return String(v); // grid columns are unitless
  return `${v}px`;
}

// ── walk a token tree → ordered [ {path, css} ] custom-property lines ─────────
function emit(node, path, out, fileRoot) {
  for (const k of Object.keys(node)) {
    if (k.startsWith("$")) continue;
    const child = node[k];
    if (child && typeof child === "object" && "$value" in child) {
      const p = [...path, k];
      const t = child.$type;
      let css;
      if (t === "color") css = colorValue(child);
      else if (t === "number") css = numberValue(p, child.$value);
      else if (t === "string") {
        const raw = resolveRef(child.$value, fileRoot);
        const w = WEIGHTS[String(raw).toLowerCase()];
        css = k.toLowerCase().includes("weight") && w ? String(w) : `"${raw}"`;
      } else css = String(child.$value);
      out.push({ name: varName(p), css });
    } else if (child && typeof child === "object") {
      emit(child, [...path, k], out, fileRoot);
    }
  }
}

const block = (lines) => lines.map(({ name, css }) => `  ${name}: ${css};`).join("\n");

// ── composed box-shadows (Figma decomposes into x/y/blur/spread/color) ───────
function shadows(styleFile, primRoot) {
  const s = styleFile.Shadows || {};
  return Object.keys(s).map((name) => {
    const g = s[name];
    const part = (kk) => Object.keys(g).find((x) => x.startsWith(kk)); // tolerate "color 2"
    const px = (kk) => `${g[part(kk)]?.$value ?? 0}px`;
    const col = fullColor(g[part("color")] ?? { $value: { components: [0, 0, 0], alpha: 0 } }, primRoot);
    return { name: `--shadow-${kebab(name)}`, css: `${px("x")} ${px("y")} ${px("blur")} ${px("spread")} ${col}` };
  });
}

// ── load source ──────────────────────────────────────────────────────────────
const primitives = read("Tokens/Mode 1.tokens.json");
const light = read("Tokens/Style/Light.tokens.json");
const dark = read("Tokens/Style/Dark.tokens.json");
const desktop = read("Tokens/Responsiveness/Desktop.tokens.json");
const tablet = read("Tokens/Responsiveness/Tablet.tokens.json");
const mobile = read("Tokens/Responsiveness/Mobile.tokens.json");

// :root = primitives + responsiveness(Desktop) + Light semantics
const prim = []; emit(primitives, [], prim, primitives);
const resp = []; emit({ Text: desktop.Text, Radius: desktop.Radius, Grid: desktop.Grid, Spacing: desktop.Spacing, "Device width": desktop["Device width"] }, [], resp, desktop);
const lightSem = []; emit({ Colours: light.Colours }, [], lightSem, light);
const darkSem = []; emit({ Colours: dark.Colours }, [], darkSem, dark);

// responsive layout overrides — only the values that genuinely differ
const layoutVar = (f, group, key) => ({ name: varName([group, key]), css: numberValue([group, key], f[group][key].$value) });
const respOverride = (f) => [layoutVar(f, "Spacing", "Side margin"), layoutVar(f, "Grid", "Grid gutter")];

const css = `/* tokens.css — GENERATED by scripts/build-tokens.mjs from Tokens/. DO NOT EDIT BY HAND.
 * Var names mirror the Figma token paths 1:1 (kebab-cased) for round-trip fidelity.
 * Semantic tokens reference primitives via var(--…) so swapping primitive hexes propagates. */

:root {
  /* ============ PRIMITIVES — Figma collection "Primitives" (Mode 1) ============ */
${block(prim)}

  /* ============ RESPONSIVENESS — collection "Responsiveness", mode Desktop ============
   * (type scale generated from Desktop; Mobile/Tablet type HELD pending decisions) */
${block(resp)}

  /* ============ STYLE — collection "Style", mode Light ============ */
${block(lightSem)}
${block(shadows(light, primitives))}
}

.dark {
  /* ============ STYLE — collection "Style", mode Dark ============ */
${block(darkSem)}
${block(shadows(dark, primitives))}
}

/* Responsive layout overrides — only side-margin & grid-gutter differ per breakpoint.
 * Type/radius/spacing held at Desktop until Mobile/Tablet scales are finalised. */
@media (max-width: 1024px) {
  :root {
${respOverride(tablet).map(({ name, css }) => `    ${name}: ${css};`).join("\n")}
  }
}
@media (max-width: 600px) {
  :root {
${respOverride(mobile).map(({ name, css }) => `    ${name}: ${css};`).join("\n")}
  }
}
`;

// ── tailwind partial — ergonomic utilities pointing at the faithful vars ──────
// (CSS vars stay the source of truth + round-trip contract; this is convenience.)
const ref = (path) => `var(${varName(path)})`;
// colour helper — channel pattern so Tailwind opacity modifiers (bg-x/40) work.
const c = (path) => `rgb(var(${varName(path)}) / <alpha-value>)`;
const cgroup = (root, prefix) =>
  Object.fromEntries(Object.keys(root).map((k) => [kebab(k), c([...prefix, k])]));

const radiusKeys = desktop.Radius;
const tw = {
  colors: {
    // semantic (themed) — Figma "Text" group exposed as `fg` to avoid `text-text-*`
    fg: cgroup(light.Colours.Text, ["Colours", "Text"]),
    surface: Object.fromEntries(Object.keys(light.Colours.Surface).map((k) => [k.replace("level-", ""), c(["Colours", "Surface", k])])),
    border: { DEFAULT: c(["Colours", "Border", "border"]), ...cgroup(light.Colours.Border, ["Colours", "Border"]) },
    brand: { DEFAULT: c(["Colours", "Brand", "brand-primary"]), primary: c(["Colours", "Brand", "brand-primary"]), secondary: c(["Colours", "Brand", "brand-secondary"]), tertiary: c(["Colours", "Brand", "brand-tertiary"]) },
    input: c(["Colours", "Input", "input"]),
    // NOTE: button Ghost/Outline states alias Alpha-* tokens (baked alpha); they
    // don't fit the channel pattern, so Button styles those states directly.
    // primitive hue scales (escape hatch)
    ...Object.fromEntries(Object.keys(primitives.Colours).map((hue) => [kebab(hue), cgroup(primitives.Colours[hue], ["Colours", hue])])),
  },
  borderRadius: Object.fromEntries(Object.keys(radiusKeys).map((k) => [k.replace("rounded-", "").replace("rounded", "DEFAULT") || "DEFAULT", ref(["Radius", k])])),
  boxShadow: Object.fromEntries(shadows(light, primitives).map((s) => [s.name.replace("--shadow-", ""), `var(${s.name})`])),
  fontSize: Object.fromEntries(
    Object.keys(desktop.Text).filter((k) => desktop.Text[k]?.["font-size"]).map((k) => [
      kebab(k),
      [ref(["Text", k, "font-size"]), { lineHeight: ref(["Text", k, "line-height"]), letterSpacing: ref(["Text", k, "letter-spacing"]) }],
    ]),
  ),
  fontFamily: { heading: [`var(${varName(["Text", "font definitions", "font-family-headings"])})`, "sans-serif"], sans: [`var(${varName(["Text", "font definitions", "font-family-sans"])})`, "sans-serif"] },
  // NOTE: the Numbers primitive scale is intentionally NOT mapped to Tailwind
  // `spacing` — its keys (4 → 4px) would clobber Tailwind's rem scale (4 → 16px)
  // and silently break every p-/gap-/m- utility. The --numbers-* CSS vars exist
  // for direct use; spacing stays on Tailwind's default scale.
};

const twFile = `// tokens.tailwind.ts — GENERATED by scripts/build-tokens.mjs. DO NOT EDIT BY HAND.
// Ergonomic Tailwind theme pointing at the CSS vars in src/styles/tokens.css.
// Merge into tailwind.config.ts \`theme.extend\`. NOTE: Figma "Text" colour group
// is exposed here as \`fg\` (so utilities read \`text-fg-primary\`, not \`text-text-*\`).
export const tokens = ${JSON.stringify(tw, null, 2)};
`;

mkdirSync(join(ROOT, "src/styles"), { recursive: true });
writeFileSync(join(ROOT, "src/styles/tokens.css"), css);
writeFileSync(join(ROOT, "src/styles/tokens.tailwind.ts"), twFile);
console.log(`✓ tokens.css        (${prim.length} primitives, ${lightSem.length} semantic, ${resp.length} responsive)`);
console.log(`✓ tokens.tailwind.ts`);
