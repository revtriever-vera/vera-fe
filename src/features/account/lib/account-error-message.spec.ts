import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/lib/api/api-error';
import { i18n } from '@/shared/lib/i18n';
import enAccount from '@/shared/lib/i18n/resources/en/account.json';
import ptBRAccount from '@/shared/lib/i18n/resources/pt-BR/account.json';
import { problem } from '../../../../test/fixtures/auth';
import { accountErrorMessage, type AccountErrorScope } from './account-error-message';

const CODES: readonly (readonly [string, number, AccountErrorScope, keyof typeof ptBRAccount])[] = [
    ['identity.confirmation_mismatch', 422, 'delete', 'errorConfirmationMismatch'],
    ['identity.forbidden', 403, 'delete', 'errorForbidden'],
    ['core.too_many_attempts', 429, 'delete', 'errorTooManyAttempts'],
    ['identity.erasure_failed', 500, 'delete', 'errorErasureFailed'],
    ['identity.export_failed', 500, 'export', 'errorExportFailed'],
    ['core.too_many_attempts', 429, 'export', 'errorExportRateLimited'],
    ['something.unknown', 500, 'delete', 'errorDeleteGeneric'],
    ['something.unknown', 500, 'export', 'errorExportGeneric'],
    ['something.unknown', 500, 'language', 'errorLanguageGeneric']
];

describe('accountErrorMessage', () => {
    it.each(CODES)('translates %s (%i, %s) in pt-BR and en', (type, status, scope, key): void => {
        const ptT: TFunction<'account'> = i18n.getFixedT('pt-BR', 'account');
        const enT: TFunction<'account'> = i18n.getFixedT('en', 'account');
        const error: ApiError = new ApiError(problem(type, status));

        expect(accountErrorMessage(ptT, error, scope)).toBe(ptBRAccount[key]);
        expect(accountErrorMessage(enT, error, scope)).toBe(enAccount[key]);
    });

    it('treats any 429 as the rate limit', () => {
        const t: TFunction<'account'> = i18n.getFixedT('pt-BR', 'account');

        expect(accountErrorMessage(t, new ApiError(problem('about:blank', 429)), 'export')).toBe(ptBRAccount.errorExportRateLimited);
    });

    it('falls back to the generic message for a network failure', () => {
        const t: TFunction<'account'> = i18n.getFixedT('pt-BR', 'account');

        expect(accountErrorMessage(t, new TypeError('Failed to fetch'), 'export')).toBe(ptBRAccount.errorExportGeneric);
    });

    it('never shows the technical detail', () => {
        const t: TFunction<'account'> = i18n.getFixedT('pt-BR', 'account');

        expect(accountErrorMessage(t, new ApiError(problem('identity.erasure_failed', 500)), 'delete')).not.toContain('detalhe técnico');
    });
});
