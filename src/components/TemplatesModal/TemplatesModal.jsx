import { useEffect, useState } from 'react';
import '../PreferencesModal/PreferencesModal.css';
import './TemplatesModal.css';

const planModules = import.meta.glob('../../data/*.json', { eager: true });
const templates = [];

for (const path in planModules) {
    if (!path.includes('emptyPlan.json')) {
        const mod = planModules[path];
        const planData = mod.default || mod;
        if (planData && planData.plan) {
            templates.push({
                path,
                planData,
                title: planData.plan || '',
                subtitle: planData.subtitle || ''
            });
        }
    }
}

export default function TemplatesModal({ open, onClose, onSelect, currentPlan, currentStatuses, currentGrades, confirm }) {
    const [tab, setTab] = useState('custom');
    const [customPlans, setCustomPlans] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveTitle, setSaveTitle] = useState('');
    const [saveSubtitle, setSaveSubtitle] = useState('');

    useEffect(() => {
        if (!open) {
            setIsSaving(false);
            return;
        }
        try {
            const stored = JSON.parse(localStorage.getItem('unitracker-custom-plans') || '[]');
            setCustomPlans(Array.isArray(stored) ? stored : []);
        } catch {
            setCustomPlans([]);
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    const handlePrepareSave = () => {
        setSaveTitle(currentPlan?.plan || 'Mi Carrera');
        setSaveSubtitle(currentPlan?.subtitle || '');
        setIsSaving(true);
    };

    const handleConfirmSave = () => {
        if (!saveTitle.trim()) return;
        const toSave = structuredClone(currentPlan);
        toSave.plan = saveTitle.trim();
        toSave.subtitle = saveSubtitle.trim();

        // Save current progress
        toSave.userData = {
            statuses: currentStatuses || {},
            grades: currentGrades || {}
        };

        // Check if plan with same name already exists to either replace or add
        const newCustom = customPlans.filter(p => p.plan !== toSave.plan);
        newCustom.push(toSave);
        setCustomPlans(newCustom);
        localStorage.setItem('unitracker-custom-plans', JSON.stringify(newCustom));
        setIsSaving(false);
    };

    const handleDeleteCustom = (e, planName) => {
        e.stopPropagation();
        if (confirm) {
            confirm.confirm({
                title: 'Eliminar plan guardado',
                message: `¿Estás seguro que deseas eliminar el plan "${planName}" de tu librería?`,
                confirmLabel: 'Eliminar',
                confirmDanger: true,
                onConfirm: () => {
                    const newCustom = customPlans.filter(p => p.plan !== planName);
                    setCustomPlans(newCustom);
                    localStorage.setItem('unitracker-custom-plans', JSON.stringify(newCustom));
                    confirm.close();
                }
            });
        } else {
            // Fallback if confirm is not available
            const newCustom = customPlans.filter(p => p.plan !== planName);
            setCustomPlans(newCustom);
            localStorage.setItem('unitracker-custom-plans', JSON.stringify(newCustom));
        }
    };

    if (!open) return null;

    return (
        <div className="prefs-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="prefs-modal templates-modal">
                <button className="prefs-modal__close" onClick={onClose}>✕</button>
                <h2 className="prefs-modal__title">Librería de Planes</h2>

                <div className="templates-modal__tabs">
                    <button
                        onClick={() => { setTab('custom'); setIsSaving(false); }}
                        className={`templates-modal__tab-btn ${tab === 'custom' ? 'templates-modal__tab-btn--active' : ''}`}
                    >
                        Mis Planes guardados
                    </button>
                    <button
                        onClick={() => { setTab('examples'); setIsSaving(false); }}
                        className={`templates-modal__tab-btn ${tab === 'examples' ? 'templates-modal__tab-btn--active' : ''}`}
                    >
                        Planes de ejemplo
                    </button>
                </div>

                {tab === 'custom' && (
                    <div className="templates-modal__tab-content">
                        <div className="templates-modal__list">
                            {customPlans.map((p, i) => (
                                <div key={i} className="templates-modal__list-row">
                                    <button
                                        onClick={() => onSelect(p)}
                                        className="prefs-modal__list-item"
                                    >
                                        <span className="prefs-modal__list-item-title">{p.plan}</span>
                                        {p.subtitle && <span className="prefs-modal__list-item-subtitle">{p.subtitle}</span>}
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteCustom(e, p.plan)}
                                        className="prefs-modal__btn--danger-icon"
                                        title="Eliminar de guardados"
                                    >
                                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" /></svg>
                                    </button>
                                </div>
                            ))}
                            {customPlans.length === 0 && (
                                <div className="templates-modal__empty">
                                    No tenés planes guardados. Importá un plan o guardá el actual.
                                </div>
                            )}
                        </div>

                        {!isSaving ? (
                            <button
                                className="prefs-modal__btn prefs-modal__btn--ghost templates-modal__add-btn"
                                onClick={handlePrepareSave}
                            >
                                + Guardar plan actual en librería
                            </button>
                        ) : (
                            <div className="templates-modal__save-form">
                                <h3 className="templates-modal__save-title">Confirmar detalles del plan</h3>

                                <label className="prefs-modal__field templates-modal__field">
                                    <span className="prefs-modal__label">Carrera</span>
                                    <input
                                        type="text"
                                        className="prefs-modal__input"
                                        value={saveTitle}
                                        onChange={(e) => setSaveTitle(e.target.value)}
                                        autoFocus
                                    />
                                </label>
                                <label className="prefs-modal__field templates-modal__field--last">
                                    <span className="prefs-modal__label">Plan de estudios (Opcional)</span>
                                    <input
                                        type="text"
                                        className="prefs-modal__input"
                                        value={saveSubtitle}
                                        onChange={(e) => setSaveSubtitle(e.target.value)}
                                    />
                                </label>

                                <div className="templates-modal__save-actions">
                                    <button
                                        className="prefs-modal__btn prefs-modal__btn--secondary"
                                        onClick={() => setIsSaving(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        className="prefs-modal__btn prefs-modal__btn--primary"
                                        onClick={handleConfirmSave}
                                        disabled={!saveTitle.trim()}
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {tab === 'examples' && (
                    <div className="templates-modal__tab-content">
                        <div className="templates-modal__list">
                            {templates.map(t => (
                                <button
                                    key={t.path}
                                    onClick={() => onSelect(t.planData)}
                                    className="prefs-modal__list-item"
                                >
                                    <span className="prefs-modal__list-item-title">{t.title}</span>
                                    {t.subtitle && <span className="prefs-modal__list-item-subtitle">{t.subtitle}</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
