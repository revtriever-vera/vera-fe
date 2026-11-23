import type { ReactElement } from 'react';
import { useLocale } from '@/shared/lib/i18n';
import type { SupportedLocale } from '@/shared/lib/locale';
import { Money } from '@/shared/ui/money';
import { formatShareBps } from '../../lib/format-bps';

export interface ConcentrationRowProps {
    readonly label: string;
    readonly detail: string;
    readonly valueMinor: number;
    readonly shareBps: number;
    readonly maxMinor: number;
    readonly currency: string;
}

const FULL_WIDTH: number = 100;

function barWidth(valueMinor: number, maxMinor: number): string {
    if (maxMinor <= 0) {
        return '0%';
    }
    return `${Math.min(FULL_WIDTH, (valueMinor / maxMinor) * FULL_WIDTH).toFixed(1)}%`;
}

export function ConcentrationRow({ label, detail, valueMinor, shareBps, maxMinor, currency }: ConcentrationRowProps): ReactElement {
    const locale: SupportedLocale = useLocale();
    const share: string = formatShareBps(shareBps, locale);
    return (
        <li className="grid grid-cols-[minmax(0,1.2fr)_minmax(80px,1fr)_auto] items-center gap-3.5 border-b border-border py-2.5 last:border-b-0">
            <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold">{label}</span>
                {detail === '' ? null : <span className="truncate text-xs text-content-muted">{detail}</span>}
            </span>
            <span role="img" aria-label={`${label}: ${share}`} className="h-2 overflow-hidden rounded-full bg-surface-muted">
                <span className="block h-full rounded-full bg-accent" style={{ width: barWidth(valueMinor, maxMinor) }} />
            </span>
            <span className="flex flex-col text-right">
                <span className="numeric text-sm font-semibold">{share}</span>
                <Money amountMinor={valueMinor} currency={currency} className="text-xs text-content-muted" />
            </span>
        </li>
    );
}
