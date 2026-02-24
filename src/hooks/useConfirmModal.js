import { useState, useCallback } from 'react';

/**
 * Manages confirmation modal state with a clean declarative API.
 *
 * Usage:
 *   const { modal, confirm, close } = useConfirmModal();
 *   confirm({ title, message, confirmLabel, confirmDanger, onConfirm });
 */
export default function useConfirmModal() {
    const [modal, setModal] = useState(null);

    const confirm = useCallback((config) => {
        setModal(config);
    }, []);

    const close = useCallback(() => {
        setModal(null);
    }, []);

    return { modal, confirm, close };
}
