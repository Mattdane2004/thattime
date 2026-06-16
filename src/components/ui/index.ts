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
// In-use pill CTAs + status pill (kept verbatim while the shadcn Button/Badge
// look-and-feel is settled; these are what the screens render today).
export { PrimaryButton, DarkButton, GhostButton } from "./atoms/PrimaryButton";
export { StatusPill } from "./atoms/StatusPill";
export { Tag, type TagProps } from "./atoms/Tag";

// ── molecules ──
export { Card, cardVariants, type CardProps } from "./molecules/Card";
export { Field, type FieldProps } from "./molecules/Field";
export { ListRow, type ListRowProps } from "./molecules/ListRow";
export { SegmentedControl, type SegmentedControlProps, type SegmentedOption } from "./molecules/SegmentedControl";
export { EmptyState, type EmptyStateProps } from "./molecules/EmptyState";
export { StatTile, type StatTileProps } from "./molecules/StatTile";
export { SummaryRow, type SummaryRowProps } from "./molecules/SummaryRow";
export { RadioGroup, RadioGroupItem } from "./molecules/RadioGroup";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./molecules/Tabs";
export { Dialog, DialogTrigger, DialogClose, DialogContent, DialogTitle, DialogDescription } from "./molecules/Dialog";
export { Toaster, toast, type ToastItem } from "./molecules/Toast";
// Frame-scoped overlays (render inside the phone frame, not a body portal) —
// the app's canonical Sheet/BottomSheet/PermissionDialog.
export { Sheet, BottomSheet, PermissionDialog } from "./molecules/Overlays";
// In-use app molecules: sliding-pill segmented control, password field, and the
// pageable month calendar + time-slot chips.
export { Segmented } from "./molecules/Segmented";
export { PasswordField } from "./molecules/PasswordField";
export { MiniCalendar, TimeChips, timeSlots } from "./molecules/MiniCalendar";
export { ToggleRow, type ToggleRowProps } from "./molecules/ToggleRow";
export { SettingsGroup } from "./molecules/SettingsGroup";
export { StarRating, type StarRatingProps } from "./molecules/StarRating";

// ── onboarding/form molecules (ported from onboarding2/controls; identical APIs) ──
export { PhoneInput, inputClass } from "./molecules/PhoneInput";
export { OtpInput } from "./molecules/OtpInput";
export { SelectCard } from "./molecules/SelectCard";
export { CheckRow } from "./molecules/CheckRow";
export { SocialButtons } from "./molecules/SocialButtons";
export { OrDivider } from "./molecules/OrDivider";
export { ProgressDashes } from "./molecules/ProgressDashes";

// ── organisms ──
export { AppHeader, SectionLabel } from "./organisms/AppHeader";
export { BackHeader, type BackHeaderProps } from "./organisms/BackHeader";
// Compact nav-bar header (distinct from the hero BackHeader) + offer-wizard chrome.
export { ScreenHeader } from "./organisms/ScreenHeader";
export { TOTAL_STEPS, WizardTitle, WizardFooter, FieldLabel, Toggle, fieldInput } from "./organisms/WizardChrome";
export { ClientTabBar } from "./organisms/ClientTabBar";

// Consumer surface (coral) components live in ./consumer — import them from
// "@/components/ui/consumer". Kept as a namespaced sub-module so its
// category-tinted Avatar / compact Stars stay distinct from the business
// primitives in this barrel.
