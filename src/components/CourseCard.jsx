import { useState, useRef } from 'react';
import { STATUS_LABELS } from '../hooks/useStudyPlan';
import './CourseCard.css';

export default function CourseCard({
    course,
    status,
    editMode,
    grade,
    onClick,
    onRemove,
    onDragStart,
    onDragEnd,
    onDragOver,
    onStartMove,
    isBeingMoved,
    onUpdateHours,
    onSetGrade,
    showHours = true,
    showGrades = true,
    isActive = true,
}) {
    // Local state for grade input — buffers the value so "10" can be typed fully
    const [localGrade, setLocalGrade] = useState('');
    const [isEditingGrade, setIsEditingGrade] = useState(false);
    const gradeInputRef = useRef(null);

    const handlePointerDown = (e) => {
        e.stopPropagation();
        if (onStartMove) {
            onStartMove(course.id, e);
        }
    };

    const handleHoursChange = (e) => {
        e.stopPropagation();
        const val = parseInt(e.target.value) || 0;
        if (onUpdateHours) {
            onUpdateHours(course.id, Math.max(0, val));
        }
    };

    const handleGradeChange = (e) => {
        e.stopPropagation();
        const val = e.target.value;
        if (onSetGrade) {
            onSetGrade(course.id, val === '' ? null : parseInt(val) || 0);
        }
    };

    const commitLocalGrade = () => {
        const val = localGrade.trim();
        if (val !== '' && onSetGrade) {
            const num = parseInt(val);
            if (!isNaN(num) && num >= 1 && num <= 10) {
                onSetGrade(course.id, num);
            }
        }
        setIsEditingGrade(false);
        setLocalGrade('');
    };

    const startEditingGrade = () => {
        setIsEditingGrade(true);
        setLocalGrade(hasGrade ? String(grade) : '');
        setTimeout(() => gradeInputRef.current?.focus(), 30);
    };

    const hours = course.weeklyHours || 0;
    const hasGrade = grade !== undefined && grade !== null && grade !== '';
    const showGrade = status === 'aprobada' || status === 'regular';

    return (
        <div
            className={`course-card course-card--${status}${editMode ? ' course-card--editing' : ''}${isBeingMoved ? ' course-card--dragging' : ''}${!isActive ? ' course-card--dimmed' : ''}`}
            id={`card-${course.id}`}
            data-course-id={course.id}
            onClick={!editMode ? onClick : undefined}
            onMouseDown={editMode ? (e) => onDragStart(course.id, e) : undefined}
            onMouseUp={editMode ? () => onDragEnd(course.id) : undefined}
        >
            {/* Always rendered — visibility controlled by CSS via .course-card--editing */}
            <div
                className="course-card__drag-handle"
                onPointerDown={editMode ? handlePointerDown : undefined}
                onMouseDown={(e) => e.stopPropagation()}
                title="Arrastrar para reordenar materia"
            >
                <svg viewBox="0 0 24 24"><path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" /></svg>
            </div>
            <button
                className="course-card__remove"
                onClick={(e) => {
                    e.stopPropagation();
                    if (editMode) onRemove(course.id);
                }}
                title="Eliminar materia"
            >
                ✕
            </button>

            <div className="course-card__name">{course.name}</div>
            <div className="course-card__status">{STATUS_LABELS[status]}</div>

            {/* Hours — normal mode display */}
            {showHours && !editMode && hours > 0 && <div className="course-card__hours">{hours} hs/sem</div>}

            {/* Hours — edit mode (always rendered, CSS controls visibility) */}
            {showHours && (
                <div className="course-card__hours-edit" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                    <input
                        type="number"
                        className="course-card__hours-input"
                        value={hours}
                        onChange={handleHoursChange}
                        min="0"
                        max="40"
                        tabIndex={editMode ? 0 : -1}
                    />
                    <span className="course-card__hours-label">hs/sem</span>
                </div>
            )}

            {/* Grade — normal mode */}
            {showGrades && showGrade && !editMode && (
                <div className="course-card__grade-area" onClick={(e) => e.stopPropagation()}>
                    {isEditingGrade ? (
                        <input
                            ref={gradeInputRef}
                            type="number"
                            className="course-card__grade-inline course-card__grade-inline--active"
                            value={localGrade}
                            min="1"
                            max="10"
                            placeholder="1-10"
                            onChange={(e) => setLocalGrade(e.target.value)}
                            onBlur={commitLocalGrade}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    commitLocalGrade();
                                }
                                if (e.key === 'Escape') {
                                    setIsEditingGrade(false);
                                    setLocalGrade('');
                                }
                            }}
                        />
                    ) : hasGrade ? (
                        <div className="course-card__grade" onClick={startEditingGrade} title="Clic para editar nota">
                            Nota: {grade}
                        </div>
                    ) : (
                        <button className="course-card__grade-btn" onClick={startEditingGrade}>
                            + Nota
                        </button>
                    )}
                </div>
            )}

            {/* Grade — edit mode (always rendered, CSS controls visibility) */}
            {showGrades && (
                <div className="course-card__grade-edit" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                    <input
                        type="number"
                        className="course-card__hours-input"
                        value={hasGrade ? grade : ''}
                        onChange={handleGradeChange}
                        min="1"
                        max="10"
                        placeholder="—"
                        tabIndex={editMode ? 0 : -1}
                    />
                    <span className="course-card__hours-label">nota</span>
                </div>
            )}
        </div>
    );
}
