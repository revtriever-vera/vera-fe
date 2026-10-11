import type { SessionUser } from '@/app/providers/session-context';
import type { LoginSession, SessionIdentity } from '@/features/auth/types';

export function sessionIdentity(overrides: Partial<SessionIdentity> = {}): SessionIdentity {
    return {
        userId: 'user-1',
        companyId: 'company-1',
        name: 'Maria Teste',
        email: 'maria@example.test',
        role: 'owner',
        locale: 'pt-BR',
        preferredLocale: null,
        loginProvider: 'google',
        companyName: 'Maria Teste',
        ...overrides
    };
}

export function sessionUser(overrides: Partial<SessionUser> = {}): SessionUser {
    return {
        id: 'user-1',
        companyId: 'company-1',
        name: 'Maria Teste',
        email: 'maria@example.test',
        role: 'owner',
        locale: 'pt-BR',
        preferredLocale: null,
        loginProvider: 'google',
        companyName: 'Maria Teste',
        ...overrides
    };
}

export function loginSession(overrides: Partial<LoginSession> = {}): LoginSession {
    return {
        outcome: 'authenticated',
        accessToken: 'access-token-1',
        user: { id: 'user-1', name: 'Maria Teste', email: 'maria@example.test', role: 'owner', companyId: 'company-1' },
        isNewAccount: true,
        ...overrides
    };
}

export function problem(type: string, status: number): { type: string; title: string; status: number; detail: string; requestId: string } {
    return { type, title: type, status, detail: 'detalhe técnico que não vai para a tela', requestId: 'req-1' };
}
