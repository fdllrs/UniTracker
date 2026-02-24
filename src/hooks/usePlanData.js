import { useState, useCallback, useMemo } from 'react';
import DEFAULT_STUDY_PLAN from '../data/csComp-UBA-v2023';
import EMPTY_PLAN from '../data/emptyPlan';

function loadFromStorage(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch {
        return fallback;
    }
}

/**
 * Core plan state, localStorage hydration, and derived collections.
 */
export default function usePlanData() {
    const [studyPlan, setStudyPlan] = useState(() =>
        loadFromStorage('unitracker-plan', structuredClone(DEFAULT_STUDY_PLAN))
    );

    // Flatten all courses
    const allCourses = useMemo(() => {
        const courses = [];
        for (const year of studyPlan.years) {
            for (const sem of year.semesters) {
                for (const course of sem.courses) {
                    courses.push(course);
                }
            }
        }
        return courses;
    }, [studyPlan]);

    // Flat list of all semesters
    const allSemesters = useMemo(() => {
        const sems = [];
        for (const year of studyPlan.years) {
            for (const sem of year.semesters) {
                sems.push(sem);
            }
        }
        return sems;
    }, [studyPlan]);

    // Get semester index for a course
    const getSemesterIndex = useCallback(
        (courseId) => {
            let idx = 0;
            for (const year of studyPlan.years) {
                for (const sem of year.semesters) {
                    for (const course of sem.courses) {
                        if (course.id === courseId) return idx;
                    }
                    idx++;
                }
            }
            return -1;
        },
        [studyPlan]
    );

    const updatePlan = useCallback((newPlan) => {
        setStudyPlan(newPlan);
    }, []);

    const updatePlanMeta = useCallback((fields) => {
        setStudyPlan((prev) => {
            const plan = { ...prev, ...fields };
            localStorage.setItem('unitracker-plan', JSON.stringify(plan));
            return plan;
        });
    }, []);

    const resetPlan = useCallback(() => {
        setStudyPlan(structuredClone(EMPTY_PLAN));
    }, []);

    return {
        studyPlan,
        setStudyPlan,
        allCourses,
        allSemesters,
        getSemesterIndex,
        updatePlan,
        updatePlanMeta,
        resetPlan,
    };
}
