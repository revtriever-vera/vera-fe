import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonTable } from './skeleton-table';

describe('SkeletonTable', () => {
    it('repete o cabeçalho que vem depois, para a tela não pular', () => {
        render(<SkeletonTable label="Carregando ativos" columns={['Ativo', 'Cliente', 'Status']} rows={4} />);

        expect(screen.getByRole('columnheader', { name: 'Ativo' })).toBeInTheDocument();
        expect(screen.getByRole('columnheader', { name: 'Cliente' })).toBeInTheDocument();
        expect(screen.getAllByRole('row')).toHaveLength(5);
    });

    it('usa cinco linhas por padrão e anuncia o carregamento', () => {
        render(<SkeletonTable label="Carregando" columns={['A', 'B']} />);

        expect(screen.getAllByRole('row')).toHaveLength(6);
        expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    });

    it('aplica a largura mínima pedida à tabela', () => {
        render(<SkeletonTable label="Carregando" columns={['A']} minWidthClass="min-w-[640px]" />);

        expect(screen.getByRole('table')).toHaveClass('min-w-[640px]');
    });

    it('volta ao início das larguras quando há mais colunas que larguras', () => {
        const columns: string[] = ['A', 'B', 'C', 'D', 'E', 'F'];
        const { container }: { container: HTMLElement } = render(<SkeletonTable label="Carregando" columns={columns} rows={1} />);

        const cells: HTMLElement[] = Array.from(container.querySelectorAll<HTMLElement>('tbody td > *'));
        expect(cells).toHaveLength(6);
        expect(cells[5]?.className).toBe(cells[0]?.className);
    });
});
