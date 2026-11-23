import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import type { RedeemedOffer } from '../types';
import { authKeys } from './auth-keys';

export function useRedeemOffer(): UseMutationResult<RedeemedOffer, Error, string> {
    return useMutation({
        mutationKey: authKeys.login('redeem'),
        mutationFn: async (token: string): Promise<RedeemedOffer> =>
            unwrap<RedeemedOffer>(await apiClient.POST('/billing/offer/redeem', { body: { token } }))
    });
}
