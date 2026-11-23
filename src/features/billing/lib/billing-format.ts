import { civilDayZone } from '@/shared/lib/format/date';
import { formatCurrency } from '@/shared/lib/format/currency';
import type { SupportedLocale } from '@/shared/lib/locale';
import type { BillingMe } from '../types';

export function priceText(me: BillingMe, locale: SupportedLocale): string {
    return formatCurrency(me.priceCents ?? 0, me.currency, locale);
}

export function longDate(iso: string, locale: SupportedLocale): string {
    return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: civilDayZone(iso) }).format(
        new Date(iso)
    );
}

export function shortDate(iso: string, locale: SupportedLocale): string {
    return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: civilDayZone(iso) }).format(
        new Date(iso)
    );
}
