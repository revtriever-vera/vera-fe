import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
