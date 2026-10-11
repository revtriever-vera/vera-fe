import type { SessionUser } from '@/app/providers/session-context';
import type { AccountIdentity } from '../types';

export function identityToSessionUser(identity: AccountIdentity): SessionUser {
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
