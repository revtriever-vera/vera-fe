import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { ApiError } from '@/shared/lib/api/api-error';
import { i18n } from '@/shared/lib/i18n';
import { signupLinkErrorMessage } from './signup-link-error-message';

const t: TFunction<'admin'> = i18n.getFixedT('pt-BR', 'admin');

function problem(type: string, status: number, meta?: Record<string, unknown>): ApiError {
    return new ApiError({ type, title: 'x', status, detail: 'detail', requestId: null, ...(meta === undefined ? {} : { meta }) });
}

describe('signupLinkErrorMessage', () => {
    it('explains the reason an offer was refused', () => {
        expect(signupLinkErrorMessage(t, problem('signup_links.invalid_offer', 422, { reason: 'no_card_requires_expiry' }))).toBe(
            'Sem cartão exige uma validade.'
        );
    });

    it('falls back to a generic offer message for an unknown reason', () => {
        expect(signupLinkErrorMessage(t, problem('signup_links.invalid_offer', 422, { reason: 'new_rule' }))).toBe(
            'A oferta não cumpre as regras da plataforma.'
        );
    });

    it('maps the link and platform codes', () => {
        expect(signupLinkErrorMessage(t, problem('signup_links.not_found', 404))).toBe('Este link não existe mais.');
        expect(signupLinkErrorMessage(t, problem('identity.platform_only', 403))).toBe('Esta conta não tem acesso ao admin.');
    });

    it('falls back to the generic message for an unknown code and for a network failure', () => {
        expect(signupLinkErrorMessage(t, problem('core.boom', 500))).toBe('Não foi possível concluir. Tente novamente em instantes.');
        expect(signupLinkErrorMessage(t, new Error('offline'))).toBe('Não foi possível concluir. Tente novamente em instantes.');
    });
});
