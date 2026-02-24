import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';

function seedTestPlan() {
    const plan = {
        plan: 'Test Plan',
        subtitle: 'Integration',
        years: [{
            year: 1,
            label: 'Año 1',
            semesters: [
                {
                    semester: 1,
                    label: '1° Cuatrimestre',
                    courses: [
                        { id: 't1', name: 'Algebra', dependencies: [], weeklyHours: 4 },
                        { id: 't2', name: 'Analisis', dependencies: ['t1'], weeklyHours: 6 },
                    ],
                },
                {
                    semester: 2,
                    label: '2° Cuatrimestre',
                    courses: [
                        { id: 't3', name: 'Fisica', dependencies: ['t1'], weeklyHours: 5 },
                    ],
                },
            ],
        }],
    };
    localStorage.setItem('unitracker-plan', JSON.stringify(plan));
}

describe('App Integration', () => {
    beforeEach(() => {
        vi.useFakeTimers({ shouldAdvanceTime: true });
        seedTestPlan();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('renders the header with plan title and stats', () => {
        render(<App />);
        expect(screen.getByText('Test Plan')).toBeInTheDocument();
        expect(screen.getByText('Integration')).toBeInTheDocument();
    });

    it('renders all courses from the plan', () => {
        render(<App />);
        expect(screen.getByText('Algebra')).toBeInTheDocument();
        expect(screen.getByText('Analisis')).toBeInTheDocument();
        expect(screen.getByText('Fisica')).toBeInTheDocument();
    });

    it('shows correct initial statuses based on dependencies', () => {
        render(<App />);
        const pendiente = screen.getAllByText('Pendiente');
        expect(pendiente.length).toBeGreaterThanOrEqual(2);
        // 'Puedo cursar' appears in header stats + Algebra's card
        const cursar = screen.getAllByText('Puedo cursar');
        expect(cursar.length).toBeGreaterThanOrEqual(1);
    });

    it('clicking a course cycles its status', async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        render(<App />);

        await user.click(screen.getByText('Algebra'));

        await waitFor(() => {
            expect(screen.getByText('Regular')).toBeInTheDocument();
        });
    });

    it('meeting a dependency unlocks downstream courses', async () => {
        const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
        render(<App />);

        await user.click(screen.getByText('Algebra'));

        await waitFor(() => {
            const cursar = screen.getAllByText('Puedo cursar');
            expect(cursar.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe('config menu', () => {
        it('opens the config menu when the gear button is clicked', async () => {
            const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
            render(<App />);

            const trigger = document.querySelector('.config-menu__trigger');
            expect(trigger).toBeInTheDocument();
            await user.click(trigger);

            expect(screen.getByText('Editar plan')).toBeInTheDocument();
            expect(screen.getByText('Resetear progreso')).toBeInTheDocument();
            expect(screen.getByText('Eliminar plan')).toBeInTheDocument();
            expect(screen.getByText('Preferencias')).toBeInTheDocument();
        });
    });

    describe('edit mode lifecycle', () => {
        async function enterEditMode(user) {
            const trigger = document.querySelector('.config-menu__trigger');
            await user.click(trigger);
            await user.click(screen.getByText('Editar plan'));
            vi.advanceTimersByTime(700);
        }

        it('entering edit mode shows the floating edit bar', async () => {
            const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
            render(<App />);
            await enterEditMode(user);

            expect(screen.getByText('Modo edición')).toBeInTheDocument();
            expect(screen.getByText(/Guardar/)).toBeInTheDocument();
            expect(screen.getByText(/Descartar/)).toBeInTheDocument();
        });

        it('edit mode shows "Agregar materia" and "Agregar cuatrimestre" buttons', async () => {
            const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
            render(<App />);
            await enterEditMode(user);

            const addCourseButtons = screen.getAllByText('Agregar materia');
            expect(addCourseButtons.length).toBeGreaterThanOrEqual(1);
            expect(screen.getByText('Agregar cuatrimestre')).toBeInTheDocument();
        });

        it('adding a course via the modal works', async () => {
            const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
            render(<App />);
            await enterEditMode(user);

            const addButtons = screen.getAllByText('Agregar materia');
            await user.click(addButtons[0]);

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Nombre de la materia')).toBeInTheDocument();
            });

            await user.type(screen.getByPlaceholderText('Nombre de la materia'), 'Probabilidad');
            await user.click(screen.getByRole('button', { name: 'Agregar' }));

            await waitFor(() => {
                expect(screen.getByText('Probabilidad')).toBeInTheDocument();
            });
        });
    });

    describe('reset progress', () => {
        it('resets all statuses and grades after confirmation', async () => {
            const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
            render(<App />);

            await user.click(screen.getByText('Algebra'));
            await waitFor(() => expect(screen.getByText('Regular')).toBeInTheDocument());

            const trigger = document.querySelector('.config-menu__trigger');
            await user.click(trigger);
            await user.click(screen.getByText('Resetear progreso'));

            await waitFor(() => expect(screen.getByText('Resetear')).toBeInTheDocument());
            await user.click(screen.getByRole('button', { name: 'Resetear' }));

            await waitFor(() => {
                const cursar = screen.getAllByText('Puedo cursar');
                expect(cursar.length).toBeGreaterThanOrEqual(1);
                expect(screen.queryByText('Regular')).toBeNull();
            });
        });
    });
});
