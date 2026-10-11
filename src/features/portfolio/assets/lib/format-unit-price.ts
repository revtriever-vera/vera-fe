import type { SupportedLocale } from '@/shared/lib/locale';
import { decimalPlaces } from './quantity-decimals';

const MIN_FRACTION_DIGITS: number = 2;
const MAX_FRACTION_DIGITS: number = 8;

export function formatUnitPrice(price: string, currency: string, locale: SupportedLocale): string {
    const digits: number = Math.min(Math.max(decimalPlaces(price), MIN_FRACTION_DIGITS), MAX_FRACTION_DIGITS);
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        minimumFractionDigits: MIN_FRACTION_DIGITS,
        maximumFractionDigits: digits
    }).format(Number(price));
}
