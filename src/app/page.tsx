
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  FileText,
} from "lucide-react";

import { cyberProgram } from "@/data/programs/cyber-bs-2026";
import { evaluateDegree } from "@/lib/academic/evaluate-degree";
import type { StudentCourse } from "@/types/academic";

const demoCourses: StudentCourse[] = [
  {
    code: "CMPSC 131",
    title: "Programming and Computation I",
    credits: 3,
    term: "Fall 2025",
    grade: "B+",
    status: "completed",
  },
  {
    code: "CYBER 262",
    title: "Cyber Defense Studio",
    credits: 3,
    term: "Fall 2026",
    status: "in_progress",
  },
  {
    code: "IST 210",
    title: "Organization of Data",
    credits: 3,
    term: "Fall 2026",
    status: "in_progress",
  },
];

export default function Home() {
  const evaluation = evaluateDegree(
    cyberProgram,
    demoCourses
  );

  return (
    <div className="space-y-10">
      <section className="border-b border-border pb-9">
        <p className="font-display text-[11px] uppercase tracking-[0.18em] text-blue-accent">
          Academic Overview / 2026
        </p>

        <h1 className="mt-5 max-w-3xl text-4xl font-medium tracking-[-0.05em] md:text-6xl">
          Your degree.
          <br />
          <span className="text-muted">
            A clearer path forward.
          </span>
        </h1>

        <p className="mt-6 max-w-xl text-sm leading-7 text-muted">
          Understand your requirements, build better
          schedules, and collaborate with your
          academic advisor in one workspace.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="border border-border bg-surface p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-[10px] uppercase tracking-widest text-muted">
                Degree Evaluation
              </p>

              <h2 className="mt-3 text-xl font-medium tracking-tight">
                {cyberProgram.name}
              </h2>

              <p className="mt-1 text-xs text-muted">
                B.S. / Beaver Campus
              </p>
            </div>

            <BookOpen
              size={21}
              strokeWidth={1.4}
              className="text-blue-accent"
            />
          </div>

          <div className="mt-10 flex items-end justify-between">
            <div>
              <p className="font-display text-5xl tracking-tight">
                {evaluation.progressPercentage}%
              </p>

              <p className="mt-2 text-xs text-muted">
                Sample requirements completed
              </p>
            </div>

            <span className="font-display text-[10px] text-muted">
              PROTOTYPE DATA
            </span>
          </div>

          <div className="mt-6 h-1.5 w-full bg-surface-muted">
            <div
              className="h-full bg-psu-blue transition-all duration-500"
              style={{
                width: `${evaluation.progressPercentage}%`,
              }}
            />
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-border pt-6">
            {[
              ["Completed", evaluation.completedCount],
              ["In progress", evaluation.inProgressCount],
              ["Missing", evaluation.missingCount],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="font-display text-2xl">
                  {value}
                </p>

                <p className="mt-1 text-[11px] text-muted">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col border border-border bg-surface p-6">
          <div className="flex items-center justify-between">
            <p className="font-display text-[10px] uppercase tracking-widest text-muted">
              Planning Tools
            </p>

            <CalendarDays
              size={20}
              strokeWidth={1.4}
              className="text-blue-accent"
            />
          </div>

          <h3 className="mt-7 text-2xl font-medium tracking-tight">
            Plan with
            <br />
            confidence.
          </h3>

          <p className="mt-4 text-xs leading-6 text-muted">
            Import your academic history, explore
            requirements, and prepare for your
            next advising session.
          </p>

          <div className="mt-auto pt-10">
            <div className="flex items-center justify-between border-t border-border pt-4 text-xs">
              <span>PDF import coming next</span>
              <FileText size={16} />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="font-display text-[10px] uppercase tracking-widest text-muted">
              Requirements / Sample
            </p>

            <h2 className="mt-2 text-xl font-medium">
              Academic breakdown
            </h2>
          </div>

          <ArrowUpRight
            size={20}
            className="text-muted"
          />
        </div>

        <div className="border border-border bg-surface">
          {evaluation.requirements.map(
            (result, index) => (
              <div
                key={result.requirement.id}
                className={`flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between ${
                  index !== 0
                    ? "border-t border-border"
                    : ""
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="font-display text-xs text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <p className="text-sm font-medium">
                      {result.requirement.name}
                    </p>

                    <p className="mt-1 text-xs text-muted">
                      {result.requirement.courses.join(
                        " / "
                      )}
                    </p>
                  </div>
                </div>

                <span
                  className="
                    w-fit border border-border
                    px-3 py-1.5 font-display
                    text-[10px] uppercase
                    tracking-wider text-muted
                  "
                >
                  {result.status.replace("_", " ")}
                </span>
              </div>
            )
          )}
        </div>

        <p className="mt-4 text-[11px] leading-5 text-muted">
          This view uses a partial test fixture.
          It is not an official Penn State degree audit
          or an indication of actual graduation readiness.
        </p>
      </section>
    </div>
  );
}
