import type { ReactElement } from 'react';
import { cn } from '@/shared/lib/cn';
import { Loading, Skeleton } from './skeleton';

export interface SkeletonTableProps {
    readonly label: string;
    readonly columns: readonly string[];
    readonly rows?: number;
    readonly minWidthClass?: string;
}

const CELL_WIDTHS: readonly string[] = ['w-32', 'w-40', 'w-20', 'w-24', 'w-28'];

export function SkeletonTable({ label, columns, rows = 5, minWidthClass }: SkeletonTableProps): ReactElement {
    return (
        <Loading label={label} className="surface-card overflow-x-auto p-0">
            <table className={cn('w-full text-sm', minWidthClass)}>
                <thead>
                    <tr className="border-b border-content-muted/15 text-left text-xs tracking-wider text-content-subtle uppercase">
                        {columns.map((column: string): ReactElement => (
                            <th key={column} className="px-4 py-3 font-medium">
                                {column}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }, (_unused: unknown, row: number): ReactElement => (
                        <tr key={row} className="border-b border-content-muted/10 last:border-0">
                            {columns.map((column: string, cell: number): ReactElement => (
                                <td key={column} className="px-4 py-3">
                                    <Skeleton className={cn('h-3.5', CELL_WIDTHS[cell % CELL_WIDTHS.length])} />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </Loading>
    );
}
