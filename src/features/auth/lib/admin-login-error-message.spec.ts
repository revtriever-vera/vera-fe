import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import { ApiError } from '@/shared/lib/api/api-error';
import { adminLoginErrorMessage } from './admin-login-error-message';

function apiError(type: string, status: number): ApiError {
    return ApiError.fromUnknown({ type, title: type, status }, status);
}

describe('adminLoginErrorMessage', () => {
    const t: TFunction<'admin'> = i18n.getFixedT('pt-BR', 'admin');

    it('names the refusal of the platform', () => {
        expect(adminLoginErrorMessage(t, apiError('identity.platform_only', 403))).toBe('Esta conta não tem acesso ao admin.');
        expect(adminLoginErrorMessage(t, apiError('identity.platform_disabled', 404))).toBe(
            'O admin não está disponível nesta instalação.'
        );
    });

    it('falls back to the generic message', () => {
        expect(adminLoginErrorMessage(t, apiError('core.unknown', 500))).toBe('Não foi possível entrar. Tente novamente em instantes.');
        expect(adminLoginErrorMessage(t, new Error('boom'))).toBe('Não foi possível entrar. Tente novamente em instantes.');
    });
});
