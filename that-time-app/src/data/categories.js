export const defaultCategories = [
  { name: 'Hair',           color: '#7C3AED' },
  { name: 'Colour',         color: '#EC4899' },
  { name: 'Barbering',      color: '#475569' },
  { name: 'Beauty',         color: '#F43F5E' },
  { name: 'Nails',          color: '#F59E0B' },
  { name: 'Massage',        color: '#0D9488' },
  { name: 'Brows & lashes', color: '#C026D3' },
  { name: 'Fitness',        color: '#10B981' },
  { name: 'Wellness',       color: '#0EA5E9' },
];

export const categorySwatches = [
  '#7C3AED', '#EC4899', '#F43F5E', '#F59E0B',
  '#10B981', '#0D9488', '#0EA5E9', '#6366F1',
  '#C026D3', '#84CC16', '#F97316', '#475569',
];

// Backwards-compat shim: most consumers still iterate a flat list of names.
export const categories = defaultCategories;

// Convert a hex (#RRGGBB) to rgba with given alpha — used for soft tinted backgrounds.
export function tintFromHex(hex, alpha = 0.12) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return `rgba(0,0,0,${alpha})`;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`;
}
