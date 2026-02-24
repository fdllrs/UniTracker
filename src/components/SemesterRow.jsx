import CourseCard from './CourseCard';
import './SemesterRow.css';

export default function SemesterRow({
    semester,
    semIndex,
    editMode,
    editTransition,
    getEffectiveStatus,
    cycleStatus,
    onAddCourse,
    onRemoveCourse,
    onRemoveSemester,
    onDragStart,
    onDragEnd,
    onStartMove,
    activeDragMove,
    onUpdateHours,
    grades,
    onSetGrade,
    showHours,
    showGrades,
    activeCards,
}) {

    return (
        <div
            className="semester-row"
            id={`semester-${semIndex}`}
            data-semester-index={semIndex}
        >
            <div className="semester-label">
                {editMode && (
                    <button
                        className="semester-remove-btn"
                        onClick={() => onRemoveSemester(semIndex)}
                        title="Eliminar cuatrimestre"
                    >
                        ✕
                    </button>
                )}
                {semester.label}
            </div>
            <div className="semester-courses">
                {semester.courses.map((course) => (
                    <CourseCard
                        key={course.id}
                        course={course}
                        status={getEffectiveStatus(course.id)}
                        editMode={editMode}
                        isActive={activeCards ? activeCards.has(course.id) : true}
                        onClick={() => cycleStatus(course.id)}
                        onRemove={onRemoveCourse}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        onStartMove={onStartMove}
                        isBeingMoved={activeDragMove?.courseId === course.id}
                        onUpdateHours={onUpdateHours}
                        grade={grades?.[course.id]}
                        onSetGrade={onSetGrade}
                        showHours={showHours}
                        showGrades={showGrades}
                    />
                ))}
                {/* "Agregar materia" uses CSS animations for smooth transition */}
                {(editMode || editTransition === 'exiting') && (
                    <div
                        className={`course-card course-card--add ${editTransition ? `course-card--add-${editTransition}` : ''}`}
                        onClick={() => onAddCourse(semIndex)}
                    >
                        <div className="course-card--add__icon">+</div>
                        <div className="course-card--add__text">Agregar materia</div>
                    </div>
                )}
            </div>
        </div>
    );
}
