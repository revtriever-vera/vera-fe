import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/lib/api/api-error';
import { i18n } from '@/shared/lib/i18n';
import ptBRAuth from '@/shared/lib/i18n/resources/pt-BR/auth.json';
import enAuth from '@/shared/lib/i18n/resources/en/auth.json';
import { problem } from '../../../../test/fixtures/auth';
import { authErrorMessage } from './auth-error-message';

const CODES: Readonly<Record<string, { key: keyof typeof ptBRAuth; status: number }>> = {
    'identity.invalid_google_token': { key: 'errorInvalidGoogleToken', status: 401 },
    'identity.invalid_facebook_token': { key: 'errorInvalidFacebookToken', status: 401 },
    'identity.provider_disabled': { key: 'errorProviderDisabled', status: 503 },
    'identity.provider_unavailable': { key: 'errorProviderUnavailable', status: 502 },
    'identity.email_not_provided': { key: 'errorEmailNotProvided', status: 422 },
    'identity.email_in_use': { key: 'errorEmailInUse', status: 409 },
    'core.too_many_attempts': { key: 'errorTooManyAttempts', status: 429 }
};

function errorOf(type: string, status: number): ApiError {
    return new ApiError(problem(type, status));
}

describe('authErrorMessage', () => {
    it.each(Object.entries(CODES))('translates %s in pt-BR', (code: string, { key, status }): void => {
        const t: TFunction<'auth'> = i18n.getFixedT('pt-BR', 'auth');

        expect(authErrorMessage(t, errorOf(code, status))).toBe(ptBRAuth[key]);
    });

    it.each(Object.entries(CODES))('translates %s in en', (code: string, { key, status }): void => {
        const t: TFunction<'auth'> = i18n.getFixedT('en', 'auth');

        expect(authErrorMessage(t, errorOf(code, status))).toBe(enAuth[key]);
    });

    it('falls back to the generic message for an unknown code', () => {
        const t: TFunction<'auth'> = i18n.getFixedT('pt-BR', 'auth');

        expect(authErrorMessage(t, errorOf('identity.something_new', 400))).toBe(ptBRAuth.errorGeneric);
    });

    it('falls back to the generic message for a failure that is not an ApiError', () => {
        const t: TFunction<'auth'> = i18n.getFixedT('en', 'auth');

        expect(authErrorMessage(t, new TypeError('Failed to fetch'))).toBe(enAuth.errorGeneric);
    });

    it('never shows the technical detail of the problem', () => {
        const t: TFunction<'auth'> = i18n.getFixedT('pt-BR', 'auth');

        expect(authErrorMessage(t, errorOf('identity.email_in_use', 409))).not.toContain('detalhe técnico');
    });
});
