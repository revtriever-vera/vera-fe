import type { TFunction } from 'i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import { formatMonthName } from '@/shared/lib/format/date';
import type { SupportedLocale } from '@/shared/lib/locale';
import { RECURRING_ALERT_KIND, RECURRING_CURRENCY, type RecurringAlert } from '../types';
import { monthOf, shortDate } from './recurring-dates';

type Translate = TFunction<'spendingRecurring'>;

function num(alert: RecurringAlert, key: string): number {
    const value: string | number | undefined = alert.data[key];
    return typeof value === 'number' ? value : Number(value ?? 0);
}

function text(alert: RecurringAlert, key: string): string {
    return String(alert.data[key] ?? '');
}

function money(alert: RecurringAlert, key: string, locale: SupportedLocale): string {
    return formatCurrency(num(alert, key), RECURRING_CURRENCY, locale);
}

function priceIncrease(alert: RecurringAlert, locale: SupportedLocale, t: Translate): string {
    return t('alerts.text.priceIncrease', {
        name: alert.seriesName,
        from: money(alert, 'fromAmountMinor', locale),
        to: money(alert, 'toAmountMinor', locale),
        month: formatMonthName(monthOf(text(alert, 'chargeDate')), locale),
        percent: Math.round(num(alert, 'percent'))
    });
}

function duplicateCharge(alert: RecurringAlert, locale: SupportedLocale, t: Translate): string {
    return t('alerts.text.duplicateCharge', {
        name: alert.seriesName,
        month: formatMonthName(monthOf(text(alert, 'firstDate')), locale),
        firstAmount: money(alert, 'firstAmountMinor', locale),
        firstDate: shortDate(text(alert, 'firstDate'), locale),
        secondAmount: money(alert, 'secondAmountMinor', locale),
        secondDate: shortDate(text(alert, 'secondDate'), locale)
    });
}

function returned(alert: RecurringAlert, locale: SupportedLocale, t: Translate): string {
    return t('alerts.text.returned', {
        name: alert.seriesName,
        amount: money(alert, 'amountMinor', locale),
        date: shortDate(text(alert, 'returnDate'), locale),
        count: num(alert, 'gapDays')
    });
}

function renewal(alert: RecurringAlert, locale: SupportedLocale, t: Translate): string {
    return t('alerts.text.renewal', {
        name: alert.seriesName,
        amount: money(alert, 'amountMinor', locale),
        count: num(alert, 'daysUntil')
    });
}

function stillUsing(alert: RecurringAlert, locale: SupportedLocale, t: Translate): string {
    return t('alerts.text.stillUsing', {
        name: alert.seriesName,
        amount: money(alert, 'amountMinor', locale),
        count: num(alert, 'chargeCount')
    });
}

function trialConverted(alert: RecurringAlert, locale: SupportedLocale, t: Translate): string {
    return t('alerts.text.trialConverted', {
        name: alert.seriesName,
        amount: money(alert, 'firstAmountMinor', locale),
        date: shortDate(text(alert, 'chargeDate'), locale)
    });
}

function duplicateAccount(alert: RecurringAlert, t: Translate): string {
    return t('alerts.text.duplicateAccount', {
        name: alert.seriesName,
        account: text(alert, 'accountName'),
        other: text(alert, 'otherAccountName')
    });
}

export function alertText(alert: RecurringAlert, locale: SupportedLocale, t: Translate): string {
    switch (alert.kind) {
        case RECURRING_ALERT_KIND.priceIncrease:
            return priceIncrease(alert, locale, t);
        case RECURRING_ALERT_KIND.duplicateCharge:
            return duplicateCharge(alert, locale, t);
        case RECURRING_ALERT_KIND.duplicateAccount:
            return duplicateAccount(alert, t);
        case RECURRING_ALERT_KIND.trialConverted:
            return trialConverted(alert, locale, t);
        case RECURRING_ALERT_KIND.returned:
            return returned(alert, locale, t);
        case RECURRING_ALERT_KIND.stillUsing:
            return stillUsing(alert, locale, t);
        case RECURRING_ALERT_KIND.renewal:
            return renewal(alert, locale, t);
    }
}
