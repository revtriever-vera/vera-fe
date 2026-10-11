import type { SupportedLocale } from '@/shared/lib/locale';

export function formatCurrency(cents: number, currency: string, locale: SupportedLocale): string {
    const formatter: Intl.NumberFormat = new Intl.NumberFormat(locale, { style: 'currency', currency });
    const exponent: number = formatter.resolvedOptions().maximumFractionDigits ?? 2;
    const amount: number = cents / 10 ** exponent;
    return formatter.format(amount);
}
