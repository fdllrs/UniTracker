import { describe, it, expect } from 'vitest';
import usePlanStats from '@/hooks/usePlanStats';
import { renderHook } from '@/test/helpers';

function makeGetEffectiveStatus(statusMap) {
    return (courseId) => statusMap[courseId] || 'pendiente';
}

describe('usePlanStats', () => {
    const courses = [
        { id: 'c1', name: 'A', dependencies: [], weeklyHours: 4 },
        { id: 'c2', name: 'B', dependencies: [], weeklyHours: 6 },
        { id: 'c3', name: 'C', dependencies: [], weeklyHours: 2 },
        { id: 'c4', name: 'D', dependencies: [], weeklyHours: 0 },
    ];

    it('counts courses by status correctly', () => {
        const statusMap = { c1: 'aprobada', c2: 'regular', c3: 'cursar', c4: 'pendiente' };
        const { result } = renderHook(() =>
            usePlanStats(courses, makeGetEffectiveStatus(statusMap), {})
        );

        expect(result.current.aprobada).toBe(1);
        expect(result.current.regular).toBe(2);
        expect(result.current.cursar).toBe(1);
        expect(result.current.pendiente).toBe(1);
        expect(result.current.total).toBe(4);
    });

    it('calculates total and completed hours (×16 weeks)', () => {
        const statusMap = { c1: 'aprobada', c2: 'regular', c3: 'cursar', c4: 'pendiente' };
        const { result } = renderHook(() =>
            usePlanStats(courses, makeGetEffectiveStatus(statusMap), {})
        );

        expect(result.current.totalHours).toBe(192);
        expect(result.current.completedHours).toBe(160);
    });

    it('calculates grade average correctly, ignoring empty/null grades', () => {
        const statusMap = { c1: 'aprobada', c2: 'aprobada', c3: 'aprobada', c4: 'aprobada' };
        const grades = { c1: 8, c2: 10, c3: null, c4: '' };
        const { result } = renderHook(() =>
            usePlanStats(courses, makeGetEffectiveStatus(statusMap), grades)
        );

        expect(result.current.average).toBe('9.00');
        expect(result.current.gradedCount).toBe(2);
    });

    it('returns "—" for average when no grades exist', () => {
        const { result } = renderHook(() =>
            usePlanStats(courses, makeGetEffectiveStatus({}), {})
        );
        expect(result.current.average).toBe('—');
    });

    it('calculates completion percentage', () => {
        const statusMap = { c1: 'aprobada', c2: 'regular', c3: 'pendiente', c4: 'pendiente' };
        const { result } = renderHook(() =>
            usePlanStats(courses, makeGetEffectiveStatus(statusMap), {})
        );
        expect(result.current.pctComplete).toBe(50);
    });

    it('handles empty course list', () => {
        const { result } = renderHook(() =>
            usePlanStats([], makeGetEffectiveStatus({}), {})
        );
        expect(result.current.total).toBe(0);
        expect(result.current.pctComplete).toBe(0);
        expect(result.current.average).toBe('—');
    });
});
