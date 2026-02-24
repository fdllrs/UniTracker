import { useState, useRef, useCallback, useMemo, useEffect } from 'react';

// Hooks
import useStudyPlan from './hooks/useStudyPlan';
import useEditMode from './hooks/useEditMode';
import useToast from './hooks/useToast';
import useConfirmModal from './hooks/useConfirmModal';
import useDragLink from './hooks/useDragLink';
import useCardMove from './hooks/useCardMove';
import usePreferences from './hooks/usePreferences';

// Components
import Header from './components/Header';
import SemesterRow from './components/SemesterRow';
import ArrowsOverlay from './components/ArrowsOverlay';
import DragArrow from './components/DragArrow';
import FloatingCard from './components/FloatingCard';
import EditFloatingBar from './components/EditFloatingBar';
import InputModal from './components/InputModal';
import Toast from './components/Toast';
import ConfigMenu from './components/ConfigMenu';
import PreferencesModal from './components/PreferencesModal';
import TemplatesModal from './components/TemplatesModal';

export default function App() {
    // ─── Domain state ───────────────────────────────────────
    const plan = useStudyPlan();
    const {
        studyPlan, allCourses, grades, stats,
        getEffectiveStatus, getSemesterIndex,
        cycleStatus, resetStatuses, resetGrades, setGrade,
        resetPlan, updatePlan, startEditing, savePlan, discardEdits,
        addCourse, removeCourse, reorderCourse, updateCourseHours,
        addSemester, removeSemester, toggleDependency,
        updatePlanMeta,
    } = plan;

    // ─── UI state ───────────────────────────────────────────
    const toast = useToast();
    const confirm = useConfirmModal();
    const editMode = useEditMode(startEditing);
    const { prefs, updatePref } = usePreferences();
    const dragLink = useDragLink({ allCourses, toggleDependency, showToast: toast.show });
    const cardMove = useCardMove({ allCourses, studyPlan, reorderCourse });

    const containerRef = useRef(null);
    const hoverTimeoutRef = useRef(null);
    const currentHoverRef = useRef(null);
    const HOVER_DELAY_MS = 400; // Change this value to adjust the hover delay

    const [highlightedCourse, setHighlightedCourse] = useState(null);
    const [pendingAddSemIndex, setPendingAddSemIndex] = useState(null);
    const [showPrefsModal, setShowPrefsModal] = useState(false);
    const [showTemplatesModal, setShowTemplatesModal] = useState(false);
    const [deleteAnim, setDeleteAnim] = useState(false);

    // ─── Handlers ───────────────────────────────────────────
    useEffect(() => {
        const handleGlobalMouseMove = (e) => {
            const card = e.target.closest('.course-card');
            const courseId = card ? card.dataset.courseId : null;

            if (currentHoverRef.current !== courseId) {
                currentHoverRef.current = courseId;
                if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current);
                }

                if (courseId) {
                    hoverTimeoutRef.current = setTimeout(() => {
                        setHighlightedCourse(courseId);
                    }, HOVER_DELAY_MS);
                } else {
                    setHighlightedCourse(null);
                }
            }
        };

        window.addEventListener('mousemove', handleGlobalMouseMove);
        return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
    }, []);

    const handleSave = useCallback(() => {
        confirm.confirm({
            title: 'Guardar cambios',
            message: '¿Guardar los cambios realizados al plan de estudios?',
            confirmLabel: 'Guardar',
            confirmDanger: false,
            onConfirm: () => {
                savePlan();
                confirm.close();
                editMode.exit();
                toast.show('✓ Plan guardado');
            },
        });
    }, [savePlan, editMode, confirm, toast]);

    const handleDiscard = useCallback(() => {
        confirm.confirm({
            title: 'Descartar cambios',
            message: '¿Descartar todos los cambios y volver al estado anterior?',
            confirmLabel: 'Descartar',
            confirmDanger: true,
            onConfirm: () => {
                discardEdits();
                confirm.close();
                editMode.exit();
                toast.show('Cambios descartados');
            },
        });
    }, [discardEdits, editMode, confirm, toast]);

    const handleRemoveCourse = useCallback((courseId) => {
        const course = allCourses.find((c) => c.id === courseId);
        confirm.confirm({
            title: 'Eliminar materia',
            message: `¿Eliminar "${course?.name || courseId}"? También se eliminarán las dependencias asociadas.`,
            confirmLabel: 'Eliminar',
            confirmDanger: true,
            onConfirm: () => {
                removeCourse(courseId);
                confirm.close();
                toast.show('✓ Materia eliminada');
            },
        });
    }, [allCourses, removeCourse, confirm, toast]);

    const handleRemoveSemester = useCallback((semIndex) => {
        confirm.confirm({
            title: 'Eliminar cuatrimestre',
            message: '¿Eliminar este cuatrimestre y todas sus materias?',
            confirmLabel: 'Eliminar',
            confirmDanger: true,
            onConfirm: () => {
                removeSemester(semIndex);
                confirm.close();
                toast.show('✓ Cuatrimestre eliminado');
            },
        });
    }, [removeSemester, confirm, toast]);

    // ─── Config menu handlers ───────────────────────────────
    const handleConfigEditPlan = useCallback(() => {
        if (editMode.active) {
            handleSave();
        } else {
            editMode.enter();
        }
    }, [editMode, handleSave]);

    const handleConfigReset = useCallback(() => {
        confirm.confirm({
            title: 'Resetear progreso',
            message: '¿Resetear el estado de todas las materias al valor por defecto?',
            confirmLabel: 'Resetear',
            confirmDanger: true,
            onConfirm: () => {
                resetStatuses();
                resetGrades();
                confirm.close();
                toast.show('✓ Progreso reseteado');
            },
        });
    }, [resetStatuses, resetGrades, confirm, toast]);

    const handleConfigDeletePlan = useCallback(() => {
        confirm.confirm({
            title: 'Eliminar plan',
            message: '¿Eliminar completamente el plan de estudios? Se borrarán todas las materias, cuatrimestres, estados y notas. Esta acción no se puede deshacer.',
            confirmLabel: 'Eliminar todo',
            confirmDanger: true,
            onConfirm: () => {
                confirm.close();
                setDeleteAnim(true);
                setTimeout(() => {
                    resetPlan();
                    resetStatuses();
                    resetGrades();
                    localStorage.removeItem('unitracker-plan');
                    editMode.forceExit();
                    toast.show('✓ Plan eliminado');
                    setTimeout(() => setDeleteAnim(false), 200);
                }, 600);
            },
        });
    }, [resetPlan, resetStatuses, resetGrades, editMode, confirm, toast]);
    const handleTemplateSelect = useCallback((planData) => {
        setShowTemplatesModal(false);
        confirm.confirm({
            title: 'Cargar plan de ejemplo',
            message: `¿Reemplazar tu plan actual con "${planData.plan}"? Perderás cualquier edición, nota o progreso actual.`,
            confirmLabel: 'Cargar plan',
            confirmDanger: true,
            onConfirm: () => {
                confirm.close();
                setDeleteAnim(true);
                setTimeout(() => {
                    updatePlan(structuredClone(planData));
                    resetStatuses();
                    resetGrades();
                    localStorage.setItem('unitracker-plan', JSON.stringify(planData));
                    editMode.forceExit();
                    toast.show('✓ Plan cargado exitosamente');
                    setTimeout(() => setDeleteAnim(false), 200);
                }, 600);
            },
        });
    }, [updatePlan, resetStatuses, resetGrades, editMode, confirm, toast]);

    // ─── Derived values ─────────────────────────────────────
    const activeCards = useMemo(() => {
        if (!highlightedCourse) return null;
        const active = new Set([highlightedCourse]);
        const course = allCourses.find(c => c.id === highlightedCourse);
        if (course) {
            course.dependencies.forEach(d => active.add(d));
        }
        for (const c of allCourses) {
            if (c.dependencies.includes(highlightedCourse)) {
                active.add(c.id);
            }
        }
        return active;
    }, [highlightedCourse, allCourses]);

    let semFlatIndex = 0;

    const gcClass = [
        'graph-container',
        editMode.active ? 'graph-container--editing' : '',
        editMode.transition === 'entering' ? 'graph-container--enter' : '',
        editMode.transition === 'exiting' ? 'graph-container--exit' : '',
        highlightedCourse ? 'graph-container--has-highlight' : '',
    ].filter(Boolean).join(' ');

    const appClass = [
        'app-root',
        editMode.active ? 'app-root--editing' : '',
        deleteAnim ? 'app-root--deleting' : '',
    ].filter(Boolean).join(' ');

    // ─── Render ─────────────────────────────────────────────
    return (
        <div className={appClass} >
            <ConfigMenu
                editMode={editMode.active}
                onEditPlan={handleConfigEditPlan}
                onReset={handleConfigReset}
                onDeletePlan={handleConfigDeletePlan}
                onPreferences={() => setShowPrefsModal(true)}
                onTemplates={() => setShowTemplatesModal(true)}
            />

            <EditFloatingBar
                editMode={editMode.active}
                editTransition={editMode.transition}
                onDiscard={handleDiscard}
                onSave={handleSave}
            />

            <Header
                studyPlan={studyPlan}
                stats={stats}
                editMode={editMode.active}
                editTransition={editMode.transition}
                showHours={prefs.showHours}
                showGrades={prefs.showGrades}
            />

            <main className="main">
                <div className={gcClass} ref={containerRef}>
                    <ArrowsOverlay
                        allCourses={allCourses}
                        getEffectiveStatus={getEffectiveStatus}
                        getSemesterIndex={getSemesterIndex}
                        highlightedCourse={highlightedCourse}
                        activeCards={activeCards}
                        containerRef={containerRef}
                        editMode={editMode.active}
                    />

                    {dragLink.dragging && !cardMove.activeDrag && (
                        <DragArrow dragging={dragLink.dragging} containerRef={containerRef} />
                    )}

                    <div id="graph">
                        {studyPlan.years.map((year) => (
                            <div key={`year-${year.year}`} className="year-block">
                                <div className="year-sidebar">
                                    <div className="year-label">{year.label || `Año ${year.year}`}</div>
                                </div>
                                <div className="year-content">
                                    {year.semesters.map((sem) => {
                                        const idx = semFlatIndex++;
                                        return (
                                            <SemesterRow
                                                key={`${year.year}-${sem.semester}`}
                                                semester={sem}
                                                semIndex={idx}
                                                editMode={editMode.active}
                                                editTransition={editMode.transition}
                                                getEffectiveStatus={getEffectiveStatus}
                                                cycleStatus={cycleStatus}
                                                onAddCourse={(si) => setPendingAddSemIndex(si)}
                                                onRemoveCourse={handleRemoveCourse}
                                                onRemoveSemester={handleRemoveSemester}
                                                onDragStart={dragLink.startDrag}
                                                onDragEnd={dragLink.endDrag}
                                                onStartMove={cardMove.startMove}
                                                activeDragMove={cardMove.activeDrag}
                                                onUpdateHours={updateCourseHours}
                                                grades={grades}
                                                onSetGrade={setGrade}
                                                showHours={prefs.showHours}
                                                showGrades={prefs.showGrades}
                                                activeCards={activeCards}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                        {/* The "Agregar cuatrimestre" button uses CSS animations. It is mounted during entry/edit/exit */}
                        {(editMode.active || editMode.transition === 'exiting') && (
                            <button className={`add-semester-btn ${editMode.transition ? `add-semester-btn--${editMode.transition}` : ''}`} onClick={addSemester}>
                                <span className="add-semester-btn__icon">+</span>
                                Agregar cuatrimestre
                            </button>
                        )}
                    </div>
                </div>
            </main>

            {/* Add course modal */}
            <InputModal
                open={pendingAddSemIndex !== null}
                title="Agregar materia"
                placeholder="Nombre de la materia"
                showHours
                onSubmit={(name, hours) => {
                    addCourse(pendingAddSemIndex, name, hours);
                    setPendingAddSemIndex(null);
                    toast.show('✓ Materia agregada');
                }}
                onCancel={() => setPendingAddSemIndex(null)}
            />

            {/* Confirmation modal */}
            <InputModal
                open={!!confirm.modal}
                title={confirm.modal?.title || ''}
                message={confirm.modal?.message}
                confirmLabel={confirm.modal?.confirmLabel}
                confirmDanger={confirm.modal?.confirmDanger}
                onSubmit={() => confirm.modal?.onConfirm?.()}
                onCancel={confirm.close}
            />

            {/* Preferences modal */}
            <PreferencesModal
                open={showPrefsModal}
                onClose={() => setShowPrefsModal(false)}
                prefs={prefs}
                onUpdatePref={updatePref}
                planName={studyPlan.plan || ''}
                degreeName={studyPlan.subtitle || ''}
                onUpdatePlanMeta={updatePlanMeta}
            />

            <TemplatesModal
                open={showTemplatesModal}
                onClose={() => setShowTemplatesModal(false)}
                onSelect={handleTemplateSelect}
            />

            {/* Delete animation overlay */}
            {deleteAnim && (
                <div className="delete-anim-overlay">
                    <div className="delete-anim-overlay__wipe" />
                    <div className="delete-anim-overlay__flash" />
                </div>
            )}

            <Toast key={toast.key} message={toast.message} />
            <FloatingCard drag={cardMove.activeDrag} />
        </div>
    );
}
