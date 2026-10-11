import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loading, SkeletonText } from './skeleton';
import { SkeletonTable } from './skeleton-table';

describe('esqueletos', () => {
    it('anuncia o que está carregando, para quem não vê a animação', () => {
        render(
            <Loading label="Carregando ativos">
                <SkeletonText lines={2} />
            </Loading>
        );

        expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
        expect(screen.getByText('Carregando ativos')).toBeInTheDocument();
    });

    it('a tabela vazia repete o cabeçalho que vem depois, para a tela não pular', () => {
        render(<SkeletonTable label="Carregando ativos" columns={['Ativo', 'Cliente', 'Status']} rows={4} />);

        expect(screen.getByRole('columnheader', { name: 'Ativo' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Cliente' })).toBeInTheDocument();
        expect(screen.getAllByRole('row')).toHaveLength(5);
    });
});
