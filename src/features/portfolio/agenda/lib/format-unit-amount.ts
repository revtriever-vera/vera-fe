import type { SupportedLocale } from '@/shared/lib/locale';

const MAX_UNIT_DIGITS: number = 6;
const MIN_UNIT_DIGITS: number = 2;

export function formatUnitAmount(amount: string, currency: string, locale: SupportedLocale): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: MIN_UNIT_DIGITS,
        maximumFractionDigits: MAX_UNIT_DIGITS
    }).format(Number(amount));
}
