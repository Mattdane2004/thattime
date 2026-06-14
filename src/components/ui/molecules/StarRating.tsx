import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

// StarRating — a 5-star row filled to `value` (business reviews). Distinct from
// the consumer RatingLabel (compact "4.8 ★ (n)"); both are kept deliberately.
export interface StarRatingProps {
  value: number;
  max?: number;
  size?: number;
  className?: string;
}

export function StarRating({ value, max = 5, size = 13, className }: StarRatingProps) {
  return (
    <span className={cn("flex gap-0.5", className)}>
      {Array.from({ length: max }, (_, i) => i + 1).map((i) => (
        <Star key={i} size={size} className={i <= value ? "fill-navy text-navy" : "text-border"} />
      ))}
    </span>
  );
}
