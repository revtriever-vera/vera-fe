import type { ApiPaths } from '@/shared/lib/api/api-paths';

export type RecurringOverview = ApiPaths['/spending/recurring']['get']['responses']['200']['content']['application/json'];
export type RecurringSeriesView = RecurringOverview['review'][number];
export type RecurringSeriesRecord = ApiPaths['/spending/recurring/{id}/dismiss']['post']['responses']['200']['content']['application/json'];
export type RecurringTotals = RecurringOverview['totals'];
export type RecurringAlert = RecurringOverview['alerts'][number];
export type RecurringAlertKind = RecurringAlert['kind'];
export type CalendarEntry = ApiPaths['/spending/recurring/calendar']['get']['responses']['200']['content']['application/json'][number];
export type UpdateSeriesBody = NonNullable<ApiPaths['/spending/recurring/{id}']['patch']['requestBody']>['content']['application/json'];
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

export const RECURRING_VALUE_MODES = ['fixed', 'variable'] as const satisfies readonly RecurringValueMode[];

export const RECURRING_STATUS = {
    suggested: 'suggested',
    confirmed: 'confirmed',
    dismissed: 'dismissed',
    stopped: 'stopped'
} as const satisfies Record<string, RecurringSeriesView['status']>;

export const RECURRING_ALERT_KIND = {
    priceIncrease: 'price_increase',
    duplicateCharge: 'duplicate_charge',
    duplicateAccount: 'duplicate_account',
    trialConverted: 'trial_converted',
    returned: 'returned',
    stillUsing: 'still_using',
    renewal: 'renewal'
} as const satisfies Record<string, RecurringAlertKind>;

export const CALENDAR_DAYS: number = 60;
export const CREDIT_CARD_KIND: string = 'credit_card';

export const RECURRING_CURRENCY: string = 'BRL';
export const SUBSCRIPTIONS_CATEGORY_KEY: string = 'subscriptions';
