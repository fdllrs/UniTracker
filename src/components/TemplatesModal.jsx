import { useEffect } from 'react';
import './PreferencesModal.css';

const planModules = import.meta.glob('../data/*.js', { eager: true });
const templates = [];

for (const path in planModules) {
    if (!path.includes('emptyPlan.js')) {
        const mod = planModules[path];
        const planData = mod.default || mod.DEFAULT_STUDY_PLAN;
        if (planData && planData.plan) {
            templates.push({
                path,
                planData,
                title: planData.plan,
                subtitle: planData.subtitle || ''
            });
        }
    }
}

export default function TemplatesModal({ open, onClose, onSelect }) {
    if (!open) return null;

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div className="prefs-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="prefs-modal">
                <button className="prefs-modal__close" onClick={onClose}>✕</button>
                <h2 className="prefs-modal__title">Planes de ejemplo</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
                    {templates.map(t => (
                        <button
                            key={t.path}
                            onClick={() => onSelect(t.planData)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                gap: '0.3rem',
                                padding: '1rem',
                                border: '1px solid rgba(100, 130, 180, 0.2)',
                                borderRadius: '8px',
                                background: 'rgba(255, 255, 255, 0.03)',
                                color: 'var(--text-primary)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                                e.currentTarget.style.borderColor = 'rgba(100, 160, 255, 0.4)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                e.currentTarget.style.borderColor = 'rgba(100, 130, 180, 0.2)';
                            }}
                        >
                            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{t.title}</span>
                            {t.subtitle && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.subtitle}</span>}
                        </button>
                    ))}
                    {templates.length === 0 && (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem' }}>
                            No hay planes de ejemplo disponibles.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
