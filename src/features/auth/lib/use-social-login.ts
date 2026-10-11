import { useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useSession } from '@/app/providers/session-provider';
import { ApiError } from '@/shared/lib/api/api-error';
import { track } from '@/shared/lib/analytics';
import type { AuthProviderName } from '@/shared/lib/analytics/events';
import type { CompletedSignIn } from '../api/complete-sign-in';
import { useFacebookLogin } from '../api/use-facebook-login.mutation';
import { useGoogleLogin } from '../api/use-google-login.mutation';

export interface SocialLogin {
    readonly error: Error | null;
    readonly pending: boolean;
    readonly loginWithGoogle: (idToken: string) => void;
    readonly loginWithFacebook: (accessToken: string) => void;
}

function failureCode(failure: Error): string {
    return failure instanceof ApiError ? failure.problem.type : 'unknown';
}

export function useSocialLogin(): SocialLogin {
    const { signIn } = useSession();
    const google: UseMutationResult<CompletedSignIn, Error, string> = useGoogleLogin();
    const facebook: UseMutationResult<CompletedSignIn, Error, string> = useFacebookLogin();
    const [error, setError] = useState<Error | null>(null);
    const callbacksFor = (
        provider: AuthProviderName
    ): { onSuccess: (completed: CompletedSignIn) => void; onError: (failure: Error) => void } => ({
        onSuccess: (completed: CompletedSignIn): void => {
            track('auth_authenticated', { provider, isNewAccount: completed.isNewAccount });
            signIn(completed.accessToken, completed.user);
        },
        onError: (failure: Error): void => {
            track('auth_failed', { provider, code: failureCode(failure) });
            setError(failure);
        }
    });
    return {
        error,
        pending: google.isPending || facebook.isPending,
        loginWithGoogle: (idToken: string): void => {
            setError(null);
            track('auth_started', { provider: 'google' });
            google.mutate(idToken, callbacksFor('google'));
        },
        loginWithFacebook: (accessToken: string): void => {
            setError(null);
            track('auth_started', { provider: 'facebook' });
            facebook.mutate(accessToken, callbacksFor('facebook'));
        }
    };
}
