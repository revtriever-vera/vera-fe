import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { i18n } from '@/shared/lib/i18n';
import { ApiError } from '@/shared/lib/api/api-error';
import { openAccountErrorMessage } from './open-account-error-message';

const t: TFunction<'admin'> = i18n.getFixedT('pt-BR', 'admin');

function apiError(type: string, status: number): ApiError {
    return new ApiError({ type, title: 'Error', status, detail: 'x', requestId: null });
}

describe('openAccountErrorMessage', () => {
    it('maps the known codes', () => {
        expect(openAccountErrorMessage(t, apiError('platform.account_not_found', 404))).toBe('Essa conta não existe mais.');
        expect(openAccountErrorMessage(t, apiError('identity.platform_only', 403))).toBe('Esta conta não tem acesso ao admin.');
        expect(openAccountErrorMessage(t, apiError('core.validation_failed', 400))).toBe(
            'Confira o motivo e o que abrir, e tente de novo.'
        );
    });

    it('falls back for an unknown code and for a network failure', () => {
        const generic: string = 'Não foi possível concluir. Tente novamente em instantes.';
        expect(openAccountErrorMessage(t, apiError('core.internal', 500))).toBe(generic);
        expect(openAccountErrorMessage(t, new TypeError('network'))).toBe(generic);
    });
});
