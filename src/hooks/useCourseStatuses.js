import { useState, useCallback } from 'react';

const STATUS_ORDER = ['pendiente', 'regular', 'aprobada'];

export const STATUS_LABELS = {
    pendiente: 'Pendiente',
    regular: 'Regular',
    aprobada: 'Aprobada',
    cursar: 'Puedo cursar',
};

export const STATUS_COLORS = {
    pendiente: '#4a556881',
    regular: '#22d3ee81',
    aprobada: '#38d97a81',
    cursar: '#f6a52381',
};

function loadFromStorage(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch {
        return fallback;
    }
}

/**
 * Course status state: cycling, effective status resolution, reset.
 */
export default function useCourseStatuses(allCourses) {
    const [statuses, setStatuses] = useState(() =>
        loadFromStorage('unitracker-statuses', {})
    );

    const getEffectiveStatus = useCallback(
        (courseId) => {
            const userStatus = statuses[courseId] || 'pendiente';
            if (userStatus !== 'pendiente') return userStatus;

            const course = allCourses.find((c) => c.id === courseId);
            if (!course || course.dependencies.length === 0) return 'cursar';

            const allDepsMet = course.dependencies.every((depId) => {
                const depStatus = statuses[depId] || 'pendiente';
                return depStatus === 'regular' || depStatus === 'aprobada';
            });

            return allDepsMet ? 'cursar' : 'pendiente';
        },
        [statuses, allCourses]
    );

    const cycleStatus = useCallback(
        (courseId) => {
            setStatuses((prev) => {
                const effectiveStatus = getEffectiveStatus(courseId);
                let next;
                if (effectiveStatus === 'cursar') {
                    next = 'regular';
                } else {
                    const current = prev[courseId] || 'pendiente';
                    const idx = STATUS_ORDER.indexOf(current);
                    next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
                }
                const updated = { ...prev, [courseId]: next };
                localStorage.setItem('unitracker-statuses', JSON.stringify(updated));
                return updated;
            });
        },
        [getEffectiveStatus]
    );

    const resetStatuses = useCallback(() => {
        setStatuses({});
        localStorage.setItem('unitracker-statuses', JSON.stringify({}));
    }, []);

    return { statuses, getEffectiveStatus, cycleStatus, resetStatuses };
}
