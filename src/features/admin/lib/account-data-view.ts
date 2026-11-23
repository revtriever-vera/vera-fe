import { formatCurrency } from '@/shared/lib/format/currency';
import { formatDate, formatIsoDate } from '@/shared/lib/format/date';
import type { SupportedLocale } from '@/shared/lib/locale';

export const MAX_ROWS: number = 50;
export const MAX_COLUMNS: number = 8;

export interface ScalarLabels {
    readonly yes: string;
    readonly no: string;
    readonly empty: string;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function recordRows(value: unknown): readonly Record<string, unknown>[] | null {
    if (!Array.isArray(value) || value.length === 0) {
        return null;
    }
    return value.every(isRecord) ? value : null;
}

export function columnsOf(rows: readonly Record<string, unknown>[]): readonly string[] {
    const keys: Set<string> = new Set<string>();
    for (const row of rows) {
        Object.keys(row).forEach((key: string): void => {
            keys.add(key);
        });
    }
    return [...keys].slice(0, MAX_COLUMNS);
}

export function humanizeKey(key: string): string {
    const spaced: string = key
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .trim()
        .toLowerCase();
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function scalarText(value: unknown, labels: ScalarLabels): string {
    if (value === null || value === undefined || value === '') {
        return labels.empty;
    }
    if (typeof value === 'boolean') {
        return value ? labels.yes : labels.no;
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
        return String(value);
    }
    return JSON.stringify(value);
}

const DEFAULT_CURRENCY: string = 'BRL';
const MICROS_PER_CENT: number = 10_000;
const BPS_PER_UNIT: number = 10_000;
const ISO_INSTANT: RegExp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
const ISO_DAY: RegExp = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Writes one value of the account detail by what its key says: money in minor units (`...Minor`, `...Cents`) and in
 * micros (`costMicros`), basis points (`...Bps`), instants and days. Anything else falls back to `scalarText`.
 */
export function fieldText(key: string, value: unknown, labels: ScalarLabels, locale: SupportedLocale, currency?: unknown): string {
    if (typeof value === 'number') {
        const code: string = typeof currency === 'string' ? currency : DEFAULT_CURRENCY;
        if (key.endsWith('Minor') || key.endsWith('Cents')) {
            return formatCurrency(value, code, locale);
        }
        if (key === 'costMicros') {
            return formatCurrency(value / MICROS_PER_CENT, DEFAULT_CURRENCY, locale);
        }
        if (key.endsWith('Bps')) {
            return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 2 }).format(value / BPS_PER_UNIT);
        }
    }
    if (typeof value === 'string') {
        if (ISO_INSTANT.test(value)) {
            return formatDate(new Date(value), locale, 'UTC');
        }
        if (ISO_DAY.test(value)) {
            return formatIsoDate(value, locale);
        }
    }
    return scalarText(value, labels);
}
