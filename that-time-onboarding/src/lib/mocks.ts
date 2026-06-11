type SocialProvider = "apple" | "google" | "facebook";

const wait = (ms: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });

export async function mockSocialAuth(provider: SocialProvider) {
  await wait(1200);
  return {
    email:
      provider === "apple"
        ? "alex@icloud.com"
        : provider === "facebook"
          ? "alex@facebook.test"
          : "alex@example.com",
  };
}

export async function mockSendSMS(phone: string) {
  void phone;
  await wait(800);
  return { success: true };
}

export async function mockVerifyCode(code: string) {
  await wait(600);
  return { success: code.length === 6 };
}

export async function mockGetLocation() {
  await wait(1500);
  return { city: "London", postcode: "SW1A 1AA" };
}

export async function mockJoinByCode(code: string) {
  await wait(900);
  const trimmed = code.trim();
  if (!trimmed) return { success: false as const };
  return {
    success: true as const,
    businessName: "Studio Nova",
    managerName: "Alex",
  };
}

type SignInProvider = SocialProvider | "email";

export async function mockSignIn(
  provider: SignInProvider,
  email?: string,
) {
  await wait(1100);
  const lookup = (email || "").toLowerCase();
  const role: "owner" | "staff" | "client" = lookup.includes("staff")
    ? "staff"
    : lookup.includes("client") || lookup.includes("customer")
      ? "client"
      : "owner";
  return {
    success: true as const,
    role,
    businessName: role === "client" ? "" : "Studio Nova",
    firstName: role === "staff" ? "Sam" : role === "client" ? "Mia" : "Alex",
    email:
      provider === "apple"
        ? "alex@icloud.com"
        : provider === "facebook"
          ? "alex@facebook.test"
        : provider === "google"
          ? "alex@example.com"
          : email || "alex@example.com",
  };
}
