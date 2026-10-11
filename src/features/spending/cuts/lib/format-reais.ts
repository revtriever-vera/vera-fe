import type { SupportedLocale } from '@/shared/lib/locale';
import { toMajorUnits } from '../../lib/format-bps';
import { SPENDING_CURRENCY } from '../../types';

export function formatWhole(minor: number, locale: SupportedLocale): string {
    const formatter: Intl.NumberFormat = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: SPENDING_CURRENCY,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
    return formatter.format(toMajorUnits(minor, SPENDING_CURRENCY));
}
