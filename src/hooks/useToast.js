import { useState, useCallback } from 'react';

/**
 * Manages toast notification state.
 */
export default function useToast() {
    const [message, setMessage] = useState('');
    const [key, setKey] = useState(0);

    const show = useCallback((msg) => {
        setMessage(msg);
        setKey((k) => k + 1);
    }, []);

    return { message, key, show };
}
