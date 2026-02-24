import { renderHook, act } from '@testing-library/react';

/**
 * Creates a minimal plan structure for testing.
 * Courses get predictable IDs for assertion clarity.
 */
export function makePlan(semesters) {
    return {
        plan: 'Test Plan',
        subtitle: 'Testing',
        years: [{
            year: 1,
            label: 'Año 1',
            semesters: semesters.map((courses, i) => ({
                semester: i + 1,
                label: `${i + 1}° Cuatrimestre`,
                courses: courses.map(c => ({
                    id: c.id || `c${c.name}`,
                    name: c.name,
                    dependencies: c.dependencies || [],
                    weeklyHours: c.hours || 0,
                })),
            })),
        }],
    };
}

/**
 * Seeds localStorage with a plan, statuses, and/or grades.
 */
export function seedStorage({ plan, statuses, grades } = {}) {
    if (plan) localStorage.setItem('unitracker-plan', JSON.stringify(plan));
    if (statuses) localStorage.setItem('unitracker-statuses', JSON.stringify(statuses));
    if (grades) localStorage.setItem('unitracker-grades', JSON.stringify(grades));
}

export { renderHook, act };
