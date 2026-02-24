import { useState, useCallback, useEffect } from 'react';

/**
 * Drag-to-link: handles the interaction where the user drags from one card
 * to another to create/remove a dependency arrow.
 */
export default function useDragLink({ allCourses, toggleDependency, showToast }) {
    const [dragging, setDragging] = useState(null);

    const startDrag = useCallback((courseId, e) => {
        e.preventDefault();
        setDragging({ sourceId: courseId, mouseX: e.clientX, mouseY: e.clientY, snapTarget: null });
    }, []);

    const endDrag = useCallback((courseId) => {
        if (dragging && dragging.sourceId && courseId !== dragging.sourceId) {
            const target = allCourses.find((c) => c.id === courseId);
            const alreadyExists = target?.dependencies.includes(dragging.sourceId);
            toggleDependency(dragging.sourceId, courseId);
            showToast(alreadyExists ? '✓ Dependencia eliminada' : '✓ Dependencia agregada');
        }
        setDragging(null);
    }, [dragging, toggleDependency, showToast, allCourses]);

    // Global mouse tracking & drop handling
    useEffect(() => {
        if (!dragging) return;

        const onMouseMove = (e) => {
            setDragging((prev) => prev ? { ...prev, mouseX: e.clientX, mouseY: e.clientY } : null);

            const el = document.elementFromPoint(e.clientX, e.clientY);
            const cardEl = el?.closest?.('.course-card[data-course-id]');
            if (cardEl) {
                const targetId = cardEl.dataset.courseId;
                if (targetId !== dragging.sourceId) {
                    setDragging((prev) => prev ? { ...prev, snapTarget: targetId } : null);
                    return;
                }
            }
            setDragging((prev) => prev ? { ...prev, snapTarget: null } : null);
        };

        const onMouseUp = (e) => {
            const el = document.elementFromPoint(e.clientX, e.clientY);
            const cardEl = el?.closest?.('.course-card[data-course-id]');
            if (cardEl) {
                const targetId = cardEl.dataset.courseId;
                if (targetId !== dragging.sourceId) {
                    const target = allCourses.find((c) => c.id === targetId);
                    const alreadyExists = target?.dependencies.includes(dragging.sourceId);
                    toggleDependency(dragging.sourceId, targetId);
                    showToast(alreadyExists ? '✓ Dependencia eliminada' : '✓ Dependencia agregada');
                }
            }
            setDragging(null);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [dragging, toggleDependency, showToast, allCourses]);

    return { dragging, startDrag, endDrag };
}
