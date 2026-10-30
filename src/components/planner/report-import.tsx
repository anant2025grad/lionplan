
"use client";

import { useRef, useState } from "react";
import {
  FileText,
  Upload,
  ClipboardPaste,
  LoaderCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { parseWhatIfReport } from "@/lib/academic/parse-report";
import { readPdfText } from "@/lib/academic/read-pdf";
import { useAcademicStore } from "@/stores/academic-store";

export function ReportImport() {
  const inputRef = useRef<HTMLInputElement>(null);

  const setReport = useAcademicStore(
    (state) => state.setReport
  );

  const [rawText, setRawText] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  function analyze(text: string) {
    const result = parseWhatIfReport(text);

    if (result.courses.length === 0) {
      setError(
        result.warnings.join(" ") ||
          "No course records were found."
      );
      return;
    }

    setError("");

    setReport(
      result.courses,
      result.isPreMajor,
      result.warnings
    );
  }

  async function handleFile(file?: File) {
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a PDF file.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const text = await readPdfText(file);

      if (!text.trim()) {
        throw new Error(
          "The PDF contains no extractable text."
        );
      }

      analyze(text);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to read this PDF."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFile(event.dataTransfer.files[0]);
        }}
        className={`
          border border-dashed p-8 text-center
          transition-colors duration-200
          ${
            dragging
              ? "border-blue-accent bg-blue-soft"
              : "border-border bg-surface"
          }
        `}
      >
        <div className="mx-auto flex h-12 w-12 items-center justify-center border border-border text-blue-accent">
          <Upload size={20} strokeWidth={1.5} />
        </div>

        <h3 className="mt-5 text-lg font-medium">
          Import your What-If report
        </h3>

        <p className="mx-auto mt-3 max-w-md text-xs leading-6 text-muted">
          Upload a text-based LionPATH What-If PDF.
          The file is processed locally in your browser.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />

        <div className="mt-6">
          <Button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? (
              <LoaderCircle
                size={16}
                className="animate-spin"
              />
            ) : (
              <FileText size={16} />
            )}

            {busy ? "Reading report..." : "Select PDF"}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-border" />
        <span className="font-display text-[10px] uppercase tracking-widest text-muted">
          Or paste report text
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <div className="border border-border bg-surface p-5">
        <div className="flex items-center gap-2">
          <ClipboardPaste
            size={16}
            className="text-blue-accent"
          />
          <span className="text-xs font-medium">
            Manual import
          </span>
        </div>

        <textarea
          value={rawText}
          onChange={(event) =>
            setRawText(event.target.value)
          }
          placeholder="Paste the Course History section from your What-If report..."
          rows={7}
          className="
            mt-4 w-full resize-y border border-border
            bg-background p-4 font-mono text-xs
            leading-6 text-foreground
            placeholder:text-muted
          "
        />

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            variant="secondary"
            disabled={!rawText.trim() || busy}
            onClick={() => analyze(rawText)}
          >
            Analyze pasted text
          </Button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="border-l-2 border-psu-blue bg-blue-soft p-4 text-xs leading-6 text-foreground"
        >
          {error}
        </div>
      )}

      <p className="text-[11px] leading-5 text-muted">
        LionPlan does not upload or save your report.
        Avoid importing another person's academic
        records without their permission.
      </p>
    </div>
  );
}
