import { describe, expect, it, vi, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
    it('confirma e cancela pelas ações do rodapé', async () => {
        const onConfirm: Mock = vi.fn();
        const onCancel: Mock = vi.fn();
        const user: UserEvent = userEvent.setup();
        render(
            <ConfirmDialog
                title="Excluir ativo"
                description="Essa ação não pode ser desfeita."
                confirmLabel="Excluir"
                destructive
                onConfirm={onConfirm}
                onCancel={onCancel}
            />
        );

        await user.click(screen.getByRole('button', { name: 'Excluir' }));
        expect(onConfirm).toHaveBeenCalledTimes(1);

        await user.click(screen.getByRole('button', { name: 'Cancelar' }));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('trava o botão de confirmar e avisa que está processando', () => {
        render(
            <ConfirmDialog
                title="Excluir ativo"
                description="Aguarde"
                confirmLabel="Excluir"
                pending
                onConfirm={vi.fn()}
                onCancel={vi.fn()}
            />
        );

        expect(screen.getByRole('button', { name: 'Aguarde…' })).toBeDisabled();
    });

    it('usa o rótulo próprio de cancelar quando informado', async () => {
        const onCancel: Mock = vi.fn();
        render(
            <ConfirmDialog
                title="Pular"
                description="Descrição"
                confirmLabel="Pular"
                cancelLabel="Continuar configurando"
                onConfirm={vi.fn()}
                onCancel={onCancel}
            />
        );

        expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
        await userEvent.click(screen.getByRole('button', { name: 'Continuar configurando' }));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });
});
