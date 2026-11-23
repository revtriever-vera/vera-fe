import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { apiClient, unwrap } from '@/shared/lib/api/client';
import { authKeys } from './auth-keys';
import { completeSignIn, type CompletedSignIn } from './complete-sign-in';
import type { TotpActivation, TotpVerification } from '../types';

export interface TotpVerifyInput {
    readonly challengeToken: string;
    readonly code: string;
}

export interface TotpActivateInput {
    readonly setupToken: string;
    readonly code: string;
}

export interface ActivatedSignIn {
    readonly completed: CompletedSignIn;
    readonly recoveryCodes: readonly string[];
}

export function useTotpVerify(): UseMutationResult<CompletedSignIn, Error, TotpVerifyInput> {
    return useMutation({
        mutationKey: authKeys.totp('verify'),
        mutationFn: async (input: TotpVerifyInput): Promise<CompletedSignIn> => {
            const verification: TotpVerification = unwrap<TotpVerification>(await apiClient.POST('/auth/totp/verify', { body: input }));
            return completeSignIn(verification);
        }
    });
}

export function useTotpActivate(): UseMutationResult<ActivatedSignIn, Error, TotpActivateInput> {
    return useMutation({
        mutationKey: authKeys.totp('activate'),
        mutationFn: async (input: TotpActivateInput): Promise<ActivatedSignIn> => {
            const activation: TotpActivation = unwrap<TotpActivation>(await apiClient.POST('/auth/totp/activate', { body: input }));
            return { completed: await completeSignIn(activation), recoveryCodes: activation.recoveryCodes };
        }
    });
}
