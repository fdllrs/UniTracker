import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InputModal from '@/components/InputModal';

describe('InputModal', () => {
    describe('when closed', () => {
        it('renders nothing when open is false', () => {
            const { container } = render(
                <InputModal open={false} title="Test" onSubmit={vi.fn()} onCancel={vi.fn()} />
            );
            expect(container.innerHTML).toBe('');
        });
    });

    describe('input mode (no message prop)', () => {
        it('renders title and input field', () => {
            render(
                <InputModal open={true} title="Agregar materia" placeholder="Nombre" onSubmit={vi.fn()} onCancel={vi.fn()} />
            );
            expect(screen.getByText('Agregar materia')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument();
        });

        it('disables submit button when input is empty', () => {
            render(
                <InputModal open={true} title="Add" onSubmit={vi.fn()} onCancel={vi.fn()} />
            );
            const submitBtn = screen.getByRole('button', { name: 'Agregar' });
            expect(submitBtn).toBeDisabled();
        });

        it('calls onSubmit with trimmed value on form submit', async () => {
            const onSubmit = vi.fn();
            const user = userEvent.setup();
            render(
                <InputModal open={true} title="Add" placeholder="Name" onSubmit={onSubmit} onCancel={vi.fn()} />
            );

            await user.type(screen.getByPlaceholderText('Name'), '  Algebra  ');
            await user.click(screen.getByRole('button', { name: 'Agregar' }));
            expect(onSubmit).toHaveBeenCalledWith('Algebra');
        });

        it('calls onCancel when cancel button is clicked', async () => {
            const onCancel = vi.fn();
            const user = userEvent.setup();
            render(
                <InputModal open={true} title="Add" onSubmit={vi.fn()} onCancel={onCancel} />
            );

            await user.click(screen.getByRole('button', { name: 'Cancelar' }));
            expect(onCancel).toHaveBeenCalledOnce();
        });

        it('calls onCancel on Escape keypress', () => {
            const onCancel = vi.fn();
            render(
                <InputModal open={true} title="Add" onSubmit={vi.fn()} onCancel={onCancel} />
            );

            fireEvent.keyDown(screen.getByText('Add').closest('.input-modal'), { key: 'Escape' });
            expect(onCancel).toHaveBeenCalledOnce();
        });
    });

    describe('course mode (showHours)', () => {
        it('renders hours input alongside name input', () => {
            render(
                <InputModal open={true} title="Add" placeholder="Name" showHours onSubmit={vi.fn()} onCancel={vi.fn()} />
            );
            expect(screen.getByText('Horas semanales')).toBeInTheDocument();
        });

        it('submits name and parsed hours', async () => {
            const onSubmit = vi.fn();
            const user = userEvent.setup();
            render(
                <InputModal open={true} title="Add" placeholder="Name" showHours onSubmit={onSubmit} onCancel={vi.fn()} />
            );

            await user.type(screen.getByPlaceholderText('Name'), 'Fisica');
            await user.type(screen.getByPlaceholderText('0'), '6');
            await user.click(screen.getByRole('button', { name: 'Agregar' }));
            expect(onSubmit).toHaveBeenCalledWith('Fisica', 6);
        });
    });

    describe('confirm mode (message prop)', () => {
        it('shows message text instead of input', () => {
            render(
                <InputModal
                    open={true}
                    title="Delete?"
                    message="Are you sure?"
                    confirmLabel="Delete"
                    confirmDanger
                    onSubmit={vi.fn()}
                    onCancel={vi.fn()}
                />
            );
            expect(screen.getByText('Are you sure?')).toBeInTheDocument();
            expect(screen.queryByRole('textbox')).toBeNull();
            expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
        });

        it('submit button is not disabled in confirm mode', () => {
            render(
                <InputModal
                    open={true}
                    title="Confirm"
                    message="Sure?"
                    confirmLabel="Yes"
                    onSubmit={vi.fn()}
                    onCancel={vi.fn()}
                />
            );
            expect(screen.getByRole('button', { name: 'Yes' })).not.toBeDisabled();
        });

        it('calls onSubmit when confirm is clicked', async () => {
            const onSubmit = vi.fn();
            const user = userEvent.setup();
            render(
                <InputModal
                    open={true}
                    title="Confirm"
                    message="Sure?"
                    confirmLabel="Yes"
                    onSubmit={onSubmit}
                    onCancel={vi.fn()}
                />
            );
            await user.click(screen.getByRole('button', { name: 'Yes' }));
            expect(onSubmit).toHaveBeenCalledOnce();
        });
    });
});
