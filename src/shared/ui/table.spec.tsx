import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
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

    it('com onRowActivate a linha é focável e abre por clique, Enter e espaço', async () => {
        const user: UserEvent = userEvent.setup();
        const opened: string[] = [];
        render(
            <Table
                label="Ativos"
                columns={COLUMNS}
                rows={ROWS}
                rowKey={(row: Row): string => row.id}
                onRowActivate={(row: Row): void => {
                    opened.push(row.id);
                }}
            />
        );
        const row: HTMLElement = screen.getByText('Tesouro IPCA+').closest('tr') as HTMLElement;

        await user.click(row);
        row.focus();
        await user.keyboard('{Enter}');
        await user.keyboard(' ');
        await user.keyboard('a');

        expect(row).toHaveAttribute('tabindex', '0');
        expect(opened).toEqual(['1', '1', '1']);
    });

    it('alinha colunas à direita e aplica a classe por linha', () => {
        render(
            <Table
                label="Ativos"
                columns={[{ key: 'name', header: 'Ativo', render: (row: Row): string => row.name, align: 'right' }]}
                rows={ROWS}
                rowKey={(row: Row): string => row.id}
                rowClassName={(row: Row): string | undefined => (row.id === '2' ? 'opacity-60' : undefined)}
            />
        );

        expect(screen.getByRole('columnheader', { name: 'Ativo' })).toHaveClass('text-right');
        expect(screen.getByText('Fundo imobiliário').closest('tr')).toHaveClass('opacity-60');
        expect(screen.getByText('Tesouro IPCA+').closest('tr')).not.toHaveAttribute('tabindex');
    });
});
