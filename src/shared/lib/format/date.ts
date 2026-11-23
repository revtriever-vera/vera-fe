import type { SupportedLocale } from '@/shared/lib/locale';

export function formatDate(date: Date, locale: SupportedLocale, timeZone: string): string {
    return new Intl.DateTimeFormat(locale, { timeZone, dateStyle: 'short', timeStyle: 'short' }).format(date);
}

export function formatIsoDate(iso: string, locale: SupportedLocale): string {
    const [year, month, day]: number[] = iso.slice(0, 10).split('-').map(Number);
    return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(
        new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1))
    );
}

const MONTH_PATTERN: RegExp = /^(\d{4})-(\d{2})$/;
const RADIX: number = 10;

export function formatMonthName(month: string, locale: SupportedLocale): string {
    const match: RegExpMatchArray | null = MONTH_PATTERN.exec(month);
    if (match === null) {
        return month;
    }
    const index: number = Number.parseInt(match[2] ?? '1', RADIX) - 1;
    return new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2000, index, 1)));
}

export function formatClock(date: Date, locale: SupportedLocale): string {
    return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date);
}

export function formatDayMonthNumeric(date: Date, locale: SupportedLocale): string {
    return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' }).format(date);
}

export function isSameLocalDay(left: Date, right: Date): boolean {
    return left.toDateString() === right.toDateString();
}
