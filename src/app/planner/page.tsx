
"use client";

import { useMemo } from "react";
import {
  FileCheck2,
  RotateCcw,
} from "lucide-react";


import { GeneralEducation } from "@/components/planner/general-education";

import { DegreeRequirements } from "@/components/planner/degree-requirements";
import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ReportImport } from "@/components/planner/report-import";

import { useAcademicStore } from "@/stores/academic-store";

export default function PlannerPage() {
  const courses = useAcademicStore(
    (state) => state.courses
  );

  const reportLoaded = useAcademicStore(
    (state) => state.reportLoaded
  );

  const isPreMajor = useAcademicStore(
    (state) => state.isPreMajor
  );

  const warnings = useAcademicStore(
    (state) => state.warnings
  );

  const clearReport = useAcademicStore(
    (state) => state.clearReport
  );

  const stats = useMemo(() => {
    const completed = courses.filter(
      (course) => course.status === "completed"
    );

    const inProgress = courses.filter(
      (course) => course.status === "in_progress"
    );

    return {
      total: courses.length,
      completed: completed.length,
      inProgress: inProgress.length,
      credits: completed.reduce(
        (sum, course) => sum + course.credits,
        0
      ),
    };
  }, [courses]);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Academic Planning / 01"
        title="Degree planner."
        description="Import your LionPATH academic history and review the courses LionPlan recognizes."
        action={
          reportLoaded ? (
            <Button
              variant="secondary"
              onClick={clearReport}
            >
              <RotateCcw size={15} />
              Clear session
            </Button>
          ) : undefined
        }
      />

      {!reportLoaded ? (
        <ReportImport />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            <MetricCard
              label="Courses Found"
              value={stats.total}
              description="Records extracted from your report"
              icon={<FileCheck2 size={20} />}
            />

            <MetricCard
              label="Completed Records"
              value={stats.completed}
              description="Courses classified as completed"
            />

            <MetricCard
              label="Credits Recognized"
              value={stats.credits}
              description="Sum of completed records; not audited degree credits"
            />
          </section>

          {isPreMajor && (
            <div className="border-l-2 border-psu-blue bg-blue-soft p-5">
              <p className="text-sm font-medium">
                Pre-major report detected
              </p>
              <p className="mt-2 text-xs leading-6 text-muted">
                This report may not contain a complete
                degree requirement audit. Course history
                was extracted independently.
              </p>
            </div>
          )}

          {warnings.length > 0 && (
            <div className="border border-border bg-surface p-5">
              <p className="font-display text-xs uppercase tracking-widest">
                Review notices
              </p>

              {warnings.map((warning, index) => (
                <p
                  key={index}
                  className="mt-3 text-xs leading-6 text-muted"
                >
                  {warning}
                </p>
              ))}
            </div>
          )}

          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-medium">
                Course history
              </h2>

              <span className="font-display text-[10px] uppercase tracking-widest text-muted">
                {stats.total} records
              </span>
            </div>

            <div className="overflow-x-auto border border-border bg-surface">
              <table className="w-full min-w-[680px] text-left">
                <thead className="border-b border-border bg-surface-muted">
                  <tr className="font-display text-[10px] uppercase tracking-wider text-muted">
                    <th className="p-4 font-normal">Course</th>
                    <th className="p-4 font-normal">Term</th>
                    <th className="p-4 font-normal">Credits</th>
                    <th className="p-4 font-normal">Grade</th>
                    <th className="p-4 font-normal">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {courses.map((course, index) => (
                    <tr
                      key={`${course.code}-${course.term}-${index}`}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="p-4">
                        <p className="font-display text-xs text-blue-accent">
                          {course.code}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {course.title}
                        </p>
                      </td>

                      <td className="p-4 text-xs">
                        {course.term}
                      </td>

                      <td className="p-4 font-display text-xs">
                        {course.credits}
                      </td>

                      <td className="p-4 font-display text-xs">
                        {course.grade || "—"}
                      </td>

                      <td className="p-4">
                        <StatusBadge
                          status={
                            course.status === "low_grade" ||
                            course.status === "no_credit"
                              ? "attention"
                              : course.status
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          
<DegreeRequirements />

<GeneralEducation />



          <p className="text-xs leading-6 text-muted">
            Import results are provisional. Repeated
            attempts, transfer equivalencies, grade
            rules and degree applicability require
            further verification against the official
            Penn State audit.
          </p>
        </>
      )}
    </div>
  );
}
