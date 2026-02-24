import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@/test/helpers';
import usePlanData from '@/hooks/usePlanData';

describe('usePlanData', () => {
    it('loads the default plan when localStorage is empty', () => {
        const { result } = renderHook(() => usePlanData());
        // Should have some courses from the default plan
        expect(result.current.studyPlan.years.length).toBeGreaterThan(0);
        expect(result.current.allCourses.length).toBeGreaterThan(0);
    });

    it('hydrates from localStorage when a saved plan exists', () => {
        const savedPlan = {
            plan: 'Saved', subtitle: 'Test',
            years: [{
                year: 1, label: '1',
                semesters: [{
                    semester: 1, label: 'S1',
                    courses: [{ id: 'x1', name: 'Saved Course', dependencies: [], weeklyHours: 4 }],
                }],
            }],
        };
        localStorage.setItem('unitracker-plan', JSON.stringify(savedPlan));
        const { result } = renderHook(() => usePlanData());
        expect(result.current.allCourses).toHaveLength(1);
        expect(result.current.allCourses[0].name).toBe('Saved Course');
    });

    it('allCourses flattens courses from all semesters', () => {
        const plan = {
            plan: 'P', subtitle: 'S',
            years: [{
                year: 1, label: '1',
                semesters: [
                    { semester: 1, label: 'S1', courses: [{ id: 'a', name: 'A', dependencies: [], weeklyHours: 0 }] },
                    { semester: 2, label: 'S2', courses: [{ id: 'b', name: 'B', dependencies: [], weeklyHours: 0 }] },
                ],
            }],
        };
        localStorage.setItem('unitracker-plan', JSON.stringify(plan));
        const { result } = renderHook(() => usePlanData());
        expect(result.current.allCourses.map(c => c.id)).toEqual(['a', 'b']);
    });

    it('getSemesterIndex returns the flat index of the semester containing a course', () => {
        const plan = {
            plan: 'P', subtitle: 'S',
            years: [{
                year: 1, label: '1',
                semesters: [
                    { semester: 1, label: 'S1', courses: [{ id: 'a', name: 'A', dependencies: [], weeklyHours: 0 }] },
                    { semester: 2, label: 'S2', courses: [{ id: 'b', name: 'B', dependencies: [], weeklyHours: 0 }] },
                ],
            }],
        };
        localStorage.setItem('unitracker-plan', JSON.stringify(plan));
        const { result } = renderHook(() => usePlanData());
        expect(result.current.getSemesterIndex('a')).toBe(0);
        expect(result.current.getSemesterIndex('b')).toBe(1);
        expect(result.current.getSemesterIndex('nonexistent')).toBe(-1);
    });

    it('resetPlan replaces the plan with the empty plan', () => {
        const { result } = renderHook(() => usePlanData());
        const initialCourseCount = result.current.allCourses.length;
        expect(initialCourseCount).toBeGreaterThan(0);

        act(() => result.current.resetPlan());

        expect(result.current.allCourses.length).toBe(0);
        expect(result.current.studyPlan.plan).toBe('Plan de Estudios');
    });
});
