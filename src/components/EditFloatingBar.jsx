import './ConfigMenu.css';

/**
 * Floating edit toolbar that appears at the top of the screen during edit mode.
 */
export default function EditFloatingBar({ editMode, editTransition, onDiscard, onSave }) {
    if (!editMode && editTransition !== 'exiting') return null;

    return (
        <div className={`edit-floating-bar${editTransition === 'exiting' ? ' edit-floating-bar--exit' : ''}`}>
            <div className="edit-floating-bar__label">
                <svg viewBox="0 0 24 24">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 000-1.41l-2.34-2.34a1 1 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                </svg>
                Modo edición
            </div>
            <button className="edit-floating-bar__btn edit-floating-bar__btn--discard" onClick={onDiscard}>
                ✕ Descartar
            </button>
            <button className="edit-floating-bar__btn edit-floating-bar__btn--save" onClick={onSave}>
                ✓ Guardar
            </button>
        </div>
    );
}
