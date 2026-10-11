import type { SupportedLocale } from '@/shared/lib/locale';

export function formatDate(date: Date, locale: SupportedLocale, timeZone: string): string {
    return new Intl.DateTimeFormat(locale, { timeZone, dateStyle: 'short', timeStyle: 'short' }).format(date);
}
