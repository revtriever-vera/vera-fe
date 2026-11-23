import type { TFunction } from 'i18next';
import { formatCurrency } from '@/shared/lib/format/currency';
import type { SupportedLocale } from '@/shared/lib/locale';
import { RECURRING_CURRENCY, RECURRING_VALUE_MODE, type RecurringSeriesView } from '../types';

export function seriesValueText(series: RecurringSeriesView, locale: SupportedLocale, t: TFunction<'spendingRecurring'>): string {
    const typical: string = formatCurrency(series.typicalAmountMinor, RECURRING_CURRENCY, locale);
    if (series.valueMode === RECURRING_VALUE_MODE.fixed) {
        return typical;
    }
    if (series.minAmountMinor === series.maxAmountMinor) {
        return t('value.estimate', { amount: typical });
    }
    return t('value.range', {
        min: formatCurrency(series.minAmountMinor, RECURRING_CURRENCY, locale),
        max: formatCurrency(series.maxAmountMinor, RECURRING_CURRENCY, locale)
    });
}

export function seriesDayText(series: RecurringSeriesView, t: TFunction<'spendingRecurring'>): string {
    return series.expectedDay === null ? t('day.none') : t('day.value', { day: series.expectedDay });
}

export function seriesAccountText(series: RecurringSeriesView): string {
    return series.institutionName === null ? series.accountName : `${series.institutionName} · ${series.accountName}`;
}
