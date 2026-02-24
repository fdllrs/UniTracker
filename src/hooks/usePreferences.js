import { useState, useCallback } from 'react';

const STORAGE_KEY = 'unitracker-preferences';

const DEFAULTS = {
    showHours: true,
    showGrades: true,
};

function loadPrefs() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? { ...DEFAULTS, ...JSON.parse(saved) } : { ...DEFAULTS };
    } catch {
        return { ...DEFAULTS };
    }
}

/**
 * Manages user display preferences persisted to localStorage.
 */
export default function usePreferences() {
    const [prefs, setPrefs] = useState(loadPrefs);

    const updatePref = useCallback((key, value) => {
        setPrefs((prev) => {
            const next = { ...prev, [key]: value };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    }, []);

    return { prefs, updatePref };
}
