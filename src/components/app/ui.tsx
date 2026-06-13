// Re-export shim → the canonical design system at "@/components/ui".
// These app primitives now live in the component library; this file keeps
// existing `@/components/app/ui` imports working while screens migrate to
// importing from "@/components/ui" directly. Do not add new components here.
export {
  AppHeader,
  SectionLabel,
  Segmented,
  Sheet,
  DarkButton,
  GhostButton,
  StatusPill,
  MiniCalendar,
  TimeChips,
  timeSlots,
} from "@/components/ui";
