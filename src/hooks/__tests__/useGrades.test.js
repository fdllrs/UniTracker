import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@/test/helpers';
import useGrades from '@/hooks/useGrades';

describe('useGrades', () => {
    it('starts with empty grades when localStorage is empty', () => {
        const { result } = renderHook(() => useGrades());
        expect(result.current.grades).toEqual({});
    });

    it('hydrates from localStorage', () => {
        localStorage.setItem('unitracker-grades', JSON.stringify({ c1: 8, c2: 10 }));
        const { result } = renderHook(() => useGrades());
        expect(result.current.grades).toEqual({ c1: 8, c2: 10 });
    });

    it('sets a grade for a course and persists it', () => {
        const { result } = renderHook(() => useGrades());
        act(() => result.current.setGrade('c1', 7));
        expect(result.current.grades.c1).toBe(7);

        const stored = JSON.parse(localStorage.getItem('unitracker-grades'));
        expect(stored.c1).toBe(7);
    });

    it('updates an existing grade', () => {
        const { result } = renderHook(() => useGrades());
        act(() => result.current.setGrade('c1', 5));
        act(() => result.current.setGrade('c1', 9));
        expect(result.current.grades.c1).toBe(9);
    });

    it('can set a grade to null to remove it', () => {
        const { result } = renderHook(() => useGrades());
        act(() => result.current.setGrade('c1', 8));
        act(() => result.current.setGrade('c1', null));
        expect(result.current.grades.c1).toBeNull();
    });

    it('resetGrades clears all grades and persists', () => {
        const { result } = renderHook(() => useGrades());
        act(() => result.current.setGrade('c1', 8));
        act(() => result.current.setGrade('c2', 9));
        act(() => result.current.resetGrades());

        expect(result.current.grades).toEqual({});
        const stored = JSON.parse(localStorage.getItem('unitracker-grades'));
        expect(stored).toEqual({});
    });
});
