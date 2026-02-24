import { useState, useCallback } from 'react';

const TRANSITION_DURATION = 600;

/**
 * Manages edit mode state and enter/exit transitions.
 */
export default function useEditMode(startEditing) {
    const [active, setActive] = useState(false);
    const [transition, setTransition] = useState(''); // 'entering' | 'exiting' | ''

    const enter = useCallback(() => {
        startEditing();
        setTransition('entering');
        setActive(true);
        setTimeout(() => setTransition(''), TRANSITION_DURATION);
    }, [startEditing]);

    const exit = useCallback(() => {
        setTransition('exiting');
        setTimeout(() => {
            setActive(false);
            setTransition('');
        }, TRANSITION_DURATION);
    }, []);

    const forceExit = useCallback(() => {
        setActive(false);
        setTransition('');
    }, []);

    return { active, transition, enter, exit, forceExit };
}
