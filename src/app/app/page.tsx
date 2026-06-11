import { HomeDashboard } from "@/components/app/HomeDashboard";

// Home dashboard — the product app's landing ("Home" tab), restyled to the
// new onboarding identity (Figma "🔴 Onbaording" → Home). Owner variant:
// account-setup checklist + Fresha import shortcut above the day's overview.
export default function HomePage() {
  return <HomeDashboard variant="owner" />;
}
