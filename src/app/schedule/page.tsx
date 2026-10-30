
"use client";

import { useMemo, useState } from "react";
import {
    AlertTriangle,
    CalendarDays,
    Check,
    ChevronDown,
    ChevronUp,
    GraduationCap,
    Plus,
    Search,
    Trash2,
} from "lucide-react";

import { AutomaticSchedules } from "@/components/scheduling/automatic-schedules";

import {
    PreferredScheduleBuilder,
} from "@/components/scheduling/preferred-schedule-builder";

import {
    WeeklyCalendar,
} from "@/components/scheduling/weekly-calendar";

import type {
    GeneratedSchedule,
} from "@/lib/scheduling/generate-schedules";

import type { CourseSection } from "@/types/schedule";
import type { CourseRecommendation } from "@/lib/academic/recommend-courses";

import { DEMO_SECTIONS } from "@/data/scheduling/demo-sections";
import { recommendCourses } from "@/lib/academic/recommend-courses";
import { useAcademicStore } from "@/stores/academic-store";

import {
    canAddSection,
    DAYS,
    formatMinutes,
    summarizeSchedule,
} from "@/lib/scheduling/schedule-engine";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

const DAY_LABELS: Record<string, string> = {
    M: "Mon",
    T: "Tue",
    W: "Wed",
    Th: "Thu",
    F: "Fri",
    Sa: "Sat",
    Su: "Sun",
};

type GroupedCourse = {
    code: string;
    title: string;
    credits: number;
    sections: CourseSection[];
};

function groupSections(
    sections: CourseSection[]
): GroupedCourse[] {
    const groups = new Map<string, GroupedCourse>();

    for (const section of sections) {
        const existing = groups.get(section.courseCode);

        if (existing) {
            existing.sections.push(section);
        } else {
            groups.set(section.courseCode, {
                code: section.courseCode,
                title: section.title,
                credits: section.credits,
                sections: [section],
            });
        }
    }

    return [...groups.values()].sort((a, b) =>
        a.code.localeCompare(b.code)
    );
}

function meetingLabel(section: CourseSection): string {
    if (section.modality === "web") {
        return "WEB / No scheduled meeting";
    }

    if (section.meetings.length === 0) {
        return "Meeting time not available";
    }

    return section.meetings
        .map(
            (meeting) =>
                `${meeting.days
                    .map((day) => DAY_LABELS[day])
                    .join(" / ")} · ${formatMinutes(
                        meeting.start
                    )}–${formatMinutes(meeting.end)}`
        )
        .join(" | ");
}

