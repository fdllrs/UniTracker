import usePlanData from './usePlanData';
import usePlanMutations from './usePlanMutations';
import usePlanEditor from './usePlanEditor';
import useCourseStatuses from './useCourseStatuses';
import useGrades from './useGrades';
import usePlanStats from './usePlanStats';

// Re-export constants so existing imports keep working
export { STATUS_LABELS, STATUS_COLORS } from './useCourseStatuses';

/**
 * Orchestrating hook — composes all plan sub-hooks and
 * returns the unified API that App.jsx and other consumers expect.
 */
export default function useStudyPlan() {
    const {
        studyPlan, setStudyPlan,
        allCourses, allSemesters,
        getSemesterIndex,
        updatePlan, updatePlanMeta, resetPlan,
    } = usePlanData();

    const {
        addCourse, removeCourse, reorderCourse, updateCourseHours,
        addSemester, removeSemester,
        addDependency, removeDependency, toggleDependency,
    } = usePlanMutations(setStudyPlan);

    const { startEditing, savePlan, discardEdits } = usePlanEditor(studyPlan, setStudyPlan);

    const { statuses, getEffectiveStatus, cycleStatus, resetStatuses } = useCourseStatuses(allCourses);

    const { grades, setGrade, resetGrades } = useGrades();

    const stats = usePlanStats(allCourses, getEffectiveStatus, grades);

    return {
        studyPlan,
        allCourses,
        allSemesters,
        statuses,
        grades,
        stats,
        getEffectiveStatus,
        getSemesterIndex,
        cycleStatus,
        resetStatuses,
        setGrade,
        resetGrades,
        updatePlan,
        updatePlanMeta,
        resetPlan,
        startEditing,
        savePlan,
        discardEdits,
        addCourse,
        removeCourse,
        reorderCourse,
        updateCourseHours,
        addSemester,
        removeSemester,
        addDependency,
        removeDependency,
        toggleDependency,
    };
}
