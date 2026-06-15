// Service icon set — the glyphs offered in the wizard "Icons" bottom sheet
// (Figma 12216:32064). Each icon is tagged with the category chips it appears
// under so the sheet's filter/search can narrow the grid. Stored on the draft
// as a stable string key (ServiceDraft.icon) and resolved back to a component
// with `iconFor`.
import {
  Scissors, Wind, Brush, SprayCan, Crown, Palette, PaintRoller, PaintBucket,
  Pipette, Droplet, Sparkles, Star, Diamond, Gem, WandSparkles, Smile, Eye,
  Hand, Feather, Sun, Flower2, Leaf, Flame, Heart, HandHeart, Bath, Dumbbell,
  type LucideIcon,
} from "lucide-react";

export interface ServiceIconDef {
  key: string;
  label: string;
  Icon: LucideIcon;
  cats: string[];
}

/** Filter chips shown above the icon grid. "All" is implicit (no filter). */
export const iconCategories = ["All", "Hair", "Colour", "Barbering", "Beauty", "Nails", "Wellness"] as const;

export const serviceIcons: ServiceIconDef[] = [
  { key: "scissors", label: "Scissors", Icon: Scissors, cats: ["Hair", "Barbering"] },
  { key: "wind", label: "Blow dry", Icon: Wind, cats: ["Hair"] },
  { key: "brush", label: "Brush", Icon: Brush, cats: ["Hair", "Barbering", "Colour"] },
  { key: "spray", label: "Spray", Icon: SprayCan, cats: ["Hair", "Barbering"] },
  { key: "crown", label: "Crown", Icon: Crown, cats: ["Hair", "Beauty"] },
  { key: "palette", label: "Palette", Icon: Palette, cats: ["Colour"] },
  { key: "roller", label: "Roller", Icon: PaintRoller, cats: ["Colour"] },
  { key: "bucket", label: "Bucket", Icon: PaintBucket, cats: ["Colour"] },
  { key: "pipette", label: "Pipette", Icon: Pipette, cats: ["Colour"] },
  { key: "droplet", label: "Droplet", Icon: Droplet, cats: ["Colour", "Nails", "Wellness"] },
  { key: "sparkles", label: "Sparkles", Icon: Sparkles, cats: ["Beauty", "Nails"] },
  { key: "star", label: "Star", Icon: Star, cats: ["Beauty", "Nails"] },
  { key: "diamond", label: "Diamond", Icon: Diamond, cats: ["Beauty"] },
  { key: "gem", label: "Gem", Icon: Gem, cats: ["Beauty"] },
  { key: "wand", label: "Wand", Icon: WandSparkles, cats: ["Beauty"] },
  { key: "smile", label: "Smile", Icon: Smile, cats: ["Beauty"] },
  { key: "eye", label: "Eye", Icon: Eye, cats: ["Beauty"] },
  { key: "hand", label: "Hand", Icon: Hand, cats: ["Nails"] },
  { key: "feather", label: "Feather", Icon: Feather, cats: ["Barbering", "Beauty"] },
  { key: "sun", label: "Sun", Icon: Sun, cats: ["Wellness", "Beauty"] },
  { key: "flower", label: "Flower", Icon: Flower2, cats: ["Wellness", "Beauty"] },
  { key: "leaf", label: "Leaf", Icon: Leaf, cats: ["Wellness"] },
  { key: "flame", label: "Flame", Icon: Flame, cats: ["Wellness"] },
  { key: "heart", label: "Heart", Icon: Heart, cats: ["Wellness", "Beauty"] },
  { key: "care", label: "Care", Icon: HandHeart, cats: ["Wellness"] },
  { key: "bath", label: "Bath", Icon: Bath, cats: ["Wellness"] },
  { key: "fitness", label: "Fitness", Icon: Dumbbell, cats: ["Wellness"] },
];

const byKey = new Map(serviceIcons.map((i) => [i.key, i]));

/** Resolve a stored icon key to a lucide component (falls back to Scissors). */
export function iconFor(key: string | undefined): LucideIcon {
  return (key && byKey.get(key)?.Icon) || Scissors;
}
