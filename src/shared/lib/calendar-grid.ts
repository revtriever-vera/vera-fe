import type { SupportedLocale } from '@/shared/lib/locale';

export interface CalendarDay {
    readonly iso: string;
    readonly day: number;
    readonly inMonth: boolean;
}

export interface CalendarMonth {
    readonly year: number;
    readonly month: number;
}

const WEEKS: number = 6;
const DAYS_IN_WEEK: number = 7;
const MASKED_PATTERN: RegExp = /^\d{2}\/\d{2}\/\d{4}$/;
const WEEKDAY_REFERENCE_MONTH: number = 0;
const WEEKDAY_REFERENCE_SUNDAY: number = 7;

function utcOf(year: number, month: number, day: number): Date {
    return new Date(Date.UTC(year, month, day));
}

export function isoOf(year: number, month: number, day: number): string {
    return utcOf(year, month, day).toISOString().slice(0, 10);
}

export function partsOf(iso: string): CalendarMonth & { readonly day: number } {
    return { year: Number(iso.slice(0, 4)), month: Number(iso.slice(5, 7)) - 1, day: Number(iso.slice(8, 10)) };
}

export function weekdayInitials(locale: SupportedLocale): readonly string[] {
    const formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(locale, { weekday: 'narrow', timeZone: 'UTC' });
    return Array.from({ length: DAYS_IN_WEEK }, (_unused: unknown, day: number): string =>
        formatter.format(utcOf(2024, WEEKDAY_REFERENCE_MONTH, WEEKDAY_REFERENCE_SUNDAY + day))
    );
}

export function monthLabelOf({ year, month }: CalendarMonth, locale: SupportedLocale): string {
    const formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' });
    return formatter.format(utcOf(year, month, 1));
}

export function longDateOf(iso: string, locale: SupportedLocale): string {
    const formatter: Intl.DateTimeFormat = new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
    });
    return formatter.format(new Date(`${iso}T00:00:00.000Z`));
}

export function shiftMonth({ year, month }: CalendarMonth, delta: number): CalendarMonth {
    const shifted: Date = utcOf(year, month + delta, 1);
    return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() };
}

export function monthGridOf({ year, month }: CalendarMonth): CalendarDay[] {
    const first: Date = utcOf(year, month, 1);
    const start: Date = utcOf(year, month, 1 - first.getUTCDay());
    return Array.from({ length: WEEKS * DAYS_IN_WEEK }, (_unused: unknown, index: number): CalendarDay => {
        const at: Date = new Date(start.getTime() + index * 86_400_000);
        return {
            iso: at.toISOString().slice(0, 10),
            day: at.getUTCDate(),
            inMonth: at.getUTCMonth() === month
        };
    });
}

export function maskedFromIso(iso: string | null): string {
    return iso === null ? '' : `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
}

export function maskDate(text: string): string {
    const digits: string = text.replace(/\D/g, '').slice(0, 8);
    const parts: string[] = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)];
    return parts.filter((part: string): boolean => part !== '').join('/');
}

export function isoFromMasked(masked: string): string | null {
    if (!MASKED_PATTERN.test(masked)) {
        return null;
    }
    const day: string = masked.slice(0, 2);
    const month: string = masked.slice(3, 5);
    const year: string = masked.slice(6, 10);
    const candidate: string = isoOf(Number(year), Number(month) - 1, Number(day));
    return candidate === `${year}-${month}-${day}` ? candidate : null;
}

export function isWithin(iso: string, min: string | null, max: string | null): boolean {
    return (min === null || iso >= min) && (max === null || iso <= max);
}
