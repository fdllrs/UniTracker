import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import EditFloatingBar from '@/components/EditFloatingBar';
import FloatingCard from '@/components/FloatingCard';

describe('EditFloatingBar', () => {
    it('returns null when not in edit mode and not exiting', () => {
        const { container } = render(
            <EditFloatingBar editMode={false} editTransition="" onDiscard={vi.fn()} onSave={vi.fn()} />
        );
        expect(container.innerHTML).toBe('');
    });

    it('renders in edit mode with save and discard buttons', () => {
        render(
            <EditFloatingBar editMode={true} editTransition="" onDiscard={vi.fn()} onSave={vi.fn()} />
        );
        expect(screen.getByText('Modo edición')).toBeInTheDocument();
        expect(screen.getByText(/Guardar/)).toBeInTheDocument();
        expect(screen.getByText(/Descartar/)).toBeInTheDocument();
    });

    it('renders during exit transition with exit class', () => {
        const { container } = render(
            <EditFloatingBar editMode={false} editTransition="exiting" onDiscard={vi.fn()} onSave={vi.fn()} />
        );
        expect(container.querySelector('.edit-floating-bar--exit')).toBeInTheDocument();
    });
});

describe('FloatingCard', () => {
    it('returns null when drag is null', () => {
        const { container } = render(<FloatingCard drag={null} />);
        expect(container.innerHTML).toBe('');
    });

    it('renders course name at the correct position', () => {
        const drag = { courseId: 'c1', courseName: 'Algebra', mouseX: 100, mouseY: 200, offsetX: 10, offsetY: 10, width: 155 };
        render(<FloatingCard drag={drag} />);
        expect(screen.getByText('Algebra')).toBeInTheDocument();
    });
});
