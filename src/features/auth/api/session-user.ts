import type { SessionUser } from '@/app/providers/session-context';
import type { SessionIdentity } from '../types';

export function toSessionUser(identity: SessionIdentity): SessionUser {
    return {
        id: identity.userId,
        companyId: identity.companyId,
        name: identity.name,
        email: identity.email,
        role: identity.role,
        locale: identity.locale,
        preferredLocale: identity.preferredLocale,
        loginProvider: identity.loginProvider,
        companyName: identity.companyName
    };
}
