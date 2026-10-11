import { useState } from 'react';
import type { UseMutationResult } from '@tanstack/react-query';
import { useSession } from '@/app/providers/session-provider';
import type { CompletedSignIn } from '../api/complete-sign-in';
import { useFacebookLogin } from '../api/use-facebook-login.mutation';
import { useGoogleLogin } from '../api/use-google-login.mutation';

export interface SocialLogin {
    readonly error: Error | null;
    readonly pending: boolean;
    readonly loginWithGoogle: (idToken: string) => void;
    readonly loginWithFacebook: (accessToken: string) => void;
}

export function useSocialLogin(): SocialLogin {
    const { signIn } = useSession();
    const google: UseMutationResult<CompletedSignIn, Error, string> = useGoogleLogin();
    const facebook: UseMutationResult<CompletedSignIn, Error, string> = useFacebookLogin();
    const [error, setError] = useState<Error | null>(null);
    const callbacks: { onSuccess: (completed: CompletedSignIn) => void; onError: (failure: Error) => void } = {
        onSuccess: (completed: CompletedSignIn): void => {
            signIn(completed.accessToken, completed.user);
        },
        onError: (failure: Error): void => {
            setError(failure);
        }
    };
    return {
        error,
        pending: google.isPending || facebook.isPending,
        loginWithGoogle: (idToken: string): void => {
            setError(null);
            google.mutate(idToken, callbacks);
        },
        loginWithFacebook: (accessToken: string): void => {
            setError(null);
            facebook.mutate(accessToken, callbacks);
        }
    };
}
