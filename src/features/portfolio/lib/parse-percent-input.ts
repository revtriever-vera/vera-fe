import type { SupportedLocale } from '@/shared/lib/locale';

const PERCENT_PATTERN: RegExp = /^(\d{1,3})(?:[.,](\d{1,2}))?$/;
const MAX_BPS: number = 10000;

export function parsePercentInput(text: string, _locale: SupportedLocale): number | null {
    const match: RegExpMatchArray | null = PERCENT_PATTERN.exec(text.trim());
    if (match?.[1] === undefined) {
        return null;
    }
    const bps: number = Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
    return bps > MAX_BPS ? null : bps;
}

export function bpsToInput(bps: number, locale: SupportedLocale): string {
    return new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: 2, useGrouping: false }).format(bps / 100);
}
