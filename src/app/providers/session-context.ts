import type { LoginProvider, SessionLocale, SessionRole } from '@/features/auth/types';

export interface SessionUser {
    readonly id: string;
    readonly companyId: string;
    readonly name: string;
    readonly email: string;
    readonly role: SessionRole;
    readonly locale: SessionLocale;
    readonly preferredLocale: SessionLocale | null;
    readonly loginProvider: LoginProvider;
    readonly companyName: string;
}

export interface SessionContext {
    readonly user: SessionUser | null;
    readonly isAuthenticated: boolean;
    readonly isRestoring: boolean;
    readonly signIn: (accessToken: string, user: SessionUser) => void;
    readonly signOut: () => void;
}
