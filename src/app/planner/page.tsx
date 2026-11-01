"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { useStudentPlan } from "@/hooks/use-student-plan";
import { useAcademicStore } from "@/stores/academic-store";
import { ReportImport } from "@/components/planner/report-import";
import { DemoStudentLoader } from "@/components/planner/demo-student-loader";
import { GeneralEducation } from "@/components/planner/general-education";

export default function PlannerPage() {
  const { courses, reportLoaded, evaluation, recommendations, programName, warnings: programWarnings } = useStudentPlan();
  const confirmed = useAcademicStore((s) => s.recordConfirmed);
  const confirm = useAcademicStore((s) => s.confirmReport);
  const clear = useAcademicStore((s) => s.clearReport);
  const importWarnings = useAcademicStore((s) => s.warnings);
  const isPreMajor = useAcademicStore((s) => s.isPreMajor);
  const option = useAcademicStore((s) => s.cyberOption);
  const setOption = useAcademicStore((s) => s.setCyberOption);
  const [details, setDetails] = useState(false);
  const [showAll, setShowAll] = useState(false);
  if (!reportLoaded) return <div className="lion-reveal mx-auto max-w-2xl space-y-10 pt-10 sm:pt-20">
    <div className="text-center"><h1 className="editorial-title">A clearer path to graduation.</h1>
      <p className="mt-3 text-sm text-muted">Your degree. Your next courses. Your schedule.</p></div>
    <ReportImport />
    <div className="text-center"><DemoStudentLoader /></div>
  </div>;
  if (!confirmed) return <div className="lion-reveal mx-auto max-w-2xl space-y-9">
    <div><p className="text-xs font-semibold uppercase tracking-widest text-blue-accent">Step 1 of 2</p>
      <h1 className="mt-3 editorial-subtitle">Check your courses</h1>
      <p className="mt-2 text-sm text-muted">Make sure we read your report correctly before planning.</p></div>
    <div className="glass-panel">
      <div className="flex items-center justify-between border-b border-border px-5 py-4"><span className="text-sm font-semibold">{courses.length} courses found</span><button type="button" onClick={clear} className="text-xs text-muted underline">Start over</button></div>
      <div className="max-h-[440px] divide-y divide-border overflow-auto">{courses.map((c,i) => <div key={`${c.code}-${c.term}-${i}`} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
        <span><strong className="font-display text-xs">{c.code}</strong><span className="ml-3 text-muted">{c.title}</span></span>
        <span className="shrink-0 text-xs text-muted">{c.status.replace("_", " ")}</span></div>)}</div>
    </div>
    {(importWarnings.length > 0 || isPreMajor) && <details className="text-xs text-muted"><summary className="cursor-pointer">Import notes</summary><div className="mt-2 space-y-1">{isPreMajor && <p>Pre-major report: confirm your degree requirements with an adviser.</p>}{importWarnings.map((w,i)=><p key={i}>{w}</p>)}</div></details>}
    <button type="button" onClick={confirm} className="flex w-full items-center justify-center gap-2 lion-button px-6 py-3 text-sm font-semibold text-white"><Check size={16}/> These courses look right</button>
    <p className="text-center text-xs text-muted">If anything is missing, replace the report and try again.</p>
  </div>;
  const outstanding = evaluation?.requirements.filter((r) => r.status !== "completed") ?? [];
  const visible = showAll ? (evaluation?.requirements ?? []) : outstanding.slice(0, 5);
  const distinct = Array.from(new Map(recommendations.map((r) => [r.courseCode,r])).values());
  return <div className="lion-reveal mx-auto max-w-3xl space-y-14">
    <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-blue-accent">Your plan</p><h1 className="mt-2 editorial-subtitle tracking-tight">{programName ?? "Your degree"}</h1><p className="mt-2 text-sm text-muted">Penn State Beaver · Provisional 2026–27 requirements</p></div>
      <button type="button" onClick={clear} className="flex shrink-0 items-center gap-1 text-xs text-muted hover:text-foreground"><RotateCcw size={13}/> Replace PDF</button></div>
    <section className="space-y-4 glass-panel p-6 sm:p-9">
      <div className="flex items-end justify-between gap-4"><div><p className="text-sm text-muted">Requirements completed</p><p className="mt-2 editorial-subtitle">{evaluation?.completed ?? 0} <span className="text-base font-normal text-muted">of {evaluation?.total ?? 0}</span></p></div>
      <span className="text-sm font-semibold">{evaluation?.coveragePercentage ?? 0}%</span></div>
      <div className="h-1.5 bg-surface-muted"><div className="h-full bg-psu-blue" style={{width:`${evaluation?.coveragePercentage ?? 0}%`}}/></div>
      <p className="text-xs text-muted">Tracked requirement groups only — not graduation progress.</p>
    </section>
    <section className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-3xl">What you still need</h2>
      <label className="flex items-center gap-2 text-xs text-muted">Option <select value={option} onChange={(e)=>setOption(e.target.value as "operations"|"analytics")} className="glass-panel px-2 py-2 text-foreground"><option value="operations">Operations</option><option value="analytics">Analytics</option></select></label></div>
      <div className="divide-y divide-border border-y border-border">{visible.map((r) => <div key={r.requirement.id} className="lion-row flex items-center justify-between gap-4 py-4"><div><p className="text-sm font-medium">{r.requirement.label}</p><p className="mt-1 text-xs text-muted">{r.requirement.alternatives.join(" · ")}</p></div><span className="shrink-0 text-xs text-muted">{r.status === "in_progress" ? "In progress" : r.status === "completed" ? "Done" : r.status === "attention" ? "Review" : "Needed"}</span></div>)}
      {!visible.length && <p className="py-5 text-sm text-muted">No outstanding groups found in this partial catalog.</p>}</div>
      {(evaluation?.requirements.length ?? 0) > 5 && <button type="button" onClick={()=>setShowAll(!showAll)} className="flex items-center gap-1 text-xs text-muted underline underline-offset-4">{showAll ? <ChevronUp size={14}/> : <ChevronDown size={14}/>} {showAll ? "Show fewer" : "See all requirements"}</button>}
    </section>
    <section className="space-y-4"><h2 className="font-display text-3xl">Courses to consider next</h2><p className="text-sm leading-relaxed text-muted">Courses offered in the supplied Spring 2027 Beaver listing that match unmet requirements. Not an enrollment or prerequisite guarantee.</p>
      <div className="divide-y divide-border border-y border-border">{distinct.slice(0,8).map((r)=><div key={r.courseCode} className="lion-row flex items-center justify-between gap-4 py-4"><div><p className="text-base font-semibold tracking-normal">{r.courseCode}</p><p className="mt-1 text-sm leading-relaxed text-muted">{r.title} · ~{r.credits} credits</p></div><span className="text-xs text-muted">{r.priority === "review" ? "Review" : "Suggested"}</span></div>)}
      {!distinct.length && <p className="py-5 text-sm text-muted">No Spring 2027 Beaver sections match the currently tracked outstanding requirements.</p>}</div>
      <Link href="/schedule" className="flex w-full items-center justify-center gap-2 lion-button px-6 py-3 text-sm font-semibold text-white">Build my schedule <ArrowRight size={16}/></Link>
    </section>
    <details open={details} onToggle={(e)=>setDetails(e.currentTarget.open)} className="border-t border-border pt-5"><summary className="cursor-pointer text-sm text-muted">Academic details & notices</summary>
      <div className="mt-5 space-y-5"><p className="text-xs leading-5 text-muted">This is a partial, unverified catalog. It does not determine graduation eligibility, transfer applicability, prerequisites, or course availability. Verify decisions with your adviser and LionPATH.</p>
      {isPreMajor && <p className="text-xs text-muted">Pre-major report detected; some requirements may be absent.</p>}
      {importWarnings.map((w,i)=><p key={i} className="text-xs leading-6 text-muted">{w}</p>)}
      <div className="space-y-2 text-sm leading-7 text-muted"><p className="font-medium text-foreground">What LionPlan cannot verify yet</p><p>Some degree rules still need an adviser’s review: application focus and supporting courses, List A/B electives, first-year seminar, General Education and cultures designations, minimum grades and prerequisites, transfer substitutions, and which Bulletin year applies to you. These can change which classes count toward your degree.</p><p>The app uses a partial program catalog. Treat suggested courses as starting points, not confirmed degree requirements.</p></div>
      <GeneralEducation /></div>
    </details>
  </div>;
}
