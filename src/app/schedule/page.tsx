"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, RefreshCw, Trash2 } from "lucide-react";
import { useStudentPlan } from "@/hooks/use-student-plan";
import { useAcademicStore } from "@/stores/academic-store";
import { SPRING_2027_SECTIONS } from "@/data/scheduling/spring-2027-sections";
import { DEFAULT_SCHEDULING_PREFERENCES, type SchedulingPreferences } from "@/types/scheduling-preferences";
import type { CourseSection, MeetingDay } from "@/types/schedule";
import { generatePreferredSchedules, type PreferredScheduleResult } from "@/lib/scheduling/generate-preferred-schedules";
import { findScheduleConflicts } from "@/lib/scheduling/schedule-engine";
import { WeeklyCalendar } from "@/components/scheduling/weekly-calendar";
const DAYS: {key:MeetingDay;label:string}[] = [{key:"M",label:"M"},{key:"T",label:"T"},{key:"W",label:"W"},{key:"Th",label:"Th"},{key:"F",label:"F"}];
export default function SchedulePage() {
  const { courses, reportLoaded, recommendations } = useStudentPlan();
  const confirmed = useAcademicStore((s)=>s.recordConfirmed);
  const [preferences,setPreferences] = useState<SchedulingPreferences>(()=>({...DEFAULT_SCHEDULING_PREFERENCES,daysOff:[],lockedSectionIds:[]}));
  const [result,setResult] = useState<PreferredScheduleResult|null>(null);
  const [choice,setChoice] = useState(0);
  const [selected,setSelected] = useState<CourseSection[]|null>(null);
  const [advanced,setAdvanced] = useState(false);
  const [message,setMessage] = useState("");
  const recommendedSectionIds = useMemo(()=>Array.from(new Set(recommendations.flatMap((r)=>r.sections.map((s)=>s.id)))),[recommendations]);
  function update(patch:Partial<SchedulingPreferences>){setPreferences((p)=>({...p,...patch}));setResult(null);setSelected(null);setMessage("");}
  function generate(){const next=generatePreferredSchedules(SPRING_2027_SECTIONS,preferences,{recommendedSectionIds,history:courses});setResult(next);setChoice(0);setSelected(next.schedules[0]?.sections ?? null);setMessage("");}
  function choose(index:number){setChoice(index);setSelected(result?.schedules[index]?.sections ?? null);setMessage("");}
  function toggleSection(section:CourseSection){
    const current=selected??[];
    if(current.some((s)=>s.id===section.id)){setSelected(current.filter((s)=>s.id!==section.id));setMessage("");return;}
    const replacement=current.filter((s)=>s.courseCode!==section.courseCode);
    if(findScheduleConflicts([...replacement,section]).length){setMessage("That section conflicts with a class in your schedule.");return;}
    setSelected([...replacement,section]);setMessage("");
  }
  if(!reportLoaded || !confirmed) return <div className="lion-reveal mx-auto max-w-xl space-y-7 pt-20 text-center"><h1 className="editorial-subtitle">Build your schedule</h1><p className="text-sm text-muted">Start by importing and checking your academic record.</p><Link href="/planner" className="inline-flex items-center gap-2 lion-button px-6 py-3 text-sm font-semibold text-white"><ArrowLeft size={15}/> Go to Plan</Link></div>;
  return <div className="lion-reveal mx-auto max-w-4xl space-y-12"><div><p className="text-xs font-semibold uppercase tracking-widest text-blue-accent">Your next semester</p><h1 className="mt-2 editorial-subtitle">Build your schedule</h1><p className="mt-2 text-sm text-muted">Tell us when you prefer classes. We&apos;ll find a starting point.</p></div>
    <section className="space-y-6 glass-panel p-6 sm:p-9">
      <div className="grid gap-5 sm:grid-cols-2"><label className="space-y-2 text-sm"><span className="block text-muted">Classes start after</span><select value={preferences.earliestStart} onChange={(e)=>update({earliestStart:Number(e.target.value)})} className="w-full lion-input px-4 py-3 text-foreground">{[480,540,600,660,720,780].map((m)=><option key={m} value={m}>{m===480?"8:00 AM":m===540?"9:00 AM":m===600?"10:00 AM":m===660?"11:00 AM":m===720?"12:00 PM":"1:00 PM"}</option>)}</select></label>
      <div><p className="mb-2 text-sm text-muted">Days off</p><div className="flex gap-2">{DAYS.map(({key,label})=><button type="button" key={key} aria-pressed={preferences.daysOff.includes(key)} onClick={()=>update({daysOff:preferences.daysOff.includes(key)?preferences.daysOff.filter((d)=>d!==key):[...preferences.daysOff,key]})}
        className={`flex h-11 min-w-10 flex-1 items-center justify-center border text-xs ${preferences.daysOff.includes(key)?"border-psu-blue bg-psu-blue text-white":"border-border bg-background text-foreground"}`}>{label}</button>)}</div></div></div>
      <button type="button" onClick={generate} className="flex w-full items-center justify-center gap-2 lion-button px-6 py-3 text-sm font-semibold text-white"><RefreshCw size={16}/> {result?"Regenerate schedule":"Generate schedule"}</button>
      <details className="text-sm"><summary className="cursor-pointer text-xs text-muted">More preferences</summary><div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="space-y-2"><span className="block text-xs text-muted">Target credits</span><select value={preferences.targetCredits} onChange={(e)=>update({targetCredits:Number(e.target.value)})} className="w-full lion-input px-4 py-2 text-sm">{[6,9,12,15,18].map((n)=><option key={n} value={n}>{n}</option>)}</select></label>
        <label className="space-y-2"><span className="block text-xs text-muted">Latest class finish</span><select value={preferences.latestEnd} onChange={(e)=>update({latestEnd:Number(e.target.value)})} className="w-full lion-input px-4 py-2 text-sm">{[840,900,960,1020,1080,1140].map((n)=><option key={n} value={n}>{n===840?"2:00 PM":n===900?"3:00 PM":n===960?"4:00 PM":n===1020?"5:00 PM":n===1080?"6:00 PM":"7:00 PM"}</option>)}</select></label>
      </div></details>
    </section>
    {result && <section className="space-y-5" aria-live="polite">
      {result.errors.length>0 && <div role="alert" className="border border-border bg-surface p-4 text-sm">{result.errors.join(" ")}</div>}
      {result.schedules.length===0 ? <p className="text-sm text-muted">No matching schedule found. Try allowing more days or an earlier start time.</p> : <>
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Your timetable</h2><p className="mt-1 text-xs text-muted">{selected?.reduce((n,s)=>n+s.credits,0)??0} credits · {selected?.length??0} classes · Spring 2027 snapshot</p></div>
          {result.schedules.length>1 && <div className="flex gap-2">{result.schedules.map((s,i)=><button type="button" key={s.id} onClick={()=>choose(i)} aria-pressed={choice===i} className={`border px-3 py-2 text-xs ${choice===i?"border-psu-blue bg-psu-blue text-white":"border-border"}`}>Option {i+1}</button>)}</div>}</div>
        <WeeklyCalendar sections={selected??[]} />
        <button type="button" onClick={()=>setAdvanced(!advanced)} className="flex items-center gap-2 text-xs text-muted underline underline-offset-4">{advanced?<ChevronUp size={14}/>:<ChevronDown size={14}/>} Adjust classes</button>
        {advanced && <div className="space-y-3 border border-border bg-surface p-4"><p className="text-xs text-muted">Choose one section per course. Conflicting sections are blocked.</p><div className="grid gap-2 sm:grid-cols-2">{SPRING_2027_SECTIONS.map((s)=>{const checked=(selected??[]).some((x)=>x.id===s.id);return <button type="button" key={s.id} onClick={()=>toggleSection(s)} aria-pressed={checked} className={`flex items-center justify-between gap-3 border p-3 text-left text-xs ${checked?"border-psu-blue bg-blue-soft":"border-border"}`}><span><strong>{s.courseCode}</strong> · {s.section}</span>{checked?<Trash2 size={13}/>:<span>+</span>}</button>})}</div>{message && <p role="alert" className="text-xs text-red-600">{message}</p>}</div>}
      </>}
      {result.warnings.length>0 && <details className="text-xs text-muted"><summary className="cursor-pointer">Scheduling notes ({result.warnings.length})</summary><div className="mt-2 space-y-2">{result.warnings.map((w,i)=><p key={i}>{w}</p>)}</div></details>}
    </section>}
    <p className="text-xs leading-5 text-muted">Spring 2027 Beaver course listing supplied by the user; not live availability. Credits are estimates because the listing omitted credit hours. Verify seats, credits, linked sections and prerequisites in LionPATH.</p>
  </div>;
}
