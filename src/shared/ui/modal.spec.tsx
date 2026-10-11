import { describe, expect, it, vi, type Mock } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { Modal } from './modal';

describe('Modal', () => {
    it('anuncia o diálogo pelo título e mostra a descrição', () => {
        render(
            <Modal title="Excluir ativo" description="Essa ação não pode ser desfeita." onClose={vi.fn()} footer={null}>
                conteúdo
            </Modal>
        );

        expect(screen.getByRole('dialog', { name: 'Excluir ativo' })).toBeInTheDocument();
        expect(screen.getByText('Essa ação não pode ser desfeita.')).toBeInTheDocument();
    });

    it('fecha ao clicar no fundo, no X ou no Escape', () => {
        const onClose: Mock = vi.fn();
        render(
            <Modal title="Excluir ativo" onClose={onClose} footer={null}>
                conteúdo
            </Modal>
        );

        fireEvent.keyDown(window, { key: 'Escape' });
        expect(onClose).toHaveBeenCalledTimes(1);

        const [closeButton]: (HTMLElement | undefined)[] = screen.getAllByRole('button', { name: 'Fechar' });
        if (closeButton === undefined) {
            throw new Error('close button not found');
        }
        fireEvent.click(closeButton);
        expect(onClose).toHaveBeenCalledTimes(2);
    });

    it('ignora outras teclas', () => {
        const onClose: Mock = vi.fn();
        render(
            <Modal title="Excluir ativo" onClose={onClose} footer={null}>
                conteúdo
            </Modal>
        );

        fireEvent.keyDown(window, { key: 'Enter' });

        expect(onClose).not.toHaveBeenCalled();
    });

    it('aceita a variante larga', () => {
        render(
            <Modal title="Excluir ativo" size="wide" onClose={vi.fn()} footer={null}>
                conteúdo
            </Modal>
        );

        expect(screen.getByRole('dialog')).toHaveClass('max-w-4xl');
    });

    it('leva o foco para o primeiro controle ao abrir e devolve ao fechar', () => {
        const trigger: HTMLButtonElement = document.createElement('button');
        document.body.appendChild(trigger);
        trigger.focus();
        const { unmount } = render(
            <Modal title="Excluir ativo" onClose={vi.fn()} footer={<button type="button">Confirmar</button>}>
                <input aria-label="Nome" />
            </Modal>
        );

        expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement);
        unmount();

        expect(trigger).toHaveFocus();
        trigger.remove();
    });

    it('mantém o Tab dentro do diálogo nos dois sentidos', async () => {
        const user: UserEvent = userEvent.setup();
        render(
            <Modal title="Excluir ativo" onClose={vi.fn()} footer={<button type="button">Confirmar</button>}>
                <input aria-label="Nome" />
            </Modal>
        );
        const confirm: HTMLElement = screen.getByRole('button', { name: 'Confirmar' });
        confirm.focus();
        await user.tab();

        expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement);
        expect(document.activeElement).not.toBe(confirm);
        await user.tab({ shift: true });

        expect(confirm).toHaveFocus();
    });

    it('ignora o Escape que outro componente já tratou', () => {
        const onClose: Mock = vi.fn();
        render(
            <Modal title="Excluir ativo" onClose={onClose} footer={null}>
                conteúdo
            </Modal>
        );
        const event: KeyboardEvent = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
        event.preventDefault();

        window.dispatchEvent(event);

        expect(onClose).not.toHaveBeenCalled();
    });

    it('mostra o conteúdo à esquerda do título e liga o título ao diálogo', () => {
        render(
            <Modal title="Ações" leading={<button type="button">Voltar</button>} onClose={vi.fn()} footer={null}>
                conteúdo
            </Modal>
        );

        expect(screen.getByRole('dialog', { name: 'Ações' })).toContainElement(screen.getByRole('button', { name: 'Voltar' }));
        expect(screen.getByRole('heading', { name: 'Ações' })).toHaveAttribute(
            'id',
            screen.getByRole('dialog').getAttribute('aria-labelledby')
        );
    });

    it('ocupa a tela abaixo de 640 px quando pedido', () => {
        render(
            <Modal title="Ações" fullOnMobile onClose={vi.fn()} footer={null}>
                conteúdo
            </Modal>
        );

        expect(screen.getByRole('dialog')).toHaveClass('h-full', 'rounded-none', 'sm:rounded-card');
        expect(screen.getByRole('dialog').parentElement).toHaveClass('p-0', 'sm:p-5');
    });
});
