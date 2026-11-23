import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { useMediaQuery } from '@/shared/lib/use-media-query';
import { Table, type TableColumn } from '@/shared/ui/table';

const NARROW_QUERY: string = '(max-width: 860px)';

export interface ResponsiveRowsProps<Row> {
    readonly label: string;
    readonly columns: readonly TableColumn<Row>[];
    readonly rows: readonly Row[];
    readonly rowKey: (row: Row) => string;
    readonly minWidthClass?: string;
    readonly onRowActivate?: (row: Row) => void;
    readonly rowClassName?: (row: Row) => string | undefined;
}

interface RowCardProps<Row> {
    readonly row: Row;
    readonly columns: readonly TableColumn<Row>[];
    readonly onActivate: ((row: Row) => void) | undefined;
    readonly className: string | undefined;
}

function RowCard<Row>({ row, columns, onActivate, className }: RowCardProps<Row>): ReactElement {
    const [first, ...rest]: readonly TableColumn<Row>[] = columns;
    const head: ReactNode = first === undefined ? null : first.render(row);
    return (
        <li
            className={cn('surface-card relative flex flex-col gap-2 p-4', onActivate !== undefined && 'hover:bg-surface-muted', className)}
        >
            {onActivate === undefined ? (
                <div>{head}</div>
            ) : (
                <button
                    type="button"
                    className="text-left after:absolute after:inset-0 after:content-['']"
                    onClick={(): void => {
                        onActivate(row);
                    }}
                >
                    {head}
                </button>
            )}
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

export function ResponsiveRows<Row>({
    label,
    columns,
    rows,
    rowKey,
    minWidthClass,
    onRowActivate,
    rowClassName
}: ResponsiveRowsProps<Row>): ReactElement {
    const narrow: boolean = useMediaQuery(NARROW_QUERY);
    if (!narrow) {
        return (
            <Table
                label={label}
                columns={columns}
                rows={rows}
                rowKey={rowKey}
                minWidthClass={minWidthClass}
                onRowActivate={onRowActivate}
                rowClassName={rowClassName}
            />
        );
    }
    return (
        <ul aria-label={label} className="flex flex-col gap-3">
            {rows.map((row: Row): ReactElement => (
                <RowCard key={rowKey(row)} row={row} columns={columns} onActivate={onRowActivate} className={rowClassName?.(row)} />
            ))}
        </ul>
    );
}
