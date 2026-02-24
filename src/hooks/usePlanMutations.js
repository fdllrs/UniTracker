import { useCallback } from 'react';

let _idCounter = Date.now();
function genId() {
    return `course-${_idCounter++}`;
}

function reindexSemesters(plan) {
    let globalSemIndex = 1;
    let yearIndex = 1;

    for (const year of plan.years) {
        year.year = yearIndex;
        year.label = `Año ${yearIndex}`;

        let semLocalIndex = 1;
        for (const sem of year.semesters) {
            sem.semester = semLocalIndex;
            sem.label = `${globalSemIndex}° Cuatrimestre`;
            globalSemIndex++;
            semLocalIndex++;
        }
        yearIndex++;
    }
}

/**
 * All plan-mutation functions (add/remove/reorder courses, semesters, dependencies).
 * Receives the plan setter from usePlanData.
 */
export default function usePlanMutations(setStudyPlan) {
    const addCourse = useCallback((semFlatIndex, name, weeklyHours = 0) => {
        if (!name) return;
        setStudyPlan((prev) => {
            const plan = structuredClone(prev);
            let idx = 0;
            for (const year of plan.years) {
                for (const sem of year.semesters) {
                    if (idx === semFlatIndex) {
                        sem.courses.push({ id: genId(), name, dependencies: [], weeklyHours: weeklyHours || 0 });
                        return plan;
                    }
                    idx++;
                }
            }
            return prev;
        });
    }, [setStudyPlan]);

    const updateCourseHours = useCallback((courseId, weeklyHours) => {
        setStudyPlan((prev) => {
            const plan = structuredClone(prev);
            for (const year of plan.years) {
                for (const sem of year.semesters) {
                    for (const course of sem.courses) {
                        if (course.id === courseId) {
                            course.weeklyHours = weeklyHours;
                            return plan;
                        }
                    }
                }
            }
            return prev;
        });
    }, [setStudyPlan]);

    const removeCourse = useCallback((courseId) => {
        setStudyPlan((prev) => {
            const plan = structuredClone(prev);
            for (const year of plan.years) {
                for (const sem of year.semesters) {
                    sem.courses = sem.courses.filter((c) => c.id !== courseId);
                    for (const c of sem.courses) {
                        c.dependencies = c.dependencies.filter((d) => d !== courseId);
                    }
                }
            }
            return plan;
        });
    }, [setStudyPlan]);

    const addSemester = useCallback(() => {
        setStudyPlan((prev) => {
            const plan = structuredClone(prev);

            let lastYear = plan.years[plan.years.length - 1];
            if (!lastYear || lastYear.semesters.length >= 2) {
                lastYear = { year: 0, label: '', semesters: [] };
                plan.years.push(lastYear);
            }

            lastYear.semesters.push({
                semester: 0,
                label: '',
                courses: [],
            });

            reindexSemesters(plan);
            return plan;
        });
    }, [setStudyPlan]);

    const removeSemester = useCallback((semFlatIndex) => {
        setStudyPlan((prev) => {
            const plan = structuredClone(prev);
            let idx = 0;
            let removedIds = new Set();
            let found = false;

            for (let yi = 0; yi < plan.years.length; yi++) {
                const year = plan.years[yi];
                for (let si = 0; si < year.semesters.length; si++) {
                    if (idx === semFlatIndex) {
                        removedIds = new Set(year.semesters[si].courses.map((c) => c.id));
                        year.semesters.splice(si, 1);
                        if (year.semesters.length === 0) {
                            plan.years.splice(yi, 1);
                        }
                        found = true;
                        break;
                    }
                    idx++;
                }
                if (found) break;
            }

            if (!found) return prev;

            for (const y of plan.years) {
                for (const s of y.semesters) {
                    for (const c of s.courses) {
                        c.dependencies = c.dependencies.filter((d) => !removedIds.has(d));
                    }
                }
            }

            reindexSemesters(plan);
            return plan;
        });
    }, [setStudyPlan]);

    const reorderCourse = useCallback((courseId, targetSemFlatIndex, targetCourseIdx) => {
        setStudyPlan((prev) => {
            const plan = structuredClone(prev);
            let courseToMove = null;

            for (const year of plan.years) {
                for (const sem of year.semesters) {
                    const idx = sem.courses.findIndex((c) => c.id === courseId);
                    if (idx !== -1) {
                        [courseToMove] = sem.courses.splice(idx, 1);
                        break;
                    }
                }
                if (courseToMove) break;
            }

            if (!courseToMove) return prev;

            let semIdx = 0;
            for (const year of plan.years) {
                for (const sem of year.semesters) {
                    if (semIdx === targetSemFlatIndex) {
                        const insertAt = Math.max(0, Math.min(targetCourseIdx, sem.courses.length));
                        sem.courses.splice(insertAt, 0, courseToMove);
                        return plan;
                    }
                    semIdx++;
                }
            }
            return prev;
        });
    }, [setStudyPlan]);

    const addDependency = useCallback((sourceId, targetId) => {
        setStudyPlan((prev) => {
            const plan = structuredClone(prev);
            for (const year of plan.years) {
                for (const sem of year.semesters) {
                    for (const course of sem.courses) {
                        if (course.id === targetId && !course.dependencies.includes(sourceId)) {
                            course.dependencies.push(sourceId);
                            return plan;
                        }
                    }
                }
            }
            return prev;
        });
    }, [setStudyPlan]);

    const removeDependency = useCallback((sourceId, targetId) => {
        setStudyPlan((prev) => {
            const plan = structuredClone(prev);
            for (const year of plan.years) {
                for (const sem of year.semesters) {
                    for (const course of sem.courses) {
                        if (course.id === targetId) {
                            course.dependencies = course.dependencies.filter((d) => d !== sourceId);
                            return plan;
                        }
                    }
                }
            }
            return prev;
        });
    }, [setStudyPlan]);

    const toggleDependency = useCallback((sourceId, targetId) => {
        let wasRemoved = false;
        setStudyPlan((prev) => {
            const plan = structuredClone(prev);
            for (const year of plan.years) {
                for (const sem of year.semesters) {
                    for (const course of sem.courses) {
                        if (course.id === targetId) {
                            const idx = course.dependencies.indexOf(sourceId);
                            if (idx !== -1) {
                                course.dependencies.splice(idx, 1);
                                wasRemoved = true;
                            } else {
                                course.dependencies.push(sourceId);
                            }
                            return plan;
                        }
                    }
                }
            }
            return prev;
        });
        return wasRemoved;
    }, [setStudyPlan]);

    return {
        addCourse,
        removeCourse,
        reorderCourse,
        updateCourseHours,
        addSemester,
        removeSemester,
        addDependency,
        removeDependency,
        toggleDependency,
    };
}
