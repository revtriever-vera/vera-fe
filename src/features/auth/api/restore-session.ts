import { apiClient, refreshSession, unwrap } from '@/shared/lib/api/client';
import { tokenStore } from '@/shared/lib/api/token-store';
import type { SessionUser } from '@/app/providers/session-context';
import type { SessionIdentity } from '../types';
import { toSessionUser } from '@/app/providers/to-session-user';

export async function restoreSession(): Promise<SessionUser | null> {
    const renewed: boolean = await refreshSession();
    if (!renewed) {
        return null;
    }
    try {
        const identity: SessionIdentity = unwrap<SessionIdentity>(await apiClient.GET('/auth/me'));
        return toSessionUser(identity);
    } catch {
        tokenStore.set(null);
        return null;
    }
}
