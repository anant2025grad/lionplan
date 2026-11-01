"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
export function AppShell({ children }: { children: ReactNode }) {
 const pathname = usePathname();
 return <div className="min-h-screen text-foreground">
   <header className="relative z-10">
     <div className="mx-auto flex h-24 max-w-6xl items-center justify-between gap-3 px-5 sm:px-10">
       <Link href="/planner" className="font-display text-[1.9rem] leading-none tracking-tight" aria-label="LionPlan home">LionPlan<span className="ml-1 align-top font-sans text-[10px] font-semibold tracking-widest text-blue-accent">PSU</span></Link>
       <div className="flex items-center gap-2 sm:gap-5">
         <nav aria-label="Main navigation" className="flex items-center gap-1 rounded-full border border-border bg-surface/60 p-1 backdrop-blur-xl">
           {([{href:"/planner",label:"Plan"},{href:"/schedule",label:"Schedule"}] as const).map(item=>{
             const active=pathname===item.href || (pathname==="/"&&item.href==="/planner");
             return <Link key={item.href} href={item.href} aria-current={active?"page":undefined} className={`rounded-full px-4 py-2 text-xs transition-colors sm:px-5 sm:text-sm ${active?"bg-blue-soft font-semibold text-foreground":"text-muted hover:text-foreground"}`}>{item.label}</Link>;
           })}
         </nav>
         <ThemeToggle />
       </div>
     </div>
   </header>
   <main className="relative z-0 mx-auto w-full max-w-6xl px-5 pb-24 pt-10 sm:px-10 sm:pt-16">{children}</main>
   <footer className="mx-auto max-w-6xl px-5 pb-10 text-center text-[11px] text-muted sm:px-10">Independent student prototype · Not an official Penn State degree audit</footer>
 </div>;
}
