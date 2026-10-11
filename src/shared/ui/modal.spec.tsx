import { describe, expect, it, vi, type Mock } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
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
});
