import { describe, expect, it } from 'vitest';
import type { TFunction } from 'i18next';
import { ApiError } from '@/shared/lib/api/api-error';
import { i18n } from '@/shared/lib/i18n';
import { offerErrorMessage, offerFailureCode, offerReasonMessage } from './offer-error-message';

const t: TFunction<'auth'> = i18n.getFixedT('pt-BR', 'auth');

function failure(type: string, status: number, meta?: Record<string, unknown>): ApiError {
    return new ApiError({ type, title: type, status, detail: 'detalhe', requestId: null, meta });
}

describe('offerErrorMessage', () => {
    it.each([
        ['signup_links.not_found', 'Este link não está mais disponível. Peça um link novo.'],
        ['signup_links.not_owner', 'Só o Dono da conta resgata a oferta.'],
        ['signup_links.email_already_used', 'Este e-mail já fez um teste grátis. O teste vale uma vez por e-mail.'],
        ['signup_links.email_unverified', 'O teste sem cartão pede um e-mail verificado pelo provedor de login. Entre com o Google.'],
        ['signup_links.too_many_from_ip', 'Muitas ofertas resgatadas por este endereço hoje. Tente de novo amanhã.']
    ])('translates %s', (type: string, message: string): void => {
        expect(offerErrorMessage(t, failure(type, 422))).toBe(message);
    });

    it.each([
        ['already_paid', 'Esta conta já assinou o Premium. A oferta é só para quem nunca assinou.'],
        ['trial_used', 'Esta conta já fez um teste do Premium. Cada conta faz um teste.'],
        ['already_redeemed', 'Esta conta já resgatou uma oferta. Cada conta resgata uma.'],
        ['platform_account', 'Esta conta não pode resgatar a oferta. Ela vale para conta nova ou conta Free que nunca foi Premium.']
    ])('explains the ineligible account by %s', (reason: string, message: string): void => {
        expect(offerErrorMessage(t, failure('signup_links.account_not_eligible', 409, { reason }))).toBe(message);
    });

    it('falls back to the login messages and to the generic one', () => {
        expect(offerErrorMessage(t, failure('core.too_many_attempts', 429))).toBe(
            'Muitas ofertas resgatadas por este endereço hoje. Tente de novo amanhã.'
        );
        expect(offerErrorMessage(t, failure('identity.invalid_google_token', 401))).toBe(authMessage());
        expect(offerErrorMessage(t, new Error('network'))).toBe(t('errorGeneric'));
        expect(offerReasonMessage(t, 'other.code')).toBe(t('errorGeneric'));
    });

    it('reads the failure code', () => {
        expect(offerFailureCode(failure('signup_links.not_found', 404))).toBe('signup_links.not_found');
        expect(offerFailureCode(new Error('x'))).toBe('unknown');
    });
});

function authMessage(): string {
    return t('errorInvalidGoogleToken');
}
