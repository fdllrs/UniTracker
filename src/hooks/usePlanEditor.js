import { useCallback, useRef } from 'react';

/**
 * Edit-mode lifecycle: snapshot → mutate → save or discard.
 */
export default function usePlanEditor(studyPlan, setStudyPlan) {
    const planSnapshot = useRef(null);

    const startEditing = useCallback(() => {
        planSnapshot.current = structuredClone(studyPlan);
    }, [studyPlan]);

    const savePlan = useCallback(() => {
        localStorage.setItem('unitracker-plan', JSON.stringify(studyPlan));
        planSnapshot.current = null;
    }, [studyPlan]);

    const discardEdits = useCallback(() => {
        if (planSnapshot.current) {
            setStudyPlan(planSnapshot.current);
            planSnapshot.current = null;
        }
    }, [setStudyPlan]);

    return { startEditing, savePlan, discardEdits };
}
