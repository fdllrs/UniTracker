import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@/test/helpers';
import usePlanMutations from '@/hooks/usePlanMutations';

function makeSimplePlan() {
    return {
        plan: 'P', subtitle: 'S',
        years: [{
            year: 1, label: '1',
            semesters: [
                {
                    semester: 1, label: 'S1',
                    courses: [
                        { id: 'c1', name: 'Algebra', dependencies: [], weeklyHours: 4 },
                        { id: 'c2', name: 'Analisis', dependencies: ['c1'], weeklyHours: 6 },
                    ],
                },
                {
                    semester: 2, label: 'S2',
                    courses: [
                        { id: 'c3', name: 'Fisica', dependencies: ['c1'], weeklyHours: 5 },
                    ],
                },
            ],
        }],
    };
}

function setupMutations(initialPlan) {
    let plan = structuredClone(initialPlan);
    const setPlan = vi.fn((updater) => {
        const result = typeof updater === 'function' ? updater(plan) : updater;
        plan = result;
        return result;
    });

    const { result } = renderHook(() => usePlanMutations(setPlan));

    return {
        mutations: result.current,
        getPlan: () => plan,
        setPlan,
    };
}

describe('usePlanMutations', () => {
    describe('addCourse', () => {
        it('appends a course to the correct semester by flat index', () => {
            const { mutations, getPlan } = setupMutations(makeSimplePlan());
            act(() => mutations.addCourse(0, 'Nueva Materia', 3));
            const sem0 = getPlan().years[0].semesters[0];
            expect(sem0.courses).toHaveLength(3);
            expect(sem0.courses[2].name).toBe('Nueva Materia');
            expect(sem0.courses[2].weeklyHours).toBe(3);
            expect(sem0.courses[2].dependencies).toEqual([]);
        });

        it('ignores empty names', () => {
            const { mutations, setPlan } = setupMutations(makeSimplePlan());
            act(() => mutations.addCourse(0, '', 3));
            expect(setPlan).not.toHaveBeenCalled();
        });

        it('adds to semester at index 1 correctly', () => {
            const { mutations, getPlan } = setupMutations(makeSimplePlan());
            act(() => mutations.addCourse(1, 'Quimica', 4));
            const sem1 = getPlan().years[0].semesters[1];
            expect(sem1.courses).toHaveLength(2);
            expect(sem1.courses[1].name).toBe('Quimica');
        });
    });

    describe('removeCourse', () => {
        it('removes the course and cleans up all references to it in dependencies', () => {
            const { mutations, getPlan } = setupMutations(makeSimplePlan());
            act(() => mutations.removeCourse('c1'));
            const allCourses = getPlan().years[0].semesters.flatMap(s => s.courses);
            expect(allCourses.find(c => c.id === 'c1')).toBeUndefined();
            expect(allCourses.find(c => c.id === 'c2').dependencies).toEqual([]);
            expect(allCourses.find(c => c.id === 'c3').dependencies).toEqual([]);
        });
    });

    describe('updateCourseHours', () => {
        it('updates the weekly hours of a specific course', () => {
            const { mutations, getPlan } = setupMutations(makeSimplePlan());
            act(() => mutations.updateCourseHours('c1', 10));
            const c1 = getPlan().years[0].semesters[0].courses.find(c => c.id === 'c1');
            expect(c1.weeklyHours).toBe(10);
        });
    });

    describe('addSemester', () => {
        it('adds a new semester, creating a new year when the last year has 2 semesters', () => {
            const { mutations, getPlan } = setupMutations(makeSimplePlan());
            act(() => mutations.addSemester());
            expect(getPlan().years).toHaveLength(2);
            expect(getPlan().years[1].semesters).toHaveLength(1);
            expect(getPlan().years[1].semesters[0].courses).toEqual([]);
        });

        it('adds to existing year when it has fewer than 2 semesters', () => {
            const plan = {
                plan: 'P', subtitle: 'S',
                years: [{ year: 1, label: '1', semesters: [{ semester: 1, label: 'S1', courses: [] }] }],
            };
            const { mutations, getPlan } = setupMutations(plan);
            act(() => mutations.addSemester());
            expect(getPlan().years).toHaveLength(1);
            expect(getPlan().years[0].semesters).toHaveLength(2);
        });
    });

    describe('removeSemester', () => {
        it('removes the semester and cleans up orphaned dependencies', () => {
            const { mutations, getPlan } = setupMutations(makeSimplePlan());
            act(() => mutations.removeSemester(0));
            const remaining = getPlan().years[0].semesters;
            expect(remaining).toHaveLength(1);
            expect(remaining[0].courses[0].id).toBe('c3');
            expect(remaining[0].courses[0].dependencies).toEqual([]);
        });

        it('removes the year entirely if its last semester is removed', () => {
            const plan = {
                plan: 'P', subtitle: 'S',
                years: [
                    { year: 1, label: 'Año 1', semesters: [{ semester: 1, label: '1° Cuatrimestre', courses: [] }] },
                    { year: 2, label: 'Año 2', semesters: [{ semester: 2, label: '2° Cuatrimestre', courses: [] }] },
                ],
            };
            const { mutations, getPlan } = setupMutations(plan);
            act(() => mutations.removeSemester(0));
            // Because of global reindexing, the second year shifts up and becomes Año 1
            expect(getPlan().years).toHaveLength(1);
            expect(getPlan().years[0].label).toBe('Año 1');
            expect(getPlan().years[0].year).toBe(1);
            expect(getPlan().years[0].semesters[0].label).toBe('1° Cuatrimestre');
        });
    });

    describe('reorderCourse', () => {
        it('moves a course from one semester to another', () => {
            const { mutations, getPlan } = setupMutations(makeSimplePlan());
            act(() => mutations.reorderCourse('c1', 1, 0));
            const sem0 = getPlan().years[0].semesters[0];
            const sem1 = getPlan().years[0].semesters[1];
            expect(sem0.courses.map(c => c.id)).toEqual(['c2']);
            expect(sem1.courses.map(c => c.id)).toEqual(['c1', 'c3']);
        });

        it('reorders within the same semester', () => {
            const { mutations, getPlan } = setupMutations(makeSimplePlan());
            act(() => mutations.reorderCourse('c2', 0, 0));
            const sem0 = getPlan().years[0].semesters[0];
            expect(sem0.courses.map(c => c.id)).toEqual(['c2', 'c1']);
        });
    });

    describe('toggleDependency', () => {
        it('adds a dependency when it does not exist', () => {
            const { mutations, getPlan } = setupMutations(makeSimplePlan());
            act(() => mutations.toggleDependency('c2', 'c3'));
            const c3 = getPlan().years[0].semesters[1].courses[0];
            expect(c3.dependencies).toContain('c2');
            expect(c3.dependencies).toContain('c1');
        });

        it('removes a dependency when it already exists', () => {
            const { mutations, getPlan } = setupMutations(makeSimplePlan());
            act(() => mutations.toggleDependency('c1', 'c3'));
            const c3 = getPlan().years[0].semesters[1].courses[0];
            expect(c3.dependencies).not.toContain('c1');
        });
    });
});
