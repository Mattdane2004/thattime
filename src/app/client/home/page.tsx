import { redirect } from "next/navigation";

// The legacy placeholder home was replaced by the full consumer app.
export default function LegacyClientHome() {
  redirect("/c/home");
}
