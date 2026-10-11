import type { SupportedLocale } from '@/shared/lib/locale';

const MONTH_PATTERN: RegExp = /^(\d{4})-(\d{2})$/;
const MONTH_RADIX: number = 10;

export function isMonth(value: string): boolean {
    const match: RegExpMatchArray | null = MONTH_PATTERN.exec(value);
    const month: number = Number.parseInt(match?.[2] ?? '0', MONTH_RADIX);
    return match !== null && month >= 1 && month <= 12;
}

export function formatMonth(month: string, locale: SupportedLocale): string {
    const match: RegExpMatchArray | null = MONTH_PATTERN.exec(month);
    if (match === null) {
        return month;
    }
    const year: number = Number.parseInt(match[1] ?? '0', MONTH_RADIX);
    const index: number = Number.parseInt(match[2] ?? '1', MONTH_RADIX) - 1;
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, index, 1)));
}

export function formatMonthTitle(month: string, locale: SupportedLocale): string {
    const text: string = formatMonth(month, locale);
    return text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);
}
