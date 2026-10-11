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
