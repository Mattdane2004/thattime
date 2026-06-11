import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "That Time Onboarding",
  description: "A high-fidelity B2B onboarding prototype for That Time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
