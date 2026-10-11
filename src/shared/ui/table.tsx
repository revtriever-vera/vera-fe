import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export interface TableColumn<Row> {
    readonly key: string;
    readonly header: string;
    readonly render: (row: Row) => ReactNode;
}

export interface TableProps<Row> {
    readonly label: string;
    readonly columns: readonly TableColumn<Row>[];
    readonly rows: readonly Row[];
    readonly rowKey: (row: Row) => string;
    readonly minWidthClass?: string;
}

export function Table<Row>({ label, columns, rows, rowKey, minWidthClass }: TableProps<Row>): ReactElement {
    return (
        <div className="surface-card overflow-x-auto p-0">
            <table aria-label={label} className={cn('w-full text-sm', minWidthClass)}>
                <thead>
                    <tr className="border-b border-content-muted/15 text-left text-xs tracking-wider text-content-subtle uppercase">
                        {columns.map((column: TableColumn<Row>): ReactElement => (
                            <th key={column.key} className="px-4 py-3 font-medium">
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row: Row): ReactElement => (
                        <tr key={rowKey(row)} className="border-b border-content-muted/10 last:border-0">
                            {columns.map((column: TableColumn<Row>): ReactElement => (
                                <td key={column.key} className="px-4 py-3 text-content">
                                    {column.render(row)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
