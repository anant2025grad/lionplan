"use client";
import { useRef, useState } from "react";
import { FileUp, LoaderCircle } from "lucide-react";
import { parseWhatIfReport } from "@/lib/academic/parse-report";
import { readPdfText } from "@/lib/academic/read-pdf";
import { useAcademicStore } from "@/stores/academic-store";
export function ReportImport() {
  const inputRef = useRef<HTMLInputElement>(null);
  const setReport = useAcademicStore((s) => s.setReport);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [showPaste, setShowPaste] = useState(false);
  const [text, setText] = useState("");
  function analyze(raw: string) {
    const result = parseWhatIfReport(raw);
    if (!result.courses.length) { setError(result.warnings.join(" ") || "No courses were found. Try pasting the report text."); return; }
    setError("");
    setReport(result.courses, result.isPreMajor, result.warnings);
  }
  async function upload(file?: File) {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") { setError("Please select a PDF."); return; }
    setBusy(true); setError("");
    try { analyze(await readPdfText(file)); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not read this PDF."); }
    finally { setBusy(false); }
  }
  return <section className="space-y-4">
    <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
      onDrop={(e) => { e.preventDefault(); setDragging(false); void upload(e.dataTransfer.files[0]); }}
      className={`flex flex-col items-center border border-dashed px-5 py-12 text-center sm:py-16 ${dragging ? "border-blue-accent bg-blue-soft" : "border-border bg-surface"}`}>
      <FileUp size={26} className="text-blue-accent" strokeWidth={1.5} />
      <h2 className="mt-5 text-xl font-semibold">Upload your What-If report</h2>
      <p className="mt-2 max-w-sm text-sm text-muted">See what you need and plan your next semester.</p>
      <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="sr-only" aria-label="Choose What-If PDF"
        onChange={(e) => { void upload(e.target.files?.[0]); e.target.value = ""; }} />
      <button type="button" disabled={busy} onClick={() => inputRef.current?.click()}
        className="mt-6 inline-flex items-center gap-2 bg-psu-blue px-6 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {busy && <LoaderCircle size={16} className="animate-spin" />}{busy ? "Reading report…" : "Choose PDF"}
      </button>
      <p className="mt-5 text-xs text-muted">Processed in your browser · No account required</p>
    </div>
    {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    <div className="text-center">
      <button type="button" onClick={() => setShowPaste(!showPaste)} className="text-xs text-muted underline underline-offset-4">{showPaste ? "Hide text import" : "Having trouble? Paste report text"}</button>
    </div>
    {showPaste && <div className="space-y-3"><textarea value={text} onChange={(e) => setText(e.target.value)} rows={5}
      className="w-full border border-border bg-surface p-3 text-sm" placeholder="Paste your Course History here…" aria-label="Report text" />
      <button type="button" disabled={!text.trim()} onClick={() => analyze(text)} className="bg-psu-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Import text</button></div>}
  </section>;
}
