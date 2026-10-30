
import type { StudentCourse } from "@/types/academic";

import type {
    CourseAttributes,
    GeneralEducationResult,
    GenEdAllocation,
    GenEdAttribute,
    CultureAttribute,
} from "@/types/general-education";

import {
    GEN_ED_BUCKETS,
} from "@/data/general-education/requirements";

import {
    COURSE_ATTRIBUTES,
} from "@/data/general-education/attributes";

type Edge = {
    to: number;
    reverse: number;
    capacity: number;
    original: number;
};

function addEdge(
    graph: Edge[][],
    from: number,
    to: number,
    capacity: number
): Edge {
    const forward: Edge = {
        to,
        reverse: graph[to].length,
        capacity,
        original: capacity,
    };

    const backward: Edge = {
        to: from,
        reverse: graph[from].length,
        capacity: 0,
        original: 0,
    };

    graph[from].push(forward);
    graph[to].push(backward);

    return forward;
}

function maxFlow(
    graph: Edge[][],
    source: number,
    sink: number
): void {
    while (true) {
        const visited = new Set<number>();

        function send(node: number, available: number): number {
            if (node === sink) return available;

            visited.add(node);

            for (const edge of graph[node]) {
                if (
                    edge.capacity <= 0 ||
                    visited.has(edge.to)
                ) {
                    continue;
                }

                const sent = send(
                    edge.to,
                    Math.min(available, edge.capacity)
                );

                if (sent > 0) {
                    edge.capacity -= sent;
                    graph[edge.to][edge.reverse].capacity += sent;
                    return sent;
                }
            }

            return 0;
        }

        if (send(source, Number.MAX_SAFE_INTEGER) === 0) {
            break;
        }
    }
}

const toUnits = (credits: number) =>
    Math.round(credits * 100);

const fromUnits = (units: number) =>
    units / 100;

function eligibleCourse(
    course: StudentCourse
): boolean {
    return (
        course.status === "completed" ||
        course.status === "in_progress"
    );
}

function deduplicateCourses(
    courses: StudentCourse[]
): StudentCourse[] {
    const priority = {
        completed: 3,
        in_progress: 2,
        low_grade: 1,
        no_credit: 0,
    };

    const byCode = new Map<string, StudentCourse>();

    for (const course of courses) {
        const code = course.code.trim().toUpperCase();
        const previous = byCode.get(code);

        if (
            !previous ||
            priority[course.status] > priority[previous.status]
        ) {
            byCode.set(code, { ...course, code });
        }
    }

    return [...byCode.values()];
}

export function evaluateGeneralEducation(
    courses: StudentCourse[],
    attributes: Record<string, CourseAttributes> =
        COURSE_ATTRIBUTES
): GeneralEducationResult {
    const unique = deduplicateCourses(courses);

    const eligible = unique.filter(eligibleCourse);

    const unknownCourses = eligible
        .filter((course) => !attributes[course.code])
        .map((course) => course.code);

    const cultures: GeneralEducationResult["cultures"] = {
        US: { completed: [], inProgress: [] },
        IL: { completed: [], inProgress: [] },
    };

    for (const course of eligible) {
        const info = attributes[course.code];

        if (!info) continue;

        for (const culture of info.cultures) {
            const key =
                course.status === "completed"
                    ? "completed"
                    : "inProgress";

            cultures[culture as CultureAttribute][key].push(
                course.code
            );
        }
    }

    // Completed courses are allocated first.
    // In-progress courses can fill only the
    // capacity that remains.
    const ordered = [
        ...eligible.filter(
            (course) => course.status === "completed"
        ),
        ...eligible.filter(
            (course) => course.status === "in_progress"
        ),
    ];

    const courseCount = ordered.length;
    const bucketCount = GEN_ED_BUCKETS.length;

    const source = 0;
    const courseStart = 1;
    const bucketStart = courseStart + courseCount;
    const sink = bucketStart + bucketCount;

    const graph: Edge[][] = Array.from(
        { length: sink + 1 },
        () => []
    );

    const trackedEdges: {
        courseIndex: number;
        bucket: GenEdAttribute;
        edge: Edge;
    }[] = [];


    const pendingSourceEdges: {
        edge: Edge;
        units: number;
    }[] = [];


    ordered.forEach((course, courseIndex) => {
        const node = courseStart + courseIndex;
        const units = toUnits(course.credits);


        const sourceEdge = addEdge(
            graph,
            source,
            node,
            course.status === "completed" ? units : 0
        );

        if (course.status === "in_progress") {
            pendingSourceEdges.push({
                edge: sourceEdge,
                units,
            });
        }


        const info = attributes[course.code];

        if (!info) return;

        GEN_ED_BUCKETS.forEach((bucket, bucketIndex) => {
            if (!info.genEd.includes(bucket.id)) return;

            const edge = addEdge(
                graph,
                node,
                bucketStart + bucketIndex,
                units
            );

            trackedEdges.push({
                courseIndex,
                bucket: bucket.id,
                edge,
            });
        });
    });

    GEN_ED_BUCKETS.forEach((bucket, index) => {
        addEdge(
            graph,
            bucketStart + index,
            sink,
            toUnits(bucket.required)
        );
    });


    // Pass 1: allocate completed credits.
    maxFlow(graph, source, sink);

    // Pass 2: make in-progress credits available
    // for any remaining requirement capacity.
    for (const pending of pendingSourceEdges) {
        pending.edge.capacity = pending.units;
        pending.edge.original = pending.units;
    }

    maxFlow(graph, source, sink);


    const allocations: GenEdAllocation[] = trackedEdges
        .map(({ courseIndex, bucket, edge }) => {
            const course = ordered[courseIndex];

            return {
                code: course.code,
                bucket,
                credits: fromUnits(
                    edge.original - edge.capacity
                ),
                status: course.status as
                    | "completed"
                    | "in_progress",
            };
        })
        .filter((item) => item.credits > 0);

    const buckets = GEN_ED_BUCKETS.map((bucket) => {
        const matches = allocations.filter(
            (item) => item.bucket === bucket.id
        );

        const completed = matches
            .filter((item) => item.status === "completed")
            .reduce((sum, item) => sum + item.credits, 0);

        const inProgress = matches
            .filter((item) => item.status === "in_progress")
            .reduce((sum, item) => sum + item.credits, 0);

        return {
            ...bucket,
            completed,
            inProgress,
            remaining: Math.max(
                0,
                bucket.required - completed - inProgress
            ),
        };
    });

    return {
        buckets,
        allocations,
        unknownCourses,
        cultures,
    };
}
