import { apiClient, unwrap } from '@/shared/lib/api/client';
import { tokenStore } from '@/shared/lib/api/token-store';
import type { SessionUser } from '@/app/providers/session-context';
import type { LoginSession, SessionIdentity } from '../types';
import { toSessionUser } from '@/app/providers/to-session-user';

export interface CompletedSignIn {
    readonly accessToken: string;
    readonly user: SessionUser;
    readonly isNewAccount: boolean;
}

export async function completeSignIn(session: LoginSession): Promise<CompletedSignIn> {
    tokenStore.set(session.accessToken);
    try {
        const identity: SessionIdentity = unwrap<SessionIdentity>(await apiClient.GET('/auth/me'));
        return { accessToken: session.accessToken, user: toSessionUser(identity), isNewAccount: session.isNewAccount };
    } catch (error: unknown) {
        tokenStore.set(null);
        throw error;
    }
}
