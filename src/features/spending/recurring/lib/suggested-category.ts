import type { CategoryView } from '../../types';
import { RECURRING_CADENCE, RECURRING_VALUE_MODE, SUBSCRIPTIONS_CATEGORY_KEY, type RecurringSeriesView } from '../types';

const SUBSCRIPTION_CADENCES: ReadonlySet<string> = new Set<string>([RECURRING_CADENCE.monthly, 'annual']);

export function isSubscriptionLike(series: RecurringSeriesView): boolean {
    return series.knownSubscription || (SUBSCRIPTION_CADENCES.has(series.cadence) && series.valueMode === RECURRING_VALUE_MODE.fixed);
}

export function suggestedCategoryId(series: RecurringSeriesView, categories: readonly CategoryView[]): string {
    if (!isSubscriptionLike(series)) {
        return '';
    }
    return categories.find((category: CategoryView): boolean => category.systemKey === SUBSCRIPTIONS_CATEGORY_KEY)?.id ?? '';
}
