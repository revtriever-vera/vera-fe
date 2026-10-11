import { createContext, use, useCallback, useEffect, useMemo, useState, type Context, type ReactElement, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { restoreSession } from '@/features/auth/api/restore-session';
import { revokeSession } from '@/features/auth/api/revoke-session';
import { tokenStore } from '@/shared/lib/api/token-store';
import type { SessionContext as SessionState, SessionUser } from './session-context';

const SessionContext: Context<SessionState | null> = createContext<SessionState | null>(null);

function useRestoredSession(setUser: (user: SessionUser | null) => void): boolean {
    const [isRestoring, setIsRestoring] = useState<boolean>(true);
    useEffect((): (() => void) => {
        let active: boolean = true;
        void restoreSession()
            .catch((): null => null)
            .then((restored: SessionUser | null): void => {
                if (!active) {
                    return;
                }
                setUser(restored);
                setIsRestoring(false);
            });
        return (): void => {
            active = false;
        };
    }, [setUser]);
    return isRestoring;
}

type SessionActions = Pick<SessionState, 'signIn' | 'signOut'>;

function useSessionActions(setUser: (next: SessionUser | null) => void): SessionActions {
    const queryClient: QueryClient = useQueryClient();

    const commit: (accessToken: string | null, nextUser: SessionUser | null) => void = useCallback(
        (accessToken: string | null, nextUser: SessionUser | null): void => {
            tokenStore.set(accessToken);
            flushSync((): void => {
                setUser(nextUser);
            });
        },
        [setUser]
    );

    const signIn: SessionState['signIn'] = useCallback(
        (accessToken: string, nextUser: SessionUser): void => {
            queryClient.removeQueries();
            commit(accessToken, nextUser);
        },
        [commit, queryClient]
    );

    const signOut: SessionState['signOut'] = useCallback((): void => {
        void revokeSession();
        commit(null, null);
        queryClient.removeQueries();
    }, [commit, queryClient]);

    return { signIn, signOut };
}

export function SessionProvider({ children }: { readonly children: ReactNode }): ReactElement {
    const [user, setUser] = useState<SessionUser | null>(null);
    const isRestoring: boolean = useRestoredSession(setUser);

    useEffect(
        (): (() => void) =>
            tokenStore.subscribe((token: string | null): void => {
                if (token === null) {
                    setUser(null);
                }
            }),
        []
    );

    const { signIn, signOut } = useSessionActions(setUser);

    const value: SessionState = useMemo<SessionState>(
        (): SessionState => ({ user, isAuthenticated: user !== null, isRestoring, signIn, signOut }),
        [user, isRestoring, signIn, signOut]
    );

    return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession(): SessionState {
    const context: SessionState | null = use(SessionContext);
    if (context === null) {
        throw new Error('useSession must be used inside SessionProvider');
    }
    return context;
}
