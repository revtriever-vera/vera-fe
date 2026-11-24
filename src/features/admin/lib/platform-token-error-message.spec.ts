import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { ApiError } from '@/shared/lib/api/api-error';
import { i18n } from '@/shared/lib/i18n';
import { platformTokenErrorMessage } from './platform-token-error-message';

const t: TFunction<'admin'> = i18n.getFixedT('pt-BR', 'admin');

function problem(type: string, status: number): ApiError {
    return new ApiError({ type, title: 'x', status, detail: 'detail', requestId: null });
}

describe('platformTokenErrorMessage', () => {
    it('explains a token that no longer exists', () => {
        expect(platformTokenErrorMessage(t, problem('identity.platform_token_not_found', 404))).toBe('Este token não existe mais.');
    });

    it('explains an invalid payload', () => {
        expect(platformTokenErrorMessage(t, problem('validation_failed', 400))).toBe('Confira o nome e a validade do token.');
    });

    it('explains a session outside the platform', () => {
        expect(platformTokenErrorMessage(t, problem('identity.platform_only', 403))).toBe('Esta conta não tem acesso ao admin.');
    });

    it('falls back to the generic message for an unknown code and for a network failure', () => {
        const generic: string = 'Não foi possível concluir. Tente novamente em instantes.';
        expect(platformTokenErrorMessage(t, problem('other.code', 500))).toBe(generic);
        expect(platformTokenErrorMessage(t, new Error('offline'))).toBe(generic);
    });
});
