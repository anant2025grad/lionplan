
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
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <header>
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            Penn State Beaver
          </p>
          <h1 className="mt-2 text-4xl font-bold">
            LionPlan
          </h1>
          <p className="mt-2 text-slate-400">
            Academic planning, simplified.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            {cyberProgram.name}
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Prototype requirements only — not an official degree audit.
          </p>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <Stat label="Completed" value={evaluation.completedCount} />
            <Stat label="In progress" value={evaluation.inProgressCount} />
            <Stat label="Missing" value={evaluation.missingCount} />
          </div>

          <div className="mt-6 space-y-3">
            {evaluation.requirements.map((result) => (
              <div
                key={result.requirement.id}
                className="flex items-center justify-between rounded-xl border border-slate-700 p-4"
              >
                <div>
                  <p className="font-medium">
                    {result.requirement.name}
                  </p>
                  <p className="text-sm text-slate-400">
                    {result.requirement.courses.join(" / ")}
                  </p>
                </div>

                <span className="text-sm capitalize text-blue-300">
                  {result.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-slate-800 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}
