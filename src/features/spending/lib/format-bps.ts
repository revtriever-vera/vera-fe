import type { SupportedLocale } from '@/shared/lib/locale';

export const MINUS_SIGN: string = '−';
const BPS_PER_UNIT: number = 10000;

function wholePercent(bps: number, locale: SupportedLocale, signDisplay: 'auto' | 'exceptZero'): string {
    const formatter: Intl.NumberFormat = new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        signDisplay
    });
    return formatter.format(bps / BPS_PER_UNIT).replace('-', MINUS_SIGN);
}

export function formatDeltaBps(bps: number, locale: SupportedLocale): string {
    return wholePercent(bps, locale, 'exceptZero');
}

export function formatRateBps(bps: number, locale: SupportedLocale): string {
    return wholePercent(bps, locale, 'auto');
}

export function toMajorUnits(minor: number, currency: string): number {
    const exponent: number = new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
    return minor / 10 ** exponent;
}
