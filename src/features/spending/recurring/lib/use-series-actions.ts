import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import type { UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { useDismissSeries, useRestoreSeries, useSnoozeSeries, useStopSeries } from '../api/use-recurring.mutations';
import type { RecurringSeriesRecord, RecurringSeriesView } from '../types';
import { recurringErrorMessage } from './recurring-error-message';

type SeriesMutation = UseMutationResult<RecurringSeriesRecord, ApiError, string>;
type ToastKey = 'toast.dismissed' | 'toast.snoozed' | 'toast.stopped' | 'toast.restored';

export interface SeriesAction {
    readonly pending: boolean;
    readonly run: (series: RecurringSeriesView) => void;
}

function useSeriesAction(mutation: SeriesMutation, doneKey: ToastKey): SeriesAction {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const toast: ToastApi = useToast();
    return {
        pending: mutation.isPending,
        run: (series: RecurringSeriesView): void => {
            mutation.mutate(series.id, {
                onSuccess: (): void => {
                    toast.show({ tone: 'positive', title: t(doneKey, { name: series.name }) });
                },
                onError: (error: ApiError): void => {
                    toast.show({ tone: 'critical', title: recurringErrorMessage(t, error) });
                }
            });
        }
    };
}

export function useDismissAction(): SeriesAction {
    return useSeriesAction(useDismissSeries(), 'toast.dismissed');
}

export function useSnoozeAction(): SeriesAction {
    return useSeriesAction(useSnoozeSeries(), 'toast.snoozed');
}

export function useStopAction(): SeriesAction {
    return useSeriesAction(useStopSeries(), 'toast.stopped');
}

export function useRestoreAction(): SeriesAction {
    return useSeriesAction(useRestoreSeries(), 'toast.restored');
}
