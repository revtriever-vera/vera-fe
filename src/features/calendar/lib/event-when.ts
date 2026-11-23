import type { SupportedLocale } from '@/shared/lib/locale';

export function eventWhen(start: string, allDay: boolean, locale: SupportedLocale): string {
    const date: Date = new Date(start);
    const timeZone: string | undefined = allDay ? 'UTC' : undefined;
    const weekday: string = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone }).format(date).replace('.', '');
    const day: string = new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', timeZone }).format(date);
    if (allDay) {
        return `${weekday} ${day}`;
    }
    const clock: string = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone }).format(date);
    return `${weekday} ${day} · ${clock}`;
}
