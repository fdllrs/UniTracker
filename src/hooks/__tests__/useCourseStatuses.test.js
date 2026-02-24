import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@/test/helpers';
import useCourseStatuses from '@/hooks/useCourseStatuses';

function makeCoursesWithDeps() {
    return [
        { id: 'alg', name: 'Algebra', dependencies: [], weeklyHours: 4 },
        { id: 'ana', name: 'Analisis', dependencies: ['alg'], weeklyHours: 6 },
        { id: 'fis', name: 'Fisica', dependencies: ['alg', 'ana'], weeklyHours: 5 },
        { id: 'prog', name: 'Programación', dependencies: [], weeklyHours: 4 },
    ];
}

describe('useCourseStatuses', () => {
    describe('getEffectiveStatus', () => {
        it('returns "cursar" for courses with no dependencies and no user status', () => {
            const courses = makeCoursesWithDeps();
            const { result } = renderHook(() => useCourseStatuses(courses));
            expect(result.current.getEffectiveStatus('alg')).toBe('cursar');
            expect(result.current.getEffectiveStatus('prog')).toBe('cursar');
        });

        it('returns "pendiente" for courses whose dependencies are not met', () => {
            const courses = makeCoursesWithDeps();
            const { result } = renderHook(() => useCourseStatuses(courses));
            expect(result.current.getEffectiveStatus('ana')).toBe('pendiente');
        });

        it('returns "cursar" when all dependencies are met (regular or aprobada)', () => {
            const courses = makeCoursesWithDeps();
            localStorage.setItem('unitracker-statuses', JSON.stringify({ alg: 'regular' }));
            const { result } = renderHook(() => useCourseStatuses(courses));
            expect(result.current.getEffectiveStatus('ana')).toBe('cursar');
        });

        it('returns "pendiente" when only some dependencies are met', () => {
            const courses = makeCoursesWithDeps();
            localStorage.setItem('unitracker-statuses', JSON.stringify({ alg: 'aprobada' }));
            const { result } = renderHook(() => useCourseStatuses(courses));
            expect(result.current.getEffectiveStatus('fis')).toBe('pendiente');
        });

        it('returns the user status when explicitly set (not pendiente)', () => {
            const courses = makeCoursesWithDeps();
            localStorage.setItem('unitracker-statuses', JSON.stringify({ alg: 'aprobada' }));
            const { result } = renderHook(() => useCourseStatuses(courses));
            expect(result.current.getEffectiveStatus('alg')).toBe('aprobada');
        });
    });

    describe('cycleStatus', () => {
        it('cycles from "cursar" → "regular" (first click on available course)', () => {
            const courses = [{ id: 'a', name: 'A', dependencies: [], weeklyHours: 0 }];
            const { result } = renderHook(() => useCourseStatuses(courses));
            expect(result.current.getEffectiveStatus('a')).toBe('cursar');

            act(() => result.current.cycleStatus('a'));
            expect(result.current.getEffectiveStatus('a')).toBe('regular');
        });

        it('cycles through pendiente → regular → aprobada → pendiente', () => {
            const courses = [{ id: 'a', name: 'A', dependencies: [], weeklyHours: 0 }];
            const { result } = renderHook(() => useCourseStatuses(courses));

            act(() => result.current.cycleStatus('a'));
            expect(result.current.getEffectiveStatus('a')).toBe('regular');

            act(() => result.current.cycleStatus('a'));
            expect(result.current.getEffectiveStatus('a')).toBe('aprobada');

            act(() => result.current.cycleStatus('a'));
            expect(result.current.getEffectiveStatus('a')).toBe('cursar');
        });

        it('persists status changes to localStorage', () => {
            const courses = [{ id: 'a', name: 'A', dependencies: [], weeklyHours: 0 }];
            const { result } = renderHook(() => useCourseStatuses(courses));
            act(() => result.current.cycleStatus('a'));

            const stored = JSON.parse(localStorage.getItem('unitracker-statuses'));
            expect(stored.a).toBe('regular');
        });
    });

    describe('resetStatuses', () => {
        it('clears all statuses and persists the empty state', () => {
            const courses = [{ id: 'a', name: 'A', dependencies: [], weeklyHours: 0 }];
            const { result } = renderHook(() => useCourseStatuses(courses));

            act(() => result.current.cycleStatus('a'));
            expect(result.current.getEffectiveStatus('a')).toBe('regular');

            act(() => result.current.resetStatuses());
            expect(result.current.getEffectiveStatus('a')).toBe('cursar');

            const stored = JSON.parse(localStorage.getItem('unitracker-statuses'));
            expect(stored).toEqual({});
        });
    });
});
