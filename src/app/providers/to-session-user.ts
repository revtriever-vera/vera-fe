import type { SessionUser } from './session-context';

export interface IdentityFields {
    readonly userId: string;
    readonly companyId: string;
    readonly name: string;
    readonly email: string;
    readonly role: SessionUser['role'];
    readonly locale: SessionUser['locale'];
    readonly preferredLocale: SessionUser['preferredLocale'];
    readonly loginProvider: SessionUser['loginProvider'];
    readonly companyName: string;
}

export function toSessionUser(identity: IdentityFields): SessionUser {
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
