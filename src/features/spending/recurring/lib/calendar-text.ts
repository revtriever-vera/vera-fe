import type { TFunction } from 'i18next';
import { CREDIT_CARD_KIND, type CalendarEntry } from '../types';

export function calendarAccountText(entry: CalendarEntry, t: TFunction<'spendingRecurring'>): string {
    if (entry.accountKind === CREDIT_CARD_KIND) {
        return t('calendar.onCard', { name: entry.institutionName ?? entry.accountName });
    }
    return entry.institutionName === null ? entry.accountName : `${entry.institutionName} · ${entry.accountName}`;
}

export function calendarAmountText(
    amountMinor: number,
    isEstimate: boolean,
    format: (amountMinor: number) => string,
    t: TFunction<'spendingRecurring'>
): string {
    const amount: string = format(amountMinor);
    return isEstimate ? t('value.estimate', { amount }) : amount;
}
