import { afterEach, describe, expect, it, vi, type Mock } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { ResponsiveRows } from './responsive-rows';
import type { TableColumn } from './table';

interface Row {
    readonly id: string;
    readonly name: string;
    readonly value: string;
}

const COLUMNS: readonly TableColumn<Row>[] = [
    { key: 'name', header: 'Nome', render: (row: Row): string => row.name },
    { key: 'value', header: 'Valor', align: 'right', render: (row: Row): string => row.value }
];

const ROWS: readonly Row[] = [{ id: '1', name: 'Aluguel', value: 'R$ 2.000' }];

function stubNarrow(narrow: boolean): void {
    window.matchMedia = (query: string): MediaQueryList =>
        ({
            matches: narrow,
            media: query,
            addEventListener: (): void => undefined,
            removeEventListener: (): void => undefined
        }) as unknown as MediaQueryList;
}

afterEach(() => {
    Reflect.deleteProperty(window, 'matchMedia');
});

describe('ResponsiveRows', () => {
    it('mostra a tabela em tela larga', () => {
        stubNarrow(false);
        render(<ResponsiveRows label="Contas" columns={COLUMNS} rows={ROWS} rowKey={(row: Row): string => row.id} />);

        expect(screen.getByRole('table', { name: 'Contas' })).toBeInTheDocument();
    });

    it('mostra um cartão por linha, com o valor visível, em tela estreita', () => {
        stubNarrow(true);
        render(<ResponsiveRows label="Contas" columns={COLUMNS} rows={ROWS} rowKey={(row: Row): string => row.id} />);

        expect(screen.queryByRole('table')).not.toBeInTheDocument();
        expect(screen.getByRole('list', { name: 'Contas' })).toBeInTheDocument();
        expect(screen.getByText('Aluguel')).toBeInTheDocument();
        expect(screen.getByText('Valor')).toBeInTheDocument();
        expect(screen.getByText('R$ 2.000')).toBeInTheDocument();
    });

    it('abre a linha pelo cartão quando há ação de abrir', async () => {
        stubNarrow(true);
        const user: UserEvent = userEvent.setup();
        const onRowActivate: Mock<(row: Row) => void> = vi.fn();
        render(
            <ResponsiveRows
                label="Contas"
                columns={COLUMNS}
                rows={ROWS}
                rowKey={(row: Row): string => row.id}
                onRowActivate={onRowActivate}
            />
        );

        await user.click(screen.getByRole('button', { name: 'Aluguel' }));

        expect(onRowActivate).toHaveBeenCalledWith(ROWS[0]);
    });
});
