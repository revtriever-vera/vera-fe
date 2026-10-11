import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Table, type TableColumn } from './table';

interface Row {
    readonly id: string;
    readonly name: string;
}

const COLUMNS: readonly TableColumn<Row>[] = [{ key: 'name', header: 'Ativo', render: (row: Row): string => row.name }];

const ROWS: readonly Row[] = [
    { id: '1', name: 'Tesouro IPCA+' },
    { id: '2', name: 'Fundo imobiliário' }
];

describe('Table', () => {
    it('renderiza um cabeçalho por coluna e uma linha por item', () => {
        render(<Table label="Ativos" columns={COLUMNS} rows={ROWS} rowKey={(row: Row): string => row.id} />);

        expect(screen.getByRole('columnheader', { name: 'Ativo' })).toBeInTheDocument();
        expect(screen.getByText('Tesouro IPCA+')).toBeInTheDocument();
        expect(screen.getByText('Fundo imobiliário')).toBeInTheDocument();
        expect(screen.getAllByRole('row')).toHaveLength(3);
    });

    it('aplica a largura mínima quando pedida', () => {
        render(<Table label="Ativos" columns={COLUMNS} rows={ROWS} rowKey={(row: Row): string => row.id} minWidthClass="min-w-[640px]" />);

        expect(screen.getByRole('table')).toHaveClass('min-w-[640px]');
    });
});
