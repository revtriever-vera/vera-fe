import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { IssueCodeBody, IssuedCode } from '../types';
import { whatsappKeys } from './whatsapp-keys';

export function useLinkCode(): UseMutationResult<IssuedCode, Error, IssueCodeBody> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (body: IssueCodeBody): Promise<IssuedCode> => unwrap(await apiClient.POST('/whatsapp/link/code', { body })),
        onSuccess: async (): Promise<void> => {
            await queryClient.invalidateQueries({ queryKey: whatsappKeys.link() });
        }
    });
}
