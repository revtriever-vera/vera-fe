import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import type { ApiError } from '@/shared/lib/api/api-error';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { NoticePreference, UpdateNoticeBody } from '../types';
import { noticesKeys } from './notices-keys';

export function useUpdateNoticePreference(): UseMutationResult<NoticePreference, ApiError, UpdateNoticeBody> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: UpdateNoticeBody): Promise<NoticePreference> =>
            unwrap(await apiClient.PATCH('/notifications/preferences', { body })),
        onSuccess: async (): Promise<void> => {
            await queryClient.invalidateQueries({ queryKey: noticesKeys.preferences() });
        }
    });
}
