import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslation, type UseTranslationResponse } from 'react-i18next';
import { useToast, type ToastApi } from '@/app/providers/toast-provider';
import type { ApiError } from '@/shared/lib/api/api-error';
import { useMarkAlertSeen, useRemoveCharge, type RemoveChargeInput } from '../api/use-recurring.mutations';
import { recurringErrorMessage } from './recurring-error-message';

export interface SeenAction {
    readonly pending: boolean;
    readonly run: (alertId: string) => void;
}

export interface RemoveChargeAction {
    readonly pending: boolean;
    readonly run: (input: RemoveChargeInput, seriesName: string, onDone: () => void) => void;
}

export function useSeenAction(): SeenAction {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const toast: ToastApi = useToast();
    const mutation: UseMutationResult<void, ApiError, string> = useMarkAlertSeen();
    return {
        pending: mutation.isPending,
        run: (alertId: string): void => {
            mutation.mutate(alertId, {
                onSuccess: (): void => {
                    toast.show({ tone: 'positive', title: t('toast.seen') });
                },
                onError: (error: ApiError): void => {
                    toast.show({ tone: 'critical', title: recurringErrorMessage(t, error) });
                }
            });
        }
    };
}

export function useRemoveChargeAction(): RemoveChargeAction {
    const { t }: UseTranslationResponse<'spendingRecurring', undefined> = useTranslation('spendingRecurring');
    const toast: ToastApi = useToast();
    const mutation: UseMutationResult<void, ApiError, RemoveChargeInput> = useRemoveCharge();
    return {
        pending: mutation.isPending,
        run: (input: RemoveChargeInput, seriesName: string, onDone: () => void): void => {
            mutation.mutate(input, {
                onSuccess: (): void => {
                    toast.show({ tone: 'positive', title: t('toast.chargeRemoved', { name: seriesName }) });
                    onDone();
                },
                onError: (error: ApiError): void => {
                    toast.show({ tone: 'critical', title: recurringErrorMessage(t, error) });
                    onDone();
                }
            });
        }
    };
}
