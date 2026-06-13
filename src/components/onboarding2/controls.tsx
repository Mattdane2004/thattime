// Re-export shim → the canonical design system at "@/components/ui".
// These onboarding/form controls now live in the component library; this file
// keeps existing `@/components/onboarding2/controls` imports working while
// screens migrate to importing from "@/components/ui" directly. Do not add new
// components here.
export {
  PrimaryButton,
  SocialButtons,
  OrDivider,
  Field,
  inputClass,
  PhoneInput,
  OtpInput,
  SelectCard,
  CheckCircle,
  CheckRow,
  PasswordField,
  BottomSheet,
  PermissionDialog,
  ProgressDashes,
} from "@/components/ui";
