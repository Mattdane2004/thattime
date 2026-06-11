import { PlaceholderScreen } from "@/components/onboarding/screens";

const titles: Record<string, string> = {
  services: "Set up your services.",
  clients: "Bring your clients across.",
  hours: "Set your opening hours.",
  logo: "Add your logo.",
  payments: "Set up payments.",
  team: "Invite your team.",
  profile: "Make your profile bookable.",
};

export default function Page({ params }: { params: { slug: string } }) {
  return <PlaceholderScreen title={titles[params.slug] || "Coming soon."} />;
}
