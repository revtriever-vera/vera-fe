import type { SupportedLocale } from '@/shared/lib/locale';

export function formatNumber(value: number, locale: SupportedLocale): string {
    return new Intl.NumberFormat(locale).format(value);
}
