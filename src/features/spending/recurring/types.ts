import type { ApiPaths } from '@/shared/lib/api/api-paths';

export type RecurringOverview = ApiPaths['/spending/recurring']['get']['responses']['200']['content']['application/json'];
export type RecurringSeriesView = RecurringOverview['review'][number];
export type RecurringSeriesRecord = ApiPaths['/spending/recurring/{id}/dismiss']['post']['responses']['200']['content']['application/json'];
export type RecurringTotals = RecurringOverview['totals'];
export type RecurringCharge = NonNullable<RecurringSeriesView['lastCharges']>[number];
export type RecurringCadence = RecurringSeriesView['cadence'];
export type RecurringKind = RecurringSeriesView['kind'];
export type RecurringValueMode = RecurringSeriesView['valueMode'];
export type ConfirmSeriesBody = NonNullable<
    ApiPaths['/spending/recurring/{id}/confirm']['post']['requestBody']
>['content']['application/json'];
export type ConfirmSeriesResult = ApiPaths['/spending/recurring/{id}/confirm']['post']['responses']['200']['content']['application/json'];

export const RECURRING_CADENCES = [
    'weekly',
    'biweekly',
    'monthly',
    'bimonthly',
    'quarterly',
    'semiannual',
    'annual'
] as const satisfies readonly RecurringCadence[];

export const RECURRING_KINDS = ['subscription', 'bill', 'other'] as const satisfies readonly RecurringKind[];

export const RECURRING_KIND = {
    subscription: 'subscription',
    bill: 'bill',
    other: 'other'
} as const satisfies Record<string, RecurringKind>;

export const RECURRING_CADENCE = {
    weekly: 'weekly',
    biweekly: 'biweekly',
    monthly: 'monthly'
} as const satisfies Record<string, RecurringCadence>;

export const RECURRING_VALUE_MODE = {
    fixed: 'fixed',
    variable: 'variable'
} as const satisfies Record<string, RecurringValueMode>;

export const RECURRING_CURRENCY: string = 'BRL';
export const SUBSCRIPTIONS_CATEGORY_KEY: string = 'subscriptions';
