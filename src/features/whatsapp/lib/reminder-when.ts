import type { TFunction } from 'i18next';
import type { SupportedLocale } from '@/shared/lib/locale';
import type { ReminderItem } from '../types';

export function reminderWhen(t: TFunction<'whatsapp'>, item: ReminderItem, locale: SupportedLocale): string {
    if (item.kind === 'monthly' && item.dayOfMonth !== null) {
        return t('reminders.monthly', { day: item.dayOfMonth, time: item.time });
    }
    if (item.nextAt === null) {
        return t('reminders.noDate');
    }
    return new Intl.DateTimeFormat(locale, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(item.nextAt));
}
