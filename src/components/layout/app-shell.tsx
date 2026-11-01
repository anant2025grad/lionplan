"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-5 sm:px-8">
          <Link href="/planner" className="flex items-center gap-3" aria-label="LionPlan home">
            <span className="flex h-8 w-8 items-center justify-center bg-psu-blue font-display text-lg text-white">L</span>
            <span className="font-display text-base font-bold tracking-tight">LIONPLAN</span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-3">
            <nav aria-label="Main navigation" className="flex items-center gap-1">
              {([{ href: "/planner", label: "Plan" }, { href: "/schedule", label: "Schedule" }] as const).map((item) => {
                const active = pathname === item.href || (pathname === "/" && item.href === "/planner");
                return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}
                  className={`px-3 py-2 text-sm transition-colors ${active ? "font-semibold text-foreground" : "text-muted hover:text-foreground"}`}>{item.label}</Link>;
              })}
            </nav>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-14">{children}</main>
      <footer className="mx-auto max-w-5xl px-5 pb-8 text-center text-[11px] text-muted sm:px-8">
        Independent planning prototype · Not an official Penn State degree audit
      </footer>
    </div>
  );
}
