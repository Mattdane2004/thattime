// Wireframe photo placeholder — each "photo" is a label + a grey shade.
// In a real app these would be URLs; here we just render numbered grey tiles.

const shades = [
  'bg-gray-200',
  'bg-gray-300',
  'bg-gray-100',
  'bg-stone-200',
  'bg-zinc-200',
  'bg-neutral-300',
];

export function makePhoto(index) {
  return {
    id: 'p' + Date.now() + '-' + index,
    label: 'Photo ' + (index + 1),
    shade: shades[index % shades.length],
  };
}
