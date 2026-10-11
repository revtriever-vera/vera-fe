import type { SupportedLocale } from '@/shared/lib/locale';

const DAY_KEY: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };

export type SyncStamp = { readonly kind: 'today'; readonly time: string } | { readonly kind: 'date'; readonly date: string };

function dayOf(date: Date, locale: SupportedLocale): string {
    return new Intl.DateTimeFormat(locale, DAY_KEY).format(date);
}

export function syncStamp(iso: string, now: Date, locale: SupportedLocale): SyncStamp {
    const date: Date = new Date(iso);
    if (dayOf(date, locale) === dayOf(now, locale)) {
        return { kind: 'today', time: new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(date) };
    }
    return { kind: 'date', date: new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(date) };
}

export function shortDate(iso: string, locale: SupportedLocale): string {
    return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit' }).format(new Date(iso));
}

export function verifiedStamp(iso: string, locale: SupportedLocale): string {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
}

export const CONSENT_WARNING_DAYS: number = 30;

export function consentExpiresSoon(iso: string | null, now: Date): boolean {
    if (iso === null) {
        return false;
    }
    const remaining: number = new Date(iso).getTime() - now.getTime();
    return remaining < CONSENT_WARNING_DAYS * 86_400_000;
}
