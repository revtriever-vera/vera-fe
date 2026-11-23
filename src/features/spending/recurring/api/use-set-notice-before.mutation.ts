import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { NoticeBeforeChoice } from '../types';
import { recurringKeys } from './recurring-keys';

export interface SetNoticeBeforeInput {
    readonly seriesId: string;
    readonly enabled: boolean;
}

export function useSetNoticeBefore(): UseMutationResult<NoticeBeforeChoice, ApiError, SetNoticeBeforeInput> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ seriesId, enabled }: SetNoticeBeforeInput): Promise<NoticeBeforeChoice> =>
            unwrap(
                await apiClient.PUT('/spending/recurring/{id}/notice-before', { params: { path: { id: seriesId } }, body: { enabled } })
            ),
        onSuccess: async (): Promise<void> => {
            await queryClient.invalidateQueries({ queryKey: recurringKeys.noticeBefore() });
        }
    });
}
