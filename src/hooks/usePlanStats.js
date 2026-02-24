import { useMemo } from 'react';

/**
 * Computed statistics derived from courses, statuses, and grades.
 */
export default function usePlanStats(allCourses, getEffectiveStatus, grades) {
    return useMemo(() => {
        const s = { aprobada: 0, regular: 0, cursar: 0, pendiente: 0 };
        let totalHours = 0;
        let completedHours = 0;

        for (const c of allCourses) {
            const st = getEffectiveStatus(c.id);
            s[st]++;
            const courseHours = (c.weeklyHours || 0) * 16;
            totalHours += courseHours;
            if (st === 'aprobada' || st === 'regular') {
                completedHours += courseHours;
            }
        }

        s.total = allCourses.length;
        const exclusiveRegular = s.regular;
        s.regular += s.aprobada;
        s.totalHours = totalHours;
        s.completedHours = completedHours;

        // Grade average
        let gradeSum = 0;
        let gradeCount = 0;
        for (const c of allCourses) {
            const g = grades[c.id];
            if (g !== undefined && g !== null && g !== '' && !isNaN(g) && Number(g) > 0) {
                gradeSum += Number(g);
                gradeCount++;
            }
        }
        s.average = gradeCount > 0 ? (gradeSum / gradeCount).toFixed(2) : '—';
        s.gradedCount = gradeCount;

        s.pctComplete =
            s.total > 0
                ? Math.round(((s.aprobada + exclusiveRegular) / s.total) * 100)
                : 0;

        return s;
    }, [allCourses, getEffectiveStatus, grades]);
}
