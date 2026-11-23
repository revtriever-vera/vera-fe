import { apiClient, unwrap } from '@/shared/lib/api/client';
import { tokenStore } from '@/shared/lib/api/token-store';
import type { SessionUser } from '@/app/providers/session-context';
import type { OfferOutcome, SessionIdentity } from '../types';
import { toSessionUser } from '@/app/providers/to-session-user';

export interface CompletedSignIn {
    readonly accessToken: string;
    readonly user: SessionUser;
    readonly isNewAccount: boolean;
    readonly offer: OfferOutcome | null;
}

export interface SignInTokens {
    readonly accessToken: string;
    readonly isNewAccount?: boolean;
    readonly offer?: OfferOutcome | null;
}

export async function completeSignIn(session: SignInTokens): Promise<CompletedSignIn> {
    tokenStore.set(session.accessToken);
    try {
        const identity: SessionIdentity = unwrap<SessionIdentity>(await apiClient.GET('/auth/me'));
        return {
            accessToken: session.accessToken,
            user: toSessionUser(identity),
            isNewAccount: session.isNewAccount ?? false,
            offer: session.offer ?? null
        };
    } catch (error: unknown) {
        tokenStore.set(null);
        throw error;
    }
}
