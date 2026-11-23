import { useMutation, useQueryClient, type QueryClient, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrapEmpty } from '@/shared/lib/api/client';
import { whatsappKeys } from './whatsapp-keys';

export function useUnlink(): UseMutationResult<void, Error, void> {
    const queryClient: QueryClient = useQueryClient();
    return useMutation({
        mutationFn: async (): Promise<void> => {
            unwrapEmpty(await apiClient.DELETE('/whatsapp/link'));
        },
        onSuccess: async (): Promise<void> => {
            await queryClient.invalidateQueries({ queryKey: whatsappKeys.all });
        }
    });
}
