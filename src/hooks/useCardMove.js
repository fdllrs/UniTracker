import { useState, useCallback, useEffect } from 'react';

/**
 * Card move/reorder drag — handles dragging a card between semesters
 * with live sorting.
 */
export default function useCardMove({ allCourses, studyPlan, reorderCourse }) {
    const [activeDrag, setActiveDrag] = useState(null);

    const startMove = useCallback((courseId, e) => {
        const card = document.getElementById(`card-${courseId}`);
        const rect = card.getBoundingClientRect();
        const course = allCourses.find(c => c.id === courseId);
        document.body.style.cursor = 'grabbing';
        setActiveDrag({
            courseId,
            courseName: course?.name || '',
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
            mouseX: e.clientX,
            mouseY: e.clientY,
            width: rect.width,
            height: rect.height,
        });
    }, [allCourses]);

    useEffect(() => {
        if (!activeDrag) return;

        const onMove = (e) => {
            setActiveDrag(prev => prev ? { ...prev, mouseX: e.clientX, mouseY: e.clientY } : null);

            // Hide floater so elementsFromPoint can see through it
            const floater = document.getElementById('floating-move-card');
            if (floater) floater.style.pointerEvents = 'none';
            const elementsAtPoint = document.elementsFromPoint(e.clientX, e.clientY);
            if (floater) floater.style.pointerEvents = '';

            const semEl = elementsAtPoint.find(el => el.classList.contains('semester-row'));
            if (!semEl) return;

            const targetSemIdx = parseInt(semEl.dataset.semesterIndex);
            const coursesContainer = semEl.querySelector('.semester-courses');
            const courseEls = Array.from(
                coursesContainer.querySelectorAll('.course-card:not(.course-card--dragging):not(.course-card--add)')
            );

            let targetIdx = courseEls.length;
            for (let i = 0; i < courseEls.length; i++) {
                const rect = courseEls[i].getBoundingClientRect();
                if (e.clientX < rect.left + rect.width / 2) {
                    targetIdx = i;
                    break;
                }
            }

            const allSems = studyPlan.years.flatMap(y => y.semesters);
            const currentSem = allSems.find(s => s.courses.some(c => c.id === activeDrag.courseId));
            const currentSemIdx = allSems.indexOf(currentSem);
            const currentIdx = currentSem
                ? currentSem.courses.findIndex(c => c.id === activeDrag.courseId)
                : -1;

            if (targetSemIdx !== currentSemIdx || targetIdx !== currentIdx) {
                reorderCourse(activeDrag.courseId, targetSemIdx, targetIdx);
            }
        };

        const onEnd = () => {
            document.body.style.cursor = '';
            setActiveDrag(null);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onEnd);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onEnd);
        };
    }, [activeDrag, studyPlan, reorderCourse]);

    return { activeDrag, startMove };
}
