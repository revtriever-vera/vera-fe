import type { SupportedLocale } from '@/shared/lib/locale';

const MINUS_SIGN: string = '−';
const PERCENT_BASE: number = 100;

export function formatReturnPct(pct: number, locale: SupportedLocale): string {
    const formatter: Intl.NumberFormat = new Intl.NumberFormat(locale, {
        style: 'percent',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        signDisplay: 'exceptZero'
    });
    return formatter.format(pct / PERCENT_BASE).replace('-', MINUS_SIGN);
}