function CourseGroup({
    group,
    recommendation,
    selected,
    onAdd,
    onRemove,
}: {
    group: GroupedCourse;
    recommendation?: CourseRecommendation;
    selected: CourseSection[];
    onAdd: (section: CourseSection) => void;
    onRemove: (id: string) => void;
}) {
    const [expanded, setExpanded] = useState(
        Boolean(recommendation)
    );

    return (
        <article className="border border-border bg-surface">
            <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
                className="flex w-full items-start justify-between gap-4 p-5 text-left"
            >
                <div>
                    <p className="font-display text-xs text-blue-accent">
                        {group.code}
                    </p>

                    <h3 className="mt-2 text-sm font-medium">
                        {group.title}
                    </h3>

                    <p className="mt-2 text-xs text-muted">
                        {group.credits} credits ·{" "}
                        {group.sections.length} demo{" "}
                        {group.sections.length === 1
                            ? "section"
                            : "sections"}
                    </p>

                    {recommendation && (
                        <p className="mt-3 text-xs leading-5 text-muted">
                            {recommendation.reason}
                        </p>
                    )}
                </div>

                {expanded ? (
                    <ChevronUp
                        size={18}
                        className="shrink-0 text-muted"
                    />
                ) : (
                    <ChevronDown
                        size={18}
                        className="shrink-0 text-muted"
                    />
                )}
            </button>

            {expanded && (
                <div className="border-t border-border">
                    {group.sections.map((section) => {
                        const isSelected = selected.some(
                            (item) => item.id === section.id
                        );

                        const check = canAddSection(
                            selected,
                            section
                        );

                        return (
                            <div
                                key={section.id}
                                className="flex flex-col gap-4 border-b border-border p-5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div>
                                    <p className="font-display text-xs">
                                        Section {section.section}
                                    </p>

                                    <p className="mt-2 text-xs leading-6 text-muted">
                                        {meetingLabel(section)}
                                    </p>

                                    <p className="mt-1 text-xs text-muted">
                                        {section.campus} ·{" "}
                                        {section.modality.replace("_", " ")}
                                    </p>

                                    {!isSelected && !check.allowed && (
                                        <p className="mt-2 text-xs text-blue-accent">
                                            Conflicts with your selected schedule
                                        </p>
                                    )}
                                </div>

                                <Button
                                    size="sm"
                                    variant={
                                        isSelected ? "secondary" : "primary"
                                    }
                                    onClick={() =>
                                        isSelected
                                            ? onRemove(section.id)
                                            : onAdd(section)
                                    }
                                >
                                    {isSelected ? (
                                        <>
                                            <Check size={14} />
                                            Selected
                                        </>
                                    ) : (
                                        <>
                                            <Plus size={14} />
                                            Add section
                                        </>
                                    )}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            )}
        </article>
    );
}

export default function SchedulePage() {
    const courses = useAcademicStore(
        (state) => state.courses
    );

    const reportLoaded = useAcademicStore(
        (state) => state.reportLoaded
    );

    const cyberOption = useAcademicStore(
        (state) => state.cyberOption
    );

    const [selectedIds, setSelectedIds] =
        useState<string[]>([]);

    const [search, setSearch] = useState("");
    const [showAll, setShowAll] = useState(false);
    const [warning, setWarning] =
        useState<string | null>(null);

    const selected = useMemo(
        () =>
            DEMO_SECTIONS.filter((section) =>
                selectedIds.includes(section.id)
            ),
        [selectedIds]
    );

    const summary = useMemo(
        () => summarizeSchedule(selected),
        [selected]
    );

    const recommendations = useMemo(
        () =>
            reportLoaded
                ? recommendCourses(
                    courses,
                    DEMO_SECTIONS,
                    cyberOption
                )
                : [],
        [courses, reportLoaded, cyberOption]
    );

    const recommendationMap = useMemo(
        () =>
            new Map(
                recommendations.map((item) => [
                    item.courseCode,
                    item,
                ])
            ),
        [recommendations]
    );

    const grouped = useMemo(
        () => groupSections(DEMO_SECTIONS),
        []
    );

    const visibleGroups = useMemo(() => {
        const query = search.trim().toLowerCase();

        return grouped.filter((group) => {
            const matchesSearch =
                group.code.toLowerCase().includes(query) ||
                group.title.toLowerCase().includes(query);

            const matchesMode =
                showAll ||
                !reportLoaded ||
                recommendationMap.has(group.code);

            return matchesSearch && matchesMode;
        });
    }, [
        grouped,
        search,
        showAll,
        reportLoaded,
        recommendationMap,
    ]);

    function addSection(section: CourseSection) {
        if (selectedIds.includes(section.id)) return;

        const check = canAddSection(selected, section);

        if (!check.allowed) {
            const conflict = check.conflicts[0];

            setWarning(
                conflict.reason === "same_course"
                    ? `You already selected a section of ${section.courseCode}. Remove that section first.`
                    : `${section.courseCode} section ${section.section} overlaps with a selected class on ${DAY_LABELS[conflict.day ?? "M"]
                    }.`
            );

            return;
        }

        setSelectedIds((previous) => [
            ...previous,
            section.id,
        ]);

        setWarning(null);
    }

    function removeSection(id: string) {
        setSelectedIds((previous) =>
            previous.filter((item) => item !== id)
        );

        setWarning(null);
    }


    function applyGeneratedSchedule(
        schedule: GeneratedSchedule
    ) {
        setSelectedIds(
            schedule.sections.map((section) => section.id)
        );

        setWarning(null);
    }


    return (
        <div className="space-y-8">
            <PageHeader
                eyebrow="LionPlan / Academic Scheduling"
                title="Semester Planner"
                description="Explore course recommendations, compare sections, and assemble a conflict-free demonstration schedule."
            />

            <div className="border-l-2 border-psu-blue bg-blue-soft p-4 text-xs leading-6">
                <strong>Prototype:</strong> All displayed
                sections and meeting times are fictional.
                Recommendations use preliminary degree rules
                and do not confirm registration eligibility.
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                {[
                    {
                        label: "Selected courses",
                        value: summary.courseCount,
                    },
                    {
                        label: "Scheduled credits",
                        value: summary.credits,
                    },
                    {
                        label: "Time conflicts",
                        value: summary.conflicts.length,
                    },
                ].map((metric) => (
                    <div
                        key={metric.label}
                        className="border border-border bg-surface p-5"
                    >
                        <p className="text-xs text-muted">
                            {metric.label}
                        </p>

                        <p className="mt-3 font-display text-2xl">
                            {metric.value}
                        </p>
                    </div>
                ))}
            </div>


            {reportLoaded && (
                <PreferredScheduleBuilder
                    recommendations={recommendations}
                    onUseSchedule={(sections) => {
                        setSelectedIds(
                            sections.map((section) => section.id)
                        );
                        setWarning(null);
                    }}
                />
            )}


            {warning && (
                <div
                    role="alert"
                    className="flex items-start gap-3 border border-border bg-surface p-4"
                >
                    <AlertTriangle
                        size={18}
                        className="mt-0.5 shrink-0 text-blue-accent"
                    />
                    <p className="text-sm">{warning}</p>
                </div>
            )}

            <div className="grid gap-8 xl:grid-cols-[1.25fr_1fr]">
                <section>
                    <div className="flex items-center gap-2">
                        <GraduationCap size={18} />

                        <h2 className="font-display text-sm uppercase tracking-wider">
                            Course selection
                        </h2>
                    </div>

                    {reportLoaded ? (
                        <div className="mt-5 border border-border bg-surface p-5">
                            <p className="font-display text-xs text-blue-accent">
                                PERSONALIZED / PROVISIONAL
                            </p>

                            <p className="mt-3 text-sm">
                                {recommendations.length} candidate{" "}
                                {recommendations.length === 1
                                    ? "course"
                                    : "courses"}{" "}
                                found in the demo section catalog.
                            </p>

                            <p className="mt-2 text-xs leading-5 text-muted">
                                Based on imported course history and
                                the {cyberOption} option. Only courses
                                with demo sections are shown.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-5 border border-border bg-surface p-5">
                            <p className="text-sm font-medium">
                                No academic report imported
                            </p>

                            <p className="mt-2 text-xs leading-6 text-muted">
                                Import a LionPATH report in Degree
                                Progress to see candidate courses.
                                You can still explore the demo catalog.
                            </p>

                            <a
                                href="/planner"
                                className="mt-3 inline-block text-xs text-blue-accent underline underline-offset-4"
                            >
                                Go to Degree Progress
                            </a>
                        </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            variant={!showAll ? "primary" : "secondary"}
                            onClick={() => setShowAll(false)}
                        >
                            Recommended
                        </Button>

                        <Button
                            size="sm"
                            variant={showAll ? "primary" : "secondary"}
                            onClick={() => setShowAll(true)}
                        >
                            All demo courses
                        </Button>
                    </div>

                    <div className="relative mt-5">
                        <Search
                            size={17}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                        />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search course code or title"
                            aria-label="Search courses"
                            className="w-full border border-border bg-surface py-3 pl-11 pr-4 text-sm text-foreground"
                        />
                    </div>

                    <div className="mt-4 space-y-3">
                        {visibleGroups.map((group) => (
                            <CourseGroup
                                key={group.code}
                                group={group}
                                recommendation={recommendationMap.get(
                                    group.code
                                )}
                                selected={selected}
                                onAdd={addSection}
                                onRemove={removeSection}
                            />
                        ))}

                        {visibleGroups.length === 0 && (
                            <div className="border border-border bg-surface p-8">
                                <p className="text-sm font-medium">
                                    No matching courses
                                </p>

                                <p className="mt-2 text-xs leading-6 text-muted">
                                    Try a different search or select
                                    All demo courses. The limited demo
                                    catalog may not contain your remaining
                                    requirements.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-2">
                        <CalendarDays size={18} />

                        <h2 className="font-display text-sm uppercase tracking-wider">
                            Selected schedule
                        </h2>
                    </div>

                    <div className="mt-5 border border-border bg-surface">
                        {selected.length === 0 ? (
                            <div className="p-8 text-center">
                                <CalendarDays
                                    size={28}
                                    className="mx-auto text-muted"
                                />

                                <p className="mt-4 text-sm font-medium">
                                    No sections selected
                                </p>

                                <p className="mt-2 text-xs text-muted">
                                    Expand a course and choose a section.
                                </p>
                            </div>
                        ) : (
                            selected.map((section) => (
                                <div
                                    key={section.id}
                                    className="flex items-start justify-between gap-3 border-b border-border p-4 last:border-b-0"
                                >
                                    <div>
                                        <p className="font-display text-xs">
                                            {section.courseCode} /{" "}
                                            {section.section}
                                        </p>

                                        <p className="mt-2 text-xs leading-5 text-muted">
                                            {meetingLabel(section)}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeSection(section.id)
                                        }
                                        aria-label={`Remove ${section.courseCode} section ${section.section}`}
                                        className="p-2 text-muted hover:text-foreground"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    {selected.length > 0 && (
                        <button
                            type="button"
                            onClick={() => {
                                setSelectedIds([]);
                                setWarning(null);
                            }}
                            className="mt-4 text-xs text-muted underline underline-offset-4"
                        >
                            Clear schedule
                        </button>
                    )}


                    <div className="mt-6">
                        <WeeklyCalendar sections={selected} />
                    </div>

                </section>
            </div>
        </div>
    );
}
