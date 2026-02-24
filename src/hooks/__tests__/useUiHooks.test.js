import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@/test/helpers';
import useToast from '@/hooks/useToast';
import useConfirmModal from '@/hooks/useConfirmModal';

describe('useToast', () => {
    it('starts with empty message', () => {
        const { result } = renderHook(() => useToast());
        expect(result.current.message).toBe('');
    });

    it('show() sets the message and increments the key', () => {
        const { result } = renderHook(() => useToast());
        const initialKey = result.current.key;

        act(() => result.current.show('Saved!'));
        expect(result.current.message).toBe('Saved!');
        expect(result.current.key).toBe(initialKey + 1);
    });

    it('each show() increments key for re-render triggering', () => {
        const { result } = renderHook(() => useToast());
        act(() => result.current.show('A'));
        const k1 = result.current.key;
        act(() => result.current.show('B'));
        expect(result.current.key).toBe(k1 + 1);
    });
});

describe('useConfirmModal', () => {
    it('starts with null modal', () => {
        const { result } = renderHook(() => useConfirmModal());
        expect(result.current.modal).toBeNull();
    });

    it('confirm() sets the modal config', () => {
        const { result } = renderHook(() => useConfirmModal());
        const config = { title: 'Delete?', message: 'Sure?', onConfirm: vi.fn() };

        act(() => result.current.confirm(config));
        expect(result.current.modal).toBe(config);
    });

    it('close() clears the modal', () => {
        const { result } = renderHook(() => useConfirmModal());
        act(() => result.current.confirm({ title: 'Test' }));
        act(() => result.current.close());
        expect(result.current.modal).toBeNull();
    });
});
