
"use client";

import { useMemo } from "react";
import {
  BookOpen,
  FileCheck2,
  GraduationCap,
  RotateCcw,
} from "lucide-react";

import {
  useStudentPlan,
} from "@/hooks/use-student-plan";

import Link from "next/link";

import { useAcademicStore } from "@/stores/academic-store";

import { ReportImport } from "@/components/planner/report-import";
import { DemoStudentLoader } from "@/components/planner/demo-student-loader";
import { ProgramSelector } from "@/components/planner/program-selector";
import { DegreeRequirements } from "@/components/planner/degree-requirements";
import { GeneralEducation } from "@/components/planner/general-education";

import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

export default function PlannerPage() {
  const {
    courses,
    reportLoaded,
    evaluation,
  } = useStudentPlan();

  const warnings = useAcademicStore(
    (state) => state.warnings
  );

  const isPreMajor = useAcademicStore(
    (state) => state.isPreMajor
  );


  const clearReport = useAcademicStore(
    (state) => state.clearReport
  );


  const completedCourses = courses.filter(
    (course) => course.status === "completed"
  ).length;

  const inProgressCourses = courses.filter(
    (course) => course.status === "in_progress"
  ).length;

  const completedCredits = courses
    .filter(
      (course) => course.status === "completed"
    )
    .reduce(
      (total, course) => total + course.credits,
      0
    );

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Academic planning"
        title="Degree Planner"
        description="Import your academic history, review possible degree requirement gaps, and prepare for your next semester."
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <DemoStudentLoader />

        {reportLoaded && (
          <Button
            variant="secondary"
            size="sm"
            onClick={clearReport}
          >
            <RotateCcw size={14} />
            Clear academic record
          </Button>
        )}
      </div>

      <ReportImport />

      {!reportLoaded ? (
        <section className="border border-border bg-surface p-8">
          <div className="flex max-w-xl flex-col items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center border border-border bg-surface-muted">
              <GraduationCap
                size={22}
                className="text-blue-accent"
              />
            </div>

            <div>
              <h2 className="font-display text-base uppercase tracking-wider">
                Start with your academic history
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted">
                Import a LionPATH What-If report or
                load our fictional demo student to
                explore the planning workflow.
              </p>
            </div>

            <p className="text-xs leading-5 text-muted">
              Academic reports are processed in your
              browser. LionPlan is an independent
              planning prototype and does not replace
              official Penn State advising.
            </p>
          </div>
        </section>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Courses completed"
              value={completedCourses}
              description="Courses marked completed in the imported record"
              icon={<FileCheck2 size={18} />}
            />

            <MetricCard
              label="In progress"
              value={inProgressCourses}
              description="Currently enrolled or pending completion"
              icon={<BookOpen size={18} />}
            />

            <MetricCard
              label="Completed credits"
              value={completedCredits}
              description="Sum of completed course credits in the record"
              icon={<GraduationCap size={18} />}
            />

            <MetricCard
              label="Requirement coverage"
              value={
                evaluation
                  ? `${evaluation.coveragePercentage}%`
                  : "N/A"
              }
              description="Completed listed requirement groups; not graduation progress"
              icon={<FileCheck2 size={18} />}
            />
          </div>

          <ProgramSelector />

          {isPreMajor && (
            <div className="border border-border bg-surface-muted p-4">
              <p className="text-sm font-semibold">
                Pre-major record detected
              </p>

              <p className="mt-2 text-xs leading-5 text-muted">
                Some program-specific requirements
                may not appear in the imported report.
                Confirm your intended major and
                Bulletin year with an adviser.
              </p>
            </div>
          )}

          {warnings.length > 0 && (
            <section className="border border-border bg-surface p-5">
              <h2 className="font-display text-xs uppercase tracking-wider">
                Import and data notices
              </h2>

              <div className="mt-4 space-y-2">
                {warnings.map((warning, index) => (
                  <p
                    key={`${index}-${warning}`}
                    className="text-xs leading-5 text-muted"
                  >
                    {warning}
                  </p>
                ))}
              </div>
            </section>
          )}

          <DegreeRequirements />

          <GeneralEducation />

          <section className="border border-border bg-surface">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h2 className="font-display text-xs uppercase tracking-wider">
                  Academic course history
                </h2>

                <p className="mt-2 text-xs text-muted">
                  {courses.length} parsed course records
                </p>
              </div>

              <Link
                href="/schedule"
                className="inline-flex items-center gap-2 bg-psu-blue px-4 py-2 text-xs font-semibold text-white"
              >
                Build my schedule
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="border-b border-border bg-surface-muted">
                  <tr>
                    <th className="px-5 py-3 text-xs font-medium">
                      Course
                    </th>
                    <th className="px-5 py-3 text-xs font-medium">
                      Title
                    </th>
                    <th className="px-5 py-3 text-xs font-medium">
                      Credits
                    </th>
                    <th className="px-5 py-3 text-xs font-medium">
                      Term
                    </th>
                    <th className="px-5 py-3 text-xs font-medium">
                      Grade
                    </th>
                    <th className="px-5 py-3 text-xs font-medium">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {courses.map((course, index) => (
                    <tr
                      key={`${course.code}-${course.term}-${index}`}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-5 py-4 font-display text-xs font-bold">
                        {course.code}
                      </td>

                      <td className="px-5 py-4 text-xs">
                        {course.title}
                      </td>

                      <td className="px-5 py-4 text-xs">
                        {course.credits}
                      </td>

                      <td className="px-5 py-4 text-xs">
                        {course.term}
                      </td>

                      <td className="px-5 py-4 text-xs">
                        {course.grade ?? "—"}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={
                            course.status === "completed"
                              ? "completed"
                              : course.status === "in_progress"
                                ? "in_progress"
                                : "attention"
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <p className="text-xs leading-5 text-muted">
            Requirement coverage is calculated from
            provisional program rules. General
            Education allocation, minimum grades,
            substitutions, transfer equivalencies
            and graduation eligibility require
            official verification.
          </p>
        </>
      )}
    </div>
  );
}
