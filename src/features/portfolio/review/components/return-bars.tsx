import type { ReactElement } from 'react';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { cn } from '@/shared/lib/cn';
import { barWidth, maxMagnitude } from '../lib/bar-width';
import { formatReturnPct } from '../lib/format-return';

export interface ReturnBarRow {
    readonly key: string;
    readonly label: string;
    readonly pct: number | null;
    readonly note?: string;
    readonly muted?: boolean;
}

export interface ReturnBarsProps {
    readonly rows: readonly ReturnBarRow[];
}

function barTone(pct: number, muted: boolean): string {
    if (pct < 0) {
        return 'bg-critical';
    }
    return muted ? 'bg-content-subtle' : 'bg-accent';
}

function ReturnBarTrack({ row, max, value }: { readonly row: ReturnBarRow; readonly max: number; readonly value: string }): ReactElement {
    if (row.pct === null) {
        return <span aria-hidden="true" className="h-2 rounded-full bg-surface-muted" />;
    }
    const tone: string = barTone(row.pct, row.muted === true);
    return (
        <span role="img" aria-label={`${row.label}: ${value}`} className="h-2 overflow-hidden rounded-full bg-surface-muted">
            <span className={cn('block h-full rounded-full', tone)} style={{ width: barWidth(row.pct, max) }} />
        </span>
    );
}

function ReturnBarItem({ row, max }: { readonly row: ReturnBarRow; readonly max: number }): ReactElement {
    const locale: SupportedLocale = useLocale();
    const value: string = row.pct === null ? '' : formatReturnPct(row.pct, locale);
    return (
        <li className="grid grid-cols-[minmax(0,1.2fr)_minmax(80px,1fr)_auto] items-center gap-3.5 border-b border-border py-2.5 last:border-b-0">
            <span className="flex min-w-0 flex-col">
                <span className={cn('truncate text-sm font-semibold', row.muted === true && 'font-medium text-content-muted')}>
                    {row.label}
                </span>
                {row.note === undefined ? null : <span className="text-xs text-content-muted">{row.note}</span>}
            </span>
            <ReturnBarTrack row={row} max={max} value={value} />
            <span className="numeric min-w-16 text-right text-sm font-semibold">{value}</span>
        </li>
    );
}

export function ReturnBars({ rows }: ReturnBarsProps): ReactElement {
    const max: number = maxMagnitude(rows.map((row: ReturnBarRow): number | null => row.pct));
    return (
        <ul className="flex flex-col">
            {rows.map((row: ReturnBarRow): ReactElement => (
                <ReturnBarItem key={row.key} row={row} max={max} />
            ))}
        </ul>
    );
}
