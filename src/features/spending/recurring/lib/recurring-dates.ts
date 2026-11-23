import type { SupportedLocale } from '@/shared/lib/locale';

const DAYS_IN_WEEK: number = 7;
const MS_PER_DAY: number = 86_400_000;
const ISO_DATE_LENGTH: number = 10;
const MONTH_LENGTH: number = 7;

export function isoToUtc(iso: string): Date {
    const [year, month, day]: number[] = iso.slice(0, ISO_DATE_LENGTH).split('-').map(Number);
    return new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, day ?? 1));
}

export function utcToIso(date: Date): string {
    return date.toISOString().slice(0, ISO_DATE_LENGTH);
}

export function addDays(iso: string, days: number): string {
    return utcToIso(new Date(isoToUtc(iso).getTime() + days * MS_PER_DAY));
}

export function mondayOf(iso: string): string {
    const weekday: number = (isoToUtc(iso).getUTCDay() + DAYS_IN_WEEK - 1) % DAYS_IN_WEEK;
    return addDays(iso, -weekday);
}

export function monthOf(iso: string): string {
    return iso.slice(0, MONTH_LENGTH);
}

export function mondayFirstWeekday(iso: string): number {
    return (isoToUtc(iso).getUTCDay() + DAYS_IN_WEEK - 1) % DAYS_IN_WEEK;
}

export function daysInMonth(month: string): number {
    const [year, number]: number[] = month.split('-').map(Number);
    return new Date(Date.UTC(year ?? 1970, number ?? 1, 0)).getUTCDate();
}

export function shortDate(iso: string, locale: SupportedLocale): string {
    return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', timeZone: 'UTC' }).format(isoToUtc(iso));
}

export function weekdayShortDate(iso: string, locale: SupportedLocale): string {
    return new Intl.DateTimeFormat(locale, { weekday: 'short', day: '2-digit', month: '2-digit', timeZone: 'UTC' }).format(isoToUtc(iso));
}

export function weekdayLabels(locale: SupportedLocale): readonly string[] {
    const format: Intl.DateTimeFormat = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
    const monday: string = '2026-11-23';
    return Array.from({ length: DAYS_IN_WEEK }, (_unused: unknown, index: number): string =>
        format.format(isoToUtc(addDays(monday, index)))
    );
}
