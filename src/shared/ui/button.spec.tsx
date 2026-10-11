import { describe, expect, it, vi, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { Button } from './button';

describe('Button', () => {
    it('nasce como ação primária de tamanho médio', () => {
        render(<Button>Salvar</Button>);

        const button: HTMLElement = screen.getByRole('button', { name: 'Salvar' });
        expect(button).toHaveClass('bg-accent-strong', 'h-9');
    });

    it('aceita variante, tamanho e largura total', () => {
        render(
            <Button variant="danger" size="sm" block>
                Excluir
            </Button>
        );

        const button: HTMLElement = screen.getByRole('button', { name: 'Excluir' });
        expect(button).toHaveClass('bg-critical', 'h-8', 'w-full');
    });

    it('dispara o clique e respeita o disabled', async () => {
        const onClick: Mock = vi.fn();
        const user: UserEvent = userEvent.setup();
        render(
            <Button onClick={onClick} disabled>
                Enviar
            </Button>
        );

        await user.click(screen.getByRole('button', { name: 'Enviar' }));

        expect(onClick).not.toHaveBeenCalled();
    });
});
