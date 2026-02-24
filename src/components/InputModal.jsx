import { useState, useEffect, useRef } from 'react';
import './InputModal.css';

/**
 * Multi-purpose modal:
 * - Input mode (default):   shows an input + Agregar/Cancelar
 * - Confirm mode (confirm prop): shows a message + confirm/cancel buttons
 * - Course mode (showHours):     shows name + hours inputs
 */
export default function InputModal({
    open,
    title,
    placeholder,
    message,          // if set → confirm mode (no input)
    confirmLabel,     // label for confirm button (default: "Agregar" / "Confirmar")
    confirmDanger,    // if true → red confirm button
    showHours,        // if true → show hours input alongside name
    onSubmit,
    onCancel,
}) {
    const [value, setValue] = useState('');
    const [hours, setHours] = useState('');
    const inputRef = useRef(null);
    const isConfirmMode = !!message;

    useEffect(() => {
        if (open) {
            setValue('');
            setHours('');
            if (!isConfirmMode) {
                setTimeout(() => inputRef.current?.focus(), 50);
            }
        }
    }, [open, isConfirmMode]);

    const handleSubmit = (e) => {
        e?.preventDefault();
        if (isConfirmMode) {
            onSubmit();
        } else {
            const trimmed = value.trim();
            if (trimmed) {
                if (showHours) {
                    onSubmit(trimmed, parseInt(hours) || 0);
                } else {
                    onSubmit(trimmed);
                }
                setValue('');
                setHours('');
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') onCancel();
    };

    if (!open) return null;

    const btnLabel = confirmLabel || (isConfirmMode ? 'Confirmar' : 'Agregar');

    return (
        <>
            <div className="input-modal-overlay" onClick={onCancel} />
            <div className="input-modal" onKeyDown={handleKeyDown}>
                <h3 className="input-modal__title">{title}</h3>
                <form onSubmit={handleSubmit}>
                    {isConfirmMode ? (
                        <p className="input-modal__message">{message}</p>
                    ) : (
                        <>
                            <input
                                ref={inputRef}
                                className="input-modal__input"
                                type="text"
                                placeholder={placeholder || ''}
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                autoFocus
                            />
                            {showHours && (
                                <div className="input-modal__hours-row">
                                    <label className="input-modal__hours-label">Horas semanales</label>
                                    <input
                                        className="input-modal__hours-input"
                                        type="number"
                                        min="0"
                                        max="40"
                                        placeholder="0"
                                        value={hours}
                                        onChange={(e) => setHours(e.target.value)}
                                    />
                                </div>
                            )}
                        </>
                    )}
                    <div className="input-modal__actions">
                        <button type="button" className="input-modal__btn input-modal__btn--cancel" onClick={onCancel}>
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={`input-modal__btn ${confirmDanger ? 'input-modal__btn--danger' : 'input-modal__btn--confirm'}`}
                            disabled={!isConfirmMode && !value.trim()}
                        >
                            {btnLabel}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}
