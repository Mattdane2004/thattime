// Component library barrel — screens import from "@/components/ui".
// Atomic design: atoms → molecules → organisms. Single entry point.
// Built shadcn-style (cva + cn); token classes remap to the Figma shadcn
// palette when that JSON lands — variant APIs stay stable.

// ── atoms ──
export { Button, buttonVariants, type ButtonProps } from "./atoms/Button";
export { Input, type InputProps } from "./atoms/Input";
export { Textarea, type TextareaProps } from "./atoms/Textarea";
export { Label } from "./atoms/Label";
export { Badge, badgeVariants, type BadgeProps } from "./atoms/Badge";
export { Avatar, avatarVariants, type AvatarProps } from "./atoms/Avatar";
export { Chip, type ChipProps } from "./atoms/Chip";
export { Spinner, type SpinnerProps } from "./atoms/Spinner";
export { Separator, type SeparatorProps } from "./atoms/Separator";
export { Switch } from "./atoms/Switch";
export { Checkbox } from "./atoms/Checkbox";
export { CheckCircle } from "./atoms/CheckCircle";

// ── molecules ──
export { Card, cardVariants, type CardProps } from "./molecules/Card";
export { Field, type FieldProps } from "./molecules/Field";
export { ListRow, type ListRowProps } from "./molecules/ListRow";
export { SegmentedControl, type SegmentedControlProps, type SegmentedOption } from "./molecules/SegmentedControl";
export { EmptyState, type EmptyStateProps } from "./molecules/EmptyState";
export { StatTile, type StatTileProps } from "./molecules/StatTile";
export { RadioGroup, RadioGroupItem } from "./molecules/RadioGroup";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./molecules/Tabs";
export { Dialog, DialogTrigger, DialogClose, DialogContent, DialogTitle, DialogDescription } from "./molecules/Dialog";
export { Sheet, SheetTrigger, SheetClose, SheetContent, type SheetContentProps } from "./molecules/Sheet";
export { Toaster, toast, type ToastItem } from "./molecules/Toast";

// ── onboarding/form molecules (ported from onboarding2/controls; identical APIs) ──
export { PhoneInput, inputClass } from "./molecules/PhoneInput";
export { OtpInput } from "./molecules/OtpInput";
export { SelectCard } from "./molecules/SelectCard";
export { CheckRow } from "./molecules/CheckRow";
export { SocialButtons } from "./molecules/SocialButtons";
export { OrDivider } from "./molecules/OrDivider";
export { ProgressDashes } from "./molecules/ProgressDashes";
