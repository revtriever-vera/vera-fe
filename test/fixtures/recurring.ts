import type { CalendarEntry, RecurringAlert, RecurringOverview, RecurringSeriesView } from '@/features/spending/recurring/types';

export const SERIES_ID_NETFLIX: string = '00000000-0000-4000-8000-0000000000d1';
export const SERIES_ID_LIGHT: string = '00000000-0000-4000-8000-0000000000d2';
export const SERIES_ID_GYM: string = '00000000-0000-4000-8000-0000000000d3';
export const ACCOUNT_ID_CARD: string = '00000000-0000-4000-8000-0000000000e1';

export function recurringSeries(overrides: Partial<RecurringSeriesView> = {}): RecurringSeriesView {
    return {
        id: SERIES_ID_NETFLIX,
        name: 'Netflix',
        merchantKey: 'netflix',
        accountId: ACCOUNT_ID_CARD,
        cadence: 'monthly',
        valueMode: 'fixed',
        kind: 'subscription',
        status: 'suggested',
        origin: 'detected',
        typicalAmountMinor: 5590,
        minAmountMinor: 5590,
        maxAmountMinor: 5590,
        expectedDay: 12,
        dayChange: null,
        knownSubscription: true,
        firstDate: '2026-06-12',
        lastDate: '2026-11-12',
        snoozedUntil: null,
        confirmedAt: null,
        dismissedAt: null,
        stoppedAt: null,
        stoppedBy: null,
        createdAt: '2026-11-13T09:00:00.000Z',
        updatedAt: '2026-11-13T09:00:00.000Z',
        accountName: 'Cartão Nubank',
        institutionName: 'Nubank',
        accountKind: 'credit_card',
        nextDate: '2026-12-12',
        monthlyEquivalentMinor: 5590,
        lastCharges: [
            { transactionId: '00000000-0000-4000-8000-0000000000f1', date: '2026-11-12', amountMinor: 5590 },
            { transactionId: '00000000-0000-4000-8000-0000000000f2', date: '2026-10-12', amountMinor: 5590 }
        ],
        ...overrides
    };
}

export function confirmedLight(overrides: Partial<RecurringSeriesView> = {}): RecurringSeriesView {
    return recurringSeries({
        id: SERIES_ID_LIGHT,
        name: 'Enel',
        merchantKey: 'enel',
        valueMode: 'variable',
        kind: 'bill',
        status: 'confirmed',
        typicalAmountMinor: 18200,
        minAmountMinor: 15000,
        maxAmountMinor: 21000,
        expectedDay: 8,
        knownSubscription: false,
        confirmedAt: '2026-11-01T09:00:00.000Z',
        accountName: 'Conta Itaú',
        institutionName: 'Itaú',
        accountKind: 'checking',
        monthlyEquivalentMinor: 18200,
        lastCharges: [],
        ...overrides
    });
}

export function emptyRecurring(): RecurringOverview {
    return {
        totals: {
            monthlyMinor: 0,
            yearlyMinor: 0,
            byKind: { subscription: 0, bill: 0, other: 0 },
            suggestions: { count: 0, monthlyMinor: 0 }
        },
        review: [],
        confirmed: [],
        stopped: [],
        dismissed: [],
        alerts: []
    };
}

export function recurringOverview(overrides: Partial<RecurringOverview> = {}): RecurringOverview {
    return {
        totals: {
            monthlyMinor: 18200,
            yearlyMinor: 218400,
            byKind: { subscription: 0, bill: 18200, other: 0 },
            suggestions: { count: 1, monthlyMinor: 5590 }
        },
        review: [recurringSeries()],
        confirmed: [confirmedLight()],
        stopped: [],
        dismissed: [],
        alerts: [],
        ...overrides
    };
}

export function calendarEntry(overrides: Partial<CalendarEntry> = {}): CalendarEntry {
    return {
        date: '2026-11-25',
        state: 'upcoming',
        seriesId: SERIES_ID_NETFLIX,
        name: 'Netflix',
        amountMinor: 5590,
        isEstimate: false,
        isSuggestion: false,
        accountId: ACCOUNT_ID_CARD,
        accountName: 'Cartão Nubank',
        institutionName: 'Nubank',
        accountKind: 'credit_card',
        ...overrides
    };
}

export function recurringAlert(overrides: Partial<RecurringAlert> = {}): RecurringAlert {
    return {
        id: '00000000-0000-4000-8000-0000000000a1',
        kind: 'price_increase',
        seriesId: SERIES_ID_LIGHT,
        seriesName: 'Enel',
        occurredOn: '2026-10-08',
        canMarkSeen: true,
        data: { fromAmountMinor: 4490, toAmountMinor: 5590, percent: 24.5, chargeDate: '2026-10-08' },
        ...overrides
    };
}
