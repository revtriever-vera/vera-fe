import type { SupportedLocale } from '@/shared/lib/locale';

const FIRST_DAY_ORDINAL: string = '1º';
const TWO_DAYS_MS: number = 2 * 24 * 60 * 60 * 1000;

export function formatDayMonth(iso: string, locale: SupportedLocale): string {
    const date: Date = new Date(iso);
    const text: string = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long' }).format(date);
    if (locale === 'pt-BR' && date.getDate() === 1) {
        return text.replace(/^1(?!\d)/, FIRST_DAY_ORDINAL);
    }
    return text;
}

export function periodMonthName(resetsAtIso: string, locale: SupportedLocale): string {
    const inPeriod: Date = new Date(new Date(resetsAtIso).getTime() - TWO_DAYS_MS);
    return new Intl.DateTimeFormat(locale, { month: 'long' }).format(inPeriod);
}

export function usedPercent(usedBps: number): number {
    return Math.min(100, Math.floor(usedBps / 100));
}
