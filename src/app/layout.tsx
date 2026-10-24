import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Plan-B: Event Stress-Tester | Resilient Event Planning",
  description:
    "AI-powered event planner that builds your budget, timeline, and vendor checklist, then stress-tests against rain, vendor cancellations, guest surges, and budget cuts.",
  keywords: ["event planner", "stress test", "contingency plan", "wedding planner", "risk scoring", "monte carlo"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
