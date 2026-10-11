import type { SupportedLocale } from '@/shared/lib/locale';

export function formatQuantity(quantity: string, decimals: number | null, locale: SupportedLocale): string {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: decimals ?? 0 }).format(Number(quantity));
}
