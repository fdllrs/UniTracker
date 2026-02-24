import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@/test/helpers';
import usePlanEditor from '@/hooks/usePlanEditor';

describe('usePlanEditor', () => {
    function makeTestPlan() {
        return {
            plan: 'Test', subtitle: 'S',
            years: [{ year: 1, label: '1', semesters: [{ semester: 1, label: 'S1', courses: [{ id: 'c1', name: 'A', dependencies: [], weeklyHours: 4 }] }] }],
        };
    }

    it('startEditing snapshots the current plan', () => {
        const plan = makeTestPlan();
        const setPlan = vi.fn();
        const { result } = renderHook(() => usePlanEditor(plan, setPlan));

        act(() => result.current.startEditing());
        expect(setPlan).not.toHaveBeenCalled();
    });

    it('savePlan persists to localStorage', () => {
        const plan = makeTestPlan();
        const setPlan = vi.fn();
        const { result } = renderHook(() => usePlanEditor(plan, setPlan));

        act(() => result.current.savePlan());

        const stored = JSON.parse(localStorage.getItem('unitracker-plan'));
        expect(stored.plan).toBe('Test');
        expect(stored.years[0].semesters[0].courses[0].name).toBe('A');
    });

    it('discardEdits restores the snapshotted plan', () => {
        const originalPlan = makeTestPlan();
        const setPlan = vi.fn();
        const { result, rerender } = renderHook(
            ({ plan }) => usePlanEditor(plan, setPlan),
            { initialProps: { plan: originalPlan } },
        );

        act(() => result.current.startEditing());

        const modifiedPlan = { ...originalPlan, plan: 'Modified' };
        rerender({ plan: modifiedPlan });

        act(() => result.current.discardEdits());
        expect(setPlan).toHaveBeenCalledWith(expect.objectContaining({ plan: 'Test' }));
    });

    it('discardEdits is a no-op if startEditing was never called', () => {
        const plan = makeTestPlan();
        const setPlan = vi.fn();
        const { result } = renderHook(() => usePlanEditor(plan, setPlan));

        act(() => result.current.discardEdits());
        expect(setPlan).not.toHaveBeenCalled();
    });
});
