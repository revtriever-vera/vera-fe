import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Inbox } from 'lucide-react';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
    it('mostra título e descrição sem ação', () => {
        render(<EmptyState title="Nada por aqui" description="Nenhum ativo cadastrado ainda." />);

        expect(screen.getByRole('heading', { name: 'Nada por aqui' })).toBeInTheDocument();
        expect(screen.getByText('Nenhum ativo cadastrado ainda.')).toBeInTheDocument();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('abre espaço para a ação quando ela existe', () => {
        render(<EmptyState title="Nada por aqui" description="Crie o primeiro." action={<button type="button">Criar</button>} />);

        expect(screen.getByRole('button', { name: 'Criar' })).toBeInTheDocument();
    });

    it('mostra o ícone decorativo e as ações lado a lado', () => {
        render(
            <EmptyState
                title="Nada por aqui"
                description="Crie o primeiro."
                icon={<Inbox data-testid="icon" />}
                actions={
                    <>
                        <button type="button">Criar</button>
                        <button type="button">Explorar</button>
                    </>
                }
            />
        );

        expect(screen.getByTestId('icon').closest('[aria-hidden="true"]')).not.toBeNull();
        expect(screen.getAllByRole('button').map((button: HTMLElement): string | null => button.textContent)).toEqual([
            'Criar',
            'Explorar'
        ]);
    });

    it('não reserva espaço de ícone nem de ações quando não existem', () => {
        const { container } = render(<EmptyState title="Nada por aqui" description="Crie o primeiro." />);

        expect(container.querySelector('[aria-hidden="true"]')).toBeNull();
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
});
