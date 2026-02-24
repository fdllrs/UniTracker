import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CourseCard from '@/components/CourseCard';

function renderCard(overrides = {}) {
    const defaults = {
        course: { id: 'c1', name: 'Algebra Lineal', dependencies: [], weeklyHours: 6 },
        status: 'cursar',
        editMode: false,
        grade: null,
        onClick: vi.fn(),
        onRemove: vi.fn(),
        onMouseEnter: vi.fn(),
        onMouseLeave: vi.fn(),
        onDragStart: vi.fn(),
        onDragEnd: vi.fn(),
        onStartMove: vi.fn(),
        isBeingMoved: false,
        onUpdateHours: vi.fn(),
        onSetGrade: vi.fn(),
    };
    return render(<CourseCard {...defaults} {...overrides} />);
}

describe('CourseCard', () => {
    it('renders the course name and status label', () => {
        renderCard();
        expect(screen.getByText('Algebra Lineal')).toBeInTheDocument();
        expect(screen.getByText('Puedo cursar')).toBeInTheDocument();
    });

    it('shows hours in normal mode when hours > 0', () => {
        const { container } = renderCard();
        expect(container.querySelector('.course-card__hours')).toBeInTheDocument();
        expect(screen.getByText('6 hs/sem')).toBeInTheDocument();
    });

    it('does not show normal-mode hours when hours is 0', () => {
        const { container } = renderCard({ course: { id: 'c1', name: 'Test', dependencies: [], weeklyHours: 0 } });
        // The .course-card__hours element (normal mode) should not render
        expect(container.querySelector('.course-card__hours')).toBeNull();
    });

    it('calls onClick when clicked in normal mode', async () => {
        const onClick = vi.fn();
        const user = userEvent.setup();
        renderCard({ onClick });
        await user.click(screen.getByText('Algebra Lineal'));
        expect(onClick).toHaveBeenCalledOnce();
    });

    it('does not call onClick when clicked in edit mode', async () => {
        const onClick = vi.fn();
        const user = userEvent.setup();
        renderCard({ onClick, editMode: true });
        await user.click(screen.getByText('Algebra Lineal'));
        expect(onClick).not.toHaveBeenCalled();
    });

    it('applies the correct status class', () => {
        const { container } = renderCard({ status: 'aprobada' });
        expect(container.querySelector('.course-card--aprobada')).toBeInTheDocument();
    });

    it('shows the editing class when in edit mode', () => {
        const { container } = renderCard({ editMode: true });
        expect(container.querySelector('.course-card--editing')).toBeInTheDocument();
    });

    it('shows the dragging class when isBeingMoved is true', () => {
        const { container } = renderCard({ isBeingMoved: true });
        expect(container.querySelector('.course-card--dragging')).toBeInTheDocument();
    });

    describe('grade display', () => {
        it('shows grade when status is aprobada and grade exists', () => {
            renderCard({ status: 'aprobada', grade: 8 });
            expect(screen.getByText('Nota: 8')).toBeInTheDocument();
        });

        it('shows "+ Nota" button when status is regular and no grade', () => {
            renderCard({ status: 'regular', grade: null });
            expect(screen.getByText('+ Nota')).toBeInTheDocument();
        });

        it('does not show grade area for pendiente status', () => {
            renderCard({ status: 'pendiente', grade: 8 });
            expect(screen.queryByText('Nota: 8')).toBeNull();
        });
    });
});
