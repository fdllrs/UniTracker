import { useState, useEffect } from 'react';
import './PreferencesModal.css';

export default function PreferencesModal({
    open,
    onClose,
    prefs,
    onUpdatePref,
    planName,
    degreeName,
    onUpdatePlanMeta,
}) {
    const [localPlanName, setLocalPlanName] = useState(planName);
    const [localDegree, setLocalDegree] = useState(degreeName);

    // Sync local state when modal opens
    useEffect(() => {
        if (open) {
            setLocalPlanName(planName);
            setLocalDegree(degreeName);
        }
    }, [open, planName, degreeName]);

    const handlePlanNameBlur = () => {
        const trimmed = localPlanName.trim();
        if (trimmed && trimmed !== planName) {
            onUpdatePlanMeta({ plan: trimmed });
        }
    };

    const handleDegreeBlur = () => {
        const trimmed = localDegree.trim();
        if (trimmed !== degreeName) {
            onUpdatePlanMeta({ subtitle: trimmed });
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Enter') e.target.blur();
    };

    if (!open) return null;

    return (
        <div className="prefs-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="prefs-modal" onKeyDown={handleKeyDown}>
                <button className="prefs-modal__close" onClick={onClose}>✕</button>
                <h2 className="prefs-modal__title">Preferencias</h2>

                {/* ─── Plan info ─── */}
                <section className="prefs-modal__section">
                    <h3 className="prefs-modal__section-title">Información del plan</h3>

                    <label className="prefs-modal__field">
                        <span className="prefs-modal__label">Nombre del plan</span>
                        <input
                            type="text"
                            className="prefs-modal__input"
                            value={localPlanName}
                            onChange={(e) => setLocalPlanName(e.target.value)}
                            onBlur={handlePlanNameBlur}
                            placeholder="Plan de Estudios"
                        />
                    </label>

                    <label className="prefs-modal__field">
                        <span className="prefs-modal__label">Carrera</span>
                        <input
                            type="text"
                            className="prefs-modal__input"
                            value={localDegree}
                            onChange={(e) => setLocalDegree(e.target.value)}
                            onBlur={handleDegreeBlur}
                            placeholder="Licenciatura en Computación"
                        />
                    </label>
                </section>

                {/* ─── Display toggles ─── */}
                <section className="prefs-modal__section">
                    <h3 className="prefs-modal__section-title">Visualización</h3>

                    <label className="prefs-modal__toggle">
                        <span className="prefs-modal__toggle-text">Mostrar horas semanales</span>
                        <div className="prefs-modal__switch-wrapper">
                            <input
                                type="checkbox"
                                className="prefs-modal__switch-input"
                                checked={prefs.showHours}
                                onChange={(e) => onUpdatePref('showHours', e.target.checked)}
                            />
                            <div className="prefs-modal__switch" />
                        </div>
                    </label>

                    <label className="prefs-modal__toggle">
                        <span className="prefs-modal__toggle-text">Mostrar promedio y notas</span>
                        <div className="prefs-modal__switch-wrapper">
                            <input
                                type="checkbox"
                                className="prefs-modal__switch-input"
                                checked={prefs.showGrades}
                                onChange={(e) => onUpdatePref('showGrades', e.target.checked)}
                            />
                            <div className="prefs-modal__switch" />
                        </div>
                    </label>
                </section>
            </div>
        </div>
    );
}
