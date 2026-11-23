import type { UseMutationResult } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate, type UseNavigateResult } from '@tanstack/react-router';
import { useSession } from '@/app/providers/session-provider';
import type { CompletedSignIn } from '../api/complete-sign-in';
import { useAdminLogin } from '../api/use-admin-login.mutation';

export interface AdminSignIn {
    readonly error: Error | null;
    readonly pending: boolean;
    readonly loginWithGoogle: (idToken: string) => void;
}

export function useAdminSignIn(): AdminSignIn {
    const { signIn } = useSession();
    const navigate: UseNavigateResult<string> = useNavigate();
    const login: UseMutationResult<CompletedSignIn, Error, string> = useAdminLogin();
    const [error, setError] = useState<Error | null>(null);
    return {
        error,
        pending: login.isPending,
        loginWithGoogle: (idToken: string): void => {
            setError(null);
            login.mutate(idToken, {
                onSuccess: (completed: CompletedSignIn): void => {
                    signIn(completed.accessToken, completed.user);
                    void navigate({ to: '/admin/audit', replace: true });
                },
                onError: setError
            });
        }
    };
}
