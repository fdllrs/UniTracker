import { useState, useCallback } from 'react';

function loadFromStorage(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : fallback;
    } catch {
        return fallback;
    }
}

/**
 * Grade tracking per course.
 */
export default function useGrades() {
    const [grades, setGrades] = useState(() =>
        loadFromStorage('unitracker-grades', {})
    );

    const setGrade = useCallback((courseId, grade) => {
        setGrades((prev) => {
            const updated = { ...prev, [courseId]: grade };
            localStorage.setItem('unitracker-grades', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const resetGrades = useCallback(() => {
        setGrades({});
        localStorage.setItem('unitracker-grades', JSON.stringify({}));
    }, []);

    return { grades, setGrade, resetGrades };
}
