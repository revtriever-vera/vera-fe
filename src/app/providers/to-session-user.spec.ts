import { describe, expect, it } from 'vitest';
import type { SessionUser } from './session-context';
import { toSessionUser, type IdentityFields } from './to-session-user';

describe('toSessionUser', () => {
    it('renomeia userId para id e preserva os demais campos', () => {
        const identity: IdentityFields = {
            userId: 'u1',
            companyId: 'c1',
            name: 'Nome',
            email: 'a@example.com',
            role: 'owner',
            locale: 'pt-BR',
            preferredLocale: null,
            loginProvider: 'google',
            companyName: 'Empresa'
        };

        const user: SessionUser = toSessionUser(identity);

        expect(user).toEqual({
            id: 'u1',
            companyId: 'c1',
            name: 'Nome',
            email: 'a@example.com',
            role: 'owner',
            locale: 'pt-BR',
            preferredLocale: null,
            loginProvider: 'google',
            companyName: 'Empresa'
        });
    });
});
