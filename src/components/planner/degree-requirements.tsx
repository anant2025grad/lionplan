
"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Circle,
} from "lucide-react";

import { useAcademicStore } from "@/stores/academic-store";

import {
  getCyberCatalog,
  type CyberOption,
} from "@/data/programs/cyber-requirements";

import {
  evaluateCyberRequirements,
  type RequirementStatus,
} from "@/lib/academic/evaluate-cyber";

import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeader } from "@/components/ui/section-header";

const STATUS_CONFIG = {
  completed: {
    label: "Completed",
    icon: CheckCircle2,
  },
  in_progress: {
    label: "In progress",
    icon: Clock3,
  },
  attention: {
    label: "Needs review",
    icon: AlertCircle,
  },
  missing: {
    label: "Not found",
    icon: Circle,
  },
};

function RequirementRow({
  label,
  status,
  matchedCourse,
}: {
  label: string;
  status: RequirementStatus;
  matchedCourse?: string;
}) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className="flex flex-col gap-3 border-b border-border px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-display text-xs text-foreground">
          {label}
        </p>

        {matchedCourse && (
          <p className="mt-2 text-xs text-muted">
            Matched: {matchedCourse}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-2 text-xs text-muted">
        <Icon size={15} />
        {config.label}
      </div>
    </div>
  );
}

export function DegreeRequirements() {
  const courses = useAcademicStore(
    (state) => state.courses
  );

  const [option, setOption] =
    useState<CyberOption>("operations");

  const catalog = useMemo(
    () => getCyberCatalog(option),
    [option]
  );

  const evaluation = useMemo(
    () => evaluateCyberRequirements(catalog, courses),
    [catalog, courses]
  );

  const common = evaluation.requirements.filter(
    (item) => item.requirement.category === "common"
  );

  const optionRequirements =
    evaluation.requirements.filter(
      (item) => item.requirement.category === "option"
    );

  return (
    <section className="space-y-8">
      <div className="border-t border-border pt-8">
        <SectionHeader
          eyebrow="Degree Evaluation / Provisional"
          title="Requirement coverage"
        />

        <p className="mt-3 max-w-3xl text-xs leading-6 text-muted">
          This evaluation uses a preliminary
          Cybersecurity requirement catalog. It does
          not replace your official degree audit or
          academic adviser's guidance.
        </p>
      </div>

      <div className="border border-border bg-surface p-5">
        <label
          htmlFor="cyber-option"
          className="block font-display text-[10px] uppercase tracking-widest text-muted"
        >
          Cybersecurity degree option
        </label>

        <select
          id="cyber-option"
          value={option}
          onChange={(event) =>
            setOption(event.target.value as CyberOption)
          }
          className="mt-3 w-full max-w-md border border-border bg-background px-4 py-3 text-sm text-foreground"
        >
          <option value="operations">Operations</option>
          <option value="analytics">Analytics</option>
        </select>

        <p className="mt-3 text-xs text-muted">
          2026–2027 catalog · Not independently verified
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Completed Groups"
          value={evaluation.completed}
          description="Matched by completed course records"
        />

        <MetricCard
          label="In Progress"
          value={evaluation.inProgress}
          description="Currently enrolled course matches"
        />

        <MetricCard
          label="Needs Review"
          value={evaluation.attention}
          description="Low-grade or no-credit attempts"
        />

        <MetricCard
          label="Not Found"
          value={evaluation.missing}
          description="No matching course in the imported history"
        />
      </div>

      <div className="border border-border bg-surface p-6">
        <div className="flex items-center justify-between gap-4">
          <p className="font-display text-xs uppercase tracking-wider">
            Completed requirement groups
          </p>

          <p className="font-display text-xl">
            {evaluation.completed}/{evaluation.total}
          </p>
        </div>

        <div className="mt-5 h-2 overflow-hidden bg-surface-muted">
          <div
            className="h-full bg-psu-blue transition-all"
            style={{
              width: `${evaluation.coveragePercentage}%`,
            }}
          />
        </div>

        <p className="mt-3 text-xs text-muted">
          {evaluation.coveragePercentage}% of the
          preliminary listed groups matched as completed.
          This is not your percentage toward graduation.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div>
          <SectionHeader
            eyebrow="01 / Shared requirements"
            title="Common requirements"
          />

          <div className="mt-5 border border-border bg-surface">
            {common.map((item) => (
              <RequirementRow
                key={item.requirement.id}
                label={item.requirement.label}
                status={item.status}
                matchedCourse={
                  item.matchedCourse?.code
                }
              />
            ))}
          </div>
        </div>

        <div>
          <SectionHeader
            eyebrow="02 / Selected option"
            title={
              option === "operations"
                ? "Operations requirements"
                : "Analytics requirements"
            }
          />

          <div className="mt-5 border border-border bg-surface">
            {optionRequirements.map((item) => (
              <RequirementRow
                key={item.requirement.id}
                label={item.requirement.label}
                status={item.status}
                matchedCourse={
                  item.matchedCourse?.code
                }
              />
            ))}
          </div>
        </div>
      </div>

      <div className="border border-border bg-surface p-6">
        <p className="font-display text-xs uppercase tracking-wider">
          Additional requirements requiring review
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {catalog.manualReview.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 text-xs leading-6 text-muted"
            >
              <AlertCircle
                size={15}
                className="mt-1 shrink-0 text-blue-accent"
              />
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
