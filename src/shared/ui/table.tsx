import type { KeyboardEvent, ReactElement, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export interface TableColumn<Row> {
    readonly key: string;
    readonly header: string;
    readonly render: (row: Row) => ReactNode;
    readonly align?: 'left' | 'right';
}

export interface TableProps<Row> {
    readonly label: string;
    readonly columns: readonly TableColumn<Row>[];
    readonly rows: readonly Row[];
    readonly rowKey: (row: Row) => string;
    readonly minWidthClass?: string;
    readonly onRowActivate?: (row: Row) => void;
    readonly rowClassName?: (row: Row) => string | undefined;
}

const ACTIVATION_KEYS: readonly string[] = ['Enter', ' '];

interface TableRowProps<Row> {
    readonly row: Row;
    readonly columns: readonly TableColumn<Row>[];
    readonly onActivate: ((row: Row) => void) | undefined;
    readonly className: string | undefined;
}

function TableRow<Row>({ row, columns, onActivate, className }: TableRowProps<Row>): ReactElement {
    const activate = (event: KeyboardEvent<HTMLTableRowElement>): void => {
        if (onActivate !== undefined && event.target === event.currentTarget && ACTIVATION_KEYS.includes(event.key)) {
            event.preventDefault();
            onActivate(row);
        }
    };
    return (
        <tr
            className={cn(
                'border-b border-content-muted/10 last:border-0',
                onActivate !== undefined && 'cursor-pointer hover:bg-surface-muted',
                className
            )}
            tabIndex={onActivate === undefined ? undefined : 0}
            onClick={
                onActivate === undefined
                    ? undefined
                    : (): void => {
                          onActivate(row);
                      }
            }
            onKeyDown={onActivate === undefined ? undefined : activate}
        >
            {columns.map((column: TableColumn<Row>): ReactElement => (
                <td key={column.key} className={cn('px-4 py-3 text-content', column.align === 'right' && 'text-right')}>
                    {column.render(row)}
                </td>
            ))}
        </tr>
    );
}

export function Table<Row>({ label, columns, rows, rowKey, minWidthClass, onRowActivate, rowClassName }: TableProps<Row>): ReactElement {
    return (
        <div className="surface-card overflow-x-auto p-0">
            <table aria-label={label} className={cn('w-full text-sm', minWidthClass)}>
                <thead>
                    <tr className="border-b border-content-muted/15 text-left text-xs tracking-wider text-content-subtle uppercase">
                        {columns.map((column: TableColumn<Row>): ReactElement => (
                            <th key={column.key} className={cn('px-4 py-3 font-medium', column.align === 'right' && 'text-right')}>
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row: Row): ReactElement => (
                        <TableRow
                            key={rowKey(row)}
                            row={row}
                            columns={columns}
                            onActivate={onRowActivate}
                            className={rowClassName?.(row)}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
