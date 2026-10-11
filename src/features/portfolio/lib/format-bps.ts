import type { SupportedLocale } from '@/shared/lib/locale';

const MINUS_SIGN: string = '−';
const BPS_PER_UNIT: number = 10000;
const BPS_PER_POINT: number = 100;

function percentFormatter(locale: SupportedLocale, minimum: number, maximum: number): Intl.NumberFormat {
    return new Intl.NumberFormat(locale, { style: 'percent', minimumFractionDigits: minimum, maximumFractionDigits: maximum });
}

export function formatShareBps(bps: number, locale: SupportedLocale, digits: number = 1): string {
    return percentFormatter(locale, digits, digits).format(bps / BPS_PER_UNIT);
}

export function formatTargetBps(bps: number, locale: SupportedLocale): string {
    return percentFormatter(locale, 0, 2).format(bps / BPS_PER_UNIT);
}

export function formatPpBps(bps: number, locale: SupportedLocale): string {
    const formatter: Intl.NumberFormat = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
        signDisplay: 'exceptZero'
    });
    return `${formatter.format(bps / BPS_PER_POINT).replace('-', MINUS_SIGN)} pp`;
}
