import { useEffect } from 'react';
import '../PreferencesModal/PreferencesModal.css';
import './ViewRawPlanModal.css';

export default function ViewRawPlanModal({ open, onClose, plan }) {
    if (!open) return null;

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const jsonStr = JSON.stringify(plan, null, 2);

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonStr);
        // Could use toast if we pass it, but simple alert or just nothing is fine.
    };

    return (
        <div className="prefs-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="prefs-modal raw-modal">
                <button className="prefs-modal__close" onClick={onClose}>✕</button>
                <h2 className="prefs-modal__title">Ver Plan Raw (JSON)</h2>

                <p className="raw-modal__text">
                    A continuación se muestra el JSON que representa tu plan de estudios actual.
                </p>

                <textarea
                    readOnly
                    className="prefs-modal__input raw-modal__textarea"
                    value={jsonStr}
                />

                <div className="prefs-modal__actions">
                    <button
                        className="prefs-modal__btn prefs-modal__btn--secondary"
                        onClick={onClose}
                    >
                        Cerrar
                    </button>
                    <button
                        className="prefs-modal__btn prefs-modal__btn--primary"
                        onClick={handleCopy}
                    >
                        Copiar al Portapapeles
                    </button>
                </div>
            </div>
        </div>
    );
}
