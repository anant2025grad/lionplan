
import type { Metadata } from "next";

import "./globals.css";

import {
  ThemeProvider,
} from "@/components/providers/theme-provider";

import {
  AppShell,
} from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "LionPlan",
  description:
    "Academic planning and scheduling for Penn State students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
