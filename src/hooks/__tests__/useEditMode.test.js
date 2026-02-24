import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@/test/helpers';
import useEditMode from '@/hooks/useEditMode';

describe('useEditMode', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('starts inactive with no transition', () => {
        const startEditing = vi.fn();
        const { result } = renderHook(() => useEditMode(startEditing));
        expect(result.current.active).toBe(false);
        expect(result.current.transition).toBe('');
    });

    it('enter() activates edit mode with an "entering" transition', () => {
        const startEditing = vi.fn();
        const { result } = renderHook(() => useEditMode(startEditing));

        act(() => result.current.enter());
        expect(result.current.active).toBe(true);
        expect(result.current.transition).toBe('entering');
        expect(startEditing).toHaveBeenCalledOnce();
    });

    it('clears the transition after the animation duration', () => {
        const startEditing = vi.fn();
        const { result } = renderHook(() => useEditMode(startEditing));

        act(() => result.current.enter());
        expect(result.current.transition).toBe('entering');

        act(() => vi.advanceTimersByTime(600));
        expect(result.current.transition).toBe('');
        expect(result.current.active).toBe(true);
    });

    it('exit() sets the exiting transition then deactivates after timeout', () => {
        const startEditing = vi.fn();
        const { result } = renderHook(() => useEditMode(startEditing));

        act(() => result.current.enter());
        act(() => vi.advanceTimersByTime(600));

        act(() => result.current.exit());
        expect(result.current.transition).toBe('exiting');
        expect(result.current.active).toBe(true);

        act(() => vi.advanceTimersByTime(600));
        expect(result.current.active).toBe(false);
        expect(result.current.transition).toBe('');
    });

    it('forceExit() immediately deactivates without transition', () => {
        const startEditing = vi.fn();
        const { result } = renderHook(() => useEditMode(startEditing));

        act(() => result.current.enter());
        act(() => result.current.forceExit());

        expect(result.current.active).toBe(false);
        expect(result.current.transition).toBe('');
    });
});
