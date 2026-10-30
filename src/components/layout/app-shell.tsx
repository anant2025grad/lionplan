
import Link from "next/link";

import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";

import type { ReactNode } from "react";

import { ThemeToggle } from "@/components/ui/theme-toggle";

const navigation = [
  {
    label: "Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Degree Progress",
    href: "/planner",
    icon: GraduationCap,
  },
  {
    label: "Course Planner",
    href: "/planner",
    icon: CalendarDays,
  },
  {
    label: "Advisor Workspace",
    href: "/advisor",
    icon: BookOpen,
  },
  {
  label: "Schedule Builder",
  href: "/schedule",
  icon: CalendarDays,
  },
];

export function AppShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col md:flex-row">
        <aside
          className="
            flex w-full shrink-0 flex-col
            border-b border-border bg-surface
            md:min-h-screen md:w-64 md:border-b-0
            md:border-r
          "
        >
          <div className="border-b border-border px-6 py-7">
            <Link href="/" className="block">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center bg-psu-blue text-white">
                  <span className="font-display text-lg">
                    L
                  </span>
                </div>

                <div>
                  <p className="font-display text-base tracking-tight">
                    LIONPLAN
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                    Penn State Beaver
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="px-6 pb-2 pt-7">
            <p className="font-display text-[10px] uppercase tracking-[0.15em] text-muted">
              Workspace / 01
            </p>
          </div>

          <nav
            aria-label="Main navigation"
            className="flex gap-1 overflow-x-auto px-3 pb-4 md:flex-col"
          >
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="
                    flex shrink-0 items-center gap-3
                    px-3 py-3 text-xs text-muted
                    transition-colors duration-200
                    hover:bg-surface-muted
                    hover:text-foreground
                  "
                >
                  <Icon size={16} strokeWidth={1.6} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto hidden border-t border-border p-6 md:block">
            <div className="flex items-center gap-2 text-muted">
              <ShieldCheck size={15} />
              <span className="text-[11px]">
                Planning prototype
              </span>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-muted">
              Independent academic planning tool.
              Not an official degree audit.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header
            className="
              flex h-16 items-center justify-between
              border-b border-border bg-surface
              px-5 md:px-10
            "
          >
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-psu-blue" />

              <span className="font-display text-[10px] uppercase tracking-[0.14em] text-muted">
                Academic Intelligence
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden font-display text-[10px] text-muted sm:block">
                BEAVER / PA
              </span>

              <ThemeToggle />
            </div>
          </header>

          <main className="flex-1 px-5 py-8 md:px-10 md:py-12">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>

          <footer className="flex items-center justify-between border-t border-border px-5 py-4 md:px-10">
            <span className="font-display text-[10px] text-muted">
              LIONPLAN / PROTOTYPE
            </span>

            <a
              href="https://beaver.psu.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-muted hover:text-foreground"
            >
              Penn State Beaver
              <ArrowUpRight size={12} />
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
}
