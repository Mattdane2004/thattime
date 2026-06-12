import { redirect } from "next/navigation";

// The standalone /login route is superseded by the new onboarding flow.
export default function LoginRedirect() {
  redirect("/onboarding/login");
}
