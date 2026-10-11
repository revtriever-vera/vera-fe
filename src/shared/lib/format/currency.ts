import type { SupportedLocale } from '@/shared/lib/locale';

export function formatMoney(amountMinor: number, currency: string, locale: SupportedLocale): string {
    const formatter: Intl.NumberFormat = new Intl.NumberFormat(locale, { style: 'currency', currency });
    const exponent: number = formatter.resolvedOptions().maximumFractionDigits ?? 2;
    const amount: number = amountMinor / 10 ** exponent;
    return formatter.format(amount);
}
