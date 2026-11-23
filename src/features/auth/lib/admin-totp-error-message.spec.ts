import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { i18n } from '@/shared/lib/i18n';
import { ApiError } from '@/shared/lib/api/api-error';
import { adminTotpErrorMessage, requiresNewGoogleLogin } from './admin-totp-error-message';

function apiError(type: string, status: number): ApiError {
    return ApiError.fromUnknown({ type, title: type, status }, status);
}

describe('adminTotpErrorMessage', () => {
    const t: TFunction<'admin'> = i18n.getFixedT('pt-BR', 'admin');

    it('names the wrong code and the lockout', () => {
        expect(adminTotpErrorMessage(t, apiError('identity.invalid_totp_code', 401))).toBe('Código incorreto. Confira e tente de novo.');
        expect(adminTotpErrorMessage(t, apiError('core.too_many_attempts', 429))).toBe('Muitas tentativas. Tente de novo em 15 minutos.');
    });

    it('names the steps that need a new Google login', () => {
        expect(adminTotpErrorMessage(t, apiError('identity.invalid_totp_token', 401))).toBe(
            'O tempo para confirmar acabou. Entre com o Google de novo.'
        );
        expect(adminTotpErrorMessage(t, apiError('identity.totp_already_active', 409))).toBe(
            'Esta conta já tem um autenticador. Entre com o Google de novo.'
        );
        expect(adminTotpErrorMessage(t, apiError('identity.totp_not_enrolled', 409))).toBe(
            'O cadastro do autenticador não foi iniciado. Entre com o Google de novo.'
        );
    });

    it('falls back to the login messages', () => {
        expect(adminTotpErrorMessage(t, apiError('identity.platform_only', 403))).toBe('Esta conta não tem acesso ao admin.');
        expect(adminTotpErrorMessage(t, new Error('boom'))).toBe('Não foi possível entrar. Tente novamente em instantes.');
    });
});

describe('requiresNewGoogleLogin', () => {
    it('is true only for the errors that kill the token', () => {
        expect(requiresNewGoogleLogin(apiError('identity.invalid_totp_token', 401))).toBe(true);
        expect(requiresNewGoogleLogin(apiError('identity.invalid_totp_code', 401))).toBe(false);
        expect(requiresNewGoogleLogin(new Error('boom'))).toBe(false);
    });
});
