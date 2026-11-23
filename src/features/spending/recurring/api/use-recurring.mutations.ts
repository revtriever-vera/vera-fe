import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { invalidateSpending } from '../../api/invalidate-spending';
import type { ConfirmSeriesBody, ConfirmSeriesResult, RecurringSeriesRecord } from '../types';
import { recurringKeys } from './recurring-keys';

export interface ConfirmSeriesInput {
    readonly id: string;
    readonly body: ConfirmSeriesBody;
}

async function refresh(queryClient: QueryClient): Promise<void> {
    await queryClient.invalidateQueries({ queryKey: recurringKeys.all });
}

export function useConfirmSeries(): UseMutationResult<ConfirmSeriesResult, ApiError, ConfirmSeriesInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, body }: ConfirmSeriesInput): Promise<ConfirmSeriesResult> =>
            unwrap(await apiClient.POST('/spending/recurring/{id}/confirm', { params: { path: { id } }, body })),
        onSuccess: async (): Promise<void> => {
            await Promise.all([refresh(queryClient), invalidateSpending(queryClient)]);
        }
    });
}

export function useDismissSeries(): UseMutationResult<RecurringSeriesRecord, ApiError, string> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string): Promise<RecurringSeriesRecord> =>
            unwrap(await apiClient.POST('/spending/recurring/{id}/dismiss', { params: { path: { id } } })),
        onSuccess: async (): Promise<void> => {
            await refresh(queryClient);
        }
    });
}

export function useRestoreSeries(): UseMutationResult<RecurringSeriesRecord, ApiError, string> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string): Promise<RecurringSeriesRecord> =>
            unwrap(await apiClient.POST('/spending/recurring/{id}/restore', { params: { path: { id } } })),
        onSuccess: async (): Promise<void> => {
            await refresh(queryClient);
        }
    });
}

export function useSnoozeSeries(): UseMutationResult<RecurringSeriesRecord, ApiError, string> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string): Promise<RecurringSeriesRecord> =>
            unwrap(await apiClient.POST('/spending/recurring/{id}/snooze', { params: { path: { id } } })),
        onSuccess: async (): Promise<void> => {
            await refresh(queryClient);
        }
    });
}

export function useStopSeries(): UseMutationResult<RecurringSeriesRecord, ApiError, string> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string): Promise<RecurringSeriesRecord> =>
            unwrap(await apiClient.POST('/spending/recurring/{id}/stop', { params: { path: { id } } })),
        onSuccess: async (): Promise<void> => {
            await refresh(queryClient);
        }
    });
}
