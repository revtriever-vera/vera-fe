import type { SupportedLocale } from '@/shared/lib/locale';

const ISO_DAY_LENGTH: number = 10;

export function formatGoalMonth(iso: string, locale: SupportedLocale): string {
    const [year, month]: number[] = iso.slice(0, ISO_DAY_LENGTH).split('-').map(Number);
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
        new Date(Date.UTC(year ?? 1970, (month ?? 1) - 1, 1))
    );
}
