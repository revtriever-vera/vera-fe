import type { ReactElement } from 'react';
import { useMediaQuery } from '@/shared/lib/use-media-query';
import { Table, type TableColumn } from '@/shared/ui/table';

const NARROW_QUERY: string = '(max-width: 860px)';

export interface ResponsiveRowsProps<Row> {
    readonly label: string;
    readonly columns: readonly TableColumn<Row>[];
    readonly rows: readonly Row[];
    readonly rowKey: (row: Row) => string;
    readonly minWidthClass?: string;
}

function RowCard<Row>({ row, columns }: { readonly row: Row; readonly columns: readonly TableColumn<Row>[] }): ReactElement {
    const [first, ...rest]: readonly TableColumn<Row>[] = columns;
    return (
        <li className="surface-card flex flex-col gap-2 p-4">
            {first === undefined ? null : <div>{first.render(row)}</div>}
            <dl className="flex flex-col gap-1.5">
                {rest.map((column: TableColumn<Row>): ReactElement => (
                    <div key={column.key} className="flex items-start justify-between gap-3 text-sm">
                        <dt className="text-content-muted">{column.header === '' ? null : column.header}</dt>
                        <dd className="text-right">{column.render(row)}</dd>
                    </div>
                ))}
            </dl>
        </li>
    );
}

export function ResponsiveRows<Row>({ label, columns, rows, rowKey, minWidthClass }: ResponsiveRowsProps<Row>): ReactElement {
    const narrow: boolean = useMediaQuery(NARROW_QUERY);
    if (!narrow) {
        return <Table label={label} columns={columns} rows={rows} rowKey={rowKey} minWidthClass={minWidthClass} />;
    }
    return (
        <ul aria-label={label} className="flex flex-col gap-3">
            {rows.map((row: Row): ReactElement => (
                <RowCard key={rowKey(row)} row={row} columns={columns} />
            ))}
        </ul>
    );
}
